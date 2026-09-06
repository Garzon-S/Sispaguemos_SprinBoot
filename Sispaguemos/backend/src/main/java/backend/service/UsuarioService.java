package backend.service;

import backend.model.Rol;
import backend.model.Usuario;
import backend.repository.RolRepository;
import backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    private static final Integer ID_ROL_CLIENTE_DEFAULT = 3; // ajustar si tu ID de "Cliente" es distinto

    public List<Usuario> obtenerTodos() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> obtenerPorId(Integer id) {
        return usuarioRepository.findById(id);
    }

    public Optional<Usuario> obtenerPorCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo.trim().toLowerCase());
    }

    public Optional<Usuario> autenticar(String correo, String contrasena) {
        if (correo == null || contrasena == null) {
            return Optional.empty();
        }
        return usuarioRepository.findByCorreoAndContrasena(correo.trim().toLowerCase(), contrasena);
    }

    public Usuario guardarUsuario(Usuario usuario) {
        if (usuario.getCorreo() != null) {
            usuario.setCorreo(usuario.getCorreo().trim().toLowerCase());
        }

        // Si no viene un rol asignado desde el frontend, asigna "Cliente" por defecto
        if (usuario.getFkIdRol() == null) {
            Rol rolCliente = rolRepository.findByNomRol("Cliente")
                    .orElseGet(() -> rolRepository.findById(ID_ROL_CLIENTE_DEFAULT).orElse(null));
            if (rolCliente != null) {
                usuario.setFkIdRol(rolCliente.getIdRol());
            }
        }

        return usuarioRepository.save(usuario);
    }

    public Usuario actualizarUsuario(Integer id, Usuario datosUsuario) {
        return usuarioRepository.findById(id).map(usuario -> {
            usuario.setNombreUsuario(datosUsuario.getNombreUsuario());
            usuario.setApellidoUsuario(datosUsuario.getApellidoUsuario());
            usuario.setCorreo(datosUsuario.getCorreo());
            usuario.setTelefono(datosUsuario.getTelefono());
            usuario.setDireccion(datosUsuario.getDireccion());
            usuario.setEstado(datosUsuario.getEstado());

            if (datosUsuario.getContrasena() != null && !datosUsuario.getContrasena().isBlank()) {
                usuario.setContrasena(datosUsuario.getContrasena());
            }
            return usuarioRepository.save(usuario);
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
    }

    public String obtenerRolPorUsuarioId(Integer idUsuario) {
        if (idUsuario == null) {
            return "Cliente";
        }

        return usuarioRepository.findById(idUsuario)
                .map(Usuario::getFkIdRol)
                .flatMap(rolRepository::findById)
                .map(Rol::getNomRol)
                .orElse("Cliente");
    }

    public void asignarRolCliente(Integer idUsuario) {
        Rol rolCliente = rolRepository.findByNomRol("Cliente")
                .orElseGet(() -> rolRepository.findById(ID_ROL_CLIENTE_DEFAULT).orElse(null));

        if (rolCliente != null) {
            usuarioRepository.findById(idUsuario).ifPresent(usuario -> {
                usuario.setFkIdRol(rolCliente.getIdRol());
                usuarioRepository.save(usuario);
            });
        }
    }

    public void eliminarUsuario(Integer id) {
        usuarioRepository.deleteById(id);
    }
}
