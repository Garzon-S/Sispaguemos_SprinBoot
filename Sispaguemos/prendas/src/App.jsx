// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Inicio from './views/Inicio';
import IniciosesionRegistro from './views/IniciosesionRegistro';
import DashboardAdmin from './views/DashboardAdmin';
import MovimientosInventario from './views/MovimientosInventarios';
import Prendas from './views/Prendas';
import Bodega from './views/Bodega';
import Usuarios from './views/Usuarios';
import PerfilUsuario from './views/PerfilUsuario';
import CatalogoCliente from './views/CatalogoCliente';

const normalizeRole = (value) => String(value ?? '').trim().toLowerCase();

const isAdminOrEmployee = () => {
  try {
    const raw = localStorage.getItem('usuarioActual');
    if (!raw) return false;
    const usuario = JSON.parse(raw);
    const rol = normalizeRole(usuario?.rol);
    return rol === 'administrador' || rol === 'empleado';
  } catch {
    return false;
  }
};

function ProtectedAdminLayout() {
  const location = useLocation();

  if (!isAdminOrEmployee()) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <Layout />;
}

// Componente temporal para Ventas
function Ventas() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>Módulo de Ventas</h2>
      <p>Gestión de ventas y pedidos</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/iniciosesionregistro" element={<IniciosesionRegistro />} />
        <Route path="/perfil" element={<PerfilUsuario />} />
        <Route path="/catalogo" element={<CatalogoCliente />} />

        <Route element={<ProtectedAdminLayout />}>
          <Route path="/dashboard" element={<DashboardAdmin />} />
          <Route path="/bodega" element={<Bodega />} />
          <Route path="/prendas" element={<Prendas />} />
          <Route path="/movimientos" element={<MovimientosInventario />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/usuarios" element={<Usuarios />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;