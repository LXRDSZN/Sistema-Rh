import express from 'express';
import { 
  getDashboardStats,
  getEmpleadosPorArea,
  getDemografia,
  getEmpleadosSinCorreo
} from '../controllers/dashboard.controllers.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * RUTAS DE DASHBOARD
 * Todas las rutas requieren autenticación
 */

// GET - Obtener estadísticas generales del dashboard
router.get('/dashboard/stats', verificarToken, getDashboardStats);

// GET - Obtener empleados por área
router.get('/dashboard/empleados-por-area', verificarToken, getEmpleadosPorArea);

// GET - Obtener demografía (edad y género)
router.get('/dashboard/demografia', verificarToken, getDemografia);

// GET - Obtener empleados con contratos activos sin correo
router.get('/dashboard/empleados-sin-correo', verificarToken, getEmpleadosSinCorreo);

export default router;
