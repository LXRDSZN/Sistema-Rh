import { ref } from 'vue';
import * as asistenciasService from '@/services/asistenciasService';

/**
 * COMPOSABLE DE ASISTENCIAS
 * 
 * Maneja el estado y la lógica de negocio del módulo de asistencias
 * 
 * TABLAS DE BASE DE DATOS UTILIZADAS:
 * - estado_asistencia: Códigos A, R, F, P, V, I (Asistencia, Retardo, Falta, Permiso, Vacaciones, Incidencia)
 * - registro_asistencias: Registro diario de entrada/salida de empleados
 * - justificantes: Gestión de justificaciones de incidencias
 * - visitas: Registro de visitantes con nuevos campos (cargo_rol, motivo_visita, etc.)
 * - horario_empleado: Horarios programados por día de semana (reemplaza tabla 'turno')
 * - tipo_incidencia: Catálogo de tipos de incidencias
 * - estado_incidencia: Estados de las incidencias
 */

export function useAsistencias() {
  // Estado
  const loading = ref(false);
  const error = ref(null);

  // Dashboard
  const dashboardData = ref(null);
  
  // Justificantes
  const justificantes = ref([]);
  const tiposIncidencia = ref([]);
  
  // Reportes
  const reporteAsistencias = ref(null);
  const detalleAsistencias = ref([]);
  const reporteAnalitico = ref(null);
  
  // Visitas
  const visitas = ref([]);

  /**
   * Cargar datos del dashboard
   */
  const cargarDashboard = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await asistenciasService.getDashboardAsistencias();
      dashboardData.value = response.data;
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar dashboard';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Cargar justificantes con filtros opcionales
   */
  const cargarJustificantes = async (filtros = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await asistenciasService.getJustificantes(filtros);
      justificantes.value = response.data;
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar justificantes';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Crear nuevo justificante
   */
  const crearJustificante = async (datos) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await asistenciasService.createJustificante(datos);
      // Recargar la lista después de crear
      await cargarJustificantes();
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al crear justificante';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Cargar tipos de incidencia
   */
  const cargarTiposIncidencia = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await asistenciasService.getTiposIncidencia();
      console.log('🔵 COMPOSABLE - Respuesta completa:', response);
      console.log('🔵 COMPOSABLE - response.data:', response.data);
      tiposIncidencia.value = response.data;
      console.log('🔵 COMPOSABLE - tiposIncidencia.value asignado:', tiposIncidencia.value);
      return response;
    } catch (err) {
      console.error('❌ COMPOSABLE - Error:', err);
      error.value = err.response?.data?.message || 'Error al cargar tipos de incidencia';
      throw err;
    } finally {
      loading.value = false;
    }
  };

/**
 * Cargar reporte de asistencias
 */
  const cargarReporteAsistencias = async (filtros = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      console.log('📡 [useAsistencias] Llamando getReporteAsistencias con filtros:', filtros);
      const response = await asistenciasService.getReporteAsistencias(filtros);
      console.log('📡 [useAsistencias] Respuesta completa del servicio:', response);
      console.log('📡 [useAsistencias] response.data:', response.data);
      // El backend retorna { success: true, data: { resumenAreas: [], periodo: '' } }
      // El servicio retorna response.data, así que necesitamos acceder a .data
      reporteAsistencias.value = response.data || response;
      console.log('📡 [useAsistencias] reporteAsistencias.value asignado:', reporteAsistencias.value);
      return response;
    } catch (err) {
      console.error('❌ [useAsistencias] Error:', err);
      error.value = err.response?.data?.message || 'Error al cargar reporte de asistencias';
      throw err;
    } finally {
      loading.value = false;
    }
  };  /**
   * Cargar detalle de asistencias
   */
  const cargarDetalleAsistencias = async (filtros) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await asistenciasService.getDetalleAsistencias(filtros);
      detalleAsistencias.value = response.data;
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar detalle de asistencias';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Cargar reporte analítico
   */
  const cargarReporteAnalitico = async (filtros = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      // El servicio YA retorna response.data, así que 'data' es directamente { empleados: [], estadisticas: {} }
      const data = await asistenciasService.getReporteAnalitico(filtros);
      
      // 🔍 LOG: Ver qué estructura retorna el backend
      console.log('📦 Respuesta del backend (cargarReporteAnalitico):', {
        estructura: data ? Object.keys(data) : 'null',
        empleados: data?.empleados?.length || 0,
        estadisticas: data?.estadisticas
      });
      
      reporteAnalitico.value = data;
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar reporte analítico';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Cargar visitas
   */
  const cargarVisitas = async (filtros = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await asistenciasService.getVisitas(filtros);
      visitas.value = response.data;
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar visitas';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Crear nueva visita
   */
  const crearVisita = async (datos) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await asistenciasService.crearVisita(datos);
      // Recargar la lista después de crear
      await cargarVisitas();
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al crear visita';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Actualizar visita (registrar salida)
   */
  const actualizarVisita = async (id, datos) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await asistenciasService.actualizarVisita(id, datos);
      // Recargar la lista después de actualizar
      await cargarVisitas();
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al actualizar visita';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Registrar asistencia
   */
  const registrarAsistencia = async (datos) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await asistenciasService.registrarAsistencia(datos);
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al registrar asistencia';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // Estado
    loading,
    error,
    
    // Datos
    dashboardData,
    justificantes,
    tiposIncidencia,
    reporteAsistencias,
    detalleAsistencias,
    reporteAnalitico,
    visitas,
    
    // Métodos
    cargarDashboard,
    cargarJustificantes,
    crearJustificante,
    cargarTiposIncidencia,
    cargarReporteAsistencias,
    cargarDetalleAsistencias,
    cargarReporteAnalitico,
    cargarVisitas,
    crearVisita,
    actualizarVisita,
    registrarAsistencia
  };
}
