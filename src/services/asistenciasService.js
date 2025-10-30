import axios from 'axios';

/**
 * SERVICIO DE ASISTENCIAS
 * 
 * Maneja todas las llamadas a la API relacionadas con asistencias
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configurar axios para incluir cookies
axios.defaults.withCredentials = true;

/**
 * Obtener estadísticas del dashboard de asistencias
 */
export const getDashboardAsistencias = async () => {
  try {
    const response = await axios.get(`${API_URL}/asistencias/dashboard`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener dashboard de asistencias:', error);
    throw error;
  }
};

/**
 * Obtener lista de justificantes
 * @param {Object} filtros - { estado, area }
 */
export const getJustificantes = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.area) params.append('area', filtros.area);

    const response = await axios.get(`${API_URL}/asistencias/justificantes?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener justificantes:', error);
    throw error;
  }
};

/**
 * Crear nuevo justificante
 * @param {Object} datos - Datos del justificante
 */
export const createJustificante = async (datos) => {
  try {
    const response = await axios.post(`${API_URL}/asistencias/justificantes`, datos);
    return response.data;
  } catch (error) {
    console.error('Error al crear justificante:', error);
    throw error;
  }
};

/**
 * Obtener tipos de incidencia disponibles
 */
export const getTiposIncidencia = async () => {
  try {
    const response = await axios.get(`${API_URL}/asistencias/tipos-incidencia`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener tipos de incidencia:', error);
    throw error;
  }
};

/**
 * Obtener reporte de asistencias por área
 * @param {Object} filtros - { mes, anio, area }
 */
export const getReporteAsistencias = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.mes) params.append('mes', filtros.mes);
    if (filtros.anio) params.append('anio', filtros.anio);
    if (filtros.area) params.append('area', filtros.area);

    const response = await axios.get(`${API_URL}/asistencias/reporte?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener reporte de asistencias:', error);
    throw error;
  }
};

/**
 * Obtener detalle de asistencias por empleado
 * @param {Object} filtros - { area_id, mes, anio }
 */
export const getDetalleAsistencias = async (filtros) => {
  try {
    const params = new URLSearchParams();
    if (filtros.area_id) params.append('area_id', filtros.area_id);
    if (filtros.mes) params.append('mes', filtros.mes);
    if (filtros.anio) params.append('anio', filtros.anio);

    const response = await axios.get(`${API_URL}/asistencias/reporte/detalle?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener detalle de asistencias:', error);
    throw error;
  }
};

/**
 * Obtener reporte analítico
 * @param {Object} filtros - { mes, anio, tipo }
 */
export const getReporteAnalitico = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.mes) params.append('mes', filtros.mes);
    if (filtros.anio) params.append('anio', filtros.anio);
    if (filtros.tipo) params.append('tipo', filtros.tipo);

    const response = await axios.get(`${API_URL}/asistencias/reporte/analitico?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener reporte analítico:', error);
    throw error;
  }
};

/**
 * Obtener registro de visitas
 * @param {Object} filtros - { mes, anio, area }
 */
export const getVisitas = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.mes) params.append('mes', filtros.mes);
    if (filtros.anio) params.append('anio', filtros.anio);
    if (filtros.area) params.append('area', filtros.area);

    const response = await axios.get(`${API_URL}/asistencias/visitas?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener visitas:', error);
    throw error;
  }
};

/**
 * Registrar asistencia (entrada o salida)
 * @param {Object} datos - { persona_id, tipo, hora }
 */
export const registrarAsistencia = async (datos) => {
  try {
    const response = await axios.post(`${API_URL}/asistencias/registrar`, datos);
    return response.data;
  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    throw error;
  }
};

export default {
  getDashboardAsistencias,
  getJustificantes,
  createJustificante,
  getTiposIncidencia,
  getReporteAsistencias,
  getDetalleAsistencias,
  getReporteAnalitico,
  getVisitas,
  registrarAsistencia
};
