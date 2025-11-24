import express from 'express';
import pool from '../models/db.js';
import { verificarToken } from '../middleware/authMiddleware.js';
const router = express.Router();

// ========================================
// 1. OBTENER ESTADÍSTICAS DEL DASHBOARD
// ========================================
router.get('/contratos/stats', async (req, res) => {
    try {
        // Contratos activos
        const activosQuery = `
            SELECT COUNT(*) AS total
            FROM contrato c
            INNER JOIN estado_contrato ec ON ec.id = c.estado_id
            WHERE ec.nombre ILIKE 'ACTIVO'
            AND (c.fecha_fin IS NULL OR c.fecha_fin > CURRENT_DATE + INTERVAL '30 days')
        `;
        const activos = await pool.query(activosQuery);

        // Contratos próximos a vencer (30 días)
        const proximosQuery = `
            SELECT COUNT(*) AS total
            FROM contrato c
            INNER JOIN estado_contrato ec ON ec.id = c.estado_id
            WHERE ec.nombre ILIKE 'ACTIVO'
              AND c.fecha_fin IS NOT NULL
              AND c.fecha_fin BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
        `;
        const proximos = await pool.query(proximosQuery);

        // Contratos vencidos
        const vencidosQuery = `
            SELECT COUNT(*) AS total
            FROM contrato c
            INNER JOIN estado_contrato ec ON ec.id = c.estado_id
            WHERE ec.nombre ILIKE 'ACTIVO'
                AND c.fecha_fin IS NOT NULL
                AND c.fecha_fin < CURRENT_DATE
        `;
        const vencidos = await pool.query(vencidosQuery);

        // Contratos en proceso
        const procesoQuery = `
            SELECT COUNT(*) AS total
            FROM persona p
            WHERE p.tipo = 'Aspirante'
        `;
        const proceso = await pool.query(procesoQuery);

        res.json({
            ok: true,
            stats: {
                activos: parseInt(activos.rows[0].total) || 0,
                proximosVencer: parseInt(proximos.rows[0].total) || 0,
                vencidos: parseInt(vencidos.rows[0].total) || 0,
                enProceso: parseInt(proceso.rows[0].total) || 0
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

// ========================================
// 2. OBTENER EMPLEADOS DESTACADOS (SIN LÍMITE)
// ========================================
router.get('/contratos/empleados-destacados', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT ON (p.id)
          p.id AS persona_id,
          p.foto_url AS avatar,
          CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) AS nombre,
          COALESCE(p.estado_empleado, 'SIN ESTADO') AS estado_texto,
          LOWER(REPLACE(COALESCE(p.estado_empleado, 'sin-estado'), ' ', '-')) AS estado_clase,
          COALESCE(pu.nombre, 'Sin puesto') AS puesto,
          COALESCE(a.nombre, 'Sin área') AS area,
          'empleado' AS tipo
      FROM persona p
      INNER JOIN contrato c 
              ON c.persona_id = p.id
             AND c.estado_id = (
                  SELECT id FROM estado_contrato 
                  WHERE nombre ILIKE 'ACTIVO'
             )
      LEFT JOIN puesto pu ON pu.id = c.puesto_id
      LEFT JOIN area a   ON a.id = c.area_id
      WHERE p.tipo = 'Empleado'
      ORDER BY p.id, c.fecha_inicio DESC
      LIMIT 10;
    `;

    const result = await pool.query(query);

    res.json({
      ok: true,
      empleados: result.rows
    });
  } catch (error) {
    console.error('Error al obtener empleados destacados:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});



// ========================================
// 3. OBTENER ASPIRANTES DESTACADOS (SIN LÍMITE)
// ========================================
router.get('/contratos/aspirantes-destacados', async (req, res) => {
    try {
        const query = `
            SELECT
                p.id AS persona_id,
                p.foto_url AS avatar,
                CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) AS nombre,
                COALESCE(p.etapa, 'Registro') AS estado_texto,
                LOWER(REPLACE(COALESCE(p.etapa, 'registro'), ' ', '-')) AS estado_clase,
                COALESCE(pu.nombre, 'Sin puesto') AS puesto,
                COALESCE(a.nombre, 'Sin área') AS area,
                'aspirante' AS tipo
            FROM persona p
            LEFT JOIN aspiracion_laboral al ON al.persona_id = p.id
            LEFT JOIN puesto pu ON pu.id = al.puesto_id
            LEFT JOIN area a ON a.id = al.area_id
            WHERE p.tipo = 'Aspirante'
            ORDER BY p.fecha_registro DESC
            LIMIT 10
        `;

        const result = await pool.query(query);

        res.json({
            ok: true,
            aspirantes: result.rows
        });

    } catch (error) {
        console.error('Error al obtener aspirantes destacados:', error);
        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

// ========================================
// 4. OBTENER CONTRATOS POR ESTADO
// ========================================
router.get('/contratos/por-estado', async (req, res) => {
    try {
        const { estado } = req.query;

        let query = '';
        let whereClause = '';
        
        switch (estado) {
            case 'activo':
                whereClause = `
                    WHERE ec.nombre ILIKE 'ACTIVO' 
                    AND (c.fecha_fin IS NULL OR c.fecha_fin > CURRENT_DATE + INTERVAL '30 days')
                `;
                break;
            case 'avencer':
                whereClause = `
                    WHERE ec.nombre ILIKE 'ACTIVO'
                      AND c.fecha_fin IS NOT NULL
                      AND c.fecha_fin BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
                `;
                break;
            case 'vencido':
                whereClause = `
                    WHERE ec.nombre ILIKE 'ACTIVO'
                      AND c.fecha_fin IS NOT NULL
                      AND c.fecha_fin < CURRENT_DATE
                `;
                break;
            case 'proceso':
                query = `
                    SELECT
                        p.id AS persona_id,
                        p.foto_url AS avatar,
                        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) AS nombre,
                        'aspirante' AS tipo,
                        COALESCE(p.etapa, 'Registro') AS estado_texto,
                        LOWER(REPLACE(COALESCE(p.etapa, 'registro'), ' ', '-')) AS estado_clase,
                        COALESCE(pu.nombre, 'Sin puesto') AS puesto,
                        COALESCE(a.nombre, 'Sin área') AS area,
                        p.fecha_registro AS fechaInicio,
                        NULL AS fechaFin
                    FROM persona p
                    LEFT JOIN aspiracion_laboral al ON al.persona_id = p.id
                    LEFT JOIN puesto pu ON pu.id = al.puesto_id
                    LEFT JOIN area a ON a.id = al.area_id
                    WHERE p.tipo = 'Aspirante'
                    ORDER BY p.fecha_registro DESC
                `;
                break;
            default:
                return res.status(400).json({
                    ok: false,
                    error: 'Estado no válido'
                });
        }

        // ✅ Solo usa la consulta base si NO es 'proceso'
        if (estado !== 'proceso') {
            query = `
                SELECT
                    p.id AS persona_id,
                    p.foto_url AS avatar,
                    CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) AS nombre,
                    p.tipo,
                    COALESCE(ec.nombre, 'SIN ESTADO') AS estado_texto,
                    LOWER(REPLACE(COALESCE(ec.nombre, 'sin-estado'), ' ', '-')) AS estado_clase,
                    COALESCE(pu.nombre, 'Sin puesto') AS puesto,
                    COALESCE(a.nombre, 'Sin área') AS area,
                    c.fecha_inicio AS fechaInicio,
                    c.fecha_fin AS fechaFin
                FROM contrato c
                INNER JOIN persona p ON p.id = c.persona_id
                INNER JOIN estado_contrato ec ON ec.id = c.estado_id
                LEFT JOIN puesto pu ON pu.id = c.puesto_id
                LEFT JOIN area a ON a.id = c.area_id
                ${whereClause}
                ORDER BY c.fecha_inicio DESC
            `;
        }

        const result = await pool.query(query);

        res.json({
            ok: true,
            contratos: result.rows
        });

    } catch (error) {
        console.error('Error al obtener contratos por estado:', error);
        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

// ========================================
// 5. OBTENER LISTADO COMPLETO DE CONTRATOS
// ========================================
router.get('/contratos/listado', async (req, res) => {
    try {
        const query = `
            SELECT
                c.id AS contrato_id,
                c.persona_id,
                c.huella_id,
                CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) AS nombre_completo,
                p.foto_url AS avatar,
                p.tipo AS tipo_persona,
                COALESCE(pu.nombre, 'Sin puesto') AS puesto,
                COALESCE(a.nombre, 'Sin área') AS area,
                COALESCE(ec.nombre, 'SIN ESTADO') AS estado_contrato,
                c.tipo_contrato,
                c.modalidad,
                c.fecha_inicio,
                c.fecha_fin,
                c.salario_mensual
            FROM contrato c
            INNER JOIN persona p ON p.id = c.persona_id
            INNER JOIN estado_contrato ec ON ec.id = c.estado_id
            LEFT JOIN puesto pu ON pu.id = c.puesto_id
            LEFT JOIN area a ON a.id = c.area_id
            WHERE ec.nombre ILIKE 'ACTIVO'
            ORDER BY c.fecha_inicio DESC
        `;

        const result = await pool.query(query);

        res.json({
            ok: true,
            contratos: result.rows
        });

    } catch (error) {
        console.error('Error al obtener listado de contratos:', error);
        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

// ========================================
// 6. ACTUALIZAR HUELLA_ID DE UN CONTRATO
// ========================================
router.patch('/contratos/:id/huella', async (req, res) => {
    try {
        const { id } = req.params;
        const { huella_id } = req.body;

        // Permitir NULL para eliminar huella, pero si se proporciona un valor debe ser válido
        if (huella_id !== null && huella_id !== undefined && huella_id < 1) {
            return res.status(400).json({
                ok: false,
                error: 'huella_id debe ser un número válido mayor a 0 o null'
            });
        }

        // Verificar si el contrato existe
        const checkQuery = 'SELECT id FROM contrato WHERE id = $1';
        const checkResult = await pool.query(checkQuery, [id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                ok: false,
                error: 'Contrato no encontrado'
            });
        }

        // Actualizar huella_id
        const updateQuery = `
            UPDATE contrato
            SET huella_id = $1
            WHERE id = $2
            RETURNING id, huella_id
        `;

        const result = await pool.query(updateQuery, [huella_id, id]);

        res.json({
            ok: true,
            message: 'Huella registrada exitosamente',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error al actualizar huella_id:', error);
        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

// ========================================
// OBTENER ENCABEZADO DE EMPLEADO
// ========================================
router.get('/contratos/empleado/:personaId/encabezado', async (req, res) => {
    try {
        const { personaId } = req.params;

        const query = `
            SELECT
                p.id AS persona_id,
                p.nombre,
                p.apellido_paterno,
                p.apellido_materno,
                p.foto_url,
                p.estado_empleado,
                p.fecha_registro AS fecha_ingreso,
                a.nombre AS area,
                pu.nombre AS puesto
            FROM persona p
            LEFT JOIN contrato c ON c.persona_id = p.id
                AND c.estado_id = (SELECT id FROM estado_contrato WHERE nombre ILIKE 'ACTIVO')
            LEFT JOIN area a ON a.id = c.area_id
            LEFT JOIN puesto pu ON pu.id = c.puesto_id
            WHERE p.id = $1
            AND p.tipo = 'Empleado'
        `;

        const result = await pool.query(query, [personaId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                ok: false,
                error: 'Empleado no encontrado'
            });
        }

        res.json({
            ok: true,
            encabezado: result.rows[0]
        });

    } catch (error) {
        console.error('Error al obtener encabezado del empleado:', error);
        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

// ========================================
// OBTENER CONTRATO ACTUAL DEL EMPLEADO
// ========================================
router.get('/contratos/empleado/:personaId/contrato-actual', async (req, res) => {
    try {
        const { personaId } = req.params;

        const query = `
            SELECT
                c.id AS contrato_id,
                pc.nombre AS tipo_contrato,
                c.fecha_inicio,
                c.fecha_fin,
                c.salario_mensual,
                c.modalidad,
                c.observaciones,
                ec.nombre AS estado_firma,
                j.nombre AS jornada,
                je.hora_entrada,
                je.hora_salida,
                c.archivo_id
            FROM contrato c
            LEFT JOIN plantilla_contrato pc ON pc.id = c.plantilla_id
            LEFT JOIN estado_contrato ec ON ec.id = c.estado_id
            LEFT JOIN jornada_empleado je ON je.persona_id = c.persona_id
            LEFT JOIN jornada j ON j.id = je.jornada_id
            WHERE c.persona_id = $1
            AND c.estado_id = (SELECT id FROM estado_contrato WHERE nombre ILIKE 'ACTIVO')
            ORDER BY c.fecha_inicio DESC
            LIMIT 1
        `;

        const result = await pool.query(query, [personaId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                ok: false,
                error: 'Contrato activo no encontrado'
            });
        }

        res.json({
            ok: true,
            contrato: result.rows[0]
        });

    } catch (error) {
        console.error('Error al obtener contrato actual:', error);
        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7
// ========================================
// Todo esto es de la ventana estadisticas 
// ========================================

// ENDPOINT: Distribución por tipo de contrato
router.get('/contratos/estadisticas/distribucion-tipo', async (req, res) => {
    try {
        const query = `
            SELECT
                c.tipo_contrato AS tipo,
                COUNT(*) AS total
            FROM contrato c
            JOIN persona p ON p.id = c.persona_id
            JOIN estado_contrato ec ON ec.id = c.estado_id
            WHERE p.tipo = 'Empleado'
              AND ec.nombre ILIKE 'ACTIVO'
              AND c.tipo_contrato IN ('Indefinido', 'Temporal', 'Por Proyecto')
            GROUP BY c.tipo_contrato
            ORDER BY c.tipo_contrato;
        `;

        const result = await pool.query(query);

        res.json({
            ok: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Error al obtener distribución por tipo:', error);
        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

// ========================================
// ENDPOINT: Contratos por área
// ========================================
router.get('/contratos/estadisticas/contratos-por-area', async (req, res) => {
    try {
        const query = `
            SELECT
                a.nombre AS area,
                COUNT(c.id) AS total_contratos
            FROM contrato c
            JOIN persona p ON p.id = c.persona_id
            JOIN area a ON a.id = c.area_id
            JOIN estado_contrato ec ON ec.id = c.estado_id
            WHERE p.tipo = 'Empleado'
              AND ec.nombre ILIKE 'ACTIVO'
            GROUP BY a.nombre
            ORDER BY total_contratos DESC;
        `;

        const result = await pool.query(query);

        res.json({
            ok: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Error al obtener contratos por área:', error);
        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

// ========================================
// ENDPOINT: Estado del proceso de contratación
// ========================================
router.get('/contratos/estadisticas/estado-proceso', async (req, res) => {
    try {
        const query = `
            SELECT
                etapa,
                COUNT(*) AS total
            FROM persona
            WHERE tipo = 'Aspirante'
            GROUP BY etapa
            ORDER BY total DESC
        `;

        const result = await pool.query(query);

        res.json({
            ok: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Error al obtener estado del proceso:', error);
        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});
7
// ========================================
// ENDPOINT: Estadísticas generales (activos y vacantes)
// ========================================
router.get('/contratos/estadisticas/resumen', async (req, res) => {
    try {
        const queryActivos = `
            SELECT COUNT(*) AS total_activos
            FROM contrato c
            JOIN estado_contrato ec ON ec.id = c.estado_id
            WHERE ec.nombre ILIKE 'ACTIVO'
        `;

        const queryVacantes = `
            SELECT COUNT(*) AS solicitud_vacantes
            FROM persona
            WHERE tipo = 'Aspirante'
        `;

        const [resActivos, resVacantes] = await Promise.all([
            pool.query(queryActivos),
            pool.query(queryVacantes)
        ]);

        res.json({
            ok: true,
            activos: parseInt(resActivos.rows[0].total_activos) || 0,
            vacantes: parseInt(resVacantes.rows[0].solicitud_vacantes) || 0
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Endpoint para obtener historial de contratos
router.get('/contratos/historial', async (req, res) => {
  try {
    const query = `
      SELECT 
          c.id,
          p.nombre,
          p.apellido_paterno,
          p.apellido_materno,
          CONCAT(
            p.nombre, ' ', 
            p.apellido_paterno, ' ', 
            COALESCE(p.apellido_materno, '')
          ) AS nombre_empleado,
          c.tipo_contrato,
          c.fecha_inicio,
          a.nombre AS area_nombre,
          a.id    AS area_id,
          c.archivo_id,
          ar.storage_url AS url_almacenamiento
      FROM contrato c
      JOIN persona p ON p.id = c.persona_id
      JOIN area    a ON a.id = c.area_id
      LEFT JOIN archivo ar ON ar.id = c.archivo_id
      WHERE c.estado_id = (
        SELECT id FROM estado_contrato WHERE nombre ILIKE 'Activo'
      )
      ORDER BY c.fecha_inicio DESC;
    `;

    const result = await pool.query(query);

    res.json({
      ok: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});


// ========================================
// ENDPOINT: Obtener tipos de contratos (para filtro)
// ========================================
router.get('/contratos/tipos', async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT tipo_contrato
            FROM contrato
            WHERE tipo_contrato IS NOT NULL
            ORDER BY tipo_contrato
        `;

        const result = await pool.query(query);

        res.json({
            ok: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Error al obtener tipos:', error);
        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

// ========================================
// ENDPOINT: Obtener áreas (para filtros)
// ========================================
router.get('/contratos/areas', async (req, res) => {
    try {
        const query = `
            SELECT id, nombre
            FROM area
            ORDER BY nombre
        `;

        const result = await pool.query(query);

        res.json({
            ok: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Error al obtener áreas:', error);
        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Crear contrato de aspirante (pasos 2,3,4) se llama directamente en vue guardar contrato enlacecrearcontrato
router.post('/contratos/aspirante', verificarToken, async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      personaId,
      plantillaId,
      puestoId,
      areaId,
      salarioMensual,
      fechaInicio,
      fechaFin,
      tipoContrato,
      modalidad,
      observaciones,
      jornadaId,
      horaEntrada,
      horaSalida,
      archivoId
    } = req.body;

    if (!personaId) {
      return res.status(400).json({
        ok: false,
        error: 'personaId es obligatorio'
      });
    }


    await client.query('BEGIN');

    // 2) INSERT en contrato
    const contratoSql = `
      INSERT INTO contrato (
        id,
        persona_id,
        plantilla_id,
        puesto_id,
        area_id,
        salario_mensual,
        fecha_inicio,
        fecha_fin,
        estado_id,
        archivo_id,
        tipo_contrato,
        modalidad,
        observaciones
      )
      VALUES (
        uuid_generate_v4(),
        $1, $2, $3, $4, $5, $6, $7,
        (SELECT id FROM estado_contrato WHERE nombre ILIKE 'ACTIVO'),
        $8, $9, $10, $11
      )
      RETURNING *;
    `;
    const contratoValues = [
      personaId,
      plantillaId,
      puestoId,
      areaId,
      salarioMensual,
      fechaInicio,
      fechaFin,
      archivoId,
      tipoContrato,
      modalidad,
      observaciones
    ];

    const contratoResult = await client.query(contratoSql, contratoValues);
    const contrato = contratoResult.rows[0];

    // 3) Registrar jornada laboral
    if (jornadaId && horaEntrada && horaSalida) {
      const jornadaSql = `
        INSERT INTO jornada_empleado (
          id, persona_id, jornada_id, hora_entrada, hora_salida
        )
        VALUES (
          uuid_generate_v4(),
          $1, $2, $3, $4
        );
      `;
      await client.query(jornadaSql, [
        personaId,
        jornadaId,
        horaEntrada,
        horaSalida
      ]);
    }

    // 4) Cambiar de Aspirante a Empleado
    const updatePersonaSql = `
      UPDATE persona
      SET tipo = 'Empleado',
          estado_empleado = 'ACTIVO',
          etapa = 'Contratado'
      WHERE id = $1;
    `;
    await client.query(updatePersonaSql, [personaId]);

    await client.query('COMMIT');

    res.json({
      ok: true,
      mensaje: 'Contrato creado y aspirante cambiado a empleado',
      contrato
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear contrato de aspirante:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  } finally {
    client.release();
  }
});
export default router;
