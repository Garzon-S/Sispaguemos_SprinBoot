package backend.model;

import java.io.Serializable;
import java.util.Objects;

public class UsuarioRolId implements Serializable {
    private Integer fkIdUsuario;
    private Integer fkIdRol;

    public UsuarioRolId() {
    }

    public UsuarioRolId(Integer fkIdUsuario, Integer fkIdRol) {
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UsuarioRolId that = (UsuarioRolId) o;
        return Objects.equals(fkIdUsuario, that.fkIdUsuario) && Objects.equals(fkIdRol, that.fkIdRol);
    }

    @Override
    public int hashCode() {
        return Objects.hash(fkIdUsuario, fkIdRol);
    }
}
