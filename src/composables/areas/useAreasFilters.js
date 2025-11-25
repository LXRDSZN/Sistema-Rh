/**
 * ============================================
 * COMPOSABLE - useAreasFilters
 * ============================================
 * Gestiona el estado y lógica de filtrado para el módulo de áreas
 * Incluye filtros por área, título y búsqueda
 */

import { ref, computed } from 'vue';
import { DEPARTAMENTOS } from '@/constants/areas';

export function useAreasFilters(empleados) {
  // ============================================
  // STATE - Filtros
  // ============================================
  const areaSeleccionada = ref('Todas las Áreas');
  const busqueda = ref('');
  const filtrosTitulo = ref([]);
  const filtrosGenero = ref([]);

  // ============================================
  // STATE - UI State
  // ============================================
  const areaDropdownAbierto = ref(false);
  const filtrosAbiertos = ref(false);

  // ============================================
  // COMPUTED - Empleados Filtrados
  // ============================================
  
  /**
   * Aplica todos los filtros activos a la lista de empleados
   */
  const empleadosFiltrados = computed(() => {
    let filtrados = empleados.value;
    
    // Filtrar por área seleccionada
    if (areaSeleccionada.value !== 'Todas las Áreas') {
      filtrados = filtrados.filter(emp => emp.departamento === areaSeleccionada.value);
    }
    
    // Filtrar por título
    if (filtrosTitulo.value.length > 0) {
      filtrados = filtrados.filter(emp => filtrosTitulo.value.includes(emp.titulo));
    }
    
    // Filtrar por género
    if (filtrosGenero.value.length > 0) {
      filtrados = filtrados.filter(emp => filtrosGenero.value.includes(emp.genero));
    }
    
    // Filtrar por búsqueda (nombre)
    if (busqueda.value.trim() !== '') {
      const searchLower = busqueda.value.toLowerCase();
      filtrados = filtrados.filter(emp => 
        emp.nombre.toLowerCase().includes(searchLower)
      );
    }
    
    return filtrados;
  });

  // ============================================
  // METHODS - Dropdown de Áreas
  // ============================================
  
  /**
   * Alterna la visibilidad del dropdown de áreas
   */
  const toggleAreaDropdown = () => {
    areaDropdownAbierto.value = !areaDropdownAbierto.value;
  };

  /**
   * Selecciona un área y cierra el dropdown
   */
  const seleccionarArea = (area) => {
    areaSeleccionada.value = area;
    areaDropdownAbierto.value = false;
  };

  // ============================================
  // METHODS - Panel de Filtros
  // ============================================
  
  /**
   * Alterna la visibilidad del panel de filtros
   */
  const toggleFiltros = () => {
    filtrosAbiertos.value = !filtrosAbiertos.value;
  };

  /**
   * Cierra el panel de filtros
   */
  const cerrarFiltros = () => {
    filtrosAbiertos.value = false;
  };

  /**
   * Alterna un filtro de título
   */
  const toggleFiltroTitulo = (titulo) => {
    const index = filtrosTitulo.value.indexOf(titulo);
    if (index > -1) {
      filtrosTitulo.value.splice(index, 1);
    } else {
      filtrosTitulo.value.push(titulo);
    }
  };

  /**
   * Alterna un filtro de género
   */
  const toggleFiltroGenero = (genero) => {
    const index = filtrosGenero.value.indexOf(genero);
    if (index > -1) {
      filtrosGenero.value.splice(index, 1);
    } else {
      filtrosGenero.value.push(genero);
    }
  };

  /**
   * Limpia todos los filtros activos
   */
  const limpiarFiltros = () => {
    filtrosTitulo.value = [];
    filtrosGenero.value = [];
    busqueda.value = '';
    areaSeleccionada.value = 'Todas las Áreas';
  };

  /**
   * Aplica los filtros y cierra el panel
   */
  const aplicarFiltros = () => {
    filtrosAbiertos.value = false;
  };

  // ============================================
  // RETURN - Public API
  // ============================================
  return {
    // State - Filtros
    areaSeleccionada,
    busqueda,
    filtrosTitulo,
    filtrosGenero,
    
    // State - UI
    areaDropdownAbierto,
    filtrosAbiertos,
    
    // Computed
    empleadosFiltrados,
    
    // Methods - Dropdown
    toggleAreaDropdown,
    seleccionarArea,
    
    // Methods - Filtros
    toggleFiltros,
    cerrarFiltros,
    toggleFiltroTitulo,
    toggleFiltroGenero,
    limpiarFiltros,
    aplicarFiltros
  };
}
