<template>
  <div class="asistencias-content">
    <!-- Solo permitir Pase de Lista para empleados -->
    <template v-if="userRole === 'EMPLEADO'">
      <AsistenciasPaseLista />
    </template>
    <template v-else>
      <!-- Vista de Inicio -->
      <div v-if="activeTab === 'inicio'" class="inicio-view">
        <AsistenciasInicio />
      </div>
      <!-- Otras vistas -->
      <div v-else class="other-view">
        <AsistenciasJustificantes v-if="activeTab === 'justificantes'" />
        <AsistenciasRepAsi v-else-if="activeTab === 'reporte-asistencias'" />
        <AsistenciasRepVisitas v-else-if="activeTab === 'reporte-visitas'" />
        <!-- Reporte Analítico solo para roles permitidos -->
        <AsistenciasRepAnalitico v-else-if="activeTab === 'reporte-analitico' && canSeeAnalitico" />
        <AsistenciasPaseLista v-else-if="activeTab === 'pase-lista'" />
        <AsistenciasRegistroVisita v-else-if="activeTab === 'registro-visita'" />
      </div>
    </template>
  </div>
</template>

<script setup>
// Imports primero
import { ref, watch, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSidebar } from '@/composables/useSidebar';
import { useAuth } from '@/composables/useAuth';
import AsistenciasInicio from './Asistencias-Inicio.vue';
import AsistenciasJustificantes from './Asistencias-Justificantes.vue';
import AsistenciasRepAsi from './Asistencias-RepAsistencias.vue';
import AsistenciasRepVisitas from './Asistencias-RepVisitas.vue';
import AsistenciasRepAnalitico from './Asistencias-RepAnalitico.vue';
import AsistenciasPaseLista from './Asistencias-PaseLista.vue';
import AsistenciasRegistroVisita from './Asistencias-RegistroVisita.vue';

const route = useRoute();
const router = useRouter();
const activeTab = ref('inicio');
const { contentMarginLeft, contentWidth } = useSidebar();
const { userRole } = useAuth();

// Roles que pueden ver el reporte analítico
const analiticoRoles = [
  'ADMIN',
  'JEFE_RH',
  'JEFE_ASISTENCIAS',
  'JEFE_CONTRATOS'
];
const canSeeAnalitico = computed(() => analiticoRoles.includes(userRole.value));
import { useAuth } from '@/composables/useAuth';
const canSeeAnalitico = computed(() => analiticoRoles.includes(userRole.value));

// Detectar la ruta y cambiar el activeTab
const updateTabFromRoute = () => {
  if (route.path === '/Asistencias/justificantes') {
    activeTab.value = 'justificantes';
  } else if (route.path === '/Asistencias/reporte-asistencias') {
    activeTab.value = 'reporte-asistencias';
  } else if (route.path === '/Asistencias/reporte-visitas') {
    activeTab.value = 'reporte-visitas';
  } else if (route.path === '/Asistencias/reporte-analitico') {
    activeTab.value = 'reporte-analitico';
  } else if (route.path === '/Asistencias/pase-lista') {
    activeTab.value = 'pase-lista';
  } else if (route.path === '/Asistencias/registro-visita') {
    activeTab.value = 'registro-visita';
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
</script>

<style scoped>
.asistencias-content {
  flex: 1;
  min-height: 100vh;
  background-color: #E4E4E7;
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
  width: 100%;
}

.other-view {
  width: 100%;
}

@media (max-width: 768px) {
  .asistencias-content {
    margin-left: 60px !important;
    width: calc(100vw - 60px) !important;
    padding: 1rem;
  }
}
</style>