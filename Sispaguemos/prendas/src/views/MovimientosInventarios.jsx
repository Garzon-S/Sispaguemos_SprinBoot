// src/views/MovimientosInventario.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { obtenerBodega } from '../services/BodegaService';
import { obtenerPrendas } from '../services/prendaService';
import '../styles/movimientos.css';

function MovimientosInventario() {
  const [movimientos, setMovimientos] = useState([]);
  const [bodegaList, setBodegaList] = useState([]);
  const [prendas, setPrendas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [modalError, setModalError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  
  // Estado para el modal de Detalles
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, movimiento: null });

  const [formMovimiento, setFormMovimiento] = useState({
    tipo_movimiento: 'Entrada',
    cantidad: '',
    observacion: 'Reestock',
    fk_id_stock: '',
    fk_id_usuario_admin: 1
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const resMovs = await axios.get('http://localhost:8080/api/movimientos').catch(() => ({ data: [] }));
      const dataBodega = await obtenerBodega().catch(() => []);
      const dataPrendas = await obtenerPrendas().catch(() => []);
      
      let dataUsuarios = [];
      try {
        const resUser = await axios.get('http://localhost:8080/api/usuario');
        dataUsuarios = resUser.data || [];
      } catch (e) {
        console.warn("No se pudo cargar la lista de usuarios, usando respaldo local.");
      }
      
      setMovimientos(resMovs.data || []);
      setBodegaList(dataBodega || []);
      setPrendas(dataPrendas || []);
      setUsuarios(dataUsuarios);
    } catch (err) {
      console.error("Error al cargar datos en movimientos:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'tipo_movimiento') {
      const nuevaObs = value === 'Entrada' ? 'Reestock' : 'Devolucion por producto defectuoso o danado';
      setFormMovimiento({
        ...formMovimiento,
        tipo_movimiento: value,
        observacion: nuevaObs
      });
    } else {
      setFormMovimiento({ ...formMovimiento, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    try {
      const payload = {
        tipo_movimiento: formMovimiento.tipo_movimiento,
        cantidad: Number(formMovimiento.cantidad),
        observacion: formMovimiento.observacion,
        fk_id_stock: Number(formMovimiento.fk_id_stock),
        fk_id_usuario_admin: Number(formMovimiento.fk_id_usuario_admin)
      };

      await axios.post('http://localhost:8080/api/movimientos', payload);

      alert('Movimiento registrado con exito y stock actualizado.');
      
      setMostrarModal(false);
      setFormMovimiento({
        tipo_movimiento: 'Entrada',
        cantidad: '',
        observacion: 'Reestock',
        fk_id_stock: '',
        fk_id_usuario_admin: 1
      });
      cargarDatos();
    } catch (err) {
      console.error("Error detallado al registrar movimiento:", err);
      const mensajeBackend = err.response?.data?.message || err.response?.data || err.message || 'Error desconocido al registrar el movimiento.';
      setModalError(typeof mensajeBackend === 'string' ? mensajeBackend : JSON.stringify(mensajeBackend));
    }
  };

  const obtenerInfoPrenda = (idStockMov) => {
    const itemStock = bodegaList.find(b => (b.id_stock || b.idStock || b.idBodega || b.id_bodega) == idStockMov);
    if (!itemStock) return { nombre: 'Desconocida', codigo: 'N/A' };

    const codigoPrenda = itemStock.idPrenda || itemStock.id_prenda || itemStock.fk_id_prenda;
    const infoPrendaCatalogo = prendas.find(p => (p.idPrenda || p.id_prenda) === codigoPrenda);
    const nombreReal = infoPrendaCatalogo ? (infoPrendaCatalogo.nombrePrend || infoPrendaCatalogo.nombre_prend) : null;

    return {
      nombre: nombreReal || itemStock.nombrePrenda || itemStock.nombre_prend || 'Prenda sin nombre',
      codigo: codigoPrenda || '770...'
    };
  };

  const obtenerNombreUsuario = (idAdmin) => {
    // 1. Buscamos en la lista que trae la API
    const usuarioInfo = usuarios.find(u => (u.idUsuario || u.id_usuario || u.id) == idAdmin);
    if (usuarioInfo) {
      const nombre = usuarioInfo.primerNom || usuarioInfo.primer_nom || '';
      const apellido = usuarioInfo.primerApelli || usuarioInfo.primer_apelli || '';
      const completo = `${nombre} ${apellido}`.trim();
      if (completo) return `${completo} (ID: ${idAdmin})`;
    }

    // 2. Respaldo directo por si la API de usuarios no responde en este componente
    if (Number(idAdmin) === 1) {
      return `Sergio Garzon (ID: 1)`;
    }

    return `Admin ID: ${idAdmin}`;
  };

  return (
    <div className="movimientos-content">
      <div className="movimientos-header">
        <h2>Control de Entradas y Salidas de Inventario</h2>
        <button className="btn-agregar" onClick={() => setMostrarModal(true)}>
          + Registrar Nuevo Movimiento
        </button>
      </div>

      <div className="movimientos-table-container">
        <table className="movimientos-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Observacion / Motivo</th>
              <th>Prenda y Codigo</th>
              <th>Responsable</th>
              <th>Fecha y Hora</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.length === 0 ? (
              <tr>
                <td colSpan="8" className="sin-datos">No hay movimientos registrados.</td>
              </tr>
            ) : (
              movimientos.map((m) => {
                const tipo = m.tipoMovimiento || m.tipo_movimiento;
                const esEntrada = tipo === 'Entrada' || tipo === 'ENTRADA';
                const idStockRef = m.fkIdStock || m.fk_id_stock;
                const idAdminRef = m.fkIdUsuarioAdmin || m.fk_id_usuario_admin;
                const prendaInfo = obtenerInfoPrenda(idStockRef);
                const nombreResponsable = obtenerNombreUsuario(idAdminRef);

                return (
                  <tr key={m.idMovimiento || m.id_movimiento}>
                    <td>{m.idMovimiento || m.id_movimiento}</td>
                    <td>
                      <span className={`badge-tipo ${esEntrada ? 'badge-entrada' : 'badge-salida'}`}>
                        {tipo}
                      </span>
                    </td>
                    <td className={esEntrada ? 'cantidad-entrada' : 'cantidad-salida'}>
                      {esEntrada ? `+${m.cantidad}` : `-${m.cantidad}`}
                    </td>
                    <td>{m.observacion}</td>
                    <td>
                      <span style={{ fontWeight: '500' }}>{prendaInfo.nombre}</span>
                      <div style={{ fontSize: '11px', color: '#666' }}>Ref: {prendaInfo.codigo}</div>
                    </td>
                    <td>{nombreResponsable}</td>
                    <td>{new Date(m.fechaMovimiento || m.fecha_movimiento).toLocaleString()}</td>
                    <td>
                      <button 
                        className="btn-ver-codigo"
                        style={{ background: '#e91e63', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        onClick={() => setModalDetalle({ abierto: true, movimiento: { ...m, prendaInfo, nombreResponsable } })}
                      >
                        Detalles
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: VER DETALLES */}
      {modalDetalle.abierto && modalDetalle.movimiento && (
        <div className="modal-overlay">
          <div className="modal-content modal-codigo">
            <h3 className="codigo-titulo">Detalles del Movimiento</h3>
            <div className="modal-detalles" style={{ textAlign: 'left', margin: '15px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p><strong>ID Movimiento:</strong> #{modalDetalle.movimiento.idMovimiento || modalDetalle.movimiento.id_movimiento}</p>
              <p><strong>Tipo:</strong> {modalDetalle.movimiento.tipoMovimiento || modalDetalle.movimiento.tipo_movimiento}</p>
              <p><strong>Cantidad:</strong> {modalDetalle.movimiento.cantidad} unidades</p>
              <p><strong>Prenda:</strong> {modalDetalle.movimiento.prendaInfo.nombre}</p>
              <p><strong>Código de Barras:</strong> {modalDetalle.movimiento.prendaInfo.codigo}</p>
              <p><strong>Responsable:</strong> {modalDetalle.movimiento.nombreResponsable}</p>
              <p><strong>Motivo / Observación:</strong> {modalDetalle.movimiento.observacion}</p>
              <p><strong>Fecha:</strong> {new Date(modalDetalle.movimiento.fechaMovimiento || modalDetalle.movimiento.fecha_movimiento).toLocaleString()}</p>
            </div>
            <button 
              className="btn-cerrar-codigo"
              onClick={() => setModalDetalle({ abierto: false, movimiento: null })}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR MOVIMIENTO */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Registrar Movimiento de Inventario</h3>
              <button className="btn-cerrar-modal" onClick={() => setMostrarModal(false)}>✕</button>
            </div>

            {modalError && <p className="modal-error">{modalError}</p>}

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tipo de Movimiento *</label>
                <select name="tipo_movimiento" value={formMovimiento.tipo_movimiento} onChange={handleChange} required>
                  <option value="Entrada">Entrada (Aumenta stock)</option>
                  <option value="Salida">Salida (Reduce stock)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Seleccionar Stock / Prenda *</label>
                <select name="fk_id_stock" value={formMovimiento.fk_id_stock} onChange={handleChange} required>
                  <option value="">Seleccione registro de stock...</option>
                  {bodegaList.map((b) => {
                    const idStockReal = b.id_stock || b.idStock || b.idBodega || b.id_bodega;
                    const refP = b.idPrenda || b.id_prenda;
                    const stockA = b.stockActual ?? b.stock_actual ?? b.cantidad_actual ?? 0;
                    return (
                      <option key={idStockReal} value={idStockReal}>
                        Stock ID: {idStockReal} | Ref: {refP} | Stock: {stockA}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group">
                <label>Cantidad *</label>
                <input 
                  type="number" 
                  name="cantidad" 
                  min="1" 
                  placeholder="Ej: 15" 
                  value={formMovimiento.cantidad} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Observacion / Motivo *</label>
                <select name="observacion" value={formMovimiento.observacion} onChange={handleChange} required>
                  {formMovimiento.tipo_movimiento === 'Entrada' ? (
                    <>
                      <option value="Reestock">Reestock</option>
                      <option value="Implementacion de nuevas prendas">Implementacion de nuevas prendas</option>
                    </>
                  ) : (
                    <>
                      <option value="Devolucion por producto defectuoso o danado">Devolucion por producto defectuoso o danado</option>
                      <option value="Entrega incorrecta">Entrega incorrecta</option>
                      <option value="Entrega incompleta">Entrega incompleta</option>
                    </>
                  )}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={() => setMostrarModal(false)}>Cancelar</button>
                <button type="submit" className="btn-guardar">Guardar Movimiento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MovimientosInventario;