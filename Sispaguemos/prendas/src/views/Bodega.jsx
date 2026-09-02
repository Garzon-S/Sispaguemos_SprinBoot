import { useEffect, useState } from 'react';
import { obtenerBodega, crearBodega, actualizarBodega } from '../services/BodegaService';
import { obtenerPrendas } from '../services/prendaService';
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

  const [formBodega, setFormBodega] = useState({
    id_prenda: '',
    stock_actual: '',
    stock_minimo: '5',
    stock_maximo: '85',
    precio_unitario: ''
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
    setFormBodega({ ...formBodega, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!esAdmin) return;
    setModalError('');

    const actual = Number(formBodega.stock_actual);
    const min = Number(formBodega.stock_minimo);
    const max = Number(formBodega.stock_maximo);
    const precioU = Number(formBodega.precio_unitario);

    if (min < 5 || min > 85 || max < 5 || max > 85 || actual < 0 || actual > 85) {
      setModalError('Validacion: El stock minimo y maximo deben estar entre 5 y 85. El stock actual no puede superar 85.');
      return;
    }

    if (min > max) {
      setModalError('El stock minimo no puede ser mayor que el stock maximo.');
      return;
    }

    if (precioU <= 0) {
      setModalError('Debes ingresar un precio unitario valido.');
      return;
    }

    try {
      const payload = {
        id_prenda: formBodega.id_prenda,
        stock_actual: actual,
        stock_minimo: min,
        stock_maximo: max,
        precio_unitario: precioU
      };

      if (editandoId) {
        await actualizarBodega(editandoId, payload);
        alert('Stock de bodega actualizado con exito');
      } else {
        await crearBodega(payload);
        alert('Registro de bodega creado con exito');
      }

      limpiarFormulario();
      cargarDatos();
    } catch (err) {
      console.error("Error al guardar bodega:", err);
      setModalError('Error al guardar en bodega.');
    }
  };

  const iniciarEdicion = (item) => {
    if (!esAdmin) return;
    const idReg = item.idStock || item.id_stock || item.idBodega || item.id_bodega; 
    const codPrenda = item.idPrenda || item.id_prenda || item.fk_id_prenda;
    const stockAct = item.stockActual ?? item.stock_actual;
    const stockMin = item.stockMinimo ?? item.stock_minimo;
    const stockMax = item.stockMaximo ?? item.stock_maximo;
    const precioU = item.precioUnitario ?? item.precio_unitario ?? '';

    setEditandoId(idReg);
    setFormBodega({
      id_prenda: codPrenda,
      stock_actual: stockAct,
      stock_minimo: stockMin,
      stock_maximo: stockMax,
      precio_unitario: precioU
    });
    setModalError('');
    setMostrarModalGestion(true);
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setFormBodega({ id_prenda: '', stock_actual: '', stock_minimo: '5', stock_maximo: '85', precio_unitario: '' });
    setMostrarModalGestion(false);
    setModalError('');
  };

  const bodegaFiltrada = bodegaList.filter((item) => {
    const codigoPrenda = item.idPrenda || item.id_prenda || item.fk_id_prenda;
    const prendaInfo = prendas.find(p => (p.idPrenda || p.id_prenda) === codigoPrenda);
    const nombre = prendaInfo ? (prendaInfo.nombrePrend || prendaInfo.nombre_prend || '').toLowerCase() : '';
    const genero = prendaInfo ? (prendaInfo.genero || '') : '';

    const cumpleBusqueda = nombre.includes(busqueda.toLowerCase()) || (codigoPrenda && codigoPrenda.toLowerCase().includes(busqueda.toLowerCase()));
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
        <h2>Modulo de Control de Bodega</h2>
        {/* Solo admin puede gestionar o crear registros en bodega */}
        {esAdmin && (
          <button className="btn-gestionar" onClick={() => { limpiarFormulario(); setMostrarModalGestion(true); }}>
            + Gestionar Stock
          </button>
        )}
      </div>

      <div className="bodega-filters">
        <div className="filter-group">
          <label>Buscar Prenda</label>
          <input 
            type="text" 
            placeholder="Buscar por nombre o codigo..." 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)} 
          />
        </div>

        <div className="filter-group">
          <label>Filtrar por Genero</label>
          <select value={filtroGenero} onChange={(e) => setFiltroGenero(e.target.value)}>
            <option value="Todos">Todos los generos</option>
            <option value="Hombre">Hombre</option>
            <option value="Mujer">Mujer</option>
            <option value="Niño">Niño</option>
            <option value="Niña">Niña</option>
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

                    {/* Botón Editar reservado exclusivamente para el Administrador */}
                    {esAdmin && (
                      <button 
                        className="btn-editar"
                        onClick={() => iniciarEdicion(item)} 
                      >
                        Editar
                      </button>
                    )}
                  </div>

                  {esCritico && esAdmin && (
                    <button 
                      className="btn-alerta"
                      onClick={() => { setItemSeleccionado(item); setMostrarModalAlerta(true); }} 
                    >
                      Avisar / Comunicar Reestock
                    </button>
                  )}
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
              <p><strong>Codigo de Prenda:</strong> {itemSeleccionado.idPrenda || itemSeleccionado.id_prenda || itemSeleccionado.fk_id_prenda}</p>
              <p><strong>Precio Unitario:</strong> ${Number(itemSeleccionado.precioUnitario ?? itemSeleccionado.precio_unitario ?? 0).toLocaleString()} COP</p>
              <p><strong>Stock Actual:</strong> {itemSeleccionado.stockActual ?? itemSeleccionado.stock_actual} unidades</p>
              <p><strong>Stock Minimo:</strong> {itemSeleccionado.stockMinimo ?? itemSeleccionado.stock_minimo}</p>
              <p><strong>Stock Maximo:</strong> {itemSeleccionado.stockMaximo ?? itemSeleccionado.stock_maximo}</p>
              <p><strong>Última Modificación:</strong> {itemSeleccionado.fechaActualizacion || itemSeleccionado.fecha_actualizacion ? new Date(itemSeleccionado.fechaActualizacion || itemSeleccionado.fecha_actualizacion).toLocaleString() : 'N/A'}</p>
            </div>

            <div className="modal-actions">
              <button className="btn-cerrar-detalles" onClick={() => setMostrarModalStock(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalAlerta && itemSeleccionado && esAdmin && (
        <div className="modal-overlay">
          <div className="modal-content modal-alerta">
            <div className="modal-header">
              <h3 className="text-danger">Aviso de Reestock Critico</h3>
              <button className="btn-cerrar-modal" onClick={() => setMostrarModalAlerta(false)}>✕</button>
            </div>
            
            <div className="modal-detalles">
              <p>El producto con codigo <strong>{itemSeleccionado.idPrenda || itemSeleccionado.id_prenda || itemSeleccionado.fk_id_prenda}</strong> tiene un stock actual de <strong>{itemSeleccionado.stockActual ?? itemSeleccionado.stock_actual}</strong> unidades (Menor a 10 permitidas).</p>
              <p style={{ marginTop: '10px' }}>Se requiere comunicar y solicitar reestock al area de proveedores de inmediato.</p>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-confirmar" 
                onClick={() => { alert('Notificacion enviada a proveedores con exito.'); setMostrarModalAlerta(false); }}
              >
                Confirmar Comunicacion
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalGestion && esAdmin && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editandoId ? 'Editar Stock en Bodega' : 'Control de Stock en Bodega'}</h3>
              <button className="btn-cerrar-modal" onClick={limpiarFormulario}>✕</button>
            </div>

            {modalError && <p className="modal-error">{modalError}</p>}

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Seleccionar Prenda *</label>
                <select name="id_prenda" value={formBodega.id_prenda} onChange={handleChange} disabled={editandoId !== null} required>
                  <option value="">Seleccione prenda...</option>
                  {prendas.map((p) => {
                    const pId = p.idPrenda || p.id_prenda || p.fk_id_prenda;
                    const nombre = p.nombrePrend || p.nombre_prend || "Prenda sin nombre";

                    const yaRegistrada = bodegaList.some(b => {
                      const bId = b.idPrenda || b.id_prenda || b.fk_id_prenda;
                      return bId && pId && String(bId) === String(pId);
                    });

                    if (editandoId === null && yaRegistrada) {
                      return null;
                    }

                    return (
                      <option key={pId} value={pId}>
                        {nombre} (Ref: {pId})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group">
                <label>Precio Unitario (COP) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  name="precio_unitario" 
                  placeholder="Ej: 45000" 
                  value={formBodega.precio_unitario} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Stock Actual [Max: 85] *</label>
                <input 
                  type="number" 
                  name="stock_actual" 
                  min="0" 
                  max="85"
                  value={formBodega.stock_actual} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Stock Minimo [Rango: 5 - 85] *</label>
                <input 
                  type="number" 
                  name="stock_minimo" 
                  min="5" 
                  max="85"
                  value={formBodega.stock_minimo} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Stock Maximo [Rango: 5 - 85] *</label>
                <input 
                  type="number" 
                  name="stock_maximo" 
                  min="5" 
                  max="85"
                  value={formBodega.stock_maximo} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={limpiarFormulario}>Cancelar</button>
                <button type="submit" className="btn-guardar">
                  {editandoId ? 'Guardar Cambios' : 'Registrar Configuracion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bodega;