import axios from 'axios';

const API_URL = 'http://localhost:8080/api/prendas';

export const obtenerPrendas = async () => {
    const res = await axios.get(API_URL);
    return res.data;
};

export const crearPrenda = async (prendaData) => {
    const res = await axios.post(API_URL, prendaData);
    return res.data;
};

export const actualizarPrenda = async (id, prendaData) => {
    const res = await axios.put(`${API_URL}/${id}`, prendaData);
    return res.data;
};