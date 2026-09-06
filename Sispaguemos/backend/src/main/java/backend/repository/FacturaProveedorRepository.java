package backend.repository;

import backend.model.FacturaProveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FacturaProveedorRepository extends JpaRepository<FacturaProveedor, Long> {
}