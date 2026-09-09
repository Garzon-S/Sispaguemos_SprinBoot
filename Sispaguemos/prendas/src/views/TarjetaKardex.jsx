import { useEffect, useState } from 'react';
import axios from 'axios';

function Kardex() {
  const [prendas, setPrendas] = useState([]);
  const [prendaSeleccionada, setPrendaSeleccionada] = useState('');
  const [movimientosKardex, setMovimientosKardex] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8080/api/prendas')
      .then(res => setPrendas(res.data))
      .catch(err => console.error("Error al cargar prendas", err));
  }, []);

  useEffect(() => {
    if (prendaSeleccionada) {
      axios.get(`http://localhost:8080/api/kardex/prenda/${prendaSeleccionada}`)
        .then(res => {
          setMovimientosKardex(res.data);
          setError('');
        })
        .catch(err => {
          console.error("Error al cargar kardex:", err);
          setError('No se pudo cargar el movimiento del Kardex.');
        });
    } else {
      setMovimientosKardex([]);
    }
  }, [prendaSeleccionada]);

  const totalEntradasCant = movimientosKardex.reduce((acc, m) => acc + Number(m.cantEntrada || 0), 0);
  const totalEntradasVr = movimientosKardex.reduce((acc, m) => acc + Number(m.vrTotalEntrada || 0), 0);
  const totalSalidasCant = movimientosKardex.reduce((acc, m) => acc + Number(m.cantSalida || 0), 0);
  const totalSalidasVr = movimientosKardex.reduce((acc, m) => acc + Number(m.vrTotalSalida || 0), 0);

  // Tomamos el último movimiento para reflejar el stock final exacto en el footer
  const ultimoMovimiento = movimientosKardex[movimientosKardex.length - 1] || {};
  const stockFinalFooter = ultimoMovimiento.existenciaFinalCant || 0;

  return (
    <div className="inventario-content">
      <div className="dashboard-cards-grid">
        <div className="dash-card">
          <h3>CONTABILIDAD</h3>
          <h1>Kardex de Inventario (Control de Existencias)</h1>
          <p>Visualiza el control detallado de Entradas, Salidas y Existencias desde el servidor.</p>
        </div>
      </div>

      <div className="filter-search-row" style={{ marginTop: '20px' }}>
        <div className="search-box-group" style={{ width: '100%' }}>
          <label>SELECCIONAR PRENDA PARA VER KARDEX</label>
          <select
            value={prendaSeleccionada}
            onChange={(e) => setPrendaSeleccionada(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
          >
            <option value="">-- Seleccione una prenda --</option>
            {prendas.map(p => (
              <option key={p.idPrenda || p.id_prenda} value={p.idPrenda || p.id_prenda}>
                {p.nombrePrend || p.nombre_prend} (Ref: {p.codigoBarras || p.codigo_barras})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {prendaSeleccionada && (
        <>
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <a
              href={`http://localhost:8080/api/kardex/prenda/${prendaSeleccionada}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#e63982',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'inline-block',
                boxShadow: '0 4px 10px rgba(230, 57, 130, 0.25)'
              }}
            >
              📥 Descargar Reporte PDF
            </a>
          </div>

          <div className="table-responsive" style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflowX: 'auto', marginTop: '15px' }}>
            <table className="tabla-kardex" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                  <th rowSpan="3" style={{ border: '1px solid #ddd', padding: '8px' }}>No.</th>
                  <th rowSpan="3" style={{ border: '1px solid #ddd', padding: '8px' }}>Fecha</th>
                  <th rowSpan="3" style={{ border: '1px solid #ddd', padding: '8px' }}>Concepto</th>
                  <th rowSpan="3" style={{ border: '1px solid #ddd', padding: '8px' }}>Documento</th>
                  <th colSpan="3" style={{ border: '1px solid #ddd', background: '#e3f2fd', padding: '6px' }}>ENTRADAS</th>
                  <th colSpan="3" style={{ border: '1px solid #ddd', background: '#ffebee', padding: '6px' }}>SALIDAS</th>
                  <th colSpan="2" style={{ border: '1px solid #ddd', background: '#e8f5e9', padding: '6px' }}>EXISTENCIAS</th>
                </tr>
                <tr style={{ background: '#f1f3f5', fontSize: '11px' }}>
                  <th colSpan="3" style={{ border: '1px solid #ddd', padding: '4px' }}>-</th>
                  <th colSpan="3" style={{ border: '1px solid #ddd', padding: '4px' }}>-</th>
                  <th style={{ border: '1px solid #ddd', background: '#fff3e0', padding: '4px' }}>EXISTENCIA INICIAL</th>
                  <th style={{ border: '1px solid #ddd', background: '#d1e7dd', padding: '4px' }}>EXISTENCIA FINAL</th>
                </tr>
                <tr style={{ background: '#fafafa', fontSize: '11px' }}>
                  <th style={{ border: '1px solid #ddd', padding: '4px' }}>Cant</th>
                  <th style={{ border: '1px solid #ddd', padding: '4px' }}>Vr. Unit</th>
                  <th style={{ border: '1px solid #ddd', padding: '4px' }}>Vr. Total</th>
                  <th style={{ border: '1px solid #ddd', padding: '4px' }}>Cant</th>
                  <th style={{ border: '1px solid #ddd', padding: '4px' }}>Vr. Unit</th>
                  <th style={{ border: '1px solid #ddd', padding: '4px' }}>Vr. Total</th>
                  <th style={{ border: '1px solid #ddd', padding: '4px' }}>Cant</th>
                  <th style={{ border: '1px solid #ddd', padding: '4px' }}>Cant</th>
                </tr>
              </thead>
              <tbody>
                {movimientosKardex.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ padding: '20px', color: '#888' }}>
                      No hay movimientos registrados para esta prenda.
                    </td>
                  </tr>
                ) : (
                  movimientosKardex.map((m, index) => {
                    const cantEntrada = Number(m.cantEntrada || 0);
                    const cantSalida = Number(m.cantSalida || 0);

                    // Aquí leemos directamente los campos oficiales que procesa el backend
                    const exInicial = Number(m.existenciaInicialCant || 0);
                    const exFinal = Number(m.existenciaFinalCant || 0);

                    return (
                      <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>{m.numero}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>{m.fecha ? new Date(m.fecha).toLocaleDateString() : ''}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>{m.concepto}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>{m.documento}</td>

                        {/* Entradas */}
                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>{cantEntrada > 0 ? cantEntrada : '-'}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>{m.vrUnitarioEntrada ? `$${m.vrUnitarioEntrada.toLocaleString()}` : '-'}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>{m.vrTotalEntrada ? `$${m.vrTotalEntrada.toLocaleString()}` : '-'}</td>

                        {/* Salidas */}
                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>{cantSalida > 0 ? cantSalida : '-'}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>{m.vrUnitarioSalida ? `$${m.vrUnitarioSalida.toLocaleString()}` : '-'}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>{m.vrTotalSalida ? `$${m.vrTotalSalida.toLocaleString()}` : '-'}</td>

                        {/* Existencia Inicial (Cant) */}
                        <td style={{ border: '1px solid #ddd', padding: '6px', fontWeight: 'bold' }}>
                          {exInicial}
                        </td>

                        {/* Existencia Final (Cant) */}
                        <td style={{ border: '1px solid #ddd', padding: '6px', fontWeight: 'bold', color: exFinal < 0 ? '#dc3545' : '#198754' }}>
                          {exFinal}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {movimientosKardex.length > 0 && (
                <tfoot>
                  <tr style={{ background: '#f8f9fa', fontWeight: 'bold', borderTop: '2px solid #ccc' }}>
                    <td colSpan="4" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>TOTALES:</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', color: '#0d6efd' }}>{totalEntradasCant}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>-</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', color: '#0d6efd' }}>${totalEntradasVr.toLocaleString()}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', color: '#dc3545' }}>{totalSalidasCant}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>-</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', color: '#dc3545' }}>${totalSalidasVr.toLocaleString()}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>-</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', color: stockFinalFooter < 0 ? '#dc3545' : '#198754' }}>
                      {stockFinalFooter}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Kardex;