<template>
  <div class="asistencias-inicio">
    <!-- Formulario de incidencias -->
    <IncidenciasFormulario v-if="showIncidencia" @cerrar="showIncidencia = false" />
    
    <div class="content-inner">
      <div class="header-section">
        <h1>Asistencias</h1>
        <button class="btn-incidencia" @click="showIncidencia = true">+ Registrar Incidencia</button>
      </div>
      
      <!-- Estado Actual -->
      <div class="card">
        <h2>Estado actual</h2>
        <div class="estado-grid">
          <div class="stat-item">
            <div class="stat-number">25</div>
            <div class="stat-label">Presentes</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">1</div>
            <div class="stat-label">Retardos</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">1</div>
            <div class="stat-label">Ausencias</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">5</div>
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
            <span class="alerta-text">Riesgo de patrón de ausencia: 2</span>
          </div>
          <div class="alerta alerta-danger">
            <span class="alerta-icon">🔔</span>
            <span class="alerta-text">Retardos críticos hoy: 1</span>
          </div>
          <div class="alerta alerta-info">
            <span class="alerta-icon">ℹ️</span>
            <span class="alerta-text">Ausencias/Permisos pendientes: 0</span>
          </div>
          <div class="alerta alerta-gray">
            <span class="alerta-icon">🚫</span>
            <span class="alerta-text">Acceso de empleado inactivo: 1</span>
          </div>
        </div>
      </div>

      <!-- Gráficas -->
      <div class="graficas-grid">
        <!-- Tasa de Puntualidad -->
        <div class="card">
          <h2>Tasa de puntualidad mensual</h2>
          <div class="puntualidad-container">
            <div class="puntualidad-numero">95%</div>
            <div class="puntualidad-label">Puntualidad</div>
          </div>
        </div>

        <!-- Estadísticas Semanales -->
        <div class="card">
          <div class="subtitle">Estadísticas semanales</div>
          <h2>Retardos y ausencias</h2>
          
          <div class="leyenda-lineal">
            <div class="leyenda-item">
              <div class="linea-leyenda retardos"></div>
              <span>Retardos</span>
            </div>
            <div class="leyenda-item">
              <div class="linea-leyenda ausencias"></div>
              <span>Ausencias</span>
            </div>
          </div>

          <div class="barras-lineales-container">
            <div class="linea-dia" v-for="dia in semana" :key="dia.nombre">
              <span class="dia-label">{{ dia.nombre }}</span>
              <div class="barras-horizontales">
                <div class="barra-lineal retardos" :style="{ width: dia.retardos * 10 + '%' }"></div>
                <div class="barra-lineal ausencias" :style="{ width: dia.ausencias * 10 + '%' }"></div>
              </div>
            </div>
          </div>

          <div class="escala-numerica">
            <span v-for="n in 10" :key="n">{{ n }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import IncidenciasFormulario from '../Incidencias/Incidencias-Formulario.vue'

const showIncidencia = ref(false)

// Datos de ejemplo para la semana - ahora todos los días tienen datos
const semana = ref([
  { nombre: 'Lunes', retardos: 2, ausencias: 1 },
  { nombre: 'Martes', retardos: 1, ausencias: 2 },
  { nombre: 'Miércoles', retardos: 3, ausencias: 1 },
  { nombre: 'Jueves', retardos: 1, ausencias: 3 },
  { nombre: 'Viernes', retardos: 2, ausencias: 2 }
])
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
  margin: 0 0rem 2rem 1rem;
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
  margin-top: 1.5rem;
}

.puntualidad-label {
  color: #6b7280;
  margin-top: 0.5rem;
  font-size: 1rem;
}

/* Estadísticas Semanales - Estilo Lineal */
.subtitle {
  font-size: 0.875rem;
  color: #9ca3af;
  margin-bottom: 0.5rem;
}

.leyenda-lineal {
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

.linea-leyenda {
  width: 20px;
  height: 6px; /* Más grueso */
  border-radius: 3px;
}

.linea-leyenda.retardos {
  background-color: #6366f1;
}

.linea-leyenda.ausencias {
  background-color: #312e81;
}

.barras-lineales-container {
  margin-bottom: 1rem;
}

.linea-dia {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  height: 30px; /* Más alto para barras más gruesas */
}

.dia-label {
  width: 80px;
  font-size: 0.875rem;
  color: #374151;
}

.barras-horizontales {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px; /* Más espacio entre barras */
  position: relative;
  height: 100%;
  justify-content: center;
}

.barra-lineal {
  height: 7px; /* Más grueso - de 3px a 6px */
  border-radius: 3px;
  transition: width 0.3s ease;
}

.barra-lineal.retardos {
  background-color: #6366f1;
}

.barra-lineal.ausencias {
  background-color: #312e81;
}

.escala-numerica {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #9ca3af;
  padding: 0 80px;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .estado-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .graficas-grid {
    grid-template-columns: 1fr;
  }
  
  .escala-numerica {
    padding: 0 20px;
  }
  
  .dia-label {
    width: 60px;
  }
}
</style>