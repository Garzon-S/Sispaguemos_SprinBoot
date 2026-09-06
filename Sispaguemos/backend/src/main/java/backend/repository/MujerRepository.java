package backend.repository;

import backend.model.Mujer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MujerRepository extends JpaRepository<Mujer, Integer> {
    List<Mujer> findByFkIdPrenda(Integer fkIdPrenda);
}