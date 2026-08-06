package backend.repository;

import backend.model.GeneroPrend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GeneroPrendRepository extends JpaRepository<GeneroPrend, Long> {
}