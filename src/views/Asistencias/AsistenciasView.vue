<script setup>
import sidebar from '@/components/Barra-Navegacion/sidebar.vue';
import AsistenciasComponent from '@/components/Asistencias/Asistencias-component.vue';
import AsistenciasJustificantes from '@/components/Asistencias/Asistencias-Justificantes.vue'
import AsistenciasRepAsi from '@/components/Asistencias/Asistencias-RepAsistencias.vue';
import AsistenciasRepVisitas from '@/components/Asistencias/Asistencias-RepVisitas.vue';
import AsistenciasRepAnalitico from '@/components/Asistencias/Asistencias-RepAnalitico.vue';
</script>

<template>
  <div class="asistencias-view">
    <sidebar/>
    <!-- <AsistenciasComponent/> -->
    <AsistenciasJustificantes/>
    <!--<AsistenciasRepAsi/>-->
    <!--<AsistenciasRepVisitas/>-->
     <!--<AsistenciasRepAnalitico/>-->
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