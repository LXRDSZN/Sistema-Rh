<template>
  <div class="asistencias-inicio">
    <div class="content-inner" v-if="!loading">
      <div class="header-section">
        <h1>Asistencias</h1>
        <button class="btn-incidencia" @click="irAIncidencias">+ Registrar Incidencia</button>
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
          <h2 style="margin-bottom: 0.5rem;">Retardos y ausencias</h2>
        
          <!-- Leyenda con indicadores como en la imagen -->
          <div class="leyenda-container">
            <div class="leyenda-item">
              <span class="leyenda-indicator">●</span>
              <span class="leyenda-text">Retardos</span>
            </div>
            <div class="leyenda-item">
              <span class="leyenda-indicator">●</span>
              <span class="leyenda-text">Ausencias</span>
            </div>
          </div>

          <div class="barras-scroll-container">
            <div class="barras-container">
              <div class="barra-dia" v-for="(dia, index) in estadisticasSemanales" :key="index">
                <div class="dia-nombre">{{ dia.dia }}</div>
                <div class="barras-grupo">
                  <div class="barra-fila">
                    <div class="barra-contenedor">
                      <div class="barra-progreso retardos" :style="{ width: calcularAncho(dia.retardos) }"></div>
                    </div>
                    <div class="barra-valor">{{ dia.retardos }}</div>
                  </div>
                  <div class="barra-fila">
                    <div class="barra-contenedor">
                      <div class="barra-progreso ausencias" :style="{ width: calcularAncho(dia.ausencias) }"></div>
                    </div>
                    <div class="barra-valor">{{ dia.ausencias }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="escala-grafica">
            <div class="escala-numeros">
              <span v-for="n in [0,1,2,3,4,5,6,7,8,9,10]" :key="n" class="escala-numero">{{ n }}</span>
            </div>
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
import { useRouter } from 'vue-router'
import { useAsistencias } from '@/composables/useAsistencias'

// Router
const router = useRouter()

// Composable
const {
  dashboardData,
  loading,
  cargarDashboard
} = useAsistencias()

// Función para ir a Justificantes dentro de Asistencias
const irAIncidencias = () => {
  router.push({ name: 'Asistencias-Justificantes' })
}

// Cargar datos al montar
onMounted(async () => {
  await cargarDashboard()
})

// Estadísticas semanales procesadas dinámicamente - SIEMPRE 7 DÍAS
const estadisticasSemanales = computed(() => {
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  
  // Si no hay datos, generar estructura completa de 7 días
  if (!dashboardData.value?.estadisticasSemanales || dashboardData.value.estadisticasSemanales.length === 0) {
    return diasSemana.map((dia, index) => ({
      dia: dia,
      retardos: Math.floor(Math.random() * 6), // 0-5 para testing
      ausencias: Math.floor(Math.random() * 6), // 0-5 para testing
      fecha: null
    }))
  }
  
  // Si hay datos de la BD, mapearlos y completar los días faltantes
  const datosBD = dashboardData.value.estadisticasSemanales
  
  // Crear mapa de datos por día para búsqueda rápida
  const datosPorDia = {}
  datosBD.forEach(d => {
    const diaIngles = d.dia?.trim() || ''
    const diasTraduccion = {
      'Sunday': 'Domingo',
      'Monday': 'Lunes', 
      'Tuesday': 'Martes',
      'Wednesday': 'Miércoles',
      'Thursday': 'Jueves',
      'Friday': 'Viernes',
      'Saturday': 'Sábado'
    }
    
    const diaEspanol = diasTraduccion[diaIngles] || diaIngles
    datosPorDia[diaEspanol] = {
      retardos: parseInt(d.retardos) || 0,
      ausencias: parseInt(d.ausencias) || 0,
      fecha: d.fecha || null
    }
  })
  
  // Retornar siempre los 7 días completos
  return diasSemana.map(dia => {
    const datosDia = datosPorDia[dia] || { retardos: 0, ausencias: 0, fecha: null }
    
    return {
      dia: dia,
      retardos: datosDia.retardos,
      ausencias: datosDia.ausencias,
      fecha: datosDia.fecha
    }
  })
})

// Calcular ancho de barra (cada número = 10% del ancho total)
const calcularAncho = (valor) => {
  const porcentaje = Math.min(valor, 10) * 10
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
  margin-bottom: 0.2rem;
}

/* Leyenda como en la imagen */
.leyenda-container {
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

.leyenda-indicator {
  font-size: 1rem;
  color: #6366f1;
  margin-top: 0rem !important;
}

.leyenda-item:last-child .leyenda-indicator {
  color: #312e81;
}

.leyenda-text {
  color: #374151;

}

/* Contenedor con scroll */
.barras-scroll-container {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 1rem;
  border-radius: 4px;
  margin-top: 0.1rem;
}

.barras-container {
  padding-right: 8px;
}

.barra-dia {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
  padding: 0.6rem 0;
  border-bottom: 0.5px solid #f3f4f6;
}

.barra-dia:last-child {
  border-bottom: none;
}

.dia-nombre {
  width: 80px;
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
  padding-top: 0.25rem;
  flex-shrink: 0;
}

.barras-grupo {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.barra-fila {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 16px;
}

.barra-contenedor {
  flex: 1;
  height: 6px;
  background-color: #e5e7eb;
  border-radius: 3px;
  position: relative;
  overflow: hidden;
  min-width: 0;
}

.barra-progreso {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.barra-progreso.retardos {
  background-color: #6366f1;
}

.barra-progreso.ausencias {
  background-color: #312e81;
}

.barra-valor {
  width: 20px;
  font-size: 0.75rem;
  color: #374151;
  text-align: center;
  font-weight: 500;
  flex-shrink: 0;
}

/* Escala de la gráfica */
.escala-grafica {
  margin-top: 1rem;
  position: relative;
}

.escala-numeros {
  display: flex;
  justify-content: space-between;
  margin-left: 80px;
  margin-right: 20px;
  margin-bottom: 0.25rem;
}

.escala-numero {
  font-size: 0.7rem;
  color: #9ca3af;
  width: 9.09%;
  text-align: center;
}

.escala-linea {
  height: 1px;
  background-color: #e5e7eb;
  margin-left: 80px;
  margin-right: 20px;
  position: relative;
}

.escala-linea::before {
  content: '';
  position: absolute;
  top: -2px;
  left: 0;
  right: 0;
  height: 5px;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 8.9%,
    #d1d5db 8.9%,
    #d1d5db 9.09%
  );
}

/* Scroll personalizado */
.barras-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.barras-scroll-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.barras-scroll-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.barras-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
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
  
  .barra-dia {
    gap: 0.5rem;
  }
  
  .dia-nombre {
    width: 60px;
    font-size: 0.8rem;
  }
  
  .escala-numeros {
    margin-left: 60px;
    margin-right: 15px;
  }
  
  .escala-linea {
    margin-left: 60px;
    margin-right: 15px;
  }
  
  .barras-scroll-container {
    max-height: 200px;
  }
}
</style>