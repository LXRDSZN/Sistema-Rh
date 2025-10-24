import pkg from 'pg';
import config from '../config/config.js';

const { Pool } = pkg;

/**
 * CONFIGURACIÓN DE BASE DE DATOS
 * 
 * Conexión a PostgreSQL en AWS RDS (producción)
 */

// Pool de conexiones a AWS RDS
const pool = new Pool(config.database);

export const db = pool;

/**
 * Función para testear y establecer la conexión a PostgreSQL
 * @returns {Promise<boolean>} true si la conexión fue exitosa
 */
export const connectDB = async () => {
  try {
    const client = await db.connect();
    console.log(`✅ PostgreSQL conectado exitosamente a AWS RDS`);
    console.log(`📍 Host: ${config.database.host}`);
    console.log(`🗄️  Base de datos: ${config.database.database}`);
    
    // Test query para verificar conexión
    const result = await client.query('SELECT NOW()');
    console.log("🕐 Hora del servidor:", result.rows[0].now);
    
    client.release();
    return true;
  } catch (error) {
    console.error("❌ Error conectando a PostgreSQL:", error.message);
    return false;
  }
};

/**
 * Helper para ejecutar queries de manera simplificada
 * @param {string} text - Query SQL
 * @param {Array} params - Parámetros de la query
 * @returns {Promise} Resultado de la query
 */
export const query = (text, params) => db.query(text, params);

export default db;
