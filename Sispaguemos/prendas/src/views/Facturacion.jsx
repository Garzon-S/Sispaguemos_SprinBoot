import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import '../styles/Facturacion.css';

const palette = {
  ivory: '#FBF3EC',
  ivorySoft: '#F6E9DE',
  white: '#FFFFFF',
  plum: '#1C0F1B',
  plumDeep: '#150B14',
  fucsia: '#E63C86',
  fucsiaDeep: '#C22868',
  gold: '#D9A441',
  sage: '#8CA889',
  sageDeep: '#4E6B4C',
  slate: '#6B5768',
  sand: '#EBDDD2',
};

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function getCarritoKey(usuario) {
  const identificador = usuario?.idUsuario || usuario?.id_usuario || usuario?.id || usuario?.correo || usuario?.email;
  return identificador ? `carrito_${encodeURIComponent(String(identificador).trim().toLowerCase())}` : null;
}

function getComprasKey(usuario) {
  const identificador = usuario?.idUsuario || usuario?.id_usuario || usuario?.id || usuario?.correo || usuario?.email;
  return identificador ? `compras_${encodeURIComponent(String(identificador).trim().toLowerCase())}` : null;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function Facturacion() {
  const navigate = useNavigate();
  const usuario = readStorage('usuarioActual', null);
  const claveCarrito = getCarritoKey(usuario);
  const carrito = claveCarrito ? readStorage(claveCarrito, []) : [];
  const [correoFactura, setCorreoFactura] = useState(usuario?.correo || usuario?.email || '');
  const [error, setError] = useState('');
  const [enviada, setEnviada] = useState(false);
  const [estadoEnvio, setEstadoEnvio] = useState('idle');
  const [metodoPago, setMetodoPago] = useState('paypal-sandbox');
  const [pagoPreparado, setPagoPreparado] = useState(false);
  const [estadoPago, setEstadoPago] = useState('idle');
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';

  const total = carrito.reduce(
    (acumulado, item) => acumulado + Number(item.precio || 0) * Number(item.cantidad || 0),
    0
  );
  const subtotal = total / 1.19;
  const iva = total - subtotal;
  const totalUsd = (total * Number(import.meta.env.VITE_COP_TO_USD_RATE || 0.00025)).toFixed(2);
  const totalUnidades = carrito.reduce((acumulado, item) => acumulado + Number(item.cantidad || 0), 0);
  const nombreCompleto = usuario?.nombreUsuario || usuario?.nombre_usuario
    ? [usuario?.nombreUsuario || usuario?.nombre_usuario, usuario?.apellidoUsuario || usuario?.apellido_usuario]
      .filter(Boolean)
      .join(' ')
    : [usuario?.primerNom, usuario?.segundNom, usuario?.primerApelli, usuario?.segundApelli]
      .filter(Boolean)
      .join(' ');

  const enviarFacturaPorCorreo = async (correoDestino, idVenta = `WEB-${Date.now()}`) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoDestino.trim())) {
      setError('Ingresa un correo electrónico válido.');
      setEstadoEnvio('error');
      return false;
    }
    setError('');
    setEnviada(false);
    setEstadoEnvio('sending');

    const datosFactura = {
      idVenta,
      fecha: new Date().toLocaleString('es-CO'),
      cajero: 'Pague Menos',
      metodoPago,
      total,
      iva: Math.round(total - (total / 1.19)),
      correo_destino: correoDestino.trim(),
      items: carrito,
    };

    try {
      await axios.post('http://localhost:8080/api/ventas/enviar-factura', datosFactura);
      setEnviada(true);
      setEstadoEnvio('success');
    } catch (sendError) {
      console.error('Error enviando factura:', sendError);
      setError('No se pudo enviar la factura. Intenta nuevamente.');
      setEstadoEnvio('error');
      return false;
    }
    return true;
  };

  const registrarPedido = async () => {
    const idUsuario = usuario?.idUsuario || usuario?.id_usuario || usuario?.id;
    if (!idUsuario) throw new Error('No se encontró el usuario de la compra.');

    const response = await axios.post('http://localhost:8080/api/pedidos', {
      total_pedido: total,
      fk_id_usuario: idUsuario,
      detalles: carrito.map((item) => ({
        fk_id_prenda: item.id,
        talla: item.talla || null,
        tipo_talla: item.tipoTalla || null,
        id_talla: item.idTalla || null,
        cantidad: Number(item.cantidad || 0),
        precio_unitario: Number(item.precio || 0),
        subtotal: Number(item.precio || 0) * Number(item.cantidad || 0),
      })),
    });
    return response.data;
  };

  const crearOrdenPayPal = (_data, actions) => actions.order.create({
    purchase_units: [{
      description: 'Compra Pague Menos',
      amount: { currency_code: 'USD', value: totalUsd },
    }],
  });

  const aprobarPagoPayPal = async (_data, actions) => {
    try {
      const detalles = await actions.order.capture();
      setEstadoPago('success');
      setPagoPreparado(false);
      const correoRegistrado = usuario?.correo || usuario?.email || '';
      setCorreoFactura(correoRegistrado);
      setEstadoEnvio('sending');

      const pedido = await registrarPedido();
      const compra = {
        id: pedido.idPedido || `PAYPAL-${detalles.id || Date.now()}`,
        total,
        metodoPago: 'PayPal',
        fecha: pedido.fechaPedido || new Date().toISOString(),
        estado: pedido.estado || 'Pendiente',
        items: carrito,
      };
      const comprasKey = getComprasKey(usuario);
      try {
        if (comprasKey) {
          const comprasAnteriores = readStorage(comprasKey, []);
          localStorage.setItem(comprasKey, JSON.stringify([compra, ...comprasAnteriores]));
        }
      } catch (storageError) {
        console.warn('No se pudo guardar el historial local:', storageError);
      }

      const envioCorrecto = await enviarFacturaPorCorreo(correoRegistrado, compra.id);
      if (!envioCorrecto) setEstadoPago('error');
      return detalles;
    } catch (paymentError) {
      console.error('Error completando compra PayPal:', paymentError);
      const detalleError = paymentError.response?.data;
      setError(typeof detalleError === 'string' ? detalleError : 'El pago fue aprobado, pero no se pudo completar el pedido o enviar la factura.');
      setEstadoEnvio('error');
      setEstadoPago('error');
      return null;
    }
  };

  if (!usuario) {
    return (
      <main className="fc-page">
        <div className="fc-topbar">
          <div className="fc-topbar-inner" style={{ maxWidth: '1200px' }}>
            <span className="fc-brand">
              Pague <span className="fc-brand-accent">Menos</span>
            </span>
          </div>
        </div>
        <div className="fc-page-login" style={{ display: 'grid', placeItems: 'center', padding: '3rem 1.25rem', minHeight: 'calc(100vh - 68px)' }}>
          <section className="fc-panel fc-panel--center">
            <div style={{ fontSize: '2.4rem', marginBottom: '0.6rem' }}>🔒</div>
            <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.6rem', margin: '0 0 0.5rem', color: '#1C0F1B' }}>
              Inicia sesión para continuar
            </h1>
            <p style={{ color: '#6B5768', margin: '0 0 1.4rem', fontSize: '0.95rem' }}>
              Necesitas una cuenta para generar tu factura electrónica.
            </p>
            <button type="button" onClick={() => navigate('/iniciosesionregistro')} className="fc-btn-primary fc-btn-block">
              Iniciar sesión
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="fc-page">
      <div className="fc-topbar">
        <div className="fc-topbar-inner">
          <span className="fc-brand">
            Pague <span className="fc-brand-accent">Menos</span>
          </span>
          <button
            type="button"
            onClick={() => navigate('/catalogo-cliente')}
            className="fc-back-btn"
          >
            <span style={{ fontSize: '1rem' }}>←</span>
            Volver al catálogo
          </button>
        </div>
      </div>

      <div className="fc-content">
        <header className="fc-header">
          <h1 className="fc-header-title">Datos de facturación</h1>
          <p className="fc-header-subtitle">
            Revisa tus datos y elige dónde recibir tu factura electrónica.
          </p>
        </header>

        {enviada && (
          <div role="status" className="fc-success-banner">
            <span className="fc-success-icon">✓</span>
            <p>La factura electrónica fue enviada a {correoFactura.trim()}.</p>
          </div>
        )}

        <div className="fc-layout">
          <section className="fc-panel">
            <h2 className="fc-section-title">Información del comprador</h2>
            <div className="fc-details-grid">
              <div className="fc-field-box">
                <span className="fc-label">Nombre completo</span>
                <strong className="fc-account-value">{nombreCompleto || 'No registrado'}</strong>
              </div>
              <div className="fc-field-box">
                <span className="fc-label">Correo de la cuenta</span>
                <strong className="fc-account-value">{usuario.correo || usuario.email || 'No registrado'}</strong>
              </div>
            </div>
          </section>

          <aside className="fc-panel">
            <h2 className="fc-section-title">
              Resumen de compra{carrito.length > 0 ? ` · ${totalUnidades} artículo${totalUnidades === 1 ? '' : 's'}` : ''}
            </h2>

            {carrito.length === 0 ? (
              <div className="fc-empty-state">
                <div className="fc-empty-icon">🛍️</div>
                <p>Tu carrito está vacío por ahora.</p>
                <button type="button" onClick={() => navigate('/catalogo-cliente')} className="fc-btn-secondary fc-btn-block">
                  Ir al catálogo
                </button>
              </div>
            ) : (
              <>
                <div className="fc-summary-list">
                  {carrito.map((item) => (
                    <div key={`${item.id}::${item.talla || 'sin-talla'}`} className="fc-item-row">
                      <span>
                        <strong>{item.cantidad}x</strong> {item.nombre}
                        <small className="fc-item-size">Talla: {item.talla || 'No especificada'}</small>
                      </span>
                      <strong>{formatCurrency(Number(item.precio || 0) * Number(item.cantidad || 0))}</strong>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid #EBDDD2', marginTop: '1.25rem', paddingTop: '1rem', display: 'grid', gap: '0.55rem' }}>
                  <div className="fc-summary-row">
                    <span>Subtotal</span>
                    <strong>{formatCurrency(subtotal)}</strong>
                  </div>
                  <div className="fc-summary-row">
                    <span>IVA (19%)</span>
                    <strong>{formatCurrency(iva)}</strong>
                  </div>
                  <div className="fc-summary-row fc-summary-total fc-summary-divider">
                    <strong>Total</strong>
                    <strong>{formatCurrency(total)}</strong>
                  </div>
                </div>
              </>
            )}

            <div className="fc-payment-box">
              <h2 className="fc-section-title">Pagar compra</h2>
              <label htmlFor="metodo-pago" className="fc-label">Selecciona el método de pago</label>
              <select
                id="metodo-pago"
                value={metodoPago}
                onChange={(event) => { setMetodoPago(event.target.value); setPagoPreparado(false); }}
                className="fc-select"
              >
                <option value="paypal-sandbox">PayPal</option>
              </select>
              {!pagoPreparado && estadoPago !== 'success' && (
                <button type="button" className="fc-btn-secondary fc-btn-block fc-btn-spaced" onClick={() => setPagoPreparado(true)}>
                  Continuar con PayPal 
                </button>
              )}
              {pagoPreparado && estadoPago !== 'success' && (
                paypalClientId ? (
                  <div className="fc-paypal-area">
                    <p className="fc-payment-caption">
                      Total a pagar: <strong>{totalUsd} USD</strong> (referencia: {formatCurrency(total)}).
                    </p>
                    <PayPalScriptProvider options={{ 'client-id': paypalClientId, currency: 'USD', intent: 'capture' }}>
                      <PayPalButtons
                        style={{ layout: 'vertical', shape: 'rect', label: 'paypal', height: 48 }}
                        createOrder={crearOrdenPayPal}
                        onApprove={aprobarPagoPayPal}
                        onCancel={() => setEstadoPago('cancelled')}
                        onError={(paypalError) => {
                          console.error('Error en PayPal:', paypalError);
                          setEstadoPago('error');
                        }}
                      />
                    </PayPalScriptProvider>
                    {estadoPago === 'cancelled' && <p role="status" className="fc-payment-message">Pago cancelado. Puedes intentarlo nuevamente.</p>}
                    {estadoPago === 'error' && <p role="alert" className="fc-payment-error">No se pudo procesar el pago en PayPal.</p>}
                  </div>
                ) : (
                  <p role="alert" className="fc-payment-error">
                    Configura <strong>VITE_PAYPAL_CLIENT_ID</strong> en el archivo `.env` para activar PayPal.
                  </p>
                )
              )}
              {estadoPago === 'success' && (
                <div role="status" className="fc-payment-success">
                    Pago aprobado correctamente en PayPal.
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {estadoEnvio !== 'idle' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="estado-factura-titulo"
          className="fc-modal-overlay"
        >
          <section className="fc-modal">
            {estadoEnvio === 'sending' && (
              <>
                <div className="fc-spinner" />
                <h2 id="estado-factura-titulo" className="fc-modal-title">Enviando factura electrónica...</h2>
                <p className="fc-modal-text">Estamos enviando la factura a {correoFactura.trim()}.</p>
              </>
            )}

            {estadoEnvio === 'success' && (
              <>
                <div className="fc-success-circle">✓</div>
                <h2 id="estado-factura-titulo" className="fc-modal-title">¡Factura enviada!</h2>
                <p className="fc-modal-text">La factura electrónica fue enviada correctamente a {correoFactura.trim()}.</p>
                <button
                  type="button"
                  onClick={() => {
                    if (claveCarrito) localStorage.removeItem(claveCarrito);
                    localStorage.removeItem('carrito');
                    navigate('/');
                  }}
                  className="fc-btn-primary fc-btn-block"
                >
                  Aceptar
                </button>
              </>
            )}

            {estadoEnvio === 'error' && (
              <>
                <div className="fc-error-circle">!</div>
                <h2 id="estado-factura-titulo" className="fc-modal-title">No se pudo enviar</h2>
                <p className="fc-modal-text">{error}</p>
                <div className="fc-modal-actions">
                  <button type="button" onClick={() => setEstadoEnvio('idle')} className="fc-btn-secondary">
                    Cerrar
                  </button>
                  <button type="button" onClick={() => enviarFacturaPorCorreo(correoFactura)} className="fc-btn-primary">
                    Reintentar
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
