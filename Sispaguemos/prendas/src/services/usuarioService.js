const API_URL = 'http://localhost:8080/api/usuarios';

export const obtenerUsuarios = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Error al obtener los usuarios');
  return await res.json();
};

export const crearUsuario = async (usuario) => {
  // Si el componente ya le pasa un FormData directamente, lo enviamos de una vez
  let formData = usuario;
  if (!(usuario instanceof FormData)) {
    formData = new FormData();
    formData.append('primerNom', usuario.primerNom || '');
    formData.append('segundNom', usuario.segundNom || '');
    formData.append('primerApelli', usuario.primerApelli || '');
    formData.append('segundApelli', usuario.segundApelli || '');
    formData.append('correo', usuario.correo || '');
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