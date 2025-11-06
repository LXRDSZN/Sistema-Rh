import { db } from '../models/db.js';

/**
 * CONTROLADORES DE INCIDENCIAS
 * 
 * Maneja la gestión de incidencias, tipos de incidencias y estados
 */

/**
 * GET ALL INCIDENCIAS - Obtener todas las incidencias con filtros opcionales
 */
export const getAllIncidencias = async (req, res) => {
  try {
    const { estado_id, tipo_id, persona_id, area_id, fecha_inicio, fecha_fin } = req.query;

    let query = `
      SELECT 
        i.id,
        i.persona_id,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        i.tipo_id,
        ti.nombre as tipo_incidencia,
        ti.codigo as tipo_codigo,
        i.fecha_inicio,
        i.fecha_fin,
        i.descripcion,
        i.archivo_id,
        i.estado_id,
        ei.nombre as estado,
        ap.area_id,
        a.nombre as area,
        CASE 
          WHEN i.fecha_fin IS NULL THEN 'Activa'
          ELSE 'Finalizada'
        END as estado_duracion
      FROM incidencia i
      LEFT JOIN persona p ON i.persona_id = p.id
      LEFT JOIN tipo_incidencia ti ON i.tipo_id = ti.id
      LEFT JOIN estado_incidencia ei ON i.estado_id = ei.id
      LEFT JOIN asignacion_puesto ap ON p.id = ap.persona_id AND ap.fecha_fin IS NULL
      LEFT JOIN area a ON ap.area_id = a.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Agregar filtros dinámicos
    if (estado_id) {
      query += ` AND i.estado_id = $${paramIndex}`;
      params.push(estado_id);
      paramIndex++;
    }

    if (tipo_id) {
      query += ` AND i.tipo_id = $${paramIndex}`;
      params.push(tipo_id);
      paramIndex++;
    }

    if (persona_id) {
      query += ` AND i.persona_id = $${paramIndex}`;
      params.push(persona_id);
      paramIndex++;
    }

    if (area_id) {
      query += ` AND ap.area_id = $${paramIndex}`;
      params.push(area_id);
      paramIndex++;
    }

    if (fecha_inicio) {
      query += ` AND i.fecha_inicio >= $${paramIndex}`;
      params.push(fecha_inicio);
      paramIndex++;
    }

    if (fecha_fin) {
      query += ` AND i.fecha_inicio <= $${paramIndex}`;
      params.push(fecha_fin);
      paramIndex++;
    }

    query += ` ORDER BY i.fecha_inicio DESC`;

    const result = await db.query(query, params);

    // Formatear respuesta
    const incidencias = result.rows.map(row => ({
      id: row.id,
      persona_id: row.persona_id,
      nombre_completo: `${row.nombre} ${row.apellido_paterno} ${row.apellido_materno || ''}`.trim(),
      tipo: row.tipo_incidencia,
      tipo_codigo: row.tipo_codigo,
      fecha_inicio: row.fecha_inicio ? new Date(row.fecha_inicio).toLocaleDateString('es-MX') : null,
      fecha_fin: row.fecha_fin ? new Date(row.fecha_fin).toLocaleDateString('es-MX') : null,
      descripcion: row.descripcion,
      archivo_id: row.archivo_id,
      estado: row.estado,
      estado_id: row.estado_id,
      area: row.area || 'Sin asignar',
      area_id: row.area_id,
      estado_duracion: row.estado_duracion
    }));

    return res.json({
      success: true,
      count: incidencias.length,
      data: incidencias
    });

  } catch (error) {
    console.error('Error al obtener incidencias:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener lista de incidencias',
      error: error.message
    });
  }
};

/**
 * GET INCIDENCIA BY ID - Obtener una incidencia específica
 */
export const getIncidenciaById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT 
        i.id,
        i.persona_id,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        p.foto_url,
        i.tipo_id,
        ti.nombre as tipo_incidencia,
        ti.codigo as tipo_codigo,
        ti.afecta_asistencia,
        i.fecha_inicio,
        i.fecha_fin,
        i.descripcion,
        i.archivo_id,
        i.estado_id,
        ei.nombre as estado,
        ap.area_id,
        a.nombre as area,
        pu.nombre as puesto
      FROM incidencia i
      LEFT JOIN persona p ON i.persona_id = p.id
      LEFT JOIN tipo_incidencia ti ON i.tipo_id = ti.id
      LEFT JOIN estado_incidencia ei ON i.estado_id = ei.id
      LEFT JOIN asignacion_puesto ap ON p.id = ap.persona_id AND ap.fecha_fin IS NULL
      LEFT JOIN area a ON ap.area_id = a.id
      LEFT JOIN puesto pu ON ap.puesto_id = pu.id
      WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Incidencia no encontrada'
      });
    }

    const row = result.rows[0];
    const incidencia = {
      id: row.id,
      persona_id: row.persona_id,
      nombre_completo: `${row.nombre} ${row.apellido_paterno} ${row.apellido_materno || ''}`.trim(),
      foto_url: row.foto_url,
      tipo: row.tipo_incidencia,
      tipo_codigo: row.tipo_codigo,
      afecta_asistencia: row.afecta_asistencia,
      fecha_inicio: row.fecha_inicio ? new Date(row.fecha_inicio).toLocaleDateString('es-MX') : null,
      fecha_fin: row.fecha_fin ? new Date(row.fecha_fin).toLocaleDateString('es-MX') : null,
      descripcion: row.descripcion,
      archivo_id: row.archivo_id,
      estado: row.estado,
      estado_id: row.estado_id,
      area: row.area || 'Sin asignar',
      puesto: row.puesto || 'Sin asignar'
    };

    return res.json({
      success: true,
      data: incidencia
    });

  } catch (error) {
    console.error('Error al obtener incidencia:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener incidencia',
      error: error.message
    });
  }
};

/**
 * GET INCIDENCIAS POR PERSONA - Obtener incidencias de un empleado específico
 */
export const getIncidenciasByPersona = async (req, res) => {
  try {
    const { persona_id } = req.params;

    const result = await db.query(
      `SELECT 
        i.id,
        i.persona_id,
        i.tipo_id,
        ti.nombre as tipo_incidencia,
        i.fecha_inicio,
        i.fecha_fin,
        i.descripcion,
        i.estado_id,
        ei.nombre as estado
      FROM incidencia i
      LEFT JOIN tipo_incidencia ti ON i.tipo_id = ti.id
      LEFT JOIN estado_incidencia ei ON i.estado_id = ei.id
      WHERE i.persona_id = $1
      ORDER BY i.fecha_inicio DESC`,
      [persona_id]
    );

    const incidencias = result.rows.map(row => ({
      id: row.id,
      tipo: row.tipo_incidencia,
      fecha_inicio: row.fecha_inicio ? new Date(row.fecha_inicio).toLocaleDateString('es-MX') : null,
      fecha_fin: row.fecha_fin ? new Date(row.fecha_fin).toLocaleDateString('es-MX') : null,
      descripcion: row.descripcion,
      estado: row.estado,
      estado_id: row.estado_id
    }));

    return res.json({
      success: true,
      count: incidencias.length,
      data: incidencias
    });

  } catch (error) {
    console.error('Error al obtener incidencias de persona:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener incidencias',
      error: error.message
    });
  }
};

/**
 * CREATE INCIDENCIA - Crear una nueva incidencia
 */
export const createIncidencia = async (req, res) => {
  try {
    const { persona_id, tipo_id, tipo, fecha_inicio, fecha_fin, descripcion, archivo_id } = req.body;

    // Validaciones básicas
    if (!persona_id || (!tipo_id && !tipo) || !fecha_inicio || !descripcion) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: persona_id, (tipo_id o tipo), fecha_inicio, descripcion'
      });
    }

    // Obtener el estado inicial de la incidencia (por defecto "Pendiente")
    const estadoResult = await db.query(
      `SELECT id FROM estado_incidencia WHERE nombre = 'Pendiente' LIMIT 1`
    );

    if (estadoResult.rows.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Estado "Pendiente" no encontrado en la base de datos'
      });
    }

    const estado_id = estadoResult.rows[0].id;

    // Obtener o crear un tipo_id por defecto
    let finalTipoId = tipo_id;
    if (!finalTipoId) {
      // Obtener o crear un tipo genérico llamado "Otro"
      const tipoGenericoResult = await db.query(
        `SELECT id FROM tipo_incidencia WHERE nombre = 'Otro' LIMIT 1`
      );
      
      if (tipoGenericoResult.rows.length > 0) {
        finalTipoId = tipoGenericoResult.rows[0].id;
      } else {
        // Crear un tipo genérico si no existe
        const tipoGenericoInsert = await db.query(
          `INSERT INTO tipo_incidencia (codigo, nombre, afecta_asistencia, estado_resultante_id)
           VALUES ('GEN', 'Otro', false, $1)
           RETURNING id`,
          [estado_id]
        );
        finalTipoId = tipoGenericoInsert.rows[0].id;
      }
    }

    // Si vino tipo (texto), agregarlo a la descripción
    let finalDescripcion = descripcion;
    if (tipo && !tipo_id) {
      finalDescripcion = `[${tipo}] ${descripcion}`;
    }

    const result = await db.query(
      `INSERT INTO incidencia 
       (persona_id, tipo_id, fecha_inicio, fecha_fin, descripcion, archivo_id, estado_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [persona_id, finalTipoId, fecha_inicio, fecha_fin || null, finalDescripcion || null, archivo_id || null, estado_id]
    );

    return res.status(201).json({
      success: true,
      message: 'Incidencia creada exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error al crear incidencia:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear incidencia',
      error: error.message
    });
  }
};

/**
 * UPDATE INCIDENCIA - Actualizar una incidencia
 */
export const updateIncidencia = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_fin, descripcion, archivo_id, estado_id } = req.body;

    // Verificar que la incidencia existe
    const existsResult = await db.query(
      `SELECT id FROM incidencia WHERE id = $1`,
      [id]
    );

    if (existsResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Incidencia no encontrada'
      });
    }

    // Construir query dinámicamente para solo actualizar campos proporcionados
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (fecha_fin !== undefined) {
      updates.push(`fecha_fin = $${paramIndex}`);
      params.push(fecha_fin);
      paramIndex++;
    }

    if (descripcion !== undefined) {
      updates.push(`descripcion = $${paramIndex}`);
      params.push(descripcion);
      paramIndex++;
    }

    if (archivo_id !== undefined) {
      updates.push(`archivo_id = $${paramIndex}`);
      params.push(archivo_id);
      paramIndex++;
    }

    if (estado_id !== undefined) {
      updates.push(`estado_id = $${paramIndex}`);
      params.push(estado_id);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      });
    }

    params.push(id);
    const query = `UPDATE incidencia SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await db.query(query, params);

    return res.json({
      success: true,
      message: 'Incidencia actualizada exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar incidencia:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar incidencia',
      error: error.message
    });
  }
};

/**
 * APPROVE INCIDENCIA - Aprobar una incidencia (cambiar estado a "Aprobada")
 */
export const approveIncidencia = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener el ID del estado "Aprobada"
    const estadoResult = await db.query(
      `SELECT id FROM estado_incidencia WHERE nombre = 'Aprobada' LIMIT 1`
    );

    if (estadoResult.rows.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Estado "Aprobada" no encontrado'
      });
    }

    const estado_id = estadoResult.rows[0].id;

    const result = await db.query(
      `UPDATE incidencia SET estado_id = $1 WHERE id = $2 RETURNING *`,
      [estado_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Incidencia no encontrada'
      });
    }

    return res.json({
      success: true,
      message: 'Incidencia aprobada exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error al aprobar incidencia:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al aprobar incidencia',
      error: error.message
    });
  }
};

/**
 * REJECT INCIDENCIA - Rechazar una incidencia (cambiar estado a "Rechazada")
 */
export const rejectIncidencia = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    // Obtener el ID del estado "Rechazada"
    const estadoResult = await db.query(
      `SELECT id FROM estado_incidencia WHERE nombre = 'Rechazada' LIMIT 1`
    );

    if (estadoResult.rows.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Estado "Rechazada" no encontrado'
      });
    }

    const estado_id = estadoResult.rows[0].id;

    // Actualizar con el motivo en la descripción (o crear un campo si lo necesitas después)
    const descripcionActualizada = motivo ? `RECHAZADA: ${motivo}` : 'RECHAZADA';

    const result = await db.query(
      `UPDATE incidencia SET estado_id = $1, descripcion = $2 WHERE id = $3 RETURNING *`,
      [estado_id, descripcionActualizada, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Incidencia no encontrada'
      });
    }

    return res.json({
      success: true,
      message: 'Incidencia rechazada exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error al rechazar incidencia:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al rechazar incidencia',
      error: error.message
    });
  }
};

/**
 * DELETE INCIDENCIA - Eliminar una incidencia
 */
export const deleteIncidencia = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `DELETE FROM incidencia WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Incidencia no encontrada'
      });
    }

    return res.json({
      success: true,
      message: 'Incidencia eliminada exitosamente',
      data: { id: result.rows[0].id }
    });

  } catch (error) {
    console.error('Error al eliminar incidencia:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar incidencia',
      error: error.message
    });
  }
};

/**
 * GET TIPOS INCIDENCIA - Obtener todos los tipos de incidencias
 */
export const getAllTiposIncidencia = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        id,
        codigo,
        nombre,
        afecta_asistencia,
        estado_resultante_id
      FROM tipo_incidencia
      ORDER BY nombre`
    );

    return res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('Error al obtener tipos de incidencia:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener tipos de incidencia',
      error: error.message
    });
  }
};

/**
 * GET ESTADOS INCIDENCIA - Obtener todos los estados de incidencias
 */
export const getAllEstadosIncidencia = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, nombre FROM estado_incidencia ORDER BY nombre`
    );

    return res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('Error al obtener estados de incidencia:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener estados de incidencia',
      error: error.message
    });
  }
};
