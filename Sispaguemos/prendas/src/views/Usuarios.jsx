import { useEffect, useState } from 'react';
import { 
  obtenerUsuarios, crearUsuario, actualizarUsuario 
} from '../services/usuarioService';
import '../App.css';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [formData, setFormData] = useState({
    primerNom: '',
    segundNom: '',
    primerApelli: '',
    segundApelli: '',
    correo: '',
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

    try {
      // Creamos un objeto FormData para enviar archivos y texto correctamente
      const dataToSend = new FormData();
      dataToSend.append('primerNom', formData.primerNom);
      dataToSend.append('segundNom', formData.segundNom || '');
      dataToSend.append('primerApelli', formData.primerApelli);
      dataToSend.append('segundApelli', formData.segundApelli || '');
      dataToSend.append('correo', formData.correo);
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
    padding: '0.65rem 0.8rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    color: '#334155',
    outline: 'none',
    fontSize: '0.9rem',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '1.5rem' }}>
      
      {/* FORMULARIO */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #3b82f6)'
          }} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>
              {editandoId ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
            </h2>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Completa los campos para registrar en la base de datos.
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Primer Nombre *
              </label>
              <input type="text" name="primerNom" maxLength="30" value={formData.primerNom} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Segundo Nombre
              </label>
              <input type="text" name="segundNom" maxLength="30" value={formData.segundNom} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Primer Apellido *
              </label>
              <input type="text" name="primerApelli" maxLength="30" value={formData.primerApelli} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Segundo Apellido
              </label>
              <input type="text" name="segundApelli" maxLength="30" value={formData.segundApelli} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Correo Electrónico *
              </label>
              <input type="email" name="correo" maxLength="50" value={formData.correo} onChange={handleChange} required style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Foto de Perfil
              </label>
              <input type="file" name="imagenPerfil" accept="image/*" onChange={handleChange} style={{ ...inputStyle, padding: '0.5rem 0.8rem', cursor: 'pointer' }} />
            </div>
            {previewImagen && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
                <img src={previewImagen} alt="Preview" style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              {editandoId ? 'Guardar Cambios' : 'Guardar Usuario'}
            </button>
            {editandoId && (
              <button type="button" onClick={limpiarFormulario} style={{ backgroundColor: '#94a3b8', color: '#fff', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* TABLA */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 1.5rem 0', color: '#1e293b', fontSize: '1.25rem' }}>
          Lista de Usuarios Registrados
        </h2>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <input 
            type="text" 
            placeholder="Buscar por ID o Nombre" 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)} 
            style={{ ...inputStyle, width: '50%', textAlign: 'center' }} 
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                <th style={{ padding: '0.75rem' }}>ID</th>
                <th style={{ padding: '0.75rem' }}>Imagen</th>
                <th style={{ padding: '0.75rem' }}>Nombre Completo</th>
                <th style={{ padding: '0.75rem' }}>Correo</th>
                <th style={{ padding: '0.75rem' }}>Estado</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length > 0 ? (
                usuariosFiltrados.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem', color: '#2563eb', fontWeight: 'bold' }}>{u.id}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {u.imagenPerfil ? (
                        <img src={`data:image/jpeg;base64,${u.imagenPerfil}`} alt="Perfil" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>N/A</span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#334155' }}>
                      {`${u.primerNom || ''} ${u.segundNom || ''} ${u.primerApelli || ''} ${u.segundApelli || ''}`}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#64748b' }}>{u.correo}</td>
                    <td style={{ padding: '0.75rem', color: u.estado === 1 ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                      {u.estado === 1 ? 'ACTIVO' : 'INACTIVO'}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', alignItems: 'center' }}>
                        <button onClick={() => handleEdit(u)} style={{ backgroundColor: '#dbeafe', color: '#2563eb', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                          Editar
                        </button>
                        <button onClick={() => handleCambiarEstado(u)} style={{ backgroundColor: u.estado === 1 ? '#ffe4e6' : '#dcfce7', color: u.estado === 1 ? '#e11d48' : '#15803d', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', minWidth: '70px' }}>
                          {u.estado === 1 ? 'Inactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>
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