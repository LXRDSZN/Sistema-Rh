<template>
  <div class="stat-card">
    <div class="stat-icon" :class="iconClass">
      <span class="material-symbols-rounded">{{ icon }}</span>
    </div>
    <div class="stat-info">
      <div class="stat-label">{{ label }}</div>
      <div class="stat-value">{{ formattedValue }}</div>
      <div v-if="trend" class="stat-trend" :class="trend">
        <span class="material-symbols-rounded">trending_up</span>
        {{ percentage }}% este mes
      </div>
      <div v-if="emoji" class="stat-emoji">{{ emoji }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  iconClass: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    default: null
  },
  trend: {
    type: String,
    default: null
  },
  emoji: {
    type: String,
    default: null
  },
  formatNumber: {
    type: Boolean,
    default: false
  }
});

const formattedValue = computed(() => {
  return props.formatNumber ? props.value.toLocaleString() : props.value;
});
</script>

<style scoped>
.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon span {
  font-size: 1.5rem;
}

.stat-icon.nuevos {
  background: #D1FAE5;
  color: #059669;
}

.stat-icon.empleados {
  background: #DBEAFE;
  color: #2563EB;
}

.stat-icon.activos {
  background: #E0E7FF;
  color: #6366F1;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6B7280;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 0.25rem;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.stat-trend.up {
  color: #10B981;
}

.stat-trend.neutral {
  color: #6B7280;
}

.stat-trend span {
  font-size: 1rem;
}

.stat-emoji {
  font-size: 1.25rem;
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
  }

  .stat-icon span {
    font-size: 1.5rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}
</style>
