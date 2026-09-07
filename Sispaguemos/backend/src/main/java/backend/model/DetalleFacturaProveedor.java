package backend.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;

@Entity
@Table(name = "detalle_factura_proveedor")
public class DetalleFacturaProveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle_factura")
    private Long idDetalleFactura;

    @ManyToOne
    @JoinColumn(name = "fk_id_factura_proveedor", nullable = false)
    @JsonIgnore
    private FacturaProveedor facturaProveedor;

    @ManyToOne
    @JoinColumn(name = "fk_id_prenda", nullable = false)
    private Prenda prenda;

    @Column(name = "cantidad_pedida", nullable = false)
    private Integer cantidadPedida = 0;

    @Column(name = "cantidad_recibida", nullable = false)
    private Integer cantidadRecibida = 0;

    @Column(name = "precio_compra", nullable = false)
    private BigDecimal precioCompra;

    @Column(name = "subtotal", insertable = false, updatable = false)
    private BigDecimal subtotal;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoDetalle estado = EstadoDetalle.Recibida;

    public enum EstadoDetalle {
        Recibida, Incompleta
    }

    // Getters y Setters
    public Long getIdDetalleFactura() { return idDetalleFactura; }
    public void setIdDetalleFactura(Long idDetalleFactura) { this.idDetalleFactura = idDetalleFactura; }

    public FacturaProveedor getFacturaProveedor() { return facturaProveedor; }
    public void setFacturaProveedor(FacturaProveedor facturaProveedor) { this.facturaProveedor = facturaProveedor; }

    public Prenda getPrenda() { return prenda; }
    public void setPrenda(Prenda prenda) { this.prenda = prenda; }

    public Integer getCantidadPedida() { return cantidadPedida; }
    public void setCantidadPedida(Integer cantidadPedida) { this.cantidadPedida = cantidadPedida; }

    public Integer getCantidadRecibida() { return cantidadRecibida; }
    public void setCantidadRecibida(Integer cantidadRecibida) { this.cantidadRecibida = cantidadRecibida; }

    public BigDecimal getPrecioCompra() { return precioCompra; }
    public void setPrecioCompra(BigDecimal precioCompra) { this.precioCompra = precioCompra; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public EstadoDetalle getEstado() { return estado; }
    public void setEstado(EstadoDetalle estado) { this.estado = estado; }
}