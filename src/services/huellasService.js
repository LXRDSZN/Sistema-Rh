import axios from 'axios';

/**
 * SERVICIO DE API - Huellas Dactilares
 * 
 * Centraliza las llamadas HTTP al ESP32 AS608 y al backend
 */

const API_URL = 'http://localhost:5000/api';

// Configuración de axios con credenciales
const axiosConfig = {
  withCredentials: true
};

/**
 * Obtener listado completo de contratos
 */
export const getContratos = async () => {
  try {
    const response = await axios.get(`${API_URL}/contratos/listado`, axiosConfig);
    return response.data;
  } catch (error) {
    console.error('Error al obtener contratos:', error);
    throw error;
  }
};

/**
 * Actualizar huella_id de un contrato
 */
export const updateHuellaId = async (contratoId, huellaId) => {
  try {
    const response = await axios.patch(
      `${API_URL}/contratos/${contratoId}/huella`, 
      { huella_id: huellaId },
      axiosConfig
    );
    return response.data;
  } catch (error) {
    console.error('Error al actualizar huella_id:', error);
    throw error;
  }
};

/**
 * Obtener estado del sensor ESP32
 */
export const getESP32Status = async (esp32Ip) => {
  try {
    const response = await axios.get(`http://${esp32Ip}/api/status`, {
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener estado del ESP32:', error);
    throw error;
  }
};

/**
 * Iniciar proceso de enrolado en el sensor
 */
export const enrollFingerprint = async (esp32Ip) => {
  try {
    const response = await axios.post(`http://${esp32Ip}/api/enroll`, {}, {
      timeout: 60000 // 60 segundos timeout para el proceso de enrolado
    });
    return response.data;
  } catch (error) {
    console.error('Error al enrolar huella:', error);
    throw error;
  }
};

/**
 * Eliminar huella del sensor
 */
export const deleteFingerprint = async (esp32Ip, fingerprintId) => {
  try {
    const formData = new FormData();
    formData.append('id', fingerprintId);
    
    const response = await axios.post(`http://${esp32Ip}/api/delete`, formData, {
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar huella:', error);
    throw error;
  }
};

/**
 * Alternar escaneo automático del sensor
 */
export const toggleScan = async (esp32Ip) => {
  try {
    const response = await axios.post(`http://${esp32Ip}/api/scan`, {}, {
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    console.error('Error al alternar escaneo:', error);
    throw error;
  }
};

/**
 * Limpiar todas las huellas del sensor
 */
export const clearAllFingerprints = async (esp32Ip) => {
  try {
    const response = await axios.post(`http://${esp32Ip}/api/clear`, {}, {
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error('Error al limpiar huellas:', error);
    throw error;
  }
};
