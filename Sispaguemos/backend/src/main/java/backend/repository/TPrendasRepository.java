package backend.repository;

import backend.model.TPrendas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TPrendasRepository extends JpaRepository<TPrendas, Long> {
}