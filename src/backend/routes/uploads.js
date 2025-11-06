import express from 'express';
import multer from 'multer';
import { uploadFile, getArchivoInfo, deleteArchivo } from '../controllers/uploads.controller.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configurar multer para archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

/**
 * POST /api/upload - Subir archivo
 * Requiere autenticación
 */
router.post('/upload', verificarToken, upload.single('archivo'), uploadFile);

/**
 * GET /api/archivo/:id - Obtener información del archivo
 * Requiere autenticación
 */
router.get('/archivo/:id', verificarToken, getArchivoInfo);

/**
 * DELETE /api/archivo/:id - Eliminar archivo
 * Requiere autenticación
 */
router.delete('/archivo/:id', verificarToken, deleteArchivo);

export default router;
