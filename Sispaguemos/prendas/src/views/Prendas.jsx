import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  obtenerPrendas, crearPrenda, actualizarPrenda, 
  obtenerTiposPrenda, obtenerColores 
} from '../services/prendaService';
import '../styles/prendas.css';

function InventarioPrendas() {
  const [modalError, setModalError] = useState('');
  const [prendas, setPrendas] = useState([]);
  const [tiposPrenda, setTiposPrenda] = useState([]);
  const [colores, setColores] = useState([]);
  const [error, setError] = useState('');
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroGenero, setFiltroGenero] = useState('Todos');
  const [mostrarInactivas, setMostrarInactivas] = useState(false); // Estado para alternar inactivas
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  
  const [nuevaPrenda, setNuevaPrenda] = useState({
    id_prenda: '',
    nombre_prend: '',
    descripcion_prend: '',
    genero: 'Unisex',
    precio_venta: '',
    cantidad_disponible_venta: '',
    estado: 0, // Nace inactiva por defecto
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
    const { name, value } = e.target;
    setNuevaPrenda({
      ...nuevaPrenda,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 10) {
        setModalError('⚠️ La imagen pesa más de 10 MB permitidos.');
        e.target.value = '';
        return;
      }
      setModalError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setNuevaPrenda((prev) => ({ ...prev, imagen_prend: reader.result }));
        setPreviewImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    
    const precio = Number(nuevaPrenda.precio_venta);
    const cantidad = Number(nuevaPrenda.cantidad_disponible_venta);

    if (precio < 5000 || precio > 5000000) {
      setModalError('⚠️ El precio de venta debe estar entre $5,000 y $5,000,000.');
      return;
    }

    if (cantidad < 0 || cantidad > 20) {
      setModalError('⚠️ La cantidad disponible web debe estar entre 0 y un máximo de 20 prendas.');
      return;
    }

    try {
      const prendaData = {
        id_prenda: nuevaPrenda.id_prenda,
        nombre_prend: nuevaPrenda.nombre_prend,
        descripcion_prend: nuevaPrenda.descripcion_prend,
        genero: nuevaPrenda.genero,
        precio_venta: precio,
        cantidad_disponible_venta: cantidad,
        estado: Number(nuevaPrenda.estado),
        fk_idt_prendas: Number(nuevaPrenda.fk_idt_prendas),
        fk_id_color: Number(nuevaPrenda.fk_id_color),
        imagen_prend: nuevaPrenda.imagen_prend || null 
      };

      if (editandoId) {
        await actualizarPrenda(editandoId, prendaData);
        alert('Prenda actualizada con éxito');
      } else {
        await crearPrenda(prendaData);
        alert('Prenda creada con éxito. Estará inactiva hasta que tenga registro en bodega.');
      }
      
      limpiarFormulario();
      cargarDatos();
    } catch (err) {
      console.error("Error al guardar prenda:", err);
      setModalError('❌ Error al guardar la prenda en el servidor.');
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
      estado: p.estado ?? 0,
      fk_idt_prendas: p.fkIdtPrendas || p.fk_idt_prendas || '',
      fk_id_color: p.fkIdColor || p.fk_id_color || '',
      imagen_prend: p.imagenPrend || p.imagen_prend || null
    });
    setPreviewImg(p.imagenPrend || p.imagen_prend || null);
    setModalError('');
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
      estado: 0,
      fk_idt_prendas: '',
      fk_id_color: '',
      imagen_prend: null
    });
    setPreviewImg(null);
    setModalError('');
    setMostrarModal(false);
  };

  // Función para Inactivar prenda lógicamente (Estado 0)
  const handleInactivar = async (id) => {
    if (window.confirm('¿Estás seguro de inactivar esta prenda?')) {
      try {
        await axios.put(`http://localhost:8080/api/prendas/${id}/inactivar`);
        cargarDatos();
      } catch (err) {
        console.error("Error al inactivar:", err);
        alert('No se pudo inactivar la prenda');
      }
    }
  };

  // Función para Activar prenda lógicamente (Estado 1)
  const handleActivar = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/prendas/${id}/activar`);
      cargarDatos();
    } catch (err) {
      console.error("Error al activar:", err);
      alert('No se pudo activar la prenda');
    }
  };

  const prendasFiltradas = prendas.filter((p) => {
    const nombre = (p.nombrePrend || p.nombre_prend || '').toLowerCase();
    const codigo = String(p.idPrenda || p.id_prenda || '').toLowerCase();
    const textoBusqueda = busqueda.toLowerCase();
    
    const cumpleTexto = nombre.includes(textoBusqueda) || codigo.includes(textoBusqueda);
    const cumpleGenero = filtroGenero === 'Todos' || p.genero === filtroGenero;
    const estadoPrenda = p.estado ?? 0;
    const cumpleEstado = mostrarInactivas ? estadoPrenda === 0 : estadoPrenda === 1;
    
    return cumpleTexto && cumpleGenero && cumpleEstado;
  });

  return (
    <div className="inventario-content">
      {/* MÉTRICAS / DASHBOARD HEADER */}
      <div className="dashboard-cards-grid">
        <div className="dash-card">
          <h3>PANEL</h3>
          <h1>Dashboard</h1>
          <p>Controla tus productos, ventas y movimientos desde un panel limpio en rosado.</p>
        </div>
        <div className="metric-card">
          <small>TOTAL PRODUCTOS</small>
          <h2>{prendas.length}</h2>
        </div>
        <div className="metric-card">
          <small>PRODUCTOS ACTIVOS</small>
          <h2>{prendas.filter(p => (p.estado ?? 0) === 1).length}</h2>
        </div>
        <div className="metric-card">
          <small>PRODUCTOS INACTIVOS</small>
          <h2>{prendas.filter(p => (p.estado ?? 0) === 0).length}</h2>
        </div>
      </div>

      {/* SECCIÓN DE CATÁLOGO */}
      <div className="catalogo-header-section">
        <h2>Catálogo de Prendas {mostrarInactivas ? '(Inactivas)' : '(Activas)'}</h2>
        <div className="action-header-buttons" style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-secundario" 
            onClick={() => setMostrarInactivas(!mostrarInactivas)}
            style={{ background: '#6c757d', color: '#fff' }}
          >
            {mostrarInactivas ? 'Ver Prendas Activas' : 'Prendas Inactivas'}
          </button>
          <button className="btn-agregar" onClick={() => { limpiarFormulario(); setMostrarModal(true); }}>
            + Agregar Prenda
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="filter-search-row">
        <div className="search-box-group">
          <label>BUSCAR POR CÓDIGO DE BARRAS O NOMBRE</label>
          <input 
            type="text" 
            placeholder="Ej: 7701234567890..." 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)} 
          />
        </div>
        <div className="filter-box-group">
          <label>FILTRAR POR GÉNERO</label>
          <select value={filtroGenero} onChange={(e) => setFiltroGenero(e.target.value)}>
            <option value="Todos">Todos los géneros</option>
            <option value="Hombre">Hombre</option>
            <option value="Mujer">Mujer</option>
            <option value="Niño">Niño</option>
            <option value="Niña">Niña</option>
            <option value="Unisex">Unisex</option>
          </select>
        </div>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {/* REJILLA DE TARJETAS DE PRENDAS */}
      <div className="grid-prendas">
        {prendasFiltradas.length === 0 ? (
          <p className="no-data">No se encontraron prendas {mostrarInactivas ? 'inactivas' : 'activas'}.</p>
        ) : (
          prendasFiltradas.map((p) => {
            const estadoActual = p.estado ?? 0;
            return (
              <div className="card-prenda-clean" key={p.idPrenda || p.id_prenda}>
                <div className="card-img-wrap">
                  <img 
                    src={p.imagenPrend || p.imagen_prend || "https://via.placeholder.com/150"} 
                    alt={p.nombrePrend || p.nombre_prend} 
                  />
                </div>
                <div className="card-details">
                  <div className="card-title-price">
                    <h4>{p.nombrePrend || p.nombre_prend}</h4>
                    <span className="precio-tag">${Number(p.precioVenta || p.precio_venta || 0).toLocaleString()}</span>
                  </div>
                  <p className="codigo-txt">Código: {p.idPrenda || p.id_prenda}</p>
                  
                  <div className="card-meta-row">
                    <span className="meta-badge">Stock: {p.cantidadDisponibleVenta || p.cantidad_disponible_venta}</span>
                    <span className="meta-badge">Género: {p.genero}</span> 
                  </div>

                  <div className="card-footer-row">
                    <span style={{ color: estadoActual === 1 ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                      {estadoActual === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                    <div className="card-btns">
                      <button onClick={() => iniciarEdicion(p)} className="btn-accion-txt">Editar</button>
                      {estadoActual === 1 ? (
                        <button onClick={() => handleInactivar(p.idPrenda || p.id_prenda)} className="btn-accion-txt eliminar" style={{ color: '#ffc107' }}>Inactivar</button>
                      ) : (
                        <button onClick={() => handleActivar(p.idPrenda || p.id_prenda)} className="btn-accion-txt" style={{ color: '#28a745' }}>Activar</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL / POP-UP */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content-wide">
            <div className="modal-header">
              <h2>{editandoId ? 'Editar Prenda' : 'Registrar Nueva Prenda'}</h2>
              <button className="btn-cerrar" onClick={limpiarFormulario}>✕</button>
            </div>
            
            {modalError && (
              <div className="modal-alert-error">
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="form-grid-wide">
              <div className="form-group span-2 text-center">
                <label>IMAGEN DE LA PRENDA (Máx. 10 MB)</label>
                <div className="image-upload-wrapper">
                  {previewImg && <img src={previewImg} alt="Preview" className="img-preview" />}
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                </div>
              </div>

              <div className="form-group">
                <label>CÓDIGO DE BARRAS *</label>
                <input 
                  type="text" 
                  name="id_prenda" 
                  maxLength="25" 
                  placeholder="Ej: 7701234500011" 
                  value={nuevaPrenda.id_prenda} 
                  onChange={handleChange} 
                  disabled={editandoId !== null} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>NOMBRE DE LA PRENDA * (Máx 50)</label>
                <input 
                  type="text" 
                  name="nombre_prend" 
                  maxLength="50" 
                  placeholder="Ej: Jeans Regular Fit" 
                  value={nuevaPrenda.nombre_prend} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="form-group span-2">
                <label>DESCRIPCIÓN</label>
                <input 
                  type="text" 
                  name="descripcion_prend" 
                  placeholder="Detalles de la prenda..." 
                  value={nuevaPrenda.descripcion_prend} 
                  onChange={handleChange} 
                />
              </div>

              <div className="form-group">
                <label>PRECIO DE VENTA (COP) * [Min: 5k - Máx: 5M]</label>
                <input 
                  type="number" 
                  step="0.01" 
                  name="precio_venta"
                  placeholder="Ej: 120000" 
                  value={nuevaPrenda.precio_venta} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>CANTIDAD DISPONIBLE WEB * [Máx. 20]</label>
                <input 
                  type="number" 
                  name="cantidad_disponible_venta"
                  placeholder="Ej: 15" 
                  value={nuevaPrenda.cantidad_disponible_venta} 
                  onChange={handleChange} 
                  required 
                />
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
                  <option value="">Seleccione talla...</option>
                  {tiposPrenda.map((t) => (
                    <option key={t.idtPrendas || t.id_t_prendas} value={t.idtPrendas || t.id_t_prendas}>
                      {t.tallaPrend || `Talla ${t.idtPrendas}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group span-2">
                <label>COLOR *</label>
                <select name="fk_id_color" value={nuevaPrenda.fk_id_color} onChange={handleChange} required>
                  <option value="">Seleccione color...</option>
                  {colores.map((c) => (
                    <option key={c.idColor || c.id_color} value={c.idColor || c.id_color}>
                      {c.nomColor || `Color ${c.idColor}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions span-2">
                <button type="submit" className="btn-primary-wide">
                  {editandoId ? 'Guardar Cambios' : 'Registrar Prenda en Inventario'}
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