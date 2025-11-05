<script setup>
import sidebar from '@/components/Barra-Navegacion/sidebar.vue';
import SolicitudesComponent from '@/components/Vacaciones/Solicitud-vacaciones-component/Solicitudes-component.vue';
</script>
<template>
  <div class="solicitudes-view">
    <sidebar/>
    <SolicitudesComponent/>
  </div>
</template>
<style scoped>
.solicitudes-view {
  display: flex;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  background-color: #d8d8d8;
  box-sizing: border-box;
}
</style>