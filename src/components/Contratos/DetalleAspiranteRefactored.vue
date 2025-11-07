<template>
    <div class="detalle-aspirante-page">
        <!-- Header -->
        <AspiranteHeader @cerrar="cerrar" />

        <!-- Información del aspirante -->
        <AspiranteInfo :aspirante="aspirante" />

        <!-- Navegación de pestañas -->
        <TabNavigation v-model="tabActual" :tabs="tabs" />

        <!-- Contenido de las pestañas -->
        <DatosPersonalesTab v-if="tabActual === 'datos'" :aspirante="aspirante" />
        <FormacionExperienciaTab v-if="tabActual === 'formacion'" :aspirante="aspirante" />
        <PuestoDeseadoTab v-if="tabActual === 'puesto'" :aspirante="aspirante" />
        <ProcesoSeleccionTab v-if="tabActual === 'proceso'" :aspirante="aspirante" />
        <DocumentacionTab v-if="tabActual === 'documentacion'" :aspirante="aspirante" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import AspiranteHeader from './DetalleAspiranteCommon/AspiranteHeader.vue';
import AspiranteInfo from './DetalleAspiranteCommon/AspiranteInfo.vue';
import TabNavigation from './DetalleAspiranteCommon/TabNavigation.vue';
import DatosPersonalesTab from './DetalleAspiranteTabs/DatosPersonalesTab.vue';
import FormacionExperienciaTab from './DetalleAspiranteTabs/FormacionExperienciaTab.vue';
import PuestoDeseadoTab from './DetalleAspiranteTabs/PuestoDeseadoTab.vue';
import ProcesoSeleccionTab from './DetalleAspiranteTabs/ProcesoSeleccionTab.vue';
import DocumentacionTab from './DetalleAspiranteTabs/DocumentacionTab.vue';

const props = defineProps({
    aspirante: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['cerrar']);

const tabActual = ref('datos');

const tabs = [
    { id: 'datos', label: 'Datos Personales y Contacto' },
    { id: 'formacion', label: 'Formación y experiencia' },
    { id: 'puesto', label: 'Puesto deseado' },
    { id: 'proceso', label: 'Proceso de Selección' },
    { id: 'documentacion', label: 'Documentación' }
];

const cerrar = () => {
    emit('cerrar');
};
</script>

<style scoped>
.detalle-aspirante-page {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1.5rem;
    background-color: #f5f5f5;
    min-height: 100vh;
}

@media (max-width: 768px) {
    .detalle-aspirante-page {
        padding: 0.5rem;
    }
}
</style>
