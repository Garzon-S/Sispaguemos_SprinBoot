import { useEffect, useState } from 'react';
import axios from 'axios';
import { obtenerPrendas, crearPrenda, actualizarPrenda } from '../services/prendaService';
import { obtenerBodega } from '../services/BodegaService';
import '../styles/prendas.css';

function InventarioPrendas() {
  const [modalError, setModalError] = useState('');
  const [prendas, setPrendas] = useState([]);
  const [bodegaList, setBodegaList] = useState([]);
  const [error, setError] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [filtroGenero, setFiltroGenero] = useState('Todos');
  const [mostrarInactivas, setMostrarInactivas] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  // Estados para el modal de ver/gestionar tallas de una prenda
  const [mostrarModalTallas, setMostrarModalTallas] = useState(false);
  const [prendaSeleccionadaTallas, setPrendaSeleccionadaTallas] = useState(null);
  const [tallasActuales, setTallasActuales] = useState([]);

  const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
  const rolUsuario = String(usuarioActual?.rol || usuarioActual?.tipoRol || '').trim().toLowerCase();
  const esAdmin = rolUsuario === 'administrador' || rolUsuario === 'admin';

  const [formPublicacion, setFormPublicacion] = useState({
    idPrendaSeleccionada: '',
    precioVenta: '',
    cantidadDisponibleVenta: '',
    estado: 'Disponible',
    imagenPrend: '',
    // Tallas con cantidadTalla mapeado para la bdd
    tallas: [
      { talla: 'S', cantidadTalla: '' }
    ]
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const dataPrendas = await obtenerPrendas();
      setPrendas(dataPrendas);

      try {
        const dataBodega = await obtenerBodega();
        setBodegaList(dataBodega || []);
      } catch (e) {
        console.warn("No se pudo cargar la bodega.");
      }

      setError('');
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError('No se pudo conectar con el servidor.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormPublicacion({ ...formPublicacion, [name]: value });
  };

  const handleTallaChange = (index, field, value) => {
    const nuevasTallas = [...formPublicacion.tallas];
    nuevasTallas[index][field] = field === 'cantidadTalla' ? (value === '' ? '' : Number(value)) : value;
    setFormPublicacion({ ...formPublicacion, tallas: nuevasTallas });
  };

  const handleSeleccionarPrendaBodega = (e) => {
    const idSel = e.target.value;
    setFormPublicacion({ ...formPublicacion, idPrendaSeleccionada: idSel });

    if (idSel) {
      const prendaEncontrada = prendas.find(p => String(p.idPrenda || p.id_prenda) === String(idSel));
      if (prendaEncontrada) {
        setFormPublicacion(prev => ({
          ...prev,
          idPrendaSeleccionada: idSel,
          precioVenta: prendaEncontrada.precioVenta || prendaEncontrada.precio_venta || '',
          cantidadDisponibleVenta: prendaEncontrada.cantidadDisponibleVenta || prendaEncontrada.cantidad_disponible_venta || '',
          estado: prendaEncontrada.estado || 'Disponible',
          imagenPrend: prendaEncontrada.imagenPrend || prendaEncontrada.imagen_prend || ''
        }));
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormPublicacion({ ...formPublicacion, imagenPrend: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const agregarFilaTalla = () => {
    setFormPublicacion({
      ...formPublicacion,
      tallas: [...formPublicacion.tallas, { talla: 'M', cantidadTalla: '' }]
    });
  };

  const eliminarFilaTalla = (index) => {
    const nuevasTallas = formPublicacion.tallas.filter((_, i) => i !== index);
    setFormPublicacion({ ...formPublicacion, tallas: nuevasTallas });
  };

  const abrirModalTallas = async (p) => {
    setPrendaSeleccionadaTallas(p);
    const idVal = p.idPrenda || p.id_prenda;
    const genero = p.genero;

    try {
      const response = await axios.get(`http://localhost:8080/api/prendas/${genero.toLowerCase()}/prenda/${idVal}`);
      setTallasActuales(response.data || []);
    } catch (err) {
      console.warn("No se pudieron cargar tallas:", err);
      setTallasActuales([]);
    }

    setMostrarModalTallas(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!esAdmin) return;
    setModalError('');

    const precio = Number(formPublicacion.precioVenta);
    const cantidadWeb = Number(formPublicacion.cantidadDisponibleVenta);

    console.log("Valores actuales en formPublicacion.tallas:", formPublicacion.tallas);

    if (precio <= 0) {
      setModalError('⚠️ Debes ingresar un precio de venta válido.');
      return;
    }

    try {
      const prendaId = editandoId || formPublicacion.idPrendaSeleccionada;
      if (!prendaId) {
        setModalError('⚠️ Debes seleccionar una prenda.');
        return;
      }

      const prendaOriginal = prendas.find(p => String(p.idPrenda || p.id_prenda) === String(prendaId));
      const generoPrenda = prendaOriginal?.genero || 'Hombre';

      let tallasHombre = null;
      let tallasMujer = null;
      let tallasInfantil = null;

      // Mapeo correcto apuntando a cantidadTalla
      const listaMapeada = formPublicacion.tallas.map(t => ({
        talla: t.talla,
        cantidadTalla: Number(t.cantidadTalla || 0)
      }));

      if (generoPrenda === 'Hombre') tallasHombre = listaMapeada;
      else if (generoPrenda === 'Mujer') tallasMujer = listaMapeada;
      else if (generoPrenda === 'Infantil') tallasInfantil = listaMapeada;

      const prendaData = {
        codigoBarras: prendaOriginal?.codigoBarras || prendaOriginal?.codigo_barras || '',
        nombrePrend: prendaOriginal?.nombrePrend || prendaOriginal?.nombre_prend || '',
        descripcionPrend: prendaOriginal?.descripcionPrend || prendaOriginal?.descripcion_prend || '',
        genero: generoPrenda,
        color: prendaOriginal?.color || '',
        precioVenta: precio,
        cantidadDisponibleVenta: cantidadWeb,
        estado: formPublicacion.estado,
        imagenPrend: formPublicacion.imagenPrend,
        tallasHombre,
        tallasMujer,
        tallasInfantil
      };

      await actualizarPrenda(prendaId, prendaData);
      alert('¡Prenda publicada y tallas configuradas con éxito!');

      limpiarFormulario();
      cargarDatos();
    } catch (err) {
      console.error("Error al publicar prenda:", err);
      setModalError('❌ Error al actualizar la prenda en el servidor.');
    }
  };

  const iniciarEdicion = async (p) => {
    if (!esAdmin) return;
    const idVal = p.idPrenda || p.id_prenda;
    const genero = p.genero;

    setEditandoId(idVal);

    // Primero seteamos los datos generales de la prenda
    setFormPublicacion({
      idPrendaSeleccionada: idVal,
      precioVenta: p.precioVenta || p.precio_venta || '',
      cantidadDisponibleVenta: p.cantidadDisponibleVenta || p.cantidad_disponible_venta || '',
      estado: p.estado || 'Disponible',
      imagenPrend: p.imagenPrend || p.imagen_prend || '',
      tallas: [{ talla: 'S', cantidadTalla: '' }] // Temporal mientras cargan las reales
    });

    // Consultamos al backend las tallas guardadas para esta prenda
    try {
      const response = await axios.get(`http://localhost:8080/api/prendas/${genero.toLowerCase()}/prenda/${idVal}`);
      if (response.data && response.data.length > 0) {
        // Mapeamos las tallas existentes para que el formulario las dibuje todas
        const tallasMapeadas = response.data.map(t => ({
          talla: t.talla,
          cantidadTalla: t.cantidadTalla ?? t.cantidad_talla ?? 0
        }));

        setFormPublicacion(prev => ({
          ...prev,
          tallas: tallasMapeadas
        }));
      }
    } catch (err) {
      console.warn("No se pudieron precargar las tallas para edición:", err);
    }

    setModalError('');
    setMostrarModal(true);
  };
  const limpiarFormulario = () => {
    setEditandoId(null);
    setFormPublicacion({
      idPrendaSeleccionada: '',
      precioVenta: '',
      cantidadDisponibleVenta: '',
      estado: 'Disponible',
      imagenPrend: '',
      tallas: [{ talla: 'S', cantidadTalla: '' }]
    });
    setModalError('');
    setMostrarModal(false);
  };

  const prendasFiltradas = prendas.filter((p) => {
    const nombre = (p.nombrePrend || p.nombre_prend || '').toLowerCase();
    const codigo = String(p.codigoBarras || p.codigo_barras || '').toLowerCase();
    const textoBusqueda = busqueda.toLowerCase();

    const cumpleTexto = nombre.includes(textoBusqueda) || codigo.includes(textoBusqueda);
    const cumpleGenero = filtroGenero === 'Todos' || p.genero === filtroGenero;
    const cumpleEstado = mostrarInactivas ? p.estado === 'Inactivo' : p.estado !== 'Inactivo';

    return cumpleTexto && cumpleGenero && cumpleEstado;
  });

  return (
    <div className="inventario-content">
      <div className="dashboard-cards-grid">
        <div className="dash-card">
          <h3>PANEL</h3>
          <h1>Catálogo Vitrina</h1>
          <p>Gestiona la imagen, precios y distribución de tallas para la venta al público.</p>
        </div>
        <div className="metric-card">
          <small>TOTAL PUBLICADOS</small>
          <h2>{prendas.length}</h2>
        </div>
      </div>

      <div className="catalogo-header-section">
        <h2>Gestión de Vitrina y Publicación</h2>
        <div className="action-header-buttons" style={{ display: 'flex', gap: '10px' }}>
          {esAdmin && (
            <button className="btn-agregar" onClick={() => { limpiarFormulario(); setMostrarModal(true); }}>
              + Publicar / Configurar Prenda
            </button>
          )}
        </div>
      </div>

      <div className="filter-search-row">
        <div className="search-box-group">
          <label>BUSCAR POR CÓDIGO O NOMBRE</label>
          <input type="text" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <div className="filter-box-group">
          <label>FILTRAR POR GÉNERO</label>
          <select value={filtroGenero} onChange={(e) => setFiltroGenero(e.target.value)}>
            <option value="Todos">Todos los géneros</option>
            <option value="Hombre">Hombre</option>
            <option value="Mujer">Mujer</option>
            <option value="Infantil">Infantil</option>
          </select>
        </div>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <div className="grid-prendas">
        {prendasFiltradas.length === 0 ? (
          <p className="no-data">No hay prendas configuradas en vitrina.</p>
        ) : (
          prendasFiltradas.map((p) => {
            const prendaId = p.idPrenda || p.id_prenda;
            const nombrePrenda = p.nombrePrend || p.nombre_prend || 'Sin nombre';
            const precioPrenda = Number(p.precioVenta || p.precio_venta || 0);
            const codigoPrenda = p.codigoBarras || p.codigo_barras || prendaId;
            const stockPrenda = p.cantidadDisponibleVenta ?? p.cantidad_disponible_venta ?? 0;
            const imagenPrenda = p.imagenPrend || p.imagen_prend || "https://via.placeholder.com/150";

            return (
              <div className="card-prenda-clean" key={prendaId}>
                <div className="card-img-wrap">
                  <img src={imagenPrenda} alt={nombrePrenda} />
                </div>
                <div className="card-details">
                  <div className="card-title-price">
                    <h4>{nombrePrenda}</h4>
                    <span className="precio-tag">${precioPrenda.toLocaleString()}</span>
                  </div>
                  <p className="codigo-txt">Código: {codigoPrenda}</p>
                  <div className="card-meta-row">
                    <span className="meta-badge">Vitrina: {stockPrenda}</span>
                    <span className="meta-badge">Género: {p.genero}</span>
                  </div>

                  {/* BOTÓN PARA VER TALLAS Y CANTIDADES */}
                  <div style={{ margin: '8px 0' }}>
                    <button
                      onClick={() => abrirModalTallas(p)}
                      style={{ background: '#17a2b8', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', width: '100%' }}>
                      👕 Ver Tallas y Cantidades
                    </button>
                  </div>

                  <div className="card-footer-row">
                    <span style={{ color: '#28a745', fontWeight: 'bold' }}>{p.estado}</span>
                    {esAdmin && (
                      <div className="card-btns">
                        <button onClick={() => iniciarEdicion(p)} className="btn-accion-txt">Configurar</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL PARA VER TALLAS Y STOCK DISPONIBLE */}
      {mostrarModalTallas && prendaSeleccionadaTallas && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '450px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>Tallas y Stock Disponible</h3>
              <button className="btn-cerrar-modal" onClick={() => setMostrarModalTallas(false)}>✕</button>
            </div>
            <div className="modal-detalles" style={{ padding: '15px' }}>
              <p><strong>Prenda:</strong> {prendaSeleccionadaTallas.nombrePrend || prendaSeleccionadaTallas.nombre_prend}</p>
              <p><strong>Género:</strong> {prendaSeleccionadaTallas.genero}</p>
              <hr style={{ margin: '10px 0' }} />

              {tallasActuales.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center' }}>No hay tallas registradas para esta prenda todavía.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tallasActuales.map((t, idx) => (
                    <div key={idx} style={{ background: '#f8f9fa', padding: '10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #dee2e6' }}>
                      <div>
                        <strong>Talla: {t.talla}</strong>
                      </div>
                      <div style={{ background: '#28a745', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                        {t.cantidadTalla ?? t.cantidad_talla} unidades
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-cerrar-detalles" onClick={() => setMostrarModalTallas(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PUBLICACIÓN / CONFIGURACIÓN CON TALLAS SIMPLIFICADAS */}
      {mostrarModal && esAdmin && (
        <div className="modal-overlay">
          <div className="modal-content-wide" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>{editandoId ? 'Configurar Prenda y Tallas' : 'Publicar Producto desde Bodega'}</h2>
              <button className="btn-cerrar" onClick={limpiarFormulario}>✕</button>
            </div>

            {modalError && <div className="modal-alert-error"><span>{modalError}</span></div>}

            <form onSubmit={handleSubmit} className="form-grid-wide">

              {!editandoId && (
                <div className="form-group span-2">
                  <label>SELECCIONAR PRODUCTO DESDE BODEGA *</label>
                  <select name="idPrendaSeleccionada" value={formPublicacion.idPrendaSeleccionada} onChange={handleSeleccionarPrendaBodega} required>
                    <option value="">-- Seleccione un producto registrado en bodega --</option>
                    {prendas.map((p) => {
                      const pId = p.idPrenda || p.id_prenda;
                      const nombre = p.nombrePrend || p.nombre_prend;
                      return (
                        <option key={pId} value={pId}>
                          {nombre} (Código: {p.codigoBarras || p.codigo_barras}) - Género: {p.genero}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              <div className="form-group span-2">
                <label>IMAGEN DE LA PRENDA (Vitrina / Web)</label>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ padding: '6px' }} />
                {formPublicacion.imagenPrend && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={formPublicacion.imagenPrend} alt="Vista previa" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <span style={{ fontSize: '12px', color: '#28a745' }}>Imagen cargada correctamente</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>PRECIO DE VENTA (COP) *</label>
                <input type="number" step="0.01" name="precioVenta" placeholder="Ej: 120000"
                  value={formPublicacion.precioVenta} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>CANTIDAD DISPONIBLE EN VITRINA *</label>
                <input type="number" name="cantidadDisponibleVenta" placeholder="Ej: 5"
                  value={formPublicacion.cantidadDisponibleVenta} onChange={handleChange} required />
              </div>

              <div className="form-group span-2">
                <label>ESTADO</label>
                <select name="estado" value={formPublicacion.estado} onChange={handleChange}>
                  <option value="Disponible">Disponible</option>
                  <option value="Agotado">Agotado</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>

              {/* SECCIÓN DE TALLAS SIMPLIFICADA (SELECT + CANTIDAD TALLA) */}
              <div style={{ gridColumn: '1 / -1', marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>Asignar Tallas y Cantidades</h3>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
                  Selecciona la talla del catálogo y asigna la cantidad de stock disponible.
                </p>

                {formPublicacion.tallas.map((tallaItem, index) => (
                  <div key={index} style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 2fr 45px',
                    gap: '15px',
                    alignItems: 'end',
                    marginBottom: '10px',
                    background: '#f8f9fa',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Talla *</label>
                      <select
                        value={tallaItem.talla}
                        onChange={(e) => handleTallaChange(index, 'talla', e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="38">38</option>
                        <option value="40">40</option>
                        <option value="42">42</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Cantidad Stock *</label>
                      <input
                        type="number"
                        value={tallaItem.cantidadTalla}
                        onChange={(e) => handleTallaChange(index, 'cantidadTalla', e.target.value)}
                        placeholder="Ej: 20"
                        required
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => eliminarFilaTalla(index)}
                      style={{
                        background: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        height: '35px',
                        fontWeight: 'bold'
                      }}>
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={agregarFilaTalla}
                  style={{
                    background: '#6c757d',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 15px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}>
                  + Agregar otra talla
                </button>
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                <button type="submit" className="btn-primary-wide">
                  {editandoId ? 'Guardar Cambios de Vitrina' : 'Publicar Prenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventarioPrendas;