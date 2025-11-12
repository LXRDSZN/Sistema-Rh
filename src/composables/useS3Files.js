import axios from 'axios';

// Usar la variable de entorno o fallback al puerto 5000
const API_URL = 'http://localhost:5000/api';

export const useS3Files = () => {
    /**
     * Sube un archivo a S3 y lo registra en la base de datos
     * @param {File} file - Archivo a subir
     * @returns {Promise<Object>} - Respuesta con información del archivo
     */
    const subirArchivo = async (file) => {
        try {
            const formData = new FormData();
            formData.append('archivo', file);

            const response = await axios.post(`${API_URL}/upload-file`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al subir archivo:', error);
            throw error;
        }
    };

    /**
     * Obtiene todos los archivos registrados en la BD
     * @returns {Promise<Array>} - Lista de archivos
     */
    const obtenerArchivos = async () => {
        try {
            const response = await axios.get(`${API_URL}/archivos`);
            return response.data.archivos;
        } catch (error) {
            console.error('Error al obtener archivos:', error);
            throw error;
        }
    };

    /**
     * Obtiene un archivo por su ID (UUID)
     * @param {string} id - ID del archivo (UUID)
     * @returns {Promise<Object>} - Información del archivo
     */
    const obtenerArchivoPorId = async (id) => {
        try {
            const response = await axios.get(`${API_URL}/archivo/${id}`);
            return response.data.archivo;
        } catch (error) {
            console.error('Error al obtener archivo:', error);
            throw error;
        }
    };

    /**
     * Elimina un archivo de S3 y de la base de datos
     * @param {string} id - ID del archivo a eliminar (UUID)
     * @returns {Promise<Object>} - Confirmación de eliminación
     */
    const eliminarArchivo = async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/delete-file/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar archivo:', error);
            throw error;
        }
    };

    /**
     * Actualiza un archivo existente (nueva versión)
     * @param {string} id - ID del archivo a actualizar (UUID)
     * @param {File} file - Nuevo archivo
     * @returns {Promise<Object>} - Archivo actualizado
     */
    const actualizarArchivo = async (id, file) => {
        try {
            const formData = new FormData();
            formData.append('archivo', file);

            const response = await axios.put(`${API_URL}/update-file/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al actualizar archivo:', error);
            throw error;
        }
    };

    /**
     * Obtiene una URL firmada (válida por 1 hora) para acceder a un archivo
     * @param {string} fileName - Nombre del archivo en S3
     * @returns {Promise<string>} - URL firmada del archivo
     */
    const obtenerUrlFirmada = async (fileName) => {
        try {
            const response = await axios.get(`${API_URL}/get-file/${fileName}`);
            return response.data.url;
        } catch (error) {
            console.error('Error al obtener URL firmada:', error);
            throw error;
        }
    };

    /**
     * Descarga un archivo directamente desde el servidor
     * @param {string} fileName - Nombre del archivo en S3
     */
    const descargarArchivo = async (fileName) => {
        try {
            const url = `${API_URL}/download-file/${fileName}`;
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error al descargar archivo:', error);
            throw error;
        }
    };

    /**
     * Lista archivos en el bucket de S3
     * @param {string} prefix - Prefijo opcional para filtrar por carpeta
     * @returns {Promise<Array>} - Lista de archivos en S3
     */
    const listarArchivosS3 = async (prefix = '') => {
        try {
            const response = await axios.get(`${API_URL}/list-files`, {
                params: { prefix }
            });
            return response.data.archivos;
        } catch (error) {
            console.error('Error al listar archivos S3:', error);
            throw error;
        }
    };

    /**
     * Lista todos los buckets de S3
     * @returns {Promise<Array>} - Lista de buckets
     */
    const listarBuckets = async () => {
        try {
            const response = await axios.get(`${API_URL}/s3-buckets`);
            return response.data.buckets;
        } catch (error) {
            console.error('Error al listar buckets:', error);
            throw error;
        }
    };

    return {
        subirArchivo,
        obtenerArchivos,
        obtenerArchivoPorId,
        eliminarArchivo,
        actualizarArchivo,
        obtenerUrlFirmada,
        descargarArchivo,
        listarArchivosS3,
        listarBuckets
    };
};
