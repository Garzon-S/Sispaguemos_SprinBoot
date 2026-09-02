// src/views/VentasEmpleado.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { obtenerPrendas } from '../services/prendaService';

function VentasEmpleado() {
  const [prendas, setPrendas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  
  // Inicializamos el carrito leyendo de localStorage para que no se pierda al cambiar de pestaña
  const [carrito, setCarrito] = useState(() => {
    const carritoGuardado = localStorage.getItem('carrito_pos_empleado');
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
  });

  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [emailCliente, setEmailCliente] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const [mostrarModalFactura, setMostrarModalFactura] = useState(false);
  const [ultimaVentaInfo, setUltimaVentaInfo] = useState(null);

  // Estados para los modales de correo, carga y éxito con chulo
  const [mostrarModalCorreo, setMostrarModalCorreo] = useState(false);
  const [correoInputModal, setCorreoInputModal] = useState('');
  const [cargandoCorreo, setCargandoCorreo] = useState(false);
  const [exitoEnvioCorreo, setExitoEnvioCorreo] = useState(false);

  const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
  const idCajero = usuarioActual.idUsuario || usuarioActual.id_usuario || usuarioActual.id || 1;
  const nombreCajero = `${usuarioActual.primerNom || usuarioActual.primer_nom || 'Cajero'} ${usuarioActual.primerApelli || usuarioActual.primer_apelli || ''}`.trim();

  useEffect(() => {
    cargarDatos();
  }, []);

  // Cada vez que el carrito cambie, lo guardamos en localStorage automáticamente
  useEffect(() => {
    localStorage.setItem('carrito_pos_empleado', JSON.stringify(carrito));
  }, [carrito]);

  const cargarDatos = async () => {
    try {
      const dataPrendas = await obtenerPrendas().catch(() => []);
      setPrendas(dataPrendas || []);
      const resUser = await axios.get('http://localhost:8080/api/usuarios').catch(() => ({ data: [] }));
      setUsuarios(resUser.data || []);
    } catch (err) {
      console.error("Error al cargar datos para ventas:", err);
    }
  };

  const clienteEncontrado = usuarios.find(
    (u) => (u.correo || '').trim().toLowerCase() === emailCliente.trim().toLowerCase()
  );
  
  const nombreCliente = clienteEncontrado 
    ? `${clienteEncontrado.primerNom || clienteEncontrado.primer_nom || ''} ${clienteEncontrado.primerApelli || clienteEncontrado.primer_apelli || ''}`.trim()
    : emailCliente ? emailCliente : 'Cliente General (Venta Libre)';

  const agregarAlCarrito = (prenda) => {
    const pId = prenda.idPrenda || prenda.id_prenda;
    const pNombre = prenda.nombrePrend || prenda.nombre_prend || 'Prenda';
    const pPrecio = Number(prenda.precioVenta || prenda.precio_venta || 0);
    const stockDisponible = Number(prenda.cantidadDisponibleVenta || prenda.cantidad_disponible_venta || 0);

    const existe = carrito.find(item => item.id === pId);
    if (existe) {
      if (existe.cantidad >= stockDisponible) {
        alert('⚠️ No hay suficiente stock disponible para agregar más unidades.');
        return;
      }
      setCarrito(carrito.map(item => item.id === pId ? { ...item, cantidad: item.cantidad + 1 } : item));
    } else {
      if (stockDisponible <= 0) {
        alert('⚠️ Esta prenda no tiene stock disponible.');
        return;
      }
      setCarrito([...carrito, { id: pId, nombre: pNombre, precio: pPrecio, cantidad: 1, stock: stockDisponible }]);
    }
    setCodigoBusqueda('');
  };

  const manejarBusquedaCodigo = (e) => {
    e.preventDefault();
    const encontrada = prendas.find(p => String(p.idPrenda || p.id_prenda).trim().toLowerCase() === codigoBusqueda.trim().toLowerCase());
    if (encontrada) {
      agregarAlCarrito(encontrada);
    } else {
      setError('❌ Prenda no encontrada con ese código.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const cambiarCantidad = (id, delta) => {
    setCarrito(carrito.map(item => {
      if (item.id === id) {
        const nuevaCantidad = item.cantidad + delta;
        if (nuevaCantidad <= 0) return null;
        if (nuevaCantidad > item.stock) {
          alert('⚠️ Supera el stock disponible en inventario.');
          return item;
        }
        return { ...item, cantidad: nuevaCantidad };
      }
      return item;
    }).filter(Boolean));
  };

  const eliminarItem = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const calcularTotal = () => {
    return carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  };

  const procesarVenta = async (e) => {
    e.preventDefault();
    if (carrito.length === 0) return alert('El carrito está vacío.');

    try {
      const totalVenta = calcularTotal();
      const payload = {
        precio_final: totalVenta,
        metodo_pago: metodoPago,
        fk_id_usuario_cajero: Number(idCajero),
        cliente_correo: emailCliente.trim() || null,
        detalles: carrito.map(item => ({
          id_prenda: item.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio
        }))
      };

      const res = await axios.post('http://localhost:8080/api/ventas', payload);

      setUltimaVentaInfo({
        idVenta: res.data?.idVenta || 'POS-' + Math.floor(Math.random() * 90000 + 10000),
        total: totalVenta,
        metodoPago: metodoPago,
        cajero: nombreCajero,
        cliente: nombreCliente,
        items: [...carrito],
        fecha: new Date().toLocaleString('es-CO')
      });

      setExito('✅ ¡Venta registrada con éxito y stock actualizado!');
      setCarrito([]); // Vaciamos el carrito tras procesar
      localStorage.removeItem('carrito_pos_empleado'); // Limpiamos el localStorage de la venta anterior
      setMostrarModalFactura(true); 
      cargarDatos();
    } catch (err) {
      console.error("Error al procesar la venta:", err);
      alert('❌ Error al procesar la venta en el servidor.');
    }
  };

  const generarFacturaPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text('SISPAGUEMOS - PAGUE MENOS', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text('NIT: 900.123.456-7', 105, 28, { align: 'center' });
    doc.text('Régimen Común - Responsables de IVA', 105, 34, { align: 'center' });
    doc.text('Bogotá, Colombia - Sede Salitre', 105, 40, { align: 'center' });
    
    doc.line(14, 45, 196, 45); 

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Factura de Venta POS No: ${ultimaVentaInfo.idVenta}`, 14, 55);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha y Hora: ${ultimaVentaInfo.fecha}`, 14, 62);
    doc.text(`Cajero: ${ultimaVentaInfo.cajero}`, 14, 69);
    doc.text(`Cliente: ${ultimaVentaInfo.cliente}`, 14, 76);
    doc.text(`Método de Pago: ${ultimaVentaInfo.metodoPago}`, 14, 83);

    const tableColumn = ["Ref / Prenda", "Cant", "Vr. Unitario", "Subtotal"];
    const tableRows = [];

    ultimaVentaInfo.items.forEach(item => {
      const itemData = [
        item.nombre,
        item.cantidad,
        `$${item.precio.toLocaleString('es-CO')}`,
        `$${(item.precio * item.cantidad).toLocaleString('es-CO')}`
      ];
      tableRows.push(itemData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 90,
      theme: 'striped',
      headStyles: { fillColor: [230, 57, 130] }, 
      styles: { halign: 'center' },
      columnStyles: { 0: { halign: 'left' } }
    });

    const totalVenta = ultimaVentaInfo.total;
    const baseGravable = totalVenta / 1.19;
    const valorIva = totalVenta - baseGravable;

    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 150;
    
    doc.setFont("helvetica", "normal");
    doc.text('Subtotal (Base gravable):', 130, finalY);
    doc.text(`$${Math.round(baseGravable).toLocaleString('es-CO')}`, 170, finalY);

    doc.text('IVA (19%):', 130, finalY + 7);
    doc.text(`$${Math.round(valorIva).toLocaleString('es-CO')}`, 170, finalY + 7);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text('TOTAL A PAGAR:', 130, finalY + 15);
    doc.text(`$${totalVenta.toLocaleString('es-CO')}`, 170, finalY + 15);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text('Resolución DIAN Autorización POS No. 18764032943', 105, finalY + 30, { align: 'center' });
    doc.text('Numeración habilitada de POS-1 a POS-50000', 105, finalY + 35, { align: 'center' });
    doc.text('¡Gracias por su compra en Pague Menos!', 105, finalY + 45, { align: 'center' });

    doc.save(`Factura_POS_${ultimaVentaInfo.idVenta}.pdf`);
  };

  const manejarTipoFactura = (tipo) => {
    setMostrarModalFactura(false);
    if (tipo === 'electronica') {
      setCorreoInputModal(emailCliente.trim());
      setExitoEnvioCorreo(false);
      setMostrarModalCorreo(true);
    } else {
      generarFacturaPDF();
      setEmailCliente('');
    }
  };

  const enviarCorreoAlServidor = async (e) => {
    e.preventDefault();
    if (!correoInputModal || !correoInputModal.includes('@')) {
      alert('⚠️ Ingresa un correo electrónico válido.');
      return;
    }

    setCargandoCorreo(true);
    setExitoEnvioCorreo(false);

    try {
      const datosFactura = {
        ...ultimaVentaInfo,
        correo_destino: correoInputModal.trim(),
        iva: Math.round(ultimaVentaInfo.total - (ultimaVentaInfo.total / 1.19))
      };

      await axios.post('http://localhost:8080/api/ventas/enviar-factura', datosFactura);
      
      setCargandoCorreo(false);
      setExitoEnvioCorreo(true); // Activamos la vista del chulo verde de éxito
      setEmailCliente('');
    } catch (error) {
      console.error("Error enviando correo:", error);
      setCargandoCorreo(false);
      alert('❌ Error al intentar enviar el correo. Revisa la consola de Spring Boot.');
      setMostrarModalCorreo(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif', position: 'relative' }}>
      <h2>Módulo de Ventas Físicas (Caja POS)</h2>
      
      {exito && <div style={{ background: '#d4edda', color: '#155724', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontWeight: '500' }}>{exito}</div>}
      {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontWeight: '500' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
        
        {/* COLUMNA IZQUIERDA: Buscador y Carrito */}
        <div>
          <form onSubmit={manejarBusquedaCodigo} style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
            <input 
              type="text" 
              placeholder="Escanea o escribe el código de barras de la prenda..." 
              value={codigoBusqueda}
              onChange={(e) => setCodigoBusqueda(e.target.value)}
              style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
            />
            <button type="submit" style={{ background: '#e63982', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              Agregar
            </button>
          </form>

          <h3>Carrito de Compras</h3>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', minHeight: '320px' }}>
            {carrito.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#777', marginTop: '4rem' }}>El carrito está vacío. Escanea o agrega productos para iniciar la venta.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', fontSize: '0.85rem', color: '#555' }}>
                    <th style={{ padding: '8px' }}>Prenda</th>
                    <th style={{ padding: '8px' }}>Precio U.</th>
                    <th style={{ padding: '8px' }}>Cantidad</th>
                    <th style={{ padding: '8px' }}>Subtotal</th>
                    <th style={{ padding: '8px' }}>Quitar</th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                      <td style={{ padding: '10px 8px', fontWeight: '500' }}>{item.nombre}</td>
                      <td style={{ padding: '10px 8px' }}>${item.precio.toLocaleString('es-CO')}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button type="button" onClick={() => cambiarCantidad(item.id, -1)} style={{ padding: '2px 8px', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                          <span style={{ minWidth: '20px', textAlign: 'center' }}>{item.cantidad}</span>
                          <button type="button" onClick={() => cambiarCantidad(item.id, 1)} style={{ padding: '2px 8px', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                        </div>
                      </td>
                      <td style={{ padding: '10px 8px', fontWeight: 'bold' }}>${(item.precio * item.cantidad).toLocaleString('es-CO')}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <button type="button" onClick={() => eliminarItem(item.id)} style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Cliente, Pago y Total */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <form onSubmit={procesarVenta}>
            <h3>Finalizar Venta</h3>
            
            <div style={{ margin: '1rem 0' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '5px' }}>Correo del Cliente (Opcional)</label>
              <input 
                type="email" 
                placeholder="cliente@correo.com" 
                value={emailCliente}
                onChange={(e) => setEmailCliente(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', outline: 'none' }}
              />
              {emailCliente && (
                <div style={{ fontSize: '0.82rem', marginTop: '6px', color: clienteEncontrado ? '#28a745' : '#e67e22', fontWeight: '600' }}>
                  {nombreCliente}
                </div>
              )}
            </div>

            <div style={{ margin: '1rem 0' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '5px' }}>Método de Pago *</label>
              <select 
                value={metodoPago} 
                onChange={(e) => setMetodoPago(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', outline: 'none' }}
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Nequi">Nequi</option>
              </select>
            </div>

            <div style={{ borderTop: '2px dashed #eee', margin: '1.5rem 0', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '700', color: '#2b1830' }}>
                <span>Total a Cobrar:</span>
                <span style={{ color: '#e63982' }}>${calcularTotal().toLocaleString('es-CO')} COP</span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={carrito.length === 0}
              style={{
                width: '100%',
                backgroundColor: carrito.length === 0 ? '#ccc' : '#e63982',
                color: '#fff',
                border: 'none',
                padding: '12px',
                borderRadius: '30px',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: carrito.length === 0 ? 'default' : 'pointer',
                transition: 'background 0.2s'
              }}
            >
              Completar Venta y Cobrar
            </button>
          </form>
        </div>

      </div>

      {/* MODAL 1: ELECCIÓN DE COMPROBANTE CON FONDO DESENFOCADO */}
      {mostrarModalFactura && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#fff', padding: '2.5rem', borderRadius: '20px', width: '420px', textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ color: '#2b1830', marginBottom: '10px', fontSize: '1.4rem' }}>¡Venta Exitosa! 🎉</h3>
            <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '2rem' }}>
              Selecciona el tipo de comprobante que deseas emitir para esta transacción:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => manejarTipoFactura('electronica')}
                style={{
                  background: '#e63982', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px',
                  fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer'
                }}
              >
                ⚡ Enviar Factura (Correo)
              </button>

              <button 
                onClick={() => manejarTipoFactura('pdf')}
                style={{
                  background: '#7c9885', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px',
                  fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer'
                }}
              >
                📥 Descargar Comprobante PDF
              </button>
            </div>

            <button 
              onClick={() => { setMostrarModalFactura(false); setEmailCliente(''); }}
              style={{ background: 'transparent', border: 'none', color: '#888', marginTop: '1.5rem', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Omitir / Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: CORREO, SPINNER DE CARGA Y CHULO VERDE DE ÉXITO */}
      {mostrarModalCorreo && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }}>
          <div style={{
            background: '#fff', padding: '2.5rem', borderRadius: '20px', width: '420px', textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            {cargandoCorreo ? (
              // 1. SPINNER DE CARGA
              <div style={{ padding: '2rem 0' }}>
                <div style={{
                  width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #e63982',
                  borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem auto'
                }}></div>
                <h4 style={{ color: '#2b1830', marginBottom: '5px' }}>Enviando factura electrónica...</h4>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>Esto tomará solo unos segundos.</p>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : exitoEnvioCorreo ? (
              // 2. MODAL DE ÉXITO CON ANIMACIÓN DE CHULO (CHECKMARK)
              <div style={{ padding: '1rem 0' }}>
                <div style={{
                  width: '70px', height: '70px', background: '#d4edda', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto',
                  color: '#28a745', fontSize: '2rem', fontWeight: 'bold'
                }}>
                  ✓
                </div>
                <h3 style={{ color: '#2b1830', marginBottom: '8px', fontSize: '1.3rem' }}>¡Correo Enviado!</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.8rem' }}>
                  La factura electrónica se ha despachado correctamente al cliente.
                </p>
                <button 
                  onClick={() => setMostrarModalCorreo(false)}
                  style={{
                    width: '100%', background: '#28a745', color: '#fff', border: 'none', padding: '12px',
                    borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer'
                  }}
                >
                  Aceptar
                </button>
              </div>
            ) : (
              // 3. FORMULARIO PARA INGRESAR EL CORREO
              <form onSubmit={enviarCorreoAlServidor}>
                <h3 style={{ color: '#2b1830', marginBottom: '10px', fontSize: '1.4rem' }}>Enviar Factura DIAN ✉️</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Confirma o ingresa el correo electrónico al que deseas enviar la factura electrónica:
                </p>

                <input 
                  type="email" 
                  placeholder="correo.cliente@dominio.com" 
                  value={correoInputModal}
                  onChange={(e) => setCorreoInputModal(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ccc',
                    boxSizing: 'border-box', outline: 'none', fontSize: '1rem', marginBottom: '1.5rem'
                  }}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="submit"
                    style={{
                      flex: 1, background: '#e63982', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px',
                      fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer'
                    }}
                  >
                    Enviar Correo
                  </button>

                  <button 
                    type="button"
                    onClick={() => setMostrarModalCorreo(false)}
                    style={{
                      background: '#eee', color: '#333', border: 'none', padding: '12px 20px', borderRadius: '12px',
                      fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default VentasEmpleado;