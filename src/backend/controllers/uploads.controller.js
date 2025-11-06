import { db } from '../models/db.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * CONTROLADOR DE SUBIDA DE ARCHIVOS
 * 
 * Maneja la validación, almacenamiento y registro de archivos
 */

// Tipos MIME permitidos
const ALLOWED_MIMES = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
};

// Tamaño máximo en bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Directorio de almacenamiento
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

/**
 * Ensure upload directory exists
 */
const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    console.log('✅ Directorio de uploads creado:', UPLOAD_DIR);
  }
};

/**
 * Generate unique filename
 */
const generateFilename = (originalName) => {
  const extension = path.extname(originalName).toLowerCase();
  const basename = path.basename(originalName, extension);
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${basename}-${timestamp}-${randomStr}${extension}`;
};

/**
 * Validate file
 */
const validateFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No se proporcionó archivo' };
  }

  if (!ALLOWED_MIMES[file.mimetype]) {
    return { 
      valid: false, 
      error: `Tipo de archivo no permitido. Permitidos: PDF, JPG, PNG, DOC, DOCX` 
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `El archivo excede el tamaño máximo de 5MB` 
    };
  }

  return { valid: true };
};

/**
 * POST /api/upload - Subir archivo
 */
export const uploadFile = async (req, res) => {
  try {
    ensureUploadDir();

    // Validar que haya un archivo
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó archivo'
      });
    }

    // Validar archivo
    const validation = validateFile(req.file);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    // Generar nombre único
    const filename = generateFilename(req.file.originalname);
    const filepath = path.join(UPLOAD_DIR, filename);

    // Guardar archivo en disco
    fs.writeFileSync(filepath, req.file.buffer);

    // Registrar en base de datos
    const fileId = uuidv4();
    const storageUrl = `/uploads/${filename}`;

    const result = await db.query(
      `INSERT INTO archivo (id, nombre, tipo_mime, tamano_bytes, storage_url, version, creado_en)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, nombre, tipo_mime, tamano_bytes, storage_url, creado_en`,
      [
        fileId,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        storageUrl,
        1
      ]
    );

    const archivo = result.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Archivo subido correctamente',
      data: {
        id: archivo.id,
        nombre: archivo.nombre,
        tipo_mime: archivo.tipo_mime,
        tamano_bytes: archivo.tamano_bytes,
        storage_url: archivo.storage_url,
        creado_en: archivo.creado_en
      }
    });

  } catch (error) {
    console.error('Error al subir archivo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al subir archivo',
      error: error.message
    });
  }
};

/**
 * GET /api/archivo/:id - Obtener información del archivo
 */
export const getArchivoInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT id, nombre, tipo_mime, tamano_bytes, storage_url, creado_en 
       FROM archivo 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    const archivo = result.rows[0];

    return res.json({
      success: true,
      data: archivo
    });

  } catch (error) {
    console.error('Error al obtener información del archivo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener información del archivo',
      error: error.message
    });
  }
};

/**
 * DELETE /api/archivo/:id - Eliminar archivo
 */
export const deleteArchivo = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener información del archivo
    const result = await db.query(
      `SELECT storage_url FROM archivo WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    const archivo = result.rows[0];
    const filepath = path.join(UPLOAD_DIR, path.basename(archivo.storage_url));

    // Eliminar archivo del disco
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    // Eliminar registro de la base de datos
    await db.query(
      `DELETE FROM archivo WHERE id = $1`,
      [id]
    );

    return res.json({
      success: true,
      message: 'Archivo eliminado correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar archivo',
      error: error.message
    });
  }
};
