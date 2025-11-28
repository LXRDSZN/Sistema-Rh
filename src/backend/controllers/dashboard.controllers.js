import { db } from '../models/db.js';

/**
 * CONTROLADORES DE DASHBOARD
 * 
 * Maneja las estadísticas y métricas del dashboard
 */

/**
 * GET DASHBOARD STATS - Obtener estadísticas generales del dashboard
 */
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Total de empleados con contratos activos
    const totalEmpleadosResult = await db.query(
      `SELECT COUNT(DISTINCT c.persona_id) as total 
       FROM contrato c
       INNER JOIN estado_contrato ec ON ec.id = c.estado_id
       INNER JOIN persona p ON p.id = c.persona_id
       WHERE ec.nombre ILIKE 'ACTIVO'
       AND p.tipo = 'Empleado'
       AND (c.fecha_fin IS NULL OR c.fecha_fin >= CURRENT_DATE)`
    );
    const totalEmpleados = parseInt(totalEmpleadosResult.rows[0].total);

    // 2. Nuevos empleados este mes (con contratos activos iniciados este mes)
    const nuevosEmpleadosResult = await db.query(
      `SELECT COUNT(DISTINCT c.persona_id) as total 
       FROM contrato c
       INNER JOIN estado_contrato ec ON ec.id = c.estado_id
       INNER JOIN persona p ON p.id = c.persona_id
       WHERE ec.nombre ILIKE 'ACTIVO'
       AND p.tipo = 'Empleado'
       AND c.fecha_inicio >= DATE_TRUNC('month', CURRENT_DATE)
       AND c.fecha_inicio < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'`
    );
    const nuevosEmpleados = parseInt(nuevosEmpleadosResult.rows[0].total);

    // 2b. Total de empleados con contratos activos el mes pasado
    const totalEmpleadosMesPasadoResult = await db.query(
      `SELECT COUNT(DISTINCT c.persona_id) as total 
       FROM contrato c
       INNER JOIN estado_contrato ec ON ec.id = c.estado_id
       INNER JOIN persona p ON p.id = c.persona_id
       WHERE ec.nombre ILIKE 'ACTIVO'
       AND p.tipo = 'Empleado'
       AND c.fecha_inicio < DATE_TRUNC('month', CURRENT_DATE)
       AND (c.fecha_fin IS NULL OR c.fecha_fin >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day')`
    );
    const totalEmpleadosMesPasado = parseInt(totalEmpleadosMesPasadoResult.rows[0].total);

    // 3. Usuarios con sesión activa en el sistema (conectados ahora)
    let sesionesActivas = 0;
    try {
      const sesionesActivasResult = await db.query(
        `SELECT COUNT(DISTINCT usuario_id) as total 
         FROM sesiones_activas
         WHERE expiracion > NOW()`
      );
      sesionesActivas = parseInt(sesionesActivasResult.rows[0]?.total || 0);
      console.log('✅ Sesiones activas encontradas:', sesionesActivas);
    } catch (sessionError) {
      console.error('⚠️ Error al consultar sesiones activas (tabla puede no existir):', sessionError.message);
      // Si la tabla no existe, usar 0
      sesionesActivas = 0;
    }

    // 4. Calcular porcentajes
    // Porcentaje de crecimiento: comparar total actual con total del mes pasado
    const porcentajeCrecimiento = totalEmpleadosMesPasado > 0 
      ? ((totalEmpleados - totalEmpleadosMesPasado) / totalEmpleadosMesPasado * 100) 
      : 0;
    
    // Porcentaje de nuevos respecto al total
    const porcentajeNuevos = totalEmpleados > 0 
      ? (nuevosEmpleados / totalEmpleados * 100) 
      : 0;

    return res.json({
      success: true,
      data: {
        nuevosEmpleados: {
          total: nuevosEmpleados,
          porcentaje: Math.round(porcentajeNuevos),
          tendencia: nuevosEmpleados > 0 ? 'up' : 'neutral'
        },
        totalEmpleados: {
          total: totalEmpleados,
          porcentaje: Math.round(porcentajeCrecimiento),
          tendencia: porcentajeCrecimiento > 0 ? 'up' : porcentajeCrecimiento < 0 ? 'down' : 'neutral'
        },
        asistenciasActivas: {
          total: sesionesActivas,
          emoji: '💻📊📈',
          tendencia: 'neutral'
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

/**
 * GET EMPLEADOS POR AREA - Obtener distribución de empleados por área
 */
export const getEmpleadosPorArea = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        a.nombre as area,
        COUNT(DISTINCT c.persona_id) as total
      FROM area a
      LEFT JOIN contrato c ON a.id = c.area_id
      LEFT JOIN estado_contrato ec ON ec.id = c.estado_id
      LEFT JOIN persona p ON c.persona_id = p.id
      WHERE (c.id IS NULL OR (
        ec.nombre ILIKE 'ACTIVO'
        AND p.tipo = 'Empleado'
        AND (c.fecha_fin IS NULL OR c.fecha_fin >= CURRENT_DATE)
      ))
      GROUP BY a.id, a.nombre
      ORDER BY 
        CASE a.nombre
          WHEN 'Asistencias' THEN 1
          WHEN 'Contratos' THEN 2
          WHEN 'Vacaciones' THEN 3
          WHEN 'Incidencias' THEN 4
          WHEN 'Areas' THEN 5
          ELSE 6
        END`
    );

    const empleadosPorArea = result.rows.map(row => ({
      area: row.area === 'Contratos' ? 'Documentación' : row.area,
      total: parseInt(row.total || 0)
    }));

    return res.json({
      success: true,
      data: empleadosPorArea
    });

  } catch (error) {
    console.error('Error al obtener empleados por área:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener empleados por área',
      error: error.message
    });
  }
};

/**
 * GET DEMOGRAFIA - Obtener estadísticas de edad y género
 */
export const getDemografia = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        s.nombre as genero,
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.fecha_nacimiento)) BETWEEN 18 AND 24 THEN '18-24'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.fecha_nacimiento)) BETWEEN 25 AND 34 THEN '25-34'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.fecha_nacimiento)) BETWEEN 35 AND 44 THEN '35-44'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.fecha_nacimiento)) BETWEEN 45 AND 64 THEN '45-64'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.fecha_nacimiento)) >= 65 THEN '65+'
          ELSE 'Desconocido'
        END as rango_edad,
        COUNT(DISTINCT p.id) as count
      FROM persona p
      INNER JOIN contrato c ON c.persona_id = p.id
      INNER JOIN estado_contrato ec ON ec.id = c.estado_id
      INNER JOIN sexo s ON p.sexo_id = s.id
      WHERE ec.nombre ILIKE 'ACTIVO'
      AND p.tipo = 'Empleado' 
      AND p.fecha_nacimiento IS NOT NULL
      AND (c.fecha_fin IS NULL OR c.fecha_fin >= CURRENT_DATE)
      GROUP BY s.nombre, rango_edad
      ORDER BY rango_edad, s.nombre`
    );

    const estadisticas = result.rows.map(row => ({
      _id: {
        rangoEdad: row.rango_edad,
        genero: row.genero
      },
      count: parseInt(row.count)
    }));

    return res.json({
      success: true,
      data: estadisticas
    });

  } catch (error) {
    console.error('Error al obtener demografía:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas demográficas',
      error: error.message
    });
  }
};

/**
 * GET EMPLEADOS SIN CORREO - Obtener empleados con contratos activos que no tienen correo registrado
 */
export const getEmpleadosSinCorreo = async (req, res) => {
  try {
    console.log('📋 Consultando empleados sin correo...');
    
    // Primero verificar si existe la tabla usuario
    const checkUsuarioTable = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuario'
      );
    `);
    
    console.log('¿Existe tabla usuario?', checkUsuarioTable.rows[0].exists);
    
    const result = await db.query(
      `SELECT DISTINCT ON (p.id)
        p.id,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        p.fecha_nacimiento,
        s.nombre as sexo,
        c.id as contrato_id,
        c.salario_mensual,
        c.fecha_inicio,
        c.fecha_fin,
        c.tipo_contrato,
        c.modalidad,
        c.observaciones,
        a.nombre as area,
        pu.nombre as puesto,
        ec.nombre as estado_contrato
      FROM persona p
      INNER JOIN contrato c ON c.persona_id = p.id
      INNER JOIN estado_contrato ec ON ec.id = c.estado_id
      LEFT JOIN sexo s ON p.sexo_id = s.id
      LEFT JOIN area a ON c.area_id = a.id
      LEFT JOIN puesto pu ON c.puesto_id = pu.id
      WHERE ec.nombre ILIKE 'ACTIVO'
      AND p.tipo = 'Empleado'
      AND (c.fecha_fin IS NULL OR c.fecha_fin >= CURRENT_DATE)
      AND NOT EXISTS (
        SELECT 1 FROM usuario u WHERE u.persona_id = p.id
      )
      ORDER BY p.id, c.fecha_inicio DESC`
    );

    console.log(`✅ Encontrados ${result.rows.length} empleados sin correo`);
    console.log('Datos:', JSON.stringify(result.rows, null, 2));

    return res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ Error al obtener empleados sin correo:', error);
    console.error('Detalles del error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    return res.status(500).json({
      success: false,
      message: 'Error al obtener empleados sin correo',
      error: error.message,
      details: error.code
    });
  }
};
