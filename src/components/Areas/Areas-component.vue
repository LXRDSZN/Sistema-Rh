<!-- 
  ============================================
  COMPONENT - Areas (Main)
  ============================================
  Componente principal del módulo de gestión de áreas
  Orquesta todos los subcomponentes y composables
-->

<template>
  <div class="areas-content">
    <!-- Header con filtros y búsqueda -->
    <AreasHeader 
      :area-seleccionada="areaSeleccionada"
      v-model:busqueda="busqueda"
      :area-dropdown-abierto="areaDropdownAbierto"
      :departamentos="departamentos"
      @toggle-area-dropdown="toggleAreaDropdown"
      @seleccionar-area="seleccionarArea"
    />

    <!-- Tabla de empleados con filtros -->
    <AreasTable 
      :empleados="empleadosFiltrados"
      @editar="abrirModal"
      @exportar="() => exportarDatos(empleadosFiltrados)"
    >
      <template #filters>
        <AreasFilterPanel 
          :filtros-abiertos="filtrosAbiertos"
          :filtros-titulo="filtrosTitulo"
          :filtros-categoria="filtrosCategoria"
          :filtros-genero="filtrosGenero"
          :titulos="titulos"
          :categorias="categorias"
          :generos="generos"
          @toggle-filtros="toggleFiltros"
          @toggle-filtro-titulo="toggleFiltroTitulo"
          @toggle-filtro-categoria="toggleFiltroCategoria"
          @toggle-filtro-genero="toggleFiltroGenero"
          @limpiar-filtros="limpiarFiltros"
        />
      </template>
    </AreasTable>

    <!-- Modal de edición -->
    <EmployeeEditModal 
      :is-open="modalAbierto"
      :empleado="empleadoSeleccionado"
      :departamentos="departamentos"
      :titulos="titulos"
      :categorias="categorias"
      @cerrar="cerrarModal"
      @guardar="guardarCambios"
      @actualizar-departamento="actualizarDepartamento"
      @actualizar-titulo="actualizarTitulo"
      @actualizar-categoria="actualizarCategoria"
    />
  </div>
</template>

<script setup>
import { DEPARTAMENTOS, TITULOS, CATEGORIAS, GENEROS } from '@/constants/areas';
import { useAreasData } from '@/composables/areas/useAreasData';
import { useAreasFilters } from '@/composables/areas/useAreasFilters';
import { useAreasExport } from '@/composables/areas/useAreasExport';
import AreasHeader from './AreasHeader.vue';
import AreasTable from './AreasTable.vue';
import AreasFilterPanel from './AreasFilterPanel.vue';
import EmployeeEditModal from './EmployeeEditModal.vue';

// ============================================
// COMPOSABLES - Data Management
// ============================================
const {
  empleados,
  modalAbierto,
  empleadoSeleccionado,
  abrirModal,
  cerrarModal,
  actualizarDepartamento,
  actualizarTitulo,
  actualizarCategoria,
  guardarCambios
} = useAreasData();

// ============================================
// COMPOSABLES - Filters
// ============================================
const {
  areaSeleccionada,
  busqueda,
  filtrosTitulo,
  filtrosCategoria,
  filtrosGenero,
  areaDropdownAbierto,
  filtrosAbiertos,
  empleadosFiltrados,
  toggleAreaDropdown,
  seleccionarArea,
  toggleFiltros,
  toggleFiltroTitulo,
  toggleFiltroCategoria,
  toggleFiltroGenero,
  limpiarFiltros
} = useAreasFilters(empleados);

// ============================================
// COMPOSABLES - Export
// ============================================
const { exportarDatos } = useAreasExport();

// ============================================
// CONSTANTS
// ============================================
const departamentos = DEPARTAMENTOS;
const titulos = TITULOS;
const categorias = CATEGORIAS;
const generos = GENEROS;
</script>

<style scoped>
/* ============================================
   AREAS CONTENT CONTAINER
   ============================================ */
.areas-content {
  padding: 2rem;
  padding-left: 2rem;
  width: 100%;
  max-width: calc(100vw - 280px); /* Resta el ancho de la sidebar + margen */
  margin: 0 auto;
  box-sizing: border-box;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 1680px) {
  .areas-content {
    max-width: calc(100vw - 260px);
    padding: 1.5rem;
    padding-left: 1.5rem;
  }
}

@media (max-width: 1440px) {
  .areas-content {
    max-width: calc(100vw - 240px);
    padding: 1.5rem;
    padding-left: 1.5rem;
  }
}

@media (max-width: 1024px) {
  .areas-content {
    max-width: calc(100vw - 220px);
    padding: 1rem;
    padding-left: 1rem;
  }
}

@media (max-width: 768px) {
  .areas-content {
    max-width: 100%;
    padding: 1rem;
  }
}
</style>
