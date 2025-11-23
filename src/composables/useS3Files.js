// src/composables/useS3Files.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// 🔁 Instancia de axios que siempre manda cookies al backend
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true   // 👈 MUY IMPORTANTE para que viaje la cookie con el token
});

export const useS3Files = () => {

  // Sube un archivo a S3 y lo registra en la BD
  const subirArchivo = async (file) => {
    try {
      const formData = new FormData();
      formData.append('archivo', file);

      const response = await api.post(
        '/upload-file',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al subir archivo:', error.response?.data || error);
      throw error;
    }
  };

  const obtenerArchivos = async () => {
    try {
      const response = await api.get('/archivos');
      return response.data.archivos;
    } catch (error) {
      console.error('Error al obtener archivos:', error.response?.data || error);
      throw error;
    }
  };

  const obtenerArchivoPorId = async (id) => {
    try {
      const response = await api.get(`/archivo/${id}`);
      return response.data.archivo;
    } catch (error) {
      console.error('Error al obtener archivo:', error.response?.data || error);
      throw error;
    }
  };

  const eliminarArchivo = async (id) => {
    try {
      const response = await api.delete(`/delete-file/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar archivo:', error.response?.data || error);
      throw error;
    }
  };

  const actualizarArchivo = async (id, file) => {
    try {
      const formData = new FormData();
      formData.append('archivo', file);

      const response = await api.put(
        `/update-file/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al actualizar archivo:', error.response?.data || error);
      throw error;
    }
  };

  const obtenerUrlFirmada = async (fileName) => {
    try {
      const response = await api.get(`/get-file/${fileName}`);
      return response.data.url;
    } catch (error) {
      console.error('Error al obtener URL firmada:', error.response?.data || error);
      throw error;
    }
  };

  const descargarArchivo = async (fileName) => {
    try {
      const url = `${API_URL}/download-file/${fileName}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error al descargar archivo:', error.response?.data || error);
      throw error;
    }
  };

  const listarArchivosS3 = async (prefix = '') => {
    try {
      const response = await api.get('/list-files', {
        params: { prefix }
      });
      return response.data.archivos;
    } catch (error) {
      console.error('Error al listar archivos S3:', error.response?.data || error);
      throw error;
    }
  };

  const listarBuckets = async () => {
    try {
      const response = await api.get('/s3-buckets');
      return response.data.buckets;
    } catch (error) {
      console.error('Error al listar buckets:', error.response?.data || error);
      throw error;
    }
  };

    // ✅ Nuevo: obtener URL firmada del contrato actual
  const obtenerUrlContratoActual = async (personaId) => {
    try {
      const { data } = await axios.get(
        `${API_URL}/s3/contrato-actual/${personaId}`,
        { withCredentials: true }
      );

      if (!data.ok || !data.url) {
        throw new Error(data.error || 'No se pudo obtener la URL del contrato');
      }

      return data.url;
    } catch (error) {
      console.error('Error al obtener URL del contrato actual:', error.response || error);
      throw error;
    }
  };

  return {
    subirArchivo,
    obtenerArchivos,
    obtenerArchivoPorId,
    eliminarArchivo,
    actualizarArchivo,
    obtenerUrlFirmada,
    descargarArchivo,
    listarArchivosS3,
    listarBuckets,
    obtenerUrlContratoActual
  };
};
