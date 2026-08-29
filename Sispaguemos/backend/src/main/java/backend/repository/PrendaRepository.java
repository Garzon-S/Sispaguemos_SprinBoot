package backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import backend.model.Prenda;

@Repository
public interface PrendaRepository extends JpaRepository<Prenda, String> { 
    // ¡Ojo aquí! Cambiamos Long por String
}