// pages/DashboardAdmin.jsx
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Admin.css';

const estiloEstado = (estado) => {
  if (estado === 'Listo en tienda') return { backgroundColor: '#e4f3e5', borderColor: '#70ad75', color: '#27602c' };
  if (estado === 'Cancelado') return { backgroundColor: '#fcebea', borderColor: '#d16b5d', color: '#8d2d22' };
  return { backgroundColor: '#fff1c9', borderColor: '#e0ad35', color: '#805b0b' };
};

function DashboardAdmin() {
  const [pedidos, setPedidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(true);
  const [errorPedidos, setErrorPedidos] = useState('');
  const [actualizandoPedido, setActualizandoPedido] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:8080/api/pedidos'),
      axios.get('http://localhost:8080/api/usuarios'),
    ])
      .then(([pedidosResponse, usuariosResponse]) => {
        setPedidos(Array.isArray(pedidosResponse.data) ? pedidosResponse.data : []);
        setUsuarios(Array.isArray(usuariosResponse.data) ? usuariosResponse.data : []);
      })
      .catch(() => setErrorPedidos('No se pudieron cargar los pedidos.'))
      .finally(() => setCargandoPedidos(false));
  }, []);

  useEffect(() => {
    if (window.location.hash === '#pedidos') {
      document.getElementById('pedidos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const actualizarEstadoPedido = async (idPedido, estado) => {
    setActualizandoPedido(idPedido);
    try {
      const response = await axios.put(`http://localhost:8080/api/pedidos/${idPedido}/estado`, { estado });
      setPedidos((anteriores) => anteriores.map((pedido) => pedido.idPedido === idPedido ? response.data : pedido));
    } catch {
      setErrorPedidos('No se pudo actualizar el estado del pedido.');
    } finally {
      setActualizandoPedido(null);
    }
  };

  const obtenerNombreCliente = (idUsuario) => {
    const usuario = usuarios.find((item) => (item.idUsuario || item.id_usuario || item.id) === idUsuario);
    if (!usuario) return `Usuario #${idUsuario}`;
    return `${usuario.primerNom || usuario.primer_nom || ''} ${usuario.primerApelli || usuario.primer_apelli || ''}`.trim() || usuario.correo;
  };

  const formatearFecha = (fecha) => {
    const fechaPedido = new Date(fecha);
    return Number.isNaN(fechaPedido.getTime()) ? fecha : fechaPedido.toLocaleString('es-CO');
  };

  const formatearMoneda = (monto) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(monto || 0));
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

      <section id="pedidos" className="dashboard-card orders-card">
        <div className="card-header orders-header">
          <div>
            <h3>📋 PEDIDOS</h3>
            <span className="card-subtitle">Compras realizadas desde el catálogo cliente</span>
          </div>
          <strong>{pedidos.length} pedido{pedidos.length === 1 ? '' : 's'}</strong>
        </div>

        {cargandoPedidos && <p className="orders-message">Cargando pedidos...</p>}
        {!cargandoPedidos && errorPedidos && <p className="orders-message orders-error">{errorPedidos}</p>}
        {!cargandoPedidos && !errorPedidos && pedidos.length === 0 && <p className="orders-message">Todavía no hay pedidos registrados.</p>}
        {!cargandoPedidos && !errorPedidos && pedidos.length > 0 && (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Monto</th>
                  <th>Fecha y hora</th>
                  <th>Método de pago</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.idPedido}>
                    <td>#{pedido.idPedido}</td>
                    <td>{obtenerNombreCliente(pedido.fkIdUsuarioCliente)}</td>
                    <td className="order-amount">{formatearMoneda(pedido.totalEstimado)}</td>
                    <td>{formatearFecha(pedido.fechaPedido)}</td>
                    <td>{pedido.metodoPago || 'PayPal Sandbox'}</td>
                    <td>
                      <select
                        value={pedido.estado || 'Pendiente'}
                        disabled={actualizandoPedido === pedido.idPedido}
                        onChange={(event) => actualizarEstadoPedido(pedido.idPedido, event.target.value)}
                        className={`order-status order-status-${String(pedido.estado || 'Pendiente').toLowerCase().replaceAll(' ', '-')}`}
                        style={estiloEstado(pedido.estado || 'Pendiente')}
                        aria-label={`Estado del pedido ${pedido.idPedido}`}
                      >
                        <option className="order-option-pendiente">Pendiente</option>
                        <option className="order-option-listo">Listo en tienda</option>
                        <option className="order-option-cancelado">Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

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