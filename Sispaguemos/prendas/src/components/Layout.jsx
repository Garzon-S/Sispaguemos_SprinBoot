// src/components/Layout.jsx
import { Link, useLocation, Outlet } from 'react-router-dom';
import '../styles/Layout.css';

function Layout() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="layout-admin">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-badge">PM</span>
          <h2>PAGUE <br/><strong>MENOS</strong></h2>
        </div>

        <div className="sidebar-user">
          <small>ADMINISTRADOR</small>
          <h3>Sergio Garzon</h3>
          <span className="user-status">Administrador activo</span>
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
          <button className="btn-logout" onClick={() => alert('Cerrando sesión...')}>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="top-banner">
          <span>🟢 Bienvenido Administrador</span>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;