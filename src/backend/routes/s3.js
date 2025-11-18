import express from 'express';
import { s3 } from '../aws/s3Client.js';
import { 
    ListBucketsCommand, 
    PutObjectCommand, 
    GetObjectCommand, 
    DeleteObjectCommand,
    ListObjectsV2Command 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';
import config from '../config/config.js';
import pool from '../models/db.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configura multer para manejar archivos en memoria
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // Límite de 10MB
    }
});

// ========================================
// 1. LISTAR BUCKETS DE S3
// ========================================
router.get('/s3-buckets', async (req, res) => {
    try {
        const result = await s3.send(new ListBucketsCommand({}));
        res.json({ 
            ok: true,
            buckets: result.Buckets 
        });
    } catch (error) {
        console.error('Error al listar buckets:', error);
        res.status(500).json({ 
            ok: false,
            error: error.message 
        });
    }
});

// ========================================
// 2. LISTAR ARCHIVOS EN UN BUCKET
// ========================================
router.get('/list-files', async (req, res) => {
    try {
        const { prefix } = req.query;

        const listParams = {
            Bucket: config.aws.bucket,
            Prefix: prefix || ''
        };

        const result = await s3.send(new ListObjectsV2Command(listParams));

        res.json({
            ok: true,
            archivos: result.Contents || [],
            total: result.KeyCount
        });
    } catch (error) {
        console.error('Error al listar archivos:', error);
        res.status(500).json({ 
            ok: false,
            error: error.message 
        });
    }
});

// ========================================
// 3. SUBIR ARCHIVO A S3 Y REGISTRAR EN BD
// ========================================
router.post('/upload-file', verificarToken, upload.single('archivo'), async (req, res) => {
    try {
        const file = req.file;
        
        if (!file) {
            return res.status(400).json({ 
                ok: false,
                error: 'No se encontró ningún archivo' 
            });
        }

        // Generar nombre único para evitar sobrescribir archivos
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}-${file.originalname}`;

        // Subir archivo a S3
        const uploadParams = {
            Bucket: config.aws.bucket,
            Key: uniqueFileName,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        await s3.send(new PutObjectCommand(uploadParams));

        // Construir la URL completa del archivo en S3
        const fileUrl = `https://${config.aws.bucket}.s3.amazonaws.com/${uniqueFileName}`;

        // Insertar registro en la tabla 'archivo' de PostgreSQL
        const query = `
            INSERT INTO archivo (nombre, tipo_mime, tamano_bytes, storage_url, version)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;

        const values = [
            file.originalname,  // nombre
            file.mimetype,      // tipo_mime
            file.size,          // tamano_bytes
            fileUrl,            // storage_url
            1                   // version (inicialmente 1)
        ];

        const result = await pool.query(query, values);

        res.json({
            ok: true,
            mensaje: 'Archivo subido correctamente a S3 y registrado en la base de datos',
            archivo: result.rows[0]
        });

    } catch (error) {
        console.error('Error al subir archivo:', error);
        res.status(500).json({ 
            ok: false,
            error: error.message 
        });
    }
});

// ========================================
// 4. OBTENER ARCHIVO DE S3 (URL FIRMADA)
// ========================================
router.get('/get-file/:fileName', verificarToken, async (req, res) => {
    try {
        const { fileName } = req.params;

        const getParams = {
            Bucket: config.aws.bucket,
            Key: fileName
        };

        // Generar URL firmada que expira en 1 hora
        const signedUrl = await getSignedUrl(s3, new GetObjectCommand(getParams), {
            expiresIn: 3600 // 1 hora
        });

        res.json({
            ok: true,
            url: signedUrl,
            mensaje: 'URL generada correctamente. Válida por 1 hora.'
        });

    } catch (error) {
        console.error('Error al obtener archivo:', error);
        res.status(500).json({ 
            ok: false,
            error: error.message 
        });
    }
});

// ========================================
// 5. DESCARGAR ARCHIVO DIRECTO
// ========================================
router.get('/download-file/:fileName', async (req, res) => {
    try {
        const { fileName } = req.params;

        const getParams = {
            Bucket: config.aws.bucket,
            Key: fileName
        };

        const command = new GetObjectCommand(getParams);
        const response = await s3.send(command);

        // Configurar headers para descarga
        res.setHeader('Content-Type', response.ContentType);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        
        // Enviar el stream del archivo
        response.Body.pipe(res);

    } catch (error) {
        console.error('Error al descargar archivo:', error);
        res.status(500).json({ 
            ok: false,
            error: error.message 
        });
    }
});

// ========================================
// 6. ELIMINAR ARCHIVO DE S3 Y BD
// ========================================
router.delete('/delete-file/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener información del archivo desde la BD
        const selectQuery = 'SELECT * FROM archivo WHERE id = $1';
        const selectResult = await pool.query(selectQuery, [id]);

        if (selectResult.rows.length === 0) {
            return res.status(404).json({ 
                ok: false,
                error: 'Archivo no encontrado en la base de datos' 
            });
        }

        const archivo = selectResult.rows[0];
        
        // Extraer el nombre del archivo desde la URL
        const fileName = archivo.storage_url.split('/').pop();

        // Eliminar archivo de S3
        const deleteParams = {
            Bucket: config.aws.bucket,
            Key: fileName
        };

        await s3.send(new DeleteObjectCommand(deleteParams));

        // Eliminar registro de la base de datos
        const deleteQuery = 'DELETE FROM archivo WHERE id = $1 RETURNING *';
        const deleteResult = await pool.query(deleteQuery, [id]);

        res.json({
            ok: true,
            mensaje: 'Archivo eliminado correctamente de S3 y la base de datos',
            archivo: deleteResult.rows[0]
        });

    } catch (error) {
        console.error('Error al eliminar archivo:', error);
        res.status(500).json({ 
            ok: false,
            error: error.message 
        });
    }
});

// ========================================
// 7. OBTENER TODOS LOS ARCHIVOS DE LA BD
// ========================================
router.get('/archivos', async (req, res) => {
    try {
        const query = 'SELECT * FROM archivo ORDER BY creado_en DESC';
        const result = await pool.query(query);

        res.json({
            ok: true,
            archivos: result.rows,
            total: result.rows.length
        });

    } catch (error) {
        console.error('Error al obtener archivos:', error);
        res.status(500).json({ 
            ok: false,
            error: error.message 
        });
    }
});

// ========================================
// 8. OBTENER UN ARCHIVO POR ID DE LA BD
// ========================================
router.get('/archivo/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT * FROM archivo WHERE id = $1';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                ok: false,
                error: 'Archivo no encontrado' 
            });
        }

        res.json({
            ok: true,
            archivo: result.rows[0]
        });

    } catch (error) {
        console.error('Error al obtener archivo:', error);
        res.status(500).json({ 
            ok: false,
            error: error.message 
        });
    }
});

// ========================================
// 9. ACTUALIZAR ARCHIVO (VERSIÓN)
// ========================================
router.put('/update-file/:id', upload.single('archivo'), async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ 
                ok: false,
                error: 'No se encontró ningún archivo' 
            });
        }

        // Obtener información del archivo actual
        const selectQuery = 'SELECT * FROM archivo WHERE id = $1';
        const selectResult = await pool.query(selectQuery, [id]);

        if (selectResult.rows.length === 0) {
            return res.status(404).json({ 
                ok: false,
                error: 'Archivo no encontrado' 
            });
        }

        const archivoActual = selectResult.rows[0];

        // Generar nombre único para la nueva versión
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}-${file.originalname}`;

        // Subir nuevo archivo a S3
        const uploadParams = {
            Bucket: config.aws.bucket,
            Key: uniqueFileName,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        await s3.send(new PutObjectCommand(uploadParams));

        // Eliminar archivo anterior de S3
        const oldFileName = archivoActual.storage_url.split('/').pop();
        const deleteParams = {
            Bucket: config.aws.bucket,
            Key: oldFileName
        };
        await s3.send(new DeleteObjectCommand(deleteParams));

        // Construir nueva URL
        const fileUrl = `https://${config.aws.bucket}.s3.amazonaws.com/${uniqueFileName}`;

        // Actualizar registro en la base de datos
        const updateQuery = `
            UPDATE archivo 
            SET nombre = $1, 
                tipo_mime = $2, 
                tamano_bytes = $3, 
                storage_url = $4, 
                version = version + 1
            WHERE id = $5
            RETURNING *;
        `;

        const values = [
            file.originalname,
            file.mimetype,
            file.size,
            fileUrl,
            id
        ];

        const updateResult = await pool.query(updateQuery, values);

        res.json({
            ok: true,
            mensaje: 'Archivo actualizado correctamente',
            archivo: updateResult.rows[0]
        });

    } catch (error) {
        console.error('Error al actualizar archivo:', error);
        res.status(500).json({ 
            ok: false,
            error: error.message 
        });
    }
});

export default router;
