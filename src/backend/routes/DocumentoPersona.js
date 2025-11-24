// routes/DocumentoPersona.js
import express from 'express';
import pool from '../models/db.js';
import { verificarToken } from '../middleware/authMiddleware.js';  // 🔹 AÑADE ESTO
const router = express.Router();

router.post('/personas/:personaId/documentos', verificarToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { personaId } = req.params;
    const { documentoTipoId, archivoId } = req.body;

    await client.query(
      `
      INSERT INTO documento_persona (
        id,
        persona_id,
        documento_tipo_id,
        archivo_id,
        estado,
        fecha_subida
      )
      VALUES (
        uuid_generate_v4(),
        $1, $2, $3,
        'Subido',
        NOW()
      );
      `,
      [personaId, documentoTipoId, archivoId]
    );

    res.json({ ok: true, mensaje: 'Documento asociado correctamente a la persona' });
  } catch (error) {
    console.error('Error al asociar documento a persona:', error);
    res.status(500).json({ ok: false, error: error.message });
  } finally {
    client.release();
  }
});

// Eliminar documento_persona + archivo (si ya no lo usa nadie)
router.delete('/personas/:personaId/documentos/:documentoPersonaId', verificarToken, async (req, res) => {
  const client = await pool.connect();

  try {
    const { personaId, documentoPersonaId } = req.params;

    await client.query('BEGIN');

    // 1) Obtener archivo_id asociado
    const { rows } = await client.query(
      `
      SELECT archivo_id
      FROM documento_persona
      WHERE id = $1
        AND persona_id = $2
      `,
      [documentoPersonaId, personaId]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        ok: false,
        error: 'documento_persona no encontrado',
      });
    }

    const archivoId = rows[0].archivo_id;

    // 2) Borrar documento_persona
    await client.query(
      `
      DELETE FROM documento_persona
      WHERE id = $1
        AND persona_id = $2
      `,
      [documentoPersonaId, personaId]
    );

    // 3) Borrar archivo si ya no lo usa nadie más (opcional)
    if (archivoId) {
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
        [archivoId]
      );
    }

    await client.query('COMMIT');

    return res.json({
      ok: true,
      mensaje: 'Documento eliminado correctamente',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar documento_persona:', error);
    res.status(500).json({ ok: false, error: error.message });
  } finally {
    client.release();
  }
});


export default router;
