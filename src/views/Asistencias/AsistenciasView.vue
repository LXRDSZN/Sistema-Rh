<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import sidebar from '@/components/Barra-Navegacion/sidebar.vue';
import AsistenciasComponent from '@/components/Asistencias/Asistencias-component.vue';
import AsistenciasJustificantes from '@/components/Asistencias/Asistencias-Justificantes.vue'
import AsistenciasRepAsi from '@/components/Asistencias/Asistencias-RepAsistencias.vue';
import AsistenciasRepVisitas from '@/components/Asistencias/Asistencias-RepVisitas.vue';
import AsistenciasRepAnalitico from '@/components/Asistencias/Asistencias-RepAnalitico.vue';

const route = useRoute();

// Determinar qué componente mostrar según la ruta
const currentComponent = computed(() => {
  const path = route.path;
  if (path === '/Asistencias/justificantes') return 'justificantes';
  if (path === '/Asistencias/reporte-asistencias') return 'reporte-asistencias';
  if (path === '/Asistencias/reporte-visitas') return 'reporte-visitas';
  if (path === '/Asistencias/reporte-analitico') return 'reporte-analitico';
  return 'Asistencias'; // Por defecto muestra el dashboard
});
</script>

<template>
  <div class="asistencias-view">
    <sidebar/>
    <AsistenciasComponent v-if="currentComponent === 'Asistencias'" />
    <AsistenciasJustificantes v-if="currentComponent === 'justificantes'" />
    <AsistenciasRepAsi v-if="currentComponent === 'reporte-asistencias'" />
    <AsistenciasRepVisitas v-if="currentComponent === 'reporte-visitas'" />
    <AsistenciasRepAnalitico v-if="currentComponent === 'reporte-analitico'" />
  </div>
</template>

<style scoped>
.asistencias-view {
  display: flex;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  background-color: #E4E4E7;
}
</style>