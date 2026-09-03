import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { obtenerPrendas } from '../services/prendaService';

// Paleta "Pague Menos": fucsia de marca + aubergine casi negro + dorado + salvia,
// igual que la home, para que el catálogo se sienta parte de la misma tienda.
const palette = {
  ivory: '#FBF3EC',
  ivorySoft: '#F6E9DE',
  white: '#FFFFFF',
  plum: '#1C0F1B',
  plumSoft: '#2E1B2C',
  plumDeep: '#150B14',
  fucsia: '#E63C86',
  fucsiaDeep: '#C22868',
  gold: '#D9A441',
  goldDeep: '#B4832E',
  sage: '#8CA889',
  sageDeep: '#71906E',
  terracotta: '#E2775C',
  ink: '#241420',
  slate: '#6B5768',
};

function formatCurrency(value) {
  const numero = Number(value ?? 0);
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(numero);
}

function getCarritoKey(usuario) {
  const identificador = usuario?.idUsuario || usuario?.id_usuario || usuario?.id || usuario?.correo || usuario?.email;
  return identificador ? `carrito_${encodeURIComponent(String(identificador).trim().toLowerCase())}` : null;
}

function getImageSrc(value) {
  if (!value) return null;
  if (value.startsWith('http') || value.startsWith('data:')) return value;
  return `data:image/jpeg;base64,${value}`;
}

function getSafePrenda(prenda = {}) {
  return {
    id: prenda.idPrenda || prenda.id_prenda || 'Sin código',
    nombre: prenda.nombrePrend || prenda.nombre_prend || 'Prenda',
    descripcion: prenda.descripcionPrend || prenda.descripcion_prend || 'Prenda disponible para tu estilo.',
    genero: prenda.genero || 'Unisex',
    precio: Number(prenda.precioVenta ?? prenda.precio_venta ?? 0),
    stock: Number(prenda.cantidadDisponibleVenta ?? prenda.cantidad_disponible_venta ?? 0),
    estado: Number(prenda.estado ?? 1),
    imagen: getImageSrc(prenda.imagenPrend || prenda.imagen_prend),
  };
}

const GENRES = ['Todos', 'Hombre', 'Mujer', 'Unisex', 'Niño', 'Niña'];

function GenreIcon({ genero, color = 'currentColor' }) {
  const commonProps = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

  if (genero === 'Todos') return <svg {...commonProps}><path d="m12 3 1.2 5.1L18 9.5l-4.8 1.4L12 16l-1.2-5.1L6 9.5l4.8-1.4L12 3Z" /><path d="m19 15 .6 2.4L22 18l-2.4.6L19 21l-.6-2.4L16 18l2.4-.6L19 15Z" /></svg>;
  if (genero === 'Hombre') return <svg {...commonProps}><path d="m8 4 4 2 4-2 4 3-2.5 3-2-1.3V21h-7V8.7L6 10 4 7l4-3Z" /><path d="M10 6h4" /></svg>;
  if (genero === 'Mujer') return <svg {...commonProps}><path d="M10 3h4l.7 3.2L17 9l3 10.5c.2.8-.4 1.5-1.2 1.5H5.2c-.8 0-1.4-.7-1.2-1.5L7 9l2.3-2.8L10 3Z" /><path d="M9.5 6.2h5" /></svg>;
  if (genero === 'Unisex') return <svg {...commonProps}><path d="M4 8h14l-3-3" /><path d="M20 16H6l3 3" /></svg>;
  if (genero === 'Niño') return <svg {...commonProps}><path d="M4 11a8 8 0 0 1 16 0" /><path d="M3 11h18" /><path d="M7 11v2" /></svg>;
  return <svg {...commonProps}><path d="M12 20V9" /><path d="m12 9-3-3-3 3 3 3 3-3 3 3 3-3-3-3-3 3Z" /></svg>;
}

function SearchIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>;
}

function CartIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.5a2 2 0 0 0 1.9-1.5L20 8H6" /><circle cx="9" cy="20" r="1" /><circle cx="17" cy="20" r="1" /></svg>;
}

const normalizeText = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

function genreStyle(genero) {
  const g = normalizeText(genero);
  if (g.includes('mujer')) return { bg: palette.plum, text: palette.ivory };
  if (g.includes('hombre')) return { bg: palette.gold, text: palette.plumDeep };
  if (g.includes('unisex')) return { bg: palette.sage, text: palette.plumDeep };
  if (g.includes('nina')) return { bg: palette.fucsia, text: palette.white };
  if (g.includes('nino')) return { bg: palette.terracotta, text: palette.plumDeep };
  return { bg: palette.plum, text: palette.ivory };
}

export default function CatalogoCliente({ onVolverInicio, onAgregarCarrito, onVerDetalle } = {}) {
  const location = useLocation();
  const [prendas, setPrendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [generoSeleccionado, setGeneroSeleccionado] = useState('Todos');
  const [cartCount, setCartCount] = useState(0);
  const [cartBump, setCartBump] = useState(false);
  const [cantidades, setCantidades] = useState({});
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(() => {
    try {
      const raw = localStorage.getItem('usuarioActual');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const claveCarrito = getCarritoKey(usuarioActual);
  const [carrito, setCarrito] = useState(() => {
    try {
      if (!claveCarrito) return [];
      const raw = localStorage.getItem(claveCarrito);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const generoParam = new URLSearchParams(location.search).get('genero');
    if (!generoParam) return;

    const generoNormalizado = generoParam.trim();
    const match = GENRES.find((g) =>
      g.toLowerCase() === generoNormalizado.toLowerCase() ||
      normalizeText(g) === normalizeText(generoNormalizado)
    );

    if (match) {
      setGeneroSeleccionado(match);
    }
  }, [location.search]);

  useEffect(() => {
    const cargarPrendas = async () => {
      try {
        setLoading(true);
        const data = await obtenerPrendas();
        const payload = Array.isArray(data) ? data : Array.isArray(data?.value) ? data.value : [];
        const activas = payload
          .map(getSafePrenda)
          .filter((p) => Number(p.estado) === 1);
        setPrendas(activas);
        setError('');
      } catch (err) {
        console.error('Error cargando catálogo:', err);
        setError('No se pudieron cargar las prendas en este momento.');
      } finally {
        setLoading(false);
      }
    };

    cargarPrendas();
  }, []);

  useEffect(() => {
    if (!usuarioActual) {
      if (carrito.length > 0) setCarrito([]);
      setCartCount(0);
      try {
        localStorage.removeItem('carrito');
      } catch {
        // Ignorado si el navegador no permite almacenamiento.
      }
      return;
    }

    try {
      localStorage.removeItem('carrito');
      localStorage.setItem(claveCarrito, JSON.stringify(carrito));
    } catch {
      // Ignorado si el navegador no permite almacenamiento.
    }
    setCartCount(
      carrito.reduce((total, item) => total + Number(item.cantidad || 0), 0)
    );
  }, [carrito, usuarioActual, claveCarrito]);

  const prendasFiltradas = useMemo(() => {
    const texto = normalizeText(busqueda.trim());

    return prendas.filter((prenda) => {
      const nombre = normalizeText(prenda.nombre || '');
      const descripcion = normalizeText(prenda.descripcion || '');
      const genero = normalizeText(prenda.genero || '');

      const coincideGenero =
        generoSeleccionado === 'Todos' || genero.includes(normalizeText(generoSeleccionado));

      const coincideTexto =
        !texto ||
        nombre.includes(texto) ||
        descripcion.includes(texto) ||
        genero.includes(texto);

      return coincideGenero && coincideTexto;
    });
  }, [busqueda, generoSeleccionado, prendas]);

  const handleVolverInicio = () => {
    if (typeof onVolverInicio === 'function') {
      onVolverInicio();
    } else if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const handleAgregarCarrito = (prenda, cantidad = 1) => {
    const stockDisponible = Number(prenda?.stock ?? 0);
    const cantidadSegura = Math.max(1, Math.min(Number(cantidad) || 1, stockDisponible || 1));

    if (!usuarioActual) {
      setCarritoAbierto(true);
      setCartBump(true);
      window.clearTimeout(handleAgregarCarrito._t);
      handleAgregarCarrito._t = window.setTimeout(() => setCartBump(false), 480);
      return;
    }

    setCarrito((prev) => {
      const index = prev.findIndex((item) => item.id === prenda.id);
      if (index >= 0) {
        const actualizado = [...prev];
        actualizado[index] = {
          ...actualizado[index],
          cantidad: Math.min(
            Number(actualizado[index].cantidad || 0) + cantidadSegura,
            Number(prenda.stock || cantidadSegura)
          ),
        };
        return actualizado;
      }
      return [...prev, { id: prenda.id, nombre: prenda.nombre, precio: prenda.precio, cantidad: cantidadSegura, imagen: prenda.imagen }];
    });

    setCartBump(true);
    window.clearTimeout(handleAgregarCarrito._t);
    handleAgregarCarrito._t = window.setTimeout(() => setCartBump(false), 480);
    if (typeof onAgregarCarrito === 'function') onAgregarCarrito(prenda, cantidadSegura);
  };

  const abrirCarrito = () => {
    try {
      const raw = localStorage.getItem('usuarioActual');
      setUsuarioActual(raw ? JSON.parse(raw) : null);
    } catch {
      setUsuarioActual(null);
    }
    setCarritoAbierto(true);
  };

  const cerrarCarrito = () => setCarritoAbierto(false);

  const irAIniciarSesion = () => {
    window.location.href = '/iniciosesionregistro';
  };

  const handleVerDetalle = (prenda) => {
    if (typeof onVerDetalle === 'function') onVerDetalle(prenda);
  };

  const cartEmptyMessage = !usuarioActual
    ? 'Usuario no logeado. Debes iniciar sesión para poder hacer compras.'
    : carrito.length === 0
      ? 'Tu carrito está vacío por ahora.'
      : 'Productos agregados a tu compra.';

  const sumarUnidadCarrito = (id) => {
    setCarrito((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const prendaActual = prendas.find((p) => p.id === id);
        const stockMax = Number(prendaActual?.stock ?? item.cantidad ?? 1);
        return { ...item, cantidad: Math.min(Number(item.cantidad || 1) + 1, stockMax) };
      })
    );
  };

  const restarUnidadCarrito = (id) => {
    setCarrito((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          const nuevaCantidad = Number(item.cantidad || 1) - 1;
          return { ...item, cantidad: Math.max(0, nuevaCantidad) };
        })
        .filter((item) => Number(item.cantidad || 0) > 0)
    );
  };

  const subtotalCarrito = carrito.reduce(
    (total, item) => total + Number(item.precio || 0) * Number(item.cantidad || 0),
    0
  );

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      minWidth: '100vw',
      background: palette.ivory,
      boxSizing: 'border-box',
      color: palette.ink,
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      <style>{`
        html, body, #root {
          margin: 0;
          min-height: 100%;
          width: 100%;
          background: ${palette.ivory};
        }
        body { min-height: 100vh; }
        #root { max-width: none !important; width: 100% !important; border: none !important; }

        @keyframes cc-slideDown { from { opacity: 0; transform: translateY(-14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cc-fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cc-bump {
          0% { transform: scale(1); }
          35% { transform: scale(1.22); }
          60% { transform: scale(0.94); }
          100% { transform: scale(1); }
        }
        @keyframes cc-ring {
          0% { box-shadow: 0 0 0 0 rgba(230,60,134,0.45); }
          100% { box-shadow: 0 0 0 14px rgba(230,60,134,0); }
        }
        @keyframes cc-cart-overlay-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cc-cart-panel-in { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes cc-float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-10px, -18px); }
        }
        .cc-topbar { animation: cc-slideDown 0.5s ease both; }
        .cc-hero { animation: cc-fadeUp 0.6s ease 0.08s both; }
        .cc-blob { animation: cc-float 7s ease-in-out infinite; }

        .cc-chip {
          transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        }
        .cc-chip:hover { transform: translateY(-3px); }
        .cc-chip:active { transform: translateY(0) scale(0.97); }

        .cc-card {
          animation: cc-fadeUp 0.55s ease both;
          transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
        }
        .cc-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 26px 46px rgba(28,15,27,0.18);
          border-color: ${palette.fucsia} !important;
        }
        .cc-card:hover .cc-img { transform: scale(1.07); }
        .cc-img { transition: transform 0.5s ease; }

        .cc-home-btn, .cc-cart-btn, .cc-btn-primary, .cc-btn-secondary {
          transition: transform 0.16s ease, box-shadow 0.2s ease, background 0.2s ease, opacity 0.2s ease;
        }
        .cc-home-btn:hover { transform: translateY(-2px); background: rgba(28,15,27,0.05) !important; }
        .cc-home-btn:active { transform: translateY(0) scale(0.97); }
        .cc-cart-btn:hover { transform: translateY(-2px); }
        .cc-cart-btn:active { transform: scale(0.95); }
        .cc-cart-btn.bump .cc-cart-icon { animation: cc-bump 0.48s ease; }
        .cc-cart-btn.bump { animation: cc-ring 0.55s ease-out; }
        .cc-btn-primary:hover { box-shadow: 0 14px 24px rgba(230,60,134,0.32); transform: translateY(-2px); }
        .cc-btn-primary:active { transform: translateY(0) scale(0.98); }
        .cc-btn-secondary:hover { background: ${palette.plum} !important; color: #fff !important; }
        .cc-btn-secondary:active { transform: scale(0.98); }
        .cc-search:focus-within { border-color: #fff !important; box-shadow: 0 0 0 4px rgba(255,255,255,0.25) !important; }

        @media (prefers-reduced-motion: reduce) {
          .cc-topbar, .cc-hero, .cc-card, .cc-blob, .cc-cart-btn.bump, .cc-cart-btn.bump .cc-cart-icon { animation: none !important; }
          .cc-card:hover, .cc-home-btn:hover, .cc-cart-btn:hover, .cc-btn-primary:hover, .cc-chip:hover { transform: none !important; }
        }
      `}</style>

      {/* Barra superior: marca + volver al inicio + carrito */}
      <div className="cc-topbar" style={{
        background: palette.white,
        padding: '1rem 1.25rem',
        borderBottom: `1px solid rgba(28,15,27,0.08)`,
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}>
          <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.35rem', fontWeight: 700, color: palette.plum }}>
            Pague <span style={{ fontStyle: 'italic', color: palette.fucsia }}>Menos</span>
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <button
              type="button"
              onClick={handleVolverInicio}
              className="cc-home-btn"
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
              Volver al inicio
            </button>

            <button
              type="button"
              onClick={abrirCarrito}
              className={`cc-cart-btn${cartBump ? ' bump' : ''}`}
              aria-label={`Carrito de compras, ${cartCount} artículos`}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                background: palette.plum,
                border: 'none',
                color: palette.white,
                borderRadius: '999px',
                padding: '0.55rem 1.1rem 0.55rem 0.85rem',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 10px 20px rgba(28,15,27,0.18)',
              }}
            >
              <span className="cc-cart-icon"><CartIcon /></span>
              Carrito
              <span style={{
                minWidth: '20px',
                height: '20px',
                borderRadius: '999px',
                background: palette.fucsia,
                color: '#fff',
                fontSize: '0.72rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 5px',
              }}>
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {carritoAbierto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(21, 11, 20, 0.45)',
            zIndex: 30,
            display: 'flex',
            justifyContent: 'flex-end',
            animation: 'cc-cart-overlay-in 0.25s ease-out forwards',
          }}
          onClick={cerrarCarrito}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '380px',
              maxWidth: '90vw',
              height: '100vh',
              background: palette.ivory,
              boxShadow: '-12px 0 30px rgba(21, 11, 20, 0.2)',
              padding: '1.4rem 1.2rem',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              animation: 'cc-cart-panel-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'Fraunces, Georgia, serif', color: palette.plum }}>Carrito</h2>
              <button
                type="button"
                onClick={cerrarCarrito}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '1.7rem',
                  cursor: 'pointer',
                  color: palette.plum,
                  lineHeight: 1,
                }}
                aria-label="Cerrar carrito"
              >
                ×
              </button>
            </div>

            {usuarioActual && carrito.length > 0 ? (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.9rem',
                borderRadius: '22px',
                background: palette.white,
                border: `1px solid rgba(28,15,27,0.08)`,
                padding: '1rem',
                overflow: 'hidden',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', paddingRight: '0.2rem' }}>
                  {carrito.map((item) => (
                    <div key={item.id} style={{
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'center',
                      padding: '0.65rem 0.4rem',
                      borderBottom: `1px solid rgba(28,15,27,0.08)`,
                    }}>
                      <div style={{
                        width: '58px', height: '58px', borderRadius: '12px', overflow: 'hidden', background: palette.ivorySoft,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        {item.imagen ? (
                          <img src={item.imagen} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ color: palette.plum }}><GenreIcon genero="Hombre" color="currentColor" /></span>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, color: palette.plum, fontSize: '0.94rem', lineHeight: 1.35 }}>{item.nombre}</div>
                        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => restarUnidadCarrito(item.id)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '8px',
                              border: `1px solid ${palette.plum}`,
                              background: palette.white,
                              color: palette.plum,
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            aria-label={`Restar una unidad de ${item.nombre}`}
                          >
                            −
                          </button>
                          <span style={{ fontSize: '0.8rem', color: palette.slate, fontWeight: 700, minWidth: '28px', textAlign: 'center' }}>
                            {item.cantidad}
                          </span>
                          <button
                            type="button"
                            onClick={() => sumarUnidadCarrito(item.id)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '8px',
                              border: `1px solid ${palette.fucsia}`,
                              background: palette.fucsia,
                              color: '#fff',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            aria-label={`Sumar una unidad de ${item.nombre}`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div style={{ fontWeight: 800, color: palette.fucsiaDeep, fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                        {formatCurrency(Number(item.precio || 0) * Number(item.cantidad || 0))}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  marginTop: 'auto',
                  borderTop: `1px solid rgba(28,15,27,0.08)`,
                  paddingTop: '0.9rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: palette.plum,
                  fontWeight: 800,
                }}>
                  <span>Total</span>
                  <span>{formatCurrency(subtotalCarrito)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCarritoAbierto(false);
                    window.location.href = '/facturacion';
                  }}
                  style={{
                    marginTop: '0.2rem',
                    background: `linear-gradient(135deg, ${palette.fucsia} 0%, ${palette.fucsiaDeep} 100%)`,
                    border: 'none',
                    color: '#fff',
                    borderRadius: '14px',
                    padding: '0.9rem 1rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Proceder al pago
                </button>
              </div>
            ) : (
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                borderRadius: '22px',
                background: palette.white,
                border: `1px solid rgba(28,15,27,0.08)`,
                padding: '1.5rem',
              }}>
                <div>
                  <div style={{ color: palette.fucsia, marginBottom: '0.7rem' }}><CartIcon /></div>
                  <p style={{ margin: 0, color: palette.plum, fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.5 }}>
                    {cartEmptyMessage}
                  </p>

                  {!usuarioActual && (
                    <button
                      type="button"
                      onClick={irAIniciarSesion}
                      style={{
                        marginTop: '1rem',
                        background: `linear-gradient(135deg, ${palette.fucsia} 0%, ${palette.fucsiaDeep} 100%)`,
                        border: 'none',
                        color: '#fff',
                        borderRadius: '14px',
                        padding: '0.8rem 1.1rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        minWidth: '180px',
                      }}
                    >
                      Iniciar sesión
                    </button>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Hero fucsia: encabezado, buscador y filtro por género */}
      <div className="cc-hero" style={{
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(160deg, ${palette.fucsia} 0%, ${palette.fucsiaDeep} 100%)`,
        padding: '3.2rem 1.25rem 3rem',
      }}>
        <div className="cc-blob" style={{
          position: 'absolute',
          top: '-90px',
          right: '-70px',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          filter: 'blur(2px)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontFamily: 'Fraunces, Georgia, serif',
            fontWeight: 700,
            lineHeight: 1.15,
            color: palette.white,
            maxWidth: '640px',
          }}>
            Explora el catálogo
          </h1>
          <p style={{
            margin: '0.85rem 0 1.8rem',
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1.02rem',
            lineHeight: 1.6,
            maxWidth: '520px',
          }}>
            Prendas únicas seleccionadas con cuidado y precios pensados para tu bolsillo.
          </p>

          <div className="cc-search" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(255,255,255,0.16)',
            border: `1px solid rgba(255,255,255,0.55)`,
            borderRadius: '999px',
            padding: '0.75rem 1.1rem',
            maxWidth: '460px',
            marginBottom: '1.6rem',
          }}>
            <span style={{ color: palette.white, display: 'inline-flex' }}><SearchIcon /></span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, género o palabra clave"
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                background: 'transparent',
                fontSize: '0.95rem',
                color: '#ffffff',
                fontWeight: 600,
                WebkitTextFillColor: '#ffffff',
                caretColor: '#ffffff',
                padding: 0,
              }}
              onFocus={(e) => {
                e.target.style.color = '#ffffff';
              }}
              onBlur={(e) => {
                e.target.style.color = '#ffffff';
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {GENRES.map((genero) => {
              const activo = generoSeleccionado === genero;
              const colores = genero === 'Todos' ? { bg: palette.plum, text: palette.ivory } : genreStyle(genero);
              return (
                <button
                  key={genero}
                  type="button"
                  onClick={() => setGeneroSeleccionado(genero)}
                  className="cc-chip"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    border: 'none',
                    background: activo ? colores.bg : 'rgba(255,255,255,0.16)',
                    color: activo ? colores.text : palette.white,
                    borderRadius: '999px',
                    padding: '0.6rem 1rem',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: activo ? '0 10px 20px rgba(21,11,20,0.25)' : 'none',
                  }}
                >
                  <span aria-hidden="true" style={{ display: 'inline-flex' }}><GenreIcon genero={genero} /></span>
                  {genero}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenido: grilla de prendas */}
      <div style={{ padding: '2.6rem 1.25rem 4rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 1.4rem', color: palette.slate, fontWeight: 700, fontSize: '0.92rem' }}>
            {loading ? 'Buscando prendas…' : `${prendasFiltradas.length} prenda${prendasFiltradas.length === 1 ? '' : 's'} encontrada${prendasFiltradas.length === 1 ? '' : 's'}`}
          </p>

          {loading ? (
            <div style={{
              background: palette.white,
              border: `1px solid rgba(28,15,27,0.08)`,
              borderRadius: '26px',
              padding: '2.2rem',
              textAlign: 'center',
              color: palette.slate,
              boxShadow: '0 12px 26px rgba(28,15,27,0.05)',
            }}>
              Cargando prendas desde la base de datos...
            </div>
          ) : error ? (
            <div style={{
              background: '#fff2f2',
              border: '1px solid #f6c1c1',
              color: '#9d2d2d',
              borderRadius: '22px',
              padding: '1.2rem 1.5rem',
            }}>
              {error}
            </div>
          ) : prendasFiltradas.length === 0 ? (
            <div style={{
              background: palette.white,
              border: `1px solid rgba(28,15,27,0.08)`,
              borderRadius: '26px',
              padding: '2.5rem',
              textAlign: 'center',
              color: palette.slate,
              boxShadow: '0 12px 26px rgba(28,15,27,0.05)',
            }}>
              No hay prendas disponibles con ese filtro en este momento.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
            }}>
              {prendasFiltradas.map((prenda, index) => {
                const tag = genreStyle(prenda.genero);
                return (
                  <article
                    key={prenda.id}
                    className="cc-card"
                    style={{
                      animationDelay: `${Math.min(index * 0.05, 0.4)}s`,
                      background: palette.white,
                      borderRadius: '28px',
                      overflow: 'hidden',
                      border: `1px solid rgba(28,15,27,0.08)`,
                      boxShadow: '0 18px 34px rgba(28,15,27,0.07)',
                    }}
                  >
                    <div style={{
                      height: '260px',
                      background: `linear-gradient(135deg, ${palette.ivorySoft} 0%, #f2ddce 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative',
                    }}>
                      {prenda.imagen ? (
                        <img
                          src={prenda.imagen}
                          alt={prenda.nombre}
                          className="cc-img"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '3rem',
                          fontWeight: 800,
                          color: palette.plumSoft,
                        }}>
                          {String(prenda.nombre).slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div style={{ padding: '1.2rem 1.2rem 1.4rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.6rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.35, color: palette.plum }}>
                          {prenda.nombre}
                        </h3>
                        <span style={{
                          background: tag.bg,
                          color: tag.text,
                          borderRadius: '999px',
                          padding: '0.35rem 0.7rem',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                        }}>
                          {prenda.genero}
                        </span>
                      </div>

                      <p style={{
                        margin: '0 0 0.75rem',
                        color: palette.slate,
                        lineHeight: 1.6,
                        minHeight: '48px',
                        fontSize: '0.95rem',
                      }}>
                        {prenda.descripcion}
                      </p>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.9rem',
                        gap: '0.75rem',
                      }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: palette.plumDeep }}>
                          {formatCurrency(prenda.precio)}
                        </span>
                        <span style={{ color: palette.sageDeep, fontWeight: 700, fontSize: '0.78rem' }}>
                          {prenda.stock} disponibles
                        </span>
                      </div>

                      <div style={{
                        display: 'flex',
                        gap: '0.6rem',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}>
                        <button
                          type="button"
                          onClick={() => handleAgregarCarrito(prenda, cantidades[prenda.id] ?? 1)}
                          className="cc-btn-primary"
                          style={{
                            flex: '1 1 auto',
                            minWidth: '118px',
                            height: '48px',
                            border: 'none',
                            borderRadius: '14px',
                            background: `linear-gradient(135deg, ${palette.fucsia} 0%, ${palette.fucsiaDeep} 100%)`,
                            color: '#fff',
                            padding: '0.72rem 1rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            boxShadow: '0 10px 18px rgba(230,60,134,0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          Agregar
                        </button>

                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          width: '98px',
                          flexShrink: 0,
                        }}>
                          <label style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            color: palette.slate,
                            marginBottom: '0.35rem',
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                          }}>
                            Cant.
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={prenda.stock || 1}
                            value={cantidades[prenda.id] ?? 1}
                            onChange={(e) => {
                              const numero = Number(e.target.value || 1);
                              const stock = Number(prenda.stock || 1);
                              const valor = Math.min(Math.max(1, numero), stock);
                              setCantidades((prev) => ({ ...prev, [prenda.id]: valor }));
                            }}
                            style={{
                              width: '100%',
                              height: '48px',
                              border: `1px solid ${palette.plum}`,
                              borderRadius: '12px',
                              padding: '0.6rem 0.5rem',
                              fontSize: '1rem',
                              fontWeight: 700,
                              color: palette.plum,
                              textAlign: 'center',
                              background: palette.white,
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
