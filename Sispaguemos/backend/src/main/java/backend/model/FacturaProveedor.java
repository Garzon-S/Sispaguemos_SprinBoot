package backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "factura_proveedor")
public class FacturaProveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_factura_proveedor")
    private Long idFacturaProveedor;

    @Column(name = "numero_factura", nullable = false, unique = true, length = 50)
    private String numeroFactura;

    @Column(name = "fecha_pedido", nullable = false)
    private LocalDateTime fechaPedido = LocalDateTime.now();

    @Column(name = "fecha_recepcion")
    private LocalDateTime fechaRecepcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoFactura estado = EstadoFactura.Recibida;

    @Column(name = "subtotal", nullable = false)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "impuesto", nullable = false)
    private BigDecimal impuesto = BigDecimal.ZERO;

    @Column(name = "total", nullable = false)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @ManyToOne
    @JoinColumn(name = "fk_id_proveedor", nullable = false)
    private Proveedor proveedor;

    @ManyToOne
    @JoinColumn(name = "fk_id_usuario", nullable = false)
    private Usuario usuario;

    @OneToMany(mappedBy = "facturaProveedor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleFacturaProveedor> detalles;

    public enum EstadoFactura {
        Recibida, Incompleta, Cancelada
    }

    // Getters y Setters
    public Long getIdFacturaProveedor() { return idFacturaProveedor; }
    public void setIdFacturaProveedor(Long idFacturaProveedor) { this.idFacturaProveedor = idFacturaProveedor; }

    public String getNumeroFactura() { return numeroFactura; }
    public void setNumeroFactura(String numeroFactura) { this.numeroFactura = numeroFactura; }

    public LocalDateTime getFechaPedido() { return fechaPedido; }
    public void setFechaPedido(LocalDateTime fechaPedido) { this.fechaPedido = fechaPedido; }

    public LocalDateTime getFechaRecepcion() { return fechaRecepcion; }
    public void setFechaRecepcion(LocalDateTime fechaRecepcion) { this.fechaRecepcion = fechaRecepcion; }

    public EstadoFactura getEstado() { return estado; }
    public void setEstado(EstadoFactura estado) { this.estado = estado; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getImpuesto() { return impuesto; }
    public void setImpuesto(BigDecimal impuesto) { this.impuesto = impuesto; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public Proveedor getProveedor() { return proveedor; }
    public void setProveedor(Proveedor proveedor) { this.proveedor = proveedor; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public List<DetalleFacturaProveedor> getDetalles() { return detalles; }
    public void setDetalles(List<DetalleFacturaProveedor> detalles) { this.detalles = detalles; }
}