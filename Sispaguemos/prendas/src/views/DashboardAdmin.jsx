// pages/DashboardAdmin.jsx
import { Link } from 'react-router-dom';
import '../styles/Admin.css';

function DashboardAdmin() {
  // Datos de ejemplo para el dashboard
  const totalProductos = 10;
  const productosActivos = 10;
  const totalUsuarios = 17;
  const ventasTotales = 8293500;

  const prendasMasVendidas = [
    { nombre: 'Jeans Regular Fit', ventas: 45 },
    { nombre: 'Chaqueta de Cuero', ventas: 32 },
    { nombre: 'Top Crop Acanulado', ventas: 28 },
    { nombre: 'Jogger Comfort', ventas: 24 },
    { nombre: 'Gorra Utens', ventas: 19 },
    { nombre: 'Camisa Oxford', ventas: 15 },
  ];

  const ventasDiarias = [
    { dia: 'Lun', monto: 1200000 },
    { dia: 'Mar', monto: 1800000 },
    { dia: 'Mié', monto: 1500000 },
    { dia: 'Jue', monto: 2200000 },
    { dia: 'Vie', monto: 2800000 },
    { dia: 'Sáb', monto: 2000000 },
    { dia: 'Dom', monto: 900000 },
  ];

  const maxVenta = Math.max(...ventasDiarias.map(v => v.monto));

  return (
    <div className="dashboard-content">
      {/* PANEL / DASHBOARD HEADER */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h3>PANEL</h3>
          <h1>Dashboard</h1>
          <p>Controla tus productos, ventas y movimientos desde un panel limpio en rosado.</p>
        </div>
      </div>

      {/* MÉTRICAS */}
      <div className="dashboard-metrics">
        <div className="metric-card-primary">
          <div className="metric-icon">📦</div>
          <div className="metric-info">
            <small>TOTAL PRODUCTOS</small>
            <h2>{totalProductos}</h2>
          </div>
        </div>
        <div className="metric-card-primary">
          <div className="metric-icon">✅</div>
          <div className="metric-info">
            <small>PRODUCTOS ACTIVOS</small>
            <h2>{productosActivos}</h2>
          </div>
        </div>
        <div className="metric-card-primary">
          <div className="metric-icon">👥</div>
          <div className="metric-info">
            <small>TOTAL USUARIOS</small>
            <h2>{totalUsuarios}</h2>
          </div>
        </div>
        <div className="metric-card-primary highlight">
          <div className="metric-icon">💰</div>
          <div className="metric-info">
            <small>VENTAS TOTALES</small>
            <h2>${ventasTotales.toLocaleString()}</h2>
          </div>
        </div>
      </div>

      {/* CONTENIDO DE DOS COLUMNAS */}
      <div className="dashboard-two-col">
        {/* PRENDAS MÁS VENDIDAS */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>🏆 PRENDAS MÁS VENDIDAS</h3>
            <span className="card-subtitle">Top productos vendidos en 2028</span>
          </div>
          <div className="top-products-list">
            {prendasMasVendidas.map((producto, index) => (
              <div key={index} className="product-row">
                <span className="product-rank">{index + 1}</span>
                <span className="product-name">{producto.nombre}</span>
                <span className="product-sales">{producto.ventas} ventas</span>
                <div className="product-bar-bg">
                  <div 
                    className="product-bar-fill" 
                    style={{ width: `${(producto.ventas / prendasMasVendidas[0].ventas) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* VENTAS DIARIAS */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>📊 VENTAS DIARIAS</h3>
            <span className="card-subtitle">Movimiento de ventas a lo largo de junio 2026</span>
          </div>
          <div className="daily-sales-chart">
            {ventasDiarias.map((venta, index) => {
              const altura = (venta.monto / maxVenta) * 100;
              return (
                <div key={index} className="bar-wrapper">
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{ height: `${altura}%` }}
                    >
                      <span className="bar-value">${(venta.monto / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                  <span className="bar-label">{venta.dia}</span>
                </div>
              );
            })}
          </div>
          <div className="chart-total">
            <span>Total semana: ${ventasDiarias.reduce((sum, v) => sum + v.monto, 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* RESUMEN RÁPIDO */}
      <div className="dashboard-quick-stats">
        <div className="quick-stat">
          <span className="stat-label">Personal del sistema</span>
          <span className="stat-number">{totalUsuarios}</span>
        </div>
        <div className="quick-stat">
          <span className="stat-label">Prendas activas</span>
          <span className="stat-number">{productosActivos}</span>
        </div>
        <div className="quick-stat">
          <span className="stat-label">Ventas del mes</span>
          <span className="stat-number">${ventasTotales.toLocaleString()}</span>
        </div>
        <Link to="/prendas" className="quick-stat-link">
          <span>📦 Gestionar Inventario</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}

export default DashboardAdmin;