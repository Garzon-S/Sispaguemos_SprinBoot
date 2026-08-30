package backend.controller;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import backend.model.Bodega;
import backend.model.Prenda;
import backend.repository.BodegaRepository;
import backend.repository.PrendaRepository;

@RestController
@RequestMapping("/api/bodega")
@CrossOrigin(origins = "*")
public class BodegaController {

    @Autowired
    private BodegaRepository bodegaRepository;

    @Autowired
    private PrendaRepository prendaRepository;

    @GetMapping
    public List<Bodega> listarBodega() {
        return bodegaRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> guardarBodega(@Valid @RequestBody Bodega bodega) {
        try {
            bodega.setFechaActualizacion(LocalDateTime.now()); // Asignar fecha al crear
            Bodega nuevaBodega = bodegaRepository.save(bodega);

            Prenda prenda = prendaRepository.findById(bodega.getIdPrenda()).orElse(null);
            if (prenda != null) {
                prenda.setEstado(1);
                prendaRepository.save(prenda);
            }

            return ResponseEntity.ok(nuevaBodega);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al registrar en bodega: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarBodega(@PathVariable Long id, @Valid @RequestBody Bodega bodegaDetalles) {
        Bodega bodega = bodegaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro de bodega no encontrado con id: " + id));
        
        bodega.setStockActual(bodegaDetalles.getStockActual());
        bodega.setStockMinimo(bodegaDetalles.getStockMinimo());
        bodega.setStockMaximo(bodegaDetalles.getStockMaximo());
        bodega.setPrecioUnitario(bodegaDetalles.getPrecioUnitario());
        bodega.setFechaActualizacion(LocalDateTime.now()); // <--- Actualiza la fecha al modificar

        Bodega actualizada = bodegaRepository.save(bodega);
        return ResponseEntity.ok(actualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarBodega(@PathVariable Long id) {
        if (!bodegaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        bodegaRepository.deleteById(id);
        return ResponseEntity.ok().body("Registro de bodega eliminado con éxito");
    }
}