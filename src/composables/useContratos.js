import axios from 'axios';

// ✅ Usar la variable de entorno correctamente
const API_URL = 'http://localhost:5000/api';

export const useContratos = () => {
    /**
     * Obtiene las estadísticas del dashboard
     */
    const obtenerEstadisticas = async () => {
        try {
            const response = await axios.get(`${API_URL}/contratos/stats`);
            return response.data.stats;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    };

    /**
     * Obtiene los empleados destacados (últimos 3)
     */
    const obtenerEmpleadosDestacados = async () => {
        try {
            const response = await axios.get(`${API_URL}/contratos/empleados-destacados`);
            return response.data.empleados;
        } catch (error) {
            console.error('Error al obtener empleados:', error);
            throw error;
        }
    };

    /**
     * Obtiene los aspirantes destacados (últimos 3)
     */
    const obtenerAspirantesDestacados = async () => {
        try {
            const response = await axios.get(`${API_URL}/contratos/aspirantes-destacados`);
            return response.data.aspirantes;
        } catch (error) {
            console.error('Error al obtener aspirantes:', error);
            throw error;
        }
    };

    /**
     * Obtiene contratos filtrados por estado
     * @param {string} estado - 'activo', 'avencer', 'vencido', 'proceso'
     */
    const obtenerContratosPorEstado = async (estado) => {
        try {
            const response = await axios.get(`${API_URL}/contratos/por-estado`, {
                params: { estado }
            });
            return response.data.contratos;
        } catch (error) {
            console.error('Error al obtener contratos:', error);
            throw error;
        }
    };

    return {
        obtenerEstadisticas,
        obtenerEmpleadosDestacados,
        obtenerAspirantesDestacados,
        obtenerContratosPorEstado
    };
};