<script setup>
import sidebar from '@/components/Barra-Navegacion/sidebar.vue';
import IncidenciasComponent from '@/components/Incidencias/Incidencias-component.vue';
</script>
<template>
  <div class="incidencias-view">
    <sidebar/>
    <IncidenciasComponent/>
  </div>
</template>
<style scoped>
.incidencias-view {
  display: flex;
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>