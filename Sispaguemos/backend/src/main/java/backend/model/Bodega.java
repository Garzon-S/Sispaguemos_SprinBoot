package backend.model;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Entity
@Table(name = "stock") // <--- Apunta directamente a la tabla real de la base de datos
public class Bodega {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id_stock")
    @Column(name = "id_stock")
    private Long idBodega;

    @NotNull(message = "El código de la prenda es obligatorio")
    @JsonProperty("id_prenda")
    @Column(name = "fk_id_prenda", nullable = false, unique = true, length = 25)
    private String idPrenda;

    @NotNull(message = "El stock actual es obligatorio")
    @JsonProperty("stock_actual")
    @Column(name = "cantidad_actual", nullable = false)
    @Min(value = 0, message = "El stock actual no puede ser negativo")
    @Max(value = 85, message = "El stock actual no puede superar las 85 unidades")
    private Integer stockActual;

    @NotNull(message = "El stock mínimo es obligatorio")
    @JsonProperty("stock_minimo")
    @Column(name = "cantidad_minima", nullable = false)
    @Min(value = 5, message = "El stock mínimo permitido es 5")
    @Max(value = 85, message = "El stock mínimo no puede superar 85")
    private Integer stockMinimo;

    @NotNull(message = "El stock máximo es obligatorio")
    @JsonProperty("stock_maximo")
    @Column(name = "cantidad_maxima", nullable = false)
    @Min(value = 5, message = "El stock máximo debe ser al menos 5")
    @Max(value = 85, message = "El stock máximo permitido es 85")
    private Integer stockMaximo;

    // Campo opcional por si envías el precio desde el formulario
    @JsonProperty("precio_unitario")
    @Column(name = "precio_unitario")
    private BigDecimal precioUnitario;

    @JsonProperty("fecha_actualizacion")
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @PrePersist
    public void prePersist() {
        if (this.fechaActualizacion == null) {
            this.fechaActualizacion = LocalDateTime.now();
        }
        if (this.stockActual == null) {
            this.stockActual = 5;
        }
        if (this.stockMinimo == null) {
            this.stockMinimo = 5;
        }
        if (this.stockMaximo == null) {
            this.stockMaximo = 85;
        }
        if (this.precioUnitario == null) {
            this.precioUnitario = BigDecimal.valueOf(0.00); // Valor por defecto si no viaja en el form
        }
    }

    // Getters y Setters
    public Long getIdBodega() { return idBodega; }
    public void setIdBodega(Long idBodega) { this.idBodega = idBodega; }

    public String getIdPrenda() { return idPrenda; }
    public void setIdPrenda(String idPrenda) { this.idPrenda = idPrenda; }

    public Integer getStockActual() { return stockActual; }
    public void setStockActual(Integer stockActual) { this.stockActual = stockActual; }

    public Integer getStockMinimo() { return stockMinimo; }
    public void setStockMinimo(Integer stockMinimo) { this.stockMinimo = stockMinimo; }

    public Integer getStockMaximo() { return stockMaximo; }
    public void setStockMaximo(Integer stockMaximo) { this.stockMaximo = stockMaximo; }

    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }
}