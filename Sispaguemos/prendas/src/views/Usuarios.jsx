import { useEffect, useState } from 'react';
import { 
  obtenerUsuarios, crearUsuario, actualizarUsuario 
} from '../services/usuarioService';
import '../App.css';

const palette = {
  fucsia: '#e63982',
  fucsiaDark: '#c02563',
  plum: '#2b1830',
  cream: '#fdf6f1',
  sand: '#f3e7dd',
  gold: '#c9973f',
  sage: '#7c9885',
  ink: '#231421',
  slate: '#5b4a56',
  white: '#ffffff',
  border: '#eadfe6',
  soft: '#f7f1f4',
  success: '#1f9d63',
  danger: '#df4b64',
  info: '#dfeafc',
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [formData, setFormData] = useState({
    primerNom: '',
    segundNom: '',
    primerApelli: '',
    segundApelli: '',
    correo: '',
    contrasena: '',
    imagenPerfil: null
  });
  const [previewImagen, setPreviewImagen] = useState(null);
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const data = await obtenerUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'imagenPerfil') {
      const file = e.target.files[0];
      
      if (file && file.size > 500 * 1024) {
        alert('La imagen es demasiado grande. El tamaño máximo es 500KB');
        e.target.value = '';
        setFormData({
          ...formData,
          imagenPerfil: null
        });
        setPreviewImagen(null);
        return;
      }

      setFormData({
        ...formData,
        imagenPerfil: file
      });
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImagen(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      if (['primerNom', 'segundNom', 'primerApelli', 'segundApelli'].includes(name)) {
        const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
        if (value.length <= 30 && soloLetras.test(value)) {
          setFormData({
            ...formData,
            [name]: value
          });
        }
      } else if (name === 'correo') {
        if (value.length <= 50) {
          setFormData({
            ...formData,
            [name]: value
          });
        }
      } else if (name === 'contrasena') {
        if (value.length <= 30) {
          setFormData({
            ...formData,
            [name]: value
          });
        }
      } else {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.primerNom.trim() || !formData.primerApelli.trim() || !formData.correo.trim()) {
      alert('Por favor completa los campos obligatorios (Primer Nombre, Primer Apellido, Correo)');
      return;
    }

    if (!editandoId && (!formData.contrasena || !formData.contrasena.trim())) {
      alert('La contraseña es obligatoria para crear un usuario.');
      return;
    }

    try {
      // Creamos un objeto FormData para enviar archivos y texto correctamente
      const dataToSend = new FormData();
      dataToSend.append('primerNom', formData.primerNom);
      dataToSend.append('segundNom', formData.segundNom || '');
      dataToSend.append('primerApelli', formData.primerApelli);
      dataToSend.append('segundApelli', formData.segundApelli || '');
      dataToSend.append('correo', formData.correo);
      if (formData.contrasena && formData.contrasena.trim()) {
        dataToSend.append('contrasena', formData.contrasena);
      }
      dataToSend.append('estado', 1);

      // Solo agregamos la imagen si el usuario seleccionó una nueva
      if (formData.imagenPerfil) {
        dataToSend.append('imagenPerfil', formData.imagenPerfil);
      }

      if (editandoId) {
        await actualizarUsuario(editandoId, dataToSend);
        alert('Usuario actualizado exitosamente');
      } else {
        await crearUsuario(dataToSend);
        alert('Usuario creado exitosamente');
      }
      limpiarFormulario();
      cargarUsuarios();
    } catch (error) {
      console.error('Error al guardar el usuario:', error);
      alert('Error al guardar el usuario: ' + error.message);
    }
  };

  const handleEdit = (usuario) => {
    setEditandoId(usuario.id);
    setFormData({
      primerNom: usuario.primerNom || '',
      segundNom: usuario.segundNom || '',
      primerApelli: usuario.primerApelli || '',
      segundApelli: usuario.segundApelli || '',
      correo: usuario.correo || '',
      contrasena: '',
      imagenPerfil: null
    });
    if (usuario.imagenPerfil) {
      const imagenBase64 = `data:image/jpeg;base64,${usuario.imagenPerfil}`;
      setPreviewImagen(imagenBase64);
    } else {
      setPreviewImagen(null);
    }
  };

  const handleCambiarEstado = async (usuario) => {
    const nuevoEstado = usuario.estado === 1 ? 0 : 1;
    const mensaje = nuevoEstado === 0 ? '¿Deseas inactivar este usuario?' : '¿Deseas activar este usuario?';

    if (window.confirm(mensaje)) {
      try {
        await actualizarUsuario(usuario.id, {
          primerNom: usuario.primerNom,
          segundNom: usuario.segundNom,
          primerApelli: usuario.primerApelli,
          segundApelli: usuario.segundApelli,
          correo: usuario.correo,
          estado: nuevoEstado,
          imagenPerfil: null
        });
        cargarUsuarios();
      } catch (error) {
        console.error('Error al cambiar el estado del usuario:', error);
        alert('Error al cambiar el estado: ' + error.message);
      }
    }
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setFormData({
      primerNom: '',
      segundNom: '',
      primerApelli: '',
      segundApelli: '',
      correo: '',
      contrasena: '',
      imagenPerfil: null
    });
    setPreviewImagen(null);
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return true;
    
    const id = u.id ? u.id.toString() : '';
    const nombre = u.primerNom ? u.primerNom.toLowerCase() : '';
    const apellido = u.primerApelli ? u.primerApelli.toLowerCase() : '';

    return id.includes(termino) || nombre.includes(termino) || apellido.includes(termino);
  });

  const inputStyle = {
    width: '100%',
    padding: '0.8rem 1rem',
    borderRadius: '14px',
    border: `1.6px solid ${palette.border}`,
    backgroundColor: palette.cream,
    color: palette.ink,
    outline: 'none',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '2rem 1.5rem 3rem' }}>
      <div style={{
        backgroundColor: palette.white,
        borderRadius: '22px',
        padding: '2rem',
        boxShadow: '0 18px 42px rgba(43, 24, 48, 0.08)',
        marginBottom: '2rem',
        border: `1px solid ${palette.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${palette.fucsia}, ${palette.sage})`,
            boxShadow: '0 10px 24px rgba(230, 57, 130, 0.22)',
          }} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.7rem', color: palette.plum, fontWeight: '700' }}>
              {editandoId ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
            </h2>
            <span style={{ fontSize: '0.92rem', color: palette.slate }}>
              Completa los campos para registrar en la base de datos.
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: palette.plum, marginBottom: '0.45rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Primer Nombre *
              </label>
              <input type="text" name="primerNom" maxLength="30" value={formData.primerNom} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: palette.plum, marginBottom: '0.45rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Segundo Nombre
              </label>
              <input type="text" name="segundNom" maxLength="30" value={formData.segundNom} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: palette.plum, marginBottom: '0.45rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Primer Apellido *
              </label>
              <input type="text" name="primerApelli" maxLength="30" value={formData.primerApelli} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: palette.plum, marginBottom: '0.45rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Segundo Apellido
              </label>
              <input type="text" name="segundApelli" maxLength="30" value={formData.segundApelli} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: palette.plum, marginBottom: '0.45rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Correo Electrónico *
            </label>
            <input type="email" name="correo" maxLength="50" value={formData.correo} onChange={handleChange} required style={inputStyle} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: palette.plum, marginBottom: '0.45rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {editandoId ? 'Nueva Contraseña' : 'Contraseña *'}
            </label>
            <input
              type="password"
              name="contrasena"
              maxLength="30"
              value={formData.contrasena}
              onChange={handleChange}
              required={!editandoId}
              placeholder={editandoId ? 'Dejar en blanco para conservar la actual' : 'Ingresa la contraseña'}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: palette.plum, marginBottom: '0.45rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Foto de Perfil
              </label>
              <input type="file" name="imagenPerfil" accept="image/*" onChange={handleChange} style={{ ...inputStyle, padding: '0.7rem 0.8rem', cursor: 'pointer' }} />
            </div>
            {previewImagen && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', overflow: 'hidden', border: `2px solid ${palette.border}`, background: palette.soft }}>
                <img src={previewImagen} alt="Preview" style={{ maxHeight: '120px', maxWidth: '100%', objectFit: 'contain', padding: '0.3rem' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', alignItems: 'center' }}>
            <button type="submit" style={{
              background: `linear-gradient(135deg, ${palette.fucsia}, ${palette.fucsiaDark})`,
              color: palette.white,
              border: 'none',
              padding: '0.9rem 1.7rem',
              borderRadius: '14px',
              fontWeight: '800',
              fontSize: '0.96rem',
              cursor: 'pointer',
              boxShadow: '0 12px 24px rgba(230, 57, 130, 0.28)',
              minWidth: '180px',
            }}>
              {editandoId ? 'Guardar Cambios' : 'Guardar Usuario'}
            </button>
            {editandoId && (
              <button type="button" onClick={limpiarFormulario} style={{
                backgroundColor: palette.soft,
                color: palette.plum,
                border: `1.6px solid ${palette.border}`,
                padding: '0.9rem 1.2rem',
                borderRadius: '14px',
                fontWeight: '700',
                cursor: 'pointer',
              }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={{
        backgroundColor: palette.white,
        borderRadius: '22px',
        padding: '2rem',
        boxShadow: '0 18px 42px rgba(43, 24, 48, 0.08)',
        border: `1px solid ${palette.border}`,
      }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 1.5rem 0', color: palette.plum, fontSize: '2rem', fontWeight: '700' }}>
          Lista de Usuarios Registrados
        </h2>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <input 
            type="text" 
            placeholder="Buscar por ID o Nombre" 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)} 
            style={{ ...inputStyle, width: '52%', textAlign: 'center', backgroundColor: palette.soft }} 
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${palette.border}`, color: palette.slate, textTransform: 'uppercase', fontSize: '0.74rem', letterSpacing: '0.06em' }}>
                <th style={{ padding: '0.9rem 0.8rem' }}>ID</th>
                <th style={{ padding: '0.9rem 0.8rem' }}>Imagen</th>
                <th style={{ padding: '0.9rem 0.8rem' }}>Nombre Completo</th>
                <th style={{ padding: '0.9rem 0.8rem' }}>Correo</th>
                <th style={{ padding: '0.9rem 0.8rem' }}>Estado</th>
                <th style={{ padding: '0.9rem 0.8rem', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length > 0 ? (
                usuariosFiltrados.map((u) => (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${palette.soft}` }}>
                    <td style={{ padding: '0.9rem 0.8rem', color: palette.fucsiaDark, fontWeight: '800' }}>{u.id}</td>
                    <td style={{ padding: '0.9rem 0.8rem', textAlign: 'center' }}>
                      {u.imagenPerfil ? (
                        <img src={`data:image/jpeg;base64,${u.imagenPerfil}`} alt="Perfil" style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${palette.border}` }} />
                      ) : (
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: palette.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                          <span style={{ fontSize: '0.72rem', color: palette.slate, fontWeight: '700' }}>N/A</span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.9rem 0.8rem', color: palette.ink, fontWeight: '600' }}>
                      {`${u.primerNom || ''} ${u.segundNom || ''} ${u.primerApelli || ''} ${u.segundApelli || ''}`.trim() || '—'}
                    </td>
                    <td style={{ padding: '0.9rem 0.8rem', color: palette.slate }}>{u.correo}</td>
                    <td style={{ padding: '0.9rem 0.8rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.38rem 0.72rem',
                        borderRadius: '999px',
                        color: u.estado === 1 ? palette.success : palette.danger,
                        backgroundColor: u.estado === 1 ? '#eafaf3' : '#ffe7eb',
                        fontWeight: '800',
                        fontSize: '0.76rem',
                        letterSpacing: '0.04em',
                      }}>
                        {u.estado === 1 ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 0.8rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => handleEdit(u)} style={{
                          backgroundColor: palette.info,
                          color: palette.fucsiaDark,
                          border: 'none',
                          padding: '0.45rem 0.9rem',
                          borderRadius: '10px',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}>
                          Editar
                        </button>
                        <button onClick={() => handleCambiarEstado(u)} style={{
                          backgroundColor: u.estado === 1 ? '#ffe7eb' : '#e8f9ef',
                          color: u.estado === 1 ? palette.danger : palette.success,
                          border: 'none',
                          padding: '0.45rem 0.9rem',
                          borderRadius: '10px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          minWidth: '85px',
                        }}>
                          {u.estado === 1 ? 'Inactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '1.5rem', textAlign: 'center', color: palette.slate, fontWeight: '600' }}>
                    No se encontraron usuarios registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}