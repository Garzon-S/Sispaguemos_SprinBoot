package backend.controller;

import backend.dto.KardexDetalleDTO;
import backend.service.KardexService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kardex")
@CrossOrigin(origins = "*")
public class KardexController {

    @Autowired
    private KardexService kardexService;

    @GetMapping("/prenda/{idPrenda}")
    public ResponseEntity<List<KardexDetalleDTO>> obtenerKardexPrenda(@PathVariable Long idPrenda) {
        try {
            List<KardexDetalleDTO> reporte = kardexService.obtenerReporteKardexPorPrenda(idPrenda);
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}