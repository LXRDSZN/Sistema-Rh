<script setup>
import sidebar from '@/components/Barra-Navegacion/sidebar.vue';
import ContratosComponent from '@/components/Contratos/Contratos-component.vue';
</script>
<template>
  <div class="contratos-view">
    <sidebar/>
    <ContratosComponent/>
  </div>
</template>
<style scoped>
.contratos-view {
  display: flex;
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>