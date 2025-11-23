<template>
  <div class="calendar-card">
    <div class="calendar-header">
      <button @click="previousMonth" class="calendar-nav">
        <span class="material-symbols-rounded">chevron_left</span>
      </button>
      <h3>{{ mesActual }}. {{ añoActual }}</h3>
      <button @click="nextMonth" class="calendar-nav">
        <span class="material-symbols-rounded">chevron_right</span>
      </button>
    </div>
    <div class="calendar-grid">
      <div class="calendar-day-header" v-for="day in diasSemana" :key="day">
        {{ day }}
      </div>
      <div
        v-for="(day, index) in diasMes"
        :key="index"
        class="calendar-day"
        :class="{
          'empty': day === '',
          'today': esHoy(day),
          'festivo': esFestivo(day),
          'vacacion-aprobada': esVacacionAprobada(day),
          'vacacion-pendiente': esVacacionPendiente(day),
          'selected': diaSeleccionado === day
        }"
        @click="seleccionarDia(day)"
        :title="getTituloVacacion(day)"
      >
        {{ day }}
      </div>
    </div>
    <div class="calendar-legend">
      <span class="calendar-legend-item">
        <span class="legend-dot festivo-dot"></span>
        Día festivo
      </span>
      <span class="calendar-legend-item">
        <span class="legend-dot vacacion-aprobada-dot"></span>
        Vacación aprobada
      </span>
      <span class="calendar-legend-item">
        <span class="legend-dot vacacion-pendiente-dot"></span>
        Vacación pendiente
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import * as vacacionesService from '@/services/vacacionesService.js';

// State
const fechaActual = ref(new Date());
const diaSeleccionado = ref(null);
const diasVacaciones = ref({}); // { 'YYYY-MM-DD': 'estado' }
const cargando = ref(false);
const diasFestivos = ['01-01', '05-01', '12-25']; // Festivos fijos: Año Nuevo, Día del Trabajo, Navidad

// Constants
const diasSemana = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Computed
const mesActual = computed(() => meses[fechaActual.value.getMonth()]);
const añoActual = computed(() => fechaActual.value.getFullYear());

const diasMes = computed(() => {
  const año = fechaActual.value.getFullYear();
  const mes = fechaActual.value.getMonth();
  const primerDia = new Date(año, mes, 1).getDay();
  const ultimoDia = new Date(año, mes + 1, 0).getDate();
  
  const dias = [];
  const offset = primerDia === 0 ? 6 : primerDia - 1;
  
  for (let i = 0; i < offset; i++) {
    dias.push('');
  }
  
  for (let i = 1; i <= ultimoDia; i++) {
    dias.push(i);
  }
  
  return dias;
});

// Methods
const cargarVacaciones = async () => {
  try {
    cargando.value = true;
    diasVacaciones.value = {};
    console.log('🔄 Iniciando carga de vacaciones...');

    // Obtener empleado actual
    const empleadoResp = await vacacionesService.getEmpleadoActual();
    console.log('👤 Respuesta empleado:', empleadoResp);
    
    if (!empleadoResp.success) {
      console.warn('⚠️ No se pudo obtener datos del empleado');
      return;
    }

    const empleadoId = empleadoResp.data.id;
    console.log('✅ ID del empleado:', empleadoId);

    // Obtener solicitudes del empleado
    const solicitudesResp = await vacacionesService.getSolicitudesVacaciones(empleadoId);
    console.log('📋 Respuesta solicitudes:', solicitudesResp);
    
    if (!solicitudesResp.success) {
      console.warn('⚠️ No se pudieron obtener solicitudes');
      return;
    }

    console.log(`📝 Total de solicitudes: ${solicitudesResp.data.length}`);

    // Procesar cada solicitud para marcar los días en el calendario
    for (const solicitud of solicitudesResp.data) {
      console.log(`📝 Procesando solicitud ${solicitud.id}, Estado: ${solicitud.estado}`);
      
      try {
        // Obtener los días específicos de cada solicitud
        const diasResp = await vacacionesService.getDiasSolicitud(solicitud.id);
        console.log(`  📅 Días obtenidos para solicitud ${solicitud.id}:`, diasResp);

        if (diasResp.success && diasResp.data && diasResp.data.length > 0) {
          console.log(`  ✅ Total de días: ${diasResp.data.length}`);
          
          // Marcar cada día según el estado de la solicitud
          for (const dia of diasResp.data) {
            let fechaDia = dia.fecha_dia;
            
            // Asegurar formato YYYY-MM-DD
            if (fechaDia.includes('T')) {
              fechaDia = fechaDia.split('T')[0];
            }

            // Mapear estado de la solicitud (usar mismos valores que Vacaciones-component)
            if (solicitud.estado === 'Aprobada') {
              diasVacaciones.value[fechaDia] = 'aprobada';
              console.log(`    ✅ Día aprobado: ${fechaDia}`);
            } else if (solicitud.estado === 'Pendiente') {
              diasVacaciones.value[fechaDia] = 'pendiente';
              console.log(`    ⏳ Día pendiente: ${fechaDia}`);
            }
          }
        } else {
          console.warn(`  ⚠️ No hay días para solicitud ${solicitud.id}`);
        }
      } catch (err) {
        console.error(`❌ Error al obtener días de solicitud ${solicitud.id}:`, err);
      }
    }
    
    console.log('📊 Días de vacaciones cargados:', diasVacaciones.value);
    
    // Marcar días festivos (solo si no tienen otro estado)
    marcarFestivos();
  } catch (error) {
    console.error('❌ Error al cargar vacaciones:', error);
  } finally {
    cargando.value = false;
  }
};

const marcarFestivos = () => {
  const año = fechaActual.value.getFullYear();
  const mes = fechaActual.value.getMonth();
  const ultimoDia = new Date(año, mes + 1, 0).getDate();
  
  for (let dia = 1; dia <= ultimoDia; dia++) {
    const fecha = formatearFecha(dia);
    const mmdd = String(mes + 1).padStart(2, '0') + '-' + String(dia).padStart(2, '0');
    
    // Solo marcar como festivo si no tiene otro estado (aprobada/pendiente)
    if (diasFestivos.includes(mmdd) && !diasVacaciones.value[fecha]) {
      diasVacaciones.value[fecha] = 'festivo';
    }
  }
};

const esFestivo = (dia) => {
  if (!dia) return false;
  const fecha = formatearFecha(dia);
  return diasVacaciones.value[fecha] === 'festivo';
};

const formatearFecha = (dia) => {
  if (!dia) return '';
  const año = fechaActual.value.getFullYear();
  const mes = String(fechaActual.value.getMonth() + 1).padStart(2, '0');
  const diaStr = String(dia).padStart(2, '0');
  return `${año}-${mes}-${diaStr}`;
};

const esVacacionAprobada = (dia) => {
  if (!dia) return false;
  const fecha = formatearFecha(dia);
  return diasVacaciones.value[fecha] === 'aprobada';
};

const esVacacionPendiente = (dia) => {
  if (!dia) return false;
  const fecha = formatearFecha(dia);
  return diasVacaciones.value[fecha] === 'pendiente';
};

const getTituloVacacion = (dia) => {
  if (!dia) return '';
  const fecha = formatearFecha(dia);
  const estado = diasVacaciones.value[fecha];
  
  if (estado === 'aprobada') return 'Vacación aprobada';
  if (estado === 'pendiente') return 'Vacación pendiente';
  if (estado === 'festivo') return 'Día festivo';
  if (esHoy(dia)) return 'Hoy';
  return '';
};

const esHoy = (dia) => {
  if (!dia) return false;
  const hoy = new Date();
  return dia === hoy.getDate() &&
         fechaActual.value.getMonth() === hoy.getMonth() &&
         fechaActual.value.getFullYear() === hoy.getFullYear();
};

const seleccionarDia = (dia) => {
  if (dia) diaSeleccionado.value = dia;
};

const previousMonth = () => {
  fechaActual.value = new Date(
    fechaActual.value.getFullYear(),
    fechaActual.value.getMonth() - 1
  );
};

const nextMonth = () => {
  fechaActual.value = new Date(
    fechaActual.value.getFullYear(),
    fechaActual.value.getMonth() + 1
  );
};

// Lifecycle
onMounted(async () => {
  console.log('📅 CalendarWidget montado, cargando vacaciones...');
  await cargarVacaciones();
});

// Cuando cambie el mes, remarcar los festivos del mes visible
watch(fechaActual, () => {
  marcarFestivos();
});
</script>

<style scoped>
.calendar-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.calendar-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.calendar-nav {
  background: none;
  border: none;
  cursor: pointer;
  color: #6B7280;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  transition: background 0.2s;
}

.calendar-nav:hover {
  background: #F3F4F6;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.calendar-day-header {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
  text-align: center;
  padding: 0.5rem 0;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #1F2937;
  min-height: 40px;
}

.calendar-day.empty {
  cursor: default;
}

.calendar-day:not(.empty):hover {
  background: #F3F4F6;
}

.calendar-day.today {
  background: #1F2937;
  color: white;
  font-weight: 600;
}

.calendar-day.festivo {
  background: linear-gradient(180deg, #E7000B, #cc0009);
  color: white;
  font-weight: 600;
}

.calendar-day.vacacion-aprobada {
  background: #10B981;
  color: white;
  font-weight: 600;
}

.calendar-day.vacacion-pendiente {
  background: #F59E0B;
  color: white;
  font-weight: 600;
}

.calendar-day.selected {
  background: #E0E7FF;
  color: #6366F1;
  font-weight: 600;
}

.calendar-legend {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

.calendar-legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6B7280;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.festivo-dot {
  background: linear-gradient(180deg, #E7000B, #cc0009);
}

.vacacion-aprobada-dot {
  background: #10B981;
}

.vacacion-pendiente-dot {
  background: #F59E0B;
}
</style>
