package backend.repository;

import backend.model.UsuarioRol;
import backend.model.UsuarioRolId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRolRepository extends JpaRepository<UsuarioRol, UsuarioRolId> {
    Optional<UsuarioRol> findByFkIdUsuario(Integer fkIdUsuario);
}
