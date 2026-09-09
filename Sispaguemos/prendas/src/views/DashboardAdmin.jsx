// pages/DashboardAdmin.jsx
import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Admin.css';

function DashboardAdmin() {
  const [pedidos, setPedidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [prendas, setPrendas] = useState([]);
  const [ventasRealizadas, setVentasRealizadas] = useState([]);

  // Carga de datos real desde el backend
  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:8080/api/pedidos').catch(() => ({ data: [] })),
      axios.get('http://localhost:8080/api/usuarios').catch(() => ({ data: [] })),
      axios.get('http://localhost:8080/api/prendas').catch(() => ({ data: [] })),
      axios.get('http://localhost:8080/api/consultas/ventas').catch(() => ({ data: [] }))
    ])
      .then(([pedidosRes, usuariosRes, prendasRes, ventasRes]) => {
        setPedidos(Array.isArray(pedidosRes.data) ? pedidosRes.data : []);
        setUsuarios(Array.isArray(usuariosRes.data) ? usuariosRes.data : []);
        setPrendas(Array.isArray(prendasRes.data) ? prendasRes.data : []);
        setVentasRealizadas(Array.isArray(ventasRes.data) ? ventasRes.data : []);
      })
      .catch((err) => console.error('Error cargando dashboard', err));
  }, []);

  const formatearMoneda = (monto) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(monto || 0));

  // --- CÁLCULOS DINÁMICOS ---
  const totalProductos = prendas.length;
  const productosActivos = prendas.filter(p => String(p.estado || '').toLowerCase() === 'activo' || p.estado === true).length || prendas.length;
  const totalUsuarios = usuarios.length;

  const ventasTotales = ventasRealizadas.reduce((acc, v) => acc + Number(v.totalVenta || 0), 0) ||
    pedidos.filter(p => p.estado === 'Vendido' || p.estado === 'Completado').reduce((acc, p) => acc + Number(p.totalEstimado || 0), 0);

  const conteoPrendas = {};
  pedidos.concat(ventasRealizadas).forEach(item => {
    const detalles = item.detalles || [];
    detalles.forEach(det => {
      const nombre = det.nombrePrenda || 'Prenda sin nombre';
      const cant = Number(det.cantidad || 1);
      conteoPrendas[nombre] = (conteoPrendas[nombre] || 0) + cant;
    });
  });

  const listaPrendasRanking = Object.keys(conteoPrendas).map(nombre => ({
    nombre,
    ventas: conteoPrendas[nombre]
  })).sort((a, b) => b.ventas - a.ventas);

  const prendasMasVendidas = listaPrendasRanking.slice(0, 5);
  const prendasMenosVendidas = [...listaPrendasRanking].reverse().slice(0, 5);
  const maxVentaTop = prendasMasVendidas.length > 0 ? prendasMasVendidas[0].ventas : 1;

  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const acumuladoDias = { 'Lun': 0, 'Mar': 0, 'Mié': 0, 'Jue': 0, 'Vie': 0, 'Sáb': 0, 'Dom': 0 };

  pedidos.concat(ventasRealizadas).forEach(item => {
    const fechaStr = item.fechaPedido || item.fechaVenta;
    if (fechaStr) {
      const d = new Date(fechaStr);
      if (!Number.isNaN(d.getTime())) {
        const diaIndex = d.getDay();
        const mapDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const nombreDia = mapDias[diaIndex];
        const monto = Number(item.totalEstimado || item.totalVenta || 0);
        if (acumuladoDias[nombreDia] !== undefined) {
          acumuladoDias[nombreDia] += monto;
        }
      }
    }
  });

  const ventasDiarias = diasSemana.map(dia => ({ dia, monto: acumuladoDias[dia] }));
  const maxVentaMonto = Math.max(...ventasDiarias.map(v => v.monto), 1);

  return (
    <div className="dashboard-content">
      {/* PANEL / DASHBOARD HEADER */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h3>PANEL</h3>
          <h1>Dashboard Dinámico</h1>
          <p>Métricas en tiempo real basadas en tu base de datos MySQL.</p>
        </div>
      </div>

      {/* MÉTRICAS */}
      <div className="dashboard-metrics">
        <div className="metric-card-primary">
          <div className="metric-info">
            <small>TOTAL PRODUCTOS</small>
            <h2>{totalProductos}</h2>
          </div>
        </div>
        <div className="metric-card-primary">
          <div className="metric-info">
            <small>PRODUCTOS ACTIVOS</small>
            <h2>{productosActivos}</h2>
          </div>
        </div>
        <div className="metric-card-primary">
          <div className="metric-info">
            <small>TOTAL USUARIOS</small>
            <h2>{totalUsuarios}</h2>
          </div>
        </div>
        <div className="metric-card-primary highlight">
          <div className="metric-info">
            <small>VENTAS TOTALES</small>
            <h2>{formatearMoneda(ventasTotales)}</h2>
          </div>
        </div>
      </div>

      {/* CONTENIDO DE DOS COLUMNAS: MÁS VENDIDAS Y MENOS VENDIDAS */}
      <div className="dashboard-two-col">
        {/* PRENDAS MÁS VENDIDAS */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>PRENDAS MÁS VENDIDAS</h3>
            <span className="card-subtitle">Top productos con mayor salida</span>
          </div>
          <div className="top-products-list">
            {prendasMasVendidas.length === 0 ? (
              <p style={{ padding: '1rem', color: '#666' }}>Aún no hay registros de ventas para calcular el ranking.</p>
            ) : (
              prendasMasVendidas.map((producto, index) => (
                <div key={index} className="product-row">
                  <span className="product-rank">{index + 1}</span>
                  <span className="product-name">{producto.nombre}</span>
                  <span className="product-sales">{producto.ventas} ventas</span>
                  <div className="product-bar-bg">
                    <div
                      className="product-bar-fill"
                      style={{ width: `${(producto.ventas / maxVentaTop) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PRENDAS MENOS VENDIDAS */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>PRENDAS MENOS VENDIDAS</h3>
            <span className="card-subtitle">Productos con menor rotación</span>
          </div>
          <div className="top-products-list">
            {prendasMenosVendidas.length === 0 ? (
              <p style={{ padding: '1rem', color: '#666' }}>Aún no hay suficientes datos.</p>
            ) : (
              prendasMenosVendidas.map((producto, index) => (
                <div key={index} className="product-row">
                  <span className="product-rank" style={{ background: '#e0ad35' }}>{index + 1}</span>
                  <span className="product-name">{producto.nombre}</span>
                  <span className="product-sales">{producto.ventas} ventas</span>
                  <div className="product-bar-bg">
                    <div
                      className="product-bar-fill"
                      style={{ width: `${(producto.ventas / maxVentaTop) * 100}%`, backgroundColor: '#e0ad35' }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* VENTAS DIARIAS */}
      <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h3>VENTAS DIARIAS DE LA SEMANA</h3>
          <span className="card-subtitle">Movimiento de ingresos registrado</span>
        </div>
        <div className="daily-sales-chart">
          {ventasDiarias.map((venta, index) => {
            const altura = (venta.monto / maxVentaMonto) * 100;
            return (
              <div key={index} className="bar-wrapper">
                <div className="bar-container">
                  <div
                    className="bar-fill"
                    style={{ height: `${Math.max(altura, 5)}%` }}
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
          <span>Total acumulado semanal: {formatearMoneda(ventasDiarias.reduce((sum, v) => sum + v.monto, 0))}</span>
        </div>
      </div>

      {/* RESUMEN RÁPIDO */}
      <div className="dashboard-quick-stats" style={{ marginTop: '1.5rem' }}>
        <div className="quick-stat">
          <span className="stat-label">Personal del sistema</span>
          <span className="stat-number">{totalUsuarios}</span>
        </div>
        <div className="quick-stat">
          <span className="stat-label">Prendas activas</span>
          <span className="stat-number">{productosActivos}</span>
        </div>
        <div className="quick-stat">
          <span className="stat-label">Ventas totales registradas</span>
          <span className="stat-number">{formatearMoneda(ventasTotales)}</span>
        </div>
        <Link to="/prendas" className="quick-stat-link">
          <span>Gestionar Inventario</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}

export default DashboardAdmin;