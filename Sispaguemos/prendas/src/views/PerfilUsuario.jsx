import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

export default function PerfilUsuario() {
  const navigate = useNavigate();

  const usuario = useMemo(() => {
    try {
      const raw = localStorage.getItem('usuarioActual');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  if (!usuario) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: palette.cream,
        padding: '2rem',
        color: palette.ink,
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '22px',
          boxShadow: '0 18px 40px rgba(43,24,48,0.08)',
          padding: '2rem 2.5rem',
          textAlign: 'center',
        }}>
          <h2 style={{ margin: '0 0 0.7rem 0' }}>No has iniciado sesión</h2>
          <p style={{ margin: 0, color: palette.slate }}>Inicia sesión para ver tu perfil.</p>
          <Link to="/iniciosesionregistro" style={{
            display: 'inline-block',
            marginTop: '1.2rem',
            background: palette.fucsia,
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '30px',
            padding: '0.8rem 1.4rem',
            fontWeight: 700,
          }}>
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  const avatarSrc = usuario.imagenPerfil ? `data:image/jpeg;base64,${usuario.imagenPerfil}` : null;
  const iniciales = `${(usuario.primerNom || '').trim().charAt(0)?.toUpperCase() || ''}${(usuario.primerApelli || '').trim().charAt(0)?.toUpperCase() || ''}` || 'U';

  const cerrarSesion = () => {
    localStorage.removeItem('usuarioActual');
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: palette.cream,
      padding: '3rem 1.5rem',
      fontFamily: 'Inter, sans-serif',
      color: palette.ink,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '760px',
        background: '#fff',
        borderRadius: '28px',
        boxShadow: '0 22px 48px rgba(43,24,48,0.08)',
        overflow: 'hidden',
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${palette.fucsia} 0%, ${palette.fucsiaDark} 100%)`,
          padding: '2rem 2rem 1.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              background: avatarSrc ? '#fff' : 'rgba(255,255,255,0.18)',
              border: '3px solid rgba(255,255,255,0.85)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {avatarSrc ? (
                <img src={avatarSrc} alt="Foto de perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.8rem' }}>{iniciales}</span>
              )}
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.8 }}>
                Perfil de usuario
              </div>
              <h1 style={{ margin: '0.15rem 0 0', color: '#fff', fontSize: '2rem' }}>
                {usuario.primerNom || 'Usuario'} {usuario.primerApelli || ''}
              </h1>
            </div>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))', gap: '1rem' }}>
            <InfoCard label="Primer nombre" value={usuario.primerNom || '—'} />
            <InfoCard label="Segundo nombre" value={usuario.segundNom || '—'} />
            <InfoCard label="Primer apellido" value={usuario.primerApelli || '—'} />
            <InfoCard label="Segundo apellido" value={usuario.segundApelli || '—'} />
            <InfoCard label="Correo" value={usuario.correo || '—'} full />
            <InfoCard label="Rol" value={usuario.rol || 'Cliente'} />
            <InfoCard label="Estado" value={usuario.estado === 1 ? 'Activo' : 'Inactivo'} />
            <InfoCard label="Fecha de ingreso" value={usuario.fechaIngreso ? new Date(usuario.fechaIngreso).toLocaleDateString() : '—'} />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', flexWrap: 'wrap' }}>
            <Link to="/" style={{
              background: '#fff',
              color: palette.fucsia,
              border: `2px solid ${palette.fucsia}`,
              borderRadius: '30px',
              padding: '0.8rem 1.4rem',
              textDecoration: 'none',
              fontWeight: 700,
            }}>
              Volver al inicio
            </Link>
            <button type="button" onClick={cerrarSesion} style={{
              background: palette.fucsia,
              color: '#fff',
              border: 'none',
              borderRadius: '30px',
              padding: '0.8rem 1.4rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, full = false }) {
  return (
    <div style={{
      background: '#f8f4f5',
      border: '1px solid rgba(230,57,130,0.08)',
      borderRadius: '16px',
      padding: '1rem',
      gridColumn: full ? '1 / -1' : 'auto',
    }}>
      <div style={{ color: '#7a5e6d', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ marginTop: '0.4rem', fontSize: '1rem', fontWeight: 600, wordBreak: 'break-word' }}>
        {value}
      </div>
    </div>
  );
}
