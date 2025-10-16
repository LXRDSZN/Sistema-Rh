<script setup>
import sidebar from '@/components/Barra-Navegacion/sidebar.vue';
import DashboardComponent from '@/components/Dashboard/Dashboard-component.vue';
</script>
<template>
  <div class="dashboard-view">
    <sidebar/>
    <DashboardComponent/>
  </div>
</template>

<style scoped>
.dashboard-view {
  display: flex;
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>