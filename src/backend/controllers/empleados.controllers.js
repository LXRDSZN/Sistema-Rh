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
        s.nombre as sexo,
        a.nombre as area,
        a.id as area_id,
        pu.nombre as puesto,
        pu.id as puesto_id,
        ap.fecha_inicio,
        ap.es_principal,
        CASE 
          WHEN ap.fecha_fin IS NULL THEN 'Tiempo completo'
          ELSE 'Por contrato'
        END as categoria
      FROM persona p
      LEFT JOIN sexo s ON p.sexo_id = s.id
      LEFT JOIN asignacion_puesto ap ON p.id = ap.persona_id AND ap.fecha_fin IS NULL
      LEFT JOIN area a ON ap.area_id = a.id
      LEFT JOIN puesto pu ON ap.puesto_id = pu.id
      WHERE p.tipo = 'Empleado'
      ORDER BY p.nombre, p.apellido_paterno`
    );

    // Formatear los datos para el frontend
    const empleados = result.rows.map(row => ({
      id: row.id,
      nombre: `${row.nombre} ${row.apellido_paterno} ${row.apellido_materno || ''}`.trim(),
      departamento: row.area || 'Sin asignar',
      titulo: row.puesto || 'Sin puesto',
      fechaInicio: row.fecha_inicio ? new Date(row.fecha_inicio).toLocaleDateString('es-MX') : 'N/A',
      categoria: row.categoria,
      genero: row.sexo || 'No especificado',
      area_id: row.area_id,
      puesto_id: row.puesto_id
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
    const { area_id, puesto_id } = req.body;

    // Iniciar transacción
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');

      // Finalizar asignación actual
      await client.query(
        `UPDATE asignacion_puesto 
         SET fecha_fin = CURRENT_DATE
         WHERE persona_id = $1 AND fecha_fin IS NULL`,
        [id]
      );

      // Crear nueva asignación
      await client.query(
        `INSERT INTO asignacion_puesto 
         (persona_id, puesto_id, area_id, fecha_inicio, es_principal)
         VALUES ($1, $2, $3, CURRENT_DATE, true)`,
        [id, puesto_id, area_id]
      );

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
    console.error('Error al actualizar empleado:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar empleado',
      error: error.message
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
