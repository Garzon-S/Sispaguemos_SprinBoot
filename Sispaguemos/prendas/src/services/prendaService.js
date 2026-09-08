import axios from 'axios';

const API_URL = 'http://localhost:8080/api/prendas';

export const obtenerPrendas = async () => {
    const res = await axios.get(API_URL);
    return res.data;
};

export const obtenerTallasPorPrenda = async (idPrenda, genero) => {
    const generoNormalizado = String(genero || '').trim().toLowerCase();
    const rutas = generoNormalizado === 'niño' || generoNormalizado === 'niña'
        ? ['infantil']
        : generoNormalizado === 'unisex'
            ? ['hombre', 'mujer']
            : [generoNormalizado];

    const respuestas = await Promise.all(
        rutas.map(async (ruta) => ({
            tipoTalla: ruta,
            data: (await axios.get(`${API_URL}/${ruta}/prenda/${idPrenda}`)).data,
        }))
    );

    return respuestas
        .flatMap((respuesta) => (Array.isArray(respuesta.data) ? respuesta.data : []).map((talla) => ({ ...talla, tipoTalla: respuesta.tipoTalla })))
        .map((talla) => ({
            talla: talla.talla,
            cantidadTalla: Number(talla.cantidadTalla ?? talla.cantidad_talla ?? 0),
            tipoTalla: talla.tipoTalla,
            idTalla: talla.idHombre || talla.idMujer || talla.idInfantil || talla.id_hombre || talla.id_mujer || talla.id_infantil,
        }))
        .filter((talla) => talla.talla && talla.cantidadTalla > 0);
};

export const crearPrenda = async (prendaData) => {
    const res = await axios.post(API_URL, prendaData);
    return res.data;
};

export const actualizarPrenda = async (id, prendaData) => {
    const res = await axios.put(`${API_URL}/${id}`, prendaData);
    return res.data;
};