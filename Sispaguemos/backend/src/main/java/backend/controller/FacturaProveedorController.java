package backend.controller;

import backend.model.FacturaProveedor;
import backend.repository.FacturaProveedorRepository;
import backend.service.FacturaProveedorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facturas-proveedor")
@CrossOrigin(origins = "*")
public class FacturaProveedorController {

    @Autowired
    private FacturaProveedorRepository facturaRepository;

    @Autowired
    private FacturaProveedorService facturaService;

    @GetMapping
    public List<FacturaProveedor> listarFacturas() {
        return facturaRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<FacturaProveedor> crearFactura(@RequestBody FacturaProveedor factura) {
        FacturaProveedor nueva = facturaService.registrarYRecibirFactura(factura);
        return ResponseEntity.ok(nueva);
    }

    @PutMapping("/{id}/recibir")
    public ResponseEntity<FacturaProveedor> recibirFactura(@PathVariable Long id) {
        FacturaProveedor actualizada = facturaService.marcarComoRecibida(id);
        return ResponseEntity.ok(actualizada);
    }
}