package backend.repository;

import backend.model.Color; // Asegúrate de tener tu modelo Color creado
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ColorRepository extends JpaRepository<Color, Long> {
}