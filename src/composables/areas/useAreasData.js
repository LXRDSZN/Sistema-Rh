/**
 * ============================================
 * COMPOSABLE - useAreasData
 * ============================================
 * Gestiona el estado y datos de empleados del módulo de áreas
 * Incluye datos, estado de UI y métodos CRUD
 */

import { ref } from 'vue';
import { EMPLEADOS_MOCK } from '@/constants/areas';

export function useAreasData() {
  // ============================================
  // STATE - Datos de Empleados
  // ============================================
  const empleados = ref(EMPLEADOS_MOCK);

  // ============================================
  // STATE - UI State
  // ============================================
  const modalAbierto = ref(false);
  const empleadoSeleccionado = ref(null);

  // ============================================
  // METHODS - Modal de Edición
  // ============================================
  
  /**
   * Abre el modal de edición con los datos del empleado seleccionado
   */
  const abrirModal = (empleado) => {
    empleadoSeleccionado.value = { ...empleado };
    modalAbierto.value = true;
  };

  /**
   * Cierra el modal de edición y limpia el empleado seleccionado
   */
  const cerrarModal = () => {
    modalAbierto.value = false;
    empleadoSeleccionado.value = null;
  };

  /**
   * Actualiza el departamento del empleado seleccionado
   */
  const actualizarDepartamento = (departamento) => {
    if (empleadoSeleccionado.value) {
      empleadoSeleccionado.value.departamento = departamento;
    }
  };

  /**
   * Actualiza el título del empleado seleccionado
   */
  const actualizarTitulo = (titulo) => {
    if (empleadoSeleccionado.value) {
      empleadoSeleccionado.value.titulo = titulo;
    }
  };

  /**
   * Actualiza la categoría del empleado seleccionado
   */
  const actualizarCategoria = (categoria) => {
    if (empleadoSeleccionado.value) {
      empleadoSeleccionado.value.categoria = categoria;
    }
  };

  /**
   * Guarda los cambios del empleado editado
   * TODO: Implementar llamada a API
   */
  const guardarCambios = () => {
    if (empleadoSeleccionado.value) {
      const index = empleados.value.findIndex(
        emp => emp.id === empleadoSeleccionado.value.id
      );
      
      if (index !== -1) {
        empleados.value[index] = { ...empleadoSeleccionado.value };
      }
      
      cerrarModal();
    }
  };

  // ============================================
  // RETURN - Public API
  // ============================================
  return {
    // Data
    empleados,
    
    // UI State
    modalAbierto,
    empleadoSeleccionado,
    
    // Methods
    abrirModal,
    cerrarModal,
    actualizarDepartamento,
    actualizarTitulo,
    actualizarCategoria,
    guardarCambios
  };
}
