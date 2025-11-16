import express from 'express';
import { 
  getDashboardAsistencias,
  getJustificantes,
  createJustificante,
  getTiposIncidencia,
  getReporteAsistencias,
  getDetalleAsistencias,
  getVisitas,
  getReporteAnalitico,
  registrarAsistencia,
  crearVisita,
  actualizarVisita,
  inicializarTiposIncidencia
} from '../controllers/asistencias.controllers.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * RUTAS DE ASISTENCIAS
 * Todas las rutas requieren autenticación
 */

// Dashboard - Estadísticas generales
router.get('/asistencias/dashboard', verificarToken, getDashboardAsistencias);

// Justificantes
router.get('/asistencias/justificantes', verificarToken, getJustificantes);
router.post('/asistencias/justificantes', verificarToken, createJustificante);
router.get('/asistencias/tipos-incidencia', verificarToken, getTiposIncidencia);

// Reportes
router.get('/asistencias/reporte', verificarToken, getReporteAsistencias);
router.get('/asistencias/reporte/detalle', verificarToken, getDetalleAsistencias);
router.get('/asistencias/reporte/analitico', verificarToken, getReporteAnalitico);

// Visitas
router.get('/asistencias/visitas', verificarToken, getVisitas);
router.post('/asistencias/visitas', verificarToken, crearVisita);
router.put('/asistencias/visitas/:id', verificarToken, actualizarVisita);

// Registro de asistencia (entrada/salida)
router.post('/asistencias/registrar', verificarToken, registrarAsistencia);

// TODO: ELIMINAR EN PRODUCCIÓN - Endpoint temporal para inicializar tipos de incidencia (comentado)
// router.post('/asistencias/init-tipos-incidencia', inicializarTiposIncidencia);

export default router;
