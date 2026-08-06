package backend.controller;

import backend.model.Prenda;
import backend.repository.PrendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prendas")
public class PrendaController {

    @Autowired
    private PrendaRepository prendaRepository;

    // READ: Obtener todas las prendas
    @GetMapping
    public List<Prenda> listarPrendas() {
        return prendaRepository.findAll();
    }

    // CREATE: Guardar una nueva prenda
    @PostMapping
    public Prenda guardarPrenda(@RequestBody Prenda prenda) {
        return prendaRepository.save(prenda);
    }

    // UPDATE: Actualizar una prenda existente
   @PutMapping("/{id}")
    public Prenda actualizarPrenda(@PathVariable Long id, @RequestBody Prenda prendaDetalles) {
        Prenda prenda = prendaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prenda no encontrada con id: " + id));
        
        prenda.setNombrePrend(prendaDetalles.getNombrePrend());
        prenda.setDescripcionPrend(prendaDetalles.getDescripcionPrend());
        prenda.setPrecio(prendaDetalles.getPrecio());
        prenda.setEstado(prendaDetalles.getEstado());
        prenda.setStock(prendaDetalles.getStock());
        prenda.setMinStock(prendaDetalles.getMinStock());
        prenda.setMaxStock(prendaDetalles.getMaxStock());
        prenda.setFkIdGenero(prendaDetalles.getFkIdGenero());
        prenda.setFkIdtPrendas(prendaDetalles.getFkIdtPrendas());
        prenda.setFkIdColor(prendaDetalles.getFkIdColor());

        return prendaRepository.save(prenda);
    }

    // DELETE: Eliminar una prenda por ID
    @DeleteMapping("/{id}")
    public void eliminarPrenda(@PathVariable Long id) {
        prendaRepository.deleteById(id);
    }
}