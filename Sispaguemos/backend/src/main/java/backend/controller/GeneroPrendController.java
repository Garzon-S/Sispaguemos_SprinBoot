package backend.controller;

import backend.model.GeneroPrend;
import backend.repository.GeneroPrendRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/generos")
public class GeneroPrendController {
    @Autowired private GeneroPrendRepository repository;
    @GetMapping public List<GeneroPrend> listar() { return repository.findAll(); }
}