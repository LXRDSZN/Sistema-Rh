<template>
  <div class="dashboard-header">
    <div class="header-left">
      <h1>Bienvenido, {{ userName }}.</h1>
      <div class="user-info-inline">
        <span class="role-badge" :class="userRole.toLowerCase()">{{ userRole }}</span>
        <span class="permissions-count">{{ totalPermissions }} permisos</span>
      </div>
    </div>
    <div class="header-actions">
      <button 
        v-if="userRole !== 'EMPLEADO'" 
        @click="$emit('openRegisterModal')" 
        class="register-btn"
      >
        <span class="material-symbols-rounded">person_add</span>
        Registrar Usuario
      </button>
      <button @click="$emit('logout')" class="logout-btn">
        <span class="material-symbols-rounded">logout</span>
        Cerrar sesión
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  userName: String,
  userRole: String,
  totalPermissions: Number
});

defineEmits(['openRegisterModal', 'logout']);
</script>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 0.5rem;
}

.user-info-inline {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.role-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
}

.role-badge.admin {
  background: #FEF3C7;
  color: #92400E;
}

.role-badge.jefe_rh {
  background: #DBEAFE;
  color: #1E40AF;
}

.role-badge.jefe_area {
  background: #E0E7FF;
  color: #3730A3;
}

.role-badge.empleado {
  background: #F3F4F6;
  color: #374151;
}

.permissions-count {
  font-size: 0.875rem;
  color: #6B7280;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.register-btn,
.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.register-btn {
  background: #6366F1;
  color: white;
}

.register-btn:hover {
  background: #4F46E5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.logout-btn {
  background: white;
  color: #6B7280;
  border: 1px solid #E5E7EB;
}

.logout-btn:hover {
  background: #F9FAFB;
  color: #374151;
  border-color: #D1D5DB;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .register-btn,
  .logout-btn {
    flex: 1;
  }
}
</style>
