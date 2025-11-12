<template>
  <div class="vacaciones-content">
    <!-- Mostrar el formulario de incidencias cuando showIncidencia sea true -->
    <IncidenciasFormulario v-if="showIncidencia" @cerrar="closeIncidencia" @incidencia-creada="onIncidenciaCreada" />

    <!-- Mostrar el componente de solicitud en su propia vista cuando showSolicitud sea true -->
    <SolicitudComponent
      v-else-if="showSolicitud"
      :selected-dates="selectedDates"
      :day-status="dayStatus"
      @close="closeSolicitud"
      @submitted="handleSolicitudSubmitted"
    />

    <!-- Vista principal original -->
    <template v-else>
      <!-- Header: título y botón en la misma línea -->
      <header class="header">
        <div class="header-left">
          <h1>Vacaciones</h1>
        </div>

        <div class="header-right">
          <button class="btn-incident" @click="openIncidencia">Registrar Incidencia</button>
        </div>
      </header>

      <!-- Contenedor principal alineado con el título -->
      <section class="Container">
        <div class="card">
          <!-- Leyenda -->
          <div class="legend-row">
            <div class="legend-left">
              <div class="legend-item">
                <span class="dot available"></span>
                <span class="label">Disponible (Días Hábiles)</span>
              </div>

              <div class="legend-item">
                <span class="dot approved"></span>
                <span class="label">Aprobados</span>
              </div>
            </div>

            <div class="legend-right">
              <div class="legend-item">
                <span class="dot holiday"></span>
                <span class="label">Festivo</span>
              </div>

              <div class="legend-item">
                <span class="dot requested"></span>
                <span class="label">Solicitados</span>
              </div>

              <div class="legend-item">
                <span class="dot to-request"></span>
                <span class="label">A Solicitar</span>
              </div>
            </div>
          </div>

          <!-- Month / Year pill -->
          <div class="month-row">
            <div class="month-pill" role="group" aria-label="Seleccionar mes y año">
              <button class="pill-left" type="button" @click.prevent="toggleMonth" :aria-expanded="showMonth" aria-haspopup="listbox">
                <svg class="chev" width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="#444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span class="pill-text">{{ monthNames[currentMonth].toUpperCase() }}</span>
              </button>

              <div class="pill-divider" />

              <button class="pill-right" type="button" @click.prevent="toggleYear" :aria-expanded="showYear" aria-haspopup="listbox">
                <span class="pill-text">{{ currentYear }}</span>
                <svg class="chev" width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="#444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>

              <div v-if="showMonth" class="dropdown months" role="listbox">
                <div v-for="(m,i) in monthNames" :key="i" class="dd-item" @click="setMonth(i)">{{ m }}</div>
              </div>
              <div v-if="showYear" class="dropdown years" role="listbox">
                <div v-for="y in years" :key="y" class="dd-item" @click="setYear(y)">{{ y }}</div>
              </div>
            </div>
          </div>

          <!-- Calendario -->
          <div class="calendar" aria-label="Calendario mensual">
            <div class="weekday-row" aria-hidden="true">
              <div v-for="d in weekDays" :key="d" class="weekday">{{ d }}</div>
            </div>

            <div class="days-grid" role="grid">
              <div
                v-for="cell in calendarCells"
                :key="cell.key"
                class="day-cell"
                :class="{ 'other-month': cell.otherMonth }"
                role="gridcell"
                :aria-selected="selectedDates.includes(cell.dateKey) ? 'true' : 'false'"
                @click="onDayClick(cell)"
                :title="cell.otherMonth ? '' : statusLabel(cell.dateKey)"
              >
                <div class="day-box">
                  <div class="day-pill" :class="pillClass(cell.dateKey)">
                    <span class="day-number">{{ cell.day }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer strip with actions -->
          <div class="footer-strip-wrap">
            <div class="card-footer">
              <div class="available-info">
                <strong>{{ availableDaysCount }}</strong> Días Disponibles para Vacaciones
              </div>
              <div class="footer-actions">
                <button
                  class="requestbtn-"
                  @click="requestSelected"
                  :disabled="selectedDates.length === 0"
                  :aria-disabled="selectedDates.length === 0"
                >
                  <span class="plus">+</span>
                  <span>Solicitar</span>
                </button>
              </div>
            </div>
          </div>

        </div> <!-- end card -->
      </section>
    </template>
  </div>
</template>

<script>
import VacacionIncidenciaComponent from './Vacacion-incidencia-component/Vacacion-Incidencia.component.vue';
import SolicitudComponent from './Solicitud-vacaciones-component/Solicitud-component.vue';
import IncidenciasFormulario from '../Incidencias/Incidencias-Formulario.vue';

import * as vacacionesService from '@/services/vacacionesService.js';

export default {
  name: 'Vacaciones',
  components: {
    VacacionIncidenciaComponent,
    SolicitudComponent,
    IncidenciasFormulario
  },
  data() {
    const today = new Date();
    return {
      monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
      weekDays: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],

      currentMonth: today.getMonth(),
      currentYear: today.getFullYear(),

      showMonth: false,
      showYear: false,

      years: (() => {
        const base = today.getFullYear();
        const arr = [];
        for (let y = base - 5; y <= base + 5; y++) arr.push(y);
        return arr;
      })(),

      // mapa de estados por fecha YYYY-MM-DD
      dayStatus: {},

      // selección temporal
      selectedDates: [],

      // flag para mostrar el componente de incidencia
      showIncidencia: false,

      // flag para mostrar el componente de solicitud
      showSolicitud: false,

      // Lista de festivos
      defaultFixedHolidays: ['01-01', '05-01', '12-25'],

      // Loading
      loading: true
    };
  },
  computed: {
    calendarCells() {
      const year = this.currentYear;
      const month = this.currentMonth;
      const firstOfMonth = new Date(year, month, 1);
      const startWeekday = firstOfMonth.getDay();
      const totalCells = 42;
      const firstCellDate = new Date(year, month, 1 - startWeekday);

      const cells = [];
      for (let i = 0; i < totalCells; i++) {
        const d = new Date(firstCellDate.getFullYear(), firstCellDate.getMonth(), firstCellDate.getDate() + i);
        const day = d.getDate();
        const otherMonth = d.getMonth() !== month;
        const key = this.fmtKey(d);
        cells.push({ date: d, day, otherMonth, dateKey: key, key: `${key}-${i}` });
      }
      return cells;
    },
    availableDaysCount() {
      let count = 0;
      for (const cell of this.calendarCells) {
        if (cell.otherMonth) continue;
        const s = this.statusOf(cell.dateKey);
        if (s === 'available') count++;
      }
      return count;
    }
  },
  methods: {
    /**
     * Cargar solicitudes de vacaciones desde la BD
     */
    async loadSolicitudes() {
      try {
        this.loading = true;
        console.log('📋 Cargando solicitudes de vacaciones...');

        // Obtener empleado actual
        const empleadoResp = await vacacionesService.getEmpleadoActual();

        if (!empleadoResp.success) {
          throw new Error('No se pudo obtener datos del empleado');
        }

        const empleadoId = empleadoResp.data.id;

        // Obtener todas las solicitudes del empleado
        const solicitudesResp = await vacacionesService.getSolicitudesVacaciones(empleadoId);

        if (solicitudesResp.success) {
          console.log('✅ Solicitudes cargadas:', solicitudesResp.data.length);

          // Procesar las solicitudes y marcar los días en el calendario
          for (const solicitud of solicitudesResp.data) {
            // Obtener los días específicos de cada solicitud
            const diasResp = await vacacionesService.getDiasSolicitud(solicitud.id);

            if (diasResp.success) {
              // Marcar cada día según el estado de la solicitud
              for (const dia of diasResp.data) {
                const fechaDia = dia.fecha_dia; // formato: YYYY-MM-DD

                if (solicitud.estado === 'Pendiente') {
                  this.dayStatus[fechaDia] = 'requested';
                } else if (solicitud.estado === 'Aprobada') {
                  this.dayStatus[fechaDia] = 'approved';
                } else if (solicitud.estado === 'Rechazada') {
                  // Los días rechazados se marcan nuevamente como disponibles
                  delete this.dayStatus[fechaDia];
                } else if (solicitud.estado === 'Cancelada') {
                  delete this.dayStatus[fechaDia];
                }
              }
            }
          }

          console.log('✅ Días marcados en calendario');
        }
      } catch (error) {
        console.error('❌ Error cargando solicitudes:', error);
      } finally {
        this.loading = false;
      }
    },

    fmtKey(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    },

    isHoliday(date) {
      const mmdd = String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
      return this.defaultFixedHolidays.includes(mmdd);
    },

    updateVisibleMonthHolidays() {
      const newStatus = { ...this.dayStatus };

      for (const cell of this.calendarCells) {
        if (cell.otherMonth) continue;
        if (this.isHoliday(cell.date)) {
          // Solo marcar como festivo si no tiene otro estado (requested, approved, etc)
          if (!newStatus[cell.dateKey] || newStatus[cell.dateKey] === 'available') {
            newStatus[cell.dateKey] = 'holiday';
          }
        }
      }

      this.dayStatus = newStatus;

      // Limpiar selecciones fuera del mes visible
      this.selectedDates = this.selectedDates.filter(k => {
        const [y, m] = k.split('-');
        return Number(y) === this.currentYear && (Number(m) - 1) === this.currentMonth;
      });
    },

    statusOf(dateKey) {
      return this.dayStatus[dateKey] || 'available';
    },

    pillClass(dateKey) {
      const s = this.statusOf(dateKey);
      const classes = [];
      if (s === 'available') classes.push('available');
      if (s === 'approved') classes.push('approved');
      if (s === 'holiday') classes.push('holiday');
      if (s === 'requested') classes.push('requested');
      if (s === 'to-request') classes.push('to-request');
      if (this.selectedDates.includes(dateKey)) classes.push('selected');
      return classes.join(' ');
    },

    statusLabel(dateKey) {
      const s = this.statusOf(dateKey);
      const labels = {
        available: 'Disponible',
        approved: 'Aprobado',
        holiday: 'Festivo',
        requested: 'Solicitado',
        'to-request': 'A Solicitar'
      };
      return labels[s] || 'Disponible';
    },

    toggleMonth() {
      this.showMonth = !this.showMonth;
      this.showYear = false;
    },
    toggleYear() {
      this.showYear = !this.showYear;
      this.showMonth = false;
    },
    setMonth(i) {
      this.currentMonth = i;
      this.showMonth = false;
    },
    setYear(y) {
      this.currentYear = y;
      this.showYear = false;
    },

    isSelectable(cell) {
      if (cell.otherMonth) return false;
      const s = this.statusOf(cell.dateKey);
      return s === 'available' || s === 'to-request';
    },

    onDayClick(cell) {
      if (!this.isSelectable(cell)) return;
      const key = cell.dateKey;
      const idx = this.selectedDates.indexOf(key);
      if (idx !== -1) {
        this.selectedDates.splice(idx, 1);
        if (this.dayStatus[key] === 'to-request') this.dayStatus[key] = 'available';
      } else {
        this.selectedDates.push(key);
        this.dayStatus[key] = 'to-request';
      }
    },

    requestSelected() {
      if (!this.selectedDates.length) return;
      this.showSolicitud = true;
    },

    async handleSolicitudSubmitted(payload) {
      this.selectedDates.forEach(k => { this.dayStatus[k] = 'requested'; });
      this.selectedDates = [];
      this.showSolicitud = false;

      // Recargar las solicitudes después de enviar una nueva
      await this.loadSolicitudes();

      // alert('Solicitud enviada.');
    },

    onGlobalClick(e) {
      const path = e.composedPath && e.composedPath();
      const inside = path && path.some(el => el && el.classList && (el.classList.contains('month-pill') || el.classList.contains('pill-left') || el.classList.contains('pill-right')));
      if (!inside) {
        this.showMonth = false;
        this.showYear = false;
      }
    },

    // Métodos para abrir/cerrar la vista de incidencia
    openIncidencia() {
      this.showIncidencia = true;
    },
    closeIncidencia() {
      this.showIncidencia = false;
    },
    onIncidenciaCreada(incidencia) {
      this.showSuccessAnimation();
      this.closeIncidencia();
    },
    showSuccessAnimation() {
      // Crear elemento de animación de éxito
      const successEl = document.createElement('div');
      successEl.className = 'success-animation';
      successEl.innerHTML = `
        <div class="success-content">
          <div class="checkmark">✓</div>
          <p>Incidencia registrada exitosamente</p>
        </div>
      `;
      document.body.appendChild(successEl);
      
      // Remover después de la animación
      setTimeout(() => {
        document.body.removeChild(successEl);
      }, 3000);
    },

    closeSolicitud() {
      this.showSolicitud = false;
    }
  },
  watch: {
    currentMonth() { this.updateVisibleMonthHolidays(); },
    currentYear() { this.updateVisibleMonthHolidays(); }
  },
  mounted() {
    console.log('🎯 Componente Vacaciones montado');
    this.updateVisibleMonthHolidays();
    this.loadSolicitudes(); // Cargar solicitudes desde BD
    window.addEventListener('click', this.onGlobalClick);
  },
  beforeUnmount() {
    window.removeEventListener('click', this.onGlobalClick);
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

:root{
  --bg: #efeff1;
  --card-bg: #ffffff;
  --muted: #9aa0a6;
  --btn-purple: #5932EA;
  --red: #E7000B;
  --green: #00C951;
  --purple: #4F39F6;
  --yellow: #FCC800;
  --btn-request: #27272A;
}

/* Page */
.vacaciones-content {
  flex: 1;
  padding: 2rem;
  margin-left: 60px;
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  padding-top: 2rem;
  flex-direction: column;
  background: var(--bg);
  box-sizing: border-box;
}

/* Header */
.header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.header-left h1, h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  letter-spacing: 1px;
}

.btn-incident {
  background-color: #5932EA;
  color: #ffffff;
  border: none;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(89,50,234,0.18);
}
.btn-incident:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(89,50,234,0.22);
}

/* Container & card */
.Container {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  margin-top: 0.25rem;
  box-sizing: border-box;
}
.card {
  width: 100%;
  max-width: 980px;
  background: var(--card-bg);
  border-radius: 14px;
  padding: 18px 22px 28px;
  box-shadow: 0 12px 30px rgba(17, 24, 39, 0.08);
  box-sizing: border-box;
}

/* Legend */
.legend-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.legend-left, .legend-right {
  display: flex;
  gap: 22px;
  align-items: center;
}
.legend-item {
  display: flex;
  gap: 10px;
  align-items: center;
  color: var(--muted);
  font-size: 13px;
  white-space: nowrap;
}
.dot {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  box-shadow: 0 8px 18px rgba(17,24,39,0.06), inset 0 -3px 6px rgba(255,255,255,0.3);
}
.dot.available {
  background: #ffffff;
  border: 1px solid #e6e6e9;
  box-shadow: 0 6px 14px rgba(17,24,39,0.04);
}
.dot.approved { background: linear-gradient(180deg,#00C951,#00B944); }
.dot.holiday { background: linear-gradient(180deg,#E7000B,#cc0009); }
.dot.requested { background: linear-gradient(180deg,#FCC800,#f4b400); }
.dot.to-request { background: linear-gradient(180deg,#4F39F6,#3f2bf0); }

/* Month pill */
.month-row {
  display: flex;
  justify-content: center;
  position: relative;
}
.month-pill {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  padding: 12px 18px;
  border-radius: 10px;
  box-shadow: 0 12px 30px rgba(17,24,39,0.06);
  transform: translateY(8px);
  position: relative;
  z-index: 6;
  min-width: 420px;
  width: 60%;
  justify-content: center;
}
.pill-left, .pill-right {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 700;
  color: #111827;
  padding: 6px 8px;
}
.pill-text { font-size: 13px; letter-spacing: 1px; }
.pill-divider { width: 1px; height: 30px; background: #f1f1f3; border-radius: 2px; }
.chev { opacity: 0.9; }

/* Dropdown */
.dropdown {
  position: absolute;
  top: calc(100% + 10px);
  left: 16px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(17,24,39,0.08);
  overflow: hidden;
  z-index: 40;
  min-width: 160px;
}
.dropdown.years { left: auto; right: 16px; }
.dd-item { padding: 8px 12px; font-size: 14px; color: #222; cursor: pointer; }
.dd-item:hover { background: #f7f7fb; }

/* Calendar */
.calendar {
  background: #fff;
  border-radius: 12px;
  padding: 22px 18px 18px 18px;
  box-shadow: 0 8px 30px rgba(17, 24, 39, 0.02);
  margin-top: 8px;
}
.weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}
.weekday {
  text-align: center;
  color: var(--muted);
  font-size: 13px;
}

/* Days grid */
.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
}
.day-cell {
  min-height: 66px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.day-cell.other-month { opacity: 0.32; cursor: default; }

/* Day box */
.day-box {
  width: 60px;
  height: 52px;
  border-radius: 12px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(17,24,39,0.03);
}

/* Day pill */
.day-pill {
  width: 46px;
  height: 40px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform .18s cubic-bezier(.2,.9,.3,1), box-shadow .18s ease, background .18s ease;
  background: transparent;
  color: #111827;
  font-weight: 700;
  font-size: 14px;
  box-shadow: none;
}
.day-number { display: inline-block; }

/* States colors */
.day-pill.approved {
  background: linear-gradient(180deg,#00C951,#00B944);
  color: #fff;
  box-shadow: 0 10px 22px rgba(0,201,81,0.12);
}
.day-pill.holiday {
  background: linear-gradient(180deg,#E7000B,#cc0009);
  color: #fff;
  box-shadow: 0 10px 22px rgba(231,0,11,0.12);
}
.day-pill.requested {
  background: linear-gradient(180deg,#FCC800,#f4b400);
  color: #27272A;
  box-shadow: 0 10px 22px rgba(252,200,0,0.10);
}
.day-pill.to-request, .day-pill.selected {
  background: linear-gradient(180deg,#4F39F6,#3f2bf0);
  color: #fff;
  box-shadow: 0 12px 30px rgba(79,57,246,0.12);
  animation: pop .28s cubic-bezier(.2,.9,.3,1);
}
.day-pill.available {
  background: transparent;
  color: #111827;
  box-shadow: none;
}

/* Dim other-month */
.day-cell.other-month .day-box { background: #fbfbfb; }
.day-cell.other-month .day-pill { color: #9aa0a6; }

/* Pop animation */
@keyframes pop {
  0% { transform: scale(.86); opacity: 0.9; }
  60% { transform: scale(1.06); }
  100% { transform: scale(1); opacity: 1; }
}

/* Footer strip */
.footer-strip-wrap {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
.card-footer {
  width: 96%;
  max-width: 760px;
  background: #fff;
  border-radius: 12px;
  padding: 14px 18px;
  box-shadow: 0 8px 22px rgba(17,24,39,0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.available-info { color: #666; font-size: 14px; }

.footer-actions { display: flex; align-items: center; gap: 12px; }

.btn-request {
  background: var(--btn-request);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 6px 14px rgba(0,0,0,0.06);
}
.btn-request .plus {
  display: inline-flex;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: rgba(255,255,255,0.12);
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 22px;
}
.btn-request:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 900px) {
  .card { padding: 16px; }
  .month-pill { width: 90%; padding: 10px 12px; transform: translateY(6px); }
  .day-box { width: 52px; height: 46px; }
  .day-pill { width: 40px; height: 34px; }
  .weekday { font-size: 12px; }
  .card-footer { width: 100%; max-width: none; padding: 12px; }
}

/* Animación de éxito */
.success-animation {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  animation: popIn 0.4s ease-out, fadeOut 0.4s ease-out 2.6s forwards;
}

.success-content {
  background: linear-gradient(135deg, #4F39F6, #5a4fc7);
  color: white;
  padding: 2rem 3rem;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(79, 57, 246, 0.3);
  text-align: center;
  min-width: 300px;
}

.checkmark {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  animation: scaleIn 0.5s ease-out;
}

.success-content p {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
}

@keyframes popIn {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
</style>
