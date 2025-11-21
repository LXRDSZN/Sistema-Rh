import axios from 'axios';

/**
 * SERVICIO DE API - Dashboard
 * 
 * Centraliza todas las llamadas HTTP relacionadas con el dashboard
 */

const API_URL = 'http://localhost:5000/api';

// Configuración de axios con credenciales
const axiosConfig = {
  withCredentials: true
};

/**
 * Obtener estadísticas del dashboard
 */
export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/stats`, axiosConfig);
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    throw error;
  }
};

/**
 * Obtener empleados por área
 */
export const getEmpleadosPorArea = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/empleados-por-area`, axiosConfig);
    return response.data;
  } catch (error) {
    console.error('Error al obtener empleados por área:', error);
    throw error;
  }
};

/**
 * Obtener demografía (edad y género)
 */
export const getDemografia = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/demografia`, axiosConfig);
    return response.data;
  } catch (error) {
    console.error('Error al obtener demografía:', error);
    throw error;
  }
};

/**
 * Obtener empleados con contratos activos sin correo
 */
export const getEmpleadosSinCorreo = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/empleados-sin-correo`, axiosConfig);
    return response.data;
  } catch (error) {
    console.error('Error al obtener empleados sin correo:', error);
    throw error;
  }
};
