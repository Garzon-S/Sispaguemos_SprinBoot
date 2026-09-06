import { useEffect, useState } from 'react';
import axios from 'axios';

function Kardex() {
  const [prendas, setPrendas] = useState([]);
  const [prendaSeleccionada, setPrendaSeleccionada] = useState('');
  const [movimientosKardex, setMovimientosKardex] = useState([]);
  const [error, setError] = useState('');

  // Cargar lista de prendas para el selector
  useEffect(() => {
    axios.get('http://localhost:8080/api/prendas')
      .then(res => setPrendas(res.data))
      .catch(err => console.error("Error al cargar prendas", err));
  }, []);

  // Cargar Kardex al cambiar de prenda
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

  // Cálculo dinámico de totales acumulados para la tabla
  const totalEntradasCant = movimientosKardex.reduce((acc, m) => acc + Number(m.cantEntrada || 0), 0);
  const totalEntradasVr = movimientosKardex.reduce((acc, m) => acc + Number(m.vrTotalEntrada || 0), 0);
  const totalSalidasCant = movimientosKardex.reduce((acc, m) => acc + Number(m.cantSalida || 0), 0);
  const totalSalidasVr = movimientosKardex.reduce((acc, m) => acc + Number(m.vrTotalSalida || 0), 0);

  // El último saldo registrado representa el estado actual acumulado de la bodega
  const ultimoMovimiento = movimientosKardex[movimientosKardex.length - 1] || {};
  const saldoFinalCant = ultimoMovimiento.saldoCantidad || 0;
  const saldoFinalVrTotal = ultimoMovimiento.saldoTotal || 0;

  return (
    <div className="inventario-content">
      <div className="dashboard-cards-grid">
        <div className="dash-card">
          <h3>CONTABILIDAD</h3>
          <h1>Kardex de Inventario (Método Promedio Ponderado)</h1>
          <p>Selecciona una prenda para visualizar su tarjeta de control de entradas, salidas y saldos.</p>
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
        <div className="table-responsive" style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflowX: 'auto', marginTop: '20px' }}>
          <table className="tabla-kardex" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                <th rowSpan="2" style={{ border: '1px solid #ddd', padding: '10px' }}>No.</th>
                <th rowSpan="2" style={{ border: '1px solid #ddd', padding: '10px' }}>Fecha</th>
                <th rowSpan="2" style={{ border: '1px solid #ddd', padding: '10px' }}>Concepto</th>
                <th rowSpan="2" style={{ border: '1px solid #ddd', padding: '10px' }}>Documento</th>
                <th colSpan="3" style={{ border: '1px solid #ddd', background: '#e3f2fd', padding: '8px' }}>Entradas</th>
                <th colSpan="3" style={{ border: '1px solid #ddd', background: '#ffebee', padding: '8px' }}>Salidas</th>
                <th colSpan="3" style={{ border: '1px solid #ddd', background: '#e8f5e9', padding: '8px' }}>Saldos</th>
              </tr>
              <tr style={{ background: '#f1f3f5', fontSize: '12px' }}>
                {/* Entradas */}
                <th style={{ border: '1px solid #ddd', padding: '6px' }}>Cant</th>
                <th style={{ border: '1px solid #ddd', padding: '6px' }}>Vr. Unit</th>
                <th style={{ border: '1px solid #ddd', padding: '6px' }}>Vr. Total</th>
                {/* Salidas */}
                <th style={{ border: '1px solid #ddd', padding: '6px' }}>Cant</th>
                <th style={{ border: '1px solid #ddd', padding: '6px' }}>Vr. Unit</th>
                <th style={{ border: '1px solid #ddd', padding: '6px' }}>Vr. Total</th>
                {/* Saldos */}
                <th style={{ border: '1px solid #ddd', padding: '6px' }}>Cant</th>
                <th style={{ border: '1px solid #ddd', padding: '6px' }}>Vr. Unit</th>
                <th style={{ border: '1px solid #ddd', padding: '6px' }}>Vr. Total</th>
              </tr>
            </thead>
            <tbody>
              {movimientosKardex.length === 0 ? (
                <tr>
                  <td colSpan="13" style={{ padding: '20px', color: '#888' }}>
                    No hay movimientos registrados para esta prenda.
                  </td>
                </tr>
              ) : (
                movimientosKardex.map((m, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.numero}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(m.fecha).toLocaleDateString()}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.concepto}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.documento}</td>

                    {/* Entradas */}
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.cantEntrada || '-'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.vrUnitarioEntrada ? `$${m.vrUnitarioEntrada.toLocaleString()}` : '-'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.vrTotalEntrada ? `$${m.vrTotalEntrada.toLocaleString()}` : '-'}</td>

                    {/* Salidas */}
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.cantSalida || '-'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.vrUnitarioSalida ? `$${m.vrUnitarioSalida.toLocaleString()}` : '-'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{m.vrTotalSalida ? `$${m.vrTotalSalida.toLocaleString()}` : '-'}</td>

                    {/* Saldos (Condicional rojo si es negativo) */}
                    <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', color: m.saldoCantidad < 0 ? '#dc3545' : 'inherit' }}>
                      {m.saldoCantidad}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>${m.saldoVrUnitario.toLocaleString()}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', color: m.saldoTotal < 0 ? '#dc3545' : '#198754' }}>
                      ${m.saldoTotal.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {movimientosKardex.length > 0 && (
              <tfoot>
                <tr style={{ background: '#f8f9fa', fontWeight: 'bold', borderTop: '2px solid #ccc' }}>
                  <td colSpan="4" style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>TOTALES ACUMULADOS:</td>
                  {/* Totales Entradas */}
                  <td style={{ border: '1px solid #ddd', padding: '10px', color: '#0d6efd' }}>{totalEntradasCant}</td>
                  <td style={{ border: '1px solid #ddd', padding: '10px' }}>-</td>
                  <td style={{ border: '1px solid #ddd', padding: '10px', color: '#0d6efd' }}>${totalEntradasVr.toLocaleString()}</td>
                  {/* Totales Salidas */}
                  <td style={{ border: '1px solid #ddd', padding: '10px', color: '#dc3545' }}>{totalSalidasCant}</td>
                  <td style={{ border: '1px solid #ddd', padding: '10px' }}>-</td>
                  <td style={{ border: '1px solid #ddd', padding: '10px', color: '#dc3545' }}>${totalSalidasVr.toLocaleString()}</td>
                  {/* Saldo Final Actual */}
                  <td style={{ border: '1px solid #ddd', padding: '10px', color: saldoFinalCant < 0 ? '#dc3545' : '#198754' }}>{saldoFinalCant}</td>
                  <td style={{ border: '1px solid #ddd', padding: '10px' }}>-</td>
                  <td style={{ border: '1px solid #ddd', padding: '10px', color: saldoFinalVrTotal < 0 ? '#dc3545' : '#198754' }}>${saldoFinalVrTotal.toLocaleString()}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}

export default Kardex;