<template>
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
        <div class="donut-total">{{ totalEmpleados }}</div>
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
            <span class="area-count">{{ area.total }}</span>
            <span class="area-percentage">({{ getPercentage(area.total) }}%)</span>
          </div>
        </div>
        <div class="area-bar" v-if="totalEmpleados > 0">
          <div 
            class="area-bar-fill" 
            :style="{ 
              width: Math.max(getPercentage(area.total), 2) + '%',
              backgroundColor: areaColors[index]
            }"
          ></div>
        </div>
        <div class="area-bar" v-else>
          <div class="area-bar-empty"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  empleadosPorArea: {
    type: Array,
    default: () => []
  },
  areaColors: {
    type: Array,
    default: () => ['#22C55E', '#3B82F6', '#A855F7', '#F59E0B', '#14B8A6']
  }
});

// Computed
const totalEmpleados = computed(() => {
  return props.empleadosPorArea.reduce((sum, area) => sum + area.total, 0);
});

const circumference = 2 * Math.PI * 80;

const donutSegments = computed(() => {
  let currentOffset = 0;
  return props.empleadosPorArea.map((area, index) => {
    const percentage = totalEmpleados.value > 0 ? (area.total / totalEmpleados.value) : 0;
    const length = circumference * percentage;
    const segment = {
      color: props.areaColors[index % props.areaColors.length],
      length,
      offset: -currentOffset
    };
    currentOffset += length;
    return segment;
  });
});

const getPercentage = (count) => {
  if (totalEmpleados.value === 0) return 0;
  return ((count / totalEmpleados.value) * 100).toFixed(1);
};
</script>

<style scoped>
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

.area-breakdown {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.area-breakdown::-webkit-scrollbar {
  width: 6px;
}

.area-breakdown::-webkit-scrollbar-track {
  background: #F3F4F6;
  border-radius: 3px;
}

.area-breakdown::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 3px;
}

.area-breakdown::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
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
  min-width: 2%;
}

.area-bar-empty {
  height: 100%;
  width: 100%;
  background: #E5E7EB;
  border-radius: 4px;
}
</style>
