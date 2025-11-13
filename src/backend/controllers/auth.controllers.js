import { db } from '../models/db.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import bcrypt from 'bcrypt';

/**
 * CONTROLADORES DE AUTENTICACIÓN
 * 
 * Maneja login, registro, logout y verificación de tokens
 */

/**
 * LOGIN - Autenticar usuario
 */
export const login = async (req, res) => {
  const { usuario, contrasena } = req.body;

  try {
    // Buscar usuario por email
    const result = await db.query(
      `SELECT 
        u.id as usuario_id,
        u.email,
        u.password_hash,
        u.activo,
        p.id as persona_id,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        r.id as rol_id,
        r.nombre as rol_nombre
      FROM usuario u
      JOIN persona p ON u.persona_id = p.id
      LEFT JOIN usuario_rol ur ON u.id = ur.usuario_id
      LEFT JOIN rol r ON ur.rol_id = r.id
      WHERE u.email = $1`,
      [usuario]
    );

    // Verificar si existe el usuario
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: 'Credenciales incorrectas' 
      });
    }

    const user = result.rows[0];

    // Verificar si el usuario está activo
    if (!user.activo) {
      return res.status(403).json({ 
        success: false,
        message: 'Usuario inactivo. Contacte al administrador.' 
      });
    }

    // Verificar contraseña en texto plano
    const passwordMatch = contrasena === user.password_hash;

    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Credenciales incorrectas' 
      });
    }

    // Obtener todos los permisos del usuario
    const permisosResult = await db.query(
      `SELECT DISTINCT p.codigo, p.descripcion
      FROM usuario u
      JOIN usuario_rol ur ON u.id = ur.usuario_id
      JOIN rol_permiso rp ON ur.rol_id = rp.rol_id
      JOIN permiso p ON rp.permiso_id = p.id
      WHERE u.id = $1`,
      [user.usuario_id]
    );

    const permisos = permisosResult.rows.map(p => p.codigo);

    // Crear token JWT con información del usuario y permisos
    const token = jwt.sign(
      {
        usuarioId: user.usuario_id,
        personaId: user.persona_id,
        email: user.email,
        nombre: `${user.nombre} ${user.apellido_paterno}`,
        rol: user.rol_nombre,
        rolId: user.rol_id,
        permisos: permisos
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Enviar token como cookie HTTP-only
    res.cookie('token', token, config.cookie);

    // Registrar sesión activa en la tabla sesiones_activas
    // Usar SQL para calcular la expiración (más confiable que JavaScript Date)
    await db.query(
      `INSERT INTO sesiones_activas (usuario_id, inicio, expiracion, token)
       VALUES ($1, NOW(), NOW() + INTERVAL '5 minutes', $2)
       ON CONFLICT (token) DO UPDATE SET inicio = NOW(), expiracion = NOW() + INTERVAL '5 minutes'`,
      [user.usuario_id, token]
    );

    // Registrar acceso en bitácora
    await db.query(
      `INSERT INTO bitacora_accesos (usuario_id, ip, inicio)
       VALUES ($1, $2, NOW())`,
      [user.usuario_id, req.ip || req.connection.remoteAddress]
    );

    // Responder con éxito
    return res.json({
      success: true,
      message: 'Login exitoso',
      user: {
        email: user.email,
        nombre: `${user.nombre} ${user.apellido_paterno}`,
        rol: user.rol_nombre,
        permisos: permisos.length
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    
    // Registrar intento fallido
    try {
      await db.query(
        `INSERT INTO intentos_login (usuario, exitoso, ip, fecha)
         VALUES ($1, false, $2, NOW())`,
        [usuario, req.ip || req.connection.remoteAddress]
      );
    } catch (logError) {
      console.error('Error al registrar intento fallido:', logError);
    }

    return res.status(500).json({ 
      success: false,
      message: 'Error del servidor al procesar login',
      error: error.message 
    });
  }
};

/**
 * REGISTER - Registrar nuevo usuario
 */
export const register = async (req, res) => {
  // Soportar ambos formatos: simple (SignUp) y completo (Dashboard)
  const { 
    usuario, 
    email, 
    contrasena,
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    password,
    sexo,
    fechaNacimiento,
    rol
  } = req.body;

  // Normalizar datos - priorizar formato completo
  const nombreFinal = nombre || usuario;
  const emailFinal = email;
  const passwordFinal = password || contrasena;
  const apellidoPaternoFinal = apellidoPaterno || '';
  const apellidoMaternoFinal = apellidoMaterno || '';
  const sexoFinal = sexo || 'M';
  const fechaNacimientoFinal = fechaNacimiento || '1990-01-01';
  const rolFinal = rol || 'EMPLEADO';

  console.log('📝 Registrando usuario:', { 
    nombre: nombreFinal, 
    email: emailFinal, 
    rol: rolFinal 
  });

  try {
    // Verificar si el email ya existe
    const emailExists = await db.query(
      'SELECT id FROM usuario WHERE email = $1',
      [emailFinal]
    );

    if (emailExists.rows.length > 0) {
      console.log('❌ Email ya existe:', emailFinal);
      return res.status(400).json({ 
        success: false,
        message: 'El email ya está registrado' 
      });
    }

    // Guardar password en texto plano (como está configurado actualmente)
    const passwordHash = passwordFinal;

    // Iniciar transacción
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      console.log('✅ Transacción iniciada');

      // 1. Crear persona (todos son 'Empleado', el rol específico se asigna en usuario_rol)
      const personaResult = await client.query(
        `INSERT INTO persona 
         (tipo, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo_id, estado_civil_id, nacionalidad_id)
         VALUES ($1, $2, $3, $4, $5, 
                 (SELECT id FROM sexo WHERE codigo = $6 LIMIT 1),
                 (SELECT id FROM estado_civil WHERE nombre = 'Soltero' LIMIT 1),
                 (SELECT id FROM nacionalidad WHERE nombre = 'Mexicana' LIMIT 1))
         RETURNING id`,
        ['Empleado', nombreFinal, apellidoPaternoFinal, apellidoMaternoFinal, fechaNacimientoFinal, sexoFinal]
      );

      const personaId = personaResult.rows[0].id;
      console.log('✅ Persona creada como Empleado con ID:', personaId);
      console.log('📋 Rol asignado será:', rolFinal);

      // 2. Crear usuario
      const usuarioResult = await client.query(
        `INSERT INTO usuario (persona_id, email, password_hash, activo)
         VALUES ($1, $2, $3, true)
         RETURNING id`,
        [personaId, emailFinal, passwordHash]
      );

      const usuarioId = usuarioResult.rows[0].id;
      console.log('✅ Usuario creado con ID:', usuarioId);

      // 3. Asignar rol
      const rolResult = await client.query(
        `INSERT INTO usuario_rol (usuario_id, rol_id)
         SELECT $1, id FROM rol WHERE nombre = $2
         RETURNING rol_id`,
        [usuarioId, rolFinal]
      );

      if (rolResult.rows.length === 0) {
        throw new Error(`Rol ${rolFinal} no encontrado en la base de datos`);
      }

      console.log('✅ Rol asignado:', rolFinal);

      // 4. Crear token JWT para login automático (solo si es desde SignUp)
      const token = jwt.sign(
        {
          usuarioId: usuarioId,
          personaId: personaId,
          email: emailFinal,
          nombre: nombreFinal,
          rol: rolFinal
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      await client.query('COMMIT');
      client.release();
      console.log('✅ Transacción completada exitosamente');

      return res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        token: token,
        user: {
          email: emailFinal,
          nombre: nombreFinal
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      console.error('❌ Error en transacción:', error);
      throw error;
    }

  } catch (error) {
    console.error('❌ Error en registro:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error del servidor al registrar usuario',
      error: error.message 
    });
  }
};

/**
 * LOGOUT - Cerrar sesión
 */
export const logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    
    // Limpiar cookie
    res.clearCookie('token');

    // Si hay usuario autenticado, actualizar bitácora y eliminar sesión activa
    if (req.user) {
      // Eliminar sesión activa
      if (token) {
        await db.query(
          `DELETE FROM sesiones_activas WHERE token = $1`,
          [token]
        );
      }

      // Actualizar bitácora
      await db.query(
        `UPDATE bitacora_accesos 
         SET fin = NOW()
         WHERE id = (
           SELECT id 
           FROM bitacora_accesos 
           WHERE usuario_id = $1 
           AND fin IS NULL
           ORDER BY inicio DESC
           LIMIT 1
         )`,
        [req.user.usuarioId]
      );
    }

    return res.json({
      success: true,
      message: 'Logout exitoso'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error al cerrar sesión' 
    });
  }
};

/**
 * VERIFY - Verificar token y obtener usuario actual
 */
export const verifyToken = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No autenticado' 
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    return res.json({
      success: true,
      user: {
        email: decoded.email,
        nombre: decoded.nombre,
        rol: decoded.rol,
        permisos: decoded.permisos
      }
    });

  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Token inválido o expirado' 
    });
  }
};

/**
 * CAMBIAR CONTRASEÑA - Actualizar contraseña del usuario
 */
export const changePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  console.log('🔐 Cambio de contraseña solicitado para:', email);

  try {
    // Buscar usuario por email
    const result = await db.query(
      `SELECT id, email, password_hash, activo
       FROM usuario
       WHERE email = $1`,
      [email]
    );

    // Verificar si existe el usuario
    if (result.rows.length === 0) {
      console.log('❌ Usuario no encontrado:', email);
      return res.status(404).json({ 
        success: false,
        message: 'Usuario no encontrado' 
      });
    }

    const user = result.rows[0];

    // Verificar si el usuario está activo
    if (!user.activo) {
      console.log('❌ Usuario inactivo:', email);
      return res.status(403).json({ 
        success: false,
        message: 'Usuario inactivo. Contacte al administrador.' 
      });
    }

    // Verificar la contraseña actual
    // Si la contraseña actual está hasheada, usar bcrypt.compare
    // Si está en texto plano (sistema antiguo), comparar directamente
    let passwordMatch = false;
    
    if (user.password_hash.startsWith('$2')) {
      // La contraseña está hasheada con bcrypt
      passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
    } else {
      // La contraseña está en texto plano (sistema antiguo)
      passwordMatch = currentPassword === user.password_hash;
    }

    if (!passwordMatch) {
      console.log('❌ Contraseña actual incorrecta para:', email);
      return res.status(401).json({ 
        success: false,
        message: 'La contraseña actual es incorrecta' 
      });
    }

    // Hashear la nueva contraseña en el backend
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    console.log('✅ Contraseña hasheada correctamente');

    // Actualizar la contraseña en la base de datos
    await db.query(
      `UPDATE usuario 
       SET password_hash = $1
       WHERE id = $2`,
      [hashedPassword, user.id]
    );

    console.log('✅ Contraseña actualizada en BD para usuario ID:', user.id);

    // Registrar el cambio en la bitácora
    try {
      await db.query(
        `INSERT INTO bitacora_accesos (usuario_id, ip, user_agent, inicio)
         VALUES ($1, $2, $3, NOW())`,
        [user.id, req.ip || 'unknown', req.headers['user-agent'] || 'unknown']
      );
      console.log('✅ Cambio registrado en bitácora');
    } catch (bitacoraError) {
      console.log('⚠️ Error al registrar en bitácora (no crítico):', bitacoraError.message);
    }

    return res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al cambiar contraseña:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error al cambiar la contraseña',
      error: error.message 
    });
  }
};
