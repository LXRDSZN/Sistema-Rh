<script setup>
import ConfiguracionComponent from '@/components/Configuracion/Configuracion-component.vue'
import sidebar from '@/components/Barra-Navegacion/sidebar.vue'
</script>

<template>
  <div class="dashboard-container">
    <sidebar />
    <ConfiguracionComponent />
  </div>
</template>

<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background: #F3F4F6;
}
</style>
