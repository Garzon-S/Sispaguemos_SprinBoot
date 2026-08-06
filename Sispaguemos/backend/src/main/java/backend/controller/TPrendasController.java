package backend.controller;

import backend.model.TPrendas;
import backend.repository.TPrendasRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tipos-prendas") // O la ruta que consuma tu frontend
public class TPrendasController {
    @Autowired private TPrendasRepository repository;
    @GetMapping public List<TPrendas> listar() { return repository.findAll(); }
}