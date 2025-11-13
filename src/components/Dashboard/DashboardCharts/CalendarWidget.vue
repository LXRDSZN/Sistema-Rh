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
</template>

<script setup>
import { ref, computed } from 'vue';

// State
const fechaActual = ref(new Date());
const diaSeleccionado = ref(null);
const diasNoLaborales = ref([25]); // Día 25 de cada mes

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
</style>
