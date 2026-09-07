import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import '../styles/proveedores.css';

const API = 'http://localhost:8080/api';
const emptyProvider = { nombreProveedor: '', nitProveedor: '', telefonoProveedor: '', correoProveedor: '', direccionProveedor: '' };
const emptyInvoice = { estado: 'Recibida', idPrenda: '', cantidadPedida: 1, cantidadRecibida: 0, precioCompra: '', impuesto: 0, observaciones: '' };

const formatCurrency = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(value || 0));
const formatDate = (value) => value ? new Date(value).toLocaleDateString('es-CO') : 'Sin fecha';

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [prendas, setPrendas] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [modalProveedor, setModalProveedor] = useState(false);
  const [modalFactura, setModalFactura] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [formProveedor, setFormProveedor] = useState(emptyProvider);
  const [formFactura, setFormFactura] = useState(emptyInvoice);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [proveedoresResponse, facturasResponse, prendasResponse] = await Promise.all([
        axios.get(`${API}/proveedores`),
        axios.get(`${API}/facturas-proveedor`),
        axios.get(`${API}/prendas`),
      ]);
      setProveedores(Array.isArray(proveedoresResponse.data) ? proveedoresResponse.data : []);
      setFacturas(Array.isArray(facturasResponse.data) ? facturasResponse.data : []);
      setPrendas(Array.isArray(prendasResponse.data) ? prendasResponse.data : prendasResponse.data?.value || []);
      setError('');
    } catch (requestError) {
      console.error('Error cargando proveedores:', requestError);
      setError('No se pudieron cargar proveedores, facturas o prendas.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const facturasDelProveedor = useMemo(() => {
    if (!proveedorSeleccionado) return [];
    return facturas.filter((factura) => String(factura.proveedor?.idProveedor || factura.proveedor?.id_proveedor || factura.fkIdProveedor) === String(proveedorSeleccionado.idProveedor));
  }, [facturas, proveedorSeleccionado]);

  const guardarProveedor = async (event) => {
    event.preventDefault();
    setGuardando(true);
    try {
      await axios.post(`${API}/proveedores`, formProveedor);
      setFormProveedor(emptyProvider);
      setModalProveedor(false);
      await cargarDatos();
    } catch (requestError) {
      console.error(requestError);
      setError('No se pudo registrar el proveedor.');
    } finally { setGuardando(false); }
  };

  const guardarFactura = async (event) => {
    event.preventDefault();
    const usuario = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
    const idUsuario = usuario.id || usuario.idUsuario || usuario.id_usuario;
    const prenda = prendas.find((item) => String(item.idPrenda || item.id_prenda) === String(formFactura.idPrenda));
    if (!idUsuario || !prenda) {
      setError('Selecciona una prenda y verifica la sesión administrativa.');
      return;
    }

    const cantidad = Number(formFactura.cantidadPedida || 0);
    const precio = Number(formFactura.precioCompra || 0);
    const impuesto = Number(formFactura.impuesto || 0);
    const subtotal = cantidad * precio;
    setGuardando(true);
    try {
      await axios.post(`${API}/facturas-proveedor`, {
        estado: formFactura.estado,
        subtotal,
        impuesto,
        total: subtotal + impuesto,
        observaciones: formFactura.observaciones,
        proveedor: { idProveedor: proveedorSeleccionado.idProveedor },
        usuario: { id: idUsuario },
        detalles: [{
          cantidadPedida: cantidad,
          cantidadRecibida: Number(formFactura.cantidadRecibida || 0),
          precioCompra: precio,
          prenda: { idPrenda: prenda.idPrenda || prenda.id_prenda },
          estado: formFactura.estado,
        }],
      });
      setModalFactura(false);
      setFormFactura(emptyInvoice);
      await cargarDatos();
    } catch (requestError) {
      console.error(requestError);
      setError('No se pudo registrar la factura.');
    } finally { setGuardando(false); }
  };

  return (
    <div className="proveedores-container">
      <div className="proveedores-header">
        <div>
          <span className="section-kicker">Abastecimiento</span>
          <h2>Proveedores</h2>
          <p>Consulta contactos, compras e historial de cada proveedor.</p>
        </div>
        <button type="button" onClick={() => setModalProveedor(true)} className="btn-nuevo-proveedor">+ Registrar proveedor</button>
      </div>

      {error && <div className="proveedores-error">{error}</div>}

      {cargando ? (
        <div className="proveedores-empty">Cargando proveedores...</div>
      ) : (
        <div className="tabla-container">
          <table className="tabla-proveedores">
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>NIT</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.length === 0 ? (
                <tr><td colSpan="6" className="proveedores-empty">No hay proveedores registrados.</td></tr>
              ) : (
                proveedores.map((proveedor) => (
                  <tr key={proveedor.idProveedor}>
                    <td><strong>{proveedor.nombreProveedor}</strong></td>
                    <td>{proveedor.nitProveedor || 'N/A'}</td>
                    <td>{proveedor.telefonoProveedor || 'N/A'}</td>
                    <td>{proveedor.correoProveedor || 'N/A'}</td>
                    <td><span className="provider-status">{proveedor.estado || 'Activo'}</span></td>
                    <td>
                      <button type="button" className="btn-detalles" onClick={() => { setProveedorSeleccionado(proveedor); setFormFactura(emptyInvoice); }}>
                        Ver perfil
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalProveedor && (
        <div className="modal-overlay" onClick={() => setModalProveedor(false)}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <h3>Registrar proveedor</h3>
            <form onSubmit={guardarProveedor}>
              <div className="form-group">
                <label>Nombre</label>
                <input required value={formProveedor.nombreProveedor} onChange={(event) => setFormProveedor({ ...formProveedor, nombreProveedor: event.target.value })} />
              </div>
              <div className="form-group">
                <label>NIT</label>
                <input required value={formProveedor.nitProveedor} onChange={(event) => setFormProveedor({ ...formProveedor, nitProveedor: event.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input value={formProveedor.telefonoProveedor} onChange={(event) => setFormProveedor({ ...formProveedor, telefonoProveedor: event.target.value })} />
                </div>
                <div className="form-group">
                  <label>Correo</label>
                  <input type="email" value={formProveedor.correoProveedor} onChange={(event) => setFormProveedor({ ...formProveedor, correoProveedor: event.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input value={formProveedor.direccionProveedor} onChange={(event) => setFormProveedor({ ...formProveedor, direccionProveedor: event.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={() => setModalProveedor(false)}>Cancelar</button>
                <button disabled={guardando} type="submit" className="btn-guardar">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {proveedorSeleccionado && (
        <div className="provider-drawer-overlay" onClick={() => { setProveedorSeleccionado(null); setModalFactura(false); setFacturaSeleccionada(null); }}>
          <aside className="provider-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <span className="section-kicker">Perfil del proveedor</span>
                <h2>{proveedorSeleccionado.nombreProveedor}</h2>
              </div>
              <button type="button" className="drawer-close" onClick={() => setProveedorSeleccionado(null)}>×</button>
            </div>

            <div className="provider-contact-grid">
              <div><small>NIT</small><strong>{proveedorSeleccionado.nitProveedor || 'N/A'}</strong></div>
              <div><small>Teléfono</small><strong>{proveedorSeleccionado.telefonoProveedor || 'N/A'}</strong></div>
              <div><small>Correo</small><strong>{proveedorSeleccionado.correoProveedor || 'N/A'}</strong></div>
              <div><small>Dirección</small><strong>{proveedorSeleccionado.direccionProveedor || 'N/A'}</strong></div>
            </div>

            <div className="drawer-section-heading">
              <div>
                <h3>Historial de facturas</h3>
                <p>{facturasDelProveedor.length} compras registradas</p>
              </div>
              <button type="button" className="btn-nuevo-proveedor" onClick={() => setModalFactura(true)}>+ Nueva factura</button>
            </div>

            <div className="invoice-history">
              {facturasDelProveedor.length === 0 ? (
                <p className="proveedores-empty">Este proveedor aún no tiene facturas.</p>
              ) : (
                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th>Factura</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facturasDelProveedor.map((factura) => (
                      <tr
                        key={factura.idFacturaProveedor}
                        className="invoice-row"
                        onClick={() => setFacturaSeleccionada(factura)}
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setFacturaSeleccionada(factura);
                          }
                        }}
                        role="button"
                      >
                        <td>{factura.numeroFactura}</td>
                        <td>{formatDate(factura.fechaPedido)}</td>
                        <td><span className="provider-status">{factura.estado}</span></td>
                        <td>{formatCurrency(factura.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </aside>
        </div>
      )}

      {facturaSeleccionada && (
        <div className="modal-overlay modal-overlay-front" onClick={() => setFacturaSeleccionada(null)}>
          <div className="modal-content detail-modal" onClick={(event) => event.stopPropagation()}>
            <div className="detail-header">
              <div>
                <span className="section-kicker">Detalle de factura</span>
                <h3>{facturaSeleccionada.numeroFactura}</h3>
              </div>
              <button type="button" className="drawer-close" onClick={() => setFacturaSeleccionada(null)}>×</button>
            </div>

            <div className="detail-grid">
              <div><small>Proveedor</small><strong>{proveedorSeleccionado?.nombreProveedor || 'Proveedor'}</strong></div>
              <div><small>Fecha</small><strong>{formatDate(facturaSeleccionada.fechaPedido)}</strong></div>
              <div><small>Estado</small><strong><span className="provider-status">{facturaSeleccionada.estado}</span></strong></div>
              <div><small>Total</small><strong>{formatCurrency(facturaSeleccionada.total)}</strong></div>
            </div>

            <div className="detail-section">
              <h4>Productos</h4>
              {(facturaSeleccionada.detalles || []).length === 0 ? (
                <p className="proveedores-empty">No hay detalle asociado.</p>
              ) : (
                <table className="detail-items-table">
                  <thead>
                    <tr>
                      <th>Prenda</th>
                      <th>Cant.</th>
                      <th>Precio</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(facturaSeleccionada.detalles || []).map((detalle, index) => (
                      <tr key={detalle.idDetalleFactura || `${facturaSeleccionada.idFacturaProveedor}-${index}`}>
                        <td>{detalle.prenda?.nombrePrend || detalle.prenda?.nombre_prend || 'Prenda sin nombre'}</td>
                        <td>{detalle.cantidadPedida || detalle.cantidadRecibida || 0}</td>
                        <td>{formatCurrency(detalle.precioCompra)}</td>
                        <td>{formatCurrency(detalle.subtotal || (Number(detalle.cantidadPedida || detalle.cantidadRecibida || 0) * Number(detalle.precioCompra || 0)))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="detail-section">
              <h4>Observaciones</h4>
              <p>{facturaSeleccionada.observaciones || 'Sin observaciones.'}</p>
            </div>

            <div className="detail-summary">
              <div><span>Subtotal</span><strong>{formatCurrency(facturaSeleccionada.subtotal)}</strong></div>
              <div><span>Impuesto</span><strong>{formatCurrency(facturaSeleccionada.impuesto)}</strong></div>
              <div><span>Total</span><strong>{formatCurrency(facturaSeleccionada.total)}</strong></div>
            </div>
          </div>
        </div>
      )}

      {modalFactura && proveedorSeleccionado && (
        <div className="modal-overlay modal-overlay-front" onClick={() => setModalFactura(false)}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <h3>Nueva factura para {proveedorSeleccionado.nombreProveedor}</h3>
            <p className="generated-invoice-note">El número de factura se generará automáticamente al guardar.</p>
            <form onSubmit={guardarFactura}>
              <div className="form-row">
                <div className="form-group">
                  <label>Estado de recepción</label>
                  <select required value={formFactura.estado} onChange={(event) => setFormFactura({ ...formFactura, estado: event.target.value })}>
                    <option value="Recibida">Recibida</option>
                    <option value="Incompleta">Incompleta</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Prenda</label>
                  <select required value={formFactura.idPrenda} onChange={(event) => setFormFactura({ ...formFactura, idPrenda: event.target.value })}>
                    <option value="">Selecciona</option>
                    {prendas.map((prenda) => (
                      <option key={prenda.idPrenda || prenda.id_prenda} value={prenda.idPrenda || prenda.id_prenda}>
                        {prenda.nombrePrend || prenda.nombre_prend}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cantidad pedida</label>
                  <input required min="1" type="number" value={formFactura.cantidadPedida} onChange={(event) => setFormFactura({ ...formFactura, cantidadPedida: event.target.value })} />
                </div>
                <div className="form-group">
                  <label>Precio de compra</label>
                  <input required min="0" type="number" value={formFactura.precioCompra} onChange={(event) => setFormFactura({ ...formFactura, precioCompra: event.target.value })} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cantidad recibida</label>
                  <input min="0" type="number" value={formFactura.cantidadRecibida} onChange={(event) => setFormFactura({ ...formFactura, cantidadRecibida: event.target.value })} />
                </div>
                <div className="form-group">
                  <label>Impuesto</label>
                  <input min="0" type="number" value={formFactura.impuesto} onChange={(event) => setFormFactura({ ...formFactura, impuesto: event.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Observaciones</label>
                <textarea rows="3" value={formFactura.observaciones} onChange={(event) => setFormFactura({ ...formFactura, observaciones: event.target.value })} />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={() => setModalFactura(false)}>Cancelar</button>
                <button disabled={guardando} type="submit" className="btn-guardar">{guardando ? 'Guardando...' : 'Registrar factura'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
