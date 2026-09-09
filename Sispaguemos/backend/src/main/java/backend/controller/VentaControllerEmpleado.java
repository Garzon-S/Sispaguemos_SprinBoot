package backend.controller;

import backend.model.Bodega;
import backend.model.DetallePedido;
import backend.model.MovimientoInventario;
import backend.model.Pedido;
import backend.model.Prenda;
import backend.model.VentaPedido;
import backend.repository.BodegaRepository;
import backend.repository.DetallePedidoRepository;
import backend.repository.MovimientoInventarioRepository;
import backend.repository.PedidoRepository;
import backend.repository.PrendaRepository;
import backend.repository.VentaRepositoryEmpleado;
import backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
public class VentaControllerEmpleado {

    @Autowired
    private VentaRepositoryEmpleado ventaRepositoryEmpleado;

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private PrendaRepository prendaRepository;

    @Autowired
    private DetallePedidoRepository detallePedidoRepository;

    @Autowired
    private MovimientoInventarioRepository movimientoInventarioRepository;

    @Autowired
    private BodegaRepository bodegaRepository;

    @Autowired
    private EmailService emailService;

    @GetMapping("/prenda/{codigoBarras}")
    public ResponseEntity<?> buscarPrendaPorCodigoBarras(@PathVariable String codigoBarras) {
        try {
            Optional<Prenda> prendaOpt = prendaRepository.findByCodigoBarras(codigoBarras);
            
            if (prendaOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "No se encontró ninguna prenda con el código de barras: " + codigoBarras));
            }
            
            return ResponseEntity.ok(prendaOpt.get());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al buscar la prenda: " + e.getMessage());
        }
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> registrarVenta(@RequestBody Map<String, Object> payload) {
        try {
            Double totalVenta = Double.valueOf(payload.get("total_venta").toString());
            String metodoPago = (String) payload.get("metodo_pago");
            
            Integer idUsuario = payload.get("fk_id_usuario") != null 
                ? Integer.valueOf(payload.get("fk_id_usuario").toString()) 
                : 1;

            System.out.println("Registrando venta Total: " + totalVenta);

            // 1. Crear y guardar el Pedido primero para obtener su ID
            Pedido pedido = new Pedido();
            pedido.setTotalPedido(totalVenta);
            pedido.setFkIdUsuario(idUsuario);
            pedido.setEstadoPedido("Completado (POS)");
            Pedido pedidoGuardado = pedidoRepository.save(pedido);

            // 2. Descontar stock, registrar detalles y alimentar el Kardex
            if (payload.containsKey("detalles")) {
                List<Map<String, Object>> detalles = (List<Map<String, Object>>) payload.get("detalles");
                for (Map<String, Object> detalleMap : detalles) {
                    Object rawId = detalleMap.get("id_prenda");
                    Integer idPrendaInt = rawId instanceof Number ? ((Number) rawId).intValue() : Integer.valueOf(rawId.toString());
                    
                    int cantidadVendida = Integer.parseInt(detalleMap.get("cantidad").toString());
                    Double precioUnitario = Double.valueOf(detalleMap.get("precio_unitario").toString());

                    Prenda prenda = prendaRepository.findById(idPrendaInt)
                            .orElseThrow(() -> new RuntimeException("Prenda no encontrada con ID: " + idPrendaInt));

                    int stockActual = prenda.getCantidadDisponibleVenta() != null 
                            ? prenda.getCantidadDisponibleVenta() 
                            : 0;

                    if (stockActual < cantidadVendida) {
                        return ResponseEntity.badRequest().body("Stock insuficiente para la prenda: " + prenda.getNombrePrend());
                    }

                    // Descontar stock de la prenda
                    prenda.setCantidadDisponibleVenta(stockActual - cantidadVendida);
                    prendaRepository.save(prenda);

                    // Guardar registro en la tabla de detalles del pedido
                    DetallePedido detallePedido = new DetallePedido();
                    detallePedido.setFkIdPedido(pedidoGuardado.getIdPedido());
                    detallePedido.setFkIdPrenda(String.valueOf(idPrendaInt));
                    detallePedido.setCantidad(cantidadVendida);
                    detallePedido.setPrecioUnitario(precioUnitario);
                    
                    try {
                        detallePedido.setSubtotal(cantidadVendida * precioUnitario);
                    } catch (Exception ignored) {}

                    detallePedidoRepository.save(detallePedido);

                    // 3. REGISTRAR EL MOVIMIENTO DE SALIDA EN EL KARDEX
                    try {
                        MovimientoInventario movimiento = new MovimientoInventario();
                        movimiento.setFechaMovimiento(LocalDateTime.now());
                        
                        // Asignación directa del tipo de movimiento (Salida) de forma compatible
                        try {
                            movimiento.setTipoMovimiento(MovimientoInventario.TipoMovimiento.SALIDA);
                        } catch (Exception e1) {
                            try {
                                movimiento.setTipoMovimiento(MovimientoInventario.TipoMovimiento.valueOf("Salida"));
                            } catch (Exception e2) {
                                movimiento.getClass().getMethod("setTipoMovimiento", String.class).invoke(movimiento, "Salida");
                            }
                        }

                        movimiento.setCantidad(cantidadVendida);
                        movimiento.setObservacion("Venta POS - Pedido #" + pedidoGuardado.getIdPedido());
                        
                        try {
                            movimiento.getClass().getMethod("setFkIdUsuario", Integer.class).invoke(movimiento, idUsuario);
                        } catch (Exception e1) {
                            try { movimiento.getClass().getMethod("setFkIdUsuario", Long.class).invoke(movimiento, idUsuario.longValue()); } catch (Exception ignored) {}
                        }

                        // Buscamos el ID de bodega asociado a esta prenda
                        List<Bodega> listaBodegas = bodegaRepository.findAll();
                        Long idBodegaEncontrada = null;
                        for (Bodega b : listaBodegas) {
                            try {
                                Object pObj = b.getClass().getMethod("getPrenda").invoke(b);
                                if (pObj != null) {
                                    Object pId = pObj.getClass().getMethod("getIdPrenda").invoke(pObj);
                                    if (pId != null && Long.parseLong(String.valueOf(pId)) == idPrendaInt.longValue()) {
                                        Object bId = b.getClass().getMethod("getIdStock").invoke(b);
                                        if (bId == null) bId = b.getClass().getMethod("getIdBodega").invoke(b);
                                        if (bId != null) {
                                            idBodegaEncontrada = Long.parseLong(String.valueOf(bId));
                                            break;
                                        }
                                    }
                                }
                            } catch (Exception ignored) {}
                        }

                        if (idBodegaEncontrada != null) {
                            movimiento.setFkIdStock(idBodegaEncontrada);
                        } else {
                            movimiento.setFkIdStock(idPrendaInt.longValue());
                        }

                        movimientoInventarioRepository.save(movimiento);
                    } catch (Exception exKardex) {
                        System.err.println("⚠️ Error al registrar movimiento en Kardex: " + exKardex.getMessage());
                        exKardex.printStackTrace();
                    }
                }
            }

            // 4. Crear y guardar la Venta asociada al ID del pedido recién creado
            VentaPedido venta = new VentaPedido();
            venta.setFechaVenta(LocalDateTime.now());
            venta.setTotalVenta(totalVenta);
            venta.setMetodoPago(metodoPago);
            venta.setFkIdPedido(pedidoGuardado.getIdPedido().intValue()); 

            VentaPedido nuevaVenta = ventaRepositoryEmpleado.save(venta);
            return ResponseEntity.ok(nuevaVenta);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al registrar la venta: " + e.getMessage());
        }
    }

    @PostMapping("/enviar-factura")
    public ResponseEntity<?> enviarFacturaCorreo(@RequestBody Map<String, Object> payload) {
        try {
            emailService.enviarFacturaElectronica(payload);
            return ResponseEntity.ok(Map.of("mensaje", "Correo enviado con éxito"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al enviar el correo electrónico: " + e.getMessage());
        }
    }
}