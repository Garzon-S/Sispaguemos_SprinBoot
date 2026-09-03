import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const palette = {
  ivory: '#FBF3EC',
  ivorySoft: '#F6E9DE',
  white: '#FFFFFF',
  plum: '#1C0F1B',
  fucsia: '#E63C86',
  fucsiaDeep: '#C22868',
  gold: '#D9A441',
  sage: '#71906E',
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

function getUserKey(usuario) {
  const identificador = usuario?.idUsuario || usuario?.id_usuario || usuario?.id || usuario?.correo || usuario?.email;
  return identificador ? encodeURIComponent(String(identificador).trim().toLowerCase()) : null;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-CO');
}

function estadoInfo(estado) {
  const e = String(estado || 'Pendiente').trim().toLowerCase();
  if (e.includes('cancel')) return { label: estado || 'Cancelado', bg: '#FBE3E0', text: '#9C3B2E', dot: '#C0392B', pulse: false };
  if (e.includes('listo')) return { label: estado || 'Listo en tienda', bg: '#E5F1E4', text: palette.sage, dot: palette.sage, pulse: false };
  if (e.includes('envi') || e.includes('proceso') || e.includes('transito')) return { label: estado || 'En proceso', bg: '#E4ECF7', text: '#2E4C7A', dot: '#4472C4', pulse: true };
  if (e.includes('pendient')) return { label: estado || 'Pendiente', bg: '#FBEDD3', text: '#8A6116', dot: palette.gold, pulse: true };
  return { label: estado || 'Completado', bg: '#E5F1E4', text: palette.sage, dot: palette.sage, pulse: false };
}

export default function Compras() {
  const navigate = useNavigate();
  const usuario = readStorage('usuarioActual', null);
  const userKey = getUserKey(usuario);
  const comprasGuardadas = userKey ? readStorage(`compras_${userKey}`, []) : [];
  const [compras, setCompras] = useState(comprasGuardadas);
  const [cargando, setCargando] = useState(true);
  const [expandidas, setExpandidas] = useState(() => new Set());
  const rol = String(usuario?.rol || '').trim().toLowerCase();

  useEffect(() => {
    const idUsuario = usuario?.idUsuario || usuario?.id_usuario || usuario?.id;
    if (!idUsuario || !rol.includes('cliente')) {
      setCargando(false);
      return;
    }

    axios.get(`http://localhost:8080/api/pedidos/usuario/${idUsuario}`)
      .then(({ data }) => {
        const detallesLocales = new Map(comprasGuardadas.map((compra) => [String(compra.id), compra]));
        setCompras(data.map((pedido) => ({
          ...(detallesLocales.get(String(pedido.idPedido)) || {}),
          id: pedido.idPedido,
          total: pedido.totalEstimado,
          metodoPago: pedido.metodoPago || detallesLocales.get(String(pedido.idPedido))?.metodoPago || 'PayPal Sandbox',
          fecha: pedido.fechaPedido,
          estado: pedido.estado,
        })));
      })
      .catch(() => setCompras(comprasGuardadas))
      .finally(() => setCargando(false));
  }, []);

  const toggleExpandida = (id) => {
    setExpandidas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const GlobalStyle = () => (
    <style>{`
      @keyframes cm-slideDown { from { opacity: 0; transform: translateY(-14px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes cm-fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes cm-fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes cm-shimmer { 0% { background-position: -300px 0; } 100% { background-position: 300px 0; } }
      @keyframes cm-pulse { 0% { box-shadow: 0 0 0 0 currentColor; opacity: 1; } 100% { box-shadow: 0 0 0 7px transparent; opacity: 0; } }
      @keyframes cm-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

      .cm-topbar { animation: cm-slideDown 0.5s ease both; }
      .cm-header { animation: cm-fadeUp 0.5s ease both; }
      .cm-card { animation: cm-fadeUp 0.5s ease both; transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease; }
      .cm-card:hover { transform: translateY(-6px); box-shadow: 0 24px 40px rgba(28,15,27,0.14); border-color: ${palette.fucsia}55; }

      .cm-back-btn, .cm-btn-primary { transition: transform 0.16s ease, box-shadow 0.2s ease, background 0.2s ease; }
      .cm-back-btn:hover { transform: translateY(-2px); background: rgba(28,15,27,0.06) !important; }
      .cm-back-btn:active { transform: translateY(0) scale(0.97); }
      .cm-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 24px rgba(230,60,134,0.3); }
      .cm-btn-primary:active { transform: translateY(0) scale(0.98); }

      .cm-order-header { cursor: pointer; }
      .cm-chevron { transition: transform 0.3s ease; }
      .cm-chevron.open { transform: rotate(180deg); }

      .cm-item-row { transition: transform 0.18s ease, background 0.18s ease; }
      .cm-item-row:hover { transform: translateX(4px); background: #F1E1D4 !important; }

      .cm-dot { position: relative; }
      .cm-dot.pulse::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 2px solid currentColor;
        animation: cm-pulse 1.6s ease-out infinite;
      }

      .cm-skeleton {
        background: linear-gradient(90deg, ${palette.ivorySoft} 25%, #f2e2d3 37%, ${palette.ivorySoft} 63%);
        background-size: 400px 100%;
        animation: cm-shimmer 1.4s ease-in-out infinite;
        border-radius: 10px;
      }

      .cm-empty-icon { display: inline-block; animation: cm-float 3.2s ease-in-out infinite; }

      @media (prefers-reduced-motion: reduce) {
        .cm-topbar, .cm-header, .cm-card, .cm-empty-icon { animation: none !important; }
        .cm-card:hover, .cm-back-btn:hover, .cm-btn-primary:hover { transform: none !important; }
        .cm-dot.pulse::after { animation: none !important; }
      }
    `}</style>
  );

  const Topbar = ({ destino, texto }) => (
    <div className="cm-topbar" style={{ background: palette.white, padding: '1rem 1.25rem', borderBottom: `1px solid rgba(28,15,27,0.08)` }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.35rem', fontWeight: 700, color: palette.plum }}>
          Pague <span style={{ fontStyle: 'italic', color: palette.fucsia }}>Menos</span>
        </span>
        <button
          type="button"
          onClick={() => navigate(destino)}
          className="cm-back-btn"
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
          {texto}
        </button>
      </div>
    </div>
  );

  if (!usuario || !rol.includes('cliente')) {
    return (
      <main style={{ minHeight: '100vh', width: '100%', background: palette.ivory, boxSizing: 'border-box' }}>
        <GlobalStyle />
        <Topbar destino="/" texto="Volver a Inicio" />
        <div style={{ display: 'grid', placeItems: 'center', padding: '3rem 1.25rem', minHeight: 'calc(100vh - 68px)' }}>
          <section className="cm-card" style={{ ...panelStyle, maxWidth: '430px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.4rem', marginBottom: '0.6rem' }}>🔒</div>
            <h1 style={titleStyle}>Historial de compras</h1>
            <p style={{ color: palette.slate, margin: '0 0 1.3rem' }}>Esta sección solo está disponible para clientes.</p>
            <button type="button" onClick={() => navigate('/')} className="cm-btn-primary" style={{ ...primaryButtonStyle, width: '100%' }}>Volver a Inicio</button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', width: '100%', boxSizing: 'border-box', background: palette.ivory, color: palette.plum, paddingBottom: '4rem' }}>
      <GlobalStyle />
      <Topbar destino="/" texto="Volver a Inicio" />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.2rem 1.25rem 0' }}>
        <header className="cm-header" style={{ margin: '0 0 2rem' }}>
          <h1 style={titleStyle}>Mis compras</h1>
          <p style={{ margin: 0, color: palette.slate }}>Consulta el detalle de tus compras realizadas. Toca una compra para ver las prendas.</p>
        </header>

        {cargando ? (
          <div style={{ display: 'grid', gap: '1.2rem' }}>
            {[0, 1].map((i) => (
              <div key={i} style={{ ...panelStyle, display: 'grid', gap: '0.7rem' }}>
                <div className="cm-skeleton" style={{ height: '18px', width: '55%' }} />
                <div className="cm-skeleton" style={{ height: '14px', width: '85%' }} />
                <div className="cm-skeleton" style={{ height: '14px', width: '70%' }} />
              </div>
            ))}
          </div>
        ) : compras.length === 0 ? (
          <section className="cm-card" style={{ ...panelStyle, textAlign: 'center', padding: '3rem 1.5rem' }}>
            <div className="cm-empty-icon" style={{ fontSize: '2.6rem', marginBottom: '0.7rem' }}>🧾</div>
            <h2 style={{ margin: '0 0 0.6rem', fontFamily: 'Fraunces, Georgia, serif', color: palette.plum }}>Aún no tienes compras</h2>
            <p style={{ margin: '0 0 1.3rem', color: palette.slate }}>Cuando completes una compra aparecerá aquí.</p>
            <button type="button" onClick={() => navigate('/catalogo-cliente')} className="cm-btn-primary" style={primaryButtonStyle}>Explorar catálogo</button>
          </section>
        ) : (
          <div style={{ display: 'grid', gap: '1.2rem' }}>
            {compras.map((compra, index) => {
              const id = compra.id || index;
              const abierta = expandidas.has(id);
              const estado = estadoInfo(compra.estado);
              const items = compra.items || [];

              return (
                <article
                  key={id}
                  className="cm-card"
                  style={{ ...panelStyle, animationDelay: `${Math.min(index * 0.08, 0.4)}s` }}
                >
                  <div
                    className="cm-order-header"
                    role="button"
                    tabIndex={0}
                    aria-expanded={abierta}
                    onClick={() => toggleExpandida(id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpandida(id); } }}
                    style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}
                  >
                    <div style={{ display: 'flex', gap: '1.6rem', flexWrap: 'wrap', flex: 1 }}>
                      <div>
                        <span style={labelStyle}>Compra</span>
                        <strong>{compra.id || `Compra ${index + 1}`}</strong>
                      </div>
                      <div>
                        <span style={labelStyle}>Fecha y hora</span>
                        <strong>{formatDate(compra.fecha)}</strong>
                      </div>
                      <div>
                        <span style={labelStyle}>Método de pago</span>
                        <strong style={{ color: palette.fucsiaDeep }}>{compra.metodoPago || 'PayPal Sandbox'}</strong>
                      </div>
                      <div>
                        <span style={labelStyle}>Monto total</span>
                        <strong style={{ fontSize: '1.15rem' }}>{formatCurrency(compra.total)}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: estado.bg,
                        color: estado.text,
                        borderRadius: '999px',
                        padding: '0.4rem 0.85rem',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                      }}>
                        <span className={`cm-dot${estado.pulse ? ' pulse' : ''}`} style={{ width: '8px', height: '8px', borderRadius: '50%', background: estado.dot, color: estado.dot }} />
                        {estado.label}
                      </span>
                      <span className={`cm-chevron${abierta ? ' open' : ''}`} style={{ fontSize: '1.1rem', color: palette.slate }}>⌄</span>
                    </div>
                  </div>

                  {abierta && (
                    <div style={{ marginTop: '1.1rem', paddingTop: '1rem', borderTop: `1px solid ${palette.sand}`, animation: 'cm-fadeIn 0.25s ease both' }}>
                      <span style={labelStyle}>Prendas compradas</span>
                      <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.3rem' }}>
                        {items.length === 0 ? (
                          <p style={{ margin: 0, color: palette.slate, fontSize: '0.9rem' }}>No hay detalle de prendas para esta compra.</p>
                        ) : (
                          items.map((item) => (
                            <div key={`${id}-${item.id}`} className="cm-item-row" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', background: palette.ivorySoft, borderRadius: '10px', padding: '0.7rem 0.8rem' }}>
                              <span><strong>{item.cantidad}x</strong> {item.nombre}</span>
                              <strong>{formatCurrency(Number(item.precio || 0) * Number(item.cantidad || 0))}</strong>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

const panelStyle = { background: palette.white, border: `1px solid ${palette.sand}`, borderRadius: '22px', padding: '1.5rem', boxShadow: '0 16px 32px rgba(28,15,27,0.07)' };
const titleStyle = { margin: '0.15rem 0 0.5rem', fontFamily: 'Fraunces, Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', color: palette.plum };
const labelStyle = { display: 'block', color: palette.slate, fontSize: '0.75rem', marginBottom: '0.25rem' };
const primaryButtonStyle = {
  border: 'none',
  borderRadius: '12px',
  padding: '0.8rem 1.1rem',
  background: `linear-gradient(135deg, ${palette.fucsia} 0%, ${palette.fucsiaDeep} 100%)`,
  color: palette.white,
  fontWeight: 800,
  cursor: 'pointer',
  boxShadow: '0 10px 18px rgba(230,60,134,0.25)',
};
