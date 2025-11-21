<!-- 
  ============================================
  COMPONENT - AreasTable
  ============================================
  Tabla de empleados con:
  - Listado de empleados
  - Botón de editar por empleado
  - Header con título y botón de exportar
-->

<template>
  <div class="table-section">
    <!-- Header de la Tabla -->
    <div class="table-header">
      <h2>Gestión de empleados</h2>
      <div class="table-actions">
        <slot name="filters"></slot>
        
        <button class="export-btn" @click="exportar">
          <span class="material-symbols-rounded">upload</span>
          Exportar
        </button>
      </div>
    </div>

    <!-- Tabla -->
    <div class="table-wrapper">
      <table class="employees-table">
        <thead>
          <tr>
            <th>Nombre(s)</th>
            <th>Dept</th>
            <th>Título de trabajo</th>
            <th>Fecha de inicio</th>
            <th>Categoría</th>
            <th>Género</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="empleado in empleados" :key="empleado.id">
            <td>{{ empleado.nombre }}</td>
            <td>{{ empleado.departamento }}</td>
            <td>{{ empleado.titulo }}</td>
            <td>{{ empleado.fechaInicio }}</td>
            <td>{{ empleado.categoria }}</td>
            <td>{{ empleado.genero }}</td>
            <td>
              <button 
                v-if="mostrarBotonAcciones(empleado)"
                class="action-btn" 
                @click="editar(empleado)"
              >
                Acciones
                <span class="material-symbols-rounded">settings</span>
              </button>
              <button
                v-else-if="esJefeModulo()"
                class="action-btn disabled"
                disabled
                title="No tienes permisos para usar esto"
              >
                Acciones
                <span class="material-symbols-rounded">settings</span>
              </button>
              <span v-else class="no-action">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
// ============================================
// PROPS
// ============================================
const props = defineProps({
  empleados: {
    type: Array,
    required: true
  },
  userRole: {
    type: [String, Object],
    required: true
  },
  userData: {
    type: [Object, null],
    default: null
  }
});

// ============================================
// EMITS
// ============================================
const emit = defineEmits(['editar', 'exportar']);

// ============================================
// METHODS
// ============================================
const editar = (empleado) => {
  emit('editar', empleado);
};

const exportar = () => {
  emit('exportar');
};

// ============================================
// PERMISOS - Visibilidad del botón de acciones
// ============================================
const obtenerRol = () => {
  return typeof props.userRole === 'object' ? props.userRole.value : props.userRole;
};

const obtenerArea = () => {
  if (!props.userData) return null;
  return typeof props.userData === 'object' && props.userData.value ? props.userData.value.area : props.userData?.area;
};

const esJefeModulo = () => {
  const rol = obtenerRol();
  if (!rol) return false;
  const rolesJefesModulo = ['JEFE_ASISTENCIAS', 'JEFE_CONTRATOS', 'JEFE_VACACIONES', 'JEFE_INCIDENCIAS'];
  return rolesJefesModulo.includes(rol);
};

const esEmpleadoRegular = (empleado) => {
  // Permitir el botón de acciones para todos los títulos excepto los que incluyan 'JEFE'
  // Puedes ajustar la lógica si tienes una lista específica de títulos a excluir
  return !/JEFE/i.test(empleado.titulo);
};

const mostrarBotonAcciones = (empleado) => {
  const rol = obtenerRol();
  const area = obtenerArea();
  
  // Si no hay usuario autenticado o userData es null, no mostrar botones
  if (!rol || !props.userData) return false;
  
  // Debug: Ver qué valores estamos comparando (solo primera vez)
  if (props.empleados.length > 0 && empleado === props.empleados[0]) {
    console.log('🔍 Debug AreasTable:', {
      rol: rol,
      area: area,
      userData: props.userData,
      userRole: props.userRole,
      primerEmpleado: empleado.nombre,
      primerEmpleadoDept: empleado.departamento
    });
  }
  
  // EMPLEADO: No puede usar el botón de acciones
  if (rol === 'EMPLEADO') return false;
  
  // ADMIN o JEFE_RH: Pueden usar el botón para todos
  if (rol === 'ADMIN' || rol === 'JEFE_RH') return true;
  
  // JEFE_AREA y Jefes de módulos: Solo pueden usar el botón para empleados (no jefes) de su área
  if (rol === 'JEFE_AREA' || esJefeModulo()) {
    return empleado.departamento === area && esEmpleadoRegular(empleado);
  }
  
  // Otros roles: No mostrar
  return false;
};
</script>

<style scoped>
/* ============================================
   TABLE SECTION
   ============================================ */
.table-section {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Header de la Tabla */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #E5E7EB;
}

.table-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.table-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

/* Botón de Exportar */
.export-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.export-btn:hover {
  background: #F3F4F6;
  border-color: #D1D5DB;
}

.export-btn .material-symbols-rounded {
  font-size: 1.125rem;
}

/* Wrapper de la Tabla */
.table-wrapper {
  overflow-x: auto;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
}

.table-wrapper::-webkit-scrollbar {
  height: 8px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #F3F4F6;
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}

/* Tabla */
.employees-table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
}

.employees-table thead {
  background: #F9FAFB;
}

.employees-table th {
  padding: 0.75rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #E5E7EB;
}

.employees-table td {
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  color: #374151;
  border-bottom: 1px solid #F3F4F6;
}

.employees-table tbody tr:hover {
  background: #F9FAFB;
}

.employees-table tbody tr:last-child td {
  border-bottom: none;
}

/* Botón de Acción */
.action-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  background: #818CF8;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.action-btn:hover {
  background: #6366F1;
}

.action-btn .material-symbols-rounded {
  font-size: 1.125rem;
}

.action-btn.disabled {
  background: #D1D5DB;
  color: #9CA3AF;
  cursor: not-allowed;
  opacity: 0.6;
}

.action-btn.disabled:hover {
  background: #D1D5DB;
}

.no-action {
  color: #D1D5DB;
  font-size: 1rem;
  text-align: center;
  display: block;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 1440px) {
  .table-section {
    margin: 0 -0.5rem;
  }
}

@media (max-width: 1024px) {
  .employees-table {
    min-width: 800px;
  }
  
  .employees-table th,
  .employees-table td {
    padding: 0.75rem 1rem;
    font-size: 0.8125rem;
  }
}

@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .table-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .employees-table {
    min-width: 700px;
  }

  .employees-table th,
  .employees-table td {
    padding: 0.75rem;
    font-size: 0.75rem;
  }

  .export-btn span {
    display: none;
  }
  
  .action-btn {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
  }
}
</style>
