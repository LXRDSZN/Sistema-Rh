<template>
  <div class="dashboard-header">
    <div class="header-left">
      <h1>Bienvenido, {{ userName }}.</h1>
      <div class="user-info-inline">
        <span class="role-badge" :class="roleBadgeClass">{{ formatRoleName(userRole) }}</span>
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
import { computed } from 'vue';
const props = defineProps({
  userName: String,
  userRole: String,
  totalPermissions: Number
});

defineEmits(['openRegisterModal', 'logout']);

// Formato bonito para el nombre del rol
function formatRoleName(role) {
  const map = {
    'ADMIN': 'ADMIN',
    'GERENTE_GENERAL': 'GERENTE GENERAL',
    'JEFE_AREA': 'JEFE ÁREA',
    'JEFE_ASISTENCIAS': 'JEFE ASISTENCIAS',
    'JEFE_CONTRATOS': 'JEFE CONTRATOS',
    'JEFE_VACACIONES': 'JEFE VACACIONES',
    'JEFE_INCIDENCIAS': 'JEFE INCIDENCIAS',
    'EMPLEADO': 'EMPLEADO',
    'Analista de Datos': 'ANALISTA DE DATOS',
    'Contador General': 'CONTADOR GENERAL',
    'Desarrollador Full Stack': 'DESARROLLADOR'
  };
  return map[role] || role;
}

// Clase para el color del badge
const roleBadgeClass = computed(() => {
  if (!props.userRole) return '';
  return props.userRole.toLowerCase();
});
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
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.role-badge.admin {
  background: #FEE2E2;
  color: #DC2626;
}

.role-badge.gerente_general {
  background: #DBEAFE;
  color: #2563EB;
}

.role-badge.jefe_area {
  background: #D1FAE5;
  color: #059669;
}

.role-badge.empleado {
  background: #E0E7FF;
  color: #6366F1;
}

/* JEFE_ASISTENCIAS: Verde (Asistencias) */
.role-badge.jefe_asistencias {
  background: #D1FADF;
  color: #12B76A;
}
/* JEFE_CONTRATOS: Azul fuerte (Documentación) */
.role-badge.jefe_contratos {
  background: #DBEAFE;
  color: #2563EB;
}
/* JEFE_VACACIONES: Morado (Vacaciones) */
.role-badge.jefe_vacaciones {
  background: #E9D5FF;
  color: #A21CAF;
}
/* JEFE_INCIDENCIAS: Naranja (Incidencias) */
.role-badge.jefe_incidencias {
  background: #FFE7C2;
  color: #F59E42;
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
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.register-btn {
  background: white;
  color: #6366F1;
}

.register-btn:hover {
  background: #F5F5FF;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.15);
}

.register-btn .material-symbols-rounded {
  font-size: 20px;
  color: #6366F1;
}

.logout-btn {
  background: white;
  color: #EF4444;
}

.logout-btn:hover {
  background: #FEF2F2;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.15);
}

.logout-btn .material-symbols-rounded {
  font-size: 20px;
  color: #EF4444;
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
