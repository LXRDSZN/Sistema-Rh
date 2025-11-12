import axios from 'axios';

/**
 * SERVICIO DE API - Incidencias
 * 
 * Centraliza todas las llamadas HTTP relacionadas con incidencias
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configuración de axios con credenciales
const axiosConfig = {
  withCredentials: true
};

/**
 * Obtener todas las incidencias con filtros opcionales
 */
export const getIncidencias = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filtros.estado_id) params.append('estado_id', filtros.estado_id);
    if (filtros.tipo_id) params.append('tipo_id', filtros.tipo_id);
    if (filtros.persona_id) params.append('persona_id', filtros.persona_id);
    if (filtros.area_id) params.append('area_id', filtros.area_id);
    if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
    if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);

    const queryString = params.toString();
    const url = queryString ? `${API_URL}/incidencias?${queryString}` : `${API_URL}/incidencias`;
    
    const response = await axios.get(url, axiosConfig);
    return response.data;
  } catch (error) {
    console.error('Error al obtener incidencias:', error);
    throw error;
  }
};

/**
 * Obtener una incidencia por ID
 */
export const getIncidenciaById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/incidencias/${id}`, axiosConfig);
    return response.data;
  } catch (error) {
    console.error('Error al obtener incidencia:', error);
    throw error;
  }
};

/**
 * Obtener incidencias de un empleado específico
 */
export const getIncidenciasByPersona = async (personaId) => {
  try {
    const response = await axios.get(
      `${API_URL}/personas/${personaId}/incidencias`, 
      axiosConfig
    );
    return response.data;
  } catch (error) {
    console.error('Error al obtener incidencias del empleado:', error);
    throw error;
  }
};

/**
 * Crear una nueva incidencia
 */
export const createIncidencia = async (datos) => {
  try {
    const response = await axios.post(
      `${API_URL}/incidencias`,
      datos,
      axiosConfig
    );
    return response.data;
  } catch (error) {
    console.error('Error al crear incidencia:', error);
    throw error;
  }
};

/**
 * Actualizar una incidencia
 */
export const updateIncidencia = async (id, datos) => {
  try {
    const response = await axios.put(
      `${API_URL}/incidencias/${id}`,
      datos,
      axiosConfig
    );
    return response.data;
  } catch (error) {
    console.error('Error al actualizar incidencia:', error);
    throw error;
  }
};

/**
 * Aprobar una incidencia
 */
export const approveIncidencia = async (id) => {
  try {
    const response = await axios.patch(
      `${API_URL}/incidencias/${id}/aprobar`,
      {},
      axiosConfig
    );
    return response.data;
  } catch (error) {
    console.error('Error al aprobar incidencia:', error);
    throw error;
  }
};

/**
 * Rechazar una incidencia
 */
export const rejectIncidencia = async (id, motivo = '') => {
  try {
    const response = await axios.patch(
      `${API_URL}/incidencias/${id}/rechazar`,
      { motivo },
      axiosConfig
    );
    return response.data;
  } catch (error) {
    console.error('Error al rechazar incidencia:', error);
    throw error;
  }
};

/**
 * Eliminar una incidencia
 */
export const deleteIncidencia = async (id) => {
  try {
    const response = await axios.delete(
      `${API_URL}/incidencias/${id}`,
      axiosConfig
    );
    return response.data;
  } catch (error) {
    console.error('Error al eliminar incidencia:', error);
    throw error;
  }
};

/**
 * Obtener todos los tipos de incidencias
 */
export const getTiposIncidencia = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/tipos-incidencia`,
      axiosConfig
    );
    return response.data;
  } catch (error) {
    console.error('Error al obtener tipos de incidencia:', error);
    throw error;
  }
};

/**
 * Obtener todos los estados de incidencias
 */
export const getEstadosIncidencia = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/estados-incidencia`,
      axiosConfig
    );
    return response.data;
  } catch (error) {
    console.error('Error al obtener estados de incidencia:', error);
    throw error;
  }
};

/**
 * Subir archivo
 */
export const uploadArchivo = async (file) => {
  try {
    const formData = new FormData();
    formData.append('archivo', file);

    const response = await axios.post(
      `${API_URL}/upload`,
      formData,
      {
        ...axiosConfig,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error al subir archivo:', error);
    throw error;
  }
};

export default {
  getIncidencias,
  getIncidenciaById,
  getIncidenciasByPersona,
  createIncidencia,
  updateIncidencia,
  approveIncidencia,
  rejectIncidencia,
  deleteIncidencia,
  getTiposIncidencia,
  getEstadosIncidencia,
  uploadArchivo
};
