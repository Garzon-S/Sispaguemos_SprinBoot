package backend.repository;

import backend.model.Bodega;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BodegaRepository extends JpaRepository<Bodega, Long> {
    
    @Query(value = "SELECT * FROM stock WHERE fk_id_prenda = :idPrenda", nativeQuery = true)
    Bodega findByIdPrenda(@Param("idPrenda") Integer idPrenda);
}