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
            Double totalVenta = Double.valueOf(payload.get("total_venta").toString());
            String metodoPago = (String) payload.get("metodo_pago");
            
            // Si el frontend envía un id de pedido, lo usamos; si no, asignamos un valor por defecto o manejador
            Integer fkIdPedido = payload.get("fk_id_pedido") != null 
                ? Integer.valueOf(payload.get("fk_id_pedido").toString()) 
                : 1; // Asegúrate de que exista un pedido con ID 1 en tu BD o ajusta esta lógica según tus tablas

            System.out.println("Registrando venta POS - Total: " + totalVenta + " - Pedido ID: " + fkIdPedido);

            VentaPedido venta = new VentaPedido();
            venta.setFechaVenta(LocalDateTime.now());
            venta.setTotalVenta(totalVenta);
            venta.setMetodoPago(metodoPago);
            venta.setFkIdPedido(fkIdPedido); // Ya no va en null

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