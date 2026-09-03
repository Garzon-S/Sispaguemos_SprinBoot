// src/components/Layout.jsx
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import '../styles/Layout.css';

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Obtenemos el usuario guardado para verificar su rol exacto
  const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
  const rol = String(usuarioGuardado?.rol || usuarioGuardado?.tipoRol || 'empleado').trim().toLowerCase();
  const esAdmin = rol === 'administrador' || rol === 'admin';

  const nombreCompleto = `${usuarioGuardado.primerNom || usuarioGuardado.primer_nom || 'Usuario'} ${usuarioGuardado.primerApelli || usuarioGuardado.primer_apelli || ''}`.trim();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    localStorage.removeItem('usuarioActual');
    navigate('/'); // Te devuelve a la pantalla de Inicio / Auth
  };

  return (
    <div className="layout-admin">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-badge">PM</span>
          <h2>PAGUE <br/><strong>MENOS</strong></h2>
        </div>

        <div className="sidebar-user">
          <small>{esAdmin ? 'ADMINISTRADOR' : 'EMPLEADO'}</small>
          <h3>{nombreCompleto}</h3>
          <span className="user-status">{esAdmin ? 'Administrador activo' : 'Empleado activo'}</span>
        </div>

        <nav className="sidebar-nav">
          {/* Dashboard Resumen exclusivo para Admin */}
          {esAdmin && (
            <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
              Resumen (Dashboard)
            </Link>
          )}

          {/* MÓDULO DE VENTAS: Exclusivo para Empleados (Oculto para Administrador) */}
          {!esAdmin && (
            <Link to="/ventas" className={`nav-item ${isActive('/ventas') ? 'active' : ''}`}>
              Ventas
            </Link>
          )}

          {esAdmin && (
            <Link to="/pedidos" className={`nav-item ${isActive('/pedidos') ? 'active' : ''}`}>
              Pedidos
            </Link>
          )}

          {/* Entradas y Salidas (Visible para ambos o condicional si gustas) */}
          <Link to="/movimientos" className={`nav-item ${isActive('/movimientos') ? 'active' : ''}`}>
            Entradas y Salidas
          </Link>

          {/* Módulos compartidos: Bodega y Catálogo */}
          <Link to="/bodega" className={`nav-item ${isActive('/bodega') ? 'active' : ''}`}>
            Bodega
          </Link>

          <Link to="/prendas" className={`nav-item ${isActive('/prendas') ? 'active' : ''}`}>
            Catálogo
          </Link>

          {/* Módulos exclusivos y avanzados de Administrador */}
          {esAdmin && (
            <>
              <Link to="/usuarios" className={`nav-item ${isActive('/usuarios') ? 'active' : ''}`}>
                Usuarios
              </Link>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <small>ATENCIÓN</small>
          <p>Mantén actualizado el inventario para evitar rupturas de stock.</p>
          <button className="btn-logout" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="top-banner">
          <span> Bienvenido {esAdmin ? 'Administrador' : 'Empleado'}</span>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;