<script setup>
import sidebar from '@/components/Barra-Navegacion/sidebar.vue';
</script>
<template>
  <div class="incidencias">
    <sidebar/>
  </div>
</template>
<style>
@media (min-width: 1024px) {
  .incidencias {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>