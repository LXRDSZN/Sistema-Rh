<template>
  <div class="contratos-card">
    <div class="card-inner">
      <!-- Header con botón y filtros -->
      <div class="tareas-header">
        <button class="btn-nueva" @click="mostrarModal = true">NUEVA TAREA</button>
        <div class="filter-tabs">
          <button 
            v-for="filtro in filtros" 
            :key="filtro"
            :class="['filter-tab', { active: filtroActivo === filtro }]"
            @click="filtroActivo = filtro"
          >
            {{ filtro }}
          </button>
        </div>
      </div>

      <!-- Lista de tareas -->
      <div class="tareas-list">
        <div v-for="tarea in tareasFiltradas" :key="tarea.id" class="tarea-item">
          <div class="tarea-check">
            <div :class="['checkbox', { checked: tarea.completada }]" @click="toggleTarea(tarea.id)">
              <svg v-if="tarea.completada" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>
          
          <div class="tarea-content">
            <div class="tarea-title">{{ tarea.titulo }}</div>
            <div class="tarea-fecha">{{ tarea.fecha }}</div>
          </div>

          <div class="tarea-meta">
            <div class="meta-row">
              <span class="meta-label">Creado</span>
              <div class="meta-user">
                <div class="user-avatar">{{ tarea.creadoPor.iniciales }}</div>
                <span class="user-name">{{ tarea.creadoPor.nombre }}</span>
              </div>
            </div>
            <div class="meta-row">
              <span class="meta-label">Asignado</span>
              <div class="meta-user">
                <div class="user-avatar yellow">{{ tarea.asignadoA.iniciales }}</div>
                <span class="user-name">{{ tarea.asignadoA.nombre }}</span>
              </div>
            </div>
          </div>

          <div class="tarea-actions">
            <button class="btn-menu">⋮</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para nueva tarea -->
    <div v-if="mostrarModal" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Nueva Tarea</h3>
          <button class="btn-close" @click="cerrarModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Título de la tarea</label>
            <input 
              v-model="nuevaTarea.titulo" 
              type="text" 
              placeholder="Ingresa el título de la tarea"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Fecha</label>
            <input 
              v-model="nuevaTarea.fecha" 
              type="date" 
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Asignado a</label>
            <input 
              v-model="nuevaTarea.asignadoNombre" 
              type="text" 
              placeholder="Nombre del asignado"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Iniciales del asignado</label>
            <input 
              v-model="nuevaTarea.asignadoIniciales" 
              type="text" 
              placeholder="Ej: DH"
              class="form-input"
              maxlength="2"
            />
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="cerrarModal">Cancelar</button>
          <button class="btn-save" @click="agregarTarea">Guardar Tarea</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const filtros = ['ABIERTAS', 'COMPLETADAS', 'TODAS']
const filtroActivo = ref('ABIERTAS')
const mostrarModal = ref(false)

const nuevaTarea = ref({
  titulo: '',
  fecha: '',
  asignadoNombre: '',
  asignadoIniciales: ''
})

const tareas = ref([
  { 
    id: 1, 
    titulo: 'Entrevista Candidato', 
    fecha: '03/09/2025', 
    completada: true,
    creadoPor: { nombre: 'José Javier Torres', iniciales: 'JT' },
    asignadoA: { nombre: 'Daniel Hernández', iniciales: 'DH' }
  },
  { 
    id: 2, 
    titulo: 'Test de habilidades', 
    fecha: '05/09/2025', 
    completada: true,
    creadoPor: { nombre: 'José Javier Torres', iniciales: 'JT' },
    asignadoA: { nombre: 'Daniel Hernández', iniciales: 'DH' }
  },
  { 
    id: 3, 
    titulo: 'Ver CV y descripción de puesto', 
    fecha: '07/09/2025', 
    completada: true,
    creadoPor: { nombre: 'José Javier Torres', iniciales: 'JT' },
    asignadoA: { nombre: 'Daniel Hernández', iniciales: 'DH' }
  },
  { 
    id: 4, 
    titulo: 'Preparar ejercicio práctico', 
    fecha: '09/09/2025', 
    completada: false,
    creadoPor: { nombre: 'José Javier Torres', iniciales: 'JT' },
    asignadoA: { nombre: 'Daniel Hernández', iniciales: 'DH' }
  },
  { 
    id: 5, 
    titulo: 'Agenda entrevista telefónica', 
    fecha: '11/09/2025', 
    completada: false,
    creadoPor: { nombre: 'José Javier Torres', iniciales: 'JT' },
    asignadoA: { nombre: 'Daniel Hernández', iniciales: 'DH' }
  },
  { 
    id: 6, 
    titulo: 'Agendar entrevista', 
    fecha: '13/09/2025', 
    completada: false,
    creadoPor: { nombre: 'José Javier Torres', iniciales: 'JT' },
    asignadoA: { nombre: 'Daniel Hernández', iniciales: 'DH' }
  },
  { 
    id: 7, 
    titulo: 'Reunión cultura empresarial', 
    fecha: '15/09/2025', 
    completada: false,
    creadoPor: { nombre: 'José Javier Torres', iniciales: 'JT' },
    asignadoA: { nombre: 'Daniel Hernández', iniciales: 'DH' }
  }
])

// Computed property para filtrar las tareas
const tareasFiltradas = computed(() => {
  if (filtroActivo.value === 'TODAS') {
    return tareas.value
  } else if (filtroActivo.value === 'COMPLETADAS') {
    return tareas.value.filter(t => t.completada)
  } else { // ABIERTAS
    return tareas.value.filter(t => !t.completada)
  }
})

// Función para marcar/desmarcar una tarea como completada
const toggleTarea = (id) => {
  const tarea = tareas.value.find(t => t.id === id)
  if (tarea) {
    tarea.completada = !tarea.completada
  }
}

// Función para agregar nueva tarea
const agregarTarea = () => {
  if (!nuevaTarea.value.titulo || !nuevaTarea.value.fecha) {
    alert('Por favor completa al menos el título y la fecha')
    return
  }

  const nuevaId = Math.max(...tareas.value.map(t => t.id)) + 1
  
  tareas.value.push({
    id: nuevaId,
    titulo: nuevaTarea.value.titulo,
    fecha: formatearFecha(nuevaTarea.value.fecha),
    completada: false,
    creadoPor: { 
      nombre: 'José Javier Torres', 
      iniciales: 'JT' 
    },
    asignadoA: { 
      nombre: nuevaTarea.value.asignadoNombre || 'Daniel Hernández', 
      iniciales: nuevaTarea.value.asignadoIniciales || 'DH' 
    }
  })

  cerrarModal()
}

// Función para cerrar el modal y limpiar el formulario
const cerrarModal = () => {
  mostrarModal.value = false
  nuevaTarea.value = {
    titulo: '',
    fecha: '',
    asignadoNombre: '',
    asignadoIniciales: ''
  }
}

// Función para formatear la fecha
const formatearFecha = (fecha) => {
  const date = new Date(fecha)
  const dia = String(date.getDate()).padStart(2, '0')
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  const año = date.getFullYear()
  return `${dia}/${mes}/${año}`
}
</script>

<style scoped>
.contratos-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.card-inner {
  width: 100%;
}

.tareas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.btn-nueva {
  background: #06B6D4;
  color: white;
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-nueva:hover {
  background: #0891B2;
}

.filter-tabs {
  display: flex;
  gap: 4px;
}

.filter-tab {
  padding: 8px 20px;
  border: none;
  background: transparent;
  color: #6B7280;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s;
}

.filter-tab.active {
  color: #06B6D4;
  background: #F0F9FF;
}

.filter-tab:hover {
  background: #F3F4F6;
}

.tareas-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tarea-item {
  display: grid;
  grid-template-columns: 32px 1fr auto 40px;
  gap: 16px;
  align-items: start;
  padding: 16px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  transition: all 0.2s;
}

.tarea-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tarea-check {
  padding-top: 2px;
}

.checkbox {
  width: 28px;
  height: 28px;
  border: 2px solid #D1D5DB;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: white;
  transition: all 0.2s;
}

.checkbox.checked {
  background: #10B981;
  border-color: #10B981;
}

.checkbox:hover {
  border-color: #10B981;
}

.checkbox svg {
  width: 16px;
  height: 16px;
}

.tarea-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tarea-title {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #111827;
}

.tarea-fecha {
  font-size: 0.8125rem;
  color: #6B7280;
}

.tarea-meta {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  min-width: 280px;
}

.meta-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 0.6875rem;
  color: #9CA3AF;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.05em;
}

.meta-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #3B82F6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.user-avatar.yellow {
  background: #F59E0B;
}

.user-name {
  font-size: 0.8125rem;
  color: #374151;
  font-weight: 500;
}

.tarea-actions {
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
}

.btn-menu {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #9CA3AF;
  cursor: pointer;
  font-size: 1.25rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-menu:hover {
  background: #F3F4F6;
  color: #6B7280;
}

/* Modal styles */
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
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #E5E7EB;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #6B7280;
  cursor: pointer;
  font-size: 1.75rem;
  line-height: 1;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: #F3F4F6;
  color: #111827;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #111827;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #06B6D4;
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
}

.form-input::placeholder {
  color: #9CA3AF;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #E5E7EB;
}

.btn-cancel {
  padding: 10px 20px;
  border: 1px solid #D1D5DB;
  background: white;
  color: #374151;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #F9FAFB;
  border-color: #9CA3AF;
}

.btn-save {
  padding: 10px 20px;
  border: none;
  background: #06B6D4;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-save:hover {
  background: #0891B2;
}
</style>
