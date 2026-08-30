package backend.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import backend.model.Bodega;
import backend.model.MovimientoInventario;
import backend.repository.BodegaRepository;
import backend.repository.MovimientoInventarioRepository;

@RestController
@RequestMapping("/api/movimientos")
@CrossOrigin(origins = "*")
public class MovimientoInventarioController {

    @Autowired
    private MovimientoInventarioRepository movimientoRepository;

    @Autowired
    private BodegaRepository bodegaRepository;

    @GetMapping
    public List<MovimientoInventario> listarMovimientos() {
        return movimientoRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> registrarMovimiento(@Valid @RequestBody MovimientoInventario movimiento) {
        // 1. Buscar el registro de bodega asociado
        Bodega bodega = bodegaRepository.findById(movimiento.getFkIdStock())
                .orElseThrow(() -> new RuntimeException("Registro de bodega no encontrado con ID: " + movimiento.getFkIdStock()));

        int stockActual = bodega.getStockActual();
        int cantidadMov = movimiento.getCantidad();

        // 2. Extraer el tipo de movimiento de forma segura
        if (movimiento.getTipoMovimiento() == null) {
            // Si entra aquí, significa que React y Java no están mapeando bien el nombre de la variable
            return ResponseEntity.badRequest().body("Error: El tipo de movimiento llegó nulo. Verifica que el modelo en Java tenga @JsonProperty(\"tipo_movimiento\").");
        }

        String tipo = movimiento.getTipoMovimiento().name(); // Convertimos el Enum a String

        // 3. Aplicar la lógica de negocio ignorando mayúsculas/minúsculas
        if (tipo.equalsIgnoreCase("ENTRADA")) {
            stockActual += cantidadMov;
            if (stockActual > bodega.getStockMaximo()) {
                return ResponseEntity.badRequest().body("Error: La cantidad de entrada supera el stock máximo permitido (" + bodega.getStockMaximo() + ").");
            }
        } else if (tipo.equalsIgnoreCase("SALIDA")) {
            stockActual -= cantidadMov;
            if (stockActual < 0) {
                return ResponseEntity.badRequest().body("Error: Stock insuficiente en bodega para realizar esta salida.");
            }
        }

        // 4. Actualizar el stock en la bodega
        bodega.setStockActual(stockActual);
        bodega.setFechaActualizacion(java.time.LocalDateTime.now());
        bodegaRepository.save(bodega);

        // 5. Asignar fecha y guardar el movimiento de inventario
        if (movimiento.getFechaMovimiento() == null) {
            movimiento.setFechaMovimiento(java.time.LocalDateTime.now());
        }
        MovimientoInventario nuevoMovimiento = movimientoRepository.save(movimiento);
        
        return ResponseEntity.ok(nuevoMovimiento);
    }
}