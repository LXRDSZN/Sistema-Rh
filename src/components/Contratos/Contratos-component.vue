<template>
  <div class="contratos-content">
    <!-- Encabezado con título -->
    <div class="header">
      <h1>Contratos - Inicio</h1>
    </div>

    <!-- Barra de navegación -->
    <nav class="tabs-navigation">
      <button v-for="tab in tabs" :key="tab.id" :class="['tab-button', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id">
        {{ tab.label }}
      </button>
    </nav>

    <!-- Contenido principal -->
    <main class="main-content">
      <!-- Vista de Inicio -->
      <EnlaceInicio v-if="activeTab === 'inicio'" :contratos="contratos" :stats="stats"
        @crear-contrato="handleCrearContrato" @revisar-contrato="handleRevisarContrato" />

      <!-- Vista de Activos -->
      <EnlaceActivos v-else-if="activeTab === 'activos'" :contratos="contratosActivos"
        @revisar-contrato="handleRevisarContrato" />

      <!-- Vista de Próximos a Vencer -->
      <EnlaceAVencer v-else-if="activeTab === 'avencer'" :contratos="contratosAVencer"
        @revisar-contrato="handleRevisarContrato" />

      <!-- Vista de Vencidos -->
      <EnlaceVencidos v-else-if="activeTab === 'vencidos'" :contratos="contratosVencidos"
        @revisar-contrato="handleRevisarContrato" />

      <!-- Vista de En Proceso -->
      <EnlaceEnProceso v-else-if="activeTab === 'proceso'" :contratos="contratosEnProceso"
        @revisar-contrato="handleRevisarContrato" />

      <!-- En el template, reemplaza la vista de estadísticas: -->
      <EnlaceEstadisticas v-else-if="activeTab === 'estadisticas'" :stats="{ activos: 456, vacantes: 18 }"
        :departamentos="['RRHH', 'Finanzas', 'Operaciones', 'TI', 'Marketing']" />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import EnlaceInicio from './EnlaceInicio.vue';
import EnlaceActivos from './EnlacesNavegacion/EnlaceActivos.vue';
import EnlaceAVencer from './EnlacesNavegacion/EnlaceAVencer.vue';
import EnlaceVencidos from './EnlacesNavegacion/EnlaceVencidos.vue';
import EnlaceEnProceso from './EnlacesNavegacion/EnlaceEnProceso.vue';
import EnlaceEstadisticas from './EnlacesNavegacion/EnlaceEstadisticas.vue';

const activeTab = ref('inicio');

const tabs = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'activos', label: 'Activos' },
  { id: 'avencer', label: 'Próximos a Vencer' },
  { id: 'vencidos', label: 'Vencidos' },
  { id: 'proceso', label: 'En Proceso' },
  { id: 'estadisticas', label: 'Estadisticas' }
];

const stats = ref({
  activos: 47,
  proximosVencer: 9,
  vencidos: 2,
  enProceso: 13
});

const contratos = ref([
  {
    id: 1,
    nombre: 'Jaecon Dan',
    fase: 'Aplicado',
    cuenta: 'CUENTA EJECUTIVA',
    puesto: 'GERENTE',
    area: 'ASISTENCIAS',
    avatar: 'https://i.pravatar.cc/150?img=1',
    estado: 'activo',
    fechaInicio: '2024-01-15',
    fechaVencimiento: '2025-12-31'
  },
  {
    id: 2,
    nombre: 'Maria Lopez',
    fase: 'En revisión',
    cuenta: 'CUENTA EJECUTIVA',
    puesto: 'SUPERVISOR',
    area: 'RECURSOS HUMANOS',
    avatar: 'https://i.pravatar.cc/150?img=2',
    estado: 'avencer',
    fechaInicio: '2024-03-10',
    fechaVencimiento: '2025-11-15'
  },
  {
    id: 3,
    nombre: 'Carlos Rodriguez',
    fase: 'Finalizado',
    cuenta: 'CUENTA CORPORATIVA',
    puesto: 'ANALISTA',
    area: 'FINANZAS',
    avatar: 'https://i.pravatar.cc/150?img=3',
    estado: 'vencido',
    fechaInicio: '2023-06-20',
    fechaVencimiento: '2024-06-20'
  },
  {
    id: 4,
    nombre: 'Ana Martinez',
    fase: 'En trámite',
    cuenta: 'CUENTA PREMIUM',
    puesto: 'COORDINADOR',
    area: 'OPERACIONES',
    avatar: 'https://i.pravatar.cc/150?img=4',
    estado: 'proceso',
    fechaInicio: '2024-09-01',
    fechaVencimiento: '2026-09-01'
  }
]);

// Computed properties para filtrar contratos por estado
const contratosActivos = computed(() =>
  contratos.value.filter(c => c.estado === 'activo')
);

const contratosAVencer = computed(() =>
  contratos.value.filter(c => c.estado === 'avencer')
);

const contratosVencidos = computed(() =>
  contratos.value.filter(c => c.estado === 'vencido')
);

const contratosEnProceso = computed(() =>
  contratos.value.filter(c => c.estado === 'proceso')
);

// Métodos para manejar eventos
const handleCrearContrato = () => {
  console.log('Crear nuevo contrato');
};

const handleRevisarContrato = (contrato) => {
  console.log('Revisar contrato:', contrato);
};


</script>

<style scoped>
.contratos-content {
  flex: 1;
  margin-left: 60px;
  min-height: 100vh;
  width: calc(100vw - 60px);
  max-width: 100%;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow-x: hidden;
}

/* Header */
.header {
  padding: 1.5rem 2rem;
  background-color: #f5f5f5;
  width: 100%;
}

.header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

/* Tabs Navigation */
.tabs-navigation {
  display: flex;
  gap: 0;
  background-color: #fff;
  border-bottom: 2px solid #e0e0e0;
  padding: 0 2rem;
  width: 100%;
}

.tab-button {
  padding: 1rem 2rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 0.95rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  bottom: -2px;
}

.tab-button:hover {
  color: #5b4cdb;
  background-color: #f8f8ff;
}

.tab-button.active {
  color: #5b4cdb;
  border-bottom-color: #5b4cdb;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 2rem;
  background-color: #f5f5f5;
  width: 100%;
  box-sizing: border-box;
}

/* Otras vistas */
.other-view {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
}

.other-view h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .contratos-content {
    margin-left: 0;
  }

  .tabs-navigation {
    overflow-x: auto;
    padding: 0 1rem;
  }

  .tab-button {
    padding: 0.875rem 1.5rem;
    white-space: nowrap;
  }
}
</style>
