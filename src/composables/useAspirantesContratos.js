// composables/useAspirantesContratos.js
import axios from 'axios';

// Si ya usas una variable de entorno, puedes cambiar esto a import.meta.env.VITE_API_URL
const API_URL = 'http://localhost:5000/api';

export const useAspirantesContratos = () => {
  /**
   * Obtiene todos los datos personales del aspirante
   * para:
   *  - Encabezado de AspiranteInfo.vue
   *  - DatosPersonalesTab.vue
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
   * Obtiene la URL del CV del aspirante
   * (para el botón de “Ver CV” en AspiranteInfo.vue)
   */
  const obtenerCvAspirante = async (personaId) => {
    try {
      const response = await axios.get(
        `${API_URL}/aspirantes/${personaId}/cv`
      );
      return response.data.cvUrl; // string con la URL del PDF
    } catch (error) {
      // Si no tiene CV, el backend manda 404; aquí puedes regresar null
      if (error.response && error.response.status === 404) {
        return null;
      }
      console.error('Error al obtener CV del aspirante:', error);
      throw error;
    }
  };

  return {
    obtenerDatosPersonalesAspirante,
    obtenerCvAspirante
  };
};
