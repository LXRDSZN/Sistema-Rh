// routes/AspiranteContratos.js
import express from 'express';
import pool from '../models/db.js';
import { verificarToken } from '../middleware/authMiddleware.js'; 
import { s3 } from '../aws/s3Client.js';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '../config/config.js';

const router = express.Router();

/**
 * GET /api/aspirantes/:personaId/datos-personales
 * 
 * Devuelve:
 *  - Datos para el encabezado de AspiranteInfo.vue
 *  - Datos para DatosPersonalesTab.vue
 */
router.get('/aspirantes/:personaId/datos-personales', async (req, res) => {
  try {
    const { personaId } = req.params;

    const query = `
      -- DATOS PERSONALES DEL ASPIRANTE
      SELECT
          p.id AS persona_id,
          p.nombre,
          p.apellido_paterno,
          p.apellido_materno,
          p.fecha_nacimiento,
          sx.nombre AS sexo,
          nc.nombre AS nacionalidad,
          ec.nombre AS estado_civil,
          p.foto_url,
          p.etapa,              -- estado de proceso
          TO_CHAR(DATE(p.fecha_registro), 'DD/MM/YYYY') as fecha_registro,
          ip.curp,
          ip.rfc,
          ip.nss,
          cp.telefono,
          cp.correo,
          cp.domicilio
      FROM persona p
      LEFT JOIN sexo sx ON sx.id = p.sexo_id
      LEFT JOIN nacionalidad nc ON nc.id = p.nacionalidad_id
      LEFT JOIN estado_civil ec ON ec.id = p.estado_civil_id
      LEFT JOIN identidad_persona ip ON ip.persona_id = p.id
      LEFT JOIN contacto_persona cp ON cp.persona_id = p.id
      WHERE p.id = $1
        AND p.tipo = 'Aspirante'
      LIMIT 1;
    `;

    const result = await pool.query(query, [personaId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Aspirante no encontrado'
      });
    }

    // Puedes usar directamente aspirante en AspiranteInfo y DatosPersonalesTab
    res.json({
      ok: true,
      aspirante: result.rows[0]
    });

  } catch (error) {
    console.error('Error al obtener datos personales del aspirante:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

/**
 * GET /api/aspirantes/:personaId/cv
 * 
 * Devuelve:
 *  - URL firmada del CV (válida por 7 días)
 */
router.get('/aspirantes/:personaId/cv', async (req, res) => {
  try {
    const { personaId } = req.params;

    const query = `
      -- Buscar CV del aspirante
      SELECT a.storage_url
      FROM documento_persona dp
      JOIN documento_tipo dt ON dt.id = dp.documento_tipo_id
      JOIN archivo a ON a.id = dp.archivo_id
      WHERE dp.persona_id = $1
        AND dt.codigo = 'CV'
      LIMIT 1;
    `;

    const result = await pool.query(query, [personaId]);

    if (result.rows.length === 0) {
      // No tiene CV cargado
      return res.status(404).json({
        ok: false,
        error: 'CV no encontrado para este aspirante'
      });
    }

    const storageUrl = result.rows[0].storage_url;

    // Extraer la key (path) del storage_url
    let s3Key = storageUrl;
    
    // Si es una URL completa, extraer solo la key
    if (storageUrl.startsWith('http')) {
      try {
        const url = new URL(storageUrl);
        s3Key = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
        
        // Remover el nombre del bucket si está en el path
        const parts = s3Key.split('/');
        if (parts[0] === config.aws.bucket) {
          s3Key = parts.slice(1).join('/');
        }
      } catch (e) {
        console.warn('Error al parsear storage_url:', e);
      }
    }

    // Generar URL firmada fresca
    const getParams = {
      Bucket: config.aws.bucket,
      Key: s3Key
    };

    const signedUrl = await getSignedUrl(s3, new GetObjectCommand(getParams), {
      expiresIn: 604800  // 7 días
    });

    res.json({
      ok: true,
      cvUrl: signedUrl
    });

  } catch (error) {
    console.error('Error al obtener CV del aspirante:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// ========================================
// OBTENER ASPIRACIÓN LABORAL (PRIMER CONTRATO)
// ========================================
router.get('/aspirantes/:personaId/aspiracion-laboral', async (req, res) => {
  try {
    const { personaId } = req.params;

    const query = `
      -- Aspiración laboral del aspirante
      SELECT
          al.area_id,
          ar.nombre AS area,
          al.puesto_id,
          pt.nombre AS puesto,
          al.tipo_contrato,
          al.modalidad,
          al.pretension_salarial,
          al.fecha_disponible,
          al.jornada_id,
          j.nombre AS jornada,
          al.comentario
      FROM aspiracion_laboral al
      LEFT JOIN area ar ON ar.id = al.area_id
      LEFT JOIN puesto pt ON pt.id = al.puesto_id
      LEFT JOIN jornada j ON j.id = al.jornada_id
      WHERE al.persona_id = $1
      LIMIT 1;
    `;

    const result = await pool.query(query, [personaId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'No se encontró aspiración laboral para este aspirante'
      });
    }

    res.json({
      ok: true,
      aspiracion: result.rows[0]
    });

  } catch (error) {
    console.error('Error al obtener aspiración laboral del aspirante:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// ========================================
// ACTUALIZAR NOMBRE / APELLIDOS DEL ASPIRANTE enlacreCrearContrato guardar
// ========================================
router.put('/aspirantes/:personaId/nombre', async (req, res) => {
  try {
    const { personaId } = req.params;
    const { nombre, apellidoPaterno, apellidoMaterno } = req.body;

    if (!nombre || !apellidoPaterno) {
      return res.status(400).json({
        ok: false,
        error: 'Nombre y apellido paterno son obligatorios'
      });
    }

    const updateSql = `
      UPDATE persona
      SET nombre = $1,
          apellido_paterno = $2,
          apellido_materno = $3
      WHERE id = $4
        AND tipo = 'Aspirante'
      RETURNING id, nombre, apellido_paterno, apellido_materno;
    `;

    const values = [
      nombre.trim(),
      apellidoPaterno.trim(),
      apellidoMaterno ? apellidoMaterno.trim() : null,
      personaId
    ];

    const { rows } = await pool.query(updateSql, values);

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        error: 'Aspirante no encontrado o ya no es aspirante'
      });
    }

    res.json({
      ok: true,
      mensaje: 'Datos personales actualizados correctamente',
      persona: rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar nombre del aspirante:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// ========================================
// ACTUALIZAR ETAPA DEL PROCESO DE SELECCIÓN
// ========================================
router.put('/aspirantes/:personaId/etapa', async (req, res) => {
  try {
    const { personaId } = req.params;
    const { etapa } = req.body;

    if (!etapa) {
      return res.status(400).json({
        ok: false,
        error: 'La etapa es obligatoria'
      });
    }

    const updateSql = `
      UPDATE persona
      SET etapa = $1
      WHERE id = $2
      RETURNING id, etapa, fecha_registro;
    `;

    const values = [etapa, personaId];

    const { rows } = await pool.query(updateSql, values);
    //console.log('Actualizar etapa persona:', { personaId, etapa, rows });

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        error: 'Aspirante no encontrado o ya no es aspirante'
      });
    }

    res.json({
      ok: true,
      mensaje: 'Etapa del proceso actualizada correctamente',
      proceso: rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar etapa del aspirante:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// ========================================
// ACTUALIZAR COMENTARIO DE ASPIRACIÓN LABORAL
// ========================================
router.put('/aspirantes/:personaId/aspiracion-laboral/comentario', async (req, res) => {
  try {
    const { personaId } = req.params;
    const { comentario } = req.body;

    const comentarioLimpio = (comentario || '').trim();

    if (!comentarioLimpio) {
      return res.status(400).json({
        ok: false,
        error: 'El comentario es obligatorio'
      });
    }

    // Primero intentamos actualizar si ya existe aspiración_laboral
    const updateSql = `
      UPDATE aspiracion_laboral
      SET comentario = $1
      WHERE persona_id = $2
      RETURNING id, persona_id, comentario, creado_en;
    `;

    const values = [comentarioLimpio, personaId];

    let { rows } = await pool.query(updateSql, values);

    // Si no existe registro, lo creamos con este comentario
    if (!rows.length) {
      const insertSql = `
        INSERT INTO aspiracion_laboral (persona_id, comentario)
        VALUES ($1, $2)
        RETURNING id, persona_id, comentario, creado_en;
      `;
      const insertValues = [personaId, comentarioLimpio];
      const insertResult = await pool.query(insertSql, insertValues);
      rows = insertResult.rows;
    }

    console.log('Actualizar comentario aspiracion:', {
      personaId,
      comentario: comentarioLimpio,
      rows
    });

    res.json({
      ok: true,
      mensaje: 'Comentario actualizado correctamente',
      aspiracion: rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar comentario de aspiración laboral:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
  
});

// ========================================
// GET: Documentos de un aspirante
// ========================================
router.get('/aspirantes/:personaId/documentos', verificarToken, async (req, res) => {
  const client = await pool.connect();

  try {
    const { personaId } = req.params;

    const sql = `
      SELECT DISTINCT ON (dt.id)
        dt.id                               AS documento_tipo_id,
        dt.codigo                           AS codigo,
        dt.nombre                           AS tipo_documento,
        COALESCE(dp.estado, 'Pendiente')    AS estado,
        dp.fecha_subida,
        dp.id                               AS documento_persona_id,
        a.id                                AS archivo_id,
        a.nombre                            AS nombre_archivo,
        a.storage_url
      FROM documento_tipo dt
      LEFT JOIN documento_persona dp
        ON dp.documento_tipo_id = dt.id
        AND dp.persona_id = $1
      LEFT JOIN archivo a
        ON a.id = dp.archivo_id
      ORDER BY dt.id, dp.fecha_subida DESC NULLS LAST;
    `;


    const { rows } = await client.query(sql, [personaId]);

    res.json({
      ok: true,
      documentos: rows
    });
  } catch (error) {
    console.error('Error al obtener documentos del aspirante:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  } finally {
    client.release();
  }
});




export default router;
