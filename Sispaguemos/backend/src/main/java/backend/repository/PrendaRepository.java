package backend.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import backend.model.Prenda;

@Repository
public interface PrendaRepository extends JpaRepository<Prenda, Integer> {
    Optional<Prenda> findByCodigoBarras(String codigoBarras);
}