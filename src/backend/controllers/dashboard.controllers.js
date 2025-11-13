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
    // 1. Total de empleados
    const totalEmpleadosResult = await db.query(
      `SELECT COUNT(*) as total FROM persona WHERE tipo = 'Empleado'`
    );
    const totalEmpleados = parseInt(totalEmpleadosResult.rows[0].total);

    // 2. Nuevos empleados este mes (basado en fecha_inicio de asignación_puesto)
    const nuevosEmpleadosResult = await db.query(
      `SELECT COUNT(DISTINCT persona_id) as total 
       FROM asignacion_puesto 
       WHERE fecha_inicio >= DATE_TRUNC('month', CURRENT_DATE)
       AND fecha_inicio < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'`
    );
    const nuevosEmpleados = parseInt(nuevosEmpleadosResult.rows[0].total);

    // 3. Empleados activos (con asignación de puesto activa)
    const activosHoyResult = await db.query(
      `SELECT COUNT(DISTINCT ap.persona_id) as total 
       FROM asignacion_puesto ap
       INNER JOIN persona p ON ap.persona_id = p.id
       WHERE ap.fecha_fin IS NULL
       AND p.tipo = 'Empleado'`
    );
    const activosHoy = parseInt(activosHoyResult.rows[0].total);

    // 4. Calcular porcentajes
    const porcentajeCrecimiento = totalEmpleados > 0 ? ((nuevosEmpleados / totalEmpleados) * 100) : 0;
    const porcentajeNuevos = nuevosEmpleados > 0 ? ((nuevosEmpleados / totalEmpleados) * 100) : 0;

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
          total: activosHoy,
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
        COUNT(DISTINCT ap.persona_id) as total
      FROM area a
      LEFT JOIN asignacion_puesto ap ON a.id = ap.area_id AND ap.fecha_fin IS NULL
      LEFT JOIN persona p ON ap.persona_id = p.id AND p.tipo = 'Empleado'
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
        COUNT(*) as count
      FROM persona p
      JOIN sexo s ON p.sexo_id = s.id
      WHERE p.tipo = 'Empleado' AND p.fecha_nacimiento IS NOT NULL
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
