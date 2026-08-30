package backend.service;

import backend.model.Usuario;
import backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<Usuario> obtenerTodos() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> obtenerPorId(Integer id) {
        return usuarioRepository.findById(id);
    }

    public Usuario guardarUsuario(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    public Usuario actualizarUsuario(Integer id, Usuario datosUsuario) {
        return usuarioRepository.findById(id).map(usuario -> {
            // Nota: Si los getters/setters en tu Usuario.java tienen otros nombres, 
            // ajusta las siguientes líneas según los atributos de tu entidad.
            usuario.setPrimerNom(datosUsuario.getPrimerNom());
            usuario.setSegundNom(datosUsuario.getSegundNom());
            usuario.setPrimerApelli(datosUsuario.getPrimerApelli());
            usuario.setSegundApelli(datosUsuario.getSegundApelli());
            usuario.setCorreo(datosUsuario.getCorreo());
            usuario.setEstado(datosUsuario.getEstado());
            return usuarioRepository.save(usuario);
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
    }

    public void eliminarUsuario(Integer id) {
        usuarioRepository.deleteById(id);
    }
}
