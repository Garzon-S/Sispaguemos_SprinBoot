package backend.model;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonAlias;
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
    @JsonProperty("id_prenda")
    @JsonAlias("idPrenda")
    @Column(name = "id_prenda")
    private Integer idPrenda;

@Column(name = "codigo_barras", unique = true, nullable = false, length = 25)
private String codigoBarras;

    @JsonProperty("nombre_prend")
    @Column(name = "nombre_prend", nullable = false)
    private String nombrePrend;

    @JsonProperty("descripcion_prend")
    @Column(name = "descripcion_prend", columnDefinition = "TEXT")
    private String descripcionPrend;

    @JsonProperty("genero")
    @Column(name = "genero", nullable = false)
    private String genero;

    @JsonProperty("color")
    @Column(name = "color", nullable = false)
    private String color;

    @JsonProperty("precio_venta")
    @Column(name = "precio_venta", nullable = false)
    private Double precioVenta;

    @JsonProperty("cantidad_disponible_venta")
    @Column(name = "cantidad_disponible_venta", nullable = false)
    private Integer cantidadDisponibleVenta;

    @Column(name = "estado", nullable = false)
    private String estado = "Disponible";

    @JsonProperty("fecha_registro")
    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    @JsonProperty("imagen_prend")
    @Column(name = "imagen_prend", columnDefinition = "LONGTEXT")
    private String imagenPrend;

    @PrePersist
    public void prePersist() {
        if (this.fechaRegistro == null) {
            this.fechaRegistro = LocalDateTime.now();
        }
        if (this.estado == null) {
            this.estado = "Disponible";
        }
        if (this.cantidadDisponibleVenta == null) {
            this.cantidadDisponibleVenta = 0;
        }
        if (this.precioVenta == null) {
            this.precioVenta = 0.00;
        }
    }

    // Getters y Setters
    public Integer getIdPrenda() { return idPrenda; }
    public void setIdPrenda(Integer idPrenda) { this.idPrenda = idPrenda; }

    public String getCodigoBarras() { return codigoBarras; }
public void setCodigoBarras(String codigoBarras) { this.codigoBarras = codigoBarras; }

    public String getNombrePrend() { return nombrePrend; }
    public void setNombrePrend(String nombrePrend) { this.nombrePrend = nombrePrend; }

    public String getDescripcionPrend() { return descripcionPrend; }
    public void setDescripcionPrend(String descripcionPrend) { this.descripcionPrend = descripcionPrend; }

    public String getGenero() { return genero; }
    public void setGenero(String genero) { this.genero = genero; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Double getPrecioVenta() { return precioVenta; }
    public void setPrecioVenta(Double precioVenta) { this.precioVenta = precioVenta; }

    public Integer getCantidadDisponibleVenta() { return cantidadDisponibleVenta; }
    public void setCantidadDisponibleVenta(Integer cantidadDisponibleVenta) { this.cantidadDisponibleVenta = cantidadDisponibleVenta; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public String getImagenPrend() { return imagenPrend; }
    public void setImagenPrend(String imagenPrend) { this.imagenPrend = imagenPrend; }
}