import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Inicio from './views/Inicio';
import DashboardAdmin from './views/DashboardAdmin';
import InventarioPrendas from './views/Prendas';
import UsuariosPage from './views/Usuarios';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      {/* Ya no hay barra negra <nav> aquí, por lo que la interfaz lucirá exactamente como el diseño */}
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/prendas" element={<InventarioPrendas />} />
        <Route path="/usuarios" element={<UsuariosPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;