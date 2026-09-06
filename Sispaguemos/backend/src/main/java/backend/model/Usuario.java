package backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer id;

    @Column(name = "nombre_usuario", nullable = false, length = 100)
    private String nombreUsuario;

    @Column(name = "apellido_usuario", nullable = false, length = 100)
    private String apellidoUsuario;

    @Column(name = "correo_usuario", nullable = false, unique = true, length = 150)
    private String correo;

    @Column(name = "telefono_usuario", length = 20)
    private String telefono;

    @Column(name = "direccion_usuario", length = 200)
    private String direccion;

    @Column(name = "contrasena_usuario", nullable = false, length = 255)
    private String contrasena;

    @Lob
    @Column(name = "imagen_perfil", columnDefinition = "LONGBLOB")
    private byte[] imagenPerfil;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado = "Activo";

    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "fk_id_rol", nullable = false)
    private Integer fkIdRol;

    // Asigna la fecha y estado por defecto antes de guardar en MySQL
    @PrePersist
    public void prePersist() {
        if (this.fechaRegistro == null) {
            this.fechaRegistro = LocalDateTime.now();
        }
        if (this.estado == null) {
            this.estado = "Activo";
        }
    }

    // Constructor vacío (Requerido por JPA)
    public Usuario() {
    }

    // Constructor con parámetros principales
    public Usuario(Integer id, String nombreUsuario, String apellidoUsuario, String correo, String contrasena, Integer fkIdRol) {
        this.id = id;
        this.nombreUsuario = nombreUsuario;
        this.apellidoUsuario = apellidoUsuario;
        this.correo = correo;
        this.contrasena = contrasena;
        this.fkIdRol = fkIdRol;
    }

    // Getters y Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNombreUsuario() {
        return nombreUsuario;
    }

    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }

    public String getApellidoUsuario() {
        return apellidoUsuario;
    }

    public void setApellidoUsuario(String apellidoUsuario) {
        this.apellidoUsuario = apellidoUsuario;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getContrasena() {
        return contrasena;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }

    public byte[] getImagenPerfil() {
        return imagenPerfil;
    }

    public void setImagenPerfil(byte[] imagenPerfil) {
        this.imagenPerfil = imagenPerfil;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    public Integer getFkIdRol() {
        return fkIdRol;
    }

    public void setFkIdRol(Integer fkIdRol) {
        this.fkIdRol = fkIdRol;
    }
}