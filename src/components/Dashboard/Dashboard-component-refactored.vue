<template>
  <div class="dashboard-content">
    <!-- Header -->
    <DashboardHeader
      :userName="userName"
      :userRole="userRole"
      :totalPermissions="totalPermissions"
      @openRegisterModal="showRegisterModal = true"
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
      @submit="handleRegisterUser"
    />

    <!-- Resto del contenido del dashboard se mantiene igual -->
    <slot name="main-content"></slot>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useRouter } from 'vue-router';
import { useDashboardData } from '@/composables/dashboard/useDashboardData';
import { useUserRegistration } from '@/composables/dashboard/useUserRegistration';
import DashboardHeader from './DashboardCommon/DashboardHeader.vue';
import StatCard from './DashboardStats/StatCard.vue';
import RegisterModal from './DashboardCommon/RegisterModal.vue';

const router = useRouter();
const { userName, userEmail, userRole, totalPermissions, logout, verifySession } = useAuth();
const { stats, loadDashboardStats } = useDashboardData();
const { newUser, isRegistering, showRegisterModal, handleRegisterUser } = useUserRegistration();

// Verificar sesión al cargar el dashboard
onMounted(async () => {
  const isValid = await verifySession();
  if (!isValid) {
    router.push('/login');
    return;
  }
  
  await loadDashboardStats();
});

// Logout
const handleLogout = () => {
  logout();
  router.push('/login');
};
</script>

<style scoped>
.dashboard-content {
  margin-left: 250px;
  padding: 2rem;
  background: #F9FAFB;
  min-height: 100vh;
  width: calc(100vw - 250px);
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (max-width: 1024px) {
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
