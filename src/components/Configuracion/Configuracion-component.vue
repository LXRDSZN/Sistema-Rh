<template>
  <div class="configuracion-content">
    <div class="configuracion-header">
      <h1>Configuración de Usuario</h1>
      <p class="subtitle">Administra tu cuenta y preferencias</p>
    </div>

    <div class="configuracion-sections">
      <!-- Sección de Cambio de Contraseña -->
      <div class="config-card">
        <div class="card-header">
          <span class="material-symbols-rounded">lock</span>
          <h2>Cambiar Contraseña</h2>
        </div>
        
        <form @submit.prevent="handleChangePassword" class="password-form">
          <div class="form-group">
            <label for="current_password">Contraseña Actual*</label>
            <input
              type="password"
              id="current_password"
              v-model="passwordForm.currentPassword"
              placeholder="Ingresa tu contraseña actual"
              required
            />
          </div>

          <div class="form-group">
            <label for="new_password">Nueva Contraseña*</label>
            <input
              type="password"
              id="new_password"
              v-model="passwordForm.newPassword"
              placeholder="Ingresa tu nueva contraseña"
              required
              minlength="8"
            />
            <small class="help-text">Mínimo 8 caracteres</small>
          </div>

          <div class="form-group">
            <label for="confirm_password">Confirmar Nueva Contraseña*</label>
            <input
              type="password"
              id="confirm_password"
              v-model="passwordForm.confirmPassword"
              placeholder="Confirma tu nueva contraseña"
              required
            />
          </div>

          <button type="submit" class="submit-btn">
            <span class="material-symbols-rounded">check_circle</span>
            Actualizar Contraseña
          </button>
        </form>
      </div>

      <!-- Sección de Información de Cuenta -->
      <div class="config-card">
        <div class="card-header">
          <span class="material-symbols-rounded">person</span>
          <h2>Información de Cuenta</h2>
        </div>
        
        <div class="account-info">
          <div class="info-row">
            <span class="info-label">Nombre:</span>
            <span class="info-value">{{ userName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">{{ userEmail }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Rol:</span>
            <span class="info-value">
              <span class="role-badge" :class="userRole.toLowerCase()">{{ formatRoleName(userRole) }}</span>
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">Permisos totales:</span>
            <span class="info-value">{{ totalPermissions }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useToast } from 'vue-toast-notification';
import axios from 'axios';

const toast = useToast();
const { userName, userEmail, userRole, totalPermissions } = useAuth();

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const formatRoleName = (role) => {
  const roleNames = {
    'ADMIN': 'Administrador',
    'GERENTE_GENERAL': 'Gerente General',
    'JEFE_AREA': 'Jefe de Área',
    'JEFE_ASISTENCIAS': 'Jefe de Asistencias',
    'JEFE_CONTRATOS': 'Jefe de Contratos',
    'JEFE_VACACIONES': 'Jefe de Vacaciones',
    'JEFE_INCIDENCIAS': 'Jefe de Incidencias',
    'EMPLEADO': 'Empleado',
    'Analista de Datos': 'Analista de Datos',
    'Contador General': 'Contador General',
    'Desarrollador Full Stack': 'Desarrollador Full Stack'
  };
  return roleNames[role] || role;
};

const handleChangePassword = async () => {
  try {
    // Validar que las contraseñas coincidan
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    // Validar longitud mínima
    if (passwordForm.value.newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    // Llamada al backend para actualizar la contraseña
    // El backend se encargará de hashear la contraseña
    const response = await axios.post('http://localhost:5000/api/change-password', {
      email: userEmail.value,
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    }, {
      withCredentials: true // Para enviar las cookies de autenticación
    });

    if (response.data.success) {
      toast.success('Contraseña actualizada exitosamente');
      
      // Limpiar el formulario
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    } else {
      toast.error(response.data.message || 'Error al actualizar la contraseña');
    }
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.response?.status === 401) {
      toast.error('La contraseña actual es incorrecta');
    } else {
      toast.error('Error al actualizar la contraseña');
    }
  }
};
</script>

<style scoped>
.configuracion-content {
  flex: 1;
  padding: 2rem;
  padding-bottom: 4rem;
  margin-left: 60px;
  min-height: 100vh;
  width: calc(100vw - 60px);
  max-width: 100%;
  background: #F3F4F6;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.configuracion-header {
  margin-bottom: 2rem;
  width: 100%;
  max-width: 1400px;
}

.configuracion-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  font-size: 1rem;
  color: #6B7280;
  margin: 0;
}

.configuracion-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  width: 100%;
  max-width: 1400px;
}

.config-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #F3F4F6;
}

.card-header .material-symbols-rounded {
  font-size: 28px;
  color: #6366F1;
}

.card-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

/* Password Form */
.password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #1F2937;
  transition: all 0.2s;
}

.form-group input::placeholder {
  color: #9CA3AF;
}

.form-group input:focus {
  outline: none;
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.help-text {
  font-size: 0.75rem;
  color: #6B7280;
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  background: #6366F1;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;
}

.submit-btn:hover {
  background: #4F46E5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.submit-btn .material-symbols-rounded {
  font-size: 20px;
}

/* Account Info */
.account-info {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #F9FAFB;
  border-radius: 8px;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6B7280;
}

.info-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1F2937;
}

.role-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.75rem;
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

/* Responsive */
@media (max-width: 1024px) {
  .configuracion-content {
    margin-left: 0;
    width: 100vw;
    padding: 1.5rem;
  }

  .configuracion-sections {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .configuracion-content {
    padding: 1rem;
  }

  .config-card {
    padding: 1.5rem;
  }
}
</style>
