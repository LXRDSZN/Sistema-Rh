import express from 'express';
import {
  getAllIncidencias,
  getIncidenciaById,
  getIncidenciasByPersona,
  createIncidencia,
  updateIncidencia,
  approveIncidencia,
  rejectIncidencia,
  deleteIncidencia,
  getAllTiposIncidencia,
  getAllEstadosIncidencia
} from '../controllers/incidencias.controllers.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * RUTAS DE INCIDENCIAS
 * Todas las rutas requieren autenticación
 */

// GET - Obtener todas las incidencias con filtros opcionales
// Parámetros query: estado_id, tipo_id, persona_id, area_id, fecha_inicio, fecha_fin
router.get('/incidencias', verificarToken, getAllIncidencias);

// GET - Obtener una incidencia específica
router.get('/incidencias/:id', verificarToken, getIncidenciaById);

// GET - Obtener incidencias de un empleado específico
router.get('/personas/:persona_id/incidencias', verificarToken, getIncidenciasByPersona);

// POST - Crear una nueva incidencia
// Body: { persona_id, tipo_id, fecha_inicio, fecha_fin?, descripcion?, archivo_id? }
router.post('/incidencias', verificarToken, createIncidencia);

// PUT - Actualizar una incidencia
// Body: { fecha_fin?, descripcion?, archivo_id?, estado_id? }
router.put('/incidencias/:id', verificarToken, updateIncidencia);

// PATCH - Aprobar una incidencia (cambiar estado a "Aprobada")
router.patch('/incidencias/:id/aprobar', verificarToken, approveIncidencia);

// PATCH - Rechazar una incidencia (cambiar estado a "Rechazada")
// Body: { motivo? }
router.patch('/incidencias/:id/rechazar', verificarToken, rejectIncidencia);

// DELETE - Eliminar una incidencia
router.delete('/incidencias/:id', verificarToken, deleteIncidencia);

// GET - Obtener todos los tipos de incidencias
router.get('/tipos-incidencia', verificarToken, getAllTiposIncidencia);

// GET - Obtener todos los estados de incidencias
router.get('/estados-incidencia', verificarToken, getAllEstadosIncidencia);

export default router;
