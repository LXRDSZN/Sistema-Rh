<!-- 
  ============================================
  COMPONENT - AreasHeader
  ============================================
  Header del módulo de áreas con:
  - Dropdown de selección de área
  - Búsqueda de empleados
  - Botón de registrar incidencia
-->

<template>
  <div class="areas-header">
    <!-- Dropdown de Áreas -->
    <div class="filter-dropdown">
      <button class="dropdown-btn" @click="toggleAreaDropdown">
        {{ areaSeleccionada }}
        <span class="material-symbols-rounded">expand_more</span>
      </button>
      <div v-if="areaDropdownAbierto" class="area-dropdown-menu">
        <button 
          class="area-dropdown-item"
          :class="{ active: areaSeleccionada === 'Todas las Áreas' }"
          @click="seleccionarArea('Todas las Áreas')"
        >
          Todas las Áreas
        </button>
        <div class="dropdown-divider"></div>
        <button 
          v-for="dept in departamentos" 
          :key="dept"
          class="area-dropdown-item"
          :class="{ active: areaSeleccionada === dept }"
          @click="seleccionarArea(dept)"
        >
          {{ dept }}
        </button>
      </div>
    </div>

    <!-- Búsqueda -->
    <div class="search-container">
      <input 
        type="text" 
        :value="busqueda"
        @input="$emit('update:busqueda', $event.target.value)"
        placeholder="Buscar Empleado"
        class="search-input"
      />
      <span class="material-symbols-rounded search-icon">search</span>
    </div>

    <!-- Botón de Registrar -->
    <button class="register-btn"  @click="abrirModal">
      <span class="material-symbols-rounded">lock</span>
      Registrar incidencia
    </button>

    <!-- Mostrar el formulario como modal -->
    <IncidenciasFormulario
      v-if="mostrarModal"
      @cerrar="cerrarModal"
    />

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { DEPARTAMENTOS } from '@/constants/areas';
// Importar el componente del formulario de incidencias
import IncidenciasFormulario from '@/components/Incidencias/Incidencias-Formulario.vue';

// ============================================
// PROPS
// ============================================
defineProps({
  areaSeleccionada: String,
  busqueda: String,
  areaDropdownAbierto: Boolean,
  departamentos: {
    type: Array,
    default: () => DEPARTAMENTOS
  }
});

// ============================================
// EMITS
// ============================================
const emit = defineEmits([
  'update:areaSeleccionada',
  'update:busqueda',
  'toggleAreaDropdown',
  'seleccionarArea'
]);

// ============================================
// METHODS
// ============================================
const toggleAreaDropdown = () => {
  emit('toggleAreaDropdown');
};

const seleccionarArea = (area) => {
  emit('seleccionarArea', area);
};

// No mostrar el formulario registrar incidencias por defecto
const mostrarModal = ref(false);

// Abre el formulario registrar incidencias
const abrirModal = () => {
  mostrarModal.value = true; // ahora el modal se muestra
};

// Oculta el formulario registrar incidencias
const cerrarModal = () => {
  mostrarModal.value = false; // ahora el modal se oculta
};

</script>

<style scoped>
/* ============================================
   AREAS HEADER
   ============================================ */
.areas-header {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

/* Dropdown de Áreas */
.filter-dropdown {
  position: relative;
}

.dropdown-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #F3F4F6;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.dropdown-btn:hover {
  background: #E5E7EB;
  border-color: #9CA3AF;
}

.area-dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 10;
  overflow: hidden;
}

.area-dropdown-item {
  width: 100%;
  padding: 0.75rem 1rem;
  background: white;
  border: none;
  text-align: left;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: background 0.2s;
}

.area-dropdown-item:hover {
  background: #F3F4F6;
}

.area-dropdown-item.active {
  background: #EEF2FF;
  color: #4F46E5;
  font-weight: 500;
}

.dropdown-divider {
  height: 1px;
  background: #E5E7EB;
  margin: 0.25rem 0;
}

/* Búsqueda */
.search-container {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #6B7280;
  transition: all 0.2s;
}

.search-input::placeholder {
  color: #9CA3AF;
}

.search-input:focus {
  outline: none;
  background: white;
  border-color: #D1D5DB;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
  font-size: 1.25rem;
  pointer-events: none;
}

/* Botón de Registrar */
.register-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #F3F4F6;
  color: #6B7280;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.register-btn:hover {
  background: #E5E7EB;
  border-color: #9CA3AF;
}

.register-btn .material-symbols-rounded {
  font-size: 1.125rem;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 1024px) {
  .areas-header {
    flex-wrap: wrap;
  }
  
  .search-container {
    max-width: 100%;
    order: 3;
    flex-basis: 100%;
  }
}

@media (max-width: 768px) {
  .register-btn span {
    display: none;
  }
  
  .register-btn {
    padding: 0.625rem;
  }
}
</style>
