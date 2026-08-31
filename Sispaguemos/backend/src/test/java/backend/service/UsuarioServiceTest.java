package backend.service;

import backend.model.Rol;
import backend.model.Usuario;
import backend.model.UsuarioRol;
import backend.repository.RolRepository;
import backend.repository.UsuarioRepository;
import backend.repository.UsuarioRolRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private RolRepository rolRepository;

    @Mock
    private UsuarioRolRepository usuarioRolRepository;

    @InjectMocks
    private UsuarioService usuarioService;

    @Test
    void autenticarDebeRetornarUsuarioCuandoCredencialesSonValidas() {
        Usuario usuario = new Usuario();
        usuario.setId(1);
        usuario.setCorreo("ana@correo.com");
        usuario.setContrasena("123456");
        usuario.setPrimerNom("Ana");
        usuario.setPrimerApelli("García");
        usuario.setEstado(1);

        when(usuarioRepository.findByCorreoAndContrasena("ana@correo.com", "123456"))
                .thenReturn(Optional.of(usuario));

        Optional<Usuario> resultado = usuarioService.autenticar("ana@correo.com", "123456");

        assertTrue(resultado.isPresent());
        assertEquals("ana@correo.com", resultado.get().getCorreo());
    }

    @Test
    void obtenerRolPorUsuarioDebeRetornarClienteCuandoExisteRelacion() {
        when(usuarioRolRepository.findByFkIdUsuario(7))
                .thenReturn(Optional.of(new UsuarioRol(7, 3)));
        when(rolRepository.findById(3))
                .thenReturn(Optional.of(new Rol(3, "Cliente", 1)));

        String rol = usuarioService.obtenerRolPorUsuarioId(7);

        assertEquals("Cliente", rol);
    }
}
