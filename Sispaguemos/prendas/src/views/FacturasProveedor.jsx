import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function FacturasProveedor() {
    const [facturas, setFacturas] = useState([]);

    useEffect(() => {
        cargarFacturas();
    }, []);

    const cargarFacturas = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/facturas-proveedor');
            setFacturas(res.data);
        } catch (err) {
            console.error("Error al cargar facturas", err);
        }
    };

    const marcarComoRecibida = async (id) => {
        try {
            await axios.put(`http://localhost:8080/api/facturas-proveedor/${id}/recibir`);
            alert("¡Mercancía recibida! Stock y Kardex actualizados exitosamente.");
            cargarFacturas();
        } catch (err) {
            console.error("Error al recibir la factura", err);
            alert("Hubo un error al procesar la recepción.");
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Control de Facturas y Compras (Restock)</h2>

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="p-3">Nº Factura</th>
                            <th className="p-3">Proveedor</th>
                            <th className="p-3">Fecha Pedido</th>
                            <th className="p-3">Estado</th>
                            <th className="p-3">Total</th>
                            <th className="p-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {facturas.map(f => (
                            <tr key={f.idFacturaProveedor} className="border-b">
                                <td className="p-3 font-semibold">{f.numeroFactura}</td>
                                <td className="p-3">{f.proveedor ? f.proveedor.nombreProveedor : 'N/A'}</td>
                                <td className="p-3">{new Date(f.fechaPedido).toLocaleDateString()}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${f.estado === 'Recibida' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {f.estado}
                                    </span>
                                </td>
                                <td className="p-3">${f.total}</td>
                                <td className="p-3">
                                    {f.estado !== 'Recibida' && (
                                        <button
                                            onClick={() => marcarComoRecibida(f.idFacturaProveedor)}
                                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                        >
                                            Marcar Recibida (Restock)
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}