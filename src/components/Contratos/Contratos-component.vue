<template>
  <div class="contratos-content">
    <!-- Vista de Inicio -->
    <EnlaceInicio v-if="activeTab === 'inicio'" :contratos="contratos" :stats="stats"
      @crear-contrato="handleCrearContrato" @revisar-contrato="handleRevisarContrato" @cambiar-vista="cambiarVista" />

    <!-- Otras vistas -->
    <div v-else class="other-view">
      <!-- Vista de Activos -->
      <EnlaceActivos v-if="activeTab === 'activos'" :contratos="contratosActivos"
        @revisar-contrato="handleRevisarContrato" @volver-inicio="activeTab = 'inicio'" />

      <!-- Vista de Próximos a Vencer -->
      <EnlaceAVencer v-else-if="activeTab === 'avencer'" :contratos="contratosAVencer"
        @revisar-contrato="handleRevisarContrato" @volver-inicio="activeTab = 'inicio'" />

      <!-- Vista de Vencidos -->
      <EnlaceVencidos v-else-if="activeTab === 'vencidos'" :contratos="contratosVencidos"
        @revisar-contrato="handleRevisarContrato" @volver-inicio="activeTab = 'inicio'" />

      <!-- Vista de En Proceso -->
      <EnlaceEnProceso v-else-if="activeTab === 'proceso'" :contratos="contratosEnProceso"
        @revisar-contrato="handleRevisarContrato" @volver-inicio="activeTab = 'inicio'" />

      <!-- Vista de estadísticas -->
      <EnlaceEstadisticas v-else-if="activeTab === 'estadisticas'" :stats="{ activos: 456, vacantes: 18 }"
        :departamentos="['RRHH', 'Finanzas', 'Operaciones', 'TI', 'Marketing']" />

      <!-- Vista de Crear Contrato -->
      <EnlaceCrearContrato v-else-if="activeTab === 'crear'" @volver-inicio="activeTab = 'inicio'" />

      <!-- Vista de Otra Pantalla -->
      <OtraPantalla v-else-if="activeTab === 'otra'" @volver-inicio="activeTab = 'inicio'" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSidebar } from '@/composables/useSidebar';
import EnlaceInicio from './EnlaceInicio.vue';
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
    nombre: 'Braulio Torres Arispe',
    tipo: 'empleado',
    estadoTexto: 'ACTIVO',
    estadoClase: 'activo',
    puesto: 'GERENTE',
    area: 'VACACIONES',
    avatar: 'https://i.pravatar.cc/150?img=1',
    estado: 'activo'
  },
  {
    id: 2,
    nombre: 'Alejandro Solano',
    tipo: 'empleado',
    estadoTexto: 'BAJA',
    estadoClase: 'baja',
    puesto: 'GERENTE',
    area: 'ASISTENCIAS',
    avatar: 'https://i.pravatar.cc/150?img=2',
    estado: 'activo'
  },
  {
    id: 3,
    nombre: 'Juan Carlos Bodoque',
    tipo: 'empleado',
    estadoTexto: 'ACTIVO',
    estadoClase: 'activo',
    puesto: 'GERENTE',
    area: 'CONTRATOS',
    avatar: 'https://i.pravatar.cc/150?img=3',
    estado: 'activo'
  },
  {
    id: 4,
    nombre: 'Braulio Torres Arispe',
    tipo: 'aspirante',
    estadoTexto: 'Revisión',
    estadoClase: 'revision',
    puesto: 'GERENTE',
    area: 'VACACIONES',
    avatar: 'https://i.pravatar.cc/150?img=4',
    estado: 'proceso'
  },
  {
    id: 5,
    nombre: 'Alejandro Solano',
    tipo: 'aspirante',
    estadoTexto: 'Revisión',
    estadoClase: 'revision',
    puesto: 'GERENTE',
    area: 'ASISTENCIAS',
    avatar: 'https://i.pravatar.cc/150?img=5',
    estado: 'proceso'
  },
  {
    id: 6,
    nombre: 'Juan Carlos Bodoque',
    tipo: 'aspirante',
    estadoTexto: 'Evaluación',
    estadoClase: 'evaluacion',
    puesto: 'GERENTE',
    area: 'CONTRATOS',
    avatar: 'https://i.pravatar.cc/150?img=6',
    estado: 'proceso'
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
  activeTab.value = 'crear';
};


// Método para cambiar de vista desde las tarjetas de estadísticas
const cambiarVista = (vista) => {
  activeTab.value = vista;
};

// Método para manejar revisión de contrato
const handleRevisarContrato = (contrato) => {
  console.log('Revisar contrato:', contrato);
  // Redirigir a "Otra Pantalla"
  activeTab.value = 'otra';
};
</script>

<style scoped>
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

.other-view {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Responsive */
@media (max-width: 768px) {
  .contratos-content {
    margin-left: 60px !important;
    width: calc(100vw - 60px) !important;
  }
}
</style>
