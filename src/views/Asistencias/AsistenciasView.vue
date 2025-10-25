<script setup>
import sidebar from '@/components/Barra-Navegacion/sidebar.vue';
import AsistenciasComponent from '@/components/Asistencias/Asistencias-component.vue';
</script>

<template>
  <div class="asistencias-view">
    <sidebar/>
    <AsistenciasComponent/>
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