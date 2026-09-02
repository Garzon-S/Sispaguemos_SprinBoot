package backend.controller;

import backend.model.VentaPedido;
import backend.repository.VentaRepositoryEmpleado;
import backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
public class VentaControllerEmpleado {

    @Autowired
    private VentaRepositoryEmpleado ventaRepositoryEmpleado;

    @Autowired
    private EmailService emailService;

    @PostMapping
    public ResponseEntity<?> registrarVenta(@RequestBody Map<String, Object> payload) {
        try {
            Double precioFinal = Double.valueOf(payload.get("precio_final").toString());
            String metodoPago = (String) payload.get("metodo_pago");
            
            Object rawCajero = payload.get("fk_id_usuario_cajero");
            Integer idCajero = rawCajero != null ? Integer.valueOf(rawCajero.toString()) : 1;

            System.out.println("Registrando venta POS - Cajero ID: " + idCajero + " | Total: " + precioFinal);

            VentaPedido venta = new VentaPedido();
            venta.setFechaVenta(LocalDateTime.now());
            venta.setPrecioFinal(precioFinal);
            venta.setMetodoPago(metodoPago);
            venta.setFkIdUsuarioCajero(idCajero);
            venta.setFkIdPedido(null); 

            VentaPedido nuevaVenta = ventaRepositoryEmpleado.save(venta);
            return ResponseEntity.ok(nuevaVenta);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al registrar la venta: " + e.getMessage());
        }
    }

    @PostMapping("/enviar-factura")
    public ResponseEntity<?> enviarFacturaCorreo(@RequestBody Map<String, Object> payload) {
        try {
            emailService.enviarFacturaElectronica(payload);
            return ResponseEntity.ok(Map.of("mensaje", "Correo enviado con éxito"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al enviar el correo electrónico: " + e.getMessage());
        }
    }
}