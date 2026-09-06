package backend.repository;

import backend.model.Hombre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HombreRepository extends JpaRepository<Hombre, Integer> {
    List<Hombre> findByFkIdPrenda(Integer fkIdPrenda);
}