<script setup>
import sidebar from '@/components/Barra-Navegacion/sidebar.vue';
import VacacionesComponent from '@/components/Vacaciones/Vacaciones-component.vue';
</script>
<template>
  <div class="vacaciones-view">
    <sidebar/>
    <VacacionesComponent/>
  </div>
</template>
<style scoped>
.vacaciones-view {
  display: flex;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  background-color: #3a3ab3;
  box-sizing: border-box;
}
</style>