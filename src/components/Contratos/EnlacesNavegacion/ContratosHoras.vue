<template>
  <div class="horas-container">
    <!-- Navegación de mes -->
    <div class="month-nav">
      <button class="nav-btn" @click="prevMonth">
        <span class="material-symbols-rounded">chevron_left</span>
      </button>
      <span class="month-label">{{ currentMonthLabel }}</span>
      <button class="nav-btn" @click="nextMonth">
        <span class="material-symbols-rounded">chevron_right</span>
      </button>
    </div>

    <!-- Resumen de horas -->
    <div class="horas-summary">
      <div class="summary-item">
        <div class="icon-circle">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <div class="summary-info">
          <div class="summary-label">Esperado</div>
          <div class="summary-value">160h 0min</div>
        </div>
      </div>

      <div class="summary-item">
        <div class="icon-circle">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <div class="summary-info">
          <div class="summary-label">Registrado</div>
          <div class="summary-value">50h 25min</div>
        </div>
      </div>

      <div class="summary-item">
        <div class="icon-circle">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <div class="summary-info">
          <div class="summary-label">Horas extra</div>
          <div class="summary-value">+16h 00min</div>
          <a href="#" class="ver-detalles">VER DETALLES</a>
        </div>
      </div>
    </div>

    <!-- Divisor -->
    <div class="divider"></div>

    <!-- Lista de registros por día -->
    <div class="dias-list">
      <div v-for="dia in dias" :key="dia.id" class="dia-item">
        <!-- Columna izquierda: Fecha y día -->
        <div class="dia-fecha">
          <div class="dia-numero">{{ dia.num }}</div>
          <div class="dia-info">
            <div class="dia-nombre">{{ dia.nombre }}</div>
            <div class="dia-esperado">Esperado {{ dia.esperado }}</div>
          </div>
        </div>

        <!-- Columna derecha: Horarios y detalles -->
        <div class="dia-detalles">
          <div v-for="(registro, idx) in dia.registros" :key="idx" class="registro-row">
            <!-- Horarios -->
            <div class="horarios-group">
              <div class="time-block">
                <span class="time-label">Inicio</span>
                <span class="time-value">{{ registro.inicio }}</span>
              </div>
              <span class="arrow-icon">→</span>
              <div class="time-block">
                <span class="time-label">Fin</span>
                <span class="time-value">{{ registro.fin }}</span>
              </div>
              <div class="time-block">
                <span class="time-label">Pausa</span>
                <span class="time-value">{{ registro.pausa }}</span>
              </div>
            </div>

            <!-- Comentario -->
            <div class="comentario-block">
              <input 
                type="text" 
                :value="registro.comentario" 
                :placeholder="registro.comentarioPlaceholder"
                class="comentario-input"
              />
            </div>

            <!-- Icono de alerta -->
            <div class="alerta-icon" v-if="registro.alerta">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#EF4444">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01" stroke="white" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>

            <!-- Duración -->
            <div class="duracion-block">
              <span class="duracion-value">{{ registro.duracion }}</span>
            </div>

            <!-- Estado -->
            <div class="estado-block">
              <span :class="['estado-badge', registro.estadoClass]">{{ registro.estado }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const currentYear = ref(2025)
const currentMonthIndex = ref(9) // 9 = Octubre (0-based)

const meses = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
]

const diasSemana = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 
  'Jueves', 'Viernes', 'Sábado'
]

// Computed para el label del mes actual
const currentMonthLabel = computed(() => {
  return `${meses[currentMonthIndex.value]} ${currentYear.value}`
})

// Función para obtener el nombre del día de la semana
const getDiaSemana = (year, month, day) => {
  const fecha = new Date(year, month, day)
  return diasSemana[fecha.getDay()]
}

// Datos de ejemplo de registros (estos deberían venir de una API en producción)
const registrosData = {
  '2025-9-29': [
    { 
      inicio: '08:01', 
      fin: '12:02', 
      pausa: '01:00', 
      comentario: 'Doble turno', 
      comentarioPlaceholder: 'Doble turno',
      duracion: '6h 36min',
      estado: 'APROBADO',
      estadoClass: 'aprobado',
      alerta: true
    },
    { 
      inicio: '16:00', 
      fin: '20:05', 
      pausa: '00:30', 
      comentario: '', 
      comentarioPlaceholder: 'Otro comentario',
      duracion: '',
      estado: '',
      estadoClass: '',
      alerta: false
    }
  ],
  '2025-9-30': [
    { 
      inicio: '09:23', 
      fin: '18:35', 
      pausa: '00:58', 
      comentario: '', 
      comentarioPlaceholder: 'Escribir un comentario',
      duracion: '8h 14min',
      estado: 'APROBADO',
      estadoClass: 'aprobado',
      alerta: false
    }
  ],
  '2025-10-1': [
    { 
      inicio: '08:01', 
      fin: '18:00', 
      pausa: '01:00', 
      comentario: '', 
      comentarioPlaceholder: 'Escribir un comentario',
      duracion: '8h 59min',
      estado: 'APROBADO',
      estadoClass: 'aprobado',
      alerta: false
    }
  ],
  '2025-10-4': [
    { 
      inicio: '', 
      fin: '', 
      pausa: '', 
      comentario: '', 
      comentarioPlaceholder: 'Escribir un comentario',
      duracion: '0h 0min',
      estado: '',
      estadoClass: '',
      alerta: false
    }
  ]
}

// Computed para generar los días del mes actual
const dias = computed(() => {
  const year = currentYear.value
  const month = currentMonthIndex.value
  
  // Obtener el número de días en el mes
  const diasEnMes = new Date(year, month + 1, 0).getDate()
  
  const diasArray = []
  
  // Generar TODOS los días del mes
  for (let dia = 1; dia <= diasEnMes; dia++) {
    const key = `${year}-${month}-${dia}`
    const registros = registrosData[key] || [
      { 
        inicio: '', 
        fin: '', 
        pausa: '', 
        comentario: '', 
        comentarioPlaceholder: 'Escribir un comentario',
        duracion: '',
        estado: '',
        estadoClass: '',
        alerta: false
      }
    ]
    
    diasArray.push({
      id: dia,
      num: dia.toString().padStart(2, '0'),
      nombre: getDiaSemana(year, month, dia),
      esperado: '8h',
      registros: registros
    })
  }
  
  return diasArray
})

const prevMonth = () => {
  if (currentMonthIndex.value === 0) {
    currentMonthIndex.value = 11
    currentYear.value--
  } else {
    currentMonthIndex.value--
  }
}

const nextMonth = () => {
  if (currentMonthIndex.value === 11) {
    currentMonthIndex.value = 0
    currentYear.value++
  } else {
    currentMonthIndex.value++
  }
}
</script>

<style scoped>
.horas-container {
  background: transparent;
  padding: 0;
}

/* Navegación de mes */
.month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid #E5E7EB;
  margin-bottom: 1.5rem;
}

.nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7C3AED;
  transition: all 0.2s;
}

.nav-btn:hover {
  opacity: 0.7;
}

.nav-btn .material-symbols-rounded {
  font-size: 24px;
}

.month-label {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  min-width: 100px;
  text-align: center;
}

/* Resumen de horas */
.horas-summary {
  display: flex;
  gap: 3rem;
  padding: 0 0 1.5rem 0;
  justify-content: center;
}

.summary-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #F0F9FF;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.summary-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-label {
  color: #6B7280;
  font-size: 0.8125rem;
  font-weight: 500;
}

.summary-value {
  font-weight: 700;
  font-size: 0.9375rem;
  color: #111827;
}

.ver-detalles {
  color: #06B6D4;
  font-size: 0.6875rem;
  font-weight: 700;
  text-decoration: none;
  margin-top: 0.125rem;
}

.ver-detalles:hover {
  text-decoration: underline;
}

/* Divisor */
.divider {
  height: 1px;
  background: #E5E7EB;
  margin: 0 0 1.5rem 0;
}

/* Lista de días */
.dias-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.dia-item {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 2rem;
  padding: 1.25rem 0;
  border-bottom: 1px solid #F3F4F6;
}

.dia-item:last-child {
  border-bottom: none;
}

/* Fecha */
.dia-fecha {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.dia-numero {
  font-size: 2.5rem;
  font-weight: 700;
  color: #6B7280;
  line-height: 1;
}

.dia-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding-top: 0.25rem;
}

.dia-nombre {
  font-weight: 600;
  font-size: 0.9375rem;
  color: #111827;
}

.dia-esperado {
  font-size: 0.75rem;
  color: #9CA3AF;
}

/* Detalles */
.dia-detalles {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.registro-row {
  display: grid;
  grid-template-columns: auto 1fr 32px 90px 100px;
  gap: 1rem;
  align-items: center;
}

/* Horarios */
.horarios-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.time-block {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.time-label {
  font-size: 0.6875rem;
  color: #9CA3AF;
  text-transform: capitalize;
}

.time-value {
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
  text-decoration: underline;
}

.arrow-icon {
  color: #D1D5DB;
  font-size: 1.25rem;
  margin-top: 0.75rem;
}

/* Comentario */
.comentario-block {
  display: flex;
  align-items: center;
}

.comentario-input {
  width: 100%;
  border: none;
  border-bottom: 1px solid #E5E7EB;
  padding: 0.375rem 0;
  font-size: 0.8125rem;
  color: #111827;
  outline: none;
  background: transparent;
}

.comentario-input::placeholder {
  color: #D1D5DB;
  font-style: italic;
}

.comentario-input:focus {
  border-bottom-color: #06B6D4;
}

/* Alerta */
.alerta-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Duración */
.duracion-block {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.duracion-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

/* Estado */
.estado-block {
  display: flex;
  align-items: center;
  justify-content: center;
}

.estado-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-weight: 700;
  font-size: 0.6875rem;
  border-radius: 4px;
  text-align: center;
}

.estado-badge.aprobado {
  background: #D1FAE5;
  color: #059669;
}
</style>
