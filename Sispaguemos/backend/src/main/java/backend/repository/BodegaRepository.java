package backend.repository;

import backend.model.Bodega;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BodegaRepository extends JpaRepository<Bodega, Long> {
    // Como en tu modelo Bodega, idPrenda es de tipo String, el parámetro aquí debe ser String
    Bodega findByIdPrenda(Integer idPrenda);
}