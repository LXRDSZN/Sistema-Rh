<template>
    <div class="tab-panel">
        <div class="documentacion-container">
            <div class="documentos-tabla">
                <!-- Header -->
                <div class="tabla-header">
                    <div class="tabla-col">Tipo</div>
                    <div class="tabla-col">Estado</div>
                    <div class="tabla-col">Fecha de subida</div>
                    <div class="tabla-col">Acciones</div>
                </div>

                <!-- Sin documentos -->
                <div v-if="!documentos || !documentos.length" class="tabla-row empty-row">
                    <div class="tabla-col" colspan="4">
                        No hay documentos registrados para este aspirante.
                    </div>
                </div>

                <!-- Filas -->
                <div v-for="doc in documentos" :key="doc.id || doc.documento_tipo_id" class="tabla-row">
                    <!-- Tipo -->
                    <div class="tabla-col tipo-col">
                        <span class="doc-icon"></span>
                        <span>{{ doc.tipo_documento }}</span>
                    </div>

                    <!-- Estado -->
                    <div class="tabla-col">
                        <span class="estado-badge" :class="{
                            subido: doc.estado === 'Subido',
                            pendiente: doc.estado === 'Pendiente',
                            rechazado: doc.estado === 'Rechazado'
                        }">
                            {{ doc.estado || 'Pendiente' }}
                        </span>
                    </div>

                    <!-- Fecha -->
                    <div class="tabla-col">
                        {{ doc.fecha_subida ? formatearFecha(doc.fecha_subida) : '—' }}
                    </div>

                    <!-- Acciones -->
                    <div class="tabla-col acciones-col">
                        <!-- Subir / reemplazar -->
                        <button class="btn-accion upload" title="Subir / reemplazar"
                            @click="emit('subir-documento', doc)">
                            <span class="material-symbols-rounded">upload</span>
                        </button>

                        <!-- Eliminar -->
                        <!-- Eliminar -->
                        <button class="btn-accion delete" title="Eliminar" @click="emit('eliminar-documento', doc)"
                            :disabled="!doc.documento_persona_id">
                            <span class="material-symbols-rounded">delete</span>
                        </button>

                        <!-- Ver (abre en nueva pestaña) -->
                        <button class="btn-accion view" title="Ver" @click="emit('ver-documento', doc)"
                            :disabled="!doc.archivo_id">
                            <span class="material-symbols-rounded">visibility</span>
                        </button>

                        <!-- Descargar (solo descarga, no abrir) -->
                        <button class="btn-accion download" title="Descargar" @click="emit('descargar-documento', doc)"
                            :disabled="!doc.archivo_id">
                            <span class="material-symbols-rounded">download</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    aspirante: {
        type: Object,
        required: true
    },
    documentos: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits([
    'subir-documento',
    'eliminar-documento',
    'ver-documento',
    'descargar-documento'
]);

const formatearFecha = (fecha) => {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};
</script>

<style scoped>
.tab-panel {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.documentacion-container {
    width: 100%;
}

.documentos-tabla {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0;
}

.tabla-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1.5fr 2fr;
    gap: 1rem;
    padding: 1rem;
    background-color: #f5f5f5;
    font-weight: 600;
    color: #666;
    font-size: 0.9rem;
    border-bottom: 2px solid #ddd;
}

.tabla-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1.5fr 2fr;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid #e0e0e0;
    align-items: center;
    transition: background-color 0.2s ease;
}

.tabla-row:hover {
    background-color: #fafafa;
}

.tabla-col {
    display: flex;
    align-items: center;
}

.tipo-col {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.doc-icon {
    width: 8px;
    height: 8px;
    background-color: #f44336;
    border-radius: 50%;
    flex-shrink: 0;
}

.estado-badge {
    padding: 0.4rem 1rem;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 500;
    text-align: center;
    display: inline-block;
}

.estado-badge.subido {
    background-color: #e8f5e9;
    color: #4caf50;
}

.estado-badge.pendiente {
    background-color: #fff3e0;
    color: #ff9800;
}

.estado-badge.rechazado {
    background-color: #ffebee;
    color: #f44336;
}

.acciones-col {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-start;
}

.btn-accion {
    width: 36px;
    height: 36px;
    border: 1px solid #ddd;
    background-color: white;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
}

.btn-accion .material-symbols-rounded {
    font-size: 18px;
    color: #666;
}

.btn-accion.upload:hover {
    background-color: #4caf50;
    border-color: #4caf50;
}

.btn-accion.upload:hover .material-symbols-rounded {
    color: white;
}

.btn-accion.delete:hover {
    background-color: #f44336;
    border-color: #f44336;
}

.btn-accion.delete:hover .material-symbols-rounded {
    color: white;
}

.btn-accion.view:hover {
    background-color: #2196f3;
    border-color: #2196f3;
}

.btn-accion.view:hover .material-symbols-rounded {
    color: white;
}

.btn-accion.download:hover {
    background-color: #666;
    border-color: #666;
}

.btn-accion.download:hover .material-symbols-rounded {
    color: white;
}

@media (max-width: 768px) {
    .tab-panel {
        padding: 1rem;
    }

    .documentos-tabla {
        overflow-x: auto;
    }

    .tabla-header,
    .tabla-row {
        grid-template-columns: 1.5fr 1fr 1fr 1.8fr;
        gap: 0.5rem;
        padding: 0.8rem;
        font-size: 0.85rem;
    }

    .acciones-col {
        gap: 0.3rem;
    }

    .btn-accion {
        width: 32px;
        height: 32px;
    }
}
</style>
