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

@Entity
@Table(name = "prenda")
public class Prenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_prenda")
    private Long idPrenda; // <- Cambiado a Long para que coincida con el controlador y la base de datos

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
    private Double precioVenta;

    @JsonProperty("cantidad_disponible_venta")
    @Column(name = "cantidad_disponible_venta", nullable = false)
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

    // Getters y Setters usando Long
    public Long getIdPrenda() { return idPrenda; }
    public void setIdPrenda(Long idPrenda) { this.idPrenda = idPrenda; }

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