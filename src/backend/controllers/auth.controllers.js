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
  const { nombre, apellidoPaterno, apellidoMaterno, email, password, sexo, fechaNacimiento } = req.body;

  try {
    // Verificar si el email ya existe
    const emailExists = await db.query(
      'SELECT id FROM usuario WHERE email = $1',
      [email]
    );

    if (emailExists.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'El email ya está registrado' 
      });
    }

    // Guardar password en texto plano
    const passwordHash = password;

    // Iniciar transacción
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Crear persona
      const personaResult = await client.query(
        `INSERT INTO persona 
         (tipo, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo_id, estado_civil_id, nacionalidad_id)
         VALUES ($1, $2, $3, $4, $5, 
                 (SELECT id FROM sexo WHERE codigo = $6 LIMIT 1),
                 (SELECT id FROM estado_civil WHERE nombre = 'Soltero' LIMIT 1),
                 (SELECT id FROM nacionalidad WHERE nombre = 'Mexicana' LIMIT 1))
         RETURNING id`,
        ['Empleado', nombre, apellidoPaterno, apellidoMaterno || '', fechaNacimiento || '1990-01-01', sexo || 'M']
      );

      const personaId = personaResult.rows[0].id;

      // 2. Crear usuario
      const usuarioResult = await client.query(
        `INSERT INTO usuario (persona_id, email, password_hash, activo)
         VALUES ($1, $2, $3, true)
         RETURNING id`,
        [personaId, email, passwordHash]
      );

      const usuarioId = usuarioResult.rows[0].id;

      // 3. Asignar rol EMPLEADO por defecto
      await client.query(
        `INSERT INTO usuario_rol (usuario_id, rol_id)
         SELECT $1, id FROM rol WHERE nombre = 'EMPLEADO'`,
        [usuarioId]
      );

      await client.query('COMMIT');
      client.release();

      return res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        user: {
          email,
          nombre: `${nombre} ${apellidoPaterno}`
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      throw error;
    }

  } catch (error) {
    console.error('Error en registro:', error);
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
    // Limpiar cookie
    res.clearCookie('token');

    // Si hay usuario autenticado, actualizar bitácora
    if (req.user) {
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
  const { email, currentPassword, newPasswordHash } = req.body;

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
      return res.status(404).json({ 
        success: false,
        message: 'Usuario no encontrado' 
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
      return res.status(401).json({ 
        success: false,
        message: 'La contraseña actual es incorrecta' 
      });
    }

    // Actualizar la contraseña en la base de datos
    await db.query(
      `UPDATE usuario 
       SET password_hash = $1
       WHERE id = $2`,
      [newPasswordHash, user.id]
    );

    // Registrar el cambio en la bitácora
    await db.query(
      `INSERT INTO bitacora_accesos (usuario_id, ip, accion, inicio)
       VALUES ($1, $2, $3, NOW())`,
      [user.id, req.ip || 'unknown', 'Cambio de contraseña']
    );

    return res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error al cambiar la contraseña',
      error: error.message 
    });
  }
};
