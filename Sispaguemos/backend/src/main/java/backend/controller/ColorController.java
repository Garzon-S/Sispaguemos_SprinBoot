package backend.controller;

import backend.model.Color;
import backend.repository.ColorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/colores")
public class ColorController {
    @Autowired private ColorRepository repository;
    @GetMapping public List<Color> listar() { return repository.findAll(); }
}