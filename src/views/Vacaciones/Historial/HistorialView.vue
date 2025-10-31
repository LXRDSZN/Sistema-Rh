<script setup>
import sidebar from '@/components/Barra-Navegacion/sidebar.vue';
import HistorialComponent from '@/components/Vacaciones/Historial-vacaciones-component/Historial-component.vue';
</script>
<template>
  <div class="historial-view">
    <sidebar/>
    <HistorialComponent/>
  </div>
</template>
<style scoped>
.historial-view {
  display: flex;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  background-color: #d8d8d8;
  box-sizing: border-box;
}
</style>