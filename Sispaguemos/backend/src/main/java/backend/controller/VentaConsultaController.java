package backend.controller;

import backend.model.VentaPedido;
import backend.repository.VentaRepositoryEmpleado;
import backend.repository.PedidoRepository;
import backend.repository.DetallePedidoRepository;
import backend.repository.PrendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/consultas/ventas")
@CrossOrigin(origins = "*")
public class VentaConsultaController {

    @Autowired
    private VentaRepositoryEmpleado ventaRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private DetallePedidoRepository detallePedidoRepository;

    @Autowired
    private PrendaRepository prendaRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarTodasLasVentasConDetalles() {
        List<VentaPedido> ventas = ventaRepository.findAll();

        List<Map<String, Object>> resultado = ventas.stream().map(v -> {
            Map<String, Object> item = new HashMap<>();
            item.put("idVenta", v.getIdVenta());
            item.put("fechaVenta", v.getFechaVenta());
            item.put("metodoPago", v.getMetodoPago());
            item.put("totalVenta", v.getTotalVenta());
            item.put("estadoPago", "Vendido");

            // Buscamos los detalles de los productos usando el fkIdPedido
            if (v.getFkIdPedido() != null) {
                pedidoRepository.findById(v.getFkIdPedido().longValue()).ifPresent(pedido -> {
                    List<Map<String, Object>> detalles = detallePedidoRepository.findByFkIdPedido(pedido.getIdPedido()).stream().map(det -> {
                        Map<String, Object> detalleMap = new HashMap<>();
                        detalleMap.put("cantidad", det.getCantidad());
                        detalleMap.put("talla", det.getTalla());
                        detalleMap.put("precioUnitario", det.getPrecioUnitario());
                        detalleMap.put("subtotal", det.getSubtotal());
                        
                        String nombrePrenda = prendaRepository.findById(Integer.valueOf(det.getFkIdPrenda()))
                            .map(p -> p.getNombrePrend())
                            .orElse("Prenda no encontrada");
                        detalleMap.put("nombrePrenda", nombrePrenda);
                        return detalleMap;
                    }).toList();

                    item.put("detalles", detalles);
                    item.put("cantidadPrendas", detalles.stream().mapToInt(d -> ((Number) d.get("cantidad")).intValue()).sum());
                });
            } else {
                item.put("detalles", List.of());
                item.put("cantidadPrendas", 1);
            }

            return item;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(resultado);
    }
}