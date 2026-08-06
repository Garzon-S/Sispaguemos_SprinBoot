package backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "prenda")
public class Prenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_prenda")
    private Long idPrenda;

    @JsonProperty("nombre_prend")
    @Column(name = "nombre_prend", nullable = false)
    private String nombrePrend;

    @JsonProperty("descripcion_prend")
    @Column(name = "descripcion_prend", nullable = false)
    private String descripcionPrend;

    @Column(name = "precio", nullable = false)
    private Integer precio;

    @Column(name = "estado", nullable = false)
    private Integer estado;

    @JsonProperty("fecha_registro")
    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "stock", nullable = false)
    private Integer stock;

    @JsonProperty("min_stock")
    @Column(name = "min_stock", nullable = false)
    private Integer minStock;

    @JsonProperty("max_stock")
    @Column(name = "max_stock", nullable = false)
    private Integer maxStock;

    @JsonProperty("fk_id_genero")
    @Column(name = "fk_id_genero", nullable = false)
    private Integer fkIdGenero;

    @JsonProperty("fk_idt_prendas")
    @Column(name = "fk_idt_prendas", nullable = false)
    private Integer fkIdtPrendas;

    @JsonProperty("fk_id_color")
    @Column(name = "fk_id_color", nullable = false)
    private Integer fkIdColor;

    // Asignar fecha automáticamente antes de guardar en la BD
    @PrePersist
    public void prePersist() {
        if (this.fechaRegistro == null) {
            this.fechaRegistro = LocalDateTime.now();
        }
    }

    // Getters y Setters
    public Long getIdPrenda() { return idPrenda; }
    public void setIdPrenda(Long idPrenda) { this.idPrenda = idPrenda; }

    public String getNombrePrend() { return nombrePrend; }
    public void setNombrePrend(String nombrePrend) { this.nombrePrend = nombrePrend; }

    public String getDescripcionPrend() { return descripcionPrend; }
    public void setDescripcionPrend(String descripcionPrend) { this.descripcionPrend = descripcionPrend; }

    public Integer getPrecio() { return precio; }
    public void setPrecio(Integer precio) { this.precio = precio; }

    public Integer getEstado() { return estado; }
    public void setEstado(Integer estado) { this.estado = estado; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public Integer getMinStock() { return minStock; }
    public void setMinStock(Integer minStock) { this.minStock = minStock; }

    public Integer getMaxStock() { return maxStock; }
    public void setMaxStock(Integer maxStock) { this.maxStock = maxStock; }

    public Integer getFkIdGenero() { return fkIdGenero; }
    public void setFkIdGenero(Integer fkIdGenero) { this.fkIdGenero = fkIdGenero; }

    public Integer getFkIdtPrendas() { return fkIdtPrendas; }
    public void setFkIdtPrendas(Integer fkIdtPrendas) { this.fkIdtPrendas = fkIdtPrendas; }

    public Integer getFkIdColor() { return fkIdColor; }
    public void setFkIdColor(Integer fkIdColor) { this.fkIdColor = fkIdColor; }
}