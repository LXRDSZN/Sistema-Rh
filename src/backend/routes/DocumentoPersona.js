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

export default router;
