package backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "venta_pedido")
public class VentaPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_venta")
    private Long idVenta;

    @Column(name = "fecha_venta", nullable = false)
    private LocalDateTime fechaVenta = LocalDateTime.now();

    @Column(name = "precio_final", nullable = false)
    private Double precioFinal;

    @Column(name = "metodo_pago")
    private String metodoPago;

    @Column(name = "fk_id_pedido")
    private Integer fkIdPedido;

    @Column(name = "fk_id_usuario_cajero", nullable = false)
    private Integer fkIdUsuarioCajero;

    // Constructor vacío obligatorio para JPA / Hibernate
    public VentaPedido() {
    }

    // Getters y Setters
    public Long getIdVenta() { return idVenta; }
    public void setIdVenta(Long idVenta) { this.idVenta = idVenta; }

    public LocalDateTime getFechaVenta() { return fechaVenta; }
    public void setFechaVenta(LocalDateTime fechaVenta) { this.fechaVenta = fechaVenta; }

    public Double getPrecioFinal() { return precioFinal; }
    public void setPrecioFinal(Double precioFinal) { this.precioFinal = precioFinal; }

    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }

    public Integer getFkIdPedido() { return fkIdPedido; }
    public void setFkIdPedido(Integer fkIdPedido) { this.fkIdPedido = fkIdPedido; }

    public Integer getFkIdUsuarioCajero() { return fkIdUsuarioCajero; }
    public void setFkIdUsuarioCajero(Integer fkIdUsuarioCajero) { this.fkIdUsuarioCajero = fkIdUsuarioCajero; }
}