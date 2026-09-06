import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/proveedores.css'; // Importamos el CSS correcto

export default function Proveedores() {
    const [proveedores, setProveedores] = useState([]);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [form, setForm] = useState({
        nombreProveedor: '',
        nitProveedor: '',
        telefonoProveedor: '',
        correoProveedor: '',
        direccionProveedor: ''
    });

    useEffect(() => {
        cargarProveedores();
    }, []);

    const cargarProveedores = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/proveedores');
            setProveedores(res.data);
        } catch (err) {
            console.error("Error al cargar proveedores", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/proveedores', form);
            setForm({ nombreProveedor: '', nitProveedor: '', telefonoProveedor: '', correoProveedor: '', direccionProveedor: '' });
            setModalAbierto(false);
            cargarProveedores();
        } catch (err) {
            console.error("Error al guardar proveedor", err);
            alert("Error al registrar el proveedor.");
        }
    };

    return (
        <div className="proveedores-container">
            <div className="proveedores-header">
                <h2>Gestión de Proveedores</h2>
                <button
                    type="button"
                    onClick={() => setModalAbierto(true)}
                    className="btn-nuevo-proveedor"
                >
                    + Registrar Nuevo Proveedor
                </button>
            </div>

            {/* Modal / Pop-up */}
            {modalAbierto && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Registrar Proveedor</h3>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre del Proveedor</label>
                                <input
                                    type="text" placeholder="Ej. Textiles S.A." value={form.nombreProveedor}
                                    onChange={(e) => setForm({ ...form, nombreProveedor: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>NIT</label>
                                <input
                                    type="text" placeholder="Ej. 900123456-1" value={form.nitProveedor}
                                    onChange={(e) => setForm({ ...form, nitProveedor: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Teléfono</label>
                                    <input
                                        type="text" placeholder="Ej. 3101234567" value={form.telefonoProveedor}
                                        onChange={(e) => setForm({ ...form, telefonoProveedor: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Correo Electrónico</label>
                                    <input
                                        type="email" placeholder="correo@proveedor.com" value={form.correoProveedor}
                                        onChange={(e) => setForm({ ...form, correoProveedor: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Dirección</label>
                                <input
                                    type="text" placeholder="Ej. Calle 100 # 15-20" value={form.direccionProveedor}
                                    onChange={(e) => setForm({ ...form, direccionProveedor: e.target.value })}
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    onClick={() => setModalAbierto(false)}
                                    className="btn-cancelar"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-guardar"
                                >
                                    Guardar Proveedor
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Tabla de Proveedores */}
            <div className="tabla-container">
                <table className="tabla-proveedores">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>NIT</th>
                            <th>Teléfono</th>
                            <th>Correo</th>
                            <th>Dirección</th>
                        </tr>
                    </thead>
                    <tbody>
                        {proveedores.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#777' }}>
                                    No hay proveedores registrados.
                                </td>
                            </tr>
                        ) : (
                            proveedores.map(p => (
                                <tr key={p.idProveedor}>
                                    <td>{p.idProveedor}</td>
                                    <td><strong>{p.nombreProveedor}</strong></td>
                                    <td>{p.nitProveedor}</td>
                                    <td>{p.telefonoProveedor || 'N/A'}</td>
                                    <td>{p.correoProveedor || 'N/A'}</td>
                                    <td>{p.direccionProveedor || 'N/A'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}