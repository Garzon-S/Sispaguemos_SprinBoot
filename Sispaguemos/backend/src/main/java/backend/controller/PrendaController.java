package backend.controller;

import backend.model.Prenda;
import backend.repository.PrendaRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/prendas")
@CrossOrigin(origins = "*")
public class PrendaController {

    @Autowired
    private PrendaRepository prendaRepository;

    @GetMapping
    public List<Prenda> listarPrendas() {
        return prendaRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> guardarPrenda(@Valid @RequestBody Prenda prenda) {
        if (prenda.getEstado() == null) {
            prenda.setEstado(0); // Nace inactiva
        }
        if (prenda.getFechaRegistro() == null) {
            prenda.setFechaRegistro(LocalDateTime.now());
        }
        Prenda nuevaPrenda = prendaRepository.save(prenda);
        return ResponseEntity.ok(nuevaPrenda);
    }

    // ====================================================================
    // ESTOS SON LOS ENDPOINTS QUE FALTABAN PARA EVITAR EL ERROR 404
    // ====================================================================

    @PutMapping("/{id}/inactivar")
    public ResponseEntity<?> inactivarPrenda(@PathVariable String id) {
        Prenda prenda = prendaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Prenda no encontrada con ID: " + id));
        
        prenda.setEstado(0); // 0 = Inactivo
        prendaRepository.save(prenda);
        return ResponseEntity.ok("Prenda inactivada con éxito");
    }

    @PutMapping("/{id}/activar")
    public ResponseEntity<?> activarPrenda(@PathVariable String id) {
        Prenda prenda = prendaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Prenda no encontrada con ID: " + id));
        
        prenda.setEstado(1); // 1 = Activo
        prendaRepository.save(prenda);
        return ResponseEntity.ok("Prenda activada con éxito");
    }
}