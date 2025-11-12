import { db } from '../models/db.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

/**
 * CONTROLADORES DE VACACIONES
 * 
 * Maneja solicitudes de vacaciones, saldos y días individuales
 */

/**
 * GET EMPLEADO ACTUAL - Obtener datos del empleado autenticado
 */
export const getEmpleadoActual = async (req, res) => {
  try {
    const personaId = req.user?.personaId;

    if (!personaId) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado. Por favor inicie sesión.'
      });
    }

    const result = await db.query(
      `SELECT 
        p.id,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        a.nombre as departamento,
        a.id as area_id,
        ap.fecha_inicio as fecha_contratacion,
        pu.nombre as puesto,
        CASE 
          WHEN ap.fecha_fin IS NULL THEN 'Tiempo completo'
          ELSE 'Por contrato'
        END as categoria,
        s.nombre as genero
      FROM persona p
      LEFT JOIN asignacion_puesto ap ON p.id = ap.persona_id AND ap.fecha_fin IS NULL
      LEFT JOIN area a ON ap.area_id = a.id
      LEFT JOIN puesto pu ON ap.puesto_id = pu.id
      LEFT JOIN sexo s ON p.sexo_id = s.id
      WHERE p.id = $1 AND p.tipo = 'Empleado'`,
      [personaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado'
      });
    }

    const empleado = result.rows[0];

    return res.json({
      success: true,
      data: {
        id: empleado.id,
        nombre: `${empleado.nombre} ${empleado.apellido_paterno} ${empleado.apellido_materno || ''}`.trim(),
        departamento: empleado.departamento || 'Sin asignar',
        puesto: empleado.puesto || 'Sin puesto',
        fecha_contratacion: empleado.fecha_contratacion 
          ? new Date(empleado.fecha_contratacion).toISOString().split('T')[0]
          : null,
        area_id: empleado.area_id,
        categoria: empleado.categoria,
        genero: empleado.genero
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener empleado actual:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener datos del empleado',
      error: error.message
    });
  }
};

/**
 * GET VACACIONES EMPLEADO - Obtener saldo y políticas de vacaciones
 */
export const getVacacionesEmpleado = async (req, res) => {
  try {
    const { empleadoId } = req.params;

    console.log('🔍 Consultando vacaciones para empleado:', empleadoId);

    // Obtener saldo de vacaciones
    const saldo = await db.query(
      `SELECT 
        vs.id,
        vs.persona_id,
        vs.dias_totales,
        vs.dias_usados,
        vs.dias_disponibles,
        vs.anio
      FROM vacacion_saldo vs
      WHERE vs.persona_id = $1
      ORDER BY vs.anio DESC
      LIMIT 1`,
      [empleadoId]
    );

    console.log('📊 Resultado saldo:', saldo.rows);

    // Si no hay saldo, retornar valores por defecto
    let saldoData = saldo.rows[0] || {
      dias_totales: 15,
      dias_usados: 0,
      dias_disponibles: 15,
      anio: new Date().getFullYear()
    };

    // Obtener solicitudes pendientes/aprobadas
    const solicitudes = await db.query(
      `SELECT 
        COUNT(*) FILTER (WHERE estado = 'Pendiente') as pendientes,
        COUNT(*) FILTER (WHERE estado = 'Aprobada') as aprobadas,
        COUNT(*) FILTER (WHERE estado = 'Rechazada') as rechazadas
      FROM vacacion_solicitud
      WHERE persona_id = $1
      AND EXTRACT(YEAR FROM fecha_solicitud) = EXTRACT(YEAR FROM CURRENT_DATE)`,
      [empleadoId]
    );

    console.log('📋 Solicitudes:', solicitudes.rows[0]);

    return res.json({
      success: true,
      data: {
        saldo: {
          dias_totales: parseInt(saldoData.dias_totales) || 15,
          dias_usados: parseInt(saldoData.dias_usados) || 0,
          dias_disponibles: parseInt(saldoData.dias_disponibles) || 15,
          anio: saldoData.anio || new Date().getFullYear()
        },
        solicitudes: solicitudes.rows[0] || {
          pendientes: 0,
          aprobadas: 0,
          rechazadas: 0
        }
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener vacaciones:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener datos de vacaciones',
      error: error.message
    });
  }
};

/**
 * POST SOLICITUD VACACIONES - Crear nueva solicitud
 */
export const crearSolicitudVacaciones = async (req, res) => {
  try {
    const { 
      persona_id,
      dias_solicitados,
      descripcion,
      fecha_inicio,
      fecha_fin,
      dias_array
    } = req.body;

    console.log('📤 Datos recibidos:', { 
      persona_id, 
      dias_solicitados, 
      descripcion,
      dias_array: dias_array ? JSON.parse(dias_array).length + ' días' : '0 días'
    });

    if (!persona_id || !dias_solicitados) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios: persona_id y dias_solicitados'
      });
    }

    // Validar seguridad
    if (persona_id !== req.user.personaId) {
      return res.status(403).json({
        success: false,
        message: 'No puedes crear solicitudes para otro empleado'
      });
    }

    let archivo_id = null;

    // Procesar archivo si existe
    if (req.file) {
      const uploadDir = 'src/backend/uploads/vacaciones';
      
      try {
        await fs.mkdir(uploadDir, { recursive: true });
        const nombreArchivo = `${uuidv4()}-${req.file.originalname}`;
        const rutaArchivo = path.join(uploadDir, nombreArchivo);
        await fs.writeFile(rutaArchivo, req.file.buffer);
        console.log('📁 Archivo guardado:', rutaArchivo);
      } catch (error) {
        console.error('⚠️ Error guardando archivo:', error);
      }
    }

    const client = await db.connect();

    try {
      await client.query('BEGIN');

      const solicitudId = uuidv4();

      console.log('📝 Datos de inserción:');
      console.log('  - ID:', solicitudId);
      console.log('  - Persona ID:', persona_id);
      console.log('  - Días solicitados:', dias_solicitados);
      console.log('  - Estado: Pendiente');

      // Crear solicitud
      console.log('📝 Insertando solicitud...');
      const solicitudResult = await client.query(
        `INSERT INTO vacacion_solicitud 
         (id, persona_id, periodo, dias_solicitados, descripcion, archivo_id, estado)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, estado, fecha_solicitud`,
        [
          solicitudId,
          persona_id,
          null,
          parseFloat(dias_solicitados),
          descripcion || null,
          archivo_id,
          'Pendiente'
        ]
      );

      console.log('✅ Solicitud creada:', solicitudResult.rows[0]);

      // Crear registros de días individuales
      let diasInsertados = 0;
      if (dias_array) {
        try {
          const diasParsed = JSON.parse(dias_array);
          console.log('📅 Insertando', diasParsed.length, 'días individuales...');
          
          for (const dia of diasParsed) {
            try {
              await client.query(
                `INSERT INTO vacacion_dia 
                 (solicitud_id, fecha_dia)
                 VALUES ($1, $2)`,
                [solicitudId, dia]
              );
              console.log(`  ✅ Día insertado: ${dia}`);
              diasInsertados++;
            } catch (dayError) {
              console.warn(`  ⚠️ Error insertando día ${dia}:`, dayError.message);
            }
          }
          
          console.log(`✅ ${diasInsertados} días insertados correctamente`);
        } catch (parseError) {
          console.warn('⚠️ Error parseando array de días:', parseError.message);
        }
      }

      await client.query('COMMIT');

      console.log('🎉 Transacción completada exitosamente');

      return res.status(201).json({
        success: true,
        message: 'Solicitud de vacaciones creada exitosamente',
        data: {
          id: solicitudResult.rows[0].id,
          estado: solicitudResult.rows[0].estado,
          fecha_solicitud: solicitudResult.rows[0].fecha_solicitud,
          dias_guardados: diasInsertados
        }
      });

    } catch (error) {
      console.error('❌ Error en transacción:', error);
      console.error('❌ Mensaje de error:', error.message);
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Error al crear solicitud:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear solicitud de vacaciones',
      error: error.message
    });
  }
};

/**
 * GET SOLICITUDES VACACIONES - Obtener solicitudes del empleado
 */
export const getSolicitudesVacaciones = async (req, res) => {
  try {
    const { empleadoId } = req.params;
    const { estado } = req.query;

    console.log('📋 Obteniendo solicitudes para empleado:', empleadoId, 'Estado:', estado);

    let query = `
      SELECT 
        vs.id,
        vs.persona_id,
        vs.dias_solicitados,
        vs.descripcion,
        vs.estado,
        vs.archivo_id,
        vs.fecha_solicitud,
        vs.aprobado_por,
        vs.fecha_aprobacion
      FROM vacacion_solicitud vs
      WHERE vs.persona_id = $1
    `;

    const params = [empleadoId];
    let paramCount = 2;

    if (estado) {
      const estadoNormalizado = estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
      query += ` AND vs.estado = $${paramCount}`;
      params.push(estadoNormalizado);
      paramCount++;
      console.log('  - Filtrando por estado:', estadoNormalizado);
    }

    query += ` ORDER BY vs.fecha_solicitud DESC`;

    const result = await db.query(query, params);

    console.log('✅ Solicitudes obtenidas:', result.rows.length);

    return res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ Error al obtener solicitudes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes de vacaciones',
      error: error.message
    });
  }
};

/**
 * GET DÍAS DE UNA SOLICITUD - Obtener todos los días asociados a una solicitud
 */
export const getDiasSolicitud = async (req, res) => {
  try {
    const { solicitudId } = req.params;

    console.log('📅 Obteniendo días para solicitud:', solicitudId);

    const result = await db.query(
      `SELECT 
        id,
        solicitud_id,
        fecha_dia
      FROM vacacion_dia
      WHERE solicitud_id = $1
      ORDER BY fecha_dia ASC`,
      [solicitudId]
    );

    console.log('✅ Días obtenidos:', result.rows.length);

    return res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ Error al obtener días:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener días de la solicitud',
      error: error.message
    });
  }
};

/**
 * GET TODAS LAS SOLICITUDES - Obtener todas las solicitudes (para RH/Admin)
 */
export const todasLasSolicitudes = async (req, res) => {
  try {
    console.log('📋 Obteniendo todas las solicitudes de vacaciones...');

    const query = `
      SELECT 
        vs.id,
        vs.persona_id,
        vs.dias_solicitados,
        vs.descripcion,
        vs.estado,
        vs.archivo_id,
        vs.fecha_solicitud,
        vs.aprobado_por,
        vs.fecha_aprobacion,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        a.nombre as departamento
      FROM vacacion_solicitud vs
      LEFT JOIN persona p ON vs.persona_id = p.id
      LEFT JOIN asignacion_puesto ap ON p.id = ap.persona_id AND ap.fecha_fin IS NULL
      LEFT JOIN area a ON ap.area_id = a.id
      ORDER BY vs.fecha_solicitud DESC
    `;

    const result = await db.query(query);

    const solicitudes = result.rows.map(row => ({
      id: row.id,
      persona_id: row.persona_id,
      nombre_empleado: `${row.nombre} ${row.apellido_paterno} ${row.apellido_materno || ''}`.trim(),
      departamento: row.departamento || 'Sin asignar',
      dias_solicitados: row.dias_solicitados,
      descripcion: row.descripcion,
      estado: row.estado,
      fecha_solicitud: row.fecha_solicitud,
      aprobado_por: row.aprobado_por,
      fecha_aprobacion: row.fecha_aprobacion
    }));

    console.log('✅ Solicitudes obtenidas:', solicitudes.length);

    return res.json({
      success: true,
      data: solicitudes
    });

  } catch (error) {
    console.error('❌ Error al obtener todas las solicitudes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes de vacaciones',
      error: error.message
    });
  }
};

/**
 * PUT APROBAR SOLICITUD - Aprobar una solicitud de vacaciones
 */
export const aprobarSolicitud = async (req, res) => {
  try {
    const { solicitudId } = req.params;

    console.log('✅ Aprobando solicitud:', solicitudId);
    console.log('📝 Usuario que aprueba:', {
      personaId: req.user.personaId,
      nombre: req.user.nombre
    });

    const client = await db.connect();

    try {
      await client.query('BEGIN');

      // Actualizar estado a 'Aprobada'
      const result = await client.query(
        `UPDATE vacacion_solicitud
         SET estado = 'Aprobada', aprobado_por = $1, fecha_aprobacion = CURRENT_DATE
         WHERE id = $2
         RETURNING id, estado, fecha_aprobacion`,
        [req.user.personaId, solicitudId]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
      }

      await client.query('COMMIT');

      console.log('✅ Solicitud aprobada correctamente por:', req.user.nombre);

      return res.json({
        success: true,
        message: 'Solicitud aprobada exitosamente',
        data: result.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Error al aprobar solicitud:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al aprobar la solicitud',
      error: error.message
    });
  }
};

/**
 * PUT RECHAZAR SOLICITUD - Rechazar una solicitud de vacaciones
 */
export const rechazarSolicitud = async (req, res) => {
  try {
    const { solicitudId } = req.params;

    console.log('❌ Rechazando solicitud:', solicitudId);
    console.log('📝 Usuario que rechaza:', {
      personaId: req.user.personaId,
      nombre: req.user.nombre
    });

    const client = await db.connect();

    try {
      await client.query('BEGIN');

      // Actualizar estado a 'Rechazada'
      const result = await client.query(
        `UPDATE vacacion_solicitud
         SET estado = 'Rechazada', aprobado_por = $1, fecha_aprobacion = CURRENT_DATE
         WHERE id = $2
         RETURNING id, estado, fecha_aprobacion`,
        [req.user.personaId, solicitudId]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
      }

      await client.query('COMMIT');

      console.log('✅ Solicitud rechazada correctamente por:', req.user.nombre);

      return res.json({
        success: true,
        message: 'Solicitud rechazada',
        data: result.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Error al rechazar solicitud:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al rechazar la solicitud',
      error: error.message
    });
  }
};

/**
 * PUT CANCELAR SOLICITUD - Cancelar una solicitud aprobada
 */
export const cancelarSolicitud = async (req, res) => {
  try {
    const { solicitudId } = req.params;

    console.log('🔄 Cancelando solicitud:', solicitudId);

    const client = await db.connect();

    try {
      await client.query('BEGIN');

      // Actualizar estado a 'Cancelada'
      const result = await client.query(
        `UPDATE vacacion_solicitud
         SET estado = 'Cancelada'
         WHERE id = $1
         RETURNING id, estado, fecha_aprobacion`,
        [solicitudId]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
      }

      await client.query('COMMIT');

      console.log('✅ Solicitud cancelada correctamente');

      return res.json({
        success: true,
        message: 'Solicitud cancelada exitosamente',
        data: result.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Error al cancelar solicitud:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al cancelar la solicitud',
      error: error.message
    });
  }
};
/**
 * DELETE SOLICITUD - Eliminar una solicitud de vacaciones
 */
export const eliminarSolicitud = async (req, res) => {
  try {
    const { solicitudId } = req.params;

    console.log('🗑️ Eliminando solicitud:', solicitudId);

    const client = await db.connect();

    try {
      await client.query('BEGIN');

      // Verificar que la solicitud pertenece al usuario
      const checkResult = await client.query(
        'SELECT persona_id FROM vacacion_solicitud WHERE id = $1',
        [solicitudId]
      );

      if (checkResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
      }

      // Validar seguridad
      if (checkResult.rows[0].persona_id !== req.user.personaId) {
        await client.query('ROLLBACK');
        return res.status(403).json({
          success: false,
          message: 'No puedes eliminar solicitudes de otro empleado'
        });
      }

      // Eliminar días asociados
      await client.query(
        'DELETE FROM vacacion_dia WHERE solicitud_id = $1',
        [solicitudId]
      );

      // Eliminar solicitud
      const result = await client.query(
        'DELETE FROM vacacion_solicitud WHERE id = $1 RETURNING id',
        [solicitudId]
      );

      await client.query('COMMIT');

      console.log('✅ Solicitud eliminada correctamente');

      return res.json({
        success: true,
        message: 'Solicitud eliminada exitosamente',
        data: { id: result.rows[0].id }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Error al eliminar solicitud:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar la solicitud',
      error: error.message
    });
  }
};