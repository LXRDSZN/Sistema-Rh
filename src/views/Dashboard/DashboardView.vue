<script setup>
import { onMounted, onUnmounted } from 'vue';
import sidebar from '@/components/Barra-Navegacion/sidebar.vue';
import DashboardComponent from '@/components/Dashboard/Dashboard-component.vue';

onMounted(() => {
  document.body.classList.add('dashboard-page');
});

onUnmounted(() => {
  document.body.classList.remove('dashboard-page');
});
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
  background: #F3F4F6;
}
</style>