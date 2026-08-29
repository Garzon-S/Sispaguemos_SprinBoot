package backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import backend.model.Prenda;
import backend.repository.PrendaRepository;

@RestController
@RequestMapping("/api/prendas")
public class PrendaController {

    @Autowired
    private PrendaRepository prendaRepository;

    @GetMapping
    public List<Prenda> listarPrendas() {
        return prendaRepository.findAll();
    }

    @PostMapping
    public Prenda guardarPrenda(@RequestBody Prenda prenda) {
        return prendaRepository.save(prenda);
    }

    @PutMapping("/{id}")
    public Prenda actualizarPrenda(@PathVariable String id, @RequestBody Prenda prendaDetalles) {
        Prenda prenda = prendaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prenda no encontrada con id: " + id));
        
        prenda.setNombrePrend(prendaDetalles.getNombrePrend());
        prenda.setDescripcionPrend(prendaDetalles.getDescripcionPrend());
        prenda.setGenero(prendaDetalles.getGenero());
        prenda.setPrecioVenta(prendaDetalles.getPrecioVenta());
        prenda.setCantidadDisponibleVenta(prendaDetalles.getCantidadDisponibleVenta());
        prenda.setEstado(prendaDetalles.getEstado());
        prenda.setFkIdtPrendas(prendaDetalles.getFkIdtPrendas());
        prenda.setFkIdColor(prendaDetalles.getFkIdColor());
        prenda.setImagenPrend(prendaDetalles.getImagenPrend());

        return prendaRepository.save(prenda);
    }

    @DeleteMapping("/{id}")
    public void eliminarPrenda(@PathVariable String id) {
        prendaRepository.deleteById(id);
    }
}