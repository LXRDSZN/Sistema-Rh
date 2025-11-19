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
      <DetalleAspirante v-if="activeTab === 'detalleAspirante' && aspiranteSeleccionado"
        :persona-id="aspiranteSeleccionado.id || aspiranteSeleccionado.persona_id" @cerrar="activeTab = 'inicio'" />

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
      <EnlaceEstadisticas v-else-if="activeTab === 'estadisticas'" :stats="{ activos: stats.activos, vacantes: 18 }"
        :departamentos="['RRHH', 'Finanzas', 'Operaciones', 'TI', 'Marketing']" @volver-inicio="activeTab = 'inicio'" />

      <!-- Vista de Crear Contrato -->
      <EnlaceCrearContrato v-else-if="activeTab === 'crear'" @volver-inicio="activeTab = 'inicio'" />

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
const { contentMarginLeft, contentWidth } = useSidebar();

// Estados reactivos
const stats = ref({
  activos: 0,
  proximosVencer: 0,
  vencidos: 0,
  enProceso: 0
});

const contratos = ref([]);
const loading = ref(false);

// Composable para API
const {
  obtenerEstadisticas,
  obtenerEmpleadosDestacados,
  obtenerAspirantesDestacados
} = useContratos();

// Función para manejar incidencia creada
const onIncidenciaCreada = () => {
  showSuccess.value = true;
  showIncidencia.value = false;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

// Detectar la ruta y cambiar el activeTab
const updateTabFromRoute = () => {
  if (route.path === '/Contratos/estadisticas') {
    activeTab.value = 'estadisticas';
  } else if (route.path === '/Contratos/crear') {
    activeTab.value = 'crear';
  } else if (route.path === '/Contratos/registro-huellas') {
    activeTab.value = 'registro-huellas';
  }
  else if (route.path === '/Contratos/historial') {
    activeTab.value = 'historial';
  }
  else {
    activeTab.value = 'inicio';
  }
};

// Función para volver al inicio
const volverInicio = () => {
  router.push('/Contratos');
};

// Función para cargar datos de la API
const cargarDatos = async () => {
  loading.value = true;
  try {
    // Cargar estadísticas
    stats.value = await obtenerEstadisticas();

    // Cargar empleados y aspirantes destacados
    const [empleados, aspirantes] = await Promise.all([
      obtenerEmpleadosDestacados(),
      obtenerAspirantesDestacados()
    ]);

    // Combinar empleados y aspirantes
    contratos.value = [...empleados, ...aspirantes];

  } catch (error) {
    console.error('Error al cargar datos:', error);
    alert('Error al cargar datos del dashboard');
  } finally {
    loading.value = false;
  }
};



// Métodos para manejar eventos
const handleCrearContrato = () => {
  activeTab.value = 'crear';
};

// Método para manejar revisión de contrato
const handleRevisarContrato = (contrato) => {
  console.log('Revisar contrato:', contrato);

  // Normalizar tipo
  const tipo = (contrato.tipo || '').toLowerCase().trim();

  // Verificar el tipo de contrato y redirigir al componente adecuado
  if (tipo === 'empleado') {
    empleadoSeleccionado.value = contrato;
    activeTab.value = 'detalleEmpleado';
  } else if (tipo === 'aspirante') {
    // Verificar que el contrato tenga un ID válido
    if (!contrato.id && !contrato.persona_id) {
      console.error('El aspirante no tiene ID:', contrato);
      alert('Error: No se puede cargar el aspirante (falta ID)');
      return;
    }

    // Guardar el objeto completo (lo necesitamos para tener el ID)
    aspiranteSeleccionado.value = contrato;
    activeTab.value = 'detalleAspirante';
  }
};

// Función para manejar la renovación de contrato
const handleRenovarContrato = () => {
  activeTab.value = 'crear';
};

// Método para cambiar de vista desde las tarjetas de estadísticas
const cambiarVista = (vista) => {
  activeTab.value = vista;
  // Los datos ya están cargados y los computed properties se encargan del filtro
};

// Computed para historial
const contratosHistorico = computed(() =>
  contratos.value.filter(c =>
    c.estado_clase === 'terminado' ||
    c.estado_clase === 'cancelado' ||
    c.estado_clase === 'suspendido'
  )
);

// Método para manejar descarga de contrato
const handleDescargarContrato = async (contrato) => {
  console.log('Descargar contrato:', contrato);

  try {
    // Aquí puedes implementar la descarga del PDF
    // Por ejemplo, usando tu sistema S3
    alert(`Descargando contrato de ${contrato.nombre}`);
  } catch (error) {
    console.error('Error al descargar:', error);
    alert('Error al descargar el contrato');
  }
};


// Watch para cambios en la ruta
watch(() => route.path, () => {
  updateTabFromRoute();
}, { immediate: true });

// Al montar el componente
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
