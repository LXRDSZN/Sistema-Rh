<template>
  <div class="dashboard-content">
    <!-- Header -->
    <DashboardHeader
      :userName="userName"
      :userRole="userRole"
      :totalPermissions="totalPermissions"
      @openRegisterModal="openRegisterModal"
      @logout="handleLogout"
    />

    <!-- Stats Cards -->
    <div class="stats-cards">
      <StatCard
        icon="person_add"
        iconClass="nuevos"
        label="Nuevos empleados"
        :value="stats.nuevosEmpleados.total"
        :percentage="stats.nuevosEmpleados.porcentaje"
        :trend="stats.nuevosEmpleados.tendencia"
      />
      <StatCard
        icon="groups"
        iconClass="empleados"
        label="Empleados"
        :value="stats.totalEmpleados.total"
        :percentage="stats.totalEmpleados.porcentaje"
        :trend="stats.totalEmpleados.tendencia"
        :formatNumber="true"
      />
      <StatCard
        icon="computer"
        iconClass="activos"
        label="Activos Ahora"
        :value="stats.asistenciasActivas.total"
        :emoji="stats.asistenciasActivas.emoji"
      />
    </div>

    <!-- Modal de Registro -->
    <RegisterModal
      v-model:show="showRegisterModal"
      :modelValue="newUser"
      :userRole="userRole"
      :isRegistering="isRegistering"
      :empleadosSinCorreo="empleadosSinCorreo"
      :isLoadingEmpleados="isLoadingEmpleados"
      @submit="handleRegisterUser"
    />

    <!-- Sección principal con gráficas y calendario -->
    <div class="main-section">
      <!-- Gráfica de empleados por área -->
      <DonutChart 
        :empleadosPorArea="empleadosPorArea" 
        :areaColors="areaColors"
      />

      <!-- Calendario -->
      <CalendarWidget />
    </div>

    <!-- Gráfica de edad y género -->
    <DemographicsChart 
      :totalEmpleados="stats.totalEmpleados.total"
      :estadisticasEdadGenero="estadisticasEdadGenero"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useRouter } from 'vue-router';
import { useDashboardData } from '@/composables/dashboard/useDashboardData';
import { useUserRegistration } from '@/composables/dashboard/useUserRegistration';
import DashboardHeader from './DashboardCommon/DashboardHeader.vue';
import StatCard from './DashboardStats/StatCard.vue';
import RegisterModal from './DashboardCommon/RegisterModal.vue';
import DonutChart from './DashboardCharts/DonutChart.vue';
import CalendarWidget from './DashboardCharts/CalendarWidget.vue';
import DemographicsChart from './DashboardCharts/DemographicsChart.vue';

const router = useRouter();
const { userName, userEmail, userRole, totalPermissions, logout, verifySession } = useAuth();
const { stats, empleadosPorArea, estadisticasEdadGenero, areaColors, loadDashboardStats } = useDashboardData();
const { newUser, isRegistering, showRegisterModal, empleadosSinCorreo, isLoadingEmpleados, handleRegisterUser, loadEmpleadosSinCorreo } = useUserRegistration();

// Verificar sesión al cargar el dashboard
onMounted(async () => {
  const isValid = await verifySession();
  if (!isValid) {
    router.push('/login');
    return;
  }
  
  await loadDashboardStats();
});

// Cargar empleados cuando se abre el modal
const openRegisterModal = async () => {
  showRegisterModal.value = true;
  await loadEmpleadosSinCorreo();
};

// Logout
const handleLogout = () => {
  logout();
  router.push('/login');
};
</script>

<style scoped>
.dashboard-content {
  flex: 1;
  padding: 2rem;
  padding-bottom: 4rem;
  margin-left: 60px;
  min-height: 100vh;
  width: calc(100vw - 60px);
  max-width: 100%;
  background: #F3F4F6;
  box-sizing: border-box;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  width: 100%;
}

.main-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
  width: 100%;
}

@media (max-width: 1024px) {
  .main-section {
    grid-template-columns: 1fr;
  }
  .dashboard-content {
    margin-left: 0;
    padding: 1.5rem;
    width: 100vw;
  }
}

@media (max-width: 768px) {
  .dashboard-content {
    padding: 1rem;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1024px) {
  .dashboard-content {
    padding: 3rem;
  }
}

@media (min-width: 1400px) {
  .dashboard-content {
    padding: 3rem 4rem;
  }
}
</style>
