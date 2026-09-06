import { useEffect, useState } from 'react';
import { obtenerBodega, crearBodega, actualizarBodega } from '../services/BodegaService';
import { obtenerPrendas } from '../services/prendaService';
import axios from 'axios';
import '../styles/bodega.css';

function Bodega() {
  const [bodegaList, setBodegaList] = useState([]);
  const [prendas, setPrendas] = useState([]);
  const [modalError, setModalError] = useState('');

  const [mostrarModalGestion, setMostrarModalGestion] = useState(false);
  const [mostrarModalStock, setMostrarModalStock] = useState(false);
  const [mostrarModalAlerta, setMostrarModalAlerta] = useState(false);

  const [editandoId, setEditandoId] = useState(null);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroGenero, setFiltroGenero] = useState('Todos');
  const [ordenStock, setOrdenStock] = useState('asc');

  // Verificamos rol
  const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
  const rolUsuario = String(usuarioActual?.rol || usuarioActual?.tipoRol || '').trim().toLowerCase();
  const esAdmin = rolUsuario === 'administrador' || rolUsuario === 'admin';

  // Estado unificado para registrar la prenda y su bodega al mismo tiempo (Sin imagen)
  const [formRegistro, setFormRegistro] = useState({
    codigoBarras: '',
    nombrePrend: '',
    descripcionPrend: '',
    genero: 'Hombre',
    color: '',
    precioVenta: '',
    cantidadDisponibleVenta: '0',
    estado: 'Disponible',
    stockActual: '',
    stockMinimo: '5',
    stockMaximo: '85',
    costoPromedio: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      let dataBodega = [];
      let dataPrendas = [];

      try {
        dataBodega = await obtenerBodega();
      } catch (e) {
        console.warn("La bodega está vacía o hubo un error al cargarla.");
      }

      try {
        dataPrendas = await obtenerPrendas();
      } catch (e) {
        console.error("Error al cargar el catálogo de prendas.");
      }

      setBodegaList(dataBodega || []);
      setPrendas(dataPrendas || []);
    } catch (err) {
      console.error("Error general al cargar datos de la vista:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormRegistro({ ...formRegistro, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!esAdmin) return;
    setModalError('');

    const actual = Number(formRegistro.stockActual);
    const min = Number(formRegistro.stockMinimo);
    const max = Number(formRegistro.stockMaximo);
    const precioU = Number(formRegistro.costoPromedio);

    if (min < 5 || min > 85 || max < 5 || max > 85 || actual < 0 || actual > 85) {
      setModalError('Validación: El stock mínimo y máximo deben estar entre 5 y 85. El stock actual no puede superar 85.');
      return;
    }

    if (min > max) {
      setModalError('El stock mínimo no puede ser mayor que el stock máximo.');
      return;
    }

    try {
      // Este payload usa la misma estructura que creamos en el backend para registrar ambos de golpe
      const payload = {
        codigoBarras: formRegistro.codigoBarras,
        nombrePrend: formRegistro.nombrePrend,
        descripcionPrend: formRegistro.descripcionPrend,
        genero: formRegistro.genero,
        color: formRegistro.color,
        precioVenta: formRegistro.precioVenta ? Number(formRegistro.precioVenta) : 0,
        cantidadDisponibleVenta: formRegistro.cantidadDisponibleVenta ? Number(formRegistro.cantidadDisponibleVenta) : 0,
        estado: formRegistro.estado,
        imagenPrend: '', // Sin imagen desde bodega
        stockActual: actual,
        stockMinimo: min,
        stockMaximo: max,
        costoPromedio: precioU
      };

      if (editandoId) {
        await actualizarBodega(editandoId, payload);
        alert('Stock de bodega actualizado con éxito');
      } else {
        // Llama al endpoint general de creacion que guarda prenda y bodega en Spring Boot
        await axios.post('http://localhost:8080/api/prendas', payload);
        alert('Producto registrado en Bodega con éxito');
      }

      limpiarFormulario();
      cargarDatos();
    } catch (err) {
      console.error("Error al guardar en bodega:", err);
      setModalError('Error al guardar el producto en bodega.');
    }
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setFormRegistro({
      codigoBarras: '',
      nombrePrend: '',
      descripcionPrend: '',
      genero: 'Hombre',
      color: '',
      precioVenta: '',
      cantidadDisponibleVenta: '0',
      estado: 'Disponible',
      stockActual: '',
      stockMinimo: '5',
      stockMaximo: '85',
      costoPromedio: ''
    });
    setMostrarModalGestion(false);
    setModalError('');
  };

  const bodegaFiltrada = bodegaList.filter((item) => {
    const codigoPrenda = item.idPrenda || item.id_prenda || item.fk_id_prenda;
    const prendaInfo = prendas.find(p => (p.idPrenda || p.id_prenda) === codigoPrenda);
    const nombre = prendaInfo ? (prendaInfo.nombrePrend || prendaInfo.nombre_prend || '').toLowerCase() : '';
    const genero = prendaInfo ? (prendaInfo.genero || '') : '';

    const cumpleBusqueda = nombre.includes(busqueda.toLowerCase()) || (codigoPrenda && String(codigoPrenda).toLowerCase().includes(busqueda.toLowerCase()));
    const cumpleGenero = filtroGenero === 'Todos' || genero === filtroGenero;

    return cumpleBusqueda && cumpleGenero;
  }).sort((a, b) => {
    const stockA = Number(a.stockActual ?? a.stock_actual);
    const stockB = Number(b.stockActual ?? b.stock_actual);
    if (ordenStock === 'asc') {
      return stockA - stockB;
    } else {
      return stockB - stockA;
    }
  });

  return (
    <div className="bodega-content">
      <div className="bodega-header">
        <h2>Módulo de Control de Bodega</h2>
        {esAdmin && (
          <button className="btn-gestionar" onClick={() => { limpiarFormulario(); setMostrarModalGestion(true); }}>
            + Registrar Producto en Bodega
          </button>
        )}
      </div>

      <div className="bodega-filters">
        <div className="filter-group">
          <label>Buscar Prenda</label>
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Filtrar por Género</label>
          <select value={filtroGenero} onChange={(e) => setFiltroGenero(e.target.value)}>
            <option value="Todos">Todos los géneros</option>
            <option value="Hombre">Hombre</option>
            <option value="Mujer">Mujer</option>
            <option value="Infantil">Infantil</option>
            <option value="Unisex">Unisex</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Ordenar Stock</label>
          <select value={ordenStock} onChange={(e) => setOrdenStock(e.target.value)}>
            <option value="asc">Menor a Mayor Stock</option>
            <option value="desc">Mayor a Menor Stock</option>
          </select>
        </div>
      </div>

      <div className="bodega-grid">
        {bodegaFiltrada.length === 0 ? (
          <p className="bodega-sin-datos">No hay registros de bodega disponibles.</p>
        ) : (
          bodegaFiltrada.map((item) => {
            const stockActual = Number(item.stockActual ?? item.stock_actual);
            const codigoPrenda = item.idPrenda || item.id_prenda || item.fk_id_prenda;
            const esCritico = stockActual < 10;

            const prendaInfo = prendas.find(p => (p.idPrenda || p.id_prenda) === codigoPrenda);
            const imagenPrenda = prendaInfo ? (prendaInfo.imagenPrend || prendaInfo.imagen_prend || "https://via.placeholder.com/200") : "https://via.placeholder.com/200";
            const nombrePrenda = prendaInfo ? (prendaInfo.nombrePrend || prendaInfo.nombre_prend || "Prenda sin nombre") : "Prenda sin nombre";
            const fechaMod = item.fechaActualizacion || item.fecha_actualizacion;

            return (
              <div
                className="card-bodega"
                key={item.idStock || item.id_stock || item.idBodega || item.id_bodega}
                style={{ borderLeft: esCritico ? '5px solid #d81b60' : '5px solid #4caf50' }}
              >
                <div className="card-img-wrap">
                  <img src={imagenPrenda} alt={nombrePrenda} />
                </div>

                <div className="card-body">
                  <h4>{nombrePrenda}</h4>
                  <p className="stock-actual">
                    Stock Actual: <strong className={esCritico ? 'stock-bajo' : 'stock-normal'}>{stockActual} unidades</strong>
                  </p>
                  <p style={{ fontSize: '11px', color: '#666', margin: '4px 0' }}>
                    Última mod: {fechaMod ? new Date(fechaMod).toLocaleString() : 'No registrada'}
                  </p>

                  <div className="card-actions">
                    <button
                      className="btn-detalles"
                      onClick={() => { setItemSeleccionado(item); setMostrarModalStock(true); }}
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {mostrarModalStock && itemSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Detalles de Stock en Bodega</h3>
              <button className="btn-cerrar-modal" onClick={() => setMostrarModalStock(false)}>✕</button>
            </div>
            <div className="modal-detalles">
              <p><strong>Código de Prenda:</strong> {itemSeleccionado.idPrenda || itemSeleccionado.id_prenda || itemSeleccionado.fk_id_prenda}</p>
              <p><strong>Stock Actual:</strong> {itemSeleccionado.stockActual ?? itemSeleccionado.stock_actual} unidades</p>
              <p><strong>Stock Mínimo:</strong> {itemSeleccionado.stockMinimo ?? itemSeleccionado.stock_minimo}</p>
              <p><strong>Stock Máximo:</strong> {itemSeleccionado.stockMaximo ?? itemSeleccionado.stock_maximo}</p>
              <p><strong>Costo Promedio:</strong> ${Number(itemSeleccionado.costoPromedio ?? itemSeleccionado.costo_promedio ?? 0).toLocaleString()} COP</p>
            </div>
            <div className="modal-actions">
              <button className="btn-cerrar-detalles" onClick={() => setMostrarModalStock(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Registro en Bodega (SIN IMAGEN) */}
      {mostrarModalGestion && esAdmin && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Registrar Producto en Bodega</h3>
              <button className="btn-cerrar-modal" onClick={limpiarFormulario}>✕</button>
            </div>

            {modalError && <p className="modal-error">{modalError}</p>}

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Código de Barras *</label>
                <input
                  type="text"
                  name="codigoBarras"
                  placeholder="Ej: 7701234500011"
                  value={formRegistro.codigoBarras}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Nombre de la Prenda *</label>
                <input
                  type="text"
                  name="nombrePrend"
                  placeholder="Ej: Camiseta básica"
                  value={formRegistro.nombrePrend}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <input
                  type="text"
                  name="descripcionPrend"
                  placeholder="Detalles..."
                  value={formRegistro.descripcionPrend}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Género *</label>
                <select name="genero" value={formRegistro.genero} onChange={handleChange} required>
                  <option value="Hombre">Hombre</option>
                  <option value="Mujer">Mujer</option>
                  <option value="Infantil">Infantil</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>

              <div className="form-group">
                <label>Color *</label>
                <input
                  type="text"
                  name="color"
                  placeholder="Ej: Negro"
                  value={formRegistro.color}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Stock Actual [Max: 85] *</label>
                <input
                  type="number"
                  name="stockActual"
                  min="0"
                  max="85"
                  placeholder="Ej: 50"
                  value={formRegistro.stockActual}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Stock Mínimo [Rango: 5 - 85] *</label>
                <input
                  type="number"
                  name="stockMinimo"
                  min="5"
                  max="85"
                  value={formRegistro.stockMinimo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Stock Máximo [Rango: 5 - 85] *</label>
                <input
                  type="number"
                  name="stockMaximo"
                  min="5"
                  max="85"
                  value={formRegistro.stockMaximo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Costo Promedio (Compra) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="costoPromedio"
                  placeholder="Ej: 30000"
                  value={formRegistro.costoPromedio}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={limpiarFormulario}>Cancelar</button>
                <button type="submit" className="btn-guardar">Registrar en Bodega</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bodega;