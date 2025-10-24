<template>
  <div class="asistencias-content">
    <div class="content-inner">
      <h1>Vista Para Asistencias</h1>
      
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
            <div class="barra-row">
              <span class="barra-label">Lunes</span>
              <div class="barra-bg">
                <div class="barra-fill retardos" style="width: 15%;"></div>
                <div class="barra-fill ausencias" style="left: 15%; width: 10%;"></div>
              </div>
            </div>

            <div class="barra-row">
              <span class="barra-label">Martes</span>
              <div class="barra-bg">
                <div class="barra-fill retardos" style="width: 8%;"></div>
              </div>
            </div>

            <div class="barra-row">
              <span class="barra-label">Miércoles</span>
              <div class="barra-bg">
                <div class="barra-fill retardos" style="width: 8%;"></div>
              </div>
            </div>

            <div class="barra-row">
              <span class="barra-label">Jueves</span>
              <div class="barra-bg"></div>
            </div>

            <div class="barra-row">
              <span class="barra-label">Viernes</span>
              <div class="barra-bg">
                <div class="barra-fill retardos" style="width: 15%;"></div>
                <div class="barra-fill ausencias" style="left: 15%; width: 10%;"></div>
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
  </div>
</template>

<script>
export default {
  name: 'Asistencias',
  mounted() {
    console.log('Vista de Asistencias cargada correctamente');
  }
};
</script>

<style scoped>
.asistencias-content {
  flex: 1;
  padding: 2rem;
  margin-left: 60px;
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  padding-top: 2rem;
  background-color: #f9fafb;
}

.content-inner {
  width: 100%;
  max-width: 1400px;
}

h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

h2 {
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

@media (min-width: 1024px) {
  .asistencias-content {
    padding: 3rem;
  }
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