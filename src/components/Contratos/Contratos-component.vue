<template>
  <div class="contratos-content">
    <!-- Formulario de incidencias -->
    <IncidenciasFormulario v-if="showIncidencia" @cerrar="showIncidencia = false"
      @incidencia-creada="onIncidenciaCreada" />

    <!-- Animación de éxito -->
    <div v-if="showSuccess" class="success-toast">
      <div class="success-content">✓ Incidencia registrada exitosamente</div>
    </div>

    <!-- Vista de Inicio (usando componente EnlaceInicio) -->
    <EnlaceInicio v-if="activeTab === 'inicio'" :contratos="contratos" :stats="stats"
      @crear-contrato="handleCrearContrato" @revisar-contrato="handleRevisarContrato" @cambiar-vista="cambiarVista"
      @registrar-incidencia="showIncidencia = true" />

    <!-- Otras vistas -->
    <div v-else class="other-view">
      <!-- ✅ Vista de Detalle del Aspirante (versión refactorizada) -->
      <DetalleAspirante v-if="activeTab === 'detalle'" :aspirante="aspiranteSeleccionado"
        @cerrar="activeTab = 'inicio'" />

      <!-- Vista de Activos -->
      <EnlaceActivos v-else-if="activeTab === 'activos'" :contratos="contratosActivos"
        @revisar-contrato="handleRevisarContrato" @volver-inicio="activeTab = 'inicio'" />

      <!-- Vista de Próximos a Vencer -->
      <EnlaceAVencer v-else-if="activeTab === 'avencer'" :contratos="contratosAVencer"
        @revisar-contrato="handleRevisarContrato" @volver-inicio="activeTab = 'inicio'" />

      <!-- Vista de Vencidos -->
      <EnlaceVencidos v-else-if="activeTab === 'vencidos'" :contratos="contratosVencidos"
        @revisar-contrato="handleRevisarContrato" @volver-inicio="activeTab = 'inicio'" />

      <!-- Vista de En Proceso -->
      <EnlaceEnProceso v-else-if="activeTab === 'proceso'" :contratos="contratosEnProceso"
        @revisar-contrato="handleRevisarContrato" @volver-inicio="activeTab = 'inicio'" />

      <!-- Vista de estadísticas -->
      <EnlaceEstadisticas v-else-if="activeTab === 'estadisticas'" :stats="{ activos: 456, vacantes: 18 }"
        :departamentos="['RRHH', 'Finanzas', 'Operaciones', 'TI', 'Marketing']" @volver-inicio="activeTab = 'inicio'" />

      <!-- Vista de Crear Contrato -->
      <EnlaceCrearContrato v-else-if="activeTab === 'crear'" @volver-inicio="activeTab = 'inicio'" />

      <!-- Vista de Otra Pantalla -->
      <OtraPantalla v-else-if="activeTab === 'otra'" @volver-inicio="activeTab = 'inicio'" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSidebar } from '@/composables/useSidebar';
import EnlaceInicio from './EnlaceInicio.vue';
import EnlaceActivos from './EnlacesNavegacion/EnlaceActivos.vue';
import EnlaceAVencer from './EnlacesNavegacion/EnlaceAVencer.vue';
import EnlaceVencidos from './EnlacesNavegacion/EnlaceVencidos.vue';
import EnlaceEnProceso from './EnlacesNavegacion/EnlaceEnProceso.vue';
import EnlaceEstadisticas from './EnlacesNavegacion/EnlaceEstadisticas.vue';
import EnlaceCrearContrato from './EnlacesNavegacion/EnlaceCrearContrato.vue';
import OtraPantalla from './EnlacesNavegacion/OtraPantalla.vue';
import IncidenciasFormulario from '../Incidencias/Incidencias-Formulario.vue';
import DetalleAspirante from './DetalleAspiranteRefactored.vue';

const route = useRoute();
const router = useRouter();
const activeTab = ref('inicio');
const searchQuery = ref('');
const showIncidencia = ref(false);
const showSuccess = ref(false);
const aspiranteSeleccionado = ref(null);
const { contentMarginLeft, contentWidth } = useSidebar();

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
  } else if (route.path === '/Contratos/otra') {
    activeTab.value = 'otra';
  } else {
    activeTab.value = 'inicio';
  }
};

// Watch para cambios en la ruta
watch(() => route.path, () => {
  updateTabFromRoute();
}, { immediate: true });

// Al montar el componente
onMounted(() => {
  updateTabFromRoute();
});

// Función para volver al inicio
const volverInicio = () => {
  router.push('/Contratos');
};

const stats = ref({
  activos: 47,
  proximosVencer: 9,
  vencidos: 2,
  enProceso: 13
});

const contratos = ref([
  {
    id: 1,
    nombre: 'Andres Medina Hernandez',
    tipo: 'empleado',
    estadoTexto: 'ACTIVO',
    estadoClase: 'activo',
    puesto: 'GERENTE',
    area: 'VACACIONES',
    avatar: 'https://i.pravatar.cc/150?img=1',
    estado: 'activo',
    fase: 'Evaluación',
    cuenta: 'CUENTA EJECUTIVA',
    fechaInicio: '2024-01-15',
    fechaVencimiento: '2025-12-31',
    curp: 'TOAB961211HSLRRR08',
    rfc: 'TOAB961211ABC',
    nss: '12345678901',
    fechaNacimiento: '12/11/1996',
    sexo: 'Masculino',
    nacionalidad: 'Mexicana',
    telefono: '555-123-4567',
    domicilio: 'Calle Ejemplo #123, Col. Centro',
    estadoProceso: 'EN REVISIÓN',
    fechaRegistro: '2025-08-16'
  },
  {
    id: 2,
    nombre: 'Beto Sanchez Perez',
    tipo: 'empleado',
    estadoTexto: 'BAJA',
    estadoClase: 'baja',
    puesto: 'GERENTE',
    area: 'ASISTENCIAS',
    avatar: 'https://i.pravatar.cc/150?img=2',
    estado: 'avencer',
    fase: 'Revisión',
    cuenta: 'CUENTA EJECUTIVA',
    fechaInicio: '2024-03-10',
    fechaVencimiento: '2025-11-15',
    curp: 'SOAL901205HDFNLX09',
    rfc: 'SOAL901205XYZ',
    nss: '98765432109',
    fechaNacimiento: '05/12/1990',
    sexo: 'Masculino',
    nacionalidad: 'Mexicana',
    telefono: '555-987-6543',
    domicilio: 'Av. Principal #456, Col. Norte',
    estadoProceso: 'EN REVISIÓN',
    fechaRegistro: '2025-07-20'
  },
  {
    id: 3,
    nombre: 'Steven Niño Genio',
    tipo: 'empleado',
    estadoTexto: 'ACTIVO',
    estadoClase: 'activo',
    puesto: 'GERENTE',
    area: 'CONTRATOS',
    avatar: 'https://i.pravatar.cc/150?img=3',
    estado: 'vencido',
    fase: 'Evaluación',
    cuenta: 'CUENTA CORPORATIVA',
    fechaInicio: '2023-06-20',
    fechaVencimiento: '2024-06-20',
    curp: 'BOJC880315HMCDNR07',
    rfc: 'BOJC880315DEF',
    nss: '45678901234',
    fechaNacimiento: '15/03/1988',
    sexo: 'Masculino',
    nacionalidad: 'Mexicana',
    telefono: '555-456-7890',
    domicilio: 'Boulevard Central #789, Col. Sur',
    estadoProceso: 'FINALIZADO',
    fechaRegistro: '2025-06-10'
  },
  {
    id: 4,
    nombre: 'Braulio Torres Arispe',
    tipo: 'aspirante',
    estadoTexto: 'Revisión',
    estadoClase: 'revision',
    puesto: 'GERENTE',
    area: 'VACACIONES',
    avatar: 'https://i.pravatar.cc/150?img=4',
    estado: 'proceso',
    fase: 'Revisión',
    cuenta: 'CUENTA EJECUTIVA',
    fechaInicio: '2024-09-01',
    fechaVencimiento: '2026-09-01',
    curp: 'TOAB961211HSLRRR08',
    rfc: 'TOAB961211ABC',
    nss: '12345678901',
    fechaNacimiento: '12/11/1996',
    sexo: 'Masculino',
    nacionalidad: 'Mexicana',
    telefono: '555-123-4567',
    domicilio: 'Calle Ejemplo #123, Col. Centro',
    estadoProceso: 'EN REVISIÓN',
    fechaRegistro: '2025-09-01'
  },
  {
    id: 5,
    nombre: 'Alejandro Solano Hala',
    tipo: 'aspirante',
    estadoTexto: 'Revisión',
    estadoClase: 'revision',
    puesto: 'GERENTE',
    area: 'ASISTENCIAS',
    avatar: 'https://i.pravatar.cc/150?img=5',
    estado: 'proceso',
    fase: 'Revisión',
    cuenta: 'CUENTA EJECUTIVA',
    fechaInicio: '2024-09-15',
    fechaVencimiento: '2026-09-15',
    curp: 'SOAL901205HDFNLX09',
    rfc: 'SOAL901205XYZ',
    nss: '98765432109',
    fechaNacimiento: '05/12/1990',
    sexo: 'Masculino',
    nacionalidad: 'Mexicana',
    telefono: '555-987-6543',
    domicilio: 'Av. Principal #456, Col. Norte',
    estadoProceso: 'EN REVISIÓN',
    fechaRegistro: '2025-09-15'
  },
  {
    id: 6,
    nombre: 'Juan Carlos Bodoque',
    tipo: 'aspirante',
    estadoTexto: 'Evaluación',
    estadoClase: 'evaluacion',
    puesto: 'GERENTE',
    area: 'CONTRATOS',
    avatar: 'https://i.pravatar.cc/150?img=6',
    estado: 'proceso',
    fase: 'Evaluación',
    cuenta: 'CUENTA CORPORATIVA',
    fechaInicio: '2024-10-01',
    fechaVencimiento: '2026-10-01',
    curp: 'BOJC880315HMCDNR07',
    rfc: 'BOJC880315DEF',
    nss: '45678901234',
    fechaNacimiento: '15/03/1988',
    sexo: 'Masculino',
    nacionalidad: 'Mexicana',
    telefono: '555-456-7890',
    domicilio: 'Boulevard Central #789, Col. Sur',
    estadoProceso: 'EN EVALUACIÓN',
    fechaRegistro: '2025-10-01'
  }
]);

// Computed properties para filtrar contratos por estado
const contratosActivos = computed(() =>
  contratos.value.filter(c => c.estado === 'activo')
);

const contratosAVencer = computed(() =>
  contratos.value.filter(c => c.estado === 'avencer')
);

const contratosVencidos = computed(() =>
  contratos.value.filter(c => c.estado === 'vencido')
);

const contratosEnProceso = computed(() =>
  contratos.value.filter(c => c.estado === 'proceso')
);

// Métodos para manejar eventos
const handleCrearContrato = () => {
  activeTab.value = 'crear';
};

// Método para manejar revisión de contrato
const handleRevisarContrato = (contrato) => {
  console.log('Revisar contrato:', contrato);
  aspiranteSeleccionado.value = contrato;
  activeTab.value = 'detalle';
};

// Método para cambiar de vista desde las tarjetas de estadísticas
const cambiarVista = (vista) => {
  activeTab.value = vista;
};
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
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
