import express from 'express';
import * as vacacionesController from '../controllers/vacaciones.controllers.js';
import { verificarToken } from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(verificarToken);

// Obtener empleado actual
router.get('/empleado-actual', vacacionesController.getEmpleadoActual);

// RUTAS ESPECÍFICAS PRIMERO (sin parámetros dinámicos)
// Obtener todas las solicitudes (para Admin/Jefe RH)
router.get('/solicitudes/all', vacacionesController.getAllSolicitudesVacaciones);

// Obtener solicitudes por área (para Jefe de Área)
router.get('/solicitudes/area/:areaId', vacacionesController.getSolicitudesVacacionesByArea);

// Obtener días de una solicitud
router.get('/dias/:solicitudId', vacacionesController.getDiasSolicitud);

// RUTAS CON PARÁMETROS DINÁMICOS AL FINAL
// Obtener solicitudes del empleado
router.get('/solicitudes/:empleadoId', vacacionesController.getSolicitudesVacaciones);

// Obtener vacaciones del empleado
router.get('/:empleadoId', vacacionesController.getVacacionesEmpleado);

// Crear solicitud de vacaciones
router.post('/solicitud', upload.single('archivo'), vacacionesController.crearSolicitudVacaciones);

// Aprobar solicitud
router.put('/aprobar/:solicitudId', vacacionesController.aprobarSolicitud);

// Rechazar solicitud
router.put('/rechazar/:solicitudId', vacacionesController.rechazarSolicitud);

// Cancelar solicitud
router.put('/cancelar/:solicitudId', vacacionesController.cancelarSolicitud);

// Eliminar solicitud
router.delete('/eliminar/:solicitudId', vacacionesController.eliminarSolicitud);

export default router;