package backend.model;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "movimientos_inventario")
public class MovimientoInventario {

    public enum TipoMovimiento {
        Entrada, Salida, Devolucion, Ajuste, ENTRADA, SALIDA, DEVOLUCION, AJUSTE;

        @JsonCreator
        public static TipoMovimiento fromString(String value) {
            if (value == null) return null;
            for (TipoMovimiento t : TipoMovimiento.values()) {
                if (t.name().equalsIgnoreCase(value)) {
                    return t;
                }
            }
            throw new IllegalArgumentException("Tipo de movimiento inválido: " + value);
        }
    }
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id_movimiento")
    @Column(name = "id_movimiento")
    private Long idMovimiento;

    @NotNull(message = "El tipo de movimiento es obligatorio")
    @Enumerated(EnumType.STRING)
    @JsonProperty("tipo_movimiento")
    @Column(name = "tipo_movimiento", nullable = false)
    private TipoMovimiento tipoMovimiento;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad del movimiento debe ser al menos 1")
    @JsonProperty("cantidad")
    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @JsonProperty("fecha_movimiento")
    @Column(name = "fecha_movimiento", nullable = false)
    private LocalDateTime fechaMovimiento;

    @JsonProperty("observacion")
    @Column(name = "observacion", length = 255)
    private String observacion;

    @NotNull(message = "El ID de bodega/stock es obligatorio")
    @JsonProperty("fk_id_stock")
    @Column(name = "fk_id_stock", nullable = false)
    private Long fkIdStock;

    @JsonProperty("fk_id_usuario_admin")
    @Column(name = "fk_id_usuario_admin")
    private Integer fkIdUsuarioAdmin;

    @PrePersist
    public void prePersist() {
        if (this.fechaMovimiento == null) {
            this.fechaMovimiento = LocalDateTime.now();
        }
    }

    // Getters y Setters
    public Long getIdMovimiento() { return idMovimiento; }
    public void setIdMovimiento(Long idMovimiento) { this.idMovimiento = idMovimiento; }

    public TipoMovimiento getTipoMovimiento() { return tipoMovimiento; }
    public void setTipoMovimiento(TipoMovimiento tipoMovimiento) { this.tipoMovimiento = tipoMovimiento; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public LocalDateTime getFechaMovimiento() { return fechaMovimiento; }
    public void setFechaMovimiento(LocalDateTime fechaMovimiento) { this.fechaMovimiento = fechaMovimiento; }

    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }

    public Long getFkIdStock() { return fkIdStock; }
    public void setFkIdStock(Long fkIdStock) { this.fkIdStock = fkIdStock; }

    public Integer getFkIdUsuarioAdmin() { return fkIdUsuarioAdmin; }
    public void setFkIdUsuarioAdmin(Integer fkIdUsuarioAdmin) { this.fkIdUsuarioAdmin = fkIdUsuarioAdmin; }
}