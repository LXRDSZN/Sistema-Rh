/**
 * ============================================
 * COMPOSABLE - useAreasData
 * ============================================
 * Gestiona el estado y datos de empleados del módulo de áreas
 * Incluye datos, estado de UI y métodos CRUD conectados a la API
 */

import { ref, onMounted } from 'vue';
import { getEmpleados, updateEmpleadoAsignacion, getAreas, getPuestos } from '@/services/empleadosService';

export function useAreasData() {
  // ============================================
  // STATE - Datos de Empleados
  // ============================================
  const empleados = ref([]);
  const areas = ref([]);
  const puestos = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  // ============================================
  // STATE - UI State
  // ============================================
  const modalAbierto = ref(false);
  const empleadoSeleccionado = ref(null);

  // ============================================
  // METHODS - Cargar Datos
  // ============================================

  /**
   * Cargar empleados desde la API
   */
  const cargarEmpleados = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await getEmpleados();
      if (response.success) {
        empleados.value = response.data;
      }
    } catch (err) {
      error.value = 'Error al cargar empleados';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Cargar áreas desde la API
   */
  const cargarAreas = async () => {
    try {
      const response = await getAreas();
      if (response.success) {
        areas.value = response.data;
      }
    } catch (err) {
      console.error('Error al cargar áreas:', err);
    }
  };

  /**
   * Cargar puestos desde la API
   */
  const cargarPuestos = async () => {
    try {
      const response = await getPuestos();
      if (response.success) {
        puestos.value = response.data;
      }
    } catch (err) {
      console.error('Error al cargar puestos:', err);
    }
  };

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
      // Buscar el ID del área seleccionada
      const area = areas.value.find(a => a.nombre === departamento);
      if (area) {
        empleadoSeleccionado.value.area_id = area.id;
      }
    }
  };

  /**
   * Actualiza el título del empleado seleccionado
   */
  const actualizarTitulo = (titulo) => {
    if (empleadoSeleccionado.value) {
      empleadoSeleccionado.value.titulo = titulo;
      // Buscar el ID del puesto seleccionado
      const puesto = puestos.value.find(p => p.nombre === titulo);
      if (puesto) {
        empleadoSeleccionado.value.puesto_id = puesto.id;
      }
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
   * Hace una llamada a la API para actualizar los datos
   */
  const guardarCambios = async () => {
    if (!empleadoSeleccionado.value) return;
    
    isLoading.value = true;
    error.value = null;

    try {
      const asignacion = {
        area_id: empleadoSeleccionado.value.area_id,
        puesto_id: empleadoSeleccionado.value.puesto_id
      };

      const response = await updateEmpleadoAsignacion(
        empleadoSeleccionado.value.id,
        asignacion
      );

      if (response.success) {
        // Actualizar la lista local
        const index = empleados.value.findIndex(
          emp => emp.id === empleadoSeleccionado.value.id
        );
        
        if (index !== -1) {
          empleados.value[index] = { ...empleadoSeleccionado.value };
        }
        
        cerrarModal();
        // Recargar empleados para asegurar datos actualizados
        await cargarEmpleados();
      }
    } catch (err) {
      error.value = 'Error al guardar cambios';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  };

  // ============================================
  // LIFECYCLE - Cargar datos al montar
  // ============================================
  onMounted(() => {
    cargarEmpleados();
    cargarAreas();
    cargarPuestos();
  });

  // ============================================
  // RETURN - Public API
  // ============================================
  return {
    // Data
    empleados,
    areas,
    puestos,
    isLoading,
    error,
    
    // UI State
    modalAbierto,
    empleadoSeleccionado,
    
    // Methods
    cargarEmpleados,
    cargarAreas,
    cargarPuestos,
    abrirModal,
    cerrarModal,
    actualizarDepartamento,
    actualizarTitulo,
    actualizarCategoria,
    guardarCambios
  };
}
