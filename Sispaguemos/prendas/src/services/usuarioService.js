const API_URL = 'http://localhost:8080/api/usuarios';

const handleResponse = async (res, defaultMessage) => {
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(data?.message || data || defaultMessage);
  }

  return data;
};

export const obtenerUsuarios = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Error al obtener los usuarios');
  return await res.json();
};

export const loginUsuario = async ({ correo, contrasena }) => {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ correo, contrasena }),
  });

  return handleResponse(res, 'Credenciales inválidas');
};

export const registrarUsuario = async (usuario) => {
  const hasImage = usuario.imagenPerfil instanceof File;

  let body;
  let headers = {};

  if (hasImage) {
    const formData = new FormData();
    formData.append('primerNom', usuario.primerNom || '');
    formData.append('segundNom', usuario.segundNom || '');
    formData.append('primerApelli', usuario.primerApelli || '');
    formData.append('segundApelli', usuario.segundApelli || '');
    formData.append('correo', usuario.correo || '');
    formData.append('contrasena', usuario.contrasena || '');
    formData.append('estado', usuario.estado !== undefined ? usuario.estado : 1);
    formData.append('imagenPerfil', usuario.imagenPerfil);
    body = formData;
  } else {
    const payload = {
      primerNom: usuario.primerNom || '',
      segundNom: usuario.segundNom || '',
      primerApelli: usuario.primerApelli || '',
      segundApelli: usuario.segundApelli || '',
      correo: usuario.correo || '',
      contrasena: usuario.contrasena || '',
      estado: usuario.estado !== undefined ? usuario.estado : 1,
    };
    body = JSON.stringify(payload);
    headers = { 'Content-Type': 'application/json' };
  }

  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers,
    body,
  });

  return handleResponse(res, 'Error al crear el usuario');
};

export const crearUsuario = async (usuario) => {
  let formData = usuario;
  if (!(usuario instanceof FormData)) {
    formData = new FormData();
    formData.append('primerNom', usuario.primerNom || '');
    formData.append('segundNom', usuario.segundNom || '');
    formData.append('primerApelli', usuario.primerApelli || '');
    formData.append('segundApelli', usuario.segundApelli || '');
    formData.append('correo', usuario.correo || '');
    formData.append('contrasena', usuario.contrasena || '');
    formData.append('estado', usuario.estado !== undefined ? usuario.estado : 1);

    if (usuario.imagenPerfil instanceof File) {
      formData.append('imagenPerfil', usuario.imagenPerfil);
    }
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Error al crear el usuario');
  return await res.json();
};

export const actualizarUsuario = async (id, usuario) => {
  let formData = usuario;
  if (!(usuario instanceof FormData)) {
    formData = new FormData();
    formData.append('primerNom', usuario.primerNom || '');
    formData.append('segundNom', usuario.segundNom || '');
    formData.append('primerApelli', usuario.primerApelli || '');
    formData.append('segundApelli', usuario.segundApelli || '');
    formData.append('correo', usuario.correo || '');
    formData.append('contrasena', usuario.contrasena || '');
    formData.append('estado', usuario.estado !== undefined ? usuario.estado : 1);

    if (usuario.imagenPerfil instanceof File) {
      formData.append('imagenPerfil', usuario.imagenPerfil);
    }
  }

  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    body: formData,
  });
  if (!res.ok) throw new Error('Error al actualizar el usuario');
  return await res.json();
};

export const eliminarUsuario = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar el usuario');
};