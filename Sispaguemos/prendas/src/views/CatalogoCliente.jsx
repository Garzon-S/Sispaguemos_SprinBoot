import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { obtenerPrendas } from '../services/prendaService';
import '../styles/CatalogoCliente.css';

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
    estado: prenda.estado ?? 1,
    imagen: getImageSrc(prenda.imagenPrend || prenda.imagen_prend),
  };
}

function prendaEstaActiva(estado) {
  const estadoNormalizado = String(estado ?? '').trim().toLowerCase();
  return estadoNormalizado === '1'
    || estadoNormalizado === 'activo'
    || estadoNormalizado === 'disponible';
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
          .filter((p) => prendaEstaActiva(p.estado));
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
    <div className="cc-page">

      {/* Barra superior: marca + volver al inicio + carrito */}
      <div className="cc-topbar">
        <div className="cc-topbar-inner">
          <span className="cc-brand">
            Pague <span className="cc-brand-accent">Menos</span>
          </span>

          <div className="cc-topbar-actions">
            <button
              type="button"
              onClick={handleVolverInicio}
              className="cc-home-btn"
            >
              <span style={{ fontSize: '1rem' }}>←</span>
              Volver al inicio
            </button>

            <button
              type="button"
              onClick={abrirCarrito}
              className={`cc-cart-btn${cartBump ? ' bump' : ''}`}
              aria-label={`Carrito de compras, ${cartCount} artículos`}
            >
              <span className="cc-cart-icon"><CartIcon /></span>
              Carrito
              <span className="cc-cart-count">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {carritoAbierto && (
        <div className="cc-cart-overlay"
          onClick={cerrarCarrito}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="cc-cart-panel"
          >
            <div className="cc-cart-header">
              <h2>Carrito</h2>
              <button
                type="button"
                onClick={cerrarCarrito}
                className="cc-close-btn"
                aria-label="Cerrar carrito"
              >
                ×
              </button>
            </div>

            {usuarioActual && carrito.length > 0 ? (
              <div className="cc-cart-box">
                <div className="cc-cart-items">
                  {carrito.map((item) => (
                    <div key={item.id} className="cc-cart-item">
                      <div className="cc-cart-item-image">
                        {item.imagen ? (
                          <img src={item.imagen} alt={item.nombre} />
                        ) : (
                          <span style={{ color: palette.plum }}><GenreIcon genero="Hombre" color="currentColor" /></span>
                        )}
                      </div>

                      <div className="cc-cart-item-info">
                        <div className="cc-cart-item-name">{item.nombre}</div>
                        <div className="cc-cart-item-controls">
                          <button
                            type="button"
                            onClick={() => restarUnidadCarrito(item.id)}
                            className="cc-quantity-btn cc-quantity-btn--minus"
                            aria-label={`Restar una unidad de ${item.nombre}`}
                          >
                            −
                          </button>
                          <span className="cc-quantity-value">
                            {item.cantidad}
                          </span>
                          <button
                            type="button"
                            onClick={() => sumarUnidadCarrito(item.id)}
                            className="cc-quantity-btn cc-quantity-btn--plus"
                            aria-label={`Sumar una unidad de ${item.nombre}`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="cc-cart-item-price">
                        {formatCurrency(Number(item.precio || 0) * Number(item.cantidad || 0))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cc-cart-total">
                  <span>Total</span>
                  <span>{formatCurrency(subtotalCarrito)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCarritoAbierto(false);
                    window.location.href = '/facturacion';
                  }}
                  className="cc-payment-btn"
                >
                  Proceder al pago
                </button>
              </div>
            ) : (
              <div className="cc-cart-empty">
                <div>
                  <div className="cc-cart-empty-icon"><CartIcon /></div>
                  <p>
                    {cartEmptyMessage}
                  </p>

                  {!usuarioActual && (
                    <button
                      type="button"
                      onClick={irAIniciarSesion}
                      className="cc-login-btn"
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
      <div className="cc-hero">
        <div className="cc-blob" />

        <div className="cc-content-inner" style={{ position: 'relative' }}>
          <h1>
            Explora el catálogo
          </h1>
          <p className="cc-hero-copy">
            Prendas únicas seleccionadas con cuidado y precios pensados para tu bolsillo.
          </p>

          <div className="cc-search">
            <span style={{ color: palette.white, display: 'inline-flex' }}><SearchIcon /></span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, género o palabra clave"
              onFocus={(e) => {
                e.target.style.color = '#ffffff';
              }}
              onBlur={(e) => {
                e.target.style.color = '#ffffff';
              }}
            />
          </div>

          <div className="cc-filter-list">
            {GENRES.map((genero) => {
              const activo = generoSeleccionado === genero;
              const colores = genero === 'Todos' ? { bg: palette.plum, text: palette.ivory } : genreStyle(genero);
              return (
                <button
                  key={genero}
                  type="button"
                  onClick={() => setGeneroSeleccionado(genero)}
                  className="cc-chip"
                  style={{ background: activo ? colores.bg : 'rgba(255,255,255,0.16)', color: activo ? colores.text : palette.white, boxShadow: activo ? '0 10px 20px rgba(21,11,20,0.25)' : 'none' }}
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
      <div className="cc-content">
        <div className="cc-content-inner">
          <p className="cc-results-count">
            {loading ? 'Buscando prendas…' : `${prendasFiltradas.length} prenda${prendasFiltradas.length === 1 ? '' : 's'} encontrada${prendasFiltradas.length === 1 ? '' : 's'}`}
          </p>

          {loading ? (
            <div className="cc-state">
              Cargando prendas desde la base de datos...
            </div>
          ) : error ? (
            <div className="cc-state cc-state--error">
              {error}
            </div>
          ) : prendasFiltradas.length === 0 ? (
            <div className="cc-state">
              No hay prendas disponibles con ese filtro en este momento.
            </div>
          ) : (
            <div className="cc-product-grid">
              {prendasFiltradas.map((prenda, index) => {
                const tag = genreStyle(prenda.genero);
                return (
                  <article
                    key={prenda.id}
                    className="cc-card"
                    style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s` }}
                  >
                    <div className="cc-product-image">
                      {prenda.imagen ? (
                        <img
                          src={prenda.imagen}
                          alt={prenda.nombre}
                          className="cc-img"
                        />
                      ) : (
                        <div className="cc-product-placeholder">
                          {String(prenda.nombre).slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="cc-product-body">
                      <div className="cc-product-heading">
                        <h3>
                          {prenda.nombre}
                        </h3>
                        <span className="cc-genre-tag" style={{ background: tag.bg, color: tag.text }}>
                          {prenda.genero}
                        </span>
                      </div>

                      <p className="cc-product-description">
                        {prenda.descripcion}
                      </p>

                      <div className="cc-product-meta">
                        <span className="cc-product-price">
                          {formatCurrency(prenda.precio)}
                        </span>
                        <span className="cc-product-stock">
                          {prenda.stock} disponibles
                        </span>
                      </div>

                      <div className="cc-product-actions">
                        <button
                          type="button"
                          onClick={() => handleAgregarCarrito(prenda, cantidades[prenda.id] ?? 1)}
                          className="cc-btn-primary"
                        >
                          Agregar
                        </button>

                        <div className="cc-quantity-field">
                          <label>
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
