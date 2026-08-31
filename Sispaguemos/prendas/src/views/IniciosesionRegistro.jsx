import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUsuario, registrarUsuario } from '../services/usuarioService';

// ---------------------------------------------------------------------------
// Misma paleta de Pague Menos: fucsia de marca + verde salvia, dorado y
// ciruela oscuro como acentos.
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
  error: '#c0392b',
};

function IconHanger({ color = '#fff' }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
      <path d="M12 3.5a1.6 1.6 0 1 1 1.7 1.6" strokeLinecap="round" />
      <path d="M12 5.1v2.2" strokeLinecap="round" />
      <path d="M12 7.3 2.5 13.8c-1 .7-.5 2.2.7 2.2h17.6c1.2 0 1.7-1.5.7-2.2L12 7.3Z" strokeLinejoin="round" />
      <path d="M5 18.5h14" strokeLinecap="round" />
    </svg>
  );
}
function IconShirt({ color = '#fff' }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
      <path d="M8 3 3 6.5 5.5 10 8 8.3V21h8V8.3l2.5 1.7L21 6.5 16 3l-2 2H10L8 3Z" strokeLinejoin="round" />
    </svg>
  );
}
function IconDress({ color = '#fff' }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
      <path d="M10 2h4l.7 3.2L17 8l3 11.5c.2.8-.4 1.5-1.2 1.5H5.2c-.8 0-1.4-.7-1.2-1.5L7 8l2.3-2.8L10 2Z" strokeLinejoin="round" />
      <path d="M9.5 5.2h5" strokeLinecap="round" />
    </svg>
  );
}
function IconEye({ open }) {
  return open ? (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={palette.slate} strokeWidth="1.7">
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={palette.slate} strokeWidth="1.7">
      <path d="M3 3l18 18" strokeLinecap="round" />
      <path d="M10.6 5.1C11 5 11.5 5 12 5c7 0 10.5 7 10.5 7a15 15 0 0 1-3.4 4.2M6.6 6.6C3.6 8.4 1.5 12 1.5 12s3.5 7 10.5 7c1.3 0 2.5-.2 3.5-.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" strokeLinecap="round" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4">
      <path d="M4 12.5 9.5 18 20 6" strokeLinecap="round" strokeLinejoin="round" className="check-path" />
    </svg>
  );
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Field({ label, error, children }) {
  return (
    <div className={error ? 'field shake' : 'field'} style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: palette.ink, marginBottom: '0.4rem' }}>
        {label}
      </label>
      {children}
      {error && (
        <div style={{ color: palette.error, fontSize: '0.78rem', marginTop: '0.35rem', fontWeight: '500' }}>
          {error}
        </div>
      )}
    </div>
  );
}

function TextInput({ error, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      onFocus={(e) => { setFocused(true); props.onFocus && props.onFocus(e); }}
      onBlur={(e) => { setFocused(false); props.onBlur && props.onBlur(e); }}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: '0.85rem 1rem',
        borderRadius: '14px',
        border: `1.6px solid ${error ? palette.error : focused ? palette.fucsia : palette.sand}`,
        fontSize: '0.95rem',
        outline: 'none',
        backgroundColor: focused ? '#ffffff' : palette.cream,
        color: palette.ink,
        boxShadow: focused ? `0 0 0 4px ${error ? 'rgba(192,57,43,0.12)' : 'rgba(230,57,130,0.12)'}` : 'none',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
      }}
    />
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success'

  const [login, setLogin] = useState({ email: '', password: '', remember: false });
  const [loginErrors, setLoginErrors] = useState({});
  const [showLoginPw, setShowLoginPw] = useState(false);

  const [reg, setReg] = useState({
    primerNom: '',
    segundNom: '',
    primerApelli: '',
    segundApelli: '',
    email: '',
    password: '',
    confirm: '',
    imagenPerfil: null,
    terms: false,
  });
  const [regErrors, setRegErrors] = useState({});
  const [showRegPw, setShowRegPw] = useState(false);
  const [previewImagen, setPreviewImagen] = useState('');

  function switchMode(next) {
    if (next === mode) return;
    setMode(next);
    setStatus('idle');
    setLoginErrors({});
    setRegErrors({});
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!emailRegex.test(login.email)) errs.email = 'Ingresa un correo válido.';
    if (login.password.length < 6) errs.password = 'La contraseña debe tener al menos 6 caracteres.';
    setLoginErrors(errs);
    if (Object.keys(errs).length) return;

    setStatus('loading');
    try {
      const usuario = await loginUsuario({
        correo: login.email.trim(),
        contrasena: login.password,
      });

      const rol = String(usuario?.rol ?? '').trim().toLowerCase();
      localStorage.setItem('usuarioActual', JSON.stringify(usuario));
      setStatus('success');

      const destino = rol === 'administrador' || rol === 'empleado' ? '/dashboard' : '/';
      setTimeout(() => navigate(destino), 900);
    } catch (error) {
      setLoginErrors({
        password: error.message || 'Credenciales inválidas. Verifica tu correo y contraseña.',
      });
      setStatus('idle');
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (reg.primerNom.trim().length < 2) errs.primerNom = 'Ingresa tu primer nombre.';
    if (reg.primerApelli.trim().length < 2) errs.primerApelli = 'Ingresa tu primer apellido.';
    if (!emailRegex.test(reg.email)) errs.email = 'Ingresa un correo válido.';
    if (reg.password.length < 6) errs.password = 'La contraseña debe tener al menos 6 caracteres.';
    if (reg.confirm !== reg.password) errs.confirm = 'Las contraseñas no coinciden.';
    if (!reg.terms) errs.terms = 'Debes aceptar los términos para continuar.';
    setRegErrors(errs);
    if (Object.keys(errs).length) return;

    setStatus('loading');
    try {
      const payload = {
        primerNom: reg.primerNom.trim(),
        segundNom: reg.segundNom.trim(),
        primerApelli: reg.primerApelli.trim(),
        segundApelli: reg.segundApelli.trim(),
        correo: reg.email.trim(),
        contrasena: reg.password,
        estado: 1,
      };

      if (reg.imagenPerfil instanceof File) {
        payload.imagenPerfil = reg.imagenPerfil;
      }

      const usuario = await registrarUsuario(payload);

      const rol = String(usuario?.rol ?? '').trim().toLowerCase();
      localStorage.setItem('usuarioActual', JSON.stringify(usuario));
      setStatus('success');

      const destino = rol === 'administrador' || rol === 'empleado' ? '/dashboard' : '/';
      setTimeout(() => navigate(destino), 900);
    } catch (error) {
      setRegErrors({ email: error.message || 'No se pudo crear la cuenta.' });
      setStatus('idle');
    }
  }

  const brandCopy = mode === 'login'
    ? { title: 'Bienvenido de nuevo', desc: 'Entra a tu cuenta para ver tus pedidos, tus prendas guardadas y tus ofertas exclusivas.' }
    : { title: 'Únete a Pague Menos', desc: 'Crea tu cuenta en un minuto y guarda tus prendas favoritas, sigue tus pedidos y entérate primero de las novedades.' };

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      backgroundColor: palette.cream,
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: inherit; box-sizing: border-box; }
        .display { font-family: 'Fraunces', Georgia, serif; }
        input::placeholder { color: ${palette.slate}; opacity: 0.6; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cardIn { from { opacity: 0; transform: translateY(24px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .card-in { animation: cardIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }

        @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-14px) rotate(4deg); } }
        .blob { position: absolute; border-radius: 50%; filter: blur(2px); opacity: 0.9; animation: float 6s ease-in-out infinite; }

        @keyframes panelIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
        .panel-in { animation: panelIn 0.4s ease; }

        @keyframes brandIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .brand-in { animation: brandIn 0.45s ease; }

        @keyframes shake { 10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(2px); } 30%, 50%, 70% { transform: translateX(-4px); } 40%, 60% { transform: translateX(4px); } }
        .shake { animation: shake 0.5s ease; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.8s linear infinite; }

        @keyframes checkIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .check-circle { animation: checkIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }

        .switch-btn { transition: color 0.25s ease; }
        .social-btn { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
        .social-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(43,24,48,0.1); border-color: ${palette.sand}; }
        .submit-btn { transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(230,57,130,0.35); }
        .link-hover { transition: opacity 0.2s ease; }
        .link-hover:hover { opacity: 0.7; }
        .checkbox-anim { transition: background-color 0.2s ease, border-color 0.2s ease; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation: none !important; transition: none !important; }
        }

        @media (max-width: 860px) {
          .auth-grid { grid-template-columns: 1fr !important; }
          .brand-panel { display: none !important; }
        }
      `}</style>

      {/* Formas decorativas flotantes de fondo */}
      <div className="blob" style={{ width: '220px', height: '220px', backgroundColor: palette.sage, top: '-60px', left: '-60px', opacity: 0.35 }} />
      <div className="blob" style={{ width: '260px', height: '260px', backgroundColor: palette.gold, bottom: '-80px', right: '-60px', opacity: 0.25, animationDelay: '1.2s' }} />
      <div className="blob" style={{ width: '140px', height: '140px', backgroundColor: palette.fucsia, bottom: '10%', left: '4%', opacity: 0.15, animationDelay: '0.6s' }} />

      <div className="card-in auth-grid" style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: '960px',
        display: 'grid',
        gridTemplateColumns: '0.85fr 1.15fr',
        backgroundColor: '#ffffff',
        borderRadius: '32px',
        overflow: 'hidden',
        boxShadow: '0 30px 60px rgba(43,24,48,0.14)',
      }}>

        {/* PANEL DE MARCA */}
        <div className="brand-panel" style={{
          backgroundColor: palette.fucsia,
          backgroundImage: `radial-gradient(circle at 20% 15%, rgba(255,255,255,0.18) 0%, transparent 55%), radial-gradient(circle at 85% 85%, rgba(43,24,48,0.25) 0%, transparent 55%)`,
          color: '#ffffff',
          padding: '3rem 2.4rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <Link to="/" className="link-hover" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            ← Volver a la tienda
          </Link>

          <div key={mode} className="brand-in">
            <div className="display" style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>
              Pague <span style={{ fontStyle: 'italic' }}>Menos</span>
            </div>
            <h1 className="display" style={{ fontSize: '2rem', fontWeight: '600', lineHeight: '1.2', margin: '0 0 1rem 0' }}>
              {brandCopy.title}
            </h1>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', opacity: 0.92, margin: 0, maxWidth: '340px' }}>
              {brandCopy.desc}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="floating" style={{ backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: '16px', padding: '0.8rem', animation: 'float 5s ease-in-out infinite' }}>
              <IconHanger />
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: '16px', padding: '0.8rem', animation: 'float 6s ease-in-out infinite', animationDelay: '0.4s' }}>
              <IconShirt />
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: '16px', padding: '0.8rem', animation: 'float 5.5s ease-in-out infinite', animationDelay: '0.8s' }}>
              <IconDress />
            </div>
          </div>
        </div>

        {/* PANEL DE FORMULARIO */}
        <div style={{ padding: '3rem 3.2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

          {status === 'success' ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div className="check-circle" style={{
                width: '76px', height: '76px', borderRadius: '50%', backgroundColor: palette.sage,
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
              }}>
                <IconCheck />
              </div>
              <h2 className="display" style={{ fontSize: '1.6rem', fontWeight: '600', color: palette.ink, margin: '0 0 0.6rem 0' }}>
                {mode === 'login' ? '¡Bienvenido de nuevo!' : '¡Cuenta creada!'}
              </h2>
              <p style={{ color: palette.slate, fontSize: '0.95rem', margin: '0 0 2rem 0' }}>
                {mode === 'login'
                  ? 'Iniciaste sesión correctamente.'
                  : `Le enviamos un correo de confirmación a ${reg.email || 'tu correo'}.`}
              </p>
              <Link to="/" className="submit-btn" style={{
                display: 'inline-block', backgroundColor: palette.fucsia, color: '#ffffff', textDecoration: 'none',
                padding: '0.85rem 2rem', borderRadius: '30px', fontWeight: '700', fontSize: '0.92rem',
              }}>
                Ir a la tienda
              </Link>
            </div>
          ) : (
            <>
              {/* Selector deslizante Iniciar sesión / Crear cuenta */}
              <div style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                backgroundColor: palette.cream,
                borderRadius: '30px',
                padding: '0.3rem',
                marginBottom: '2.2rem',
              }}>
                <div style={{
                  position: 'absolute',
                  top: '0.3rem',
                  bottom: '0.3rem',
                  left: '0.3rem',
                  width: 'calc(50% - 0.3rem)',
                  backgroundColor: '#ffffff',
                  borderRadius: '24px',
                  boxShadow: '0 4px 10px rgba(43,24,48,0.08)',
                  transform: mode === 'register' ? 'translateX(100%)' : 'translateX(0)',
                  transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
                }} />
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="switch-btn"
                  style={{
                    position: 'relative', zIndex: 1, border: 'none', background: 'transparent',
                    padding: '0.75rem 0', fontWeight: '700', fontSize: '0.92rem', cursor: 'pointer',
                    color: mode === 'login' ? palette.fucsiaDark : palette.slate,
                  }}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="switch-btn"
                  style={{
                    position: 'relative', zIndex: 1, border: 'none', background: 'transparent',
                    padding: '0.75rem 0', fontWeight: '700', fontSize: '0.92rem', cursor: 'pointer',
                    color: mode === 'register' ? palette.fucsiaDark : palette.slate,
                  }}
                >
                  Crear cuenta
                </button>
              </div>

              {mode === 'login' ? (
                <form key="login" className="panel-in" onSubmit={handleLoginSubmit}>
                  <Field label="Correo electrónico" error={loginErrors.email}>
                    <TextInput
                      type="email"
                      placeholder="tu@correo.com"
                      value={login.email}
                      error={loginErrors.email}
                      onChange={(e) => setLogin({ ...login, email: e.target.value })}
                    />
                  </Field>

                  <Field label="Contraseña" error={loginErrors.password}>
                    <div style={{ position: 'relative' }}>
                      <TextInput
                        type={showLoginPw ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={login.password}
                        error={loginErrors.password}
                        onChange={(e) => setLogin({ ...login, password: e.target.value })}
                        style={{ paddingRight: '2.6rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPw(!showLoginPw)}
                        style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                      >
                        <IconEye open={showLoginPw} />
                      </button>
                    </div>
                  </Field>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.6rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: palette.slate, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={login.remember}
                        onChange={(e) => setLogin({ ...login, remember: e.target.checked })}
                        style={{ accentColor: palette.fucsia, width: '16px', height: '16px' }}
                      />
                      Recordarme
                    </label>
                    <a href="#" className="link-hover" style={{ fontSize: '0.85rem', color: palette.fucsiaDark, fontWeight: '600', textDecoration: 'none' }}>
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>

                  <SubmitButton loading={status === 'loading'} label="Iniciar sesión" />
                </form>
              ) : (
                <form key="register" className="panel-in" onSubmit={handleRegisterSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.1rem' }}>
                    <Field label="Primer Nombre" error={regErrors.primerNom}>
                      <TextInput
                        type="text"
                        placeholder="Tu primer nombre"
                        value={reg.primerNom}
                        error={regErrors.primerNom}
                        onChange={(e) => setReg({ ...reg, primerNom: e.target.value })}
                      />
                    </Field>

                    <Field label="Segundo Nombre" error={regErrors.segundNom}>
                      <TextInput
                        type="text"
                        placeholder="Opcional"
                        value={reg.segundNom}
                        error={regErrors.segundNom}
                        onChange={(e) => setReg({ ...reg, segundNom: e.target.value })}
                      />
                    </Field>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.1rem' }}>
                    <Field label="Primer Apellido" error={regErrors.primerApelli}>
                      <TextInput
                        type="text"
                        placeholder="Tu primer apellido"
                        value={reg.primerApelli}
                        error={regErrors.primerApelli}
                        onChange={(e) => setReg({ ...reg, primerApelli: e.target.value })}
                      />
                    </Field>

                    <Field label="Segundo Apellido" error={regErrors.segundApelli}>
                      <TextInput
                        type="text"
                        placeholder="Opcional"
                        value={reg.segundApelli}
                        error={regErrors.segundApelli}
                        onChange={(e) => setReg({ ...reg, segundApelli: e.target.value })}
                      />
                    </Field>
                  </div>

                  <Field label="Correo electrónico" error={regErrors.email}>
                    <TextInput
                      type="email"
                      placeholder="tu@correo.com"
                      value={reg.email}
                      error={regErrors.email}
                      onChange={(e) => setReg({ ...reg, email: e.target.value })}
                    />
                  </Field>

                  <Field label="Contraseña" error={regErrors.password}>
                    <div style={{ position: 'relative' }}>
                      <TextInput
                        type={showRegPw ? 'text' : 'password'}
                        placeholder="Mínimo 6 caracteres"
                        value={reg.password}
                        error={regErrors.password}
                        onChange={(e) => setReg({ ...reg, password: e.target.value })}
                        style={{ paddingRight: '2.6rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPw(!showRegPw)}
                        style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                      >
                        <IconEye open={showRegPw} />
                      </button>
                    </div>
                  </Field>

                  <Field label="Confirmar contraseña" error={regErrors.confirm}>
                    <TextInput
                      type={showRegPw ? 'text' : 'password'}
                      placeholder="Repite tu contraseña"
                      value={reg.confirm}
                      error={regErrors.confirm}
                      onChange={(e) => setReg({ ...reg, confirm: e.target.value })}
                    />
                  </Field>

                  <Field label="Foto de perfil" error={regErrors.imagenPerfil}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setReg({ ...reg, imagenPerfil: file });

                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setPreviewImagen(reader.result);
                          reader.readAsDataURL(file);
                        } else {
                          setPreviewImagen('');
                        }
                      }}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '0.8rem 0.9rem',
                        borderRadius: '14px',
                        border: `1.6px solid ${regErrors.imagenPerfil ? palette.error : palette.sand}`,
                        backgroundColor: palette.cream,
                        color: palette.ink,
                        fontSize: '0.9rem',
                      }}
                    />
                    {previewImagen && (
                      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <img
                          src={previewImagen}
                          alt="Previsualización de perfil"
                          style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${palette.fucsia}` }}
                        />
                        <span style={{ color: palette.slate, fontSize: '0.82rem' }}>Foto lista para subir</span>
                      </div>
                    )}
                  </Field>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1.6rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.85rem', color: palette.slate, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={reg.terms}
                        onChange={(e) => setReg({ ...reg, terms: e.target.checked })}
                        style={{ accentColor: palette.fucsia, width: '16px', height: '16px' }}
                      />
                      Acepto los términos
                    </label>
                    {regErrors.terms && (
                      <div style={{ color: palette.error, fontSize: '0.78rem', fontWeight: '500' }}>
                        {regErrors.terms}
                      </div>
                    )}
                  </div>

                  <SubmitButton loading={status === 'loading'} label="Crear cuenta" />
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SubmitButton({ loading, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="submit-btn"
      style={{
        width: '100%',
        backgroundColor: palette.fucsia,
        color: '#ffffff',
        border: 'none',
        borderRadius: '30px',
        padding: '0.9rem',
        fontWeight: '700',
        fontSize: '0.95rem',
        cursor: loading ? 'default' : 'pointer',
        opacity: loading ? 0.85 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.6rem',
      }}
    >
      {loading && (
        <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.35)" strokeWidth="3" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {loading ? 'Un momento...' : label}
    </button>
  );
}
