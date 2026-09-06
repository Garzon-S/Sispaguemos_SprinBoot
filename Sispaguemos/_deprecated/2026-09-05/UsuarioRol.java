package backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuario_rol")
@IdClass(UsuarioRolId.class)
public class UsuarioRol {

    @Id
    @Column(name = "fk_id_usuario")
    private Integer fkIdUsuario;

    @Id
    @Column(name = "fk_id_rol")
    private Integer fkIdRol;

    public UsuarioRol() {
    }

    public UsuarioRol(Integer fkIdUsuario, Integer fkIdRol) {
        this.fkIdUsuario = fkIdUsuario;
        this.fkIdRol = fkIdRol;
    }

    public Integer getFkIdUsuario() {
        return fkIdUsuario;
    }

    public void setFkIdUsuario(Integer fkIdUsuario) {
        this.fkIdUsuario = fkIdUsuario;
    }

    public Integer getFkIdRol() {
        return fkIdRol;
    }

    public void setFkIdRol(Integer fkIdRol) {
        this.fkIdRol = fkIdRol;
    }
}
