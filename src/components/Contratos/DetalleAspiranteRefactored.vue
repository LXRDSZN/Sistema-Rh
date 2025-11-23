<template>
    <div class="detalle-aspirante-page">
        <!-- Loading state -->
        <div v-if="cargando" class="loading-container">
            <span class="material-symbols-rounded rotating">progress_activity</span>
            <p>Cargando información del aspirante...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="error-container">
            <span class="material-symbols-rounded">error</span>
            <p>{{ error }}</p>
            <button @click="cargarDatos" class="btn-reintentar">Reintentar</button>
        </div>

        <!-- Content -->
        <template v-else-if="aspirante">
            <!-- Header -->
            <AspiranteHeader @cerrar="cerrar" />

            <!-- Información del aspirante -->
            <AspiranteInfo :aspirante="aspirante" :cv-url="cvUrl" @crear-contrato="emit('crear-contrato', $event)" />

            <!-- Navegación de pestañas -->
            <TabNavigation v-model="tabActual" :tabs="tabs" />

            <!-- Contenido de las pestañas -->
            <DatosPersonalesTab v-if="tabActual === 'datos'" :aspirante="aspirante" />
            <FormacionExperienciaTab v-if="tabActual === 'formacion'" :aspirante="aspirante" />
            <PuestoDeseadoTab
                v-if="tabActual === 'puesto'"
                :aspirante="aspirante"
                :aspiracion-laboral="aspiracionLaboral"
            />
            <ProcesoSeleccionTab
                v-if="tabActual === 'proceso'"
                :aspirante="aspirante"
                @etapa-actualizada="actualizarEtapaLocal"
            />
            <DocumentacionTab v-if="tabActual === 'documentacion'" :aspirante="aspirante" />
        </template>
    </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { useAspirantesContratos } from '@/composables/useAspirantesContratos';

import AspiranteHeader from './DetalleAspiranteCommon/AspiranteHeader.vue';
import AspiranteInfo from './DetalleAspiranteCommon/AspiranteInfo.vue';
import TabNavigation from './DetalleAspiranteCommon/TabNavigation.vue';
import DatosPersonalesTab from './DetalleAspiranteTabs/DatosPersonalesTab.vue';
import FormacionExperienciaTab from './DetalleAspiranteTabs/FormacionExperienciaTab.vue';
import PuestoDeseadoTab from './DetalleAspiranteTabs/PuestoDeseadoTab.vue';
import ProcesoSeleccionTab from './DetalleAspiranteTabs/ProcesoSeleccionTab.vue';
import DocumentacionTab from './DetalleAspiranteTabs/DocumentacionTab.vue';

const props = defineProps({
    personaId: {
        type: [String, Number],
        required: true
    }
});

const emit = defineEmits(['cerrar', 'crear-contrato']);


// Composable
const {
    obtenerDatosPersonalesAspirante,
    obtenerCvAspirante,
    obtenerAspiracionLaboralAspirante,
    actualizarEtapaAspirante
} = useAspirantesContratos();

// Estado
const aspirante = ref(null);
const cvUrl = ref(null);
const aspiracionLaboral = ref(null);
const cargando = ref(false);
const error = ref(null);

const tabActual = ref('datos');

const tabs = [
    { id: 'datos', label: 'Datos Personales y Contacto' },
    { id: 'formacion', label: 'Formación y experiencia' },
    { id: 'puesto', label: 'Puesto deseado' },
    { id: 'proceso', label: 'Proceso de Selección' },
    { id: 'documentacion', label: 'Documentación' }
];

// Formatear fecha
const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// Cargar datos del aspirante
const cargarDatos = async () => {
    cargando.value = true;
    error.value = null;

    try {
        // Cargar datos personales
        const datosPersonales = await obtenerDatosPersonalesAspirante(props.personaId);
        // Cargar aspiración laboral
        aspiracionLaboral.value = await obtenerAspiracionLaboralAspirante(props.personaId);

        // Transformar datos del backend al formato del componente
        aspirante.value = {
            // Datos básicos
            id: datosPersonales.persona_id,
            nombre: `${datosPersonales.nombre} ${datosPersonales.apellido_paterno} ${datosPersonales.apellido_materno}`,
            avatar: datosPersonales.foto_url || '/default-avatar.png',

            // Identificación
            curp: datosPersonales.curp,
            rfc: datosPersonales.rfc,
            nss: datosPersonales.nss,

            // Datos personales individuales
            nombreSolo: datosPersonales.nombre,
            apellidoPaterno: datosPersonales.apellido_paterno,
            apellidoMaterno: datosPersonales.apellido_materno,
            fechaNacimiento: formatearFecha(datosPersonales.fecha_nacimiento),
            sexo: datosPersonales.sexo,
            nacionalidad: datosPersonales.nacionalidad,
            estadoCivil: datosPersonales.estado_civil,

            // Contacto
            telefono: datosPersonales.telefono,
            correo: datosPersonales.correo,
            domicilio: datosPersonales.domicilio,

            // Estado del proceso
            estadoProceso: datosPersonales.etapa || 'Registro',
            fechaRegistro: datosPersonales.fecha_registro
        };

        // Cargar CV (opcional)
        try {
            cvUrl.value = await obtenerCvAspirante(props.personaId);
        } catch (cvError) {
            console.warn('El aspirante no tiene CV:', cvError);
            cvUrl.value = null;
        }

    } catch (err) {
        console.error('Error al cargar aspirante:', err);
        error.value = err.response?.data?.error || 'Error al cargar información';
    } finally {
        cargando.value = false;
    }
};

const cerrar = () => {
    emit('cerrar');
};

const actualizarEtapaLocal = async (nuevaEtapa) => {
    if (!aspirante.value) return;
    try {
        const proceso = await actualizarEtapaAspirante(aspirante.value.id, nuevaEtapa);
        // Actualiza estado local rápidamente
        aspirante.value.estadoProceso = proceso.etapa;
        // Refresca todos los datos desde el backend para asegurarse
        await cargarDatos();
    } catch (error) {
        console.error('Error al actualizar etapa desde detalle aspirante:', error);
    }
};

// Cargar datos al montar
onMounted(() => {
    cargarDatos();
});
</script>

<style scoped>
.detalle-aspirante-page {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1.5rem;
    background-color: #f5f5f5;
    min-height: 100vh;
}

.loading-container,
.error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 1rem;
    background: white;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-container .material-symbols-rounded {
    font-size: 48px;
    color: #7c4dff;
}

.loading-container p {
    color: #666;
    font-size: 1rem;
    font-weight: 500;
}

.rotating {
    animation: rotate 1s linear infinite;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.error-container .material-symbols-rounded {
    font-size: 48px;
    color: #f44336;
}

.error-container p {
    color: #666;
    font-size: 1rem;
    text-align: center;
    max-width: 400px;
}

.btn-reintentar {
    padding: 0.75rem 1.5rem;
    background-color: #7c4dff;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    font-size: 0.95rem;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-top: 0.5rem;
}

.btn-reintentar:hover {
    background-color: #6a3de8;
}

.btn-reintentar:active {
    transform: scale(0.98);
}

@media (max-width: 768px) {
    .detalle-aspirante-page {
        padding: 0.5rem;
    }

    .loading-container,
    .error-container {
        min-height: 300px;
        padding: 1.5rem;
    }

    .loading-container .material-symbols-rounded,
    .error-container .material-symbols-rounded {
        font-size: 40px;
    }

    .loading-container p,
    .error-container p {
        font-size: 0.9rem;
    }
}
</style>
