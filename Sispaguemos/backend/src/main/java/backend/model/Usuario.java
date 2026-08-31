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

    @Column(name = "primer_nom", nullable = false, length = 25)
    private String primerNom;

    @Column(name = "segund_nom", length = 25)
    private String segundNom;

    @Column(name = "primer_apelli", nullable = false, length = 25)
    private String primerApelli;

    @Column(name = "segund_apelli", length = 25)
    private String segundApelli;

    @Column(name = "correo", nullable = false, length = 100)
    private String correo;

    @Column(name = "contrasena", nullable = false)
    private String contrasena;

    @Column(name = "estado", nullable = false)
    private Integer estado;

    @Column(name = "fecha_ingreso", updatable = false)
    private LocalDateTime fechaIngreso;

    @Lob
    @Column(name = "imagen_perfil", columnDefinition = "LONGBLOB")
    private byte[] imagenPerfil;

    // Asigna la fecha del sistema antes de guardar en MySQL
    @PrePersist
    public void prePersist() {
        if (this.fechaIngreso == null) {
            this.fechaIngreso = LocalDateTime.now();
        }
    }

    // Constructor vacío (Requerido por JPA)
    public Usuario() {
    }

    // Constructor con parámetros
    public Usuario(Integer id, String primerNom, String segundNom, String primerApelli, String segundApelli, String correo, Integer estado) {
        this.id = id;
        this.primerNom = primerNom;
        this.segundNom = segundNom;
        this.primerApelli = primerApelli;
        this.segundApelli = segundApelli;
        this.correo = correo;
        this.estado = estado;
    }

    // Getters y Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getPrimerNom() {
        return primerNom;
    }

    public void setPrimerNom(String primerNom) {
        this.primerNom = primerNom;
    }

    public String getSegundNom() {
        return segundNom;
    }

    public void setSegundNom(String segundNom) {
        this.segundNom = segundNom;
    }

    public String getPrimerApelli() {
        return primerApelli;
    }

    public void setPrimerApelli(String primerApelli) {
        this.primerApelli = primerApelli;
    }

    public String getSegundApelli() {
        return segundApelli;
    }

    public void setSegundApelli(String segundApelli) {
        this.segundApelli = segundApelli;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getContrasena() {
        return contrasena;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }

    public Integer getEstado() {
        return estado;
    }

    public void setEstado(Integer estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaIngreso() {
        return fechaIngreso;
    }

    public void setFechaIngreso(LocalDateTime fechaIngreso) {
        this.fechaIngreso = fechaIngreso;
    }

    public byte[] getImagenPerfil() {
        return imagenPerfil;
    }

    public void setImagenPerfil(byte[] imagenPerfil) {
        this.imagenPerfil = imagenPerfil;
    }
}