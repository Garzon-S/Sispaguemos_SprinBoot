import axios from 'axios';

const API_URL = 'http://localhost:8080/api/prendas';

export const obtenerPrendas = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const crearPrenda = async (prenda) => {
    const response = await axios.post(API_URL, prenda);
    return response.data;
};

export const actualizarPrenda = async (id, prenda) => {
    const response = await axios.put(`${API_URL}/${id}`, prenda);
    return response.data;
};

export const eliminarPrenda = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

// Nuevas peticiones para los selects
export const obtenerGeneros = async () => {
    const response = await axios.get('http://localhost:8080/api/generos');
    return response.data;
};

export const obtenerTiposPrenda = async () => {
    const response = await axios.get('http://localhost:8080/api/tipos-prendas');
    return response.data;
};

export const obtenerColores = async () => {
    const response = await axios.get('http://localhost:8080/api/colores');
    return response.data;
};