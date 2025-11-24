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

            <PuestoDeseadoTab v-if="tabActual === 'puesto'" :aspirante="aspirante"
                :aspiracion-laboral="aspiracionLaboral" />

            <ProcesoSeleccionTab v-if="tabActual === 'proceso'" :aspirante="aspirante"
                :aspiracion-laboral="aspiracionLaboral" @etapa-actualizada="actualizarEtapaLocal"
                @comentario-enviado="guardarComentarioAspiracion" />

            <DocumentacionTab v-if="tabActual === 'documentacion'" :aspirante="aspirante" :documentos="documentos"
                @subir-documento="handleSubirDocumento" @eliminar-documento="handleEliminarDocumento"
                @ver-documento="handleVerDocumento" @descargar-documento="handleDescargarDocumento" />

        </template>
    </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { useAspirantesContratos } from '@/composables/useAspirantesContratos';
import { useS3Files } from '@/composables/useS3Files';
import { useDocumentosPersona } from '@/composables/useDocumentosPersona';

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
    actualizarEtapaAspirante,
    actualizarComentarioAspiracion,
    obtenerDocumentosAspirante,
} = useAspirantesContratos();
const { asociarDocumentoPersona, eliminarDocumentoPersona } = useDocumentosPersona();
const { subirArchivo, obtenerUrlFirmada, descargarArchivo, actualizarDocumentoAspirante } = useS3Files();

// Estado
const aspirante = ref(null);
const cvUrl = ref(null);
const aspiracionLaboral = ref(null);
const cargando = ref(false);
const error = ref(null);
const documentos = ref([]);


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

        // 👇 aquí traemos los documentos
        documentos.value = await obtenerDocumentosAspirante(props.personaId);

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

const guardarComentarioAspiracion = async (comentarioTexto) => {
    if (!aspirante.value) return;
    try {
        await actualizarComentarioAspiracion(aspirante.value.id, comentarioTexto);
        // Recargar aspiración laboral desde la BD para reflejar el comentario
        aspiracionLaboral.value = await obtenerAspiracionLaboralAspirante(aspirante.value.id);
    } catch (error) {
        console.error('Error al guardar comentario de aspiración laboral:', error);
    }
};

const extraerS3KeyDeDocumento = (doc) => {
    // 1) Preferimos storage_url (lo que tienes en la tabla archivo)
    let value = doc.storage_url || doc.nombre_archivo;
    if (!value) return null;

    // Si es una URL completa (http/https), nos quedamos solo con el path
    if (value.startsWith('http')) {
        try {
            const url = new URL(value);
            // /solicitudes/.../archivo.pdf  -> solicitudes/.../archivo.pdf
            let path = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
            // Por si viene con bucket en el path (poco probable en tu caso):
            // /mi-bucket/solicitudes/... -> quitamos el primer segmento
            const parts = path.split('/');
            if (parts[0] === 'recursos-humanos-2025-becerro') {
                path = parts.slice(1).join('/');
            }
            // Si viniera con query por alguna razón
            const qIndex = path.indexOf('?');
            return qIndex !== -1 ? path.slice(0, qIndex) : path;
        } catch (e) {
            // Si algo falla, devolvemos lo original
            return value;
        }
    }

    // Si NO es url pero trae query, la cortamos
    const qIndex = value.indexOf('?');
    if (qIndex !== -1) return value.slice(0, qIndex);

    return value;
};



const handleSubirDocumento = async (doc) => {
    console.log('--- handleSubirDocumento INICIO ---');
    console.log('Doc recibido:', JSON.parse(JSON.stringify(doc)));

    try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/pdf,image/*';
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            console.log('Archivo seleccionado:', file);
            if (!file) return;

            // 1) SIEMPRE subimos primero a S3 (tu función ya probada)
            const respSubir = await subirArchivo(file);
            console.log('Respuesta subirArchivo:', respSubir);

            if (!respSubir?.ok || !respSubir.archivo) {
                alert('Error al subir archivo');
                return;
            }

            const archivoId = respSubir.archivo.id;
            console.log('archivoId nuevo:', archivoId);

            // 2) Si ya existe documento_persona -> ACTUALIZAR
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
                alert('Documento actualizado correctamente');
            } else {
                // 3) Si NO existe -> crear documento_persona (POST que ya tenías)
                console.log(
                    'RAMA: PRIMERA SUBIDA para documento_tipo_id:',
                    doc.documento_tipo_id
                );

                const payloadAsociar = {
                    personaId: aspirante.value.id,
                    documentoTipoId: doc.documento_tipo_id,
                    archivoId,
                };
                console.log('Payload asociarDocumentoPersona:', payloadAsociar);

                const respAsociar = await asociarDocumentoPersona(payloadAsociar);
                console.log('Respuesta asociarDocumentoPersona:', respAsociar);

                alert('Documento subido correctamente');
            }

            // 4) Refrescar lista
            documentos.value = await obtenerDocumentosAspirante(aspirante.value.id);
            console.log('Documentos después de refrescar:', documentos.value);

            console.log('--- handleSubirDocumento FIN ---');
        };
    } catch (error) {
        console.error('Error al subir/actualizar documento:', error);
        alert('Error al subir/actualizar documento');
    }
};



const handleEliminarDocumento = async (doc) => {
    console.log('--- handleEliminarDocumento INICIO ---');
    console.log('Doc recibido para eliminar:', JSON.parse(JSON.stringify(doc)));

    if (!doc.documento_persona_id) {
        console.warn(
            'No hay documento_persona_id; no hay nada que eliminar para este tipo.'
        );
        alert('Este tipo de documento todavía no tiene archivo asociado.');
        return;
    }

    const ok = confirm(
        `¿Seguro que deseas eliminar el documento "${doc.tipo_documento}"?`
    );
    console.log('Confirmación eliminarDocumentoPersona:', ok);

    if (!ok) {
        console.log('El usuario canceló la eliminación.');
        return;
    }

    try {
        console.log(
            'Llamando a eliminarDocumentoPersona con personaId:',
            aspirante.value.id,
            ' documentoPersonaId:',
            doc.documento_persona_id
        );

        const resp = await eliminarDocumentoPersona(
            aspirante.value.id,
            doc.documento_persona_id
        );
        console.log('Respuesta eliminarDocumentoPersona (front):', resp);

        alert('Documento eliminado');

        console.log(
            'Refrescando documentos de persona después de eliminar:',
            aspirante.value.id
        );
        documentos.value = await obtenerDocumentosAspirante(aspirante.value.id);
        console.log('Documentos después de refrescar (eliminar):', documentos.value);

        console.log('--- handleEliminarDocumento FIN ---');
    } catch (error) {
        console.error('Error al eliminar documento:', error);
        alert('No se pudo eliminar el documento');
    }
};








const handleVerDocumento = async (doc) => {
    console.log('--- handleVerDocumento INICIO ---');
    console.log('Doc recibido en ver:', JSON.parse(JSON.stringify(doc)));

    try {
        const key = extraerS3KeyDeDocumento(doc);
        console.log('Key extraída para ver:', key);

        if (!key) {
            console.warn('extraerS3KeyDeDocumento devolvió null/undefined');
            alert('Este documento no tiene archivo asociado');
            return;
        }

        const url = await obtenerUrlFirmada(key);
        console.log('URL firmada obtenida para ver:', url);

        if (!url) {
            console.warn('obtenerUrlFirmada devolvió URL vacía');
            alert('No se pudo obtener la URL del documento');
            return;
        }

        window.open(url, '_blank');
        console.log('Se abrió ventana con el documento.');

        console.log('--- handleVerDocumento FIN ---');
    } catch (error) {
        console.error('Error al ver documento:', error);
        alert('No se pudo abrir el documento');
    }
};


const handleDescargarDocumento = async (doc) => {
    console.log('--- handleDescargarDocumento INICIO ---');
    console.log('Doc recibido en descargar:', JSON.parse(JSON.stringify(doc)));

    try {
        const key = extraerS3KeyDeDocumento(doc);
        console.log('Key extraída para descargar:', key);

        if (!key) {
            console.warn('extraerS3KeyDeDocumento devolvió null/undefined');
            alert('Este documento no tiene archivo para descargar');
            return;
        }

        const resp = await descargarArchivo(key); // depende de cómo lo implementaste
        console.log('Resultado descargarArchivo:', resp);

        console.log('--- handleDescargarDocumento FIN ---');
    } catch (error) {
        console.error('Error al descargar documento:', error);
        alert('No se pudo descargar el documento');
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
