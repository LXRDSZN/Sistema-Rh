import express from 'express';
import { 
  getDashboardStats,
  getEmpleadosPorArea,
  getDemografia
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

export default router;
