<script setup>
import sidebar from '@/components/Barra-Navegacion/sidebar.vue';
import RegistroHuellasComponent from '@/components/Contratos/RegistroHuellas-component.vue';
</script>

<template>
  <div class="registro-huellas-view">
    <sidebar/>
    <RegistroHuellasComponent/>
  </div>
</template>

<style scoped>
.registro-huellas-view {
  display: flex;
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>
