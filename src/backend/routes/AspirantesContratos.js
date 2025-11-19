// routes/CatalogoContratos.js
import express from 'express';
import pool from '../models/db.js';

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
          p.fecha_registro,
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
 *  - URL del CV (storage_url)
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

    res.json({
      ok: true,
      cvUrl: result.rows[0].storage_url
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
      -- Aspirante (Primer contrato)
      SELECT
          p.id AS persona_id,
          p.nombre,
          p.apellido_paterno,
          p.apellido_materno,
          p.foto_url,
          al.area_id,
          al.puesto_id,
          al.tipo_contrato,
          al.modalidad,
          al.fecha_disponible,
          al.jornada_id
      FROM persona p
      LEFT JOIN aspiracion_laboral al ON al.persona_id = p.id
      WHERE p.id = $1
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



export default router;
