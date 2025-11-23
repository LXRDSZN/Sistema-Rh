import express from 'express';
import multer from 'multer';
import {
  crearSolicitud,
  subirArchivo,
  obtenerCatalogos,
  obtenerSolicitudes
} from '../controllers/solicitudes.controllers.js';

const router = express.Router();

// Configurar multer para uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB por archivo
});

/**
 * RUTAS PARA SOLICITUDES DE EMPLEO
 */

// POST - Crear una nueva solicitud
router.post('/', crearSolicitud);

// POST - Subir archivo a S3 (con multer)
router.post('/upload', upload.single('archivo'), subirArchivo);

// GET - Obtener catálogos (sexos, áreas, puestos, etc.)
router.get('/catalogos', obtenerCatalogos);

// GET - Obtener todas las solicitudes
router.get('/', obtenerSolicitudes);

export default router;
