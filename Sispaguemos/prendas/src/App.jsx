import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import DashboardAdmin from './views/DashboardAdmin';
import InventarioPrendas from './views/Prendas';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      {/* Opcional: Una barra de navegación superior (Navbar) que se verá en todas las páginas */}
      <nav style={{ background: '#333', padding: '15px', color: 'white', display: 'flex', gap: '20px' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
          Inicio / Dashboard
        </Link>
        <Link to="/prendas" style={{ color: 'white', textDecoration: 'none' }}>
          Inventario
        </Link>
      </nav>

      {/* Aquí es donde cambian las pantallas según la URL */}
      <Routes>
        <Route path="/" element={<DashboardAdmin />} />
        <Route path="/prendas" element={<InventarioPrendas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;