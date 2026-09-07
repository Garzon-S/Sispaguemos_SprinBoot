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
        respuesta.put("nombreUsuario", usuario.getNombreUsuario());
        respuesta.put("apellidoUsuario", usuario.getApellidoUsuario());
        respuesta.put("correo", usuario.getCorreo());
        respuesta.put("estado", usuario.getEstado());
        respuesta.put("fechaRegistro", usuario.getFechaRegistro());
        respuesta.put("imagenPerfil", usuario.getImagenPerfil());
        respuesta.put("fkIdRol", usuario.getFkIdRol());
        
        // Asignación directa del rol según el ID almacenado en la base de datos
        String nombreRol = "Cliente";
        if (usuario.getFkIdRol() != null) {
            if (usuario.getFkIdRol() == 1) {
                nombreRol = "Administrador";
            } else if (usuario.getFkIdRol() == 2) {
                nombreRol = "Vendedor";
            } else if (usuario.getFkIdRol() == 3) {
                nombreRol = "Cliente";
            }
        }
        respuesta.put("rol", nombreRol);
        
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
        try {
            String correo = payload.get("correo") != null ? payload.get("correo") : payload.get("correo_usuario");
            String contrasena = payload.get("contrasena");

            if (correo == null || contrasena == null || correo.isBlank() || contrasena.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Correo y contraseña son obligatorios"));
            }

            Optional<Usuario> usuario = usuarioService.autenticar(correo.trim(), contrasena);
            if (usuario.isEmpty()) {
                return ResponseEntity.status(401).body(Map.of("error", "Credenciales inválidas o correo no registrado"));
            }

            Usuario usuarioLogueado = usuario.get();
            return ResponseEntity.ok(crearRespuestaUsuario(usuarioLogueado));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error interno en el servidor: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/register", consumes = "application/json")
    public ResponseEntity<?> registrarUsuario(@RequestBody Map<String, String> payload) {
        String nombreUsuario = payload.get("nombreUsuario");
        String apellidoUsuario = payload.get("apellidoUsuario");
        String correo = payload.get("correo");
        String contrasena = payload.get("contrasena");

        if (nombreUsuario == null || apellidoUsuario == null || correo == null || contrasena == null) {
            return ResponseEntity.badRequest().body("Faltan datos para registrar el usuario");
        }

        if (usuarioService.obtenerPorCorreo(correo).isPresent()) {
            return ResponseEntity.status(409).body("El correo ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNombreUsuario(nombreUsuario.trim());
        usuario.setApellidoUsuario(apellidoUsuario.trim());
        usuario.setCorreo(correo.trim().toLowerCase());
        usuario.setContrasena(contrasena);
        usuario.setEstado(payload.getOrDefault("estado", "Activo"));
        usuario.setFkIdRol(Integer.parseInt(payload.getOrDefault("fkIdRol", "3")));

        Usuario usuarioGuardado = usuarioService.guardarUsuario(usuario);
        return ResponseEntity.ok(crearRespuestaUsuario(usuarioGuardado));
    }

    @PostMapping(value = "/register", consumes = "multipart/form-data")
    public ResponseEntity<?> registrarUsuarioMultipart(
            @RequestParam("nombreUsuario") String nombreUsuario,
            @RequestParam("apellidoUsuario") String apellidoUsuario,
            @RequestParam("correo") String correo,
            @RequestParam(value = "contrasena", required = false) String contrasena,
            @RequestParam(value = "estado", defaultValue = "Activo") String estado,
            @RequestParam(value = "fkIdRol", defaultValue = "3") String fkIdRolStr,
            @RequestParam(value = "imagenPerfil", required = false) MultipartFile imagenPerfil) {
        try {
            if (nombreUsuario == null || apellidoUsuario == null || correo == null || contrasena == null) {
                return ResponseEntity.badRequest().body("Faltan datos para registrar el usuario");
            }

            if (usuarioService.obtenerPorCorreo(correo).isPresent()) {
                return ResponseEntity.status(409).body("El correo ya está registrado");
            }

            Usuario usuario = new Usuario();
            usuario.setNombreUsuario(nombreUsuario.trim());
            usuario.setApellidoUsuario(apellidoUsuario.trim());
            usuario.setCorreo(correo.trim().toLowerCase());
            usuario.setContrasena(contrasena);
            usuario.setEstado(estado);
            usuario.setFkIdRol(Integer.parseInt(fkIdRolStr));

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
            @RequestParam("nombreUsuario") String nombreUsuario,
            @RequestParam("apellidoUsuario") String apellidoUsuario,
            @RequestParam("correo") String correo,
            @RequestParam("contrasena") String contrasena,
            @RequestParam("estado") String estado,
            @RequestParam(value = "fkIdRol", defaultValue = "3") String fkIdRolStr,
            @RequestParam(value = "imagenPerfil", required = false) MultipartFile imagenPerfil) {
        try {
            if (contrasena == null || contrasena.isBlank()) {
                return ResponseEntity.badRequest().body("La contraseña es obligatoria");
            }

            Usuario usuario = new Usuario();
            usuario.setNombreUsuario(nombreUsuario);
            usuario.setApellidoUsuario(apellidoUsuario);
            usuario.setCorreo(correo);
            usuario.setContrasena(contrasena);
            usuario.setEstado(estado);
            usuario.setFkIdRol(Integer.parseInt(fkIdRolStr));

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
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al guardar el usuario: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarUsuario(
            @PathVariable Integer id,
            @RequestParam("nombreUsuario") String nombreUsuario,
            @RequestParam("apellidoUsuario") String apellidoUsuario,
            @RequestParam("correo") String correo,
            @RequestParam(value = "contrasena", required = false) String contrasena,
            @RequestParam("estado") String estado,
            @RequestParam(value = "imagenPerfil", required = false) MultipartFile imagenPerfil) {
        try {
            Usuario usuarioExistente = usuarioService.obtenerPorId(id)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            usuarioExistente.setNombreUsuario(nombreUsuario);
            usuarioExistente.setApellidoUsuario(apellidoUsuario);
            usuarioExistente.setCorreo(correo);
            if (contrasena != null && !contrasena.isBlank()) {
                usuarioExistente.setContrasena(contrasena);
            }
            usuarioExistente.setEstado(estado);

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