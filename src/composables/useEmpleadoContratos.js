// src/composables/useEmpleadoContratos.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const useEmpleadoContratos = () => {
  // 🔹 Obtener datos para llenar el formulario de renovación
  const obtenerDatosRenovacionEmpleado = async (personaId) => {
    const { data } = await axios.get(
      `${API_URL}/contratos/empleado/${personaId}/datos-renovacion`
    );
    return data.datos; // <-- lo que usamos para precargar el form
  };

  // 🔹 Enviar renovación al backend
  const renovarContratoEmpleado = async (payload) => {
    const { data } = await axios.post(
      `${API_URL}/contratos/empleado/renovar`,
      payload
      // si tu backend NO usa cookies/token, déjalo así
      // si sí usa cookie de sesión, aquí iría: { withCredentials: true }
    );
    return data;
  };

  return {
    obtenerDatosRenovacionEmpleado,
    renovarContratoEmpleado,
  };
};
