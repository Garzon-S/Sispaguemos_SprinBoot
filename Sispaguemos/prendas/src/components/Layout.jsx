// src/components/Layout.jsx
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import '../styles/Layout.css';

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const usuarioActual = (() => {
    try {
      const raw = localStorage.getItem('usuarioActual');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const rol = String(usuarioActual?.rol ?? 'usuario').trim().toLowerCase();
  const nombreCompleto = [
    usuarioActual?.primerNom,
    usuarioActual?.segundNom,
    usuarioActual?.primerApelli,
    usuarioActual?.segundApelli,
  ].filter(Boolean).join(' ');

  const tituloRol = rol === 'administrador'
    ? 'ADMINISTRADOR'
    : rol === 'empleado'
      ? 'EMPLEADO'
      : 'CLIENTE';

  const textoEstado = rol === 'administrador'
    ? 'Administrador activo'
    : rol === 'empleado'
      ? 'Empleado activo'
      : 'Cliente activo';

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const cerrarSesion = () => {
    localStorage.removeItem('usuarioActual');
    navigate('/');
  };

  return (
    <div className="layout-admin">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-badge">PM</span>
          <h2>PAGUE <br/><strong>MENOS</strong></h2>
        </div>

        <div className="sidebar-user">
          <small>{tituloRol}</small>
          <h3>{nombreCompleto || 'Usuario'}</h3>
          <span className="user-status">{textoEstado}</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
            Resumen (Dashboard)
          </Link>
          <Link to="/bodega" className={`nav-item ${isActive('/bodega') ? 'active' : ''}`}>
            Bodega
          </Link>
          <Link to="/movimientos" className={`nav-item ${isActive('/movimientos') ? 'active' : ''}`}>
            Control de Entradas y Salidas
          </Link>
          <Link to="/prendas" className={`nav-item ${isActive('/prendas') ? 'active' : ''}`}>
            Catálogo
          </Link>
          <Link to="/ventas" className={`nav-item ${isActive('/ventas') ? 'active' : ''}`}>
            Ventas
          </Link>
          <Link to="/usuarios" className={`nav-item ${isActive('/usuarios') ? 'active' : ''}`}>
            Usuarios
          </Link>
        </nav>

        <div className="sidebar-footer">
          <small>ATENCIÓN</small>
          <p>Mantén actualizado el inventario para evitar rupturas de stock.</p>
          <button className="btn-logout" onClick={cerrarSesion}>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="top-banner">
          <span>{`🟢 Bienvenido ${tituloRol === 'ADMINISTRADOR' ? 'Administrador' : tituloRol === 'EMPLEADO' ? 'Empleado' : 'Cliente'}`}</span>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;