<template>
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
        Total: <strong>{{ totalEmpleados }}</strong>
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
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  totalEmpleados: {
    type: Number,
    default: 0
  },
  estadisticasEdadGenero: {
    type: Array,
    default: () => []
  }
});

// Computed
const rangosEdad = computed(() => {
  const rangos = {
    '18-24': { hombres: 0, mujeres: 0 },
    '25-34': { hombres: 0, mujeres: 0 },
    '35-44': { hombres: 0, mujeres: 0 },
    '45-64': { hombres: 0, mujeres: 0 },
    '65+': { hombres: 0, mujeres: 0 }
  };

  props.estadisticasEdadGenero.forEach(stat => {
    const rango = stat._id.rangoEdad;
    const genero = stat._id.genero;
    if (rangos[rango]) {
      if (genero === 'Masculino' || genero === 'Hombre' || genero === 'M') {
        rangos[rango].hombres = stat.count;
      } else if (genero === 'Femenino' || genero === 'Mujer' || genero === 'F') {
        rangos[rango].mujeres = stat.count;
      }
    }
  });

  const total = props.totalEmpleados;
  
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
</script>

<style scoped>
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

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4B5563;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.demographics-total {
  font-size: 0.875rem;
  color: #6B7280;
}

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

@media (max-width: 768px) {
  .bar-row {
    grid-template-columns: 50px 1fr 50px;
    gap: 0.5rem;
  }
}
</style>
