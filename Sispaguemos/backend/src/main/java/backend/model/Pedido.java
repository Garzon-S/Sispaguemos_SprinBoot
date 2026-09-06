package backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "pedido")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido")
    private Long idPedido;

    @Column(name = "fecha_pedido", nullable = false)
    private LocalDateTime fechaPedido;

    @Column(name = "total_pedido", nullable = false)
    private Double totalPedido;

    @Column(name = "estado_pedido", nullable = false)
    private String estadoPedido;

    @Column(name = "fk_id_usuario", nullable = false)
    private Integer fkIdUsuario;

    @PrePersist
    public void prePersist() {
        if (fechaPedido == null) fechaPedido = LocalDateTime.now();
        if (estadoPedido == null || estadoPedido.isBlank()) estadoPedido = "Pendiente";
    }

    public Long getIdPedido() { return idPedido; }
    public void setIdPedido(Long idPedido) { this.idPedido = idPedido; }
    public LocalDateTime getFechaPedido() { return fechaPedido; }
    public void setFechaPedido(LocalDateTime fechaPedido) { this.fechaPedido = fechaPedido; }
    public Double getTotalPedido() { return totalPedido; }
    public void setTotalPedido(Double totalPedido) { this.totalPedido = totalPedido; }
    public String getEstadoPedido() { return estadoPedido; }
    public void setEstadoPedido(String estadoPedido) { this.estadoPedido = estadoPedido; }
    public Integer getFkIdUsuario() { return fkIdUsuario; }
    public void setFkIdUsuario(Integer fkIdUsuario) { this.fkIdUsuario = fkIdUsuario; }
}
