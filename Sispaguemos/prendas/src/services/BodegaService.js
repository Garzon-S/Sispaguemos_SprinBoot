// src/services/BodegaService.js
const API_URL = 'http://localhost:8080/api/bodega';

export const obtenerBodega = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al obtener bodega');
    const data = await response.json();
    
    // Mapeamos para asegurar que siempre exista 'id_stock' o 'idStock'
    return data.map(item => ({
      ...item,
      id_stock: item.idStock || item.id_stock || item.idBodega || item.id_bodega
    }));
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const crearBodega = async (data) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al crear registro de bodega');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const actualizarBodega = async (id, data) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al actualizar bodega');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const eliminarBodega = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Error al eliminar registro de bodega');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};