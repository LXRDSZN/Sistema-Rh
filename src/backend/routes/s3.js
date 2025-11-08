import express from 'express';
import { s3 } from '../aws/s3Client.js';
import { ListBucketsCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import config from '../config/config.js';
import pool from '../models/db.js';

const router = express.Router();

// Listar buckets de S3
router.get('/s3-buckets', async (req, res) => {
  try {
    const result = await s3.send(new ListBucketsCommand({}));
    res.json({ buckets: result.Buckets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Configura multer para manejar archivos
const upload = multer({ storage: multer.memoryStorage() });

// Ruta POST para subir archivo a S3 y registrar en la base de datos
router.post('/upload-file', upload.single('archivo'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No se encontró ningún archivo' });
    }

    // Subir archivo a S3
    const uploadParams = {
      Bucket: config.aws.bucket,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3.send(new PutObjectCommand(uploadParams));

    // Construir la URL completa del archivo en S3
    const fileUrl = `https://s3.amazonaws.com/${config.aws.bucket}/${file.originalname}`;

    // Insertar registro en la tabla 'archivo' de PostgreSQL
    const query = `
      INSERT INTO archivo (nombre, tipo_mime, tamano_bytes, storage_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [
      file.originalname,      // nombre
      file.mimetype,          // tipo_mime
      file.size,              // tamano_bytes
      fileUrl                 // storage_url
    ];

    const result = await pool.query(query, values);

    res.json({
      ok: true,
      mensaje: 'Archivo subido correctamente a S3 y registrado en la base de datos',
      archivo: result.rows[0]
    });

  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;
