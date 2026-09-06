package backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "proveedor")
public class Proveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_proveedor")
    private Long idProveedor;

    @Column(name = "nombre_proveedor", nullable = false, length = 150)
    private String nombreProveedor;

    @Column(name = "nit_proveedor", unique = true, length = 50)
    private String nitProveedor;

    @Column(name = "telefono_proveedor", length = 30)
    private String telefonoProveedor;

    @Column(name = "correo_proveedor", length = 150)
    private String correoProveedor;

    @Column(name = "direccion_proveedor", length = 200)
    private String direccionProveedor;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoProveedor estado = EstadoProveedor.Activo;

    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro = LocalDateTime.now();

    public enum EstadoProveedor {
        Activo, Inactivo
    }

    @PrePersist
    public void prePersist() {
        if (this.estado == null) {
            this.estado = EstadoProveedor.Activo;
        }
        if (this.fechaRegistro == null) {
            this.fechaRegistro = LocalDateTime.now();
        }
    }

    // Getters y Setters
    public Long getIdProveedor() { return idProveedor; }
    public void setIdProveedor(Long idProveedor) { this.idProveedor = idProveedor; }

    public String getNombreProveedor() { return nombreProveedor; }
    public void setNombreProveedor(String nombreProveedor) { this.nombreProveedor = nombreProveedor; }

    public String getNitProveedor() { return nitProveedor; }
    public void setNitProveedor(String nitProveedor) { this.nitProveedor = nitProveedor; }

    public String getTelefonoProveedor() { return telefonoProveedor; }
    public void setTelefonoProveedor(String telefonoProveedor) { this.telefonoProveedor = telefonoProveedor; }

    public String getCorreoProveedor() { return correoProveedor; }
    public void setCorreoProveedor(String correoProveedor) { this.correoProveedor = correoProveedor; }

    public String getDireccionProveedor() { return direccionProveedor; }
    public void setDireccionProveedor(String direccionProveedor) { this.direccionProveedor = direccionProveedor; }

    public EstadoProveedor getEstado() { return estado; }
    public void setEstado(EstadoProveedor estado) { this.estado = estado; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }
}