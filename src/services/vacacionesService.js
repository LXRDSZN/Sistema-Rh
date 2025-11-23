/**
 * Servicio de Vacaciones
 * Maneja todas las solicitudes relacionadas con vacaciones
 */

const API_URL = 'http://localhost:5000/api';

/**
 * Obtener datos del empleado autenticado
 */
export const getEmpleadoActual = async () => {
  try {
    const response = await fetch(`${API_URL}/vacaciones/empleado-actual`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });



    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error response:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Datos recibidos:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error en getEmpleadoActual:', error);
    throw error;
  }
};

/**
 * Obtener datos de vacaciones del empleado
 */
export const getVacacionesEmpleado = async (empleadoId) => {
  try {
    const response = await fetch(`${API_URL}/vacaciones/${empleadoId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('❌ Error en getVacacionesEmpleado:', error);
    throw error;
  }
};

/**
 * Crear nueva solicitud de vacaciones
 */
export const crearSolicitudVacaciones = async (solicitud, archivo = null) => {
  try {
    const formData = new FormData();

    // Agregar campos según tu BD
    formData.append('persona_id', solicitud.persona_id);
    formData.append('dias_solicitados', solicitud.dias_solicitados);
    formData.append('descripcion', solicitud.descripcion);
    formData.append('fecha_inicio', solicitud.fecha_inicio);
    formData.append('fecha_fin', solicitud.fecha_fin);
    formData.append('dias_array', JSON.stringify(solicitud.selectedDates));

    if (archivo) {
      formData.append('archivo', archivo);
    }

    const response = await fetch(`${API_URL}/vacaciones/solicitud`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error en solicitud:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Solicitud creada:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error en crearSolicitudVacaciones:', error);
    throw error;
  }
};

/**
 * Obtener solicitudes del empleado
 */
export const getSolicitudesVacaciones = async (empleadoId) => {
  try {
    const response = await fetch(`${API_URL}/vacaciones/solicitudes/${empleadoId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Error en getSolicitudesVacaciones:', error);
    throw error;
  }
};

/**
 * Obtener TODAS las solicitudes de vacaciones (Admin/Jefe RH)
 */
export const getAllSolicitudesVacaciones = async () => {
  try {
    const response = await fetch(`${API_URL}/vacaciones/solicitudes/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Error en getAllSolicitudesVacaciones:', error);
    throw error;
  }
};

/**
 * Obtener solicitudes de vacaciones por área (Jefe de Área)
 */
export const getSolicitudesVacacionesByArea = async (areaId) => {
  try {
    const response = await fetch(`${API_URL}/vacaciones/solicitudes/area/${areaId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Error en getSolicitudesVacacionesByArea:', error);
    throw error;
  }
};

/**
 * Obtener todos las solicitudes (para administradores/RH)
 */
export const todasLasSolicitudes = async () => {
  try {
    const response = await fetch(`${API_URL}/vacaciones/todas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Todas las solicitudes recibidas:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error en todasLasSolicitudes:', error);
    throw error;
  }
};

/**
 * Aprobar solicitud de vacaciones
 */
export const aprobarSolicitud = async (solicitudId) => {
  try {

    const response = await fetch(`${API_URL}/vacaciones/aprobar/${solicitudId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error al aprobar:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Solicitud aprobada:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error en aprobarSolicitud:', error);
    throw error;
  }
};

/**
 * Rechazar solicitud de vacaciones
 */
export const rechazarSolicitud = async (solicitudId) => {
  try {
    console.log('📤 Rechazando solicitud:', solicitudId);

    const response = await fetch(`${API_URL}/vacaciones/rechazar/${solicitudId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error al rechazar:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Solicitud rechazada:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error en rechazarSolicitud:', error);
    throw error;
  }
};

/**
 * Cancelar solicitud de vacaciones
 */
export const cancelarSolicitud = async (solicitudId) => {
  try {
    console.log('📤 Cancelando solicitud:', solicitudId);

    const response = await fetch(`${API_URL}/vacaciones/cancelar/${solicitudId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error al cancelar:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Solicitud cancelada:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error en cancelarSolicitud:', error);
    throw error;
  }
};

/**
 * Obtener días de una solicitud específica
 */
export const getDiasSolicitud = async (solicitudId) => {
  try {
    const response = await fetch(`${API_URL}/vacaciones/dias/${solicitudId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Días de solicitud recibidos:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error en getDiasSolicitud:', error);
    throw error;
  }
};

/**
 * Eliminar solicitud de vacaciones
 */
export const eliminarSolicitud = async (solicitudId) => {
  try {
    console.log('📤 Eliminando solicitud:', solicitudId);

    const response = await fetch(`${API_URL}/vacaciones/eliminar/${solicitudId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error al eliminar:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Solicitud eliminada:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error en eliminarSolicitud:', error);
    throw error;
  }
};