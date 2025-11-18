<template>
    <div class="detalle-empleado">
        <!-- Header con flecha y título -->
        <div class="top-header">
            <button class="btn-back" @click="cerrar">
                <span class="material-symbols-rounded">arrow_back</span>
            </button>
            <h1>Contratos/Empleado</h1>
        </div>

        <div class="content-box">
            <h2 class="section-title">EMPLEADO</h2>

            <!-- Componente de Header del Empleado -->
            <EmpleadoHeader :empleado="empleado" @ver-contrato="activeTab = 'contratoActual'" />

            <!-- Tabs de navegación -->
            <DetalleEmpleadoTabs :activeTab="activeTab" @cambiar-tab="cambiarTab" />

            <!-- Contenido de las pestañas -->
            <div class="tab-content">
                <!-- Contrato Actual -->
                <ContratoActualTab v-if="activeTab === 'contratoActual'" :contrato="contratoActual"
                    @renovar="renovarContrato" />

                <!-- Nómina y Pagos -->
                <NominaPagosTab v-else-if="activeTab === 'nominaPagos'" :nomina="nominaPagos" />

                <!-- Beneficios y Seguridad -->
                <BeneficiosSeguridadTab v-else-if="activeTab === 'beneficiosSeguridad'"
                    :beneficios="beneficiosSeguridad" @toggle-beneficio="toggleBeneficio" />

                <!-- Documentos -->
                <DocumentosTab v-else-if="activeTab === 'documentos'" :documentos="documentos"
                    @descargar="descargarDocumento" @ver="verDocumento" @compartir="compartirDocumento"
                    @eliminar="eliminarDocumento" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import DetalleEmpleadoTabs from './DetalleEmpleadoTabs.vue';
import EmpleadoHeader from './EmpleadoHeader.vue';
import ContratoActualTab from './TabsContent/ContratoActualTab.vue';
import NominaPagosTab from './TabsContent/NominaPagosTab.vue';
import BeneficiosSeguridadTab from './TabsContent/BeneficioSeguridadTab.vue';
import DocumentosTab from './TabsContent/DocumentosTab.vue';

const props = defineProps({
    empleado: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['cerrar', 'renovar-contrato']);

const activeTab = ref('contratoActual');

// Datos del contrato actual
const contratoActual = ref({
    tipoContrato: 'XXXXX',
    fechaInicioFin: 'XXXXX',
    salarioBase: 'XXXXX',
    jornadaLaboral: 'XXXXX',
    horario: 'XXXXXX',
    estadoFirma: 'XXXXX'
});

// Datos de nómina y pagos
const nominaPagos = ref({
    periodosPago: 'XXXXX',
    salarioBruto: 'XXXXX',
    deducciones: 'XXXXX',
    neto: 'XXXXX',
    bonosRecibidos: 'XXXXX',
    deduccionesAplicadas: 'XXXXX',
    historialAguinaldos: 'XXXXX'
});

// Datos de beneficios y seguridad
const beneficiosSeguridad = ref([
    { id: 1, nombre: 'Beneficios activos', valor: 'XXXXX', activo: true },
    { id: 2, nombre: 'NSS', valor: 'XXXXX', activo: false },
    { id: 3, nombre: 'Tipo de afiliación', valor: 'XXXXX', activo: true },
    { id: 4, nombre: 'Clínica', valor: 'XXXXX', activo: false },
    { id: 5, nombre: 'Riesgo laboral', valor: 'XXXXX', activo: false }
]);

// Datos de documentos
const documentos = ref([
    { id: 1, nombre: 'Contrato firmado', estado: 'Subido', estadoClase: 'subido', fechaSubida: '12/12/2025' },
    { id: 2, nombre: 'Anexos', estado: 'Pendiente', estadoClase: 'pendiente', fechaSubida: '12/12/2025' },
    { id: 3, nombre: 'Recibos', estado: 'Rechazado', estadoClase: 'rechazado', fechaSubida: '12/12/2025' },
    { id: 4, nombre: 'Constancias', estado: 'Subido', estadoClase: 'subido', fechaSubida: '12/12/2025' },
    { id: 5, nombre: 'Cartas', estado: 'Pendiente', estadoClase: 'pendiente', fechaSubida: '12/12/2025' }
]);

const cambiarTab = (tab) => {
    activeTab.value = tab;
};

const cerrar = () => {
    emit('cerrar');
};

const renovarContrato = () => {
    emit('renovar-contrato');
};

const toggleBeneficio = (beneficio) => {
    beneficio.activo = !beneficio.activo;
};

const descargarDocumento = (doc) => {
    console.log('Descargar documento:', doc);
};

const verDocumento = (doc) => {
    console.log('Ver documento:', doc);
};

const compartirDocumento = (doc) => {
    console.log('Compartir documento:', doc);
};

const eliminarDocumento = (doc) => {
    console.log('Eliminar documento:', doc);
};
</script>

<style scoped>
.detalle-empleado {
    max-width: 1400px;
    margin: 0 auto;
}

.top-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem 1.5rem 1rem 1.5rem;
    background-color: transparent;
}

.btn-back {
    background: none;
    border: none;
    color: #333;
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s ease;
}

.btn-back:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.btn-back .material-symbols-rounded {
    font-size: 26px;
}

.top-header h1 {
    color: #333;
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
}

.content-box {
    background-color: white;
    border-radius: 12px;
    padding: 2rem;
    margin: 0 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
    color: #9370db;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 2rem 0;
    letter-spacing: 0.5px;
    text-align: center;
}

.tab-content {
    padding: 2rem 0;
}
</style>
