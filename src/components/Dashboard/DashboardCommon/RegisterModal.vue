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
        <div class="form-row">
          <div class="form-group">
            <label for="nombre">Nombre*</label>
            <input
              type="text"
              id="nombre"
              v-model="props.modelValue.nombre"
              placeholder="Nombre(s)"
              pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+"
              title="Solo se permiten letras y espacios"
              @keypress="onlyLetters"
              required
            />
            <small class="field-hint">Solo letras, sin números ni caracteres especiales</small>
          </div>
          
          <div class="form-group">
            <label for="apellido_paterno">Apellido Paterno*</label>
            <input
              type="text"
              id="apellido_paterno"
              v-model="props.modelValue.apellido_paterno"
              placeholder="Apellido paterno"
              pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+"
              title="Solo se permiten letras y espacios"
              @keypress="onlyLetters"
              required
            />
            <small class="field-hint">Solo letras, sin números ni caracteres especiales</small>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="apellido_materno">Apellido Materno</label>
            <input
              type="text"
              id="apellido_materno"
              v-model="props.modelValue.apellido_materno"
              placeholder="Apellido materno (opcional)"
              pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*"
              title="Solo se permiten letras y espacios"
              @keypress="onlyLetters"
            />
            <small class="field-hint">Solo letras, sin números ni caracteres especiales</small>
          </div>
          
          <div class="form-group">
            <label for="fecha_nacimiento">Fecha de Nacimiento*</label>
            <input
              type="date"
              id="fecha_nacimiento"
              v-model="props.modelValue.fecha_nacimiento"
              required
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="sexo">Sexo*</label>
            <select id="sexo" v-model="props.modelValue.sexo" required>
              <option value="">Seleccionar...</option>
              <option value="Hombre">Hombre</option>
              <option value="Mujer">Mujer</option>
            </select>
          </div>
          
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
        </div>

        <div class="form-row">
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
          <div class="form-group" v-if="userRole === 'ADMIN' || userRole === 'JEFE_RH'">
            <label for="area">Área*</label>
            <select id="area" v-model="props.modelValue.area" required>
              <option value="">Seleccionar área...</option>
              <option v-for="area in DEPARTAMENTOS" :key="area" :value="area">{{ area }}</option>
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
import { DEPARTAMENTOS } from '@/constants/areas/index.js';

const { onlyLetters } = useTextValidation();

const props = defineProps({
  show: Boolean,
  modelValue: Object,
  userRole: String,
  isRegistering: Boolean
});

const emit = defineEmits(['update:show', 'submit']);

const closeModal = () => {
  emit('update:show', false);
};

const emailError = ref('');

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
