// routes/EmpleadoContratos.js
import express from 'express';
import pool from '../models/db.js';
import { verificarToken } from '../middleware/authMiddleware.js';  // 🔹 AÑADE ESTO

const router = express.Router();

// ========================================
// X. OBTENER DATOS PARA RENOVACIÓN (EMPLEADO)
// ========================================
router.get('/contratos/empleado/:personaId/datos-renovacion', async (req, res) => {
  try {
    const { personaId } = req.params;

    const sql = `
      SELECT
        c.persona_id,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        p.foto_url,
        c.area_id,
        c.puesto_id,
        c.tipo_contrato,
        c.modalidad,
        c.salario_mensual,
        c.fecha_inicio,
        c.fecha_fin
      FROM contrato c
      INNER JOIN persona p ON p.id = c.persona_id
      WHERE c.persona_id = $1
        AND c.estado_id = (
          SELECT id FROM estado_contrato
          WHERE nombre ILIKE 'ACTIVO'
        )
      ORDER BY c.fecha_inicio DESC
      LIMIT 1;
    `;

    const { rows } = await pool.query(sql, [personaId]);

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        error: 'No se encontró contrato previo para este empleado'
      });
    }

    res.json({ ok: true, datos: rows[0] });
  } catch (error) {
    console.error('Error al obtener datos de renovación:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});


// ========================================
// X+1. RENOVAR CONTRATO DE EMPLEADO
// ========================================
router.post('/contratos/empleado/renovar', verificarToken, async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      personaId,
      plantillaId,
      puestoId,
      areaId,
      salarioMensual,
      fechaInicio,
      fechaFin,
      tipoContrato,
      modalidad,
      observaciones,
      archivoId
    } = req.body;

    await client.query('BEGIN');

    // 1) Poner contrato anterior TERMINADO
    const cerrarSql = `
      UPDATE contrato
      SET estado_id = (SELECT id FROM estado_contrato WHERE nombre ILIKE 'TERMINADO')
      WHERE persona_id = $1
        AND estado_id = (SELECT id FROM estado_contrato WHERE nombre ILIKE 'ACTIVO');
    `;
    await client.query(cerrarSql, [personaId]);

    // 2) Insertar nuevo contrato tomando como default los datos del último
    const insertarSql = `
      INSERT INTO contrato (
        id,
        persona_id,
        plantilla_id,
        puesto_id,
        area_id,
        salario_mensual,
        fecha_inicio,
        fecha_fin,
        fecha_creacion,
        estado_id,
        archivo_id,
        tipo_contrato,
        modalidad,
        observaciones
      )
      VALUES (
        uuid_generate_v4(),
        $1,
        COALESCE($2, (SELECT plantilla_id   FROM contrato WHERE persona_id = $1 ORDER BY fecha_inicio DESC LIMIT 1)),
        COALESCE($3, (SELECT puesto_id      FROM contrato WHERE persona_id = $1 ORDER BY fecha_inicio DESC LIMIT 1)),
        COALESCE($4, (SELECT area_id        FROM contrato WHERE persona_id = $1 ORDER BY fecha_inicio DESC LIMIT 1)),
        COALESCE($5, (SELECT salario_mensual FROM contrato WHERE persona_id = $1 ORDER BY fecha_inicio DESC LIMIT 1)),
        ($6::date AT TIME ZONE 'America/Mexico_City')::date,
        ($7::date AT TIME ZONE 'America/Mexico_City')::date,
        TIMEZONE('America/Mexico_City', NOW()),
        (SELECT id FROM estado_contrato WHERE nombre ILIKE 'ACTIVO'),
        $8,
        COALESCE($9,  (SELECT tipo_contrato FROM contrato WHERE persona_id = $1 ORDER BY fecha_inicio DESC LIMIT 1)),
        COALESCE($10, (SELECT modalidad     FROM contrato WHERE persona_id = $1 ORDER BY fecha_inicio DESC LIMIT 1)),
        COALESCE($11, (SELECT observaciones FROM contrato WHERE persona_id = $1 ORDER BY fecha_inicio DESC LIMIT 1))
      )
      RETURNING *;
    `;

    const insertarValues = [
      personaId,
      plantillaId || null,
      puestoId || null,
      areaId || null,
      salarioMensual || null,
      fechaInicio,
      fechaFin || null,
      archivoId || null,
      tipoContrato || null,
      modalidad || null,
      observaciones || null
    ];

    const { rows: contratoRows } = await client.query(insertarSql, insertarValues);

    await client.query('COMMIT');

    res.json({
      ok: true,
      mensaje: 'Contrato renovado correctamente',
      contrato: contratoRows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al renovar contrato:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  } finally {
    client.release();
  }
});

export default router;
