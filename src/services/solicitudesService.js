/**
 * SERVICIO DE SOLICITUDES
 * 
 * Gestiona la comunicación entre el formulario de solicitudes
 * y el backend para crear aspirantes y registrar solicitudes
 */

const getAPIURL = () => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseURL}/api/solicitudes`;
};

const API_URL = getAPIURL();

/**
 * Crear una nueva solicitud de empleo
 * @param {Object} formulario - Datos del formulario
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const crearSolicitud = async (formulario) => {
  try {
    const response = await fetch(`${API_URL}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        nombres: formulario.nombres,
        apellidoPaterno: formulario.apellidoPaterno,
        apellidoMaterno: formulario.apellidoMaterno,
        curp: formulario.curp,
        rfc: formulario.rfc,
        nss: formulario.nss,
        fechaNacimiento: formulario.fechaNacimiento,
        sexoId: formulario.sexoId,
        estadoCivilId: formulario.estadoCivilId,
        nacionalidadId: formulario.nacionalidadId,
        fotoUrl: formulario.fotoUrl,
        telefonoCelular: formulario.telefonoCelular,
        correoElectronico: formulario.correoElectronico,
        domicilio: formulario.domicilio,
        formacionesAcademicas: formulario.formacionesAcademicas,
        experienciasLaborales: formulario.experienciasLaborales,
        areaId: formulario.areaId,
        puestoId: formulario.puestoId,
        jornadaId: formulario.jornadaId,
        tipoContrato: formulario.tipoContrato,
        modalidad: formulario.modalidad,
        pretensionSalarial: formulario.pretensionSalarial,
        fechaDisponible: formulario.fechaDisponible,
        documentos: formulario.documentos || []
      })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error al crear solicitud:', error);
    throw error;
  }
};

/**
 * Subir archivo a AWS S3
 * @param {File} archivo - Archivo a subir
 * @param {string} tipoDocumento - Tipo de documento (curp, ine, domicilio, cv, etc)
 * @returns {Promise<Object>} - URL del archivo subido
 */
export const subirArchivo = async (archivo, tipoDocumento = 'documento') => {
  try {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('nombreArchivo', archivo.name);
    formData.append('tipoDocumento', tipoDocumento);

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error al subir archivo:', error);
    throw error;
  }
};
/**
 * Obtener catálogos (sexos, áreas, puestos, etc)
 * @returns {Promise<Object>} - Catálogos disponibles
 */
export const obtenerCatalogos = async () => {
  try {
    const response = await fetch(`${API_URL}/catalogos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error al obtener catálogos:', error);
    throw error;
  }
};

/**
 * Obtener todas las solicitudes
 * @returns {Promise<Object>} - Lista de solicitudes
 */
export const obtenerSolicitudes = async () => {
  try {
    const response = await fetch(`${API_URL}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    throw error;
  }
};
