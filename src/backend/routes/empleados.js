import express from 'express';
import { 
  getAllEmpleados,
  getEmpleadoById,
  updateEmpleadoAsignacion,
  getAllAreas,
  getAllPuestos
} from '../controllers/empleados.controllers.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * RUTAS DE EMPLEADOS
 * Todas las rutas requieren autenticación
 */

// GET - Obtener todos los empleados
router.get('/empleados', verificarToken, getAllEmpleados);

// GET - Obtener un empleado por ID
router.get('/empleados/:id', verificarToken, getEmpleadoById);

// PUT - Actualizar asignación de empleado (área y puesto)
router.put('/empleados/:id/asignacion', verificarToken, updateEmpleadoAsignacion);

// GET - Obtener todas las áreas
router.get('/areas', verificarToken, getAllAreas);

// GET - Obtener todos los puestos
router.get('/puestos', verificarToken, getAllPuestos);

export default router;
