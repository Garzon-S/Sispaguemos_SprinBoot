import { Link } from 'react-router-dom';
import '../App.css'; // O la ruta donde tengas tus estilos

function DashboardAdmin() {
  return (
    <div className="app-container">
      <div className="form-card text-center">
        <h2>Panel de Administración - Pague Menos</h2>
        <p>Bienvenido al sistema de gestión.</p>
        
        <div style={{ marginTop: '20px' }}>
          {/* Botón para ir al inventario usando React Router */}
          <Link to="/prendas" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 20px' }}>
            Ir a Gestión de Inventario
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;