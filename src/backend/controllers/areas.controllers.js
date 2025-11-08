import { db } from '../models/db.js';

/**
 * CONTROLADORES DE ÁREAS
 * 
 * Maneja la gestión de áreas de la empresa
 */

/**
 * GET ALL AREAS - Obtener todas las áreas
 */
export const getAllAreas = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        id,
        nombre,
        codigo,
        area_padre_id
      FROM area
      ORDER BY nombre`
    );

    return res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('Error al obtener áreas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener áreas',
      error: error.message
    });
  }
};

/**
 * GET AREA BY ID - Obtener un área específica
 */
export const getAreaById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT 
        id,
        nombre,
        codigo,
        area_padre_id
      FROM area
      WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Área no encontrada'
      });
    }

    return res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error al obtener área:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener área',
      error: error.message
    });
  }
};

/**
 * CREATE AREA - Crear una nueva área
 */
export const createArea = async (req, res) => {
  try {
    const { nombre, codigo, area_padre_id } = req.body;

    // Validaciones básicas
    if (!nombre || !codigo) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: nombre, codigo'
      });
    }

    const result = await db.query(
      `INSERT INTO area (nombre, codigo, area_padre_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nombre, codigo, area_padre_id || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Área creada exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error al crear área:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear área',
      error: error.message
    });
  }
};

/**
 * UPDATE AREA - Actualizar un área
 */
export const updateArea = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, codigo, area_padre_id } = req.body;

    // Verificar que el área existe
    const existsResult = await db.query(
      `SELECT id FROM area WHERE id = $1`,
      [id]
    );

    if (existsResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Área no encontrada'
      });
    }

    // Construir query dinámicamente
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (nombre !== undefined) {
      updates.push(`nombre = $${paramIndex}`);
      params.push(nombre);
      paramIndex++;
    }

    if (codigo !== undefined) {
      updates.push(`codigo = $${paramIndex}`);
      params.push(codigo);
      paramIndex++;
    }

    if (area_padre_id !== undefined) {
      updates.push(`area_padre_id = $${paramIndex}`);
      params.push(area_padre_id);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      });
    }

    params.push(id);
    const query = `UPDATE area SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await db.query(query, params);

    return res.json({
      success: true,
      message: 'Área actualizada exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar área:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar área',
      error: error.message
    });
  }
};

/**
 * DELETE AREA - Eliminar un área
 */
export const deleteArea = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `DELETE FROM area WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Área no encontrada'
      });
    }

    return res.json({
      success: true,
      message: 'Área eliminada exitosamente',
      data: { id: result.rows[0].id }
    });

  } catch (error) {
    console.error('Error al eliminar área:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar área',
      error: error.message
    });
  }
};
