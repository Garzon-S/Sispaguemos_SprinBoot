package backend.repository;

import backend.model.Infantil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InfantilRepository extends JpaRepository<Infantil, Integer> {
    List<Infantil> findByFkIdPrenda(Integer fkIdPrenda);
}