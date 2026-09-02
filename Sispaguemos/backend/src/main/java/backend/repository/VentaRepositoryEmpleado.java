package backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import backend.model.VentaPedido;

@Repository
public interface VentaRepositoryEmpleado extends JpaRepository<VentaPedido, Long> {
}