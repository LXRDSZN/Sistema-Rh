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
      :user-role="userRole"
      :user-data="user"
      @editar="abrirModal"
      @exportar="() => exportarDatos(empleadosFiltrados)"
    >
      <template #filters>
        <AreasFilterPanel 
          :filtros-abiertos="filtrosAbiertos"
          :filtros-titulo="filtrosTitulo"
          :filtros-genero="filtrosGenero"
          :titulos="titulos"
          :generos="generos"
          @toggle-filtros="toggleFiltros"
          @toggle-filtro-titulo="toggleFiltroTitulo"
          @toggle-filtro-genero="toggleFiltroGenero"
          @limpiar-filtros="limpiarFiltros"
          @cerrar-filtros="cerrarFiltros"
        />
      </template>
    </AreasTable>

    <!-- Modal de edición -->
    <EmployeeEditModal 
      :is-open="modalAbierto"
      :empleado="empleadoSeleccionado"
      :departamentos="areasOptions"
      :titulos="puestosOptions"
      @cerrar="cerrarModal"
      @guardar="guardarCambios"
      @actualizar-departamento="actualizarDepartamento"
      @actualizar-titulo="actualizarTitulo"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { GENEROS } from '@/constants/areas';
import { useAreasData } from '@/composables/areas/useAreasData';
import { useAreasFilters } from '@/composables/areas/useAreasFilters';
import { useAreasExport } from '@/composables/areas/useAreasExport';
import { useAuth } from '@/composables/useAuth';
import AreasHeader from './AreasHeader.vue';
import AreasTable from './AreasTable.vue';
import AreasFilterPanel from './AreasFilterPanel.vue';
import EmployeeEditModal from './EmployeeEditModal.vue';

// ============================================
// ROUTER
// ============================================
const router = useRouter();

// ============================================
// AUTH - Obtener rol y área del usuario actual
// ============================================
const { userRole, user, isAuthenticated, verifySession } = useAuth();

// Verificar sesión al entrar al componente
onMounted(async () => {
  const isValid = await verifySession();
  if (!isValid) {
    router.replace('/');
  }
});

// Solo redirigir si el usuario hace logout explícito (cambia de true a false)
watch(isAuthenticated, (newValue, oldValue) => {
  if (oldValue === true && newValue === false) {
    router.replace('/');
  }
});

// Debug: Verificar datos del usuario (solo si está autenticado)
if (user.value) {
  console.log('👤 Usuario actual:', user.value);
  console.log('💼 Rol:', userRole.value);
  console.log('🏛️ Área:', user.value?.area);
}

// ============================================
// COMPOSABLES - Data Management
// ============================================
const {
  empleados,
  areas,
  puestos,
  isLoading,
  error,
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
// COMPUTED - Options para dropdowns
// ============================================
const departamentos = computed(() => areas.value.map(a => a.nombre));
const areasOptions = computed(() => areas.value.map(a => a.nombre));
const puestosOptions = computed(() => puestos.value.map(p => p.nombre));
const titulos = puestosOptions;
const generos = GENEROS;

// ============================================
// COMPOSABLES - Filters
// ============================================
const {
  areaSeleccionada,
  busqueda,
  filtrosTitulo,
  filtrosGenero,
  areaDropdownAbierto,
  filtrosAbiertos,
  empleadosFiltrados,
  toggleAreaDropdown,
  seleccionarArea,
  toggleFiltros,
  cerrarFiltros,
  toggleFiltroTitulo,
  toggleFiltroGenero,
  limpiarFiltros
} = useAreasFilters(empleados);

// ============================================
// COMPOSABLES - Export
// ============================================
const { exportarDatos } = useAreasExport();
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
