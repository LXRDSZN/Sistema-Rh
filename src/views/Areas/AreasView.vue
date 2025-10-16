<script setup>
import sidebar from '@/components/Barra-Navegacion/sidebar.vue';
import AreasComponent from '@/components/Areas/Areas-component.vue';
</script>

<template>
  <div class="areas-view">
    <sidebar/>
    <AreasComponent/>
  </div>
</template>

<style scoped>
.areas-view {
  display: flex;
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>