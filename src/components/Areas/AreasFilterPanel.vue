<!-- 
  ============================================
  COMPONENT - AreasFilterPanel
  ============================================
  Panel lateral de filtros con checkboxes para:
  - Título de trabajo
  - Categoría
  - Género
-->

<template>
  <div class="filter-panel-container">
    <!-- Botón de Filtros -->
    <button class="filter-icon-btn" @click="toggleFiltros" ref="filterButton">
      <span class="material-symbols-rounded">filter_list</span>
    </button>
    
    <!-- Panel de Filtros -->
    <div v-if="filtrosAbiertos" class="filters-panel" :style="panelPosition">
      <div class="filters-header">
        <h4>Filtros</h4>
        <button class="clear-filters-btn" @click="limpiarFiltros">
          Limpiar
        </button>
      </div>
      
      <!-- Filtro de Título -->
      <div class="filter-group">
        <label class="filter-label">Título de trabajo</label>
        <div class="filter-checkboxes">
          <label v-for="titulo in titulos" :key="titulo" class="checkbox-label">
            <input 
              type="checkbox" 
              :value="titulo"
              :checked="filtrosTitulo.includes(titulo)"
              @change="toggleFiltroTitulo(titulo)"
              class="checkbox-input"
            />
            <span>{{ titulo }}</span>
          </label>
        </div>
      </div>
      
      <!-- Filtro de Categoría -->
      <div class="filter-group">
        <label class="filter-label">Categoría</label>
        <div class="filter-checkboxes">
          <label v-for="cat in categorias" :key="cat" class="checkbox-label">
            <input 
              type="checkbox" 
              :value="cat"
              :checked="filtrosCategoria.includes(cat)"
              @change="toggleFiltroCategoria(cat)"
              class="checkbox-input"
            />
            <span>{{ cat }}</span>
          </label>
        </div>
      </div>
      
      <!-- Filtro de Género -->
      <div class="filter-group">
        <label class="filter-label">Género</label>
        <div class="filter-checkboxes">
          <label v-for="gen in generos" :key="gen" class="checkbox-label">
            <input 
              type="checkbox" 
              :value="gen"
              :checked="filtrosGenero.includes(gen)"
              @change="toggleFiltroGenero(gen)"
              class="checkbox-input"
            />
            <span>{{ gen }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { TITULOS, CATEGORIAS, GENEROS } from '@/constants/areas';

// ============================================
// REFS
// ============================================
const filterButton = ref(null);

// ============================================
// PROPS
// ============================================
const props = defineProps({
  filtrosAbiertos: Boolean,
  filtrosTitulo: Array,
  filtrosCategoria: Array,
  filtrosGenero: Array,
  titulos: {
    type: Array,
    default: () => TITULOS
  },
  categorias: {
    type: Array,
    default: () => CATEGORIAS
  },
  generos: {
    type: Array,
    default: () => GENEROS
  }
});

// ============================================
// COMPUTED
// ============================================
const panelPosition = computed(() => {
  if (!filterButton.value) return {};
  
  const rect = filterButton.value.getBoundingClientRect();
  return {
    top: `${rect.bottom + 8}px`,
    right: `${window.innerWidth - rect.right}px`
  };
});

// ============================================
// EMITS
// ============================================
const emit = defineEmits([
  'toggleFiltros',
  'toggleFiltroTitulo',
  'toggleFiltroCategoria',
  'toggleFiltroGenero',
  'limpiarFiltros'
]);

// ============================================
// METHODS
// ============================================
const toggleFiltros = () => {
  emit('toggleFiltros');
};

const toggleFiltroTitulo = (titulo) => {
  emit('toggleFiltroTitulo', titulo);
};

const toggleFiltroCategoria = (categoria) => {
  emit('toggleFiltroCategoria', categoria);
};

const toggleFiltroGenero = (genero) => {
  emit('toggleFiltroGenero', genero);
};

const limpiarFiltros = () => {
  emit('limpiarFiltros');
};
</script>

<style scoped>
/* ============================================
   FILTER PANEL CONTAINER
   ============================================ */
.filter-panel-container {
  position: relative;
}

/* Botón de Filtros */
.filter-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-icon-btn:hover {
  background: #F3F4F6;
  border-color: #D1D5DB;
}

.filter-icon-btn .material-symbols-rounded {
  font-size: 1.25rem;
  color: #6B7280;
}

/* Panel de Filtros */
.filters-panel {
  position: fixed;
  top: auto;
  right: 2rem;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  min-width: 250px;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 20;
}

/* Header del Panel */
.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #E5E7EB;
}

.filters-header h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.clear-filters-btn {
  background: none;
  border: none;
  color: #818CF8;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}

.clear-filters-btn:hover {
  color: #6366F1;
}

/* Grupos de Filtros */
.filter-group {
  margin-bottom: 1rem;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 0.5rem;
}

.filter-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Checkboxes */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: color 0.2s;
}

.checkbox-label:hover {
  color: #111827;
}

.checkbox-input {
  width: 1rem;
  height: 1rem;
  border: 1.5px solid #D1D5DB;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.checkbox-input:checked {
  background-color: #818CF8;
  border-color: #818CF8;
}

.checkbox-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.1);
}
</style>
