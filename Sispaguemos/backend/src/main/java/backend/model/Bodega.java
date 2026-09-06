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
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Entity
@Table(name = "stock")
public class Bodega {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id_stock")
    @Column(name = "id_stock")
    private Long idBodega;

    @NotNull(message = "El código de la prenda es obligatorio")
    @JsonProperty("id_prenda")
    @Column(name = "fk_id_prenda", nullable = false, unique = true)
    private Integer idPrenda;

    @NotNull(message = "El stock actual es obligatorio")
    @JsonProperty("stock_actual")
    @Column(name = "cantidad_actual", nullable = false)
    @Min(value = 0, message = "El stock actual no puede ser negativo")
    private Integer stockActual;

    @NotNull(message = "El stock mínimo es obligatorio")
    @JsonProperty("stock_minimo")
    @Column(name = "cantidad_minima", nullable = false)
    private Integer stockMinimo;

    @NotNull(message = "El stock máximo es obligatorio")
    @JsonProperty("stock_maximo")
    @Column(name = "cantidad_maxima", nullable = false)
    private Integer stockMaximo;

    @JsonProperty("costo_promedio")
    @Column(name = "costo_promedio")
    private BigDecimal costoPromedio;

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
        if (this.costoPromedio == null) {
            this.costoPromedio = BigDecimal.valueOf(0.00);
        }
    }

    // Getters y Setters
    public Long getIdBodega() { return idBodega; }
    public void setIdBodega(Long idBodega) { this.idBodega = idBodega; }

    public Integer getIdPrenda() { return idPrenda; }
    public void setIdPrenda(Integer idPrenda) { this.idPrenda = idPrenda; }

    public Integer getStockActual() { return stockActual; }
    public void setStockActual(Integer stockActual) { this.stockActual = stockActual; }

    public Integer getStockMinimo() { return stockMinimo; }
    public void setStockMinimo(Integer stockMinimo) { this.stockMinimo = stockMinimo; }

    public Integer getStockMaximo() { return stockMaximo; }
    public void setStockMaximo(Integer stockMaximo) { this.stockMaximo = stockMaximo; }

    public BigDecimal getCostoPromedio() { return costoPromedio; }
    public void setCostoPromedio(BigDecimal costoPromedio) { this.costoPromedio = costoPromedio; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }
}