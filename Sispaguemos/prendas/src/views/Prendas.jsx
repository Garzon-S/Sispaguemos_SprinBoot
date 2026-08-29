import { useEffect, useState } from 'react';
import { 
  obtenerPrendas, crearPrenda, actualizarPrenda, eliminarPrenda,
  obtenerTiposPrenda, obtenerColores 
} from '../services/prendaService';
import '../styles/prendas.css';

function InventarioPrendas() {
  const [prendas, setPrendas] = useState([]);
  const [tiposPrenda, setTiposPrenda] = useState([]);
  const [colores, setColores] = useState([]);
  const [error, setError] = useState('');
  
  const [busqueda, setBusqueda] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  
  // Estado para controlar si el modal está abierto o cerrado
  const [mostrarModal, setMostrarModal] = useState(false);
  
  // Estado para previsualizar la imagen seleccionada
  const [previewImg, setPreviewImg] = useState(null);
  
  const [nuevaPrenda, setNuevaPrenda] = useState({
    id_prenda: '', // Funciona como código de barras en la interfaz
    nombre_prend: '',
    descripcion_prend: '',
    genero: 'Unisex',
    precio_venta: '',
    cantidad_disponible_venta: '',
    estado: 1,
    fk_idt_prendas: '',
    fk_id_color: '',
    imagen_prend: null 
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const dataPrendas = await obtenerPrendas();
      const dataTipos = await obtenerTiposPrenda();
      const dataColores = await obtenerColores();

      setPrendas(dataPrendas);
      setTiposPrenda(dataTipos);
      setColores(dataColores);
      setError('');
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError('No se pudo conectar con el servidor.');
    }
  };

  const handleChange = (e) => {
    setNuevaPrenda({
      ...nuevaPrenda,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNuevaPrenda({ ...nuevaPrenda, imagen_prend: reader.result });
        setPreviewImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const prendaData = {
        id_prenda: nuevaPrenda.id_prenda, // Código de barras
        nombre_prend: nuevaPrenda.nombre_prend,
        descripcion_prend: nuevaPrenda.descripcion_prend,
        genero: nuevaPrenda.genero,
        precio_venta: Number(nuevaPrenda.precio_venta),
        cantidad_disponible_venta: Number(nuevaPrenda.cantidad_disponible_venta),
        estado: Number(nuevaPrenda.estado),
        fk_idt_prendas: Number(nuevaPrenda.fk_idt_prendas),
        fk_id_color: Number(nuevaPrenda.fk_id_color),
        imagen_prend: nuevaPrenda.imagen_prend || null 
      };

      console.log("Enviando JSON al backend:", prendaData);

      if (editandoId) {
        await actualizarPrenda(editandoId, prendaData);
        alert('Prenda actualizada con éxito');
      } else {
        await crearPrenda(prendaData);
        alert('Prenda creada con éxito');
      }
      
      limpiarFormulario();
      cargarDatos();
    } catch (err) {
      console.error("Error al guardar prenda:", err);
      alert('Error al guardar la prenda. Revisa la consola.');
    }
  };

  const iniciarEdicion = (p) => {
    const idUnico = p.idPrenda || p.id_prenda;
    setEditandoId(idUnico);
    setNuevaPrenda({
      id_prenda: idUnico || '',
      nombre_prend: p.nombrePrend || p.nombre_prend || '',
      descripcion_prend: p.descripcionPrend || p.descripcion_prend || '',
      genero: p.genero || 'Unisex',
      precio_venta: p.precioVenta || p.precio_venta || '',
      cantidad_disponible_venta: p.cantidadDisponibleVenta || p.cantidad_disponible_venta || '',
      estado: p.estado || 1,
      fk_idt_prendas: p.fkIdtPrendas || p.fk_idt_prendas || '',
      fk_id_color: p.fkIdColor || p.fk_id_color || '',
      imagen_prend: p.imagenPrend || p.imagen_prend || null
    });
    setPreviewImg(p.imagenPrend || p.imagen_prend || null);
    setMostrarModal(true);
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setNuevaPrenda({
      id_prenda: '',
      nombre_prend: '',
      descripcion_prend: '',
      genero: 'Unisex',
      precio_venta: '',
      cantidad_disponible_venta: '',
      estado: 1,
      fk_idt_prendas: '',
      fk_id_color: '',
      imagen_prend: null
    });
    setPreviewImg(null);
    setMostrarModal(false);
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta prenda?')) {
      try {
        await eliminarPrenda(id);
        cargarDatos();
      } catch (err) {
        console.error("Error al eliminar:", err);
        alert('No se pudo eliminar la prenda');
      }
    }
  };

  const prendasFiltradas = prendas.filter((p) => {
    const nombre = (p.nombrePrend || p.nombre_prend || '').toLowerCase();
    const codigo = String(p.idPrenda || p.id_prenda || '').toLowerCase();
    const textoBusqueda = busqueda.toLowerCase();
    return nombre.includes(textoBusqueda) || codigo.includes(textoBusqueda);
  });

  return (
    <div className="inventario-container">
      {/* HEADER TIPO DASHBOARD */}
      <div className="dashboard-header">
        <div>
          <h1>Catálogo / Inventario</h1>
          <p>Controla tus productos, ventas y movimientos.</p>
        </div>
        <button className="btn-agregar" onClick={() => setMostrarModal(true)}>
          + Agregar Prenda
        </button>
      </div>

      <div className="search-bar">
        <input 
          type="text" 
          placeholder="🔍 Buscar por nombre o código de barras..." 
          value={busqueda} 
          onChange={(e) => setBusqueda(e.target.value)} 
        />
      </div>

      {error && <p className="error-msg">{error}</p>}

      {/* REJILLA DE TARJETAS */}
      <div className="grid-prendas">
        {prendasFiltradas.length === 0 ? (
          <p>No se encontraron prendas.</p>
        ) : (
          prendasFiltradas.map((p) => (
            <div className="card-prenda" key={p.idPrenda || p.id_prenda}>
              <div className="card-img-container">
                <img 
                  src={p.imagenPrend || p.imagen_prend || "https://via.placeholder.com/150"} 
                  alt={p.nombrePrend || p.nombre_prend} 
                />
              </div>
              <div className="card-info">
                <h3>{p.nombrePrend || p.nombre_prend}</h3>
                <h3 className="precio">${Number(p.precioVenta || p.precio_venta || 0).toLocaleString()}</h3>
                
                <div className="card-stats">
                  <span>Disp. Web: {p.cantidadDisponibleVenta || p.cantidad_disponible_venta}</span>
                  <span>Género: {p.genero}</span> 
                </div>

                <div className="card-actions">
                  <span className="badge-activo">Activo</span>
                  <div className="action-buttons">
                    <button onClick={() => iniciarEdicion(p)} className="btn-texto">Editar</button>
                    <button onClick={() => handleEliminar(p.idPrenda || p.id_prenda)} className="btn-texto error">Eliminar</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* POP-UP / MODAL DEL FORMULARIO */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editandoId ? 'Editar Prenda' : 'Nueva Prenda'}</h2>
              <button className="btn-cerrar" onClick={limpiarFormulario}>X</button>
            </div>
            
            <form onSubmit={handleSubmit} className="form-grid">
              
              {/* SUBIDA DE IMAGEN */}
              <div className="form-group full-width text-center">
                <label>IMAGEN DE LA PRENDA</label>
                <div className="image-upload-wrapper">
                  {previewImg && <img src={previewImg} alt="Preview" className="img-preview" />}
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                </div>
              </div>

              {/* CÓDIGO DE BARRAS / ID */}
              <div className="form-group full-width">
                <label>CÓDIGO DE BARRAS *</label>
                <input 
                  type="text" 
                  name="id_prenda" 
                  maxLength="25" 
                  placeholder="Escanea o escribe el código..." 
                  value={nuevaPrenda.id_prenda} 
                  onChange={handleChange} 
                  disabled={editandoId !== null} // Bloqueado si está editando para conservar la PK
                  required 
                />
              </div>

              {/* NOMBRE */}
              <div className="form-group full-width">
                <label>NOMBRE * (Máx 50)</label>
                <input type="text" name="nombre_prend" maxLength="50" placeholder="Ej: Camiseta Básica" value={nuevaPrenda.nombre_prend} onChange={handleChange} required />
              </div>

              {/* DESCRIPCIÓN */}
              <div className="form-group full-width">
                <label>DESCRIPCIÓN</label>
                <input type="text" name="descripcion_prend" placeholder="Breve descripción..." value={nuevaPrenda.descripcion_prend} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>PRECIO DE VENTA (COP) *</label>
                <input type="number" step="0.01" name="precio_venta" value={nuevaPrenda.precio_venta} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>CANTIDAD DISPONIBLE WEB *</label>
                <input type="number" name="cantidad_disponible_venta" value={nuevaPrenda.cantidad_disponible_venta} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>GÉNERO *</label>
                <select name="genero" value={nuevaPrenda.genero} onChange={handleChange} required>
                  <option value="Hombre">Hombre</option>
                  <option value="Mujer">Mujer</option>
                  <option value="Niño">Niño</option>
                  <option value="Niña">Niña</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>

              <div className="form-group">
                <label>TALLA *</label>
                <select name="fk_idt_prendas" value={nuevaPrenda.fk_idt_prendas} onChange={handleChange} required>
                  <option value="">Seleccione...</option>
                  {tiposPrenda.map((t) => <option key={t.idtPrendas || t.id_t_prendas} value={t.idtPrendas || t.id_t_prendas}>{t.tallaPrend || `Talla ${t.idtPrendas}`}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>COLOR *</label>
                <select name="fk_id_color" value={nuevaPrenda.fk_id_color} onChange={handleChange} required>
                  <option value="">Seleccione...</option>
                  {colores.map((c) => <option key={c.idColor || c.id_color} value={c.idColor || c.id_color}>{c.nomColor || `Color ${c.idColor}`}</option>)}
                </select>
              </div>

              <div className="form-actions full-width">
                <button type="submit" className="btn-primary">
                  {editandoId ? 'Guardar Cambios' : 'Registrar Prenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventarioPrendas;