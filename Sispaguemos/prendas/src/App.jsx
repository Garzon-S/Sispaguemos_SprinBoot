// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Inicio from './views/Inicio'; // <--- Tu pantalla de inicio independiente
import DashboardAdmin from './views/DashboardAdmin';
import MovimientosInventario from './views/MovimientosInventarios'; 
import Prendas from './views/Prendas';
import Bodega from './views/Bodega';
import Usuarios from './views/Usuarios';

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
        {/* 1. RUTA PRINCIPAL SIN LAYOUT (Pantalla limpia de Inicio) */}
        <Route path="/" element={<Inicio />} />

        {/* 2. RUTAS DE ADMINISTRACIÓN CON EL LAYOUT (Menú lateral y barra superior) */}
        <Route element={<Layout />}>
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