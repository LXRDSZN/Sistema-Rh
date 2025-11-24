<!-- 
  ============================================
  COMPONENT - EmployeeEditModal
  ============================================
  Modal para editar datos de empleado con:
  - Información del empleado (solo lectura)
  - Opciones editables: Departamento, Título, Categoría
  - Botones de Cancelar y Guardar
-->

<template>
  <div v-if="isOpen" class="modal-overlay" @click="cerrar">
    <div class="modal-container" @click.stop>
      <!-- Header del Modal -->
      <div class="modal-header">
        <h3>Editar Empleado</h3>
        <button class="close-btn" @click="cerrar">
          <span class="material-symbols-rounded">close</span>
        </button>
      </div>

      <!-- Cuerpo del Modal -->
      <div class="modal-body">
        <!-- Información del empleado (solo lectura) -->
        <div class="employee-info">
          <h3 class="info-title">Datos del Empleado</h3>
          <div class="info-row">
            <div class="info-item full-width">
              <span class="info-label">Nombre completo:</span>
              <span class="info-value">{{ empleado?.nombre }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">Sexo:</span>
              <span class="info-value">{{ empleado?.genero }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha de inicio:</span>
              <span class="info-value">{{ empleado?.fechaInicio }}</span>
            </div>
          </div>
          
          <h3 class="info-title">Datos del Contrato Actual</h3>
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">Departamento:</span>
              <span class="info-value">{{ empleado?.departamento || 'Sin departamento' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Título/Rol:</span>
              <span class="info-value">{{ empleado?.titulo || 'Sin título' }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">Modalidad:</span>
              <span class="info-value">{{ empleado?.modalidad || 'No especificada' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Tipo de contrato:</span>
              <span class="info-value">{{ empleado?.tipoContrato || 'No especificado' }}</span>
            </div>
          </div>
        </div>

        <!-- Selección de Departamento -->
        <div class="form-section">
          <label class="form-label">Departamento</label>
          <div class="options-grid">
            <button
              v-for="dept in departamentos"
              :key="dept"
              type="button"
              class="option-btn"
              :class="{ active: empleado?.departamento === dept }"
              @click="actualizarDepartamento(dept)"
            >
              {{ dept }}
            </button>
          </div>
        </div>

        <!-- Motivo del cambio de área -->
        <div class="motivo-section" v-if="empleado?.departamento !== empleadoOriginal?.departamento">
          <label class="form-label">
            <span class="material-symbols-rounded">edit_note</span>
            Motivo del cambio de área*
          </label>
          <textarea
            v-model="motivoCambio"
            placeholder="Ejemplo: Promoción, reestructuración del equipo, necesidades del departamento, etc."
            class="motivo-textarea"
            rows="4"
            maxlength="500"
            required
          ></textarea>
          <div class="textarea-footer">
            <small class="field-hint">
              <span class="material-symbols-rounded">info</span>
              Este comentario quedará registrado en el historial del empleado
            </small>
            <small class="char-count">{{ motivoCambio.length }}/500</small>
          </div>
        </div>

        <!-- Selección de Título -->
        <div class="form-section">
          <label class="form-label">Título de trabajo</label>
          <div class="options-grid">
            <button
              v-for="titulo in titulos"
              :key="titulo"
              type="button"
              class="option-btn"
              :class="{ active: empleado?.titulo === titulo }"
              @click="actualizarTitulo(titulo)"
            >
              {{ titulo }}
            </button>
          </div>
        </div>
      </div>

      <!-- Footer del Modal -->
      <div class="modal-footer">
        <button class="cancel-btn" type="button" @click="cerrar">Cancelar</button>
        <button class="save-btn" type="button" @click="guardar">Guardar cambios</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { DEPARTAMENTOS, TITULOS } from '@/constants/areas';

// ============================================
// PROPS
// ============================================
const props = defineProps({
  isOpen: Boolean,
  empleado: Object,
  departamentos: {
    type: Array,
    default: () => DEPARTAMENTOS
  },
  titulos: {
    type: Array,
    default: () => TITULOS
  }
});

// ============================================
// STATE
// ============================================
const motivoCambio = ref('');
const empleadoOriginal = ref(null);

// Guardar una copia del empleado original cuando se abre el modal
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.empleado) {
    empleadoOriginal.value = { ...props.empleado };
    motivoCambio.value = '';
  }
});

// ============================================
// EMITS
// ============================================
const emit = defineEmits([
  'cerrar',
  'guardar',
  'actualizarDepartamento',
  'actualizarTitulo'
]);

// ============================================
// METHODS
// ============================================
const cerrar = () => {
  motivoCambio.value = '';
  emit('cerrar');
};

const guardar = () => {
  // Validar que si cambió el área, tenga un motivo
  if (props.empleado?.departamento !== empleadoOriginal.value?.departamento) {
    if (!motivoCambio.value.trim()) {
      alert('Por favor, describe el motivo del cambio de área');
      return;
    }
  }

  emit('guardar', motivoCambio.value);
  motivoCambio.value = '';
};

const actualizarDepartamento = (dept) => {
  emit('actualizarDepartamento', dept);
};

const actualizarTitulo = (titulo) => {
  emit('actualizarTitulo', titulo);
};
</script>

<style scoped>
/* ============================================
   MODAL OVERLAY
   ============================================ */
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

/* Modal Container */
.modal-container {
  background: white;
  border-radius: 1rem;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
}

/* ============================================
   MODAL HEADER
   ============================================ */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #E5E7EB;
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #F3F4F6;
}

.close-btn .material-symbols-rounded {
  font-size: 1.5rem;
  color: #6B7280;
}

/* ============================================
   MODAL BODY
   ============================================ */
.modal-body {
  padding: 1.5rem;
}

/* Información del Empleado */
.employee-info {
  background: #F3F4F6;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.info-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #374151;
  margin: 0.5rem 0 0.75rem 0;
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
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
  display: block;
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 0.875rem;
  color: #111827;
  display: block;
}

/* Secciones del Formulario */
.form-section {
  margin-bottom: 1.5rem;
}

.form-section:last-of-type {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

/* Grid de Opciones */
.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.option-btn {
  padding: 0.75rem 1rem;
  background: white;
  border: 1.5px solid #E5E7EB;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.option-btn:hover {
  border-color: #D1D5DB;
  background: #F9FAFB;
}

.option-btn.active {
  background: #EEF2FF;
  border-color: #818CF8;
  color: #4F46E5;
  font-weight: 500;
}

/* ============================================
   MOTIVO TEXTAREA
   ============================================ */
.motivo-section {
  background: #F0F9FF;
  border: 2px dashed #BAE6FD;
  border-radius: 0.75rem;
  padding: 1.25rem;
  margin: 1rem 0 1.5rem 0;
}

.motivo-section .form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #0369A1;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.motivo-section .form-label .material-symbols-rounded {
  font-size: 1.25rem;
}

.motivo-textarea {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #BAE6FD;
  border-radius: 0.5rem;
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #374151;
  resize: vertical;
  transition: all 0.2s;
  background: white;
  min-height: 100px;
}

.motivo-textarea:focus {
  outline: none;
  border-color: #0EA5E9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.motivo-textarea::placeholder {
  color: #9CA3AF;
  font-style: italic;
}

.textarea-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 0.5rem;
  gap: 1rem;
}

.field-hint {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #0369A1;
  font-style: normal;
  flex: 1;
}

.field-hint .material-symbols-rounded {
  font-size: 0.875rem;
}

.char-count {
  font-size: 0.75rem;
  color: #6B7280;
  font-weight: 500;
  white-space: nowrap;
}

/* ============================================
   MODAL FOOTER
   ============================================ */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #E5E7EB;
}

.cancel-btn,
.save-btn {
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: white;
  border: 1px solid #E5E7EB;
  color: #374151;
}

.cancel-btn:hover {
  background: #F3F4F6;
  border-color: #D1D5DB;
}

.save-btn {
  background: #818CF8;
  border: none;
  color: white;
}

.save-btn:hover {
  background: #6366F1;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 640px) {
  .options-grid {
    grid-template-columns: 1fr;
  }

  .info-row {
    flex-direction: column;
    gap: 0.75rem;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
  }
}
</style>
