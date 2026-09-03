package backend.controller;

import backend.model.Pedido;
import backend.model.DetallePedido;
import backend.repository.DetallePedidoRepository;
import backend.repository.PedidoRepository;
import backend.repository.PrendaRepository;
import backend.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    private static final List<String> ESTADOS_PERMITIDOS = List.of("Pendiente", "Listo en tienda", "Cancelado");

    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final PrendaRepository prendaRepository;
    private final UsuarioRepository usuarioRepository;

    public PedidoController(PedidoRepository pedidoRepository, DetallePedidoRepository detallePedidoRepository, PrendaRepository prendaRepository, UsuarioRepository usuarioRepository) {
        this.pedidoRepository = pedidoRepository;
        this.detallePedidoRepository = detallePedidoRepository;
        this.prendaRepository = prendaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping
    public ResponseEntity<?> crearPedido(@RequestBody Map<String, Object> payload) {
        try {
            Pedido pedido = new Pedido();
            pedido.setTotalEstimado(Double.valueOf(payload.get("total_estimado").toString()));
            pedido.setFkIdUsuarioCliente(Integer.valueOf(payload.get("fk_id_usuario_cliente").toString()));
            pedido.setEstado("Pendiente");
            Pedido pedidoGuardado = pedidoRepository.save(pedido);

            Object detallesPayload = payload.get("detalles");
            if (detallesPayload instanceof List<?> detalles) {
                for (Object detallePayload : detalles) {
                    if (!(detallePayload instanceof Map<?, ?> detalle)) continue;
                    DetallePedido detallePedido = new DetallePedido();
                    detallePedido.setFkIdPedido(pedidoGuardado.getIdPedido());
                    detallePedido.setFkIdPrenda(String.valueOf(detalle.get("fk_id_prenda")));
                    detallePedido.setCantidad(Integer.valueOf(detalle.get("cantidad").toString()));
                    detallePedido.setPrecioUnitario(Double.valueOf(detalle.get("precio_unitario").toString()));
                    detallePedido.setSubtotal(Double.valueOf(detalle.get("subtotal").toString()));
                    detallePedidoRepository.save(detallePedido);
                }
            }
            return ResponseEntity.ok(pedidoGuardado);
        } catch (Exception error) {
            return ResponseEntity.badRequest().body("No se pudo registrar el pedido: " + error.getMessage());
        }
    }

    @GetMapping("/usuario/{idUsuario}")
    public List<Map<String, Object>> listarPorUsuario(@PathVariable Integer idUsuario) {
        return pedidoRepository.findByFkIdUsuarioClienteOrderByFechaPedidoDesc(idUsuario).stream().map(this::crearRespuestaPedido).toList();
    }

    @GetMapping
    public List<Map<String, Object>> listarPedidos() {
        return pedidoRepository.findAll().stream().map(this::crearRespuestaPedido).toList();
    }

    private Map<String, Object> crearRespuestaPedido(Pedido pedido) {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("idPedido", pedido.getIdPedido());
        respuesta.put("fechaPedido", pedido.getFechaPedido());
        respuesta.put("totalEstimado", pedido.getTotalEstimado());
        respuesta.put("estado", pedido.getEstado());
        respuesta.put("fkIdUsuarioCliente", pedido.getFkIdUsuarioCliente());
        respuesta.put("correoCliente", usuarioRepository.findById(pedido.getFkIdUsuarioCliente()).map(usuario -> usuario.getCorreo()).orElse("No registrado"));

        List<Map<String, Object>> detalles = detallePedidoRepository.findByFkIdPedido(pedido.getIdPedido()).stream().map(detalle -> {
            Map<String, Object> item = new HashMap<>();
            item.put("idDetalle", detalle.getIdDetalle());
            item.put("fkIdPrenda", detalle.getFkIdPrenda());
            item.put("nombrePrenda", prendaRepository.findById(detalle.getFkIdPrenda()).map(prenda -> prenda.getNombrePrend()).orElse("Prenda no encontrada"));
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
                    String estado = payload.get("estado");
                    if (estado == null || estado.isBlank()) return ResponseEntity.badRequest().body("El estado es obligatorio");
                    if (!ESTADOS_PERMITIDOS.contains(estado.trim())) {
                        return ResponseEntity.badRequest().body("Estado no válido");
                    }
                    pedido.setEstado(estado.trim());
                    return ResponseEntity.ok(pedidoRepository.save(pedido));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
