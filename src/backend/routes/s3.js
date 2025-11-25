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
        fileSize: 50 * 1024 * 1024 // 50 MB (aumentado para documentos más grandes)
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
            expiresIn: 604800  // 7 días (máximo permitido por AWS)
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

// ===============================
//  FOTO DEL EMPLEADO EN BASE64
// ===============================
router.get('/empleados/:personaId/foto-base64', verificarToken, async (req, res) => {
  const client = await pool.connect();

  try {
    const { personaId } = req.params;

    // 1) Leer foto_url de la tabla persona
    const result = await client.query(
      `
      SELECT foto_url
      FROM persona
      WHERE id = $1
      `,
      [personaId]
    );

    if (result.rows.length === 0 || !result.rows[0].foto_url) {
      return res.status(404).json({
        ok: false,
        error: 'Empleado sin foto registrada'
      });
    }

    const fotoUrl = result.rows[0].foto_url;

    // 2) Sacar la KEY de S3 a partir de la foto_url
    //    ejemplo: https://bucket.s3.amazonaws.com/solicitudes/foto/xxx.jpg
    let key;
    try {
      const urlObj = new URL(fotoUrl);
      key = urlObj.pathname.slice(1); // quita el "/" inicial
    } catch (e) {
      // fallback muy simple si por alguna razón no es URL válida
      key = fotoUrl.split('/').pop();
    }

    if (!key) {
      throw new Error(`No se pudo determinar key de S3 para foto_url=${fotoUrl}`);
    }

    // 3) Descargar objeto de S3
    const s3Resp = await s3.send(
      new GetObjectCommand({
        Bucket: config.aws.bucket,
        Key: key
      })
    );

    const chunks = [];
    for await (const chunk of s3Resp.Body) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // 4) Armar data URL en base64
    //    si tienes guardado el mime real en BD, úsalo; aquí asumo JPEG
    const mime = 'image/jpeg';
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mime};base64,${base64}`;

    return res.json({
      ok: true,
      fotoDataUrl: dataUrl
    });
  } catch (error) {
    console.error('Error en /empleados/:personaId/foto-base64:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  } finally {
    client.release();
  }
});

/**
 * 3) OBTENER URL FIRMADA DEL CONTRATO ACTUAL DE UN EMPLEADO
 *    Ruta real: GET /api/s3/contrato-actual/:personaId
 */
router.get('/s3/contrato-actual/:personaId', verificarToken, async (req, res) => {
  const { personaId } = req.params;

  try {
    // Buscar el contrato ACTIVO más reciente y su archivo
    const sql = `
      SELECT a.storage_url
      FROM contrato c
      JOIN archivo a ON a.id = c.archivo_id
      WHERE c.persona_id = $1
        AND c.estado_id = (SELECT id FROM estado_contrato WHERE nombre ILIKE 'ACTIVO')
      ORDER BY c.fecha_inicio DESC
      LIMIT 1;
    `;

    const { rows } = await pool.query(sql, [personaId]);

    if (!rows.length || !rows[0].storage_url) {
      return res.status(404).json({
        ok: false,
        error: 'No se encontró contrato activo con PDF para este empleado'
      });
    }

    const storageUrl = rows[0].storage_url;

    // 🔑 Obtener la KEY de S3 a partir de la URL guardada
    let key;
    try {
      const urlObj = new URL(storageUrl);
      key = urlObj.pathname.slice(1); // quita el "/" inicial
    } catch (e) {
      // fallback por si algún día guardas solo la key
      key = storageUrl.split('/').pop();
    }

    const params = {
      Bucket: config.aws.bucket,
      Key: key
    };

    // URL firmada válida por 7 días
    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand(params),
      { expiresIn: 60 * 60 * 24 * 7 }
    );

    return res.json({
      ok: true,
      url: signedUrl
    });
  } catch (error) {
    console.error('Error al obtener contrato actual desde S3:', error);
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

router.put('/aspirantes/documentos/:documentoPersonaId', verificarToken, async (req, res) => {
  const client = await pool.connect();

  try {
    const { documentoPersonaId } = req.params;
    const { archivoId } = req.body;

    if (!archivoId) {
      return res.status(400).json({
        ok: false,
        error: 'Falta archivoId en el cuerpo de la petición',
      });
    }

    await client.query('BEGIN');

    // 1) Obtener archivo anterior
    const { rows } = await client.query(
      `
      SELECT archivo_id
      FROM documento_persona
      WHERE id = $1
      `,
      [documentoPersonaId]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        ok: false,
        error: 'documento_persona no encontrado',
      });
    }

    const archivoAnteriorId = rows[0].archivo_id;

    // 2) Actualizar documento_persona con el nuevo archivo
    await client.query(
      `
      UPDATE documento_persona
      SET archivo_id   = $1,
          fecha_subida = NOW(),
          estado       = 'Subido'
      WHERE id = $2
      `,
      [archivoId, documentoPersonaId]
    );

    // 3) Borrar archivo anterior si ya no se usa
    if (archivoAnteriorId && archivoAnteriorId !== archivoId) {
      await client.query(
        `
        DELETE FROM archivo
        WHERE id = $1
          AND NOT EXISTS (
            SELECT 1
            FROM documento_persona
            WHERE archivo_id = $1
          )
        `,
        [archivoAnteriorId]
      );
    }

    await client.query('COMMIT');

    return res.json({
      ok: true,
      mensaje: 'Documento actualizado correctamente',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar documento_persona:', error);
    res.status(500).json({ ok: false, error: error.message });
  } finally {
    client.release();
  }
});




export default router;
