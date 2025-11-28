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

            <!-- Header del Empleado -->
            <EmpleadoHeader :empleado="empleadoCompleto" @ver-contrato="verContratoActual"
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
                    @subir-documento="handleSubirDocumento" @eliminar-documento="handleEliminarDocumento"
                    @ver-documento="handleVerDocumento" @descargar-documento="handleDescargarDocumento" />

                <!-- Error genérico -->
                <div v-else class="error">
                    <p>Error al cargar los datos del empleado</p>
                </div>
            </div>

            <!-- Sistema de Notificaciones Toast -->
            <transition name="slide-fade">
                <div v-if="mostrarNotificacion" class="toast-notification" :class="tipoNotificacion">
                    <div class="toast-content">
                        <div class="toast-header">
                            <h4>{{ tituloNotificacion }}</h4>
                            <button @click="cerrarNotificacion" class="toast-close">
                                <span class="material-symbols-rounded">close</span>
                            </button>
                        </div>
                        <p>{{ mensajeNotificacion }}</p>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useContratos } from '@/composables/useContratos';
import { useS3Files } from '@/composables/useS3Files';
import { useAspirantesContratos } from '@/composables/useAspirantesContratos';
import { useDocumentosPersona } from '@/composables/useDocumentosPersona';

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

const { obtenerDocumentosAspirante } = useAspirantesContratos();
const { obtenerEncabezadoEmpleado, obtenerContratoActualEmpleado } = useContratos();
const { asociarDocumentoPersona, eliminarDocumentoPersona } = useDocumentosPersona();
const {
    obtenerUrlContratoActual,
    subirArchivo,
    obtenerUrlFirmada,
    descargarArchivo,
    actualizarDocumentoAspirante
} = useS3Files();

const activeTab = ref('contratoActual');
const loading = ref(false);
const empleadoCompleto = ref(null);
const documentos = ref([]);

// Sistema de notificaciones toast
const mostrarNotificacion = ref(false);
const tipoNotificacion = ref('success');
const tituloNotificacion = ref('');
const mensajeNotificacion = ref('');

// 🔹 personaId centralizado (sirve para consultas de documentos)
const personaId = computed(() =>
    empleadoCompleto.value?.persona_id ||
    props.empleado?.persona_id ||
    props.empleado?.id ||
    null
);

// Datos del contrato actual
const contratoActual = ref({
    tipoContrato: '----',
    fechaInicioFin: '----',
    salarioBase: '----',
    jornadaLaboral: '----',
    horario: '----',
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

// =========================
//   UTIL S3 (misma que tenías)
// =========================
const extraerS3KeyDeDocumento = (doc) => {
    let value = doc.storage_url || doc.nombre_archivo;
    if (!value) return null;

    if (value.startsWith('http')) {
        try {
            const url = new URL(value);
            let path = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
            const parts = path.split('/');
            if (parts[0] === 'recursos-humanos-2025-becerro') {
                path = parts.slice(1).join('/');
            }
            const qIndex = path.indexOf('?');
            return qIndex !== -1 ? path.slice(0, qIndex) : path;
        } catch (e) {
            return value;
        }
    }

    const qIndex = value.indexOf('?');
    if (qIndex !== -1) return value.slice(0, qIndex);

    return value;
};

// =========================
//   CARGA DE DOCUMENTOS
// =========================
const cargarDocumentos = async () => {
    const idPersona = personaId.value;
    if (!idPersona) {
        console.warn('No se encontró personaId para cargar documentos del empleado.');
        return;
    }

    try {
        const lista = await obtenerDocumentosAspirante(idPersona);

        // 🔹 Filtro: NO mostrar el tipo con código "CONTRATO"
        documentos.value = (Array.isArray(lista) ? lista : []).filter((doc) => {
            // ❌ No mostrar CONTRATO ni POLITICA_TI
            return !['CONTRATO', 'POLITICA_TI'].includes(doc.codigo);
            // si tu API usa otra propiedad, sería algo como:
            // return !['CONTRATO', 'POLITICA_TI'].includes(doc.documento_tipo_codigo);
        });

        console.log('Documentos cargados para persona (filtrados):', idPersona, documentos.value);
    } catch (error) {
        console.error('Error al obtener documentos de la persona:', error);
        documentos.value = [];
    }
};

// Funciones del sistema de notificaciones toast
const mostrarNotif = (tipo, titulo, mensaje, duracion = 5000) => {
    tipoNotificacion.value = tipo;
    tituloNotificacion.value = titulo;
    mensajeNotificacion.value = mensaje;
    mostrarNotificacion.value = true;
    if (duracion > 0) {
        setTimeout(() => mostrarNotificacion.value = false, duracion);
    }
};

const cerrarNotificacion = () => {
    mostrarNotificacion.value = false;
};

// Cuando el usuario entra a la pestaña "documentos", cargamos la info
watch(
    () => activeTab.value,
    (nuevo) => {
        if (nuevo === 'documentos') {
            cargarDocumentos();
        }
    }
);

// =========================
//   MANEJADORES DOCUMENTOS
// =========================
const handleSubirDocumento = async (doc) => {
    console.log('--- handleSubirDocumento INICIO ---');
    console.log('Doc recibido:', JSON.parse(JSON.stringify(doc)));

    const idPersona = personaId.value;
    if (!idPersona) {
        mostrarNotif('error', 'Error', 'No se encontró la persona del empleado para asociar el documento.', 4000);
        return;
    }

    try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/pdf';
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            console.log('Archivo seleccionado:', file);
            if (!file) return;

            // Validar que sea un archivo PDF
            const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
            if (!isPDF) {
                mostrarNotif('warning', 'Archivo no válido', 'Solo se permiten archivos PDF. Por favor selecciona un archivo con extensión .pdf', 4000);
                return;
            }

            // 1) Subir a S3
            const respSubir = await subirArchivo(file);
            console.log('Respuesta subirArchivo:', respSubir);

            if (!respSubir?.ok || !respSubir.archivo) {
                mostrarNotif('error', 'Error de subida', 'Error al subir archivo', 3000);
                return;
            }

            const archivoId = respSubir.archivo.id;
            console.log('archivoId nuevo:', archivoId);

            // 2) Actualizar documento_persona existente
            if (doc.documento_persona_id) {
                console.log(
                    'RAMA: ACTUALIZAR documento_persona',
                    doc.documento_persona_id
                );
                const respAct = await actualizarDocumentoAspirante(
                    doc.documento_persona_id,
                    archivoId
                );
                console.log('Respuesta actualizarDocumentoAspirante:', respAct);
                mostrarNotif('success', 'Actualizado', 'Documento actualizado correctamente', 3000);
            } else {
                // 3) Primera subida: crear documento_persona
                console.log(
                    'RAMA: PRIMERA SUBIDA para documento_tipo_id:',
                    doc.documento_tipo_id
                );

                const payloadAsociar = {
                    personaId: idPersona,
                    documentoTipoId: doc.documento_tipo_id,
                    archivoId
                };
                console.log('Payload asociarDocumentoPersona:', payloadAsociar);

                const respAsociar = await asociarDocumentoPersona(payloadAsociar);
                console.log('Respuesta asociarDocumentoPersona:', respAsociar);

                mostrarNotif('success', 'Subido', 'Documento subido correctamente', 3000);
            }

            // 4) Refrescar lista
            await cargarDocumentos();

            console.log('--- handleSubirDocumento FIN ---');
        };
    } catch (error) {
        console.error('Error al subir/actualizar documento:', error);
        mostrarNotif('error', 'Error', 'Error al subir/actualizar documento', 4000);
    }
};

const handleEliminarDocumento = async (doc) => {
    console.log('--- handleEliminarDocumento INICIO ---');
    console.log('Doc recibido para eliminar:', JSON.parse(JSON.stringify(doc)));

    if (!doc.documento_persona_id) {
        console.warn('No hay documento_persona_id; no hay nada que eliminar para este tipo.');
        mostrarNotif('warning', 'Sin archivo', 'Este documento no tiene archivo subido. No hay nada que eliminar.', 4000);
        return;
    }

    const ok = confirm(
        `¿Seguro que deseas eliminar el documento "${doc.tipo_documento || doc.nombre}"?`
    );
    console.log('Confirmación eliminarDocumentoPersona:', ok);

    if (!ok) {
        console.log('El usuario canceló la eliminación.');
        return;
    }

    try {
        const idPersona = personaId.value;
        if (!idPersona) {
            mostrarNotif('error', 'Error', 'No se encontró la persona del empleado para eliminar el documento.', 4000);
            return;
        }

        console.log(
            'Llamando a eliminarDocumentoPersona con personaId:',
            idPersona,
            ' documentoPersonaId:',
            doc.documento_persona_id
        );

        const resp = await eliminarDocumentoPersona(idPersona, doc.documento_persona_id);
        console.log('Respuesta eliminarDocumentoPersona (front):', resp);

        mostrarNotif('success', 'Eliminado', 'Documento eliminado', 3000);

        await cargarDocumentos();

        console.log('--- handleEliminarDocumento FIN ---');
    } catch (error) {
        console.error('Error al eliminar documento:', error);
        mostrarNotif('error', 'Error', 'No se pudo eliminar el documento', 4000);
    }
};

const handleVerDocumento = async (doc) => {
    console.log('--- handleVerDocumento INICIO ---');
    console.log('Doc recibido en ver:', JSON.parse(JSON.stringify(doc)));

    // Validar que exista archivo antes de intentar verlo
    if (!doc.archivo_id) {
        mostrarNotif('warning', 'Sin archivo', 'No hay archivo subido para este documento', 3000);
        return;
    }

    try {
        const key = extraerS3KeyDeDocumento(doc);
        console.log('Key extraída para ver:', key);

        if (!key) {
            console.warn('extraerS3KeyDeDocumento devolvió null/undefined');
            mostrarNotif('info', 'Sin archivo', 'Este documento no tiene archivo asociado', 3000);
            return;
        }

        const url = await obtenerUrlFirmada(key);
        console.log('URL firmada obtenida para ver:', url);

        if (!url) {
            console.warn('obtenerUrlFirmada devolvió URL vacía');
            mostrarNotif('error', 'Error de URL', 'No se pudo obtener la URL del documento', 4000);
            return;
        }

        window.open(url, '_blank');
        console.log('Se abrió ventana con el documento.');

        console.log('--- handleVerDocumento FIN ---');
    } catch (error) {
        console.error('Error al ver documento:', error);
        mostrarNotif('error', 'Error', 'No se pudo abrir el documento', 4000);
    }
};

const handleDescargarDocumento = async (doc) => {
    console.log('--- handleDescargarDocumento INICIO ---');
    console.log('Doc recibido en descargar:', JSON.parse(JSON.stringify(doc)));

    // Validar que exista archivo antes de intentar descargarlo
    if (!doc.archivo_id) {
        mostrarNotif('warning', 'Sin archivo', 'No hay archivo subido para descargar', 3000);
        return;
    }

    try {
        const key = extraerS3KeyDeDocumento(doc);
        console.log('Key extraída para descargar:', key);

        if (!key) {
            console.warn('extraerS3KeyDeDocumento devolvió null/undefined');
            mostrarNotif('info', 'Sin archivo', 'Este documento no tiene archivo para descargar', 3000);
            return;
        }

        const resp = await descargarArchivo(key);
        console.log('Resultado descargarArchivo:', resp);

        console.log('--- handleDescargarDocumento FIN ---');
    } catch (error) {
        console.error('Error al descargar documento:', error);
        mostrarNotif('error', 'Error de descarga', 'No se pudo descargar el documento', 4000);
    }
};

// =========================
//   MONTAJE INICIAL
// =========================
onMounted(async () => {
    loading.value = true;
    try {
        const [encabezado, contrato] = await Promise.all([
            obtenerEncabezadoEmpleado(props.empleado.persona_id),
            obtenerContratoActualEmpleado(props.empleado.persona_id)
        ]);

        const hoy = new Date();
        const fechaFin = contrato.fecha_fin ? new Date(contrato.fecha_fin) : null;
        const fechaInicio = new Date(contrato.fecha_inicio);

        let estadoTexto = 'ACTIVO';
        let estadoClase = 'activo';

        if (!fechaFin) {
            estadoTexto = 'ACTIVO';
            estadoClase = 'indefinido';
        } else if (fechaFin < hoy) {
            estadoTexto = 'VENCIDO';
            estadoClase = 'vencido';
        } else {
            const diasParaVencer = Math.floor((fechaFin - hoy) / (1000 * 60 * 60 * 24));

            if (diasParaVencer <= 30 && diasParaVencer > 0) {
                estadoTexto = 'PRÓXIMO A VENCER';
                estadoClase = 'proximo-a-vencer';
            }
        }

        empleadoCompleto.value = {
            ...encabezado,
            ...contrato,
            avatar: encabezado.foto_url,
            nombre: `${encabezado.nombre} ${encabezado.apellido_paterno} ${encabezado.apellido_materno || ''}`.trim(),
            estadoTexto,
            estadoClase,
            fechaRegistro: encabezado.fecha_ingreso
        };

        contratoActual.value = {
            tipoContrato: contrato.tipo_contrato || '----',
            fechaInicioFin: `${formatearFecha(contrato.fecha_inicio)} - ${formatearFecha(contrato.fecha_fin)}`,
            salarioBase: formatearMoneda(contrato.salario_mensual),
            jornadaLaboral: contrato.jornada || '----',
            horario: `${formatearHora(contrato.hora_entrada)} - ${formatearHora(contrato.hora_salida)}` || '----',
            estadoFirma: contrato.estado_firma || '----'
        };
    } catch (error) {
        console.error('Error al cargar empleado:', error);
    } finally {
        loading.value = false;
    }
});

// Función para formatear horas (HH:MM)
const formatearHora = (hora) => {
    if (!hora) return '----';
    // Si ya viene en formato HH:MM:SS, extraer solo HH:MM
    if (typeof hora === 'string' && hora.includes(':')) {
        const partes = hora.split(':');
        return `${partes[0]}:${partes[1]}`;
    }
    return hora;
};

// Función para formatear fechas (usando UTC para evitar desfase de zona horaria)
const formatearFecha = (fecha) => {
    if (!fecha) return 'INDEFINIDO';
    const d = new Date(fecha);
    const dia = String(d.getUTCDate()).padStart(2, '0');
    const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
    const anio = d.getUTCFullYear();
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

// =========================
//   OTRAS ACCIONES
// =========================
const verContratoActual = async () => {
    try {
        console.log('Revisar contrato:', empleadoCompleto.value);

        const persona = personaId.value;
        if (!persona) {
            mostrarNotif('error', 'Error', 'No se encontró personaId del empleado.', 4000);
            return;
        }

        const url = await obtenerUrlContratoActual(persona);
        window.open(url, '_blank');
    } catch (error) {
        console.error('Error al abrir contrato actual:', error.response || error);
        mostrarNotif('error', 'Error', 'No se pudo abrir el contrato actual.', 4000);
    }
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

/* Sistema de Notificaciones Toast */
.toast-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    min-width: 300px;
    max-width: 400px;
    padding: 0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.toast-notification.success {
    background: rgba(34, 197, 94, 0.9);
    color: white;
}

.toast-notification.error {
    background: rgba(239, 68, 68, 0.9);
    color: white;
}

.toast-notification.warning {
    background: rgba(245, 158, 11, 0.9);
    color: white;
}

.toast-notification.info {
    background: rgba(59, 130, 246, 0.9);
    color: white;
}

.toast-content {
    padding: 16px;
}

.toast-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
}

.toast-header h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    flex: 1;
}

.toast-close {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 0;
    margin-left: 12px;
    opacity: 0.8;
    transition: opacity 0.2s;
}

.toast-close:hover {
    opacity: 1;
}

.toast-close .material-symbols-rounded {
    font-size: 20px;
}

.toast-content p {
    margin: 0;
    font-size: 14px;
    line-height: 1.4;
    opacity: 0.95;
}

/* Animación slide-fade */
.slide-fade-enter-active {
    transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
    transform: translateY(20px);
    opacity: 0;
}

.slide-fade-leave-to {
    transform: translateY(-10px);
    opacity: 0;
}
</style>
