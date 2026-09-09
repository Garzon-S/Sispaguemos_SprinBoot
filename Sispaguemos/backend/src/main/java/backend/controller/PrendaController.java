package backend.controller;

import backend.dto.CrearPrendaRequest;
import backend.model.Bodega;
import backend.model.Hombre;
import backend.model.Mujer;
import backend.model.Infantil;
import backend.model.Prenda;
import backend.repository.BodegaRepository;
import backend.repository.HombreRepository;
import backend.repository.MujerRepository;
import backend.repository.InfantilRepository;
import backend.repository.PrendaRepository;
import backend.service.KardexService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/prendas")
@CrossOrigin(origins = "*")
public class PrendaController {

    @Autowired
    private PrendaRepository prendaRepository;

    @Autowired
    private BodegaRepository bodegaRepository;

    @Autowired
    private HombreRepository hombreRepository;

    @Autowired
    private MujerRepository mujerRepository;

    @Autowired
    private InfantilRepository infantilRepository;

    @Autowired
    private KardexService kardexService;

    @GetMapping
    public List<Prenda> listarPrendas() {
        return prendaRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prenda> obtenerPrendaPorId(@PathVariable Integer id) {
        return prendaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Prenda> actualizarPrenda(@PathVariable Integer id, @RequestBody CrearPrendaRequest request) {
        Prenda prenda = prendaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prenda no encontrada con id: " + id));
        
        prenda.setNombrePrend(request.getNombrePrend());
        prenda.setDescripcionPrend(request.getDescripcionPrend());
        prenda.setGenero(request.getGenero());
        prenda.setColor(request.getColor());
        prenda.setPrecioVenta(request.getPrecioVenta());
        prenda.setCantidadDisponibleVenta(request.getCantidadDisponibleVenta());
        prenda.setEstado(request.getEstado());
        
        if (request.getImagenPrend() != null && !request.getImagenPrend().isEmpty()) {
            prenda.setImagenPrend(request.getImagenPrend());
        }

        Prenda prendaActualizada = prendaRepository.save(prenda);

        // Guardar tallas con validación estricta de cantidad
        if ("Hombre".equalsIgnoreCase(prenda.getGenero())) {
            hombreRepository.deleteAll(hombreRepository.findByFkIdPrenda(prenda.getIdPrenda()));
            if (request.getTallasHombre() != null) {
                for (Hombre talla : request.getTallasHombre()) {
                    talla.setFkIdPrenda(prenda.getIdPrenda());
                    if (talla.getCantidadTalla() == null) talla.setCantidadTalla(0);
                    hombreRepository.save(talla);
                }
            }
        } else if ("Mujer".equalsIgnoreCase(prenda.getGenero())) {
            mujerRepository.deleteAll(mujerRepository.findByFkIdPrenda(prenda.getIdPrenda()));
            if (request.getTallasMujer() != null) {
                for (Mujer talla : request.getTallasMujer()) {
                    talla.setFkIdPrenda(prenda.getIdPrenda());
                    if (talla.getCantidadTalla() == null) talla.setCantidadTalla(0);
                    mujerRepository.save(talla);
                }
            }
        } else if ("Infantil".equalsIgnoreCase(prenda.getGenero())) {
            infantilRepository.deleteAll(infantilRepository.findByFkIdPrenda(prenda.getIdPrenda()));
            if (request.getTallasInfantil() != null) {
                for (Infantil talla : request.getTallasInfantil()) {
                    talla.setFkIdPrenda(prenda.getIdPrenda());
                    if (talla.getCantidadTalla() == null) talla.setCantidadTalla(0);
                    infantilRepository.save(talla);
                }
            }
        }

        return ResponseEntity.ok(prendaActualizada);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Prenda> crearPrenda(@RequestBody CrearPrendaRequest request) {
        Prenda prenda = new Prenda();
        prenda.setCodigoBarras(request.getCodigoBarras());
        prenda.setNombrePrend(request.getNombrePrend());
        prenda.setDescripcionPrend(request.getDescripcionPrend());
        prenda.setGenero(request.getGenero());
        prenda.setColor(request.getColor());
        prenda.setPrecioVenta(request.getPrecioVenta() != null ? request.getPrecioVenta() : 0.0);
        prenda.setCantidadDisponibleVenta(request.getCantidadDisponibleVenta() != null ? request.getCantidadDisponibleVenta() : 0);
        prenda.setEstado(request.getEstado() != null ? request.getEstado() : "Disponible");
        prenda.setImagenPrend(request.getImagenPrend());

        Prenda prendaGuardada = prendaRepository.save(prenda);

        Bodega bodega = new Bodega();
        bodega.setIdPrenda(prendaGuardada.getIdPrenda());
        bodega.setStockActual(request.getStockActual() != null ? request.getStockActual() : 5);
        bodega.setStockMinimo(request.getStockMinimo() != null ? request.getStockMinimo() : 5);
        bodega.setStockMaximo(request.getStockMaximo() != null ? request.getStockMaximo() : 85);
        bodega.setCostoPromedio(request.getCostoPromedio());
        bodegaRepository.save(bodega);

        if ("Hombre".equalsIgnoreCase(request.getGenero()) && request.getTallasHombre() != null) {
            for (Hombre talla : request.getTallasHombre()) {
                talla.setFkIdPrenda(prendaGuardada.getIdPrenda());
                if (talla.getCantidadTalla() == null) talla.setCantidadTalla(0);
                hombreRepository.save(talla);
            }
        } else if ("Mujer".equalsIgnoreCase(request.getGenero()) && request.getTallasMujer() != null) {
            for (Mujer talla : request.getTallasMujer()) {
                talla.setFkIdPrenda(prendaGuardada.getIdPrenda());
                if (talla.getCantidadTalla() == null) talla.setCantidadTalla(0);
                mujerRepository.save(talla);
            }
        } else if ("Infantil".equalsIgnoreCase(request.getGenero()) && request.getTallasInfantil() != null) {
            for (Infantil talla : request.getTallasInfantil()) {
                talla.setFkIdPrenda(prendaGuardada.getIdPrenda());
                if (talla.getCantidadTalla() == null) talla.setCantidadTalla(0);
                infantilRepository.save(talla);
            }
        }

        return ResponseEntity.ok(prendaGuardada);
    }

    // Endpoints corregidos con la ruta base /api/prendas/...
    @GetMapping("/hombre/prenda/{idPrenda}")
    public ResponseEntity<List<Hombre>> obtenerTallasHombrePorPrenda(@PathVariable Integer idPrenda) {
        return ResponseEntity.ok(hombreRepository.findByFkIdPrenda(idPrenda));
    }

    @GetMapping("/mujer/prenda/{idPrenda}")
    public ResponseEntity<List<Mujer>> obtenerTallasMujerPorPrenda(@PathVariable Integer idPrenda) {
        return ResponseEntity.ok(mujerRepository.findByFkIdPrenda(idPrenda));
    }

    @GetMapping("/infantil/prenda/{idPrenda}")
    public ResponseEntity<List<Infantil>> obtenerTallasInfantilPorPrenda(@PathVariable Integer idPrenda) {
        return ResponseEntity.ok(infantilRepository.findByFkIdPrenda(idPrenda));
    }

    @GetMapping("/{id}/imagen")
    public ResponseEntity<byte[]> obtenerImagenPrenda(@PathVariable Integer id) {
        Optional<Prenda> prendaOpt = prendaRepository.findById(id);
        if (prendaOpt.isEmpty()) return ResponseEntity.notFound().build();

        Prenda prenda = prendaOpt.get();
        String base64Image = prenda.getImagenPrend();
        if (base64Image != null && base64Image.contains(",")) {
            base64Image = base64Image.split(",")[1];
        }

        byte[] imagenBytes = Base64.getDecoder().decode(base64Image);
        return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(imagenBytes);
    }
}