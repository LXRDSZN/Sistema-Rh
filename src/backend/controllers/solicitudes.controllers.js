import { db } from '../models/db.js';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config/config.js';

/**
 * CONTROLADORES DE SOLICITUDES
 * 
 * Maneja la gestión de solicitudes de empleo, creación de aspirantes
 * y almacenamiento de documentos
 */

// Configurar cliente S3
const s3Client = new S3Client({ region: config.aws.region });

/**
 * POST CREAR SOLICITUD - Crear una nueva solicitud de empleo
 * Inserta datos en: persona, identidad_persona, contacto_persona,
 * formacion_academica, experiencia_laboral, aspiracion_laboral, documentos
 */
export const crearSolicitud = async (req, res) => {
  const client = await db.connect();
  
  try {
    const {
      nombres,
      apellidoPaterno,
      apellidoMaterno,
      curp,
      rfc,
      nss,
      fechaNacimiento,
      sexoId,
      estadoCivilId,
      nacionalidadId,
      fotoUrl,
      telefonoCelular,
      correoElectronico,
      domicilio,
      formacionesAcademicas,
      experienciasLaborales,
      areaId,
      puestoId,
      jornadaId,
      tipoContrato,
      modalidad,
      pretensionSalarial,
      fechaDisponible,
      documentos
    } = req.body;

    // Validar campos obligatorios
    if (!nombres || !apellidoPaterno || !fechaNacimiento || !sexoId || !estadoCivilId || !nacionalidadId) {
      return res.status(400).json({
        success: false,
        message: 'Los campos: Nombre, Apellido Paterno, Fecha de Nacimiento, Sexo, Estado Civil y Nacionalidad son obligatorios'
      });
    }

    await client.query('BEGIN');

    // 1. Validar si el RFC, CURP o NSS ya existen en el sistema
    if (curp || rfc || nss) {
      const checkQuery = `
        SELECT 
          p.nombre, 
          p.apellido_paterno, 
          p.apellido_materno,
          ip.curp, 
          ip.rfc, 
          ip.nss
        FROM identidad_persona ip
        JOIN persona p ON p.id = ip.persona_id
        WHERE ($1::text IS NOT NULL AND ip.curp = $1)
           OR ($2::text IS NOT NULL AND ip.rfc = $2)
           OR ($3::text IS NOT NULL AND ip.nss = $3)
        LIMIT 1
      `;
      
      const existingIdentity = await client.query(checkQuery, [curp || null, rfc || null, nss || null]);
      
      if (existingIdentity.rows.length > 0) {
        const existing = existingIdentity.rows[0];
        const nombreCompleto = `${existing.nombre} ${existing.apellido_paterno} ${existing.apellido_materno || ''}`.trim();
        
        let camposDuplicados = [];
        if (curp && existing.curp === curp) camposDuplicados.push('CURP');
        if (rfc && existing.rfc === rfc) camposDuplicados.push('RFC');
        if (nss && existing.nss === nss) camposDuplicados.push('NSS');
        
        await client.query('ROLLBACK');
        return res.status(409).json({
          success: false,
          message: `Ya existe un registro con ${camposDuplicados.join(', ')}: ${nombreCompleto}`,
          duplicatedFields: camposDuplicados
        });
      }
    }

    // 2. Insertar Persona (aspirante)
    const personaResult = await client.query(
      `INSERT INTO persona (
        id, tipo, nombre, apellido_paterno, apellido_materno,
        fecha_nacimiento, sexo_id, estado_civil_id, nacionalidad_id,
        foto_url, etapa, estado_empleado, fecha_registro
      )
      VALUES (
        uuid_generate_v4(),
        'Aspirante',
        $1, $2, $3, $4, $5, $6, $7, $8, 'Registro', 'ACTIVO', NOW()
      )
      RETURNING id`,
      [
        nombres,
        apellidoPaterno,
        apellidoMaterno || '',
        new Date(fechaNacimiento),
        sexoId,
        estadoCivilId,
        nacionalidadId,
        fotoUrl || null
      ]
    );

    const personaId = personaResult.rows[0].id;

    // 3. Insertar Identidad Persona (validar formatos)
    if (curp || rfc || nss) {
      // Validar formatos
      const curpRegex = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/;
      const rfcRegex = /^[A-Z]{4}[0-9]{6}[A-Z0-9]{3}$/;
      const nssRegex = /^[0-9]{11}$/;

      const curpValido = !curp || curpRegex.test(curp);
      const rfcValido = !rfc || rfcRegex.test(rfc);
      const nssValido = !nss || nssRegex.test(nss);

      if (!curpValido || !rfcValido || !nssValido) {
        return res.status(400).json({
          success: false,
          message: `Formato inválido en documentos de identidad. ${!curpValido ? 'CURP debe tener 18 caracteres (ej: PEPA900315HDFRNN09). ' : ''}${!rfcValido ? 'RFC debe tener 13 caracteres. ' : ''}${!nssValido ? 'NSS debe tener 11 dígitos. ' : ''}`
        });
      }

      await client.query(
        `INSERT INTO identidad_persona (persona_id, curp, rfc, nss)
         VALUES ($1, $2, $3, $4)`,
        [personaId, curpValido ? curp : null, rfcValido ? rfc : null, nssValido ? nss : null]
      );
    }

    // 4. Insertar Contacto Persona
    if (telefonoCelular || correoElectronico || domicilio) {
      await client.query(
        `INSERT INTO contacto_persona (id, persona_id, telefono, correo, domicilio)
         VALUES (uuid_generate_v4(), $1, $2, $3, $4)`,
        [personaId, telefonoCelular || null, correoElectronico || null, domicilio || null]
      );
    }

    // 5. Insertar Formación Académica (múltiples registros)
    if (formacionesAcademicas && Array.isArray(formacionesAcademicas)) {
      for (const formacion of formacionesAcademicas) {
        await client.query(
          `INSERT INTO formacion_academica (id, persona_id, nivel_academico, institucion, titulo, anio_inicio, anio_fin)
           VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6)`,
          [
            personaId,
            formacion.nivel || null,
            formacion.institucion || null,
            formacion.titulo || null,
            formacion.anioInicio ? parseInt(formacion.anioInicio) : null,
            formacion.anioFin ? parseInt(formacion.anioFin) : null
          ]
        );
      }
    }

    // 6. Insertar Experiencia Laboral (múltiples registros)
    if (experienciasLaborales && Array.isArray(experienciasLaborales)) {
      for (const experiencia of experienciasLaborales) {
        await client.query(
          `INSERT INTO experiencia_laboral (id, persona_id, empresa, puesto, fecha_inicio, fecha_fin, descripcion)
           VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6)`,
          [
            personaId,
            experiencia.empresa || null,
            experiencia.puesto || null,
            experiencia.fechaInicio ? new Date(experiencia.fechaInicio) : null,
            experiencia.fechaFin ? new Date(experiencia.fechaFin) : null,
            experiencia.descripcion || null
          ]
        );
      }
    }

    // 7. Insertar Aspiración Laboral
    if (areaId || puestoId) {
      await client.query(
        `INSERT INTO aspiracion_laboral (id, persona_id, area_id, puesto_id, jornada_id, tipo_contrato, modalidad, pretension_salarial, fecha_disponible)
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          personaId,
          areaId || null,
          puestoId || null,
          jornadaId || null,
          tipoContrato || null,
          modalidad || null,
          pretensionSalarial ? parseFloat(pretensionSalarial) : null,
          fechaDisponible ? new Date(fechaDisponible) : null
        ]
      );
    }

    // 8. Insertar Documentos
    if (documentos && Array.isArray(documentos)) {
      for (const documento of documentos) {
        // Insertar archivo
        const archivoResult = await client.query(
          `INSERT INTO archivo (id, nombre, tipo_mime, tamano_bytes, storage_url)
           VALUES (uuid_generate_v4(), $1, $2, $3, $4)
           RETURNING id`,
          [
            documento.nombre || null,
            documento.tipoMime || null,
            documento.tamanoBytes || 0,
            documento.storageUrl || null
          ]
        );

        const archivoId = archivoResult.rows[0].id;

        // Insertar relación documento-persona
        await client.query(
          `INSERT INTO documento_persona (id, persona_id, documento_tipo_id, archivo_id)
           VALUES (uuid_generate_v4(), $1, $2, $3)`,
          [personaId, documento.documentoTipoId || null, archivoId]
        );
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Solicitud creada exitosamente',
      personaId: personaId
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error al crear solicitud:', error);
    console.error('📝 Stack trace:', error.stack);
    console.error('📋 Datos recibidos:', JSON.stringify(req.body, null, 2));
    res.status(500).json({
      success: false,
      message: 'Error al crear la solicitud',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    client.release();
  }
};

/**
 * SUBIR ARCHIVO A S3
 * Maneja la carga de archivos a AWS S3 usando multipart/form-data
 */
export const subirArchivo = async (req, res) => {
  try {
    const { tipoDocumento } = req.body;
    
    // req.file contiene el archivo subido por multer
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Archivo requerido'
      });
    }

    const { originalname, buffer, size } = req.file;

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const nombreUnico = `solicitudes/${tipoDocumento || 'documento'}/${timestamp}-${originalname}`;

    // Parámetros para S3
    const params = {
      Bucket: config.aws.bucket,
      Key: nombreUnico,
      Body: buffer,
      ContentType: req.file.mimetype || 'application/octet-stream'
    };

    // Subir a S3
    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Generar presigned URL indefinida (sin expiración)
    const getCommand = new GetObjectCommand({
      Bucket: config.aws.bucket,
      Key: nombreUnico
    });
    
    const storageUrl = await getSignedUrl(s3Client, getCommand, { 
    expiresIn: 604800  // 7 días (máximo permitido por AWS)
    });

    res.status(200).json({
      success: true,
      message: 'Archivo subido exitosamente',
      storageUrl: storageUrl,
      nombreArchivo: nombreUnico,
      tamanoBytes: size
    });

  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir el archivo',
      error: error.message
    });
  }
};

/**
 * GET CATALOGOS - Obtener listas desplegables para el formulario
 */
export const obtenerCatalogos = async (req, res) => {
  try {
    const [sexos, estadosCiviles, nacionalidades, areas, puestos, jornadas, tiposDocumento] = await Promise.all([
      db.query('SELECT id, nombre FROM sexo ORDER BY nombre'),
      db.query('SELECT id, nombre FROM estado_civil ORDER BY nombre'),
      db.query('SELECT id, nombre FROM nacionalidad ORDER BY nombre'),
      db.query('SELECT id, nombre FROM area ORDER BY nombre'),
      db.query('SELECT id, nombre FROM puesto ORDER BY nombre'),
      db.query('SELECT id, nombre FROM jornada ORDER BY nombre'),
      db.query('SELECT id, nombre FROM documento_tipo ORDER BY nombre')
    ]);

    res.status(200).json({
      success: true,
      catalogos: {
        sexos: sexos.rows,
        estadosCiviles: estadosCiviles.rows,
        nacionalidades: nacionalidades.rows,
        areas: areas.rows,
        puestos: puestos.rows,
        jornadas: jornadas.rows,
        tiposDocumento: tiposDocumento.rows,
        tiposContrato: [
          { id: 1, nombre: 'Indefinido' },
          { id: 2, nombre: 'Temporal' },
          { id: 3, nombre: 'Por Proyecto' }
        ]
      }
    });

  } catch (error) {
    console.error('Error al obtener catálogos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los catálogos',
      error: error.message
    });
  }
};

/**
 * GET SOLICITUDES - Obtener todas las solicitudes recibidas
 */
export const obtenerSolicitudes = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        p.id,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        p.fecha_registro,
        p.etapa,
        c.correo,
        c.telefono,
        a.nombre as area,
        pu.nombre as puesto
      FROM persona p
      LEFT JOIN contacto_persona c ON p.id = c.persona_id
      LEFT JOIN aspiracion_laboral al ON p.id = al.persona_id
      LEFT JOIN area a ON al.area_id = a.id
      LEFT JOIN puesto pu ON al.puesto_id = pu.id
      WHERE p.tipo = 'Aspirante'
      ORDER BY p.fecha_registro DESC`
    );

    res.status(200).json({
      success: true,
      solicitudes: result.rows
    });

  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las solicitudes',
      error: error.message
    });
  }
};
