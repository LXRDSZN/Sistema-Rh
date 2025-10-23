/**
 * CONFIGURACIÓN CENTRALIZADA
 * 
 * Este archivo centraliza todas las variables de configuración del backend.
 * Configurado para usar AWS RDS en producción.
 */

export const config = {
  // Configuración del servidor
  server: {
    port: process.env.PORT || 5000,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },

  // Configuración de JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'tu_clave_secreta_super_segura_cambiar_en_produccion',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },

  // Configuración de cookies
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 8 * 60 * 60 * 1000, // 8 horas en milisegundos
  },

  // Configuración de base de datos AWS RDS
  // Usuario con permisos limitados para mayor seguridad
  database: {
    user: process.env.DB_USER || 'app_user',
    host: process.env.DB_HOST || 'basededatosrds1762.co1e4mase4yn.us-east-1.rds.amazonaws.com',
    database: process.env.DB_NAME || 'recursos_humanos_db',
    password: process.env.DB_PASSWORD || 'user@pass2244',
    port: process.env.DB_PORT || 5432,
    ssl: {
      rejectUnauthorized: false,
    },
  },
};

export default config;
