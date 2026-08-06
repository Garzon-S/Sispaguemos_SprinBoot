import { useEffect, useState } from 'react';
import { 
  obtenerPrendas, crearPrenda, actualizarPrenda, eliminarPrenda,
  obtenerGeneros, obtenerTiposPrenda, obtenerColores 
} from './services/prendaService';
import './App.css';

function App() {
  const [prendas, setPrendas] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [tiposPrenda, setTiposPrenda] = useState([]);
  const [colores, setColores] = useState([]);
  const [error, setError] = useState('');
  
  const [busqueda, setBusqueda] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  
  const [nuevaPrenda, setNuevaPrenda] = useState({
    nombre_prend: '',
    descripcion_prend: '',
    precio: '',
    estado: 1,
    stock: '',
    min_stock: 5,
    max_stock: 50,
    fk_id_genero: '',
    fk_idt_prendas: '',
    fk_id_color: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const dataPrendas = await obtenerPrendas();
      const dataGeneros = await obtenerGeneros();
      const dataTipos = await obtenerTiposPrenda();
      const dataColores = await obtenerColores();

      setPrendas(dataPrendas);
      setGeneros(dataGeneros);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const prendaData = {
        ...nuevaPrenda,
        precio: Number(nuevaPrenda.precio),
        stock: Number(nuevaPrenda.stock),
        min_stock: Number(nuevaPrenda.min_stock),
        max_stock: Number(nuevaPrenda.max_stock),
        estado: Number(nuevaPrenda.estado),
        fk_id_genero: Number(nuevaPrenda.fk_id_genero),
        fk_idt_prendas: Number(nuevaPrenda.fk_idt_prendas),
        fk_id_color: Number(nuevaPrenda.fk_id_color)
      };

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
      alert('Error al guardar la prenda.');
    }
  };

  const iniciarEdicion = (p) => {
    setEditandoId(p.idPrenda || p.id_prenda);
    setNuevaPrenda({
      nombre_prend: p.nombrePrend || p.nombre_prend || '',
      descripcion_prend: p.descripcionPrend || p.descripcion_prend || '',
      precio: p.precio || '',
      estado: p.estado || 1,
      stock: p.stock || '',
      min_stock: p.minStock || p.min_stock || 5,
      max_stock: p.maxStock || p.max_stock || 50,
      fk_id_genero: p.fkIdGenero || p.fk_id_genero || '',
      fk_idt_prendas: p.fkIdtPrendas || p.fk_idt_prendas || '',
      fk_id_color: p.fkIdColor || p.fk_id_color || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setNuevaPrenda({
      nombre_prend: '',
      descripcion_prend: '',
      precio: '',
      estado: 1,
      stock: '',
      min_stock: 5,
      max_stock: 50,
      fk_id_genero: '',
      fk_idt_prendas: '',
      fk_id_color: ''
    });
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
    const id = String(p.idPrenda || p.id_prenda || '');
    const nombre = (p.nombrePrend || p.nombre_prend || '').toLowerCase();
    const descripcion = (p.descripcionPrend || p.descripcion_prend || '').toLowerCase();
    const textoBusqueda = busqueda.toLowerCase();

    return id.includes(textoBusqueda) || 
           nombre.includes(textoBusqueda) || 
           descripcion.includes(textoBusqueda);
  });

  return (
    <div className="app-container">
      {/* Contenedor del Formulario */}
      <div className="form-card">
        <div className="form-header">
          <div className="icon-circle"></div>
          <div>
            <h2>{editandoId ? `Editando Prenda ID: ${editandoId}` : 'Agregar Nueva Prenda'}</h2>
            <p>Completa todos los campos para registrar en el inventario.</p>
          </div>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit} className="form-grid">
          
          <div className="form-group full-width">
            <label>NOMBRE *</label>
            <input 
              type="text" 
              name="nombre_prend" 
              placeholder="Ej: Camiseta Básica" 
              value={nuevaPrenda.nombre_prend} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group full-width">
            <label>DESCRIPCIÓN *</label>
            <input 
              type="text" 
              name="descripcion_prend" 
              placeholder="Ej: Camiseta de algodón manga corta" 
              value={nuevaPrenda.descripcion_prend} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>PRECIO (COP) *</label>
            <input 
              type="number" 
              name="precio" 
              placeholder="0" 
              value={nuevaPrenda.precio} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>STOCK INICIAL *</label>
            <input 
              type="number" 
              name="stock" 
              placeholder="0" 
              value={nuevaPrenda.stock} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>STOCK MÍNIMO *</label>
            <input 
              type="number" 
              name="min_stock" 
              placeholder="5" 
              value={nuevaPrenda.min_stock} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>STOCK MÁXIMO *</label>
            <input 
              type="number" 
              name="max_stock" 
              placeholder="50" 
              value={nuevaPrenda.max_stock} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>GÉNERO *</label>
            <select name="fk_id_genero" value={nuevaPrenda.fk_id_genero} onChange={handleChange} required>
              <option value="">Seleccione...</option>
              {generos.map((g) => (
                <option key={g.idGeneroPrend || g.id_genero} value={g.idGeneroPrend || g.id_genero}>
                  {g.tipoGenero || g.nombreGenero || `Género ${g.idGeneroPrend}`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>TALLA *</label>
            <select name="fk_idt_prendas" value={nuevaPrenda.fk_idt_prendas} onChange={handleChange} required>
              <option value="">Seleccione...</option>
              {tiposPrenda.map((t) => (
                <option key={t.idtPrendas || t.id_t_prendas} value={t.idtPrendas || t.id_t_prendas}>
                  {t.tallaPrend || t.nombreTipo || `Talla ${t.idtPrendas}`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>COLOR *</label>
            <select name="fk_id_color" value={nuevaPrenda.fk_id_color} onChange={handleChange} required>
              <option value="">Seleccione...</option>
              {colores.map((c) => (
                <option key={c.idColor || c.id_color} value={c.idColor || c.id_color}>
                  {c.nomColor || c.nombreColor || `Color ${c.idColor}`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions full-width">
            <button type="submit" className="btn-primary">
              {editandoId ? 'Actualizar Prenda' : 'Guardar Prenda'}
            </button>
            {editandoId && (
              <button type="button" onClick={limpiarFormulario} className="btn-secondary">
                Cancelar
              </button>
            )}
          </div>

        </form>
      </div>

      {/* Sección de Búsqueda y Tabla */}
      <div className="table-card">
        <h3>Lista de Prendas Registradas</h3>
        
        <div className="search-box">
          <input 
            type="text" 
            placeholder=" Buscar por ID" 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)} 
          />
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {prendasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">No se encontraron prendas.</td>
                </tr>
              ) : (
                prendasFiltradas.map((p) => (
                  <tr key={p.idPrenda || p.id_prenda}>
                    <td>{p.idPrenda || p.id_prenda}</td>
                    <td>{p.nombrePrend || p.nombre_prend}</td>
                    <td>{p.descripcionPrend || p.descripcion_prend}</td>
                    <td>${Number(p.precio).toLocaleString()}</td>
                    <td>{p.stock}</td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => iniciarEdicion(p)} className="btn-edit">Editar</button>
                        <button onClick={() => handleEliminar(p.idPrenda || p.id_prenda)} className="btn-delete">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;