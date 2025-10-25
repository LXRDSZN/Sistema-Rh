import { ref } from 'vue';
import * as asistenciasService from '@/services/asistenciasService';

/**
 * COMPOSABLE DE ASISTENCIAS
 * 
 * Maneja el estado y la lógica de negocio del módulo de asistencias
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
      tiposIncidencia.value = response.data;
      return response;
    } catch (err) {
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
      const response = await asistenciasService.getReporteAsistencias(filtros);
      reporteAsistencias.value = response.data;
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar reporte de asistencias';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
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
      const response = await asistenciasService.getReporteAnalitico(filtros);
      reporteAnalitico.value = response.data;
      return response;
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
    registrarAsistencia
  };
}
