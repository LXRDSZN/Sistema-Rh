<template>
  <div class="contratos-content">
    <!-- Formulario de incidencias -->
    <IncidenciasFormulario v-if="showIncidencia" @cerrar="showIncidencia = false" />

    <!-- Vista de Inicio -->
    <EnlaceInicio v-if="activeTab === 'inicio'" :contratos="contratos" :stats="stats"
      @crear-contrato="handleCrearContrato" @revisar-contrato="handleRevisarContrato" @cambiar-vista="cambiarVista"
      @registrar-incidencia="showIncidencia = true" />

    <!-- Otras vistas -->
    <div v-else class="other-view">
      <!-- Detalle del Aspirante -->
      <DetalleAspirante v-if="activeTab === 'detalleAspirante'"
        :persona-id="aspiranteSeleccionado.id || aspiranteSeleccionado.persona_id" @cerrar="activeTab = 'inicio'"
        @crear-contrato="handleCrearContratoAspirante" />

      <!-- Detalle del Empleado -->
      <DetalleEmpleado v-else-if="activeTab === 'detalleEmpleado'" :empleado="empleadoSeleccionado"
        @cerrar="activeTab = 'inicio'" @renovar-contrato="handleRenovarContrato" />

      <!-- ✅ Sin pasar :contratos como prop -->
      <EnlaceActivos v-else-if="activeTab === 'activos'" @revisar-contrato="handleRevisarContrato"
        @volver-inicio="activeTab = 'inicio'" />

      <EnlaceAVencer v-else-if="activeTab === 'avencer'" @revisar-contrato="handleRevisarContrato"
        @volver-inicio="activeTab = 'inicio'" />

      <EnlaceVencidos v-else-if="activeTab === 'vencidos'" @revisar-contrato="handleRevisarContrato"
        @volver-inicio="activeTab = 'inicio'" />

      <EnlaceEnProceso v-else-if="activeTab === 'proceso'" @revisar-contrato="handleRevisarContrato"
        @volver-inicio="activeTab = 'inicio'" />

      <!-- Vista de estadísticas -->
      <EnlaceEstadisticas v-else-if="activeTab === 'estadisticas'" :stats="{ activos: stats.activos, vacantes: stats.enProceso }"
        :departamentos="['RRHH', 'Finanzas', 'Operaciones', 'TI', 'Marketing']" @volver-inicio="activeTab = 'inicio'" />

      <!-- Vista de Crear / Renovar Contrato -->
      <EnlaceCrearContrato v-if="activeTab === 'crear'"
        :datos-aspirante="modoContrato === 'aspirante-nuevo' ? aspiranteParaContrato : null"
        :datos-empleado="modoContrato === 'empleado-renovar' ? empleadoParaRenovar : null" :modo="modoContrato"
        @volver-inicio="volverInicio" />

      <!-- Vista de Registro de Solicitud -->
      <EnlaceRegistroSolicitud v-else-if="activeTab === 'registro'" @volver-inicio="activeTab = 'inicio'" />

      <!-- ✅ Agregar en el bloque de vistas -->
      <EnlaceHistorial v-else-if="activeTab === 'historial'" :contratos="contratosHistorico"
        @volver-inicio="activeTab = 'inicio'" @ver-contrato="handleRevisarContrato"
        @descargar-contrato="handleDescargarContrato" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSidebar } from '@/composables/useSidebar';
import { useContratos } from '@/composables/useContratos';
import { useAuth } from '@/composables/useAuth';
// =====================
// PERMISOS POR ROL
// =====================
const { userRole, isAdmin, isGerenteGeneral, isJefeArea } = useAuth();

const isJefeModulo = computed(() => {
  // Jefe de área o jefe de contratos tiene acceso total
  return [
    'JEFE_AREA',
    'JEFE_CONTRATOS',
    'JEFE_ASISTENCIAS',
    'JEFE_VACACIONES',
    'JEFE_INCIDENCIAS',
    'GERENTE_GENERAL',
    'ADMIN'
  ].includes(userRole.value);
});

const isEmpleado = computed(() => userRole.value === 'EMPLEADO');

// Ejemplo de uso en la lógica interna:
// if (isAdmin.value || isJefeModulo.value) { ... acceso total ... }
// if (isEmpleado.value) { ... acceso mínimo ... }

import EnlaceInicio from './EnlaceInicio.vue';
import EnlaceActivos from './EnlacesNavegacion/EnlaceActivos.vue';
import EnlaceAVencer from './EnlacesNavegacion/EnlaceAVencer.vue';
import EnlaceVencidos from './EnlacesNavegacion/EnlaceVencidos.vue';
import EnlaceEnProceso from './EnlacesNavegacion/EnlaceEnProceso.vue';
import EnlaceEstadisticas from './EnlacesNavegacion/EnlaceEstadisticas.vue';
import EnlaceCrearContrato from './EnlacesNavegacion/EnlaceCrearContrato.vue';
import EnlaceRegistroSolicitud from './EnlacesNavegacion/EnlaceRegistroSolicitud.vue';
import IncidenciasFormulario from '../Incidencias/Incidencias-Formulario.vue';
import DetalleAspirante from './DetalleAspiranteRefactored.vue';
import DetalleEmpleado from './DetalleEmpleadoCommon/DetalleEmpleado.vue';
import EnlaceHistorial from './EnlacesNavegacion/EnlaceHistorial.vue';

const route = useRoute();
const router = useRouter();

const activeTab = ref('inicio');
const showIncidencia = ref(false);

const aspiranteSeleccionado = ref(null);
const empleadoSeleccionado = ref(null);

const aspiranteParaContrato = ref(null);
const empleadoParaRenovar = ref(null);

// ⭐ aquí decides si el formulario es para un aspirante nuevo o renovar empleado
const modoContrato = ref('aspirante-nuevo'); // 'aspirante-nuevo' | 'empleado-renovar'

const { contentMarginLeft, contentWidth } = useSidebar();

const stats = ref({
  activos: 0,
  proximosVencer: 0,
  vencidos: 0,
  enProceso: 0
});

const contratos = ref([]);
const loading = ref(false);

const {
  obtenerEstadisticas,
  obtenerEmpleadosDestacados,
  obtenerAspirantesDestacados
} = useContratos();

const onIncidenciaCreada = () => {
  showSuccess.value = true;
  showIncidencia.value = false;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

const updateTabFromRoute = () => {
  if (route.path === '/Contratos/estadisticas') {
    activeTab.value = 'estadisticas';
  } else if (route.path === '/Contratos/crear') {
    activeTab.value = 'crear';
  } else if (route.path === '/Contratos/registro-huellas') {
    activeTab.value = 'registro-huellas';
  } else if (route.path === '/Contratos/historial') {
    activeTab.value = 'historial';
  } else {
    activeTab.value = 'inicio';
  }
};

// 🔹 Volver al inicio desde crear/renovar contrato
const volverInicio = async () => {
  activeTab.value = 'inicio';

  // ⭐ limpiar estados de contrato
  aspiranteParaContrato.value = null;
  empleadoParaRenovar.value = null;
  modoContrato.value = 'aspirante-nuevo';
  aspiranteSeleccionado.value = null;
  empleadoSeleccionado.value = null;

  if (route.path !== '/Contratos') {
    await router.push('/Contratos');
  }

  await cargarDatos();
};

const cargarDatos = async () => {
  loading.value = true;
  try {
    stats.value = await obtenerEstadisticas();

    const [empleados, aspirantes] = await Promise.all([
      obtenerEmpleadosDestacados(),
      obtenerAspirantesDestacados()
    ]);

    contratos.value = [...empleados, ...aspirantes];
  } catch (error) {
    console.error('Error al cargar datos:', error);
    alert('Error al cargar datos del dashboard');
  } finally {
    loading.value = false;
  }
};

const handleCrearContrato = () => {
  activeTab.value = 'crear';
};

// 🔹 Revisar tarjeta de la lista
const handleRevisarContrato = (contrato) => {
  // Empleado no puede ver detalle de otros empleados
  if (isEmpleado.value) {
    alert('No tienes permisos para ver los contratos de otros empleados.');
    activeTab.value = 'inicio';
    return;
  }
  console.log('Revisar contrato:', contrato);
  const tipo = (contrato.tipo || '').toLowerCase().trim();
  if (tipo === 'empleado') {
    empleadoSeleccionado.value = contrato;
    activeTab.value = 'detalleEmpleado';
  } else if (tipo === 'aspirante') {
    aspiranteSeleccionado.value = contrato;
    activeTab.value = 'detalleAspirante';
  }
};

// 🔹 Renovar contrato DESDE DetalleEmpleado
//    (asegúrate de llamar handleRenovarContrato(empleado) desde DetalleEmpleado)
const handleRenovarContrato = (empleado) => {
  // Empleado no puede renovar contratos
  if (isEmpleado.value) {
    alert('No tienes permisos para renovar contratos.');
    activeTab.value = 'inicio';
    return;
  }
  console.log('Renovar contrato de empleado:', empleado);
  empleadoParaRenovar.value = empleado;
  aspiranteParaContrato.value = null;
  modoContrato.value = 'empleado-renovar';      // ⭐ modo renovación
  activeTab.value = 'crear';
};

// 🔹 Crear contrato DESDE DetalleAspirante
const handleCrearContratoAspirante = (aspirante) => {
  console.log('Crear contrato para aspirante:', aspirante);

  aspiranteParaContrato.value = aspirante;
  empleadoParaRenovar.value = null;

  modoContrato.value = 'aspirante-nuevo';       // ⭐ modo aspirante nuevo
  activeTab.value = 'crear';
};

const cambiarVista = (vista) => {
  activeTab.value = vista;
};

const contratosHistorico = computed(() =>
  contratos.value.filter(c =>
    c.estado_clase === 'terminado' ||
    c.estado_clase === 'cancelado' ||
    c.estado_clase === 'suspendido'
  )
);

const handleDescargarContrato = async (contrato) => {
  console.log('Descargar contrato:', contrato);

  try {
    alert(`Descargando contrato de ${contrato.nombre}`);
  } catch (error) {
    console.error('Error al descargar:', error);
    alert('Error al descargar el contrato');
  }
};

watch(
  () => route.path,
  () => {
    updateTabFromRoute();
  },
  { immediate: true }
);

onMounted(async () => {
  updateTabFromRoute();
  await cargarDatos();
});
</script>



<style scoped>
.contratos-content {
  flex: 1;
  min-height: 100vh;
  background-color: #e0e0e0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow-x: hidden;
  padding: 2rem;
  transition: all 0.3s ease;
  margin-left: v-bind(contentMarginLeft);
  width: v-bind(contentWidth);
}

.other-view {
  background-color: transparent;
}

/* Animación de éxito */
.success-toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 9999;
  animation: slideIn 0.3s ease-out, slideOut 0.3s ease-out 2.7s forwards;
}

.success-content {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2);
  font-weight: 500;
}

@keyframes slideIn {
  0% {
    transform: translateX(400px);
    opacity: 0;
  }

  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  0% {
    transform: translateX(0);
    opacity: 1;
  }

  100% {
    transform: translateX(400px);
    opacity: 0;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .contratos-content {
    margin-left: 60px !important;
    width: calc(100vw - 60px) !important;
  }
}
</style>
