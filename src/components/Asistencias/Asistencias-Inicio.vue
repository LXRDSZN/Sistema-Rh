<template>
  <div class="asistencias-inicio">
    <!-- Formulario de incidencias -->
    <IncidenciasFormulario v-if="showIncidencia" @cerrar="showIncidencia = false" />
    
    <div class="content-inner" v-if="!loading">
      <div class="header-section">
        <h1>Asistencias</h1>
        <button class="btn-incidencia" @click="showIncidencia = true">+ Registrar Incidencia</button>
      </div>
      
      <!-- Estado Actual -->
      <div class="card">
        <h2>Estado actual</h2>
        <div class="estado-grid">
          <div class="stat-item">
            <div class="stat-number">{{ dashboardData?.estadoActual?.presentes || 0 }}</div>
            <div class="stat-label">Presentes</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ dashboardData?.estadoActual?.retardos || 0 }}</div>
            <div class="stat-label">Retardos</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ dashboardData?.estadoActual?.ausencias || 0 }}</div>
            <div class="stat-label">Ausencias</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ dashboardData?.estadoActual?.inactivos || 0 }}</div>
            <div class="stat-label">Inactivos</div>
          </div>
        </div>
      </div>

      <!-- Alertas -->
      <div class="card">
        <h2>Alertas</h2>
        <div class="alertas-container">
          <div class="alerta alerta-warning">
            <span class="alerta-icon">⚠️</span>
            <span class="alerta-text">Riesgo de patrón de ausencia: {{ dashboardData?.alertas?.patronesAusencia || 0 }}</span>
          </div>
          <div class="alerta alerta-danger">
            <span class="alerta-icon">🔔</span>
            <span class="alerta-text">Retardos críticos hoy: {{ dashboardData?.alertas?.retardosCriticos || 0 }}</span>
          </div>
          <div class="alerta alerta-info">
            <span class="alerta-icon">ℹ️</span>
            <span class="alerta-text">Ausencias/Permisos pendientes: {{ dashboardData?.alertas?.permisosPendientes || 0 }}</span>
          </div>
          <div class="alerta alerta-gray">
            <span class="alerta-icon">🚫</span>
            <span class="alerta-text">Acceso de empleado inactivo: {{ dashboardData?.alertas?.accesoInactivos || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Gráficas -->
      <div class="graficas-grid">
        <!-- Tasa de Puntualidad -->
        <div class="card">
          <h2>Tasa de puntualidad mensual</h2>
          <div class="puntualidad-container">
            <div class="puntualidad-numero">{{ dashboardData?.tasaPuntualidad || 0 }}%</div>
            <div class="puntualidad-label">Puntualidad</div>
          </div>
        </div>

        <!-- Estadísticas Semanales -->
        <div class="card">
          <div class="subtitle">Estadísticas semanales</div>
          <h2>Retardos y ausencias</h2>
          
          <div class="leyenda">
            <div class="leyenda-item">
              <div class="leyenda-color" style="background-color: #6366f1;"></div>
              <span>Retardos</span>
            </div>
            <div class="leyenda-item">
              <div class="leyenda-color" style="background-color: #312e81;"></div>
              <span>Ausencias</span>
            </div>
          </div>

          <div class="barras-container">
            <div class="barra-row" v-for="(dia, index) in estadisticasSemanales" :key="index">
              <span class="barra-label">{{ dia.dia }}</span>
              <div class="barra-bg">
                <div class="barra-fill retardos" :style="{ width: calcularAncho(dia.retardos) }"></div>
                <div class="barra-fill ausencias" :style="{ left: calcularAncho(dia.retardos), width: calcularAncho(dia.ausencias) }"></div>
              </div>
            </div>
          </div>

          <div class="escala">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
            <span>6</span>
            <span>7</span>
            <span>8</span>
            <span>9</span>
            <span>10</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando datos de asistencias...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAsistencias } from '@/composables/useAsistencias'
import IncidenciasFormulario from '../Incidencias/Incidencias-Formulario.vue'

const showIncidencia = ref(false)

// Composable
const {
  dashboardData,
  loading,
  cargarDashboard
} = useAsistencias()

// Cargar datos al montar
onMounted(async () => {
  await cargarDashboard()
})

// Estadísticas semanales procesadas
const estadisticasSemanales = computed(() => {
  if (!dashboardData.value?.estadisticasSemanales) {
    return [
      { dia: 'Lunes', retardos: 0, ausencias: 0 },
      { dia: 'Martes', retardos: 0, ausencias: 0 },
      { dia: 'Miércoles', retardos: 0, ausencias: 0 },
      { dia: 'Jueves', retardos: 0, ausencias: 0 },
      { dia: 'Viernes', retardos: 0, ausencias: 0 }
    ]
  }
  
  // Mapear días de la BD
  return dashboardData.value.estadisticasSemanales.map(d => ({
    dia: d.dia?.trim() || 'N/A',
    retardos: parseInt(d.retardos) || 0,
    ausencias: parseInt(d.ausencias) || 0
  }))
})

// Calcular ancho de barra (máximo 10 = 100%)
const calcularAncho = (valor) => {
  const porcentaje = Math.min((valor / 10) * 100, 100)
  return `${porcentaje}%`
}
</script>

<style scoped>
.asistencias-inicio {
  width: 100%;
}

.content-inner {
  width: 100%;
  max-width: 1400px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.btn-incidencia {
  background: linear-gradient(135deg, #4F39F6, #5a4fc7);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(79, 57, 246, 0.2);
  transition: all 0.3s ease;
}

.btn-incidencia:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 57, 246, 0.3);
}

/* Animación de éxito */
.success-toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 9999;
  animation: slideIn 0.3s ease-out, slideOut 0.3s ease-out 2.7s forwards;
}

.success-content {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@keyframes slideIn {
  0% {
    transform: translateX(400px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(400px);
    opacity: 0;
  }
}

.card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

h2, .card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1.5rem;
}

/* Estado Actual */
.estado-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 3rem;
  font-weight: bold;
  color: #111827;
}

.stat-label {
  color: #6b7280;
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

/* Alertas */
.alertas-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.alerta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
}

.alerta-warning {
  background-color: #fef3c7;
}

.alerta-warning .alerta-text {
  color: #78350f;
}

.alerta-danger {
  background-color: #fee2e2;
}

.alerta-danger .alerta-text {
  color: #7f1d1d;
}

.alerta-info {
  background-color: #dbeafe;
}

.alerta-info .alerta-text {
  color: #1e3a8a;
}

.alerta-gray {
  background-color: #f3f4f6;
}

.alerta-gray .alerta-text {
  color: #374151;
}

.alerta-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.alerta-text {
  font-size: 0.875rem;
}

/* Gráficas */
.graficas-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

/* Puntualidad */
.puntualidad-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 250px;
  flex-direction: column;
}

.puntualidad-numero {
  font-size: 5rem;
  font-weight: bold;
  color: #111827;
  line-height: 1;
}

.puntualidad-label {
  color: #6b7280;
  margin-top: 0.5rem;
  font-size: 1rem;
}

/* Estadísticas Semanales */
.subtitle {
  font-size: 0.875rem;
  color: #9ca3af;
  margin-bottom: 0.5rem;
}

.leyenda {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.leyenda-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.leyenda-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.barras-container {
  margin-bottom: 1rem;
}

.barra-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.barra-label {
  width: 80px;
  font-size: 0.875rem;
  color: #374151;
}

.barra-bg {
  flex: 1;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.barra-fill {
  position: absolute;
  height: 100%;
  border-radius: 4px;
}

.barra-fill.retardos {
  background-color: #6366f1;
  left: 0;
}

.barra-fill.ausencias {
  background-color: #312e81;
}

.escala {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #9ca3af;
  padding: 0 80px;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top-color: #4F39F6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container p {
  color: #6b7280;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .estado-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .graficas-grid {
    grid-template-columns: 1fr;
  }
}
</style>
