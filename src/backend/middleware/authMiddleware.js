import jwt from 'jsonwebtoken';
import config from '../config/config.js';

/**
 * MIDDLEWARES DE AUTENTICACIÓN Y AUTORIZACIÓN
 * 
 * Conjunto de middlewares para proteger rutas y verificar permisos
 */

/**
 * Middleware para verificar que el usuario está autenticado
 */
export const verificarToken = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No autenticado. Por favor inicie sesión.' 
      });
    }

    // Verificar y decodificar token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Agregar información del usuario al request
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Token inválido o expirado. Por favor inicie sesión nuevamente.' 
    });
  }
};

/**
 * Middleware para verificar permisos específicos
 * Uso: verificarPermiso('PERS_READ_ALL')
 */
export const verificarPermiso = (codigoPermiso) => {
  return (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'No autenticado' 
        });
      }

      // Verificar si el usuario tiene el permiso
      if (!req.user.permisos || !req.user.permisos.includes(codigoPermiso)) {
        return res.status(403).json({ 
          success: false,
          message: `No tienes permiso para realizar esta acción. Se requiere: ${codigoPermiso}` 
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ 
        success: false,
        message: 'Error al verificar permisos' 
      });
    }
  };
};

/**
 * Middleware para verificar múltiples permisos (requiere TODOS)
 * Uso: verificarPermisos(['PERS_READ_ALL', 'PERS_UPDATE_ALL'])
 */
export const verificarPermisos = (codigos) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.permisos) {
        return res.status(401).json({ 
          success: false,
          message: 'No autenticado' 
        });
      }

      // Verificar que tenga TODOS los permisos
      const tieneTodos = codigos.every(codigo => req.user.permisos.includes(codigo));

      if (!tieneTodos) {
        return res.status(403).json({ 
          success: false,
          message: `No tienes todos los permisos requeridos: ${codigos.join(', ')}` 
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ 
        success: false,
        message: 'Error al verificar permisos' 
      });
    }
  };
};

/**
 * Middleware para verificar al menos uno de varios permisos
 * Uso: verificarAlgunoDeEstosPermisos(['PERS_READ_ALL', 'PERS_READ_AREA', 'PERS_READ_SELF'])
 */
export const verificarAlgunoDeEstosPermisos = (codigos) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.permisos) {
        return res.status(401).json({ 
          success: false,
          message: 'No autenticado' 
        });
      }

      // Verificar que tenga AL MENOS UNO de los permisos
      const tieneAlguno = codigos.some(codigo => req.user.permisos.includes(codigo));

      if (!tieneAlguno) {
        return res.status(403).json({ 
          success: false,
          message: `No tienes permiso para realizar esta acción. Se requiere al menos uno de: ${codigos.join(', ')}` 
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ 
        success: false,
        message: 'Error al verificar permisos' 
      });
    }
  };
};

/**
 * Middleware para verificar roles específicos
 * Uso: verificarRol('ADMIN')
 */
export const verificarRol = (nombreRol) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'No autenticado' 
        });
      }

      if (req.user.rol !== nombreRol) {
        return res.status(403).json({ 
          success: false,
          message: `Esta acción requiere el rol: ${nombreRol}` 
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ 
        success: false,
        message: 'Error al verificar rol' 
      });
    }
  };
};

export default verificarToken;
