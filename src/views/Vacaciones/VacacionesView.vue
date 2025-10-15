<script setup>
import sidebar from '@/components/Barra-Navegacion/sidebar.vue';
import VacacionesComponent from '@/components/Vacaciones/Vacaciones-component.vue';
</script>
<template>
  <div class="vacaciones">
    <sidebar/>
    <VacacionesComponent/>
  </div>
</template>
<style>

@media (min-width: 1024px) {
  .vacaciones {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>