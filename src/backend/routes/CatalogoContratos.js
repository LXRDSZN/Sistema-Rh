// routes/AspirantesContratos.js
import express from 'express';
import pool from '../models/db.js';

const router = express.Router();
// Áreas
router.get('/catalogos/areas', async (req, res) => {
  const sql = 'SELECT id, nombre FROM area ORDER BY nombre;';
  const { rows } = await pool.query(sql);
  res.json({ ok: true, data: rows });
});

// Puestos
router.get('/catalogos/puestos', async (req, res) => {
  const sql = 'SELECT id, nombre FROM puesto ORDER BY nombre;';
  const { rows } = await pool.query(sql);
  res.json({ ok: true, data: rows });
});

// Jornada
router.get('/catalogos/jornadas', async (req, res) => {
  const sql = 'SELECT id, nombre FROM jornada ORDER BY nombre;';
  const { rows } = await pool.query(sql);
  res.json({ ok: true, data: rows });
});

// Plantilla contrato
router.get('/catalogos/plantillas-contrato', async (req, res) => {
  const sql = 'SELECT id, nombre FROM plantilla_contrato ORDER BY nombre;';
  const { rows } = await pool.query(sql);
  res.json({ ok: true, data: rows });
});

// Estado contrato
router.get('/catalogos/estados-contrato', async (req, res) => {
  const sql = 'SELECT id, nombre FROM estado_contrato ORDER BY nombre;';
  const { rows } = await pool.query(sql);
  res.json({ ok: true, data: rows });
});

// Tipo de documento
router.get('/catalogos/tipos-documento', async (req, res) => {
  const sql = 'SELECT id, nombre FROM documento_tipo ORDER BY nombre;';
  const { rows } = await pool.query(sql);
  res.json({ ok: true, data: rows });
});

export default router;
