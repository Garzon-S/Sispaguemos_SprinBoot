const API_URL = 'http://localhost:8080/api/usuarios';

const handleResponse = async (res, defaultMessage) => {
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const serverMessage = typeof data === 'string'
      ? data
      : data?.message || data?.error || data?.detail;
    throw new Error(serverMessage || defaultMessage);
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
    formData.append('nombreUsuario', [usuario.primerNom, usuario.segundNom].filter(Boolean).join(' '));
    formData.append('apellidoUsuario', [usuario.primerApelli, usuario.segundApelli].filter(Boolean).join(' '));
    formData.append('correo', usuario.correo || '');
    formData.append('contrasena', usuario.contrasena || '');
    formData.append('estado', usuario.estado !== undefined ? usuario.estado : 'Activo');
    formData.append('imagenPerfil', usuario.imagenPerfil);
    body = formData;
  } else {
    const payload = {
      nombreUsuario: [usuario.primerNom, usuario.segundNom].filter(Boolean).join(' '),
      apellidoUsuario: [usuario.primerApelli, usuario.segundApelli].filter(Boolean).join(' '),
      correo: usuario.correo || '',
      contrasena: usuario.contrasena || '',
      estado: usuario.estado !== undefined ? usuario.estado : 'Activo',
    };
    body = JSON.stringify(payload);
    headers = { 'Content-Type': 'application/json' };
  }

  let res;
  try {
    res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers,
      body,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Inicia el backend en el puerto 8080.');
  }

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