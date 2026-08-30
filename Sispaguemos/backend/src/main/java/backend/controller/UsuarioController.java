package backend.controller;

import backend.model.Usuario;
import backend.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

@Autowired
private UsuarioService usuarioService;

@GetMapping
public List<Usuario> listarUsuarios() {
    return usuarioService.obtenerTodos();
}

@GetMapping("/{id}")
public ResponseEntity<Usuario> obtenerPorId(@PathVariable Integer id) {
    return usuarioService.obtenerPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}

@PostMapping
public ResponseEntity<?> crearUsuario(
        @RequestParam("primerNom") String primerNom,
        @RequestParam(value = "segundNom", required = false) String segundNom,
        @RequestParam("primerApelli") String primerApelli,
        @RequestParam(value = "segundApelli", required = false) String segundApelli,
        @RequestParam("correo") String correo,
        @RequestParam("estado") String estadoStr,
        @RequestParam(value = "imagen", required = false) MultipartFile imagen) {
    try {
        Usuario usuario = new Usuario();
        usuario.setPrimerNom(primerNom);
        usuario.setSegundNom(segundNom);
        usuario.setPrimerApelli(primerApelli);
        usuario.setSegundApelli(segundApelli);
        usuario.setCorreo(correo);
        usuario.setEstado(Integer.parseInt(estadoStr));
        
        if (imagen != null && !imagen.isEmpty()) {
            if (imagen.getSize() > 500 * 1024) {
                return ResponseEntity.badRequest().body("La imagen es demasiado grande. Máximo 500KB");
            }
            usuario.setImagen(imagen.getBytes());
        }
        
        Usuario usuarioGuardado = usuarioService.guardarUsuario(usuario);
        return ResponseEntity.ok(usuarioGuardado);
    } catch (IOException e) {
        return ResponseEntity.badRequest().body("Error al procesar la imagen: " + e.getMessage());
    } catch (NumberFormatException e) {
        return ResponseEntity.badRequest().body("El estado debe ser un número");
    } catch (Exception e) {
        return ResponseEntity.badRequest().body("Error al guardar el usuario: " + e.getMessage());
    }
}

@PutMapping("/{id}")
public ResponseEntity<?> actualizarUsuario(
        @PathVariable Integer id,
        @RequestParam("primerNom") String primerNom,
        @RequestParam(value = "segundNom", required = false) String segundNom,
        @RequestParam("primerApelli") String primerApelli,
        @RequestParam(value = "segundApelli", required = false) String segundApelli,
        @RequestParam("correo") String correo,
        @RequestParam("estado") String estadoStr,
        @RequestParam(value = "imagen", required = false) MultipartFile imagen) {
    try {
        Usuario usuarioExistente = usuarioService.obtenerPorId(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        usuarioExistente.setPrimerNom(primerNom);
        usuarioExistente.setSegundNom(segundNom);
        usuarioExistente.setPrimerApelli(primerApelli);
        usuarioExistente.setSegundApelli(segundApelli);
        usuarioExistente.setCorreo(correo);
        usuarioExistente.setEstado(Integer.parseInt(estadoStr));
        
        if (imagen != null && !imagen.isEmpty()) {
            if (imagen.getSize() > 500 * 1024) {
                return ResponseEntity.badRequest().body("La imagen es demasiado grande. Máximo 500KB");
            }
            usuarioExistente.setImagen(imagen.getBytes());
        }
        
        Usuario actualizado = usuarioService.actualizarUsuario(id, usuarioExistente);
        return ResponseEntity.ok(actualizado);
    } catch (IOException e) {
        return ResponseEntity.badRequest().body("Error al procesar la imagen: " + e.getMessage());
    } catch (NumberFormatException e) {
        return ResponseEntity.badRequest().body("El estado debe ser un número");
    } catch (Exception e) {
        return ResponseEntity.badRequest().body("Error al actualizar el usuario: " + e.getMessage());
    }
}

@DeleteMapping("/{id}")
public ResponseEntity<Void> eliminarUsuario(@PathVariable Integer id) {
    usuarioService.eliminarUsuario(id);
    return ResponseEntity.noContent().build();
}
}