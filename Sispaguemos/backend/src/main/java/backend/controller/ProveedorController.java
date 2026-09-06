package backend.controller;

import backend.model.Proveedor;
import backend.repository.ProveedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@CrossOrigin(origins = "*")
public class ProveedorController {

    @Autowired
    private ProveedorRepository proveedorRepository;

    @GetMapping
    public List<Proveedor> listarProveedores() {
        return proveedorRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Proveedor> crearProveedor(@RequestBody Proveedor proveedor) {
        Proveedor nuevo = proveedorRepository.save(proveedor);
        return ResponseEntity.ok(nuevo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProveedor(@PathVariable Long id) {
        proveedorRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}