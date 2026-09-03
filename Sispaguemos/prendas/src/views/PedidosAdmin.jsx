import { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Admin.css';

const ESTADOS = ['Pendiente', 'Listo en tienda', 'Cancelado'];

const estiloEstado = (estado) => {
  if (estado === 'Listo en tienda') return { backgroundColor: '#e4f3e5', borderColor: '#70ad75', color: '#27602c' };
  if (estado === 'Cancelado') return { backgroundColor: '#fcebea', borderColor: '#d16b5d', color: '#8d2d22' };
  return { backgroundColor: '#fff1c9', borderColor: '#e0ad35', color: '#805b0b' };
};

function formatearMoneda(monto) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(monto || 0));
}

function formatearFecha(fecha) {
  const fechaPedido = new Date(fecha);
  return Number.isNaN(fechaPedido.getTime()) ? fecha : fechaPedido.toLocaleString('es-CO');
}

export default function PedidosAdmin() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [actualizando, setActualizando] = useState(null);
  const [pedidoExpandido, setPedidoExpandido] = useState(null);

  const cargarPedidos = () => {
    setCargando(true);
    setError('');
    Promise.all([
      axios.get('http://localhost:8080/api/pedidos'),
      axios.get('http://localhost:8080/api/usuarios'),
    ])
      .then(([pedidosResponse, usuariosResponse]) => {
        setPedidos(Array.isArray(pedidosResponse.data) ? pedidosResponse.data : []);
        setUsuarios(Array.isArray(usuariosResponse.data) ? usuariosResponse.data : []);
      })
      .catch((requestError) => {
        console.error('Error cargando pedidos:', requestError);
        setError('No se pudieron cargar los pedidos. Verifica que el backend y MySQL estén ejecutándose.');
      })
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const nombreCliente = (idUsuario) => {
    const usuario = usuarios.find((item) => (item.id || item.idUsuario || item.id_usuario) === idUsuario);
    if (!usuario) return `Usuario #${idUsuario}`;
    return `${usuario.primerNom || ''} ${usuario.primerApelli || ''}`.trim() || usuario.correo;
  };

  const cambiarEstado = async (idPedido, estado) => {
    setActualizando(idPedido);
    try {
      const { data } = await axios.put(`http://localhost:8080/api/pedidos/${idPedido}/estado`, { estado });
      setPedidos((anteriores) => anteriores.map((pedido) => pedido.idPedido === idPedido ? data : pedido));
    } catch (requestError) {
      console.error('Error actualizando pedido:', requestError);
      setError('No se pudo actualizar el estado del pedido.');
    } finally {
      setActualizando(null);
    }
  };

  return (
    <div className="dashboard-content orders-page">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h3>GESTIÓN DE PEDIDOS</h3>
          <h1>Pedidos</h1>
          <p>Consulta los pedidos realizados por cada usuario cliente y actualiza su estado.</p>
        </div>
      </div>

      <section className="dashboard-card orders-card orders-page-card">
        <div className="card-header orders-header">
          <div>
            <h3>📋 PEDIDOS DE CLIENTES</h3>
            <span className="card-subtitle">Cada pedido comienza con estado Pendiente</span>
          </div>
          <strong>{pedidos.length} pedido{pedidos.length === 1 ? '' : 's'}</strong>
        </div>

        {cargando && <p className="orders-message">Cargando pedidos...</p>}
        {!cargando && error && (
          <div className="orders-message orders-error">
            <p>{error}</p>
            <button type="button" className="orders-retry-button" onClick={cargarPedidos}>Reintentar</button>
          </div>
        )}
        {!cargando && !error && pedidos.length === 0 && <p className="orders-message">Todavía no hay pedidos registrados.</p>}
        {!cargando && !error && pedidos.length > 0 && (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr><th>Pedido</th><th>Usuario cliente</th><th>Correo</th><th>Prendas</th><th>Monto</th><th>Fecha y hora</th><th>Método de pago</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  <Fragment key={pedido.idPedido}>
                  <tr>
                    <td>#{pedido.idPedido}</td>
                    <td>{nombreCliente(pedido.fkIdUsuarioCliente)}</td>
                    <td>{pedido.correoCliente || 'No registrado'}</td>
                    <td>
                      <button type="button" className="order-detail-button" onClick={() => setPedidoExpandido(pedidoExpandido === pedido.idPedido ? null : pedido.idPedido)}>
                        {pedido.cantidadPrendas || 0} artículo{pedido.cantidadPrendas === 1 ? '' : 's'}
                      </button>
                    </td>
                    <td className="order-amount">{formatearMoneda(pedido.totalEstimado)}</td>
                    <td>{formatearFecha(pedido.fechaPedido)}</td>
                    <td>PayPal Sandbox</td>
                    <td>
                      <select
                        className={`order-status order-status-${String(pedido.estado || 'Pendiente').toLowerCase().replaceAll(' ', '-')}`}
                        value={pedido.estado || 'Pendiente'}
                        disabled={actualizando === pedido.idPedido}
                        onChange={(event) => cambiarEstado(pedido.idPedido, event.target.value)}
                        aria-label={`Estado del pedido ${pedido.idPedido}`}
                        style={estiloEstado(pedido.estado || 'Pendiente')}
                      >
                        {ESTADOS.map((estado) => (
                          <option
                            key={estado}
                            className={`order-option-${estado === 'Pendiente' ? 'pendiente' : estado === 'Cancelado' ? 'cancelado' : 'listo'}`}
                          >
                            {estado}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {pedidoExpandido === pedido.idPedido && (
                    <tr className="order-details-row">
                      <td colSpan="8">
                        <strong>Detalle de prendas</strong>
                        <div className="order-details-list">
                          {(pedido.detalles || []).map((detalle) => (
                            <span key={detalle.idDetalle}>
                              {detalle.cantidad}x {detalle.nombrePrenda} ({detalle.fkIdPrenda}) · {formatearMoneda(detalle.subtotal)}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
