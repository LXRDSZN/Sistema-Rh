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
    console.log('🔍 Iniciando getDashboardAsistencias');
    const hoy = new Date().toISOString().split('T')[0];
    console.log('📅 Fecha de hoy:', hoy);

    // Obtener conteo de empleados activos
    console.log('1️⃣ Consultando empleados activos...');
    const empleadosActivos = await db.query(
      `SELECT COUNT(DISTINCT p.id) as total
       FROM persona p
       INNER JOIN asignacion_puesto ap ON p.id = ap.persona_id
       WHERE p.tipo = 'Empleado' AND ap.fecha_fin IS NULL`
    );
    console.log('✅ Empleados activos:', empleadosActivos.rows[0]);

    // Obtener asistencias de hoy
    console.log('2️⃣ Consultando asistencias de hoy...');
    const asistenciasHoy = await db.query(
      `SELECT 
        COUNT(*) as total_registros,
        COUNT(*) FILTER (WHERE ea.codigo = 'A') as presentes,
        COUNT(*) FILTER (WHERE ea.codigo = 'R') as retardos,
        COUNT(*) FILTER (WHERE ea.codigo = 'F') as ausencias
       FROM registro_asistencias ra
       INNER JOIN estado_asistencia ea ON ra.estado_asistencia_id = ea.id
       WHERE ra.fecha = $1`,
      [hoy]
    );
    console.log('✅ Asistencias hoy:', asistenciasHoy.rows[0]);

    // Calcular inactivos (empleados sin registro hoy)
    const totalActivos = parseInt(empleadosActivos.rows[0]?.total || 0);
    const totalRegistros = parseInt(asistenciasHoy.rows[0]?.total_registros || 0);
    const inactivos = totalActivos - totalRegistros;
    console.log(`📊 Total activos: ${totalActivos}, Registros: ${totalRegistros}, Inactivos: ${inactivos}`);

    // Tasa de puntualidad del mes actual
    console.log('3️⃣ Consultando tasa de puntualidad...');
    const now = new Date();
    const primerDiaMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const primerDiaMesSiguiente = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    const puntualidad = await db.query(
      `SELECT 
        COALESCE(ROUND(
          (COUNT(*) FILTER (WHERE ea.codigo = 'A')::decimal / 
          NULLIF(COUNT(*), 0)) * 100, 
          0
        ), 0) as porcentaje
       FROM registro_asistencias ra
       INNER JOIN estado_asistencia ea ON ra.estado_asistencia_id = ea.id
       WHERE ra.fecha >= $1 AND ra.fecha < $2`,
      [primerDiaMes.toISOString().split('T')[0], primerDiaMesSiguiente.toISOString().split('T')[0]]
    );
    console.log('✅ Puntualidad:', puntualidad.rows[0]);

    // Estadísticas semanales (últimos 5 días)
    console.log('4️⃣ Consultando estadísticas semanales...');
    const estadisticasSemanales = await db.query(
      `SELECT 
        TO_CHAR(ra.fecha, 'Day') as dia,
        COUNT(*) FILTER (WHERE ea.codigo = 'R') as retardos,
        COUNT(*) FILTER (WHERE ea.codigo = 'F') as ausencias
       FROM registro_asistencias ra
       INNER JOIN estado_asistencia ea ON ra.estado_asistencia_id = ea.id
       WHERE ra.fecha >= CURRENT_DATE - INTERVAL '5 days'
       GROUP BY ra.fecha, TO_CHAR(ra.fecha, 'Day')
       ORDER BY ra.fecha`
    );
    console.log('✅ Estadísticas semanales:', estadisticasSemanales.rows);

    // Alertas - Patrones de ausencia
    console.log('5️⃣ Consultando patrones de ausencia...');
    const patronesAusencia = await db.query(
      `SELECT COUNT(DISTINCT ra.persona_id) as total
       FROM registro_asistencias ra
       INNER JOIN estado_asistencia ea ON ra.estado_asistencia_id = ea.id
       WHERE ea.codigo = 'F'
       AND ra.fecha >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY ra.persona_id
       HAVING COUNT(*) >= 2`
    );
    console.log('✅ Patrones ausencia:', patronesAusencia.rows);

    // Retardos críticos hoy (todos los retardos se consideran relevantes)
    console.log('6️⃣ Consultando retardos críticos...');
    const retardosCriticos = await db.query(
      `SELECT COUNT(*) as total
       FROM registro_asistencias ra
       INNER JOIN estado_asistencia ea ON ra.estado_asistencia_id = ea.id
       WHERE ra.fecha = $1 
       AND ea.codigo = 'R'`,
      [hoy]
    );
    console.log('✅ Retardos críticos:', retardosCriticos.rows[0]);

    const responseData = {
      estadoActual: {
        presentes: parseInt(asistenciasHoy.rows[0]?.presentes || 0),
        retardos: parseInt(asistenciasHoy.rows[0]?.retardos || 0),
        ausencias: parseInt(asistenciasHoy.rows[0]?.ausencias || 0),
        inactivos: parseInt(inactivos)
      },
      tasaPuntualidad: parseInt(puntualidad.rows[0]?.porcentaje || 0),
      estadisticasSemanales: estadisticasSemanales.rows || [],
      alertas: {
        patronesAusencia: patronesAusencia.rows.length || 0,
        retardosCriticos: parseInt(retardosCriticos.rows[0]?.total || 0),
        permisosPendientes: 0,
        accesoInactivos: 0
      }
    };

    console.log('✅ Dashboard completo:', JSON.stringify(responseData, null, 2));

    return res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('❌ Error al obtener dashboard asistencias:', error);
    console.error('Stack completo:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de asistencias',
      error: error.message,
      detail: error.detail || error.stack
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

    console.log('Tipos de incidencia encontrados:', result.rows.length);
    console.log('Tipos:', result.rows);

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
 * GET REPORTE ASISTENCIAS - Reporte detallado por área y mes
 */
export const getReporteAsistencias = async (req, res) => {
  try {
    const { mes, anio, area } = req.query;

    // Si no se especifica mes/año, usar el actual
    const fecha = mes && anio ? `${anio}-${String(mes).padStart(2, '0')}-01` : 
                  new Date().toISOString().substring(0, 10);

    // Resumen por áreas
    const resumenAreas = await db.query(
      `SELECT 
        a.id,
        a.nombre as area,
        COUNT(DISTINCT ap.persona_id) as total_empleados,
        ROUND(
          (COUNT(*) FILTER (WHERE ea.codigo = 'A')::decimal / 
          NULLIF(COUNT(*), 0)) * 100, 
          0
        ) as porcentaje_asistencia,
        COUNT(*) FILTER (WHERE ea.codigo = 'R') as retardos,
        COUNT(*) FILTER (WHERE ea.codigo = 'F' AND j.id IS NOT NULL) as faltas_justificadas,
        COUNT(*) FILTER (WHERE ea.codigo = 'F' AND j.id IS NULL) as faltas_injustificadas
      FROM area a
      LEFT JOIN asignacion_puesto ap ON a.id = ap.area_id AND ap.fecha_fin IS NULL
      LEFT JOIN registro_asistencias ra ON ap.persona_id = ra.persona_id 
        AND DATE_TRUNC('month', ra.fecha) = $1::date
      LEFT JOIN estado_asistencia ea ON ra.estado_asistencia_id = ea.id
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




    // Blindar: forzar siempre el formato 'YYYY-MM-01' para la consulta
    let fecha = new Date().toISOString().substring(0, 10);
    if (mes && anio) {
      let mesStr = String(mes).padStart(2, '0');
      fecha = `${anio}-${mesStr}`;
      // Si no termina en -01, agregarlo
      if (!fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
        fecha = `${fecha}-01`;
      }
    }

    let query = `SELECT 
        p.id,
        p.nombre || ' ' || p.apellido_paterno as empleado,
        pu.nombre as puesto,
        ARRAY_AGG(
          CASE 
            WHEN ea.codigo = 'A' THEN 'A'  -- Asistencia
            WHEN ea.codigo = 'R' THEN 'R'  -- Retardo
            WHEN ea.codigo = 'F' AND j.estado = 'aprobado' THEN 'FJ'  -- Falta Justificada
            WHEN ea.codigo = 'F' THEN 'F'  -- Falta
            WHEN ea.codigo = 'V' THEN 'V'  -- Vacaciones
            WHEN ea.codigo = 'I' THEN 'I'  -- Incidencia
            WHEN ea.codigo = 'P' THEN 'P'  -- Permiso
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
      LEFT JOIN estado_asistencia ea ON ra.estado_asistencia_id = ea.id
      LEFT JOIN justificantes j ON p.id = j.persona_id 
        AND dias.fecha BETWEEN j.fecha_inicio AND j.fecha_fin
      WHERE 1=1`;
    const params = [fecha];
    if (area_id) {
      query += ` AND ap.area_id = $2`;
      params.push(area_id);
    }
    query += ` GROUP BY p.id, p.nombre, p.apellido_paterno, pu.nombre
      ORDER BY empleado`;

    const detalle = await db.query(query, params);

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

    const fecha = mes && anio ? `${anio}-${String(mes).padStart(2, '0')}-01` : 
                  new Date().toISOString().substring(0, 10);

    // Query con los nombres correctos de las columnas
    let query = `
      SELECT 
        v.id,
        v.nombre || ' ' || COALESCE(v.apellido_paterno, '') || ' ' || COALESCE(v.apellido_materno, '') as nombre_visitante,
        v.cargo_rol,
        a.nombre as area_visitada,
        COALESCE(p.nombre || ' ' || COALESCE(p.apellido_paterno, ''), 'N/A') as persona_visitada,
        v.empresa,
        TO_CHAR(v.hora_ingreso, 'HH12:MI AM') as hora_entrada,
        TO_CHAR(v.hora_salida, 'HH12:MI AM') as hora_salida,
        v.fecha,
        v.motivo_visita
      FROM visitas v
      LEFT JOIN area a ON v.area_visitada_id = a.id
      LEFT JOIN persona p ON v.persona_visitada_id = p.id
      WHERE DATE_TRUNC('month', v.fecha) = $1::date
    `;

    const params = [fecha];
    let paramCount = 2;

    if (area && area !== 'todas') {
      query += ` AND LOWER(a.nombre) = $${paramCount}`;
      params.push(area.toLowerCase());
      paramCount++;
    }

    query += ` ORDER BY v.fecha DESC, v.hora_ingreso DESC LIMIT 100`;

    const result = await db.query(query, params);

    console.log('✅ Visitas encontradas:', result.rows.length);

    return res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ Error al obtener visitas:', error);
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

    const fecha = mes && anio ? `${anio}-${String(mes).padStart(2, '0')}-01` : 
                  new Date().toISOString().substring(0, 10);

    // Estadísticas generales del mes
    const estadisticas = await db.query(
      `SELECT 
        ROUND(
          (COUNT(*) FILTER (WHERE ea.codigo = 'A')::decimal / 
          NULLIF(COUNT(*), 0)) * 100, 
          0
        ) as promedio_asistencia,
        COUNT(*) FILTER (WHERE ea.codigo = 'R') as total_retardos,
        COUNT(*) FILTER (WHERE ea.codigo = 'F') as total_faltas,
        COALESCE(SUM(ra.horas_extra), 0) as total_horas_extra
      FROM registro_asistencias ra
      INNER JOIN estado_asistencia ea ON ra.estado_asistencia_id = ea.id
      WHERE DATE_TRUNC('month', ra.fecha) = $1::date`,
      [fecha]
    );

    // Datos detallados por empleado
    const empleados = await db.query(
      `SELECT 
        p.id as empleado_id,
        p.nombre || ' ' || p.apellido_paterno as empleado,
        a.nombre as area,
        pu.nombre as puesto,
        COUNT(DISTINCT ra.fecha) FILTER (WHERE ea.codigo IN ('A', 'R')) as dias_trabajados,
        COUNT(*) FILTER (WHERE ea.codigo = 'R') as retardos,
        COUNT(*) FILTER (WHERE ea.codigo = 'F' AND j.id IS NOT NULL) as faltas_justificadas,
        COUNT(*) FILTER (WHERE ea.codigo = 'F' AND j.id IS NULL) as faltas_injustificadas,
        COUNT(*) FILTER (WHERE ea.codigo = 'I') as incidencias,
        COALESCE(SUM(ra.horas_extra), 0) as horas_extra,
        0 as dias_festivos_trabajados
      FROM persona p
      INNER JOIN asignacion_puesto ap ON p.id = ap.persona_id AND ap.fecha_fin IS NULL
      LEFT JOIN area a ON ap.area_id = a.id
      LEFT JOIN puesto pu ON ap.puesto_id = pu.id
      LEFT JOIN registro_asistencias ra ON p.id = ra.persona_id 
        AND DATE_TRUNC('month', ra.fecha) = $1::date
      LEFT JOIN estado_asistencia ea ON ra.estado_asistencia_id = ea.id
      LEFT JOIN justificantes j ON ra.persona_id = j.persona_id 
        AND ra.fecha BETWEEN j.fecha_inicio AND j.fecha_fin
        AND j.estado = 'aprobado'
      WHERE p.tipo = 'Empleado'
      ${tipo && tipo !== 'todos' ? 'AND LOWER(a.nombre) = $2' : ''}
      GROUP BY p.id, p.nombre, p.apellido_paterno, a.nombre, pu.nombre
      HAVING COUNT(DISTINCT ra.fecha) > 0
      ORDER BY empleado`,
      tipo && tipo !== 'todos' ? [fecha, tipo.toLowerCase()] : [fecha]
    );

    return res.json({
      success: true,
      data: empleados.rows,
      periodo: fecha
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
 * POST INICIALIZAR TIPOS INCIDENCIA - Endpoint temporal para insertar tipos de incidencia
 * TODO: ELIMINAR EN PRODUCCIÓN
 */
export const inicializarTiposIncidencia = async (req, res) => {
  try {
    const tiposIncidencia = [
      { nombre: 'Enfermedad', codigo: 'ENF', descripcion: 'Incapacidad por enfermedad general' },
      { nombre: 'Cita Médica', codigo: 'CMED', descripcion: 'Cita médica programada' },
      { nombre: 'Asuntos Personales', codigo: 'ASPER', descripcion: 'Asuntos personales que requieren ausencia' },
      { nombre: 'Tráfico', codigo: 'TRAF', descripcion: 'Retraso por problemas de tráfico' },
      { nombre: 'Emergencia Familiar', codigo: 'EMFAM', descripcion: 'Emergencia con familiar directo' },
      { nombre: 'Accidente', codigo: 'ACC', descripcion: 'Accidente personal o de tránsito' },
      { nombre: 'Permiso con Goce de Sueldo', codigo: 'PCON', descripcion: 'Permiso autorizado con pago' },
      { nombre: 'Permiso sin Goce de Sueldo', codigo: 'PSIN', descripcion: 'Permiso autorizado sin pago' },
      { nombre: 'Capacitación', codigo: 'CAP', descripcion: 'Asistencia a capacitación o curso' },
      { nombre: 'Otro', codigo: 'OTR', descripcion: 'Otro tipo de incidencia' }
    ];

    const results = [];
    for (const tipo of tiposIncidencia) {
      const result = await db.query(
        `INSERT INTO tipo_incidencia (nombre, codigo, descripcion)
         VALUES ($1, $2, $3)
         ON CONFLICT (nombre) DO UPDATE 
         SET descripcion = EXCLUDED.descripcion, codigo = EXCLUDED.codigo
         RETURNING *`,
        [tipo.nombre, tipo.codigo, tipo.descripcion]
      );
      results.push(result.rows[0]);
    }

    return res.json({
      success: true,
      message: `${results.length} tipos de incidencia insertados/actualizados`,
      data: results
    });

  } catch (error) {
    console.error('Error al inicializar tipos de incidencia:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al inicializar tipos de incidencia',
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
         WHERE persona_id = $1 AND dia_semana = EXTRACT(DOW FROM CURRENT_DATE) AND activo = true`,
        [persona_id]
      );

      const horaProgramada = horarioProgramado.rows[0]?.hora_entrada || '09:00:00';
      
      // Determinar estado (presente o retardo) por código
      const codigoEstado = horaRegistro <= horaProgramada ? 'A' : 'R';
      
      // Obtener el ID del estado por código
      const estadoResult = await db.query(
        `SELECT id FROM estado_asistencia WHERE codigo = $1`,
        [codigoEstado]
      );

      result = await db.query(
        `INSERT INTO registro_asistencias 
         (persona_id, fecha, hora_entrada, hora_programada_entrada, estado_asistencia_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [persona_id, fecha, horaRegistro, horaProgramada, estadoResult.rows[0].id]
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

/**
 * POST CREAR VISITA - Registrar nueva visita
 */
export const crearVisita = async (req, res) => {
  try {
    const {
      nombre_visitante,
      cargo_rol,
      area_visitada_id,
      persona_visitada_id,
      empresa_pertenece,
      motivo_visita,
      fecha,
      hora_ingreso
    } = req.body;

    // Validaciones
    if (!nombre_visitante || !area_visitada_id) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios (nombre_visitante, area_visitada_id)'
      });
    }

    const fechaVisita = fecha || new Date().toISOString().split('T')[0];
    const horaIngreso = hora_ingreso || new Date().toTimeString().split(' ')[0];

    const result = await db.query(
      `INSERT INTO visitas 
       (nombre_visitante, cargo_rol, area_visitada_id, persona_visitada_id, 
        empresa_pertenece, motivo_visita, fecha, hora_ingreso)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [nombre_visitante, cargo_rol, area_visitada_id, persona_visitada_id, 
       empresa_pertenece, motivo_visita, fechaVisita, horaIngreso]
    );

    return res.status(201).json({
      success: true,
      message: 'Visita registrada exitosamente',
      data: { id: result.rows[0].id }
    });

  } catch (error) {
    console.error('Error al crear visita:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al registrar visita',
      error: error.message
    });
  }
};

/**
 * PUT ACTUALIZAR VISITA - Registrar hora de salida
 */
export const actualizarVisita = async (req, res) => {
  try {
    const { id } = req.params;
    const { hora_salida } = req.body;

    if (!hora_salida) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere hora_salida'
      });
    }

    const result = await db.query(
      `UPDATE visitas
       SET hora_salida = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id`,
      [hora_salida, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Visita no encontrada'
      });
    }

    return res.json({
      success: true,
      message: 'Hora de salida registrada',
      data: { id: result.rows[0].id }
    });

  } catch (error) {
    console.error('Error al actualizar visita:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar visita',
      error: error.message
    });
  }
};

/**
 * GET CHECADAS DE HOY - Listar registros de asistencia (pase de lista)
 */
export const getChecadasHoy = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
         ch.id AS registro_id,
         ch.tipo,
         ch.fecha,
         ch.hora,
         p.nombre,
         p.apellido_paterno,
         p.apellido_materno,
         pu.nombre AS puesto,
         a.nombre AS area
       FROM checada ch
       INNER JOIN persona p ON ch.persona_id = p.id
       LEFT JOIN asignacion_puesto ap ON p.id = ap.persona_id AND ap.fecha_fin IS NULL
       LEFT JOIN puesto pu ON ap.puesto_id = pu.id
       LEFT JOIN area a ON ap.area_id = a.id
       WHERE ch.fecha = CURRENT_DATE
       ORDER BY ch.hora DESC`
    );

    const data = result.rows.map(row => ({
      registro_id: row.registro_id,
      empleado: {
        nombre_completo: `${row.nombre} ${row.apellido_paterno} ${row.apellido_materno || ''}`.trim(),
        area: row.area || 'Sin área',
        puesto: row.puesto || 'Sin puesto',
        turno: 'No especificado'
      },
      registro: {
        tipo: row.tipo,
        fecha: row.fecha,
        hora: row.hora
      }
    }));

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error al obtener checadas de hoy:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener checadas de hoy',
      error: error.message
    });
  }
};

/**
 * POST REGISTRAR ASISTENCIA POR HUELLA - Sistema de pase de lista con sensor
 */
export const registrarAsistenciaPorHuella = async (req, res) => {
  try {
    const { huella_id } = req.body;

    console.log('Iniciando registro de asistencia por huella:', huella_id);

    if (!huella_id && huella_id !== 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere huella_id'
      });
    }

    // 1. Buscar el contrato con ese huella_id para obtener persona_id
    const contratoResult = await db.query(
      `SELECT c.persona_id, p.nombre, p.apellido_paterno, p.apellido_materno,
              pu.nombre as puesto, a.nombre as area
       FROM contrato c
       INNER JOIN persona p ON c.persona_id = p.id
       LEFT JOIN asignacion_puesto ap ON p.id = ap.persona_id AND ap.fecha_fin IS NULL
       LEFT JOIN puesto pu ON ap.puesto_id = pu.id
       LEFT JOIN area a ON ap.area_id = a.id
       WHERE c.huella_id = $1
       LIMIT 1`,
      [huella_id]
    );

    if (contratoResult.rows.length === 0) {
      console.log('No se encontró contrato con huella_id:', huella_id);
      return res.status(404).json({
        success: false,
        message: 'No se encontró empleado con esta huella'
      });
    }

    const empleado = contratoResult.rows[0];
    const persona_id = empleado.persona_id;
    const fecha = new Date().toISOString().split('T')[0];
    const hora = new Date().toTimeString().split(' ')[0];

    console.log('Empleado encontrado:', {
      persona_id,
      nombre: `${empleado.nombre} ${empleado.apellido_paterno}`,
      fecha,
      hora
    });

    // 2. Verificar si ya tiene registros del día en la tabla checada
    const registrosHoy = await db.query(
      `SELECT id, tipo, hora
       FROM checada
       WHERE persona_id = $1 AND fecha = $2
       ORDER BY hora`,
      [persona_id, fecha]
    );

    let tipo;
    let mensaje;

    // 3. Lógica para determinar ENTRADA o SALIDA
    if (registrosHoy.rows.length === 0) {
      // No tiene registros hoy -> ENTRADA
      tipo = 'entrada';
      mensaje = 'Entrada registrada';
    } else if (registrosHoy.rows.length === 1 && registrosHoy.rows[0].tipo === 'entrada') {
      // Tiene entrada pero no salida -> SALIDA
      tipo = 'salida';
      mensaje = 'Salida registrada';
    } else if (registrosHoy.rows.length >= 2) {
      // Ya tiene entrada y salida -> No permitir más registros
      console.log('Ya tiene entrada y salida registradas');
      return res.status(400).json({
        success: false,
        message: 'Ya se registraron entrada y salida para hoy',
        data: {
          empleado: {
            nombre_completo: `${empleado.nombre} ${empleado.apellido_paterno} ${empleado.apellido_materno || ''}`.trim(),
            area: empleado.area,
            puesto: empleado.puesto,
            turno: empleado.turno
          },
          registros: registrosHoy.rows
        }
      });
    } else {
      // Caso edge: tiene salida pero no entrada (no debería pasar, pero lo manejamos)
      tipo = 'entrada';
      mensaje = 'Entrada registrada (corrección)';
    }

    // 4. Insertar el registro en la tabla checada
    const insertResult = await db.query(
      `INSERT INTO checada (persona_id, fecha, hora, tipo)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [persona_id, fecha, hora, tipo]
    );

    console.log('Registro insertado en checada:', insertResult.rows[0].id);

    // 5. Retornar información completa del empleado y el registro
    return res.status(201).json({
      success: true,
      message: mensaje,
      data: {
        registro_id: insertResult.rows[0].id,
        empleado: {
          nombre_completo: `${empleado.nombre} ${empleado.apellido_paterno} ${empleado.apellido_materno || ''}`.trim(),
          area: empleado.area || 'Sin área',
          puesto: empleado.puesto || 'Sin puesto',
          turno: empleado.turno || 'No especificado'
        },
        registro: {
          tipo: tipo,
          fecha: fecha,
          hora: hora
        }
      }
    });

  } catch (error) {
    console.error('Error al registrar asistencia por huella:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al registrar asistencia',
      error: error.message
    });
  }
};
