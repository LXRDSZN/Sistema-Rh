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
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>