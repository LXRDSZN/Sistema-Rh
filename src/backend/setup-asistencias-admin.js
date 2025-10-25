import pkg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * SCRIPT DE SETUP CON USUARIO ADMIN
 * 
 * Usa el usuario postgres (admin) para crear las tablas
 */

// Configuración con usuario admin
const dbConfig = {
  user: 'postgres',  // Usuario administrador
  host: 'basededatosrds1762.co1e4mase4yn.us-east-1.rds.amazonaws.com',
  database: 'recursos_humanos_db',
  password: 'basedeDatos22',  // Contraseña del admin
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
};

async function setupAsistencias() {
  console.log('\n🚀 ===== INICIANDO SETUP DE ASISTENCIAS =====\n');
  console.log('⚠️  Usando usuario administrador (postgres)\n');

  const pool = new Pool(dbConfig);

  try {
    // Conectar a la base de datos
    console.log('📡 Conectando a la base de datos...');
    const client = await pool.connect();
    console.log('✅ Conexión establecida con usuario: postgres\n');

    // Leer el archivo SQL
    console.log('📄 Leyendo archivo SQL...');
    const sqlPath = join(__dirname, 'models', 'asistencias_schema.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    console.log('✅ Archivo leído correctamente\n');

    // Ejecutar el script SQL
    console.log('⚙️  Ejecutando script SQL...');
    console.log('   (Esto puede tomar unos segundos)\n');
    
    await client.query(sql);
    
    console.log('✅ Script ejecutado exitosamente\n');

    // Otorgar permisos al usuario app_user
    console.log('🔐 Otorgando permisos a app_user...\n');
    
    const tablas = [
      'estado_asistencia',
      'tipo_incidencia',
      'horario_empleado',
      'registro_asistencias',
      'justificantes',
      'visitas',
      'dias_festivos'
    ];

    for (const tabla of tablas) {
      await client.query(`GRANT ALL PRIVILEGES ON TABLE ${tabla} TO app_user`);
      await client.query(`GRANT USAGE, SELECT ON SEQUENCE ${tabla}_id_seq TO app_user`);
      console.log(`   ✅ Permisos otorgados en: ${tabla}`);
    }

    console.log('\n🔍 Verificando tablas creadas...\n');

    for (const tabla of tablas) {
      const result = await client.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )`,
        [tabla]
      );
      
      if (result.rows[0].exists) {
        console.log(`   ✅ ${tabla}`);
      } else {
        console.log(`   ❌ ${tabla} - NO CREADA`);
      }
    }

    console.log('\n📊 Verificando datos iniciales...\n');

    // Verificar estados de asistencia
    const estados = await client.query('SELECT COUNT(*) FROM estado_asistencia');
    console.log(`   ✅ Estados de asistencia: ${estados.rows[0].count} registros`);

    // Verificar tipos de incidencia
    const tipos = await client.query('SELECT COUNT(*) FROM tipo_incidencia');
    console.log(`   ✅ Tipos de incidencia: ${tipos.rows[0].count} registros`);

    // Verificar días festivos
    const festivos = await client.query('SELECT COUNT(*) FROM dias_festivos');
    console.log(`   ✅ Días festivos: ${festivos.rows[0].count} registros`);

    client.release();
    
    console.log('\n✨ ===== SETUP COMPLETADO EXITOSAMENTE ===== ✨\n');
    console.log('📝 Próximos pasos:');
    console.log('   1. Iniciar el servidor: node server.js');
    console.log('   2. Iniciar el frontend: npm run dev (desde la raíz)');
    console.log('   3. Navegar a /Asistencias en el sistema\n');

  } catch (error) {
    console.error('\n❌ ===== ERROR EN EL SETUP ===== ❌\n');
    console.error('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Solución: Verificar que la base de datos esté accesible');
    } else if (error.code === '42P01') {
      console.error('\n💡 Solución: Algunas tablas dependientes no existen');
      console.error('   Verifica que existan las tablas: persona, area, puesto');
    } else if (error.code === '42501') {
      console.error('\n💡 Solución: El usuario no tiene permisos suficientes');
    } else if (error.code === '28P01') {
      console.error('\n💡 Solución: Contraseña incorrecta');
    }
    
    console.error('\n🔧 Detalles técnicos:');
    console.error('   Código:', error.code);
    console.error('   Línea SQL:', error.position);
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar el setup
setupAsistencias();
