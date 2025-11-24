// src/composables/useDocumentosPersona.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const useDocumentosPersona = () => {
  /**
   * Asocia un archivo (PDF, reglamento, etc.) a una persona
   * creando un registro en documento_persona.
   */
  const asociarDocumentoPersona = async ({ personaId, documentoTipoId, archivoId }) => {
    const { data } = await axios.post(
      `${API_URL}/personas/${personaId}/documentos`,
      {
        documentoTipoId,
        archivoId
      },
      {
        withCredentials: true // porque usas verificarToken
      }
    );

    return data; // { ok: true, mensaje: 'Documento asociado...' }
  };

  const eliminarDocumentoPersona = async (personaId, documentoPersonaId) => {
    console.log(
      '[useDocumentosPersona] DELETE ->',
      `${API_URL}/personas/${personaId}/documentos/${documentoPersonaId}`
    );

    const { data } = await axios.delete(
      `${API_URL}/personas/${personaId}/documentos/${documentoPersonaId}`,
      { withCredentials: true }
    );

    console.log('[useDocumentosPersona] Respuesta eliminarDocumentoPersona:', data);
    return data;
  };

  return {
    asociarDocumentoPersona,
    eliminarDocumentoPersona
  };
};
