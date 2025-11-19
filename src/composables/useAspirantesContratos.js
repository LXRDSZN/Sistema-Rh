// src/composables/useAspirantesContratos.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const useAspirantesContratos = () => {
  /**
   * Datos personales (los que ya usas para AspiranteInfo y DatosPersonalesTab)
   */
  const obtenerDatosPersonalesAspirante = async (personaId) => {
    try {
      const response = await axios.get(
        `${API_URL}/aspirantes/${personaId}/datos-personales`
      );
      return response.data.aspirante;
    } catch (error) {
      console.error('Error al obtener datos personales del aspirante:', error);
      throw error;
    }
  };

  /**
   * URL del CV
   */
  const obtenerCvAspirante = async (personaId) => {
    try {
      const response = await axios.get(
        `${API_URL}/aspirantes/${personaId}/cv`
      );
      return response.data.cvUrl;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      console.error('Error al obtener CV del aspirante:', error);
      throw error;
    }
  };

  /**
   * Aspiración laboral del aspirante (primer contrato)
   * - area_id, puesto_id, tipo_contrato, modalidad, fecha_disponible, jornada_id
   */
  const obtenerAspiracionLaboralAspirante = async (personaId) => {
    try {
      const response = await axios.get(
        `${API_URL}/aspirantes/${personaId}/aspiracion-laboral`
      );
      return response.data.aspiracion;
    } catch (error) {
      console.error('Error al obtener aspiración laboral del aspirante:', error);
      return null; // solo LOG, no truena la pantalla
    }
  };

  return {
    obtenerDatosPersonalesAspirante,
    obtenerCvAspirante,
    obtenerAspiracionLaboralAspirante
  };
};
