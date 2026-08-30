package backend.model;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "prenda")
public class Prenda {

    @Id
    @JsonProperty("id_prenda")
    @Column(name = "id_prenda")
    @Size(min = 1, max = 25, message = "El código de la prenda debe tener máximo 25 caracteres")
    private String idPrenda;

    @JsonProperty("nombre_prend")
    @Column(name = "nombre_prend", nullable = false)
    private String nombrePrend;

    @JsonProperty("descripcion_prend")
    @Column(name = "descripcion_prend")
    private String descripcionPrend;

    @JsonProperty("genero")
    @Column(name = "genero", nullable = false)
    private String genero;

    @JsonProperty("precio_venta")
    @Column(name = "precio_venta", nullable = false)
    @Min(value = 5000, message = "El precio mínimo de venta es de $5,000")
    @Max(value = 5000000, message = "El precio máximo de venta es de $5,000,000")
    private Double precioVenta;

    @JsonProperty("cantidad_disponible_venta")
    @Column(name = "cantidad_disponible_venta", nullable = false)
    @Min(value = 0, message = "La cantidad no puede ser negativa")
    @Max(value = 20, message = "El canal web permite un máximo de 20 prendas por producto")
    private Integer cantidadDisponibleVenta;

    @Column(name = "estado", nullable = false)
    private Integer estado;

    @JsonProperty("fecha_registro")
    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    @JsonProperty("imagen_prend")
    @Column(name = "imagen_prend", columnDefinition = "LONGTEXT")
    private String imagenPrend;

    @JsonProperty("fk_idt_prendas")
    @Column(name = "fk_idt_prendas", nullable = false)
    private Integer fkIdtPrendas;

    @JsonProperty("fk_id_color")
    @Column(name = "fk_id_color", nullable = false)
    private Integer fkIdColor;

    @PrePersist
    public void prePersist() {
        if (this.fechaRegistro == null) {
            this.fechaRegistro = LocalDateTime.now();
        }
        if (this.estado == null) {
            this.estado = 1;
        }
        if (this.cantidadDisponibleVenta == null) {
            this.cantidadDisponibleVenta = 0;
        }
    }

    // Getters y Setters
    public String getIdPrenda() { return idPrenda; }
    public void setIdPrenda(String idPrenda) { this.idPrenda = idPrenda; }

    public String getNombrePrend() { return nombrePrend; }
    public void setNombrePrend(String nombrePrend) { this.nombrePrend = nombrePrend; }

    public String getDescripcionPrend() { return descripcionPrend; }
    public void setDescripcionPrend(String descripcionPrend) { this.descripcionPrend = descripcionPrend; }

    public String getGenero() { return genero; }
    public void setGenero(String genero) { this.genero = genero; }

    public Double getPrecioVenta() { return precioVenta; }
    public void setPrecioVenta(Double precioVenta) { this.precioVenta = precioVenta; }

    public Integer getCantidadDisponibleVenta() { return cantidadDisponibleVenta; }
    public void setCantidadDisponibleVenta(Integer cantidadDisponibleVenta) { this.cantidadDisponibleVenta = cantidadDisponibleVenta; }

    public Integer getEstado() { return estado; }
    public void setEstado(Integer estado) { this.estado = estado; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public String getImagenPrend() { return imagenPrend; }
    public void setImagenPrend(String imagenPrend) { this.imagenPrend = imagenPrend; }

    public Integer getFkIdtPrendas() { return fkIdtPrendas; }
    public void setFkIdtPrendas(Integer fkIdtPrendas) { this.fkIdtPrendas = fkIdtPrendas; }

    public Integer getFkIdColor() { return fkIdColor; }
    public void setFkIdColor(Integer fkIdColor) { this.fkIdColor = fkIdColor; }
}