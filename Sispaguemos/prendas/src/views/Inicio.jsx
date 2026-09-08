import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { obtenerPrendas } from '../services/prendaService';
import '../styles/Inicio.css';

// ---------------------------------------------------------------------------
// Paleta: se conserva el fucsia de marca y se combina con un verde salvia
// (su complementario, ideal para la categoría Unisex), un dorado cálido para
// acentos y un ciruela oscuro para las zonas de contraste.
// ---------------------------------------------------------------------------
const palette = {
  fucsia: '#e63982',
  fucsiaDark: '#c02563',
  plum: '#2b1830',
  cream: '#fdf6f1',
  sand: '#f3e7dd',
  gold: '#c9973f',
  sage: '#7c9885',
  ink: '#231421',
  slate: '#5b4a56',
};

const normalizeText = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase();

function prendaEstaActiva(estado) {
  const estadoNormalizado = normalizeText(estado);
  return estadoNormalizado === '1'
    || estadoNormalizado === 'activo'
    || estadoNormalizado === 'disponible';
}

// Iconos simples en línea, en vez de fotografías, para representar las
// prendas mientras no hay imágenes reales del catálogo.
function IconHanger({ color = '#fff' }) {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
      <path d="M12 3.5a1.6 1.6 0 1 1 1.7 1.6" strokeLinecap="round" />
      <path d="M12 5.1v2.2" strokeLinecap="round" />
      <path d="M12 7.3 2.5 13.8c-1 .7-.5 2.2.7 2.2h17.6c1.2 0 1.7-1.5.7-2.2L12 7.3Z" strokeLinejoin="round" />
      <path d="M5 18.5h14" strokeLinecap="round" />
    </svg>
  );
}
function IconShirt({ color = '#fff' }) {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
      <path d="M8 3 3 6.5 5.5 10 8 8.3V21h8V8.3l2.5 1.7L21 6.5 16 3l-2 2H10L8 3Z" strokeLinejoin="round" />
    </svg>
  );
}
function IconDress({ color = '#fff' }) {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
      <path d="M10 2h4l.7 3.2L17 8l3 11.5c.2.8-.4 1.5-1.2 1.5H5.2c-.8 0-1.4-.7-1.2-1.5L7 8l2.3-2.8L10 2Z" strokeLinejoin="round" />
      <path d="M9.5 5.2h5" strokeLinecap="round" />
    </svg>
  );
}
function IconSwap({ color = '#fff' }) {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
      <path d="M4 8h13l-3-3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 16H7l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Revela su contenido con un desvanecimiento hacia arriba cuando entra en
// pantalla. Es el único patrón de "scroll animation" del sitio: se repite
// igual en cada sección para que se sienta intencional y no saturado.
function Reveal({ children, as: Tag = 'div', style = {}, ...rest }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Cuenta de 0 hasta el valor objetivo cuando el número entra en pantalla.
function useCountUp(target, decimals = 0, duration = 1400) {
  const factor = Math.pow(10, decimals);
  const intTarget = Math.round(target * factor);
  const [count, setCount] = useState(0);
  const started = useRef(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            setCount(Math.floor(progress * intTarget));
            if (progress < 1) requestAnimationFrame(step);
            else setCount(intTarget);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [intTarget, duration]);

  return [(count / factor).toFixed(decimals), ref];
}

function AnimatedStat({ target, decimals = 0, prefix = '', suffix = '', label, color }) {
  const [value, ref] = useCountUp(target, decimals);
  return (
    <div ref={ref}>
      <div className="display" style={{ fontSize: '2.6rem', fontWeight: '600', color }}>
        {prefix}{value}{suffix}
      </div>
      <div style={{ fontSize: '0.85rem', opacity: 0.75, marginTop: '0.3rem' }}>{label}</div>
    </div>
  );
}

export default function InicioPage() {
  const navigate = useNavigate();
  const [hoverPrendas, setHoverPrendas] = useState(false);
  const [hoverUsuario, setHoverUsuario] = useState(false);
  const [cardHover, setCardHover] = useState(null);
  const [hoverCategory, setHoverCategory] = useState(null);
  const [activeLook, setActiveLook] = useState('casual');
  const [prendasRegistradas, setPrendasRegistradas] = useState([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(() => {
    try {
      const raw = localStorage.getItem('usuarioActual');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    const actualizarUsuario = () => {
      try {
        const raw = localStorage.getItem('usuarioActual');
        setUsuarioActual(raw ? JSON.parse(raw) : null);
      } catch {
        setUsuarioActual(null);
      }
    };

    actualizarUsuario();
    window.addEventListener('storage', actualizarUsuario);
    return () => window.removeEventListener('storage', actualizarUsuario);
  }, []);

  useEffect(() => {
    const cargarPrendasRegistradas = async () => {
      try {
        const data = await obtenerPrendas();
        const lista = Array.isArray(data) ? data : Array.isArray(data?.value) ? data.value : [];
        setPrendasRegistradas(lista.filter((prenda) => prendaEstaActiva(prenda.estado)));
      } catch (error) {
        console.error('Error cargando cantidades por género:', error);
        setPrendasRegistradas([]);
      } finally {
        setCargandoCategorias(false);
      }
    };

    cargarPrendasRegistradas();
  }, []);

  const avatarSrc = usuarioActual?.imagenPerfil
    ? `data:image/jpeg;base64,${usuarioActual.imagenPerfil}`
    : null;

  const inicialesUsuario = (() => {
    if (!usuarioActual) return 'U';
    const primer = usuarioActual.primerNom || '';
    const segundo = usuarioActual.primerApelli || '';
    const inicial1 = primer.trim().charAt(0)?.toUpperCase() || '';
    const inicial2 = segundo.trim().charAt(0)?.toUpperCase() || '';
    return `${inicial1}${inicial2}` || 'U';
  })();

  const cerrarSesion = () => {
    localStorage.removeItem('usuarioActual');
    setUsuarioActual(null);
    setMenuAbierto(false);
    navigate('/');
  };

  const categorias = [
    { id: 'mujer', nombre: 'Mujer', color: palette.fucsia, Icon: IconDress },
    { id: 'hombre', nombre: 'Hombre', color: palette.plum, Icon: IconShirt },
    { id: 'unisex', nombre: 'Unisex', color: palette.sage, Icon: IconSwap },
  ];

  const contarPrendasPorGenero = (genero) => prendasRegistradas.filter((prenda) => (
    normalizeText(prenda.genero) === normalizeText(genero)
  )).length;

  const looks = [
    {
      id: 'casual',
      tab: 'Casual',
      title: 'Para el día a día',
      desc: 'Jean recto, camisa de lino y una chaqueta liviana encima. Fresco, cómodo y sin esfuerzo, ideal para moverte por la ciudad todo el día.',
      color: palette.fucsia,
      Icon: IconShirt,
    },
    {
      id: 'oficina',
      tab: 'De oficina',
      title: 'Look de oficina relajado',
      desc: 'Blazer oversize sobre una camisa clara y pantalón recto. Se ve cuidado sin sentirse forzado, perfecto para reuniones o el escritorio.',
      color: palette.plum,
      Icon: IconHanger,
    },
    {
      id: 'noche',
      tab: 'De noche',
      title: 'Para salir sin pensarlo dos veces',
      desc: 'Vestido midi o camisa satinada con accesorios dorados. El punto justo de brillo para una cena o una salida entre semana.',
      color: palette.gold,
      Icon: IconDress,
    },
  ];

  const activeLookData = looks.find((l) => l.id === activeLook);

  return (
    <div className="inicio-page">
      {/* 1. BARRA DE NAVEGACIÓN SUPERIOR */}
      <header className="inicio-header">
        <div className="inicio-brand">
          Pague <span className="inicio-brand-accent">Menos</span>
        </div>

        <nav className="inicio-nav">
          <Link to="/catalogo-cliente?genero=Mujer">Mujer</Link>
          <Link to="/catalogo-cliente?genero=Hombre">Hombre</Link>
          <Link to="/catalogo-cliente?genero=Unisex">Unisex</Link>
          <a href="#historia">Nuestra historia</a>
          {String(usuarioActual?.rol || '').trim().toLowerCase().includes('cliente') && (
            <Link to="/compras">Compras</Link>
          )}
        </nav>

        <div className="inicio-user-wrap">
          {usuarioActual ? (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setMenuAbierto((prev) => !prev)}
                className="inicio-user-button"
                aria-label="Menú de usuario"
                style={{ background: avatarSrc ? '#ffffff' : 'linear-gradient(135deg, #f8bfd7 0%, #e63982 100%)' }}
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Foto de perfil" />
                ) : (
                  <span style={{ color: '#fff' }}>{inicialesUsuario}</span>
                )}
              </button>

              {menuAbierto && (
                <div className="inicio-user-menu">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuAbierto(false);
                      navigate('/perfil');
                    }}
                  >
                    Perfil
                  </button>
                  <button type="button" onClick={cerrarSesion}>Cerrar sesión</button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </header>

      {/* 2. HERO (con entrada animada al cargar) */}
      <section className="inicio-hero">
        <div className="hero-anim" style={{ position: 'relative', zIndex: 2 }}>
          <span className="inicio-hero-badge">Nueva colección de temporada ya en tienda</span>

          <h1 className="display inicio-hero-title">El estilo que te queda bien, sin pagar de más</h1>

          <p className="inicio-hero-copy">
            Prendas únicas seleccionadas con cuidado, atención personalizada en tienda y precios pensados para tu bolsillo. Renovar tu armario nunca fue tan fácil.
          </p>

          {!usuarioActual && (
            <div className="inicio-actions">
              <Link to="/iniciosesionregistro" className="inicio-primary-btn">Iniciar Sesion</Link>
              <Link to="/catalogo-cliente" className="inicio-secondary-btn">Catálogo</Link>
            </div>
          )}

          <div className="inicio-metrics">
            <div>
              <div className="display inicio-metric-value">+300</div>
              <div className="inicio-metric-label">Oufits por hacer!</div>
            </div>
            <div>
              <div className="display inicio-metric-value">4 años</div>
              <div className="inicio-metric-label">Atendiendo al barrio</div>
            </div>
            <div>
              <div className="display inicio-metric-value">4.9</div>
              <div className="inicio-metric-label">Calificación de clientes</div>
            </div>
          </div>
        </div>

        {/* Collage visual con las prendas destacadas, con una pieza flotante */}
        <div className="inicio-visual-grid">
          <div className="inicio-visual-card inicio-visual-card--large floating">
            <IconDress />
            <span style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '0.6rem' }}>Mujer</span>
          </div>
          <div className="inicio-visual-card inicio-visual-card--gold" style={{ color: palette.plum }}>
            <IconShirt color={palette.plum} />
            <span style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '0.6rem', color: palette.plum }}>Hombre</span>
          </div>
          <div className="inicio-visual-card inicio-visual-card--sage floating-slow" style={{ color: palette.plum }}>
            <IconSwap color={palette.plum} />
            <span style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '0.6rem', color: palette.plum }}>Unisex</span>
          </div>
        </div>
      </section>

      {/* MARQUESINA: cinta con movimiento continuo entre el hero y el resto */}
      <div className="marquee-shell">
        <div className="marquee-track">
          {[...Array(2)].map((_, rep) => (
            <div key={rep} style={{ display: 'flex', alignItems: 'center' }}>
              {['Moda accesible', 'Atención cercana', 'Precios justos', 'Mujer, hombre y unisex', 'Prueba sin apuro'].map((frase, i) => (
                <span key={i} className="marquee-item">
                  {frase}
                  <span className="marquee-dot">●</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 3. CATEGORÍAS */}
      <Reveal as="section" className="inicio-section">
        <div className="inicio-section-header">
          <h2 className="inicio-section-title">Categorias Disponibles</h2>
        </div>

        <div className="inicio-category-grid">
          {categorias.map((cat) => {
            const isHovered = hoverCategory === cat.id;
            const { Icon } = cat;
            return (
              <Link
                key={cat.id}
                to={`/catalogo-cliente?genero=${encodeURIComponent(cat.nombre)}`}
                onMouseEnter={() => setHoverCategory(cat.id)}
                onMouseLeave={() => setHoverCategory(null)}
                className="inicio-category-card"
                style={{
                  backgroundColor: cat.color,
                  boxShadow: isHovered ? '0 16px 30px rgba(43,24,48,0.18)' : '0 4px 14px rgba(43,24,48,0.06)',
                }}
              >
                <Icon />
                <div>
                  <div className="inicio-category-name">{cat.nombre}</div>
                  <div className="inicio-category-amount">
                    {cargandoCategorias ? 'Cargando...' : `${contarPrendasPorGenero(cat.nombre)} prendas`}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Reveal>

      {/* 4. DESCUBRE TU LOOK (panel interactivo con animación al cambiar de pestaña) */}
      <Reveal as="section" id="looks" className="inicio-look-section">
        <div className="inicio-look-header">
          <h2>Descubre tu look</h2>
          <p>Elige el momento y te mostramos cómo combinarlo.</p>
        </div>

        <div className="inicio-look-tabs">
          {looks.map((look) => {
            const isActive = look.id === activeLook;
            return (
              <button
                key={look.id}
                onClick={() => setActiveLook(look.id)}
                className={`inicio-look-tab ${isActive ? 'is-active' : ''}`}
              >
                {look.tab}
              </button>
            );
          })}
        </div>

        <div key={activeLookData.id} className="look-panel inicio-look-panel">
          <div
            className="inicio-look-visual"
            style={{ backgroundColor: activeLookData.color }}
          >
            <activeLookData.Icon />
          </div>
          <div>
            <span className="inicio-look-tag">{activeLookData.tab}</span>
            <h3 className="inicio-look-title">{activeLookData.title}</h3>
            <p className="inicio-look-copy">{activeLookData.desc}</p>
            <Link to="/catalogo-cliente" className="inicio-look-link">Ver prendas  →</Link>
          </div>
        </div>
      </Reveal>

      {/* 5. HISTORIA Y VALORES */}
      <Reveal as="section" id="historia" className="inicio-story-section">
        <div className="inicio-story-panel">
          <span className="inicio-story-kicker">Nuestra historia</span>
          <h2 className="inicio-story-title">De un local de barrio a un estilo auténtico</h2>
          <p className="inicio-story-text">
            Pague Menos nació en un pequeño local cercano con la misión de ofrecer moda accesible, atención amable y prendas seleccionadas con cuidado. Queremos que cada visita a nuestra tienda sea una experiencia cercana, agradable y confiable.
          </p>
        </div>

        <div className="inicio-story-grid">
          {[
            { id: 1, tag: 'Valores', title: 'Cercanía y confianza', desc: 'Creemos en el comercio local, en precios claros y en un trato honesto con cada cliente que nos visita.', special: false },
            { id: 2, tag: 'Tienda local', title: 'Compra en tienda', desc: 'Visítanos y pruébate las prendas en persona. Aquí tenemos lo mejor para que te lleves lo que realmente te queda bien.', special: true },
            { id: 3, tag: 'Asesoría', title: 'Te ayudamos a elegir', desc: 'Nuestro equipo está listo para mostrarte combinaciones ideales hechas a la medida de tu día a día.', special: false },
            { id: 4, tag: 'Prueba cómoda', title: 'Sin apuros ni presión', desc: 'Siente la tranquilidad de probar varias opciones con absoluta calma en nuestros probadores acondicionados.', special: false },
          ].map((card) => {
            const isHovered = cardHover === card.id;
            return (
              <div
                key={card.id}
                onMouseEnter={() => setCardHover(card.id)}
                onMouseLeave={() => setCardHover(null)}
                className={`inicio-story-card ${card.special ? 'inicio-story-card--special' : 'inicio-story-card--default'}`}
                style={{
                  transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                  boxShadow: isHovered
                    ? (card.special ? '0 15px 35px rgba(230, 57, 130, 0.35)' : '0 15px 35px rgba(43,24,48,0.08)')
                    : (card.special ? '0 10px 25px rgba(230, 57, 130, 0.22)' : '0 2px 10px rgba(43,24,48,0.03)'),
                }}
              >
                <span className="inicio-story-card-tag">{card.tag}</span>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            );
          })}
        </div>
      </Reveal>

      {/* 6. NÚMEROS QUE NOS RESPALDAN (contadores animados al hacer scroll) */}
      <Reveal as="section" className="inicio-stats-section">
        <AnimatedStat target={300} prefix="+" label="Oufits por hacer!" color={palette.fucsia} />
        <AnimatedStat target={4} label="Años en el barrio" color={palette.gold} />
        <AnimatedStat target={1200} prefix="+" label="Clientes felices" color={palette.sage} />
        <AnimatedStat target={4.9} decimals={1} label="Calificación promedio" color={palette.fucsia} />
      </Reveal>

      {/* 8. FOOTER */}
      <footer className="inicio-footer">
        <div className="inicio-footer-grid">
          <div>
            <div className="display inicio-footer-brand">
              Pague <span className="inicio-brand-accent">Menos</span>
            </div>
            <p className="inicio-footer-copy">
              Moda accesible y trato cercano desde nuestro local de barrio hasta tu clóset.
            </p>
          </div>
          <div>
            <div className="inicio-footer-group-title">Tienda</div>
            <div className="inicio-footer-links">
              <Link to="/catalogo-cliente?genero=Mujer">Mujer</Link>
              <Link to="/catalogo-cliente?genero=Hombre">Hombre</Link>
              <Link to="/catalogo-cliente?genero=Unisex">Unisex</Link>
              <a href="#looks">Descubre tu look</a>
            </div>
          </div>
          <div>
            <div className="inicio-footer-group-title">Ayuda</div>
            <div className="inicio-footer-links">
              <a href="#">Preguntas frecuentes</a>
              <a href="#">Tallas y medidas</a>
              <a href="#">Contacto</a>
            </div>
          </div>
          <div>
            <div className="inicio-footer-group-title">Visítanos</div>
            <div className="inicio-footer-contact">
              Calle 45 #12-34, Bogotá<br />
              Lun a sáb, 9am – 7pm<br />
              hola@paguemenos.co
            </div>
          </div>
        </div>
        <div className="inicio-footer-bottom">
          <span>© {new Date().getFullYear()} Pague Menos. Todos los derechos reservados.</span>
          <span>Hecho con cariño en Bogotá</span>
        </div>
      </footer>
    </div>
  );
}
