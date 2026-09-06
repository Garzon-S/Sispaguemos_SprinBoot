package backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import backend.model.MovimientoInventario;
import java.util.List;

@Repository
public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {
    List<MovimientoInventario> findByFkIdStock(Long fkIdStock);
    
    // Método ordenado por fecha ascendente para el cálculo correcto del Kárdex
    List<MovimientoInventario> findByFkIdStockOrderByFechaMovimientoAsc(Long fkIdStock);
}