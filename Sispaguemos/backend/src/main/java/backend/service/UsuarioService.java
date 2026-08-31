package backend.service;

import backend.model.Rol;
import backend.model.Usuario;
import backend.model.UsuarioRol;
import backend.repository.RolRepository;
import backend.repository.UsuarioRepository;
import backend.repository.UsuarioRolRepository;
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

    @Autowired
    private UsuarioRolRepository usuarioRolRepository;

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

        Usuario usuarioGuardado = usuarioRepository.save(usuario);

        Rol rolCliente = rolRepository.findByNomRol("Cliente")
                .orElseGet(() -> rolRepository.findById(3).orElse(null));

        if (rolCliente != null) {
            UsuarioRol usuarioRol = new UsuarioRol(usuarioGuardado.getId(), rolCliente.getIdRol());
            usuarioRolRepository.save(usuarioRol);
        }

        return usuarioGuardado;
    }

    public Usuario actualizarUsuario(Integer id, Usuario datosUsuario) {
        return usuarioRepository.findById(id).map(usuario -> {
            usuario.setPrimerNom(datosUsuario.getPrimerNom());
            usuario.setSegundNom(datosUsuario.getSegundNom());
            usuario.setPrimerApelli(datosUsuario.getPrimerApelli());
            usuario.setSegundApelli(datosUsuario.getSegundApelli());
            usuario.setCorreo(datosUsuario.getCorreo());
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

        return usuarioRolRepository.findByFkIdUsuario(idUsuario)
                .map(UsuarioRol::getFkIdRol)
                .flatMap(rolRepository::findById)
                .map(Rol::getNomRol)
                .orElse("Cliente");
    }

    public void asignarRolCliente(Integer idUsuario) {
        Rol rolCliente = rolRepository.findByNomRol("Cliente")
                .orElseGet(() -> rolRepository.findById(3).orElse(null));

        if (rolCliente != null) {
            UsuarioRol usuarioRol = new UsuarioRol(idUsuario, rolCliente.getIdRol());
            usuarioRolRepository.save(usuarioRol);
        }
    }

    public void eliminarUsuario(Integer id) {
        usuarioRepository.deleteById(id);
    }
}
