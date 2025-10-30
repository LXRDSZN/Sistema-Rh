<template>
  <div class="actividad-container">
    <h3 class="actividad-title">REGISTRO DE ACTIVIDAD</h3>
    
    <div class="timeline">
      <!-- Progreso 1 -->
      <div class="timeline-item">
        <div class="timeline-icon completed">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div class="timeline-content">
          <div class="timeline-text">Progreso 1</div>
        </div>
        <div class="timeline-line"></div>
      </div>

      <!-- Progreso 2 -->
      <div class="timeline-item">
        <div class="timeline-icon completed">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div class="timeline-content">
          <div class="timeline-text">Progreso 2</div>
        </div>
        <div class="timeline-line"></div>
      </div>

      <!-- Progreso 3 -->
      <div class="timeline-item">
        <div class="timeline-icon completed">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div class="timeline-content">
          <div class="timeline-text">Progreso 3</div>
        </div>
        <div class="timeline-line"></div>
      </div>

      <!-- Progreso 4 -->
      <div class="timeline-item">
        <div class="timeline-icon completed">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div class="timeline-content">
          <div class="timeline-text">Progreso 4</div>
        </div>
        <div class="timeline-line"></div>
      </div>

      <!-- Filtro (opcional) -->
      <div class="timeline-item last">
        <div class="timeline-icon add">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
        <div class="timeline-content">
          <div class="timeline-text">Filtro (opcional)</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.actividad-container {
  padding: 8px 0;
}

.actividad-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #06B6D4;
  margin: 0 0 32px 0;
  letter-spacing: 0.05em;
}

.timeline {
  position: relative;
  padding-left: 24px;
}

.timeline-item {
  position: relative;
  padding-bottom: 48px;
}

.timeline-item.last {
  padding-bottom: 0;
}

.timeline-icon {
  position: absolute;
  left: -24px;
  top: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.timeline-icon.completed {
  background: #10B981;
}

.timeline-icon.add {
  background: #06B6D4;
}

.timeline-line {
  position: absolute;
  left: -1px;
  top: 48px;
  width: 4px;
  height: calc(100% - 48px);
  background: #10B981;
}

.timeline-item.last .timeline-line {
  display: none;
}

.timeline-content {
  padding-left: 32px;
  padding-top: 12px;
}

.timeline-text {
  font-size: 0.9375rem;
  color: #374151;
  font-weight: 500;
}
</style>
