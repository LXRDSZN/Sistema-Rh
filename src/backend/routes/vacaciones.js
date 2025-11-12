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

// Obtener vacaciones del empleado
router.get('/:empleadoId', vacacionesController.getVacacionesEmpleado);

// Obtener todas las solicitudes (para RH/Admin)
router.get('/admin/todas', vacacionesController.todasLasSolicitudes);

// Obtener solicitudes del empleado
router.get('/solicitudes/:empleadoId', vacacionesController.getSolicitudesVacaciones);

// Obtener días de una solicitud
router.get('/dias/:solicitudId', vacacionesController.getDiasSolicitud);

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