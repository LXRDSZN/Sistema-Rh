<template>
  <div class="contratos-content">
    <!-- Vista de Inicio -->
    <div v-if="activeTab === 'inicio'" class="inicio-view">
      <!-- Encabezado -->
      <div class="header">
        <h1>Contratos - Inicio</h1>
        <div class="header-actions">
          <div class="search-box">
            <input type="text" placeholder="Buscar" v-model="searchQuery">
            <span class="material-symbols-rounded">search</span>
          </div>
          <button class="btn-crear-contrato" @click="handleCrearContrato">
            CREAR CONTRATO NUEVO
          </button>
        </div>
      </div>

      <!-- Tarjetas de estadísticas clickeables -->
      <div class="stats-grid">
        <div class="stat-card activos" @click="activeTab = 'activos'">
          <div class="stat-label">TOTAL DE<br>CONTRATOS ACTIVOS</div>
          <div class="stat-value">{{ stats.activos }}</div>
        </div>
        <div class="stat-card proximos" @click="activeTab = 'avencer'">
          <div class="stat-label">CONTRATOS<br>PRÓXIMOS A VENCER</div>
          <div class="stat-value">{{ stats.proximosVencer }}</div>
        </div>
        <div class="stat-card vencidos" @click="activeTab = 'vencidos'">
          <div class="stat-label">CONTRATOS<br>VENCIDOS</div>
          <div class="stat-value">{{ stats.vencidos }}</div>
        </div>
        <div class="stat-card proceso" @click="activeTab = 'proceso'">
          <div class="stat-label">CONTRATOS<br>EN PROCESO</div>
          <div class="stat-value">{{ stats.enProceso }}</div>
        </div>
      </div>

      <!-- Tabla de contratos -->
      <div class="contratos-table">
        <div class="table-header">
          <div class="column">Datos</div>
          <div class="column">Puesto</div>
          <div class="column">Área</div>
        </div>
        <div class="table-body">
          <div v-for="contrato in filteredContratos" :key="contrato.id" class="table-row">
            <div class="column datos-column">
              <img :src="contrato.avatar" :alt="contrato.nombre" class="avatar">
              <div class="datos-info">
                <div class="nombre">{{ contrato.nombre }}</div>
                <div class="fase">Fase: {{ contrato.fase }}</div>
                <div class="cuenta">{{ contrato.cuenta }}</div>
              </div>
            </div>
            <div class="column">{{ contrato.puesto }}</div>
            <div class="column">{{ contrato.area }}</div>
            <div class="column actions-column">
              <button class="btn-revisar" @click="handleRevisarContrato(contrato)">REVISAR</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Otras vistas -->
    <div v-else class="other-view">
      <!-- Vista de Activos -->
      <EnlaceActivos v-if="activeTab === 'activos'" :contratos="contratosActivos"
        @revisar-contrato="handleRevisarContrato" 
        @volver-inicio="activeTab = 'inicio'" />

      <!-- Vista de Próximos a Vencer -->
      <EnlaceAVencer v-else-if="activeTab === 'avencer'" :contratos="contratosAVencer"
        @revisar-contrato="handleRevisarContrato" 
        @volver-inicio="activeTab = 'inicio'" />

      <!-- Vista de Vencidos -->
      <EnlaceVencidos v-else-if="activeTab === 'vencidos'" :contratos="contratosVencidos"
        @revisar-contrato="handleRevisarContrato" 
        @volver-inicio="activeTab = 'inicio'" />

      <!-- Vista de En Proceso -->
      <EnlaceEnProceso v-else-if="activeTab === 'proceso'" :contratos="contratosEnProceso"
        @revisar-contrato="handleRevisarContrato" 
        @volver-inicio="activeTab = 'inicio'" />

      <!-- Vista de estadísticas -->
      <EnlaceEstadisticas v-else-if="activeTab === 'estadisticas'" :stats="{ activos: 456, vacantes: 18 }"
        :departamentos="['RRHH', 'Finanzas', 'Operaciones', 'TI', 'Marketing']" />

      <!-- Vista de Crear Contrato -->
      <EnlaceCrearContrato v-else-if="activeTab === 'crear'" 
        @volver-inicio="activeTab = 'inicio'" />

      <!-- Vista de Otra Pantalla -->
      <OtraPantalla v-else-if="activeTab === 'otra'" 
        @volver-inicio="activeTab = 'inicio'" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSidebar } from '@/composables/useSidebar';
import EnlaceActivos from './EnlacesNavegacion/EnlaceActivos.vue';
import EnlaceAVencer from './EnlacesNavegacion/EnlaceAVencer.vue';
import EnlaceVencidos from './EnlacesNavegacion/EnlaceVencidos.vue';
import EnlaceEnProceso from './EnlacesNavegacion/EnlaceEnProceso.vue';
import EnlaceEstadisticas from './EnlacesNavegacion/EnlaceEstadisticas.vue';
import EnlaceCrearContrato from './EnlacesNavegacion/EnlaceCrearContrato.vue';
import OtraPantalla from './EnlacesNavegacion/OtraPantalla.vue';

const route = useRoute();
const router = useRouter();
const activeTab = ref('inicio');
const searchQuery = ref('');
const { contentMarginLeft, contentWidth } = useSidebar();

// Detectar la ruta y cambiar el activeTab
const updateTabFromRoute = () => {
  if (route.path === '/Contratos/estadisticas') {
    activeTab.value = 'estadisticas';
  } else if (route.path === '/Contratos/crear') {
    activeTab.value = 'crear';
  } else if (route.path === '/Contratos/otra') {
    activeTab.value = 'otra';
  } else {
    activeTab.value = 'inicio';
  }
};

// Watch para cambios en la ruta
watch(() => route.path, () => {
  updateTabFromRoute();
}, { immediate: true });

// Al montar el componente
onMounted(() => {
  updateTabFromRoute();
});

// Función para volver al inicio
const volverInicio = () => {
  router.push('/Contratos');
};

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

// Filtrar contratos por búsqueda
const filteredContratos = computed(() => {
  if (!searchQuery.value) return contratos.value;
  const query = searchQuery.value.toLowerCase();
  return contratos.value.filter(c =>
    c.nombre.toLowerCase().includes(query) ||
    c.puesto.toLowerCase().includes(query) ||
    c.area.toLowerCase().includes(query)
  );
});

// Métodos para manejar eventos
const handleCrearContrato = () => {
  activeTab.value = 'crear';
};

const handleRevisarContrato = (contrato) => {
  console.log('Revisar contrato:', contrato);
};


</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:wght@400;700&display=swap');

.contratos-content {
  flex: 1;
  min-height: 100vh;
  background-color: #e0e0e0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow-x: hidden;
  padding: 2rem;
  transition: all 0.3s ease;
  margin-left: v-bind(contentMarginLeft);
  width: v-bind(contentWidth);
}

.inicio-view {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Header */
.header {
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1.5rem 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 300px;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: none;
  border-radius: 8px;
  background-color: #e6e6f0;
  font-size: 0.95rem;
  outline: none;
}

.search-box .material-symbols-rounded {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 20px;
}

.btn-crear-contrato {
  padding: 0.75rem 2rem;
  background-color: #6c5ce7;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-crear-contrato:hover {
  background-color: #5f4fd1;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.activos {
  background-color: #d4edda;
}

.stat-card.proximos {
  background-color: #fff3cd;
}

.stat-card.vencidos {
  background-color: #f8d7da;
}

.stat-card.proceso {
  background-color: #d1ecf1;
}

.stat-label {
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.stat-card.activos .stat-label {
  color: #28a745;
}

.stat-card.proximos .stat-label {
  color: #ff9800;
}

.stat-card.vencidos .stat-label {
  color: #dc3545;
}

.stat-card.proceso .stat-label {
  color: #17a2b8;
}

.stat-value {
  font-size: 3rem;
  font-weight: 300;
  text-align: center;
}

.stat-card.activos .stat-value {
  color: #28a745;
}

.stat-card.proximos .stat-value {
  color: #ff9800;
}

.stat-card.vencidos .stat-value {
  color: #dc3545;
}

.stat-card.proceso .stat-value {
  color: #17a2b8;
}

/* Tabla de contratos */
.contratos-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.table-row:last-child {
  border-bottom: none;
}

.datos-column {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.datos-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nombre {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.fase {
  font-size: 0.85rem;
  color: #666;
}

.cuenta {
  font-size: 0.8rem;
  color: #00bcd4;
  font-weight: 500;
}

.btn-revisar {
  padding: 0.5rem 1.5rem;
  background-color: transparent;
  color: #00bcd4;
  border: 2px solid #00bcd4;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-revisar:hover {
  background-color: #00bcd4;
  color: white;
}

/* Otras vistas */
.other-view {
  padding: 2rem;
}

.btn-volver {
  padding: 0.75rem 1.5rem;
  background-color: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: background-color 0.2s;
}

.btn-volver:hover {
  background-color: #e0e0e0;
}

/* Responsive */
@media (max-width: 768px) {
  .contratos-content {
    margin-left: 60px !important;
    width: calc(100vw - 60px) !important;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: none;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .datos-column {
    grid-column: 1 / -1;
  }
}
</style>
