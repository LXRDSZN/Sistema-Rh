<template>
    <div class="detalle-empleado">
        <!-- Header con flecha y título -->
        <div class="top-header">
            <button class="btn-back" @click="cerrar">
                <span class="material-symbols-rounded">arrow_back</span>
            </button>
            <h1>Contratos/Empleado</h1>
        </div>

        <!-- ✅ Mostrar mensaje de carga mientras se traen los datos -->
        <div v-if="loading" class="loading">
            <p>Cargando datos del empleado...</p>
        </div>

        <div v-else-if="empleadoCompleto" class="content-box">
            <h2 class="section-title">EMPLEADO</h2>

            <!-- Componente de Header del Empleado -->
            <EmpleadoHeader :empleado="empleadoCompleto" @ver-contrato="activeTab = 'contratoActual'"
                @renovar-contrato="renovarContrato" />

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

                <!-- ✅ Mostrar error si falla la carga -->
                <div v-else class="error">
                    <p>Error al cargar los datos del empleado</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useContratos } from '@/composables/useContratos';
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

const { obtenerEncabezadoEmpleado, obtenerContratoActualEmpleado } = useContratos();
const activeTab = ref('contratoActual');
const loading = ref(false);
const empleadoCompleto = ref(null);


// Datos del contrato actual
const contratoActual = ref({
    tipoContrato: '----',
    fechaInicioFin: '----',
    salarioBase: '----',
    jornadaLaboral: '----',
    horario: '----X',
    estadoFirma: '----'
});

// Datos de nómina y pagos
const nominaPagos = ref({
    periodosPago: '----',
    salarioBruto: '----',
    deducciones: '----',
    neto: '----',
    bonosRecibidos: '----',
    deduccionesAplicadas: '----',
    historialAguinaldos: '----'
});

// Datos de beneficios y seguridad
const beneficiosSeguridad = ref([
    { id: 1, nombre: 'Beneficios activos', valor: '----', activo: true },
    { id: 2, nombre: 'NSS', valor: '----', activo: false },
    { id: 3, nombre: 'Tipo de afiliación', valor: '----', activo: true },
    { id: 4, nombre: 'Clínica', valor: '----', activo: false },
    { id: 5, nombre: 'Riesgo laboral', valor: '----', activo: false }
]);

// Datos de documentos
const documentos = ref([
    { id: 1, nombre: 'Contrato firmado', estado: 'Subido', estadoClase: 'subido', fechaSubida: '12/12/2025' },
    { id: 2, nombre: 'Anexos', estado: 'Pendiente', estadoClase: 'pendiente', fechaSubida: '12/12/2025' },
    { id: 3, nombre: 'Recibos', estado: 'Rechazado', estadoClase: 'rechazado', fechaSubida: '12/12/2025' },
    { id: 4, nombre: 'Constancias', estado: 'Subido', estadoClase: 'subido', fechaSubida: '12/12/2025' },
    { id: 5, nombre: 'Cartas', estado: 'Pendiente', estadoClase: 'pendiente', fechaSubida: '12/12/2025' }
]);


onMounted(async () => {
    loading.value = true;
    try {
        const [encabezado, contrato] = await Promise.all([
            obtenerEncabezadoEmpleado(props.empleado.persona_id),
            obtenerContratoActualEmpleado(props.empleado.persona_id)
        ]);

        const hoy = new Date();
        //const fechaFin = new Date(contrato.fecha_fin);
        const fechaFin = contrato.fecha_fin ? new Date(contrato.fecha_fin) : null;
        const fechaInicio = new Date(contrato.fecha_inicio);

        let estadoTexto = 'ACTIVO';
        let estadoClase = 'activo';

        if (!fechaFin) {
            // Contrato indefinido / indeterminado
            estadoTexto = 'ACTIVO'; // Mantener como ACTIVO en contratos indefinidos
            estadoClase = 'indefinido';
        } else if (fechaFin < hoy) {
            // Contrato vencido
            estadoTexto = 'VENCIDO';
            estadoClase = 'vencido';
        } else {
            // Calcular días para vencer
            const diasParaVencer = Math.floor((fechaFin - hoy) / (1000 * 60 * 60 * 24));

            if (diasParaVencer <= 30 && diasParaVencer > 0) {
                estadoTexto = 'PRÓXIMO A VENCER';
                estadoClase = 'proximo-a-vencer';
            }
        }

        empleadoCompleto.value = {
            ...encabezado,
            ...contrato,
            // ✅ Agregar avatar si no existe
            avatar: encabezado.foto_url,
            // ✅ Formatear nombre completo
            nombre: `${encabezado.nombre} ${encabezado.apellido_paterno} ${encabezado.apellido_materno || ''}`.trim(),
            // ✅ Agregar estado y fecha
            estadoTexto,
            estadoClase,
            fechaRegistro: encabezado.fecha_ingreso
        };

        contratoActual.value = {
            tipoContrato: contrato.tipo_contrato || '----',
            fechaInicioFin: `${formatearFecha(contrato.fecha_inicio)} - ${formatearFecha(contrato.fecha_fin)}`, // Manejar indefinido
            salarioBase: formatearMoneda(contrato.salario_mensual),
            jornadaLaboral: contrato.jornada || '----',
            horario: `${contrato.hora_entrada} - ${contrato.hora_salida}` || '----',
            estadoFirma: contrato.estado_firma || '----'
        };

    } catch (error) {
        console.error('Error al cargar empleado:', error);
    } finally {
        loading.value = false;
    }
});

// Función para formatear fechas
const formatearFecha = (fecha) => {
    if (!fecha) return 'INDEFINIDO';
    const d = new Date(fecha);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
};

const formatearMoneda = (cantidad) => {
    if (cantidad == null) return '----';

    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(cantidad);
};


const cambiarTab = (tab) => {
    activeTab.value = tab;
};

const cerrar = () => {
    emit('cerrar');
};

const renovarContrato = () => {
    emit('renovar-contrato', empleadoCompleto.value);
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

/* Agregar estos estilos */
.loading,
.error {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    background-color: white;
    border-radius: 12px;
    margin: 1.5rem;
}

.loading p {
    font-size: 1.1rem;
    color: #666;
}

.error p {
    font-size: 1.1rem;
    color: #dc3545;
}
</style>
