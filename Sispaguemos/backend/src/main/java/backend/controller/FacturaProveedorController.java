package backend.controller;

import backend.model.FacturaProveedor;
import backend.model.DetalleFacturaProveedor;
import backend.repository.PrendaRepository;
import backend.repository.FacturaProveedorRepository;
import backend.repository.ProveedorRepository;
import backend.repository.UsuarioRepository;
import backend.service.FacturaProveedorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/facturas-proveedor")
@CrossOrigin(origins = "*")
public class FacturaProveedorController {

    @Autowired
    private FacturaProveedorRepository facturaRepository;

    @Autowired
    private FacturaProveedorService facturaService;

    @Autowired
    private ProveedorRepository proveedorRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PrendaRepository prendaRepository;

    @GetMapping
    public List<FacturaProveedor> listarFacturas() {
        return facturaRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> crearFactura(@RequestBody FacturaProveedor factura) {
        try {
            if (factura.getProveedor() == null || factura.getProveedor().getIdProveedor() == null) {
                return ResponseEntity.badRequest().build();
            }
            if (factura.getUsuario() == null || factura.getUsuario().getId() == null) {
                return ResponseEntity.badRequest().build();
            }

            factura.setProveedor(proveedorRepository.findById(factura.getProveedor().getIdProveedor())
                    .orElseThrow(() -> new IllegalArgumentException("El proveedor no existe.")));
            factura.setUsuario(usuarioRepository.findById(factura.getUsuario().getId())
                    .orElseThrow(() -> new IllegalArgumentException("El usuario no existe.")));

            if (factura.getDetalles() == null || factura.getDetalles().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            for (DetalleFacturaProveedor detalle : factura.getDetalles()) {
                if (detalle.getPrenda() == null || detalle.getPrenda().getIdPrenda() == null) {
                    return ResponseEntity.badRequest().build();
                }
                if (detalle.getCantidadPedida() == null || detalle.getCantidadPedida() < 1
                        || detalle.getCantidadRecibida() == null || detalle.getCantidadRecibida() < 0
                        || detalle.getCantidadRecibida() > detalle.getCantidadPedida()
                        || detalle.getPrecioCompra() == null || detalle.getPrecioCompra().signum() < 0) {
                    return ResponseEntity.badRequest().build();
                }
                detalle.setPrenda(prendaRepository.findById(detalle.getPrenda().getIdPrenda())
                        .orElseThrow(() -> new IllegalArgumentException("La prenda no existe.")));
                detalle.setEstado(detalle.getCantidadRecibida().equals(detalle.getCantidadPedida())
                        ? DetalleFacturaProveedor.EstadoDetalle.Recibida
                        : DetalleFacturaProveedor.EstadoDetalle.Incompleta);
            }

            if (FacturaProveedor.EstadoFactura.Recibida.equals(factura.getEstado())
                    && factura.getDetalles().stream().allMatch(detalle -> detalle.getCantidadRecibida() == 0)) {
                return ResponseEntity.badRequest().build();
            }

            FacturaProveedor nueva = facturaService.registrarYRecibirFactura(factura);
                return ResponseEntity.ok(Map.of(
                    "idFacturaProveedor", nueva.getIdFacturaProveedor(),
                    "numeroFactura", nueva.getNumeroFactura(),
                    "estado", nueva.getEstado(),
                    "subtotal", nueva.getSubtotal(),
                    "impuesto", nueva.getImpuesto(),
                    "total", nueva.getTotal()
                ));
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", error.getMessage()));
        } catch (Exception error) {
            error.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("mensaje", error.getMessage() != null
                    ? error.getMessage() : "Error interno al registrar la factura."));
        }
    }

    @PutMapping("/{id}/recibir")
    public ResponseEntity<FacturaProveedor> recibirFactura(@PathVariable Long id) {
        FacturaProveedor actualizada = facturaService.marcarComoRecibida(id);
        return ResponseEntity.ok(actualizada);
    }
}