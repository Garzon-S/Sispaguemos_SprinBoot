import React, { useEffect, useState, Fragment } from 'react';
import axios from 'axios';

export default function ConsultaVentas() {
    const [ventas, setVentas] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [ventaExpandida, setVentaExpandida] = useState(null);

    useEffect(() => {
        cargarVentas();
    }, []);

    const cargarVentas = () => {
        axios.get('http://localhost:8080/api/consultas/ventas')
            .then(res => setVentas(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error("Error al cargar ventas", err));
    };

    const ventasFiltradas = ventas.filter(v => {
        const coincideBusqueda = String(v.idVenta).includes(busqueda) ||
            String(v.metodoPago || '').toLowerCase().includes(busqueda.toLowerCase());
        return coincideBusqueda;
    });

    const formatearMoneda = (monto) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(monto || 0));
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif', backgroundColor: '#fdf6f1', minHeight: '100vh', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ color: '#2b1830', margin: 0, fontFamily: 'Fraunces, Georgia, serif' }}>Consulta de Ventas (Realizadas)</h2>
            </div>

            <input
                type="text"
                placeholder="Buscar por ID de venta o método de pago..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    marginBottom: '1.5rem',
                    borderRadius: '14px',
                    border: '1.6px solid #f3e7dd',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontSize: '0.95rem'
                }}
            />

            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(43,24,48,0.06)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #f3e7dd', color: '#5b4a56' }}>
                            <th style={{ padding: '12px' }}>ID Venta</th>
                            <th style={{ padding: '12px' }}>Fecha</th>
                            <th style={{ padding: '12px' }}>Método de Pago</th>
                            <th style={{ padding: '12px' }}>Prendas / Artículos</th>
                            <th style={{ padding: '12px' }}>Total Venta</th>
                            <th style={{ padding: '12px' }}>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ventasFiltradas.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#5b4a56' }}>
                                    No hay ventas registradas.
                                </td>
                            </tr>
                        ) : (
                            ventasFiltradas.map(v => (
                                <Fragment key={v.idVenta}>
                                    <tr style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px', fontWeight: '600', color: '#231421' }}>#{v.idVenta}</td>
                                        <td style={{ padding: '12px', color: '#5b4a56' }}>
                                            {v.fechaVenta ? new Date(v.fechaVenta).toLocaleString() : 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px', color: '#5b4a56' }}>{v.metodoPago || 'Efectivo'}</td>
                                        <td style={{ padding: '12px' }}>
                                            <button
                                                type="button"
                                                onClick={() => setVentaExpandida(ventaExpandida === v.idVenta ? null : v.idVenta)}
                                                style={{
                                                    background: '#f3e7dd',
                                                    border: 'none',
                                                    padding: '6px 10px',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    color: '#2b1830'
                                                }}
                                            >
                                                {v.cantidadPrendas || v.detalles?.length || 1} artículo(s) ▾
                                            </button>
                                        </td>
                                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#198754' }}>
                                            {formatearMoneda(v.totalVenta)}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                backgroundColor: '#d1e7dd',
                                                color: '#0f5132',
                                                fontWeight: '600',
                                                display: 'inline-block'
                                            }}>
                                                Vendido
                                            </span>
                                        </td>
                                    </tr>

                                    {/* Fila desplegable con el detalle exacto de las prendas */}
                                    {ventaExpandida === v.idVenta && (
                                        <tr style={{ backgroundColor: '#fdfbfa', borderBottom: '1px solid #eee' }}>
                                            <td colSpan="6" style={{ padding: '1rem 1.5rem' }}>
                                                <strong style={{ color: '#2b1830' }}>Detalle de prendas de la venta #{v.idVenta}:</strong>
                                                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    {v.detalles && v.detalles.length > 0 ? (
                                                        v.detalles.map((detalle, idx) => (
                                                            <span key={idx} style={{ fontSize: '0.9rem', color: '#5b4a56' }}>
                                                                • {detalle.cantidad}x {detalle.nombrePrenda} · Talla: {detalle.talla || 'N/A'} · Subtotal: {formatearMoneda(detalle.subtotal ?? (detalle.precioUnitario * detalle.cantidad))}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span style={{ fontSize: '0.9rem', color: '#888' }}>
                                                            No hay detalles de prendas asociados a esta venta.
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}