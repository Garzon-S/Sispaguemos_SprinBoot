import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

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
  const nombreCompleto = [usuario?.primerNom, usuario?.segundNom, usuario?.primerApelli, usuario?.segundApelli]
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
      total_estimado: total,
      fk_id_usuario_cliente: idUsuario,
      detalles: carrito.map((item) => ({
        fk_id_prenda: item.id,
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
        metodoPago: 'PayPal Sandbox',
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

  const GlobalStyle = () => (
    <style>{`
      @keyframes fc-slideDown { from { opacity: 0; transform: translateY(-14px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fc-fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fc-pop { 0% { transform: scale(0.4); opacity: 0; } 70% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }

      .fc-topbar { animation: fc-slideDown 0.5s ease both; }
      .fc-panel { animation: fc-fadeUp 0.55s ease both; }
      .fc-success { animation: fc-fadeUp 0.4s ease both; }
      .fc-success-icon { animation: fc-pop 0.45s cubic-bezier(0.34,1.56,0.64,1) 0.1s both; }
      @keyframes fc-spin { to { transform: rotate(360deg); } }
      .fc-spinner { animation: fc-spin 0.85s linear infinite; }

      .fc-back-btn { transition: transform 0.16s ease, background 0.2s ease; }
      .fc-back-btn:hover { transform: translateY(-2px); background: rgba(28,15,27,0.06) !important; }
      .fc-back-btn:active { transform: translateY(0) scale(0.97); }

      .fc-input { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
      .fc-input:focus { border-color: ${palette.fucsia} !important; box-shadow: 0 0 0 4px rgba(230,60,134,0.14); }

      .fc-btn-primary { transition: transform 0.16s ease, box-shadow 0.2s ease; }
      .fc-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 24px rgba(230,60,134,0.3); }
      .fc-btn-primary:active { transform: translateY(0) scale(0.98); }

      .fc-btn-secondary { transition: transform 0.16s ease, background 0.2s ease, color 0.2s ease; }
      .fc-btn-secondary:hover { background: ${palette.plum}; color: #fff !important; }
      .fc-btn-secondary:active { transform: scale(0.98); }

      .fc-item-row { transition: background 0.18s ease; border-radius: 12px; }
      .fc-item-row:hover { background: ${palette.ivorySoft}; }
      html, body { overflow-y: auto !important; }
      .fc-paypal-area { min-width: 0; overflow: visible; }
      .fc-paypal-area iframe { max-width: 100%; }
      .fc-details-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .fc-account-value { display: block; min-width: 0; overflow-wrap: anywhere; word-break: break-word; }

      @media (prefers-reduced-motion: reduce) {
        .fc-topbar, .fc-panel, .fc-success, .fc-success-icon, .fc-spinner { animation: none !important; }
        .fc-back-btn:hover, .fc-btn-primary:hover { transform: none !important; }
      }
      @media (max-width: 640px) {
        .fc-details-grid { grid-template-columns: 1fr; }
      }
    `}</style>
  );

  if (!usuario) {
    return (
      <main style={{ minHeight: '100vh', width: '100%', background: palette.ivory, boxSizing: 'border-box' }}>
        <GlobalStyle />
        <div className="fc-topbar" style={{ background: palette.white, padding: '1rem 1.25rem', borderBottom: `1px solid rgba(28,15,27,0.08)` }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.35rem', fontWeight: 700, color: palette.plum }}>
              Pague <span style={{ fontStyle: 'italic', color: palette.fucsia }}>Menos</span>
            </span>
          </div>
        </div>
        <div style={{ display: 'grid', placeItems: 'center', padding: '3rem 1.25rem', minHeight: 'calc(100vh - 68px)' }}>
          <section className="fc-panel" style={{ ...panelStyle, textAlign: 'center', maxWidth: '420px' }}>
            <div style={{ fontSize: '2.4rem', marginBottom: '0.6rem' }}>🔒</div>
            <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.6rem', margin: '0 0 0.5rem', color: palette.plum }}>
              Inicia sesión para continuar
            </h1>
            <p style={{ color: palette.slate, margin: '0 0 1.4rem', fontSize: '0.95rem' }}>
              Necesitas una cuenta para generar tu factura electrónica.
            </p>
            <button type="button" onClick={() => navigate('/iniciosesionregistro')} className="fc-btn-primary" style={{ ...primaryButtonStyle, width: '100%' }}>
              Iniciar sesión
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', width: '100%', background: palette.ivory, color: palette.plum, boxSizing: 'border-box' }}>
      <GlobalStyle />

      <div className="fc-topbar" style={{ background: palette.white, padding: '1rem 1.25rem', borderBottom: `1px solid rgba(28,15,27,0.08)` }}>
        <div style={{ maxWidth: '1050px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.35rem', fontWeight: 700, color: palette.plum }}>
            Pague <span style={{ fontStyle: 'italic', color: palette.fucsia }}>Menos</span>
          </span>
          <button
            type="button"
            onClick={() => navigate('/catalogo-cliente')}
            className="fc-back-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'transparent',
              border: `1px solid rgba(28,15,27,0.15)`,
              color: palette.plum,
              borderRadius: '999px',
              padding: '0.55rem 1.05rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '1rem' }}>←</span>
            Volver al catálogo
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1050px', margin: '0 auto', padding: '2.2rem 1.25rem 4rem' }}>
        <header style={{ margin: '0 0 2rem', animation: 'fc-fadeUp 0.5s ease both' }}>
          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', margin: '0 0 0.5rem', color: palette.plum, lineHeight: 1.15 }}>
            Datos de facturación
          </h1>
          <p style={{ color: palette.slate, margin: 0, fontSize: '1rem' }}>
            Revisa tus datos y elige dónde recibir tu factura electrónica.
          </p>
        </header>

        {enviada && (
          <div role="status" className="fc-success" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            background: '#EAF3E8',
            border: `1px solid ${palette.sage}`,
            borderRadius: '16px',
            padding: '1rem 1.2rem',
            marginBottom: '1.4rem',
            color: palette.sageDeep,
          }}>
            <span className="fc-success-icon" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: palette.sage,
              color: '#fff',
              fontSize: '1.1rem',
              flexShrink: 0,
            }}>✓</span>
            <p style={{ margin: 0, fontWeight: 700 }}>
              La factura electrónica fue enviada a {correoFactura.trim()}.
            </p>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.1fr) minmax(280px, 0.9fr)',
          gap: '1.4rem',
          alignItems: 'start',
        }}>
          <section className="fc-panel" style={{ ...panelStyle, animationDelay: '0.05s' }}>
            <h2 style={headingStyle}>Información del comprador</h2>
            <div className="fc-details-grid" style={detailsGridStyle}>
              <div style={{ ...fieldBoxStyle, minWidth: 0 }}>
                <span style={labelStyle}>Nombre completo</span>
                <strong className="fc-account-value">{nombreCompleto || 'No registrado'}</strong>
              </div>
              <div style={{ ...fieldBoxStyle, minWidth: 0 }}>
                <span style={labelStyle}>Correo de la cuenta</span>
                <strong className="fc-account-value">{usuario.correo || usuario.email || 'No registrado'}</strong>
              </div>
            </div>

          </section>

          <aside className="fc-panel" style={{ ...panelStyle, animationDelay: '0.12s' }}>
            <h2 style={headingStyle}>
              Resumen de compra{carrito.length > 0 ? ` · ${totalUnidades} artículo${totalUnidades === 1 ? '' : 's'}` : ''}
            </h2>

            {carrito.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛍️</div>
                <p style={{ color: palette.slate, margin: '0 0 1.1rem', fontSize: '0.92rem' }}>
                  Tu carrito está vacío por ahora.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/catalogo-cliente')}
                  className="fc-btn-secondary"
                  style={{ ...secondaryButtonStyle, width: '100%' }}
                >
                  Ir al catálogo
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gap: '0.3rem' }}>
                  {carrito.map((item) => (
                    <div key={item.id} className="fc-item-row" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.6rem 0.5rem', borderBottom: `1px solid ${palette.sand}` }}>
                      <span><strong>{item.cantidad}x</strong> {item.nombre}</span>
                      <strong>{formatCurrency(Number(item.precio || 0) * Number(item.cantidad || 0))}</strong>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: `1px solid ${palette.sand}`, marginTop: '1.25rem', paddingTop: '1rem', display: 'grid', gap: '0.55rem' }}>
                  <div style={summaryRowStyle}>
                    <span>Subtotal</span>
                    <strong>{formatCurrency(subtotal)}</strong>
                  </div>
                  <div style={summaryRowStyle}>
                    <span>IVA (19%)</span>
                    <strong>{formatCurrency(iva)}</strong>
                  </div>
                  <div style={{ ...summaryRowStyle, marginTop: '0.35rem', paddingTop: '0.8rem', borderTop: `1px solid ${palette.sand}`, fontSize: '1.15rem' }}>
                    <strong>Total</strong>
                    <strong style={{ color: palette.fucsiaDeep, fontSize: '1.3rem' }}>{formatCurrency(total)}</strong>
                  </div>
                </div>
              </>
            )}

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: `1px solid ${palette.sand}` }}>
              <h2 style={headingStyle}>Pagar compra</h2>
              <label htmlFor="metodo-pago" style={labelStyle}>Selecciona el método de pago</label>
              <select
                id="metodo-pago"
                value={metodoPago}
                onChange={(event) => { setMetodoPago(event.target.value); setPagoPreparado(false); }}
                style={selectStyle}
              >
                <option value="paypal-sandbox">PayPal Sandbox</option>
              </select>
              {!pagoPreparado && estadoPago !== 'success' && (
                <button
                  type="button"
                  className="fc-btn-secondary"
                  onClick={() => setPagoPreparado(true)}
                  style={{ ...secondaryButtonStyle, width: '100%', marginTop: '0.9rem' }}
                >
                  Continuar con PayPal Sandbox
                </button>
              )}
              {pagoPreparado && estadoPago !== 'success' && (
                paypalClientId ? (
                  <div className="fc-paypal-area" style={{ marginTop: '1rem', padding: '1rem', borderRadius: '14px', background: palette.white, border: `1px solid ${palette.sand}` }}>
                    <p style={{ color: palette.slate, fontSize: '0.82rem', margin: '0 0 0.75rem', lineHeight: 1.45 }}>
                      Total a pagar: <strong>{totalUsd} USD</strong> (referencia: {formatCurrency(total)}).
                    </p>
                    <PayPalScriptProvider options={{ 'client-id': paypalClientId, currency: 'USD', intent: 'capture' }}>
                      <PayPalButtons
                        style={{ layout: 'vertical', shape: 'rect', label: 'paypal', height: 48 }}
                        createOrder={crearOrdenPayPal}
                        onApprove={aprobarPagoPayPal}
                        onCancel={() => setEstadoPago('cancelled')}
                        onError={(paypalError) => {
                          console.error('Error en PayPal Sandbox:', paypalError);
                          setEstadoPago('error');
                        }}
                      />
                    </PayPalScriptProvider>
                    {estadoPago === 'cancelled' && <p role="status" style={paymentMessageStyle}>Pago cancelado. Puedes intentarlo nuevamente.</p>}
                    {estadoPago === 'error' && <p role="alert" style={paymentErrorStyle}>No se pudo procesar el pago en PayPal Sandbox.</p>}
                  </div>
                ) : (
                  <p role="alert" style={paymentErrorStyle}>
                    Configura <strong>VITE_PAYPAL_CLIENT_ID</strong> en el archivo `.env` para activar PayPal Sandbox.
                  </p>
                )
              )}
              {estadoPago === 'success' && (
                <div role="status" style={paymentSuccessStyle}>
                  Pago aprobado correctamente en PayPal Sandbox.
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
          style={modalOverlayStyle}
        >
          <section style={modalStyle}>
            {estadoEnvio === 'sending' && (
              <>
                <div className="fc-spinner" style={spinnerStyle} />
                <h2 id="estado-factura-titulo" style={modalTitleStyle}>Enviando factura electrónica...</h2>
                <p style={modalTextStyle}>Estamos enviando la factura a {correoFactura.trim()}.</p>
              </>
            )}

            {estadoEnvio === 'success' && (
              <>
                <div style={successCircleStyle}>✓</div>
                <h2 id="estado-factura-titulo" style={modalTitleStyle}>¡Factura enviada!</h2>
                <p style={modalTextStyle}>La factura electrónica fue enviada correctamente a {correoFactura.trim()}.</p>
                <button
                  type="button"
                  onClick={() => {
                    if (claveCarrito) localStorage.removeItem(claveCarrito);
                    localStorage.removeItem('carrito');
                    navigate('/');
                  }}
                  className="fc-btn-primary"
                  style={{ ...primaryButtonStyle, width: '100%' }}
                >
                  Aceptar
                </button>
              </>
            )}

            {estadoEnvio === 'error' && (
              <>
                <div style={errorCircleStyle}>!</div>
                <h2 id="estado-factura-titulo" style={modalTitleStyle}>No se pudo enviar</h2>
                <p style={modalTextStyle}>{error}</p>
                <div style={{ display: 'flex', gap: '0.7rem' }}>
                  <button type="button" onClick={() => setEstadoEnvio('idle')} className="fc-btn-secondary" style={{ ...secondaryButtonStyle, flex: 1 }}>
                    Cerrar
                  </button>
                  <button type="button" onClick={() => enviarFacturaPorCorreo(correoFactura)} className="fc-btn-primary" style={{ ...primaryButtonStyle, flex: 1 }}>
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

const panelStyle = {
  background: palette.white,
  border: `1px solid ${palette.sand}`,
  borderRadius: '24px',
  padding: '1.6rem',
  boxShadow: '0 18px 34px rgba(28,15,27,0.07)',
};

const headingStyle = { fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.2rem', margin: '0 0 1.1rem', color: palette.plum, fontWeight: 700 };
const labelStyle = { display: 'block', color: palette.slate, fontSize: '0.78rem', marginBottom: '0.35rem' };
const detailsGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.9rem' };
const summaryRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: palette.plum };
const fieldBoxStyle = { background: palette.ivorySoft, borderRadius: '14px', padding: '0.8rem 0.95rem' };
const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '0.85rem 1rem',
  border: '1px solid',
  borderRadius: '12px',
  background: palette.ivory,
  color: palette.plum,
  fontSize: '1rem',
  outline: 'none',
};
const selectStyle = {
  ...inputStyle,
  appearance: 'auto',
  cursor: 'pointer',
};
const primaryButtonStyle = {
  border: 'none',
  borderRadius: '12px',
  padding: '0.85rem 1.1rem',
  background: `linear-gradient(135deg, ${palette.fucsia} 0%, ${palette.fucsiaDeep} 100%)`,
  color: palette.white,
  fontWeight: 800,
  fontSize: '0.95rem',
  cursor: 'pointer',
  boxShadow: '0 10px 18px rgba(230,60,134,0.25)',
};
const secondaryButtonStyle = {
  border: `1px solid ${palette.plum}`,
  borderRadius: '12px',
  padding: '0.85rem 1.1rem',
  background: 'transparent',
  color: palette.plum,
  fontWeight: 800,
  fontSize: '0.95rem',
  cursor: 'pointer',
};
const paymentMessageStyle = { color: palette.slate, fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.45, margin: '0.7rem 0 0' };
const paymentErrorStyle = { color: '#C0392B', background: '#FCEDEC', borderRadius: '10px', padding: '0.75rem', fontSize: '0.82rem', lineHeight: 1.45, margin: '0.9rem 0 0' };
const paymentSuccessStyle = { color: palette.sageDeep, background: '#EAF3E8', border: `1px solid ${palette.sage}`, borderRadius: '10px', padding: '0.8rem', fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.45, marginTop: '0.9rem' };
const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  display: 'grid',
  placeItems: 'center',
  padding: '1.25rem',
  background: 'rgba(21,11,20,0.48)',
  backdropFilter: 'blur(4px)',
};
const modalStyle = {
  width: 'min(100%, 430px)',
  boxSizing: 'border-box',
  padding: '2rem 1.6rem',
  borderRadius: '22px',
  background: palette.white,
  textAlign: 'center',
  boxShadow: '0 24px 60px rgba(21,11,20,0.25)',
};
const spinnerStyle = {
  width: '58px',
  height: '58px',
  margin: '0 auto 1.4rem',
  border: `6px solid ${palette.ivorySoft}`,
  borderTopColor: palette.fucsia,
  borderRadius: '50%',
};
const successCircleStyle = {
  width: '68px',
  height: '68px',
  margin: '0 auto 1rem',
  display: 'grid',
  placeItems: 'center',
  borderRadius: '50%',
  background: palette.sage,
  color: palette.white,
  fontSize: '2rem',
  fontWeight: 800,
};
const errorCircleStyle = { ...successCircleStyle, background: '#C0392B' };
const modalTitleStyle = { margin: '0 0 0.6rem', color: palette.plum, fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.45rem' };
const modalTextStyle = { margin: '0 0 1.5rem', color: palette.slate, lineHeight: 1.5, fontSize: '0.92rem' };
