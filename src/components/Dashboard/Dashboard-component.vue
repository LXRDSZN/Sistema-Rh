<template>
  <div class="dashboard-content">
    <div class="dashboard-header">
      <h1>Bienvenido.</h1>
    </div>

    <!-- Cards de estadísticas -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon nuevos">
          <span class="material-symbols-rounded">person_add</span>
        </div>
        <div class="stat-info">
          <div class="stat-label">Nuevos empleados</div>
          <div class="stat-value">{{ stats.nuevosEmpleados.total }}</div>
          <div class="stat-trend" :class="stats.nuevosEmpleados.tendencia">
            <span class="material-symbols-rounded">trending_up</span>
            {{ stats.nuevosEmpleados.porcentaje }}% este mes
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon empleados">
          <span class="material-symbols-rounded">groups</span>
        </div>
        <div class="stat-info">
          <div class="stat-label">Empleados</div>
          <div class="stat-value">{{ stats.totalEmpleados.total.toLocaleString() }}</div>
          <div class="stat-trend" :class="stats.totalEmpleados.tendencia">
            <span class="material-symbols-rounded">trending_up</span>
            {{ stats.totalEmpleados.porcentaje }}% este mes
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon activos">
          <span class="material-symbols-rounded">computer</span>
        </div>
        <div class="stat-info">
          <div class="stat-label">Activos Ahora</div>
          <div class="stat-value">{{ stats.asistenciasActivas.total }}</div>
          <div class="stat-emoji">{{ stats.asistenciasActivas.emoji }}</div>
        </div>
      </div>
    </div>

    <!-- Sección principal con gráficas y calendario -->
    <div class="main-section">
      <!-- Gráfica de empleados por área -->
      <div class="chart-card">
        <h3>Empleados Por Área</h3>
        <div class="donut-chart-container">
          <svg class="donut-chart" viewBox="0 0 200 200">
            <circle
              v-for="(segment, index) in donutSegments"
              :key="index"
              cx="100"
              cy="100"
              r="80"
              fill="none"
              :stroke="segment.color"
              stroke-width="40"
              :stroke-dasharray="`${segment.length} ${circumference - segment.length}`"
              :stroke-dashoffset="segment.offset"
              transform="rotate(-90 100 100)"
            />
          </svg>
          <div class="donut-center-label">
            <div class="donut-total">{{ totalEmpleadosArea }}</div>
            <div class="donut-text">Total</div>
          </div>
        </div>
        <div class="legend">
          <div v-for="(area, index) in empleadosPorArea" :key="index" class="legend-item">
            <span class="legend-color" :style="{ backgroundColor: areaColors[index] }"></span>
            <span class="legend-label">{{ area.area }}</span>
          </div>
        </div>
        
        <!-- Desglose detallado por área -->
        <div class="area-breakdown">
          <div v-for="(area, index) in empleadosPorArea" :key="index" class="area-item">
            <div class="area-item-header">
              <div class="area-name">
                <span class="area-indicator" :style="{ backgroundColor: areaColors[index] }"></span>
                <span>{{ area.area }}</span>
              </div>
              <div class="area-stats">
                <span class="area-count">{{ area.count }}</span>
                <span class="area-percentage">({{ ((area.count / totalEmpleadosArea) * 100).toFixed(1) }}%)</span>
              </div>
            </div>
            <div class="area-bar">
              <div 
                class="area-bar-fill" 
                :style="{ 
                  width: (area.count / totalEmpleadosArea * 100) + '%',
                  backgroundColor: areaColors[index]
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendario -->
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
              'no-laboral': esNoLaboral(day),
              'selected': diaSeleccionado === day
            }"
            @click="seleccionarDia(day)"
          >
            {{ day }}
          </div>
        </div>
        <div class="calendar-legend">
          <span class="calendar-legend-item">
            <span class="legend-dot no-laboral-dot"></span>
            Día no laboral
          </span>
        </div>
      </div>
    </div>

    <!-- Gráfica de edad y género -->
    <div class="demographics-card">
      <h3>Estadísticas - Edad y Género</h3>
      <div class="demographics-info">
        <div class="demographics-legend">
          <span class="legend-item">
            <span class="legend-color" style="background: #845EF7"></span>
            Hombre
          </span>
          <span class="legend-item">
            <span class="legend-color" style="background: #E879F9"></span>
            Mujer
          </span>
        </div>
        <div class="demographics-total">
          Total: <strong>{{ stats.totalEmpleados.total.toLocaleString() }}</strong>
        </div>
      </div>
      <div class="bar-chart">
        <div v-for="rango in rangosEdad" :key="rango.label" class="bar-row">
          <div class="bar-label">{{ rango.label }}</div>
          <div class="bar-container">
            <div
              class="bar hombres"
              :style="{ width: rango.porcentajeHombres + '%' }"
              v-if="rango.hombres > 0"
            >
              <span class="bar-value" v-if="rango.hombres > 0">{{ rango.hombres }}</span>
            </div>
            <div
              class="bar mujeres"
              :style="{ width: rango.porcentajeMujeres + '%' }"
              v-if="rango.mujeres > 0"
            >
              <span class="bar-value" v-if="rango.mujeres > 0">{{ rango.mujeres }}</span>
            </div>
          </div>
          <div class="bar-percentage">{{ rango.porcentajeTotal }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// Estado reactivo
const stats = ref({
  nuevosEmpleados: { total: 0, porcentaje: 0, tendencia: 'up' },
  totalEmpleados: { total: 0, porcentaje: 0, tendencia: 'up' },
  asistenciasActivas: { total: 0, emoji: '💻📊📈', tendencia: 'neutral' }
});

const empleadosPorArea = ref([]);
const estadisticasEdadGenero = ref([]);
const diasNoLaborales = ref([25]);

// Colores para la gráfica de dona
const areaColors = ['#22C55E', '#3B82F6', '#A855F7', '#F59E0B', '#14B8A6'];

// Calendario
const fechaActual = ref(new Date());
const diaSeleccionado = ref(null);
const diasSemana = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

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

// Computed para la gráfica de dona
const totalEmpleadosArea = computed(() => {
  return empleadosPorArea.value.reduce((sum, area) => sum + area.count, 0);
});

const circumference = 2 * Math.PI * 80;

const donutSegments = computed(() => {
  let currentOffset = 0;
  return empleadosPorArea.value.map((area, index) => {
    const percentage = (area.count / totalEmpleadosArea.value);
    const length = circumference * percentage;
    const segment = {
      color: areaColors[index % areaColors.length],
      length,
      offset: -currentOffset
    };
    currentOffset += length;
    return segment;
  });
});

// Computed para gráfica de edad/género
const rangosEdad = computed(() => {
  const rangos = {
    '18-24': { hombres: 0, mujeres: 0 },
    '25-34': { hombres: 0, mujeres: 0 },
    '35-44': { hombres: 0, mujeres: 0 },
    '45-64': { hombres: 0, mujeres: 0 },
    '65+': { hombres: 0, mujeres: 0 }
  };

  estadisticasEdadGenero.value.forEach(stat => {
    const rango = stat._id.rangoEdad;
    const genero = stat._id.genero;
    if (rangos[rango]) {
      if (genero === 'Hombre') {
        rangos[rango].hombres = stat.count;
      } else if (genero === 'Mujer') {
        rangos[rango].mujeres = stat.count;
      }
    }
  });

  const total = stats.value.totalEmpleados.total;
  
  return Object.entries(rangos).map(([label, data]) => {
    const totalRango = data.hombres + data.mujeres;
    return {
      label,
      hombres: data.hombres,
      mujeres: data.mujeres,
      porcentajeHombres: total > 0 ? (data.hombres / total) * 100 : 0,
      porcentajeMujeres: total > 0 ? (data.mujeres / total) * 100 : 0,
      porcentajeTotal: total > 0 ? ((totalRango / total) * 100).toFixed(1) : 0
    };
  });
});

// Funciones de calendario
const esHoy = (dia) => {
  if (!dia) return false;
  const hoy = new Date();
  return dia === hoy.getDate() &&
         fechaActual.value.getMonth() === hoy.getMonth() &&
         fechaActual.value.getFullYear() === hoy.getFullYear();
};

const esNoLaboral = (dia) => {
  return diasNoLaborales.value.includes(dia);
};

const seleccionarDia = (dia) => {
  if (dia) diaSeleccionado.value = dia;
};

const previousMonth = () => {
  fechaActual.value = new Date(fechaActual.value.getFullYear(), fechaActual.value.getMonth() - 1);
};

const nextMonth = () => {
  fechaActual.value = new Date(fechaActual.value.getFullYear(), fechaActual.value.getMonth() + 1);
};

// Inicializar datos estáticos de ejemplo
const cargarDatos = () => {
  // Datos de ejemplo para el dashboard
  stats.value = {
    nuevosEmpleados: { total: 10, porcentaje: 18, tendencia: 'up' },
    totalEmpleados: { total: 1893, porcentaje: 12, tendencia: 'up' },
    asistenciasActivas: { total: 189, emoji: '💻📊📈', tendencia: 'neutral' }
  };
  
  empleadosPorArea.value = [
    { area: 'Asistencias', count: 450 },
    { area: 'Documentación', count: 380 },
    { area: 'Vacaciones', count: 420 },
    { area: 'Incidencias', count: 343 },
    { area: 'Areas', count: 300 }
  ];
  
  estadisticasEdadGenero.value = [
    { _id: { rangoEdad: '18-24', genero: 'Hombre' }, count: 30 },
    { _id: { rangoEdad: '18-24', genero: 'Mujer' }, count: 33 },
    { _id: { rangoEdad: '25-34', genero: 'Hombre' }, count: 200 },
    { _id: { rangoEdad: '25-34', genero: 'Mujer' }, count: 279 },
    { _id: { rangoEdad: '35-44', genero: 'Hombre' }, count: 142 },
    { _id: { rangoEdad: '35-44', genero: 'Mujer' }, count: 146 },
    { _id: { rangoEdad: '45-64', genero: 'Hombre' }, count: 118 },
    { _id: { rangoEdad: '45-64', genero: 'Mujer' }, count: 123 },
    { _id: { rangoEdad: '65+', genero: 'Hombre' }, count: 312 },
    { _id: { rangoEdad: '65+', genero: 'Mujer' }, count: 322 }
  ];
};

onMounted(() => {
  cargarDatos();
});
</script>

<style scoped>
/* ============================================
   DASHBOARD COMPONENT STYLES
   ============================================ */

/* --- Layout Container --- */
.dashboard-content {
  flex: 1;
  padding: 2rem;
  padding-bottom: 4rem;
  margin-left: 60px;
  min-height: 100vh;
  width: calc(100vw - 60px); /* Ancho total menos el sidebar */
  max-width: 100%;
  background: #F3F4F6; /* Mantener el fondo gris aquí también */
  box-sizing: border-box;
}

/* --- Header --- */
.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 2rem;
}

/* ============================================
   STATISTICS CARDS
   ============================================ */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  width: 100%;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.nuevos {
  background: #D1FAE5;
  color: #059669;
}

.stat-icon.empleados {
  background: #DBEAFE;
  color: #2563EB;
}

.stat-icon.activos {
  background: #E0E7FF;
  color: #6366F1;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6B7280;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 0.25rem;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #059669;
}

.stat-trend.up {
  color: #059669;
}

.stat-trend.down {
  color: #DC2626;
}

.stat-trend .material-symbols-rounded {
  font-size: 18px;
}

.stat-emoji {
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Main Section */
.main-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
  width: 100%;
}

/* Chart Card */
.chart-card {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  width: 100%;
  display: flex;
  flex-direction: column;
}

.chart-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 1rem;
}

.donut-chart-container {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 0 auto 1rem;
}

.donut-chart {
  width: 100%;
  height: 100%;
}

.donut-center-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.donut-total {
  font-size: 2rem;
  font-weight: 700;
  color: #1F2937;
}

.donut-text {
  font-size: 0.85rem;
  color: #6B7280;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: #4B5563;
}

.legend-color {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

/* Area Breakdown */
.area-breakdown {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.area-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.area-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.area-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #1F2937;
  font-weight: 500;
}

.area-indicator {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  flex-shrink: 0;
}

.area-stats {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.area-count {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1F2937;
}

.area-percentage {
  font-size: 0.85rem;
  color: #6B7280;
}

.area-bar {
  height: 12px;
  background: #F3F4F6;
  border-radius: 6px;
  overflow: hidden;
}

.area-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Calendar */
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

.calendar-day.no-laboral {
  background: #845EF7;
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
  justify-content: center;
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

.no-laboral-dot {
  background: #845EF7;
}

/* Demographics Card */
.demographics-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.demographics-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 1rem;
}

.demographics-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.demographics-legend {
  display: flex;
  gap: 1.5rem;
}

.demographics-total {
  font-size: 0.875rem;
  color: #6B7280;
}

/* Bar Chart */
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bar-row {
  display: grid;
  grid-template-columns: 60px 1fr 60px;
  align-items: center;
  gap: 1rem;
}

.bar-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4B5563;
}

.bar-container {
  display: flex;
  gap: 2px;
  height: 32px;
  background: #F3F4F6;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.3s ease;
  position: relative;
}

.bar.hombres {
  background: #845EF7;
}

.bar.mujeres {
  background: #E879F9;
}

.bar-value {
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  position: absolute;
}

.bar-percentage {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4B5563;
  text-align: right;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: 1fr 1fr; /* 2 columnas en tablets */
  }
}

@media (max-width: 1024px) {
  .dashboard-content {
    margin-left: 0;
    padding: 1.5rem;
    width: 100vw;
  }

  .main-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-content {
    padding: 1rem;
  }

  .stats-cards {
    grid-template-columns: 1fr; /* 1 columna en móviles */
  }

  .bar-row {
    grid-template-columns: 50px 1fr 50px;
    gap: 0.5rem;
  }
}

@media (min-width: 1024px) {
  .dashboard-content {
    padding: 3rem;
  }
}

@media (min-width: 1400px) {
  .dashboard-content {
    padding: 3rem 4rem;
  }
}
</style>