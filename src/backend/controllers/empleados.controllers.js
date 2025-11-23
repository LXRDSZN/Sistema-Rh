import { db } from '../models/db.js';

/**
 * CONTROLADORES DE EMPLEADOS
 * 
 * Maneja la gestión de empleados, áreas y puestos
 */

/**
 * GET ALL EMPLEADOS - Obtener todos los empleados con su información completa
 */
export const getAllEmpleados = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        p.id,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        p.fecha_nacimiento,
        p.foto_url,
        s.nombre as sexo,
        a.nombre as area,
        a.id as area_id,
        pu.nombre as puesto,
        pu.id as puesto_id,
        c.fecha_inicio,
        c.fecha_fin,
        c.tipo_contrato,
        c.modalidad,
        ec.nombre as estado_contrato
      FROM persona p
      LEFT JOIN sexo s ON p.sexo_id = s.id
      LEFT JOIN contrato c ON p.id = c.persona_id 
        AND c.estado_id = (SELECT id FROM estado_contrato WHERE nombre ILIKE 'ACTIVO' LIMIT 1)
        AND (c.fecha_fin IS NULL OR c.fecha_fin >= CURRENT_DATE)
      LEFT JOIN area a ON c.area_id = a.id
      LEFT JOIN puesto pu ON c.puesto_id = pu.id
      LEFT JOIN estado_contrato ec ON c.estado_id = ec.id
      WHERE p.tipo = 'Empleado'
      ORDER BY p.apellido_paterno, p.apellido_materno, p.nombre`
    );

    // Formatear los datos para el frontend
    const empleados = result.rows.map(row => ({
      id: row.id,
      nombre: `${row.apellido_paterno} ${row.apellido_materno || ''} ${row.nombre}`.trim(),
      departamento: row.area || 'Sin asignar',
      titulo: row.puesto || 'Sin puesto',
      fechaInicio: row.fecha_inicio ? new Date(row.fecha_inicio).toLocaleDateString('es-MX') : 'N/A',
      genero: row.sexo || 'No especificado',
      area_id: row.area_id,
      puesto_id: row.puesto_id,
      avatar: row.foto_url
    }));

    return res.json({
      success: true,
      data: empleados
    });

  } catch (error) {
    console.error('Error al obtener empleados:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener lista de empleados',
      error: error.message
    });
  }
};

/**
 * GET EMPLEADO BY ID - Obtener un empleado específico
 */
export const getEmpleadoById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT 
        p.*,
        s.nombre as sexo,
        ec.nombre as estado_civil,
        a.nombre as area,
        a.id as area_id,
        pu.nombre as puesto,
        pu.id as puesto_id,
        ap.fecha_inicio,
        ap.fecha_fin,
        ap.es_principal
      FROM persona p
      LEFT JOIN sexo s ON p.sexo_id = s.id
      LEFT JOIN estado_civil ec ON p.estado_civil_id = ec.id
      LEFT JOIN asignacion_puesto ap ON p.id = ap.persona_id AND ap.fecha_fin IS NULL
      LEFT JOIN area a ON ap.area_id = a.id
      LEFT JOIN puesto pu ON ap.puesto_id = pu.id
      WHERE p.id = $1 AND p.tipo = 'Empleado'`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado'
      });
    }

    return res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error al obtener empleado:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener empleado',
      error: error.message
    });
  }
};

/**
 * UPDATE EMPLEADO - Actualizar asignación de área y puesto
 */
export const updateEmpleadoAsignacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { area_id, puesto_id, motivo } = req.body;

    console.log('📝 Actualizando empleado:', { id, area_id, puesto_id, motivo });

    // Validar que puesto_id no sea null
    if (!puesto_id) {
      return res.status(400).json({
        success: false,
        message: 'El puesto es requerido'
      });
    }

    // Validar que area_id no sea null
    if (!area_id) {
      return res.status(400).json({
        success: false,
        message: 'El área es requerida'
      });
    }

    // Iniciar transacción
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');

      // Actualizar el contrato activo con el nuevo área y puesto
      const updateResult = await client.query(
        `UPDATE contrato 
         SET area_id = $2, puesto_id = $3
         WHERE persona_id = $1 
         AND estado_id = (SELECT id FROM estado_contrato WHERE nombre ILIKE 'ACTIVO' LIMIT 1)
         AND (fecha_fin IS NULL OR fecha_fin >= CURRENT_DATE)
         RETURNING id`,
        [id, area_id, puesto_id]
      );

      if (updateResult.rows.length === 0) {
        throw new Error('No se encontró un contrato activo para actualizar');
      }

      console.log('✅ Contrato actualizado');

      // Si se proporcionó un motivo, guardarlo en observaciones del contrato
      if (motivo && motivo.trim()) {
        const contratoId = updateResult.rows[0].id;
        const fechaHoy = new Date().toISOString().split('T')[0];
        const nuevaObservacion = `[${fechaHoy}] Cambio de puesto/área: ${motivo}`;
        
        // Obtener observaciones actuales del contrato
        const observacionesResult = await client.query(
          `SELECT observaciones FROM contrato WHERE id = $1`,
          [contratoId]
        );
        
        const observacionesActuales = observacionesResult.rows[0]?.observaciones || '';
        
        // Agregar nueva observación
        const observacionesActualizadas = observacionesActuales 
          ? `${observacionesActuales}\n${nuevaObservacion}`
          : nuevaObservacion;
        
        await client.query(
          `UPDATE contrato SET observaciones = $1 WHERE id = $2`,
          [observacionesActualizadas, contratoId]
        );
        
        // Registrar en historial_contrato
        await client.query(
          `INSERT INTO historial_contrato 
           (contrato_id, persona_id, cambios)
           VALUES ($1, $2, $3)`,
          [
            contratoId, 
            id,
            JSON.stringify({
              tipo: 'cambio_area_puesto',
              area_id: area_id,
              puesto_id: puesto_id,
              motivo: motivo,
              fecha: fechaHoy
            })
          ]
        );
        
        console.log('📋 Motivo guardado en observaciones:', motivo);
      }

      await client.query('COMMIT');

      return res.json({
        success: true,
        message: 'Asignación actualizada exitosamente'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Error al actualizar empleado:', error);
    console.error('❌ Detalle del error:', {
      message: error.message,
      detail: error.detail,
      code: error.code,
      constraint: error.constraint,
      table: error.table,
      column: error.column
    });
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar empleado',
      error: error.message,
      detail: error.detail
    });
  }
};

/**
 * GET AREAS - Obtener todas las áreas
 */
export const getAllAreas = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, nombre, codigo 
       FROM area 
       ORDER BY nombre`
    );

    return res.json({
      success: true,
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
 * GET PUESTOS - Obtener todos los puestos
 */
export const getAllPuestos = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, nombre, codigo, descripcion 
       FROM puesto 
       ORDER BY nombre`
    );

    return res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error al obtener puestos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener puestos',
      error: error.message
    });
  }
};
