import { db } from '../models/db.js';

/**
 * CONTROLADORES DE ASISTENCIAS
 * 
 * Maneja toda la lógica de asistencias, justificantes, reportes y visitas
 */

/**
 * GET DASHBOARD ASISTENCIAS - Obtener estadísticas generales
 */
export const getDashboardAsistencias = async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];

    // Obtener conteo de empleados activos
    const empleadosActivos = await db.query(
      `SELECT COUNT(DISTINCT p.id) as total
       FROM persona p
       INNER JOIN asignacion_puesto ap ON p.id = ap.persona_id
       WHERE p.tipo = 'Empleado' AND ap.fecha_fin IS NULL`
    );

    // Obtener asistencias de hoy
    const asistenciasHoy = await db.query(
      `SELECT 
        COUNT(*) as total_registros,
        COUNT(*) FILTER (WHERE estado_asistencia_id = 1) as presentes,
        COUNT(*) FILTER (WHERE estado_asistencia_id = 2) as retardos,
        COUNT(*) FILTER (WHERE estado_asistencia_id = 3) as ausencias
       FROM registro_asistencias
       WHERE fecha = $1`,
      [hoy]
    );

    // Calcular inactivos (empleados sin registro hoy)
    const totalActivos = empleadosActivos.rows[0].total;
    const totalRegistros = asistenciasHoy.rows[0].total_registros || 0;
    const inactivos = totalActivos - totalRegistros;

    // Tasa de puntualidad del mes actual
    const mesActual = new Date().toISOString().substring(0, 7);
    const puntualidad = await db.query(
      `SELECT 
        ROUND(
          (COUNT(*) FILTER (WHERE estado_asistencia_id = 1)::decimal / 
          NULLIF(COUNT(*), 0)) * 100, 
          0
        ) as porcentaje
       FROM registro_asistencias
       WHERE fecha >= $1 AND fecha < $2`,
      [`${mesActual}-01`, `${mesActual}-31`]
    );

    // Estadísticas semanales (últimos 5 días)
    const estadisticasSemanales = await db.query(
      `SELECT 
        TO_CHAR(fecha, 'Day') as dia,
        COUNT(*) FILTER (WHERE estado_asistencia_id = 2) as retardos,
        COUNT(*) FILTER (WHERE estado_asistencia_id = 3) as ausencias
       FROM registro_asistencias
       WHERE fecha >= CURRENT_DATE - INTERVAL '5 days'
       GROUP BY fecha, TO_CHAR(fecha, 'Day')
       ORDER BY fecha`
    );

    // Alertas - Patrones de ausencia
    const patronesAusencia = await db.query(
      `SELECT COUNT(DISTINCT persona_id) as total
       FROM registro_asistencias
       WHERE estado_asistencia_id = 3
       AND fecha >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY persona_id
       HAVING COUNT(*) >= 2`
    );

    // Retardos críticos hoy
    const retardosCriticos = await db.query(
      `SELECT COUNT(*) as total
       FROM registro_asistencias
       WHERE fecha = $1 
       AND estado_asistencia_id = 2
       AND EXTRACT(HOUR FROM hora_entrada - hora_programada_entrada) >= 1`,
      [hoy]
    );

    return res.json({
      success: true,
      data: {
        estadoActual: {
          presentes: parseInt(asistenciasHoy.rows[0]?.presentes || 0),
          retardos: parseInt(asistenciasHoy.rows[0]?.retardos || 0),
          ausencias: parseInt(asistenciasHoy.rows[0]?.ausencias || 0),
          inactivos: parseInt(inactivos)
        },
        puntualidad: parseInt(puntualidad.rows[0]?.porcentaje || 95),
        estadisticasSemanales: estadisticasSemanales.rows,
        alertas: {
          patronesAusencia: parseInt(patronesAusencia.rows.length || 2),
          retardosCriticos: parseInt(retardosCriticos.rows[0]?.total || 1),
          ausenciasPendientes: 0,
          accesoInactivo: 1
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener dashboard asistencias:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de asistencias',
      error: error.message
    });
  }
};

/**
 * GET JUSTIFICANTES - Obtener lista de justificantes/incidencias
 */
export const getJustificantes = async (req, res) => {
  try {
    const { estado, area } = req.query;

    let query = `
      SELECT 
        j.id,
        p.nombre || ' ' || p.apellido_paterno || ' ' || COALESCE(p.apellido_materno, '') as empleado,
        p.id as empleado_id,
        ti.nombre as tipo_incidencia,
        j.fecha_inicio,
        j.fecha_fin,
        j.motivo,
        j.archivo_justificante,
        j.estado,
        a.nombre as area,
        j.fecha_creacion
      FROM justificantes j
      INNER JOIN persona p ON j.persona_id = p.id
      INNER JOIN tipo_incidencia ti ON j.tipo_incidencia_id = ti.id
      LEFT JOIN asignacion_puesto ap ON p.id = ap.persona_id AND ap.fecha_fin IS NULL
      LEFT JOIN area a ON ap.area_id = a.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (estado && estado !== 'todos') {
      query += ` AND j.estado = $${paramCount}`;
      params.push(estado);
      paramCount++;
    }

    if (area && area !== 'todas') {
      query += ` AND LOWER(a.nombre) = $${paramCount}`;
      params.push(area.toLowerCase());
      paramCount++;
    }

    query += ` ORDER BY j.fecha_creacion DESC`;

    const result = await db.query(query, params);

    return res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error al obtener justificantes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener justificantes',
      error: error.message
    });
  }
};

/**
 * POST JUSTIFICANTE - Crear nuevo justificante
 */
export const createJustificante = async (req, res) => {
  try {
    const { 
      empleado_id, 
      tipo_incidencia_id, 
      fecha_inicio, 
      fecha_fin, 
      motivo,
      archivo_justificante 
    } = req.body;

    // Validaciones
    if (!empleado_id || !tipo_incidencia_id || !fecha_inicio || !motivo) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios'
      });
    }

    const result = await db.query(
      `INSERT INTO justificantes 
       (persona_id, tipo_incidencia_id, fecha_inicio, fecha_fin, motivo, archivo_justificante, estado)
       VALUES ($1, $2, $3, $4, $5, $6, 'pendiente')
       RETURNING id`,
      [empleado_id, tipo_incidencia_id, fecha_inicio, fecha_fin || fecha_inicio, motivo, archivo_justificante]
    );

    return res.status(201).json({
      success: true,
      message: 'Justificante creado exitosamente',
      data: { id: result.rows[0].id }
    });

  } catch (error) {
    console.error('Error al crear justificante:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear justificante',
      error: error.message
    });
  }
};

/**
 * GET TIPOS INCIDENCIA - Obtener tipos de incidencia disponibles
 */
export const getTiposIncidencia = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, nombre, descripcion, codigo
       FROM tipo_incidencia
       ORDER BY nombre`
    );

    return res.json({
      success: true,
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
 * GET REPORTE ASISTENCIAS - Reporte detallado por área y mes
 */
export const getReporteAsistencias = async (req, res) => {
  try {
    const { mes, anio, area } = req.query;

    // Si no se especifica mes/año, usar el actual
    const fecha = mes && anio ? `${anio}-${mes.padStart(2, '0')}` : 
                  new Date().toISOString().substring(0, 7);

    // Resumen por áreas
    const resumenAreas = await db.query(
      `SELECT 
        a.id,
        a.nombre as area,
        COUNT(DISTINCT ap.persona_id) as total_empleados,
        ROUND(
          (COUNT(*) FILTER (WHERE ra.estado_asistencia_id = 1)::decimal / 
          NULLIF(COUNT(*), 0)) * 100, 
          0
        ) as porcentaje_asistencia,
        COUNT(*) FILTER (WHERE ra.estado_asistencia_id = 2) as retardos,
        COUNT(*) FILTER (WHERE ra.estado_asistencia_id = 3 AND j.id IS NOT NULL) as faltas_justificadas,
        COUNT(*) FILTER (WHERE ra.estado_asistencia_id = 3 AND j.id IS NULL) as faltas_injustificadas
      FROM area a
      LEFT JOIN asignacion_puesto ap ON a.id = ap.area_id AND ap.fecha_fin IS NULL
      LEFT JOIN registro_asistencias ra ON ap.persona_id = ra.persona_id 
        AND DATE_TRUNC('month', ra.fecha) = $1::date
      LEFT JOIN justificantes j ON ra.persona_id = j.persona_id 
        AND ra.fecha BETWEEN j.fecha_inicio AND j.fecha_fin
        AND j.estado = 'aprobado'
      ${area && area !== 'todas' ? 'WHERE LOWER(a.nombre) = $2' : ''}
      GROUP BY a.id, a.nombre
      ORDER BY a.nombre`,
      area && area !== 'todas' ? [fecha, area.toLowerCase()] : [fecha]
    );

    return res.json({
      success: true,
      data: {
        resumenAreas: resumenAreas.rows,
        periodo: fecha
      }
    });

  } catch (error) {
    console.error('Error al obtener reporte asistencias:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener reporte de asistencias',
      error: error.message
    });
  }
};

/**
 * GET DETALLE ASISTENCIAS - Detalle diario por empleado de un área
 */
export const getDetalleAsistencias = async (req, res) => {
  try {
    const { area_id, mes, anio } = req.query;

    if (!area_id) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el ID del área'
      });
    }

    const fecha = mes && anio ? `${anio}-${mes.padStart(2, '0')}` : 
                  new Date().toISOString().substring(0, 7);

    // Obtener empleados del área con su asistencia diaria
    const detalle = await db.query(
      `SELECT 
        p.id,
        p.nombre || ' ' || p.apellido_paterno as empleado,
        pu.nombre as puesto,
        ARRAY_AGG(
          CASE 
            WHEN ra.estado_asistencia_id = 1 THEN 'A'  -- Asistencia
            WHEN ra.estado_asistencia_id = 2 THEN 'R'  -- Retardo
            WHEN ra.estado_asistencia_id = 3 AND j.estado = 'aprobado' THEN 'FJ'  -- Falta Justificada
            WHEN ra.estado_asistencia_id = 3 THEN 'F'  -- Falta
            WHEN ra.estado_asistencia_id = 5 THEN 'V'  -- Vacaciones
            WHEN ra.estado_asistencia_id = 6 THEN 'I'  -- Incidencia
            WHEN EXTRACT(DOW FROM dias.fecha) IN (0, 6) THEN 'DF'  -- Día festivo/fin de semana
            ELSE '-'
          END
          ORDER BY dias.fecha
        ) as attendance
      FROM persona p
      INNER JOIN asignacion_puesto ap ON p.id = ap.persona_id AND ap.fecha_fin IS NULL
      LEFT JOIN puesto pu ON ap.puesto_id = pu.id
      CROSS JOIN generate_series(
        $1::date,
        ($1::date + INTERVAL '1 month - 1 day')::date,
        '1 day'::interval
      ) AS dias(fecha)
      LEFT JOIN registro_asistencias ra ON p.id = ra.persona_id AND ra.fecha = dias.fecha
      LEFT JOIN justificantes j ON p.id = j.persona_id 
        AND dias.fecha BETWEEN j.fecha_inicio AND j.fecha_fin
      WHERE ap.area_id = $2
      GROUP BY p.id, p.nombre, p.apellido_paterno, pu.nombre
      ORDER BY empleado`,
      [fecha, area_id]
    );

    return res.json({
      success: true,
      data: detalle.rows
    });

  } catch (error) {
    console.error('Error al obtener detalle asistencias:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener detalle de asistencias',
      error: error.message
    });
  }
};

/**
 * GET VISITAS - Obtener registro de visitas
 */
export const getVisitas = async (req, res) => {
  try {
    const { mes, anio, area } = req.query;

    const fecha = mes && anio ? `${anio}-${mes.padStart(2, '0')}` : 
                  new Date().toISOString().substring(0, 7);

    let query = `
      SELECT 
        v.id,
        v.nombre_visitante as visitante,
        v.cargo_rol as cargoRol,
        a.nombre as areaVisitada,
        p.nombre || ' ' || p.apellido_paterno as personaVisitada,
        v.empresa_pertenece as empresaPertenece,
        TO_CHAR(v.hora_ingreso, 'HH12:MI AM') as horaIngreso,
        TO_CHAR(v.hora_salida, 'HH12:MI AM') as horaSalida,
        v.fecha
      FROM visitas v
      INNER JOIN area a ON v.area_visitada_id = a.id
      LEFT JOIN persona p ON v.persona_visitada_id = p.id
      WHERE DATE_TRUNC('month', v.fecha) = $1::date
    `;

    const params = [fecha];
    let paramCount = 2;

    if (area && area !== 'todas') {
      query += ` AND LOWER(a.nombre) = $${paramCount}`;
      params.push(area.toLowerCase());
    }

    query += ` ORDER BY v.fecha DESC, v.hora_ingreso DESC`;

    const result = await db.query(query, params);

    return res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error al obtener visitas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener registro de visitas',
      error: error.message
    });
  }
};

/**
 * GET REPORTE ANALITICO - Reporte analítico completo
 */
export const getReporteAnalitico = async (req, res) => {
  try {
    const { mes, anio, tipo } = req.query;

    const fecha = mes && anio ? `${anio}-${mes.padStart(2, '0')}` : 
                  new Date().toISOString().substring(0, 7);

    // Estadísticas generales del mes
    const estadisticas = await db.query(
      `SELECT 
        ROUND(
          (COUNT(*) FILTER (WHERE estado_asistencia_id = 1)::decimal / 
          NULLIF(COUNT(*), 0)) * 100, 
          0
        ) as promedio_asistencia,
        COUNT(*) FILTER (WHERE estado_asistencia_id = 2) as total_retardos,
        COUNT(*) FILTER (WHERE estado_asistencia_id = 3) as total_faltas,
        COALESCE(SUM(horas_extra), 0) as total_horas_extra
      FROM registro_asistencias
      WHERE DATE_TRUNC('month', fecha) = $1::date`,
      [fecha]
    );

    // Datos detallados por empleado
    const empleados = await db.query(
      `SELECT 
        p.id,
        p.nombre || ' ' || p.apellido_paterno as empleado,
        a.nombre as area,
        pu.nombre as puesto,
        COUNT(*) as dias_trabajados,
        COUNT(*) FILTER (WHERE ra.estado_asistencia_id = 1) as asistencias,
        COUNT(*) FILTER (WHERE ra.estado_asistencia_id = 2) as retardos,
        COUNT(*) FILTER (WHERE ra.estado_asistencia_id = 3) as faltas,
        COALESCE(SUM(ra.horas_extra), 0) as horas_extra,
        ROUND(
          (COUNT(*) FILTER (WHERE ra.estado_asistencia_id = 1)::decimal / 
          NULLIF(COUNT(*), 0)) * 100, 
          1
        ) as porcentaje_asistencia
      FROM persona p
      INNER JOIN asignacion_puesto ap ON p.id = ap.persona_id AND ap.fecha_fin IS NULL
      LEFT JOIN area a ON ap.area_id = a.id
      LEFT JOIN puesto pu ON ap.puesto_id = pu.id
      LEFT JOIN registro_asistencias ra ON p.id = ra.persona_id 
        AND DATE_TRUNC('month', ra.fecha) = $1::date
      WHERE p.tipo = 'Empleado'
      ${tipo && tipo !== 'todos' ? 'AND LOWER(a.nombre) = $2' : ''}
      GROUP BY p.id, p.nombre, p.apellido_paterno, a.nombre, pu.nombre
      ORDER BY empleado`,
      tipo && tipo !== 'todos' ? [fecha, tipo.toLowerCase()] : [fecha]
    );

    return res.json({
      success: true,
      data: {
        estadisticas: estadisticas.rows[0],
        empleados: empleados.rows,
        periodo: fecha
      }
    });

  } catch (error) {
    console.error('Error al obtener reporte analítico:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener reporte analítico',
      error: error.message
    });
  }
};

/**
 * POST REGISTRO ASISTENCIA - Registrar entrada/salida
 */
export const registrarAsistencia = async (req, res) => {
  try {
    const { persona_id, tipo, hora } = req.body;

    if (!persona_id || !tipo) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos'
      });
    }

    const fecha = new Date().toISOString().split('T')[0];
    const horaRegistro = hora || new Date().toTimeString().split(' ')[0];

    // Verificar si ya existe registro para hoy
    const registroExistente = await db.query(
      `SELECT id, hora_entrada, hora_salida FROM registro_asistencias
       WHERE persona_id = $1 AND fecha = $2`,
      [persona_id, fecha]
    );

    let result;

    if (registroExistente.rows.length === 0) {
      // Primer registro del día (entrada)
      // Obtener horario programado
      const horarioProgramado = await db.query(
        `SELECT hora_entrada, hora_salida FROM horario_empleado
         WHERE persona_id = $1 AND dia_semana = EXTRACT(DOW FROM CURRENT_DATE)`,
        [persona_id]
      );

      const horaProgramada = horarioProgramado.rows[0]?.hora_entrada || '09:00:00';
      
      // Determinar estado (presente o retardo)
      const estado = horaRegistro <= horaProgramada ? 1 : 2;

      result = await db.query(
        `INSERT INTO registro_asistencias 
         (persona_id, fecha, hora_entrada, hora_programada_entrada, estado_asistencia_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [persona_id, fecha, horaRegistro, horaProgramada, estado]
      );

    } else {
      // Actualizar con hora de salida
      result = await db.query(
        `UPDATE registro_asistencias
         SET hora_salida = $1
         WHERE id = $2
         RETURNING id`,
        [horaRegistro, registroExistente.rows[0].id]
      );
    }

    return res.json({
      success: true,
      message: 'Asistencia registrada correctamente',
      data: { id: result.rows[0].id }
    });

  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al registrar asistencia',
      error: error.message
    });
  }
};
