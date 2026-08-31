package backend.controller;

import backend.model.Usuario;
import backend.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    private Map<String, Object> crearRespuestaUsuario(Usuario usuario) {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("id", usuario.getId());
        respuesta.put("primerNom", usuario.getPrimerNom());
        respuesta.put("segundNom", usuario.getSegundNom());
        respuesta.put("primerApelli", usuario.getPrimerApelli());
        respuesta.put("segundApelli", usuario.getSegundApelli());
        respuesta.put("correo", usuario.getCorreo());
        respuesta.put("estado", usuario.getEstado());
        respuesta.put("fechaIngreso", usuario.getFechaIngreso());
        respuesta.put("imagenPerfil", usuario.getImagenPerfil());
        respuesta.put("rol", usuarioService.obtenerRolPorUsuarioId(usuario.getId()));
        respuesta.put("contrasena", null);
        return respuesta;
    }

    @GetMapping
    public List<Map<String, Object>> listarUsuarios() {
        return usuarioService.obtenerTodos().stream()
                .map(this::crearRespuestaUsuario)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerPorId(@PathVariable Integer id) {
        return usuarioService.obtenerPorId(id)
                .map(usuario -> ResponseEntity.ok(crearRespuestaUsuario(usuario)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/login")
    public ResponseEntity<?> iniciarSesion(@RequestBody Map<String, String> payload) {
        String correo = payload.get("correo");
        String contrasena = payload.get("contrasena");

        if (correo == null || contrasena == null || correo.isBlank() || contrasena.isBlank()) {
            return ResponseEntity.badRequest().body("Correo y contraseña son obligatorios");
        }

        Optional<Usuario> usuario = usuarioService.autenticar(correo, contrasena);
        if (usuario.isEmpty()) {
            return ResponseEntity.status(401).body("Credenciales inválidas");
        }

        Usuario usuarioLogueado = usuario.get();
        return ResponseEntity.ok(crearRespuestaUsuario(usuarioLogueado));
    }

    @PostMapping(value = "/register", consumes = "application/json")
    public ResponseEntity<?> registrarUsuario(@RequestBody Map<String, String> payload) {
        String primerNom = payload.get("primerNom");
        String segundNom = payload.get("segundNom");
        String primerApelli = payload.get("primerApelli");
        String segundApelli = payload.get("segundApelli");
        String correo = payload.get("correo");
        String contrasena = payload.get("contrasena");

        if (primerNom == null || primerApelli == null || correo == null || contrasena == null) {
            return ResponseEntity.badRequest().body("Faltan datos para registrar el usuario");
        }

        if (usuarioService.obtenerPorCorreo(correo).isPresent()) {
            return ResponseEntity.status(409).body("El correo ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setPrimerNom(primerNom.trim());
        usuario.setSegundNom(segundNom != null ? segundNom.trim() : null);
        usuario.setPrimerApelli(primerApelli.trim());
        usuario.setSegundApelli(segundApelli != null ? segundApelli.trim() : null);
        usuario.setCorreo(correo.trim().toLowerCase());
        usuario.setContrasena(contrasena);
        usuario.setEstado(Integer.parseInt(payload.getOrDefault("estado", "1")));

        Usuario usuarioGuardado = usuarioService.guardarUsuario(usuario);
        return ResponseEntity.ok(crearRespuestaUsuario(usuarioGuardado));
    }

    @PostMapping(value = "/register", consumes = "multipart/form-data")
    public ResponseEntity<?> registrarUsuarioMultipart(
            @RequestParam("primerNom") String primerNom,
            @RequestParam(value = "segundNom", required = false) String segundNom,
            @RequestParam("primerApelli") String primerApelli,
            @RequestParam(value = "segundApelli", required = false) String segundApelli,
            @RequestParam("correo") String correo,
            @RequestParam(value = "contrasena", required = false) String contrasena,
            @RequestParam(value = "estado", defaultValue = "1") String estadoStr,
            @RequestParam(value = "imagenPerfil", required = false) MultipartFile imagenPerfil) {
        try {
            if (primerNom == null || primerApelli == null || correo == null || contrasena == null) {
                return ResponseEntity.badRequest().body("Faltan datos para registrar el usuario");
            }

            if (usuarioService.obtenerPorCorreo(correo).isPresent()) {
                return ResponseEntity.status(409).body("El correo ya está registrado");
            }

            Usuario usuario = new Usuario();
            usuario.setPrimerNom(primerNom.trim());
            usuario.setSegundNom(segundNom != null ? segundNom.trim() : null);
            usuario.setPrimerApelli(primerApelli.trim());
            usuario.setSegundApelli(segundApelli != null ? segundApelli.trim() : null);
            usuario.setCorreo(correo.trim().toLowerCase());
            usuario.setContrasena(contrasena);
            usuario.setEstado(Integer.parseInt(estadoStr));

            if (imagenPerfil != null && !imagenPerfil.isEmpty()) {
                usuario.setImagenPerfil(imagenPerfil.getBytes());
            }

            Usuario usuarioGuardado = usuarioService.guardarUsuario(usuario);
            return ResponseEntity.ok(crearRespuestaUsuario(usuarioGuardado));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al guardar el usuario: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> crearUsuario(
            @RequestParam("primerNom") String primerNom,
            @RequestParam(value = "segundNom", required = false) String segundNom,
            @RequestParam("primerApelli") String primerApelli,
            @RequestParam(value = "segundApelli", required = false) String segundApelli,
            @RequestParam("correo") String correo,
            @RequestParam("contrasena") String contrasena,
            @RequestParam("estado") String estadoStr,
            @RequestParam(value = "imagenPerfil", required = false) MultipartFile imagenPerfil) {
        try {
            if (contrasena == null || contrasena.isBlank()) {
                return ResponseEntity.badRequest().body("La contraseña es obligatoria");
            }

            Usuario usuario = new Usuario();
            usuario.setPrimerNom(primerNom);
            usuario.setSegundNom(segundNom);
            usuario.setPrimerApelli(primerApelli);
            usuario.setSegundApelli(segundApelli);
            usuario.setCorreo(correo);
            usuario.setContrasena(contrasena);
            usuario.setEstado(Integer.parseInt(estadoStr));

            if (imagenPerfil != null && !imagenPerfil.isEmpty()) {
                if (imagenPerfil.getSize() > 500 * 1024) {
                    return ResponseEntity.badRequest().body("La imagen es demasiado grande. Máximo 500KB");
                }
                usuario.setImagenPerfil(imagenPerfil.getBytes());
            }

            Usuario usuarioGuardado = usuarioService.guardarUsuario(usuario);
            return ResponseEntity.ok(crearRespuestaUsuario(usuarioGuardado));
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
            @RequestParam(value = "contrasena", required = false) String contrasena,
            @RequestParam("estado") String estadoStr,
            @RequestParam(value = "imagenPerfil", required = false) MultipartFile imagenPerfil) {
        try {
            Usuario usuarioExistente = usuarioService.obtenerPorId(id)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            usuarioExistente.setPrimerNom(primerNom);
            usuarioExistente.setSegundNom(segundNom);
            usuarioExistente.setPrimerApelli(primerApelli);
            usuarioExistente.setSegundApelli(segundApelli);
            usuarioExistente.setCorreo(correo);
            if (contrasena != null && !contrasena.isBlank()) {
                usuarioExistente.setContrasena(contrasena);
            }
            usuarioExistente.setEstado(Integer.parseInt(estadoStr));

            if (imagenPerfil != null && !imagenPerfil.isEmpty()) {
                if (imagenPerfil.getSize() > 500 * 1024) {
                    return ResponseEntity.badRequest().body("La imagen es demasiado grande. Máximo 500KB");
                }
                usuarioExistente.setImagenPerfil(imagenPerfil.getBytes());
            }

            Usuario actualizado = usuarioService.actualizarUsuario(id, usuarioExistente);
            return ResponseEntity.ok(crearRespuestaUsuario(actualizado));
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