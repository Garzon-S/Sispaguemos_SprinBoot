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

    @Column(name = "total_estimado", nullable = false)
    private Double totalEstimado;

    @Column(name = "estado", nullable = false)
    private String estado;

    @Column(name = "fk_id_usuario_cliente", nullable = false)
    private Integer fkIdUsuarioCliente;

    @PrePersist
    public void prePersist() {
        if (fechaPedido == null) fechaPedido = LocalDateTime.now();
        if (estado == null || estado.isBlank()) estado = "Pendiente";
    }

    public Long getIdPedido() { return idPedido; }
    public void setIdPedido(Long idPedido) { this.idPedido = idPedido; }
    public LocalDateTime getFechaPedido() { return fechaPedido; }
    public void setFechaPedido(LocalDateTime fechaPedido) { this.fechaPedido = fechaPedido; }
    public Double getTotalEstimado() { return totalEstimado; }
    public void setTotalEstimado(Double totalEstimado) { this.totalEstimado = totalEstimado; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public Integer getFkIdUsuarioCliente() { return fkIdUsuarioCliente; }
    public void setFkIdUsuarioCliente(Integer fkIdUsuarioCliente) { this.fkIdUsuarioCliente = fkIdUsuarioCliente; }
}
