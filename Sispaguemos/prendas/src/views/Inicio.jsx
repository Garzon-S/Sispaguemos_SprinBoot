import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
    { id: 'mujer', nombre: 'Mujer', cantidad: '128 prendas', color: palette.fucsia, Icon: IconDress },
    { id: 'hombre', nombre: 'Hombre', cantidad: '96 prendas', color: palette.plum, Icon: IconShirt },
    { id: 'unisex', nombre: 'Unisex', cantidad: '62 prendas', color: palette.sage, Icon: IconSwap },
  ];

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
    <div style={{
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      backgroundColor: palette.cream,
      width: '100%',
      minHeight: '100vh',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      overflowX: 'hidden',
      color: palette.ink,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: inherit; }
        h1, h2, h3, .display { font-family: 'Fraunces', Georgia, serif; }
        input::placeholder { color: ${palette.slate}; opacity: 0.7; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        .hero-anim > * { opacity: 0; animation: fadeUp 0.7s ease forwards; }
        .hero-anim > *:nth-child(1) { animation-delay: 0.05s; }
        .hero-anim > *:nth-child(2) { animation-delay: 0.15s; }
        .hero-anim > *:nth-child(3) { animation-delay: 0.25s; }
        .hero-anim > *:nth-child(4) { animation-delay: 0.35s; }
        .hero-anim > *:nth-child(5) { animation-delay: 0.45s; }

        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .floating { animation: float 4.5s ease-in-out infinite; }
        .floating-slow { animation: float 5.5s ease-in-out infinite; animation-delay: 0.6s; }

        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .marquee-track { display: flex; width: max-content; animation: marquee 26s linear infinite; }

        @keyframes panelIn { from { opacity: 0; transform: translateX(14px); } to { opacity: 1; transform: translateX(0); } }
        .look-panel { animation: panelIn 0.45s ease; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* 1. BARRA DE NAVEGACIÓN SUPERIOR */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.4rem 5rem',
        borderBottom: `1px solid ${palette.sand}`,
        backgroundColor: '#ffffff',
        width: '100%',
        boxSizing: 'border-box',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        gap: '2rem',
      }}>
        <div className="display" style={{ fontSize: '1.4rem', fontWeight: '700', letterSpacing: '-0.3px', color: palette.ink, whiteSpace: 'nowrap' }}>
          Pague <span style={{ color: palette.fucsia, fontStyle: 'italic' }}>Menos</span>
        </div>

        <nav style={{ display: 'flex', gap: '2rem', fontSize: '0.92rem', fontWeight: '600', color: palette.slate }}>
          <a href="#mujer" style={{ color: 'inherit', textDecoration: 'none' }}>Mujer</a>
          <a href="#hombre" style={{ color: 'inherit', textDecoration: 'none' }}>Hombre</a>
          <a href="#unisex" style={{ color: 'inherit', textDecoration: 'none' }}>Unisex</a>
          <a href="#historia" style={{ color: 'inherit', textDecoration: 'none' }}>Nuestra historia</a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {usuarioActual ? (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setMenuAbierto((prev) => !prev)}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  border: `2px solid ${palette.fucsia}`,
                  background: avatarSrc ? '#ffffff' : 'linear-gradient(135deg, #f8bfd7 0%, #e63982 100%)',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 18px rgba(230, 57, 130, 0.28)',
                  padding: 0,
                  overflow: 'hidden',
                }}
                aria-label="Menú de usuario"
              >
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="Foto de perfil"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <span style={{ color: '#fff' }}>{inicialesUsuario}</span>
                )}
              </button>

              {menuAbierto && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 0.8rem)',
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: '0 14px 30px rgba(43, 24, 48, 0.12)',
                  border: '1px solid rgba(43, 24, 48, 0.06)',
                  minWidth: '170px',
                  overflow: 'hidden',
                  zIndex: 20,
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuAbierto(false);
                      navigate('/perfil');
                    }}
                    style={{
                      width: '100%',
                      border: 'none',
                      background: '#fff',
                      color: palette.ink,
                      padding: '0.9rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.92rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Perfil
                  </button>
                  <button
                    type="button"
                    onClick={cerrarSesion}
                    style={{
                      width: '100%',
                      border: 'none',
                      background: '#fff',
                      color: palette.fucsiaDark,
                      padding: '0.9rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.92rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      borderTop: '1px solid rgba(43, 24, 48, 0.08)',
                    }}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </header>

      {/* 2. HERO (con entrada animada al cargar) */}
      <section style={{
        backgroundColor: palette.fucsia,
        color: '#ffffff',
        padding: '5.5rem 5rem',
        width: '100%',
        margin: 0,
        boxSizing: 'border-box',
        backgroundImage: `radial-gradient(circle at 88% 15%, rgba(255,255,255,0.18) 0%, transparent 55%)`,
        position: 'relative',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        gap: '3rem',
        alignItems: 'center',
      }}>
        <div className="hero-anim" style={{ position: 'relative', zIndex: 2 }}>
          <span style={{
            backgroundColor: 'rgba(255, 255, 255, 0.16)',
            backdropFilter: 'blur(5px)',
            padding: '0.5rem 1.2rem',
            borderRadius: '30px',
            fontSize: '0.8rem',
            fontWeight: '600',
            display: 'inline-block',
            marginBottom: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.28)',
          }}>
            Nueva colección de temporada ya en tienda
          </span>

          <h1 className="display" style={{
            fontSize: '3.4rem',
            fontWeight: '600',
            lineHeight: '1.1',
            margin: '0 0 1.5rem 0',
            letterSpacing: '-1px',
          }}>
            El estilo que te queda bien, sin pagar de más
          </h1>

          <p style={{ fontSize: '1.1rem', opacity: '0.95', lineHeight: '1.6', maxWidth: '520px', margin: '0 0 2.2rem 0', fontWeight: '400' }}>
            Prendas únicas seleccionadas con cuidado, atención personalizada en tienda y precios pensados para tu bolsillo. Renovar tu armario nunca fue tan fácil.
          </p>

          {!usuarioActual && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.8rem' }}>
              <Link to="/iniciosesionregistro" style={{
                backgroundColor: '#ffffff',
                color: palette.fucsiaDark,
                padding: '0.85rem 1.9rem',
                borderRadius: '30px',
                fontWeight: '700',
                fontSize: '0.95rem',
                textDecoration: 'none',
                display: 'inline-block',
              }}>
                Iniciar Sesion
              </Link>
              <Link to="/prendas" style={{
                border: '2px solid rgba(255,255,255,0.6)',
                color: '#ffffff',
                padding: '0.8rem 1.7rem',
                borderRadius: '30px',
                fontWeight: '700',
                fontSize: '0.95rem',
                textDecoration: 'none',
                display: 'inline-block',
              }}>
                Catálogo
              </Link>
            </div>
          )}

          <div style={{ display: 'flex', gap: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.25)', paddingTop: '1.5rem' }}>
            <div>
              <div className="display" style={{ fontSize: '1.6rem', fontWeight: '600' }}>+300</div>
              <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>Oufits por hacer!</div>
            </div>
            <div>
              <div className="display" style={{ fontSize: '1.6rem', fontWeight: '600' }}>4 años</div>
              <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>Atendiendo al barrio</div>
            </div>
            <div>
              <div className="display" style={{ fontSize: '1.6rem', fontWeight: '600' }}>4.9</div>
              <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>Calificación de clientes</div>
            </div>
          </div>
        </div>

        {/* Collage visual con las prendas destacadas, con una pieza flotante */}
        <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="floating" style={{ backgroundColor: palette.plum, borderRadius: '24px', height: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1.2rem', gridRow: 'span 2' }}>
            <IconDress />
            <span style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '0.6rem' }}>Mujer</span>
          </div>
          <div style={{ backgroundColor: palette.gold, borderRadius: '24px', height: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1.2rem' }}>
            <IconShirt color={palette.plum} />
            <span style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '0.6rem', color: palette.plum }}>Hombre</span>
          </div>
          <div className="floating-slow" style={{ backgroundColor: palette.sage, borderRadius: '24px', height: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1.2rem' }}>
            <IconSwap color={palette.plum} />
            <span style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '0.6rem', color: palette.plum }}>Unisex</span>
          </div>
        </div>
      </section>

      {/* MARQUESINA: cinta con movimiento continuo entre el hero y el resto */}
      <div style={{ backgroundColor: palette.plum, overflow: 'hidden', padding: '0.9rem 0' }}>
        <div className="marquee-track">
          {[...Array(2)].map((_, rep) => (
            <div key={rep} style={{ display: 'flex', alignItems: 'center' }}>
              {['Moda accesible', 'Atención cercana', 'Precios justos', 'Mujer, hombre y unisex', 'Prueba sin apuro'].map((frase, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', color: '#ffffff', fontSize: '0.95rem', fontWeight: '600', whiteSpace: 'nowrap' }}>
                  {frase}
                  <span style={{ color: palette.fucsia, margin: '0 1.6rem', fontSize: '1.2rem' }}>●</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 3. CATEGORÍAS */}
      <Reveal as="section" style={{ padding: '4.5rem 5rem 1rem', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem' }}>
          <h2 className="display" style={{ fontSize: '2rem', fontWeight: '600', margin: 0, color: palette.ink }}>Categorias Disponibles</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.4rem' }}>
          {categorias.map((cat) => {
            const isHovered = hoverCategory === cat.id;
            const { Icon } = cat;
            return (
              <a
                key={cat.id}
                id={cat.id}
                href={`#${cat.id}`}
                onMouseEnter={() => setHoverCategory(cat.id)}
                onMouseLeave={() => setHoverCategory(null)}
                style={{
                  backgroundColor: cat.color,
                  borderRadius: '22px',
                  padding: '2rem',
                  height: '190px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  textDecoration: 'none',
                  color: '#ffffff',
                  transform: isHovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
                  boxShadow: isHovered ? '0 16px 30px rgba(43,24,48,0.18)' : '0 4px 14px rgba(43,24,48,0.06)',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  boxSizing: 'border-box',
                }}
              >
                <Icon />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '1.2rem' }}>{cat.nombre}</div>
                  <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>{cat.cantidad}</div>
                </div>
              </a>
            );
          })}
        </div>
      </Reveal>

      {/* 4. DESCUBRE TU LOOK (panel interactivo con animación al cambiar de pestaña) */}
      <Reveal as="section" id="looks" style={{ padding: '4.5rem 5rem', boxSizing: 'border-box' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 className="display" style={{ fontSize: '2rem', fontWeight: '600', margin: '0 0 0.4rem 0', color: palette.ink }}>Descubre tu look</h2>
          <p style={{ color: palette.slate, margin: 0, fontSize: '1rem' }}>Elige el momento y te mostramos cómo combinarlo.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.7rem', marginBottom: '2rem' }}>
          {looks.map((look) => {
            const isActive = look.id === activeLook;
            return (
              <button
                key={look.id}
                onClick={() => setActiveLook(look.id)}
                style={{
                  padding: '0.7rem 1.5rem',
                  borderRadius: '30px',
                  border: isActive ? 'none' : `1.5px solid ${palette.sand}`,
                  backgroundColor: isActive ? palette.fucsia : '#ffffff',
                  color: isActive ? '#ffffff' : palette.slate,
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease',
                }}
              >
                {look.tab}
              </button>
            );
          })}
        </div>

        <div key={activeLookData.id} className="look-panel" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.3fr',
          gap: '2.5rem',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          border: `1px solid ${palette.sand}`,
          borderRadius: '28px',
          padding: '2.5rem',
        }}>
          <div style={{
            backgroundColor: activeLookData.color,
            borderRadius: '22px',
            height: '260px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <activeLookData.Icon />
          </div>
          <div>
            <span style={{ color: palette.fucsiaDark, fontSize: '0.8rem', fontWeight: '700' }}>{activeLookData.tab}</span>
            <h3 className="display" style={{ fontSize: '1.7rem', fontWeight: '600', margin: '0.5rem 0 1rem 0', color: palette.ink }}>
              {activeLookData.title}
            </h3>
            <p style={{ color: palette.slate, fontSize: '1rem', lineHeight: '1.7', margin: '0 0 1.5rem 0' }}>
              {activeLookData.desc}
            </p>
            <Link to="/catalogo" style={{
              color: palette.fucsiaDark,
              fontWeight: '700',
              fontSize: '0.9rem',
              textDecoration: 'none',
            }}>
              Ver prendas  →
            </Link>
          </div>
        </div>
      </Reveal>

      {/* 5. HISTORIA Y VALORES */}
      <Reveal as="section" id="historia" style={{
        width: '100%',
        padding: '4.5rem 5rem',
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: '1.1fr 1.9fr',
        gap: '3rem',
        backgroundColor: palette.sand,
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '3rem',
          borderRadius: '28px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <span style={{ color: palette.fucsiaDark, fontSize: '0.82rem', fontWeight: '700', marginBottom: '1rem', display: 'block' }}>
            Nuestra historia
          </span>
          <h2 className="display" style={{ fontSize: '2.2rem', color: palette.ink, lineHeight: '1.2', margin: '0 0 1.5rem 0', fontWeight: '600' }}>
            De un local de barrio a un estilo auténtico
          </h2>
          <p style={{ color: palette.slate, fontSize: '1.02rem', lineHeight: '1.7', margin: 0 }}>
            Pague Menos nació en un pequeño local cercano con la misión de ofrecer moda accesible, atención amable y prendas seleccionadas con cuidado. Queremos que cada visita a nuestra tienda sea una experiencia cercana, agradable y confiable.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
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
                style={{
                  backgroundColor: card.special ? palette.fucsia : '#ffffff',
                  color: card.special ? '#ffffff' : palette.ink,
                  padding: '2.2rem',
                  borderRadius: '26px',
                  boxShadow: isHovered
                    ? (card.special ? '0 15px 35px rgba(230, 57, 130, 0.35)' : '0 15px 35px rgba(43,24,48,0.08)')
                    : (card.special ? '0 10px 25px rgba(230, 57, 130, 0.22)' : '0 2px 10px rgba(43,24,48,0.03)'),
                  transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <span style={{
                  color: card.special ? '#ffffff' : palette.fucsiaDark,
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  opacity: card.special ? 0.9 : 1,
                }}>
                  {card.tag}
                </span>
                <h3 style={{ fontSize: '1.25rem', margin: '0.7rem 0 0.7rem 0', fontWeight: '700' }}>
                  {card.title}
                </h3>
                <p style={{ color: card.special ? '#ffffff' : palette.slate, fontSize: '0.92rem', lineHeight: '1.6', margin: 0, opacity: card.special ? 0.95 : 1 }}>
                  {card.desc}
                </p>
              </div>
            );
          })}
        </div>
      </Reveal>

      {/* 6. NÚMEROS QUE NOS RESPALDAN (contadores animados al hacer scroll) */}
      <Reveal as="section" style={{
        backgroundColor: palette.plum,
        color: '#ffffff',
        padding: '4rem 5rem',
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '2rem',
        textAlign: 'center',
      }}>
        <AnimatedStat target={300} prefix="+" label="Oufits por hacer!" color={palette.fucsia} />
        <AnimatedStat target={4} label="Años en el barrio" color={palette.gold} />
        <AnimatedStat target={1200} prefix="+" label="Clientes felices" color={palette.sage} />
        <AnimatedStat target={4.9} decimals={1} label="Calificación promedio" color={palette.fucsia} />
      </Reveal>



      {/* 8. FOOTER */}
      <footer style={{ backgroundColor: palette.ink, color: 'rgba(255,255,255,0.75)', padding: '3.5rem 5rem 2rem', boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
          <div>
            <div className="display" style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.8rem' }}>
              Pague <span style={{ color: palette.fucsia, fontStyle: 'italic' }}>Menos</span>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: '1.6', maxWidth: '260px', margin: 0 }}>
              Moda accesible y trato cercano desde nuestro local de barrio hasta tu clóset.
            </p>
          </div>
          <div>
            <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.9rem' }}>Tienda</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
              <a href="#mujer" style={{ color: 'inherit', textDecoration: 'none' }}>Mujer</a>
              <a href="#hombre" style={{ color: 'inherit', textDecoration: 'none' }}>Hombre</a>
              <a href="#unisex" style={{ color: 'inherit', textDecoration: 'none' }}>Unisex</a>
              <a href="#looks" style={{ color: 'inherit', textDecoration: 'none' }}>Descubre tu look</a>
            </div>
          </div>
          <div>
            <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.9rem' }}>Ayuda</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Preguntas frecuentes</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Tallas y medidas</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Contacto</a>
            </div>
          </div>
          <div>
            <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.9rem' }}>Visítanos</div>
            <div style={{ fontSize: '0.88rem', lineHeight: '1.7' }}>
              Calle 45 #12-34, Bogotá<br />
              Lun a sáb, 9am – 7pm<br />
              hola@paguemenos.co
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '1.5rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>© {new Date().getFullYear()} Pague Menos. Todos los derechos reservados.</span>
          <span>Hecho con cariño en Bogotá</span>
        </div>
      </footer>
    </div>
  );
}
