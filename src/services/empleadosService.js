import axios from 'axios';

/**
 * SERVICIO DE API - Empleados
 * 
 * Centraliza todas las llamadas HTTP relacionadas con empleados
 */

const API_URL = 'http://localhost:5000/api';

// Configuración de axios con credenciales
const axiosConfig = {
  withCredentials: true
};

/**
 * Obtener todos los empleados
 */
export const getEmpleados = async () => {
  try {
    const response = await axios.get(`${API_URL}/empleados`, axiosConfig);
    return response.data;
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    throw error;
  }
};

/**
 * Obtener un empleado por ID
 */
export const getEmpleadoById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/empleados/${id}`, axiosConfig);
    return response.data;
  } catch (error) {
    console.error('Error al obtener empleado:', error);
    throw error;
  }
};

/**
 * Actualizar asignación de empleado (área y puesto)
 */
export const updateEmpleadoAsignacion = async (id, asignacion) => {
  try {
    const response = await axios.put(
      `${API_URL}/empleados/${id}/asignacion`, 
      asignacion,
      axiosConfig
    );
    return response.data;
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    throw error;
  }
};

/**
 * Obtener todas las áreas
 */
export const getAreas = async () => {
  try {
    const response = await axios.get(`${API_URL}/areas`, axiosConfig);
    return response.data;
  } catch (error) {
    console.error('Error al obtener áreas:', error);
    throw error;
  }
};

/**
 * Obtener todos los puestos
 */
export const getPuestos = async () => {
  try {
    const response = await axios.get(`${API_URL}/puestos`, axiosConfig);
    return response.data;
  } catch (error) {
    console.error('Error al obtener puestos:', error);
    throw error;
  }
};
