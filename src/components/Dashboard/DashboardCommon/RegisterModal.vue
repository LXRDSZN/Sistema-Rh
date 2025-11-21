<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Registro de Usuario</h2>
        <button @click="closeModal" class="close-btn">
          <span class="material-symbols-rounded">close</span>
        </button>
      </div>

      <form @submit.prevent="$emit('submit')" class="register-form">
        <!-- Selector de Empleado -->
        <div class="form-group full-width">
          <label for="empleado">Seleccionar Empleado*</label>
          <select 
            id="empleado" 
            v-model="props.modelValue.persona_id" 
            required
            :disabled="isLoadingEmpleados"
          >
            <option value="">{{ isLoadingEmpleados ? 'Cargando empleados...' : 'Seleccionar empleado...' }}</option>
            <option 
              v-for="empleado in props.empleadosSinCorreo" 
              :key="empleado.id" 
              :value="empleado.id"
            >
              {{ empleado.apellido_paterno }} {{ empleado.apellido_materno }} {{ empleado.nombre }}
              {{ empleado.area ? ` - ${empleado.area}` : '' }}
              {{ empleado.puesto ? ` (${empleado.puesto})` : '' }}
            </option>
          </select>
          <small class="field-hint">Selecciona un empleado con contrato activo que aún no tiene correo registrado</small>
        </div>

        <!-- Información del empleado y contrato (solo lectura) -->
        <div v-if="props.modelValue.persona_id" class="employee-info">
          <h3 class="info-title">Datos del Empleado</h3>
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">Nombre completo:</span>
              <span class="info-value">{{ props.modelValue.nombre }} {{ props.modelValue.apellido_paterno }} {{ props.modelValue.apellido_materno }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">Sexo:</span>
              <span class="info-value">{{ props.modelValue.sexo }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha de nacimiento:</span>
              <span class="info-value">{{ formatDate(props.modelValue.fecha_nacimiento) }}</span>
            </div>
          </div>
          
          <h3 class="info-title">Datos del Contrato</h3>
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">Área:</span>
              <span class="info-value">{{ props.modelValue.area || 'Sin área' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Puesto:</span>
              <span class="info-value">{{ props.modelValue.puesto || 'Sin puesto' }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">Tipo de contrato:</span>
              <span class="info-value">{{ props.modelValue.tipo_contrato || 'No especificado' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Modalidad:</span>
              <span class="info-value">{{ props.modelValue.modalidad || 'No especificada' }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">Salario mensual:</span>
              <span class="info-value">{{ formatCurrency(props.modelValue.salario_mensual) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Estado:</span>
              <span class="info-value">{{ props.modelValue.estado_contrato || 'Activo' }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">Fecha inicio:</span>
              <span class="info-value">{{ formatDate(props.modelValue.fecha_inicio) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha fin:</span>
              <span class="info-value">{{ formatDate(props.modelValue.fecha_fin) }}</span>
            </div>
          </div>
          <div v-if="props.modelValue.observaciones" class="info-row">
            <div class="info-item full-width">
              <span class="info-label">Observaciones:</span>
              <span class="info-value">{{ props.modelValue.observaciones }}</span>
            </div>
          </div>
        </div>

        <!-- Campos de credenciales -->
        <div class="form-row">
          <div class="form-group">
            <label for="email">Email*</label>
            <input
              type="email"
              id="email"
              v-model="props.modelValue.email"
              placeholder="correo@ejemplo.com"
              required
              @input="$forceUpdate()"
            />
            <small v-if="emailError" class="field-error">{{ emailError }}</small>
          </div>

          <div class="form-group">
            <label for="password">Contraseña Temporal*</label>
            <input
              type="password"
              id="password"
              v-model="props.modelValue.password"
              placeholder="Contraseña temporal"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="rol">Rol*</label>
            <select id="rol" v-model="props.modelValue.rol" required>
              <option value="">Seleccionar rol...</option>
              <option v-if="userRole === 'ADMIN'" value="JEFE_RH">Jefe de Recursos Humanos</option>
              <option v-if="userRole === 'ADMIN' || userRole === 'JEFE_RH'" value="JEFE_AREA">Jefe de Área</option>
              <option v-if="userRole === 'ADMIN' || userRole === 'JEFE_RH'" value="JEFE_ASISTENCIAS">Jefe de Asistencias</option>
              <option v-if="userRole === 'ADMIN' || userRole === 'JEFE_RH'" value="JEFE_CONTRATOS">Jefe de Contratos</option>
              <option v-if="userRole === 'ADMIN' || userRole === 'JEFE_RH'" value="JEFE_VACACIONES">Jefe de Vacaciones</option>
              <option v-if="userRole === 'ADMIN' || userRole === 'JEFE_RH'" value="JEFE_INCIDENCIAS">Jefe de Incidencias</option>
              <option value="EMPLEADO">Empleado</option>
            </select>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="isRegistering">
          <span v-if="!isRegistering">Guardar Usuario</span>
          <span v-else>Guardando...</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useTextValidation } from '@/composables/useTextValidation';

const { onlyLetters } = useTextValidation();

const props = defineProps({
  show: Boolean,
  modelValue: Object,
  userRole: String,
  isRegistering: Boolean,
  empleadosSinCorreo: Array,
  isLoadingEmpleados: Boolean
});

const emit = defineEmits(['update:show', 'submit']);

const closeModal = () => {
  emit('update:show', false);
};

const emailError = ref('');

// Formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return 'No especificada';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Formatear moneda
const formatCurrency = (amount) => {
  if (!amount) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};

watch(() => props.modelValue.email, (val) => {
  if (!val) {
    emailError.value = '';
  } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) {
    emailError.value = 'Ingresa un correo electrónico válido (ejemplo@dominio.com)';
  } else {
    emailError.value = '';
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #E5E7EB;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6B7280;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #F3F4F6;
  color: #374151;
}

.register-form {
  padding: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.employee-info {
  background: #F3F4F6;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.info-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 0.75rem;
  margin-top: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #E5E7EB;
}

.info-title:first-child {
  margin-top: 0;
}

.info-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 0.5rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-item {
  flex: 1;
}

.info-item.full-width {
  flex: 1 1 100%;
  width: 100%;
}

.info-label {
  font-size: 0.75rem;
  color: #6B7280;
  font-weight: 500;
  display: block;
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 0.875rem;
  color: #111827;
  font-weight: 600;
}

.field-hint {
  font-size: 0.75rem;
  color: #6B7280;
  margin-top: 0.25rem;
  font-style: italic;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.submit-btn {
  margin-top: 0.5rem;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  background: #6366F1;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.submit-btn:hover:not(:disabled) {
  background: #4F46E5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.submit-btn:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
  opacity: 0.7;
}

.field-error {
  color: #e53e3e;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    max-height: 95vh;
  }
}
</style>
