import pkg from 'pg';
import config from './config/config.js';

const { Pool } = pkg;

/**
 * SCRIPT PARA VERIFICAR PERMISOS DEL USUARIO
 */

async function verificarPermisos() {
  console.log('\n🔍 ===== VERIFICANDO PERMISOS DEL USUARIO ===== \n');

  const pool = new Pool(config.database);

  try {
    const client = await pool.connect();
    console.log('✅ Conexión establecida\n');
    console.log(`👤 Usuario: ${config.database.user}`);
    console.log(`🗄️  Base de datos: ${config.database.database}\n`);

    // Verificar permisos en el schema public
    console.log('📋 Verificando permisos en schema public...\n');
    
    const permisos = await client.query(`
      SELECT 
        has_schema_privilege($1, 'public', 'CREATE') as puede_crear,
        has_schema_privilege($1, 'public', 'USAGE') as puede_usar
    `, [config.database.user]);

    console.log(`   CREATE: ${permisos.rows[0].puede_crear ? '✅ SÍ' : '❌ NO'}`);
    console.log(`   USAGE:  ${permisos.rows[0].puede_usar ? '✅ SÍ' : '❌ NO'}\n`);

    // Verificar si puede crear tablas
    if (!permisos.rows[0].puede_crear) {
      console.log('❌ El usuario NO tiene permisos para crear tablas\n');
      console.log('📝 SOLUCIÓN: Pide al equipo de BD que ejecute:\n');
      console.log('=' .repeat(60));
      console.log(`GRANT CREATE ON SCHEMA public TO ${config.database.user};`);
      console.log(`GRANT USAGE ON SCHEMA public TO ${config.database.user};`);
      console.log('=' .repeat(60));
    } else {
      console.log('✅ El usuario tiene permisos para crear tablas\n');
      console.log('💡 Puedes ejecutar el setup directamente con este usuario\n');
    }

    // Verificar tablas existentes relacionadas
    console.log('📊 Verificando tablas existentes necesarias...\n');
    
    const tablasNecesarias = ['persona', 'area', 'puesto', 'asignacion_puesto'];
    
    for (const tabla of tablasNecesarias) {
      const existe = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = $1
        )
      `, [tabla]);
      
      console.log(`   ${existe.rows[0].exists ? '✅' : '❌'} ${tabla}`);
    }

    // Verificar tablas del módulo de asistencias
    console.log('\n📋 Verificando si ya existen tablas de asistencias...\n');
    
    const tablasAsistencias = [
      'estado_asistencia',
      'tipo_incidencia',
      'horario_empleado',
      'registro_asistencias',
      'justificantes',
      'visitas',
      'dias_festivos'
    ];
    
    let algunaExiste = false;
    for (const tabla of tablasAsistencias) {
      const existe = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = $1
        )
      `, [tabla]);
      
      if (existe.rows[0].exists) {
        console.log(`   ✅ ${tabla} (YA EXISTE)`);
        algunaExiste = true;
      } else {
        console.log(`   ⚪ ${tabla} (no existe)`);
      }
    }

    console.log('\n' + '='.repeat(60));
    
    if (algunaExiste) {
      console.log('\n✨ BUENAS NOTICIAS: Algunas tablas ya existen!');
      console.log('   El módulo podría estar parcialmente configurado.\n');
    } else if (permisos.rows[0].puede_crear) {
      console.log('\n✨ Todo listo para crear las tablas!');
      console.log('   Ejecuta: node setup-asistencias.js\n');
    } else {
      console.log('\n⚠️  ACCIÓN REQUERIDA DEL EQUIPO DE BASE DE DATOS\n');
      console.log('📧 Envíales esto:\n');
      mostrarInstruccionesParaBD(config.database.user);
    }

    client.release();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Código:', error.code);
  } finally {
    await pool.end();
  }
}

function mostrarInstruccionesParaBD(usuario) {
  console.log('─'.repeat(60));
  console.log('INSTRUCCIONES PARA EL EQUIPO DE BASE DE DATOS');
  console.log('─'.repeat(60));
  console.log('\nHola equipo de BD,\n');
  console.log('Necesitamos configurar el módulo de Asistencias.');
  console.log('Por favor ejecuten los siguientes comandos:\n');
  console.log('-- 1. Otorgar permisos al usuario');
  console.log(`GRANT CREATE ON SCHEMA public TO ${usuario};`);
  console.log(`GRANT USAGE ON SCHEMA public TO ${usuario};`);
  console.log(`GRANT ALL ON ALL TABLES IN SCHEMA public TO ${usuario};`);
  console.log(`GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO ${usuario};`);
  console.log('\n-- 2. Alternativamente, pueden ejecutar el script SQL:');
  console.log('--    src/backend/models/asistencias_schema.sql');
  console.log('--    con el usuario postgres (admin)\n');
  console.log('Gracias!');
  console.log('─'.repeat(60) + '\n');
}

verificarPermisos();
