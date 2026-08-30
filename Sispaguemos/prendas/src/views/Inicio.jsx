import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function InicioPage() {
  const primaryColor = '#e63982';
  const darkTextColor = '#0f172a';

  // Estados para simular efectos hover avanzados en React de forma limpia
  const [hoverPrendas, setHoverPrendas] = useState(false);
  const [hoverUsuario, setHoverUsuario] = useState(false);
  const [cardHover, setCardHover] = useState(null);

  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif', 
      backgroundColor: '#ffffff', 
      width: '100%', 
      minHeight: '100vh', 
      margin: 0, 
      padding: 0, 
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      
      {/* 1. BARRA DE NAVEGACIÓN SUPERIOR */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1.5rem 5rem', 
        borderBottom: '1px solid #f1f5f9',
        backgroundColor: '#ffffff',
        width: '100%',
        boxSizing: 'border-box',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.5px', color: darkTextColor }}>
          PAGUE <span style={{ color: primaryColor }}>MENOS</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Botón Prendas con animación */}
          <Link 
            to="/prendas" 
            onMouseEnter={() => setHoverPrendas(true)}
            onMouseLeave={() => setHoverPrendas(false)}
            style={{ 
              backgroundColor: hoverPrendas ? primaryColor : 'transparent', 
              border: `2px solid ${primaryColor}`, 
              color: hoverPrendas ? '#ffffff' : primaryColor, 
              padding: '0.6rem 1.6rem', 
              borderRadius: '30px', 
              fontWeight: '700', 
              cursor: 'pointer',
              fontSize: '0.9rem',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: hoverPrendas ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: hoverPrendas ? '0 6px 20px rgba(230, 57, 130, 0.3)' : 'none'
            }}
          >
            Prendas
          </Link>
          
          {/* Botón Usuario con animación */}
          <Link 
            to="/usuarios" 
            onMouseEnter={() => setHoverUsuario(true)}
            onMouseLeave={() => setHoverUsuario(false)}
            style={{ 
              backgroundColor: hoverUsuario ? '#d02b70' : primaryColor, 
              border: '2px solid transparent', 
              color: '#ffffff', 
              padding: '0.6rem 1.6rem', 
              borderRadius: '30px', 
              fontWeight: '700', 
              cursor: 'pointer',
              fontSize: '0.9rem',
              textDecoration: 'none',
              display: 'inline-block',
              boxShadow: hoverUsuario ? '0 8px 25px rgba(230, 57, 130, 0.4)' : '0 4px 12px rgba(230, 57, 130, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: hoverUsuario ? 'translateY(-2px)' : 'translateY(0)'
            }}
          >
            Usuario
          </Link>
        </div>
      </header>

      {/* 2. CABECERA PRINCIPAL (BANNER FUCSIA CON EFECTO VISUAL) */}
      <section style={{ 
        backgroundColor: primaryColor, 
        color: '#ffffff', 
        padding: '6rem 5rem', 
        width: '100%',
        margin: 0,
        boxSizing: 'border-box',
        backgroundImage: 'radial-gradient(circle at 85% 20%, rgba(255,255,255,0.2) 0%, transparent 60%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '950px', position: 'relative', zIndex: 2 }}>
          <span style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.2)', 
            backdropFilter: 'blur(5px)',
            padding: '0.5rem 1.2rem', 
            borderRadius: '30px', 
            fontSize: '0.75rem', 
            fontWeight: '800', 
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            display: 'inline-block',
            marginBottom: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            ⚡ Tendencia • Estilo • Comodidad Local
          </span>
          
          <h1 style={{ 
            fontSize: '3.8rem', 
            fontWeight: '900', 
            lineHeight: '1.05', 
            margin: '0 0 1.5rem 0',
            letterSpacing: '-1.5px'
          }}>
            Descubre el estilo que te queda bien <span style={{ opacity: 0.9, fontStyle: 'italic', fontWeight: '400' }}>sin pagar de más.</span>
          </h1>
          
          <p style={{ fontSize: '1.15rem', opacity: '0.95', lineHeight: '1.6', maxWidth: '700px', margin: 0, fontWeight: '400' }}>
            Encuentra prendas únicas con atención personalizada en tienda y precios especiales. Renovar tu armario ahora es fácil, cómodo y cercano.
          </p>
        </div>
      </section>

      {/* 3. SECCIÓN INFORMATIVA / HISTORIA Y TARJETAS */}
      <main style={{ 
        width: '100%', 
        padding: '5rem', 
        boxSizing: 'border-box', 
        display: 'grid', 
        gridTemplateColumns: '1.1fr 1.9fr', 
        gap: '3rem',
        backgroundColor: '#f8fafc'
      }}>
        
        {/* Columna Izquierda: Nuestra Historia */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          padding: '3rem', 
          borderRadius: '28px', 
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        }}>
          <span style={{ color: primaryColor, fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>
            Nuestra Historia
          </span>
          <h2 style={{ fontSize: '2.4rem', color: darkTextColor, lineHeight: '1.2', margin: '0 0 1.5rem 0', fontWeight: '800' }}>
            De un local de barrio a un estilo auténtico
          </h2>
          <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: '1.7', margin: 0 }}>
            Pague Menos nació en un pequeño local cercano con la misión de ofrecer moda accesible, atención amable y prendas seleccionadas con cuidado. Queremos que cada visita a nuestra tienda sea una experiencia cercana, agradable y confiable.
          </p>
        </div>

        {/* Columna Derecha: Cuadrícula de Tarjetas Interactivas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          
          {[
            { id: 1, tag: 'Valores', title: 'Cercanía y confianza', desc: 'Creemos en el comercio local, en precios claros y en un trato honesto con cada cliente que nos visita.', special: false },
            { id: 2, tag: 'Tienda Local', title: 'Compra en tienda', desc: 'Visítanos y pruébate las prendas en persona. Aquí tenemos lo mejor para que te lleves lo que realmente te queda bien.', special: true },
            { id: 3, tag: 'Asesoría', title: 'Te ayudamos a elegir', desc: 'Nuestro equipo está listo para mostrarte combinaciones ideales hechas a la medida de tu día a día.', special: false },
            { id: 4, tag: 'Prueba Cómoda', title: 'Sin apuros ni presión', desc: 'Siente la tranquilidad de probar varias opciones con absoluta calma en nuestros probadores acondicionados.', special: false }
          ].map((card) => {
            const isHovered = cardHover === card.id;
            return (
              <div 
                key={card.id}
                onMouseEnter={() => setCardHover(card.id)}
                onMouseLeave={() => setCardHover(null)}
                style={{ 
                  backgroundColor: card.special ? primaryColor : '#ffffff', 
                  color: card.special ? '#ffffff' : darkTextColor,
                  padding: '2.5rem', 
                  borderRadius: '28px', 
                  border: card.special ? 'none' : '1px solid #e2e8f0',
                  boxShadow: isHovered 
                    ? (card.special ? '0 15px 35px rgba(230, 57, 130, 0.4)' : '0 15px 35px rgba(0,0,0,0.08)')
                    : (card.special ? '0 10px 25px rgba(230, 57, 130, 0.25)' : '0 4px 15px rgba(0,0,0,0.02)'),
                  transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer'
                }}
              >
                <span style={{ 
                  color: card.special ? '#ffffff' : primaryColor, 
                  fontSize: '0.75rem', 
                  fontWeight: '800', 
                  letterSpacing: '1px', 
                  textTransform: 'uppercase',
                  opacity: card.special ? 0.9 : 1
                }}>
                  {card.tag}
                </span>
                <h3 style={{ fontSize: '1.35rem', margin: '0.8rem 0 0.8rem 0', fontWeight: '700' }}>
                  {card.title}
                </h3>
                <p style={{ color: card.special ? '#ffffff' : '#475569', fontSize: '0.95rem', lineHeight: '1.6', margin: 0, opacity: card.special ? 0.95 : 1 }}>
                  {card.desc}
                </p>
              </div>
            );
          })}

        </div>

      </main>

    </div>
  );
}