package backend.controller;

import backend.model.Pedido;
import backend.model.DetallePedido;
import backend.repository.DetallePedidoRepository;
import backend.repository.PedidoRepository;
import backend.repository.PrendaRepository;
import backend.repository.UsuarioRepository;
import backend.repository.HombreRepository;
import backend.repository.MujerRepository;
import backend.repository.InfantilRepository;
import backend.model.Prenda;
import backend.model.Hombre;
import backend.model.Mujer;
import backend.model.Infantil;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    private static final List<String> ESTADOS_PERMITIDOS = List.of("Pendiente", "Listo para recoger en tienda", "Cancelado");

    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final PrendaRepository prendaRepository;
    private final UsuarioRepository usuarioRepository;
    private final HombreRepository hombreRepository;
    private final MujerRepository mujerRepository;
    private final InfantilRepository infantilRepository;

    public PedidoController(PedidoRepository pedidoRepository, DetallePedidoRepository detallePedidoRepository, PrendaRepository prendaRepository, UsuarioRepository usuarioRepository, HombreRepository hombreRepository, MujerRepository mujerRepository, InfantilRepository infantilRepository) {
        this.pedidoRepository = pedidoRepository;
        this.detallePedidoRepository = detallePedidoRepository;
        this.prendaRepository = prendaRepository;
        this.usuarioRepository = usuarioRepository;
        this.hombreRepository = hombreRepository;
        this.mujerRepository = mujerRepository;
        this.infantilRepository = infantilRepository;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> crearPedido(@RequestBody Map<String, Object> payload) {
        try {
            Integer idUsuario = Integer.valueOf(payload.get("fk_id_usuario").toString());
            if (!usuarioRepository.existsById(idUsuario)) {
                return ResponseEntity.badRequest().body("El usuario no existe");
            }
            Object detallesPayload = payload.get("detalles");
            if (!(detallesPayload instanceof List<?> detalles) || detalles.isEmpty()) {
                return ResponseEntity.badRequest().body("El pedido debe contener al menos una prenda");
            }

            Pedido pedido = new Pedido();
            pedido.setTotalPedido(Double.valueOf(payload.get("total_pedido").toString()));
            pedido.setFkIdUsuario(idUsuario);
            pedido.setEstadoPedido("Pendiente");
            Pedido pedidoGuardado = pedidoRepository.save(pedido);

            for (Object detallePayload : detalles) {
                if (!(detallePayload instanceof Map<?, ?> detalle)) {
                    throw new IllegalArgumentException("Detalle de pedido inválido");
                }

                Integer idPrenda = Integer.valueOf(String.valueOf(detalle.get("fk_id_prenda")));
                int cantidad = Integer.parseInt(String.valueOf(detalle.get("cantidad")));
                if (cantidad <= 0) throw new IllegalArgumentException("La cantidad debe ser mayor que cero");

                Prenda prenda = prendaRepository.findById(idPrenda)
                        .orElseThrow(() -> new IllegalArgumentException("La prenda no existe: " + idPrenda));
                int stockGeneral = prenda.getCantidadDisponibleVenta() == null ? 0 : prenda.getCantidadDisponibleVenta();
                if (stockGeneral < cantidad) {
                    throw new IllegalArgumentException("Stock insuficiente para la prenda " + prenda.getNombrePrend());
                }

                String tipoTalla = detalle.get("tipo_talla") == null ? inferirTipoTalla(prenda.getGenero()) : String.valueOf(detalle.get("tipo_talla"));
                Integer idTalla = detalle.get("id_talla") == null ? null : Integer.valueOf(String.valueOf(detalle.get("id_talla")));
                descontarStockTalla(tipoTalla, idTalla, idPrenda, detalle.get("talla"), cantidad);
                prenda.setCantidadDisponibleVenta(stockGeneral - cantidad);
                prendaRepository.save(prenda);

                DetallePedido detallePedido = new DetallePedido();
                detallePedido.setFkIdPedido(pedidoGuardado.getIdPedido());
                detallePedido.setFkIdPrenda(String.valueOf(idPrenda));
                detallePedido.setTalla(detalle.get("talla") == null ? null : String.valueOf(detalle.get("talla")));
                detallePedido.setCantidad(cantidad);
                detallePedido.setPrecioUnitario(Double.valueOf(String.valueOf(detalle.get("precio_unitario"))));
                detallePedidoRepository.save(detallePedido);
            }
            return ResponseEntity.ok(pedidoGuardado);
        } catch (Exception error) {
            if (TransactionAspectSupport.currentTransactionStatus().isNewTransaction()) {
                TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            }
            return ResponseEntity.badRequest().body("No se pudo registrar el pedido: " + error.getMessage());
        }
    }

    private String inferirTipoTalla(String genero) {
        String normalizado = String.valueOf(genero).trim().toLowerCase();
        if (normalizado.equals("hombre")) return "hombre";
        if (normalizado.equals("mujer")) return "mujer";
        if (normalizado.equals("niño") || normalizado.equals("niña") || normalizado.equals("infantil")) return "infantil";
        throw new IllegalArgumentException("Debe seleccionar el origen de la talla para una prenda unisex");
    }

    private void descontarStockTalla(String tipoTalla, Integer idTalla, Integer idPrenda, Object tallaSolicitada, int cantidad) {
        if (idTalla == null) throw new IllegalArgumentException("La talla seleccionada no es válida");
        switch (tipoTalla.toLowerCase()) {
            case "hombre" -> hombreRepository.findById(idTalla).filter(t -> idPrenda.equals(t.getFkIdPrenda())).ifPresentOrElse(t -> actualizarTalla(t, tallaSolicitada, cantidad), () -> { throw new IllegalArgumentException("La talla no pertenece a la prenda"); });
            case "mujer" -> mujerRepository.findById(idTalla).filter(t -> idPrenda.equals(t.getFkIdPrenda())).ifPresentOrElse(t -> actualizarTalla(t, tallaSolicitada, cantidad), () -> { throw new IllegalArgumentException("La talla no pertenece a la prenda"); });
            case "infantil" -> infantilRepository.findById(idTalla).filter(t -> idPrenda.equals(t.getFkIdPrenda())).ifPresentOrElse(t -> actualizarTalla(t, tallaSolicitada, cantidad), () -> { throw new IllegalArgumentException("La talla no pertenece a la prenda"); });
            default -> throw new IllegalArgumentException("Tipo de talla no válido");
        }
    }

    private void actualizarTalla(Object tallaEntity, Object tallaSolicitada, int cantidad) {
        int stock;
        String nombreTalla;
        if (tallaEntity instanceof Hombre talla) { stock = talla.getCantidadTalla(); nombreTalla = talla.getTalla(); }
        else if (tallaEntity instanceof Mujer talla) { stock = talla.getCantidadTalla(); nombreTalla = talla.getTalla(); }
        else { Infantil talla = (Infantil) tallaEntity; stock = talla.getCantidadTalla(); nombreTalla = talla.getTalla(); }
        if (tallaSolicitada != null && !nombreTalla.equals(String.valueOf(tallaSolicitada))) throw new IllegalArgumentException("La talla seleccionada no coincide");
        if (stock < cantidad) throw new IllegalArgumentException("Stock insuficiente para la talla " + nombreTalla);
        if (tallaEntity instanceof Hombre talla) { talla.setCantidadTalla(stock - cantidad); hombreRepository.save(talla); }
        else if (tallaEntity instanceof Mujer talla) { talla.setCantidadTalla(stock - cantidad); mujerRepository.save(talla); }
        else { Infantil talla = (Infantil) tallaEntity; talla.setCantidadTalla(stock - cantidad); infantilRepository.save(talla); }
    }

    @GetMapping("/usuario/{idUsuario}")
    public List<Map<String, Object>> listarPorUsuario(@PathVariable Integer idUsuario) {
        return pedidoRepository.findByFkIdUsuarioOrderByFechaPedidoDesc(idUsuario).stream().map(this::crearRespuestaPedido).toList();
    }

    @GetMapping
    public List<Map<String, Object>> listarPedidos() {
        return pedidoRepository.findAll().stream().map(this::crearRespuestaPedido).toList();
    }

    private Map<String, Object> crearRespuestaPedido(Pedido pedido) {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("idPedido", pedido.getIdPedido());
        respuesta.put("fechaPedido", pedido.getFechaPedido());
        respuesta.put("totalEstimado", pedido.getTotalPedido());
        respuesta.put("estado", pedido.getEstadoPedido());
        respuesta.put("fkIdUsuarioCliente", pedido.getFkIdUsuario());
        respuesta.put("correoCliente", usuarioRepository.findById(pedido.getFkIdUsuario()).map(usuario -> usuario.getCorreo()).orElse("No registrado"));

List<Map<String, Object>> detalles = detallePedidoRepository.findByFkIdPedido(pedido.getIdPedido()).stream().map(detalle -> {
            Map<String, Object> item = new HashMap<>();
            item.put("idDetalle", detalle.getIdDetalle());
            item.put("fkIdPrenda", detalle.getFkIdPrenda());
            item.put("talla", detalle.getTalla());
            
            // Convertimos detalle.getFkIdPrenda() a Integer con Integer.valueOf(...)
            item.put("nombrePrenda", prendaRepository.findById(Integer.valueOf(detalle.getFkIdPrenda())).map(prenda -> prenda.getNombrePrend()).orElse("Prenda no encontrada"));
            
            item.put("cantidad", detalle.getCantidad());
            item.put("precioUnitario", detalle.getPrecioUnitario());
            item.put("subtotal", detalle.getSubtotal());
            return item;
        }).toList();
        respuesta.put("detalles", detalles);
        respuesta.put("cantidadPrendas", detalles.stream().mapToInt(item -> ((Number) item.get("cantidad")).intValue()).sum());
        return respuesta;
    }

    @PutMapping("/{idPedido}/estado")
    public ResponseEntity<?> actualizarEstado(@PathVariable Long idPedido, @RequestBody Map<String, String> payload) {
        return pedidoRepository.findById(idPedido)
                .map(pedido -> {
                    String estadoPedido = payload.get("estado_pedido");
                    if (estadoPedido == null || estadoPedido.isBlank()) return ResponseEntity.badRequest().body("El estado es obligatorio");
                    if (!ESTADOS_PERMITIDOS.contains(estadoPedido.trim())) {
                        return ResponseEntity.badRequest().body("Estado no válido");
                    }
                    pedido.setEstadoPedido(estadoPedido.trim());
                    Pedido pedidoActualizado = pedidoRepository.save(pedido);
                    return ResponseEntity.ok(crearRespuestaPedido(pedidoActualizado));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
