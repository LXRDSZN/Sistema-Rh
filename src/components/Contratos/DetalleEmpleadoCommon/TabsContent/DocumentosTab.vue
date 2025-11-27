<template>
    <div class="documentos-content">
        <h3>Documentos</h3>

        <!-- Tabla de documentos -->
        <div class="documentos-table">
            <div class="table-header">
                <div class="col-nombre">Tipo</div>
                <div class="col-estado">Estado</div>
                <div class="col-fecha">Fecha de subida</div>
                <div class="col-acciones">Acciones</div>
            </div>

            <div v-for="doc in documentosNormalizados" :key="doc.documento_tipo_id || doc.id" class="table-row">
                <div class="col-nombre">
                    <span class="material-symbols-rounded doc-icon">description</span>
                    <span>{{ doc.nombre }}</span>
                </div>

                <div class="col-estado">
                    <span class="badge" :class="doc.estadoClase">
                        {{ doc.estado }}
                    </span>
                </div>

                <div class="col-fecha">
                    {{ doc.fechaFormateada }}
                </div>

                <div class="col-acciones">
                    <!-- Subir / Reemplazar archivo -->
                    <button class="btn-icon btn-upload" @click="$emit('subir-documento', doc._original)"
                        title="Subir o reemplazar archivo">
                        <span class="material-symbols-rounded">upload</span>
                    </button>

                    <!-- Ver -->
                    <button class="btn-icon btn-view" @click="$emit('ver-documento', doc._original)" title="Ver">
                        <span class="material-symbols-rounded">visibility</span>
                    </button>

                    <!-- Descargar -->
                    <button class="btn-icon btn-download" @click="$emit('descargar-documento', doc._original)"
                        title="Descargar">
                        <span class="material-symbols-rounded">download</span>
                    </button>

                    <!-- Eliminar -->
                    <button class="btn-icon btn-delete" @click="$emit('eliminar-documento', doc._original)"
                        title="Eliminar">
                        <span class="material-symbols-rounded">delete</span>
                    </button>
                </div>
            </div>

            <div v-if="!documentosNormalizados.length" class="sin-documentos">
                <p>No hay tipos de documentos configurados para este empleado.</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
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

// Formatear fecha a dd/mm/aaaa
const formatearFecha = (fecha) => {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// Normaliza para la vista, pero conserva el objeto original en _original
// para que el padre reciba todos los campos reales (documento_persona_id, storage_url, etc.)
const documentosNormalizados = computed(() =>
    props.documentos.map((doc) => {
        const tieneArchivo =
            !!doc.documento_persona_id &&
            !!(doc.storage_url || doc.nombre_archivo || doc.storageUrl);

        const fecha = doc.fecha_subida || doc.fechaSubida || doc.created_at;

        return {
            ...doc,
            _original: doc,
            nombre: doc.tipo_documento || doc.nombre || doc.descripcion || 'Documento',
            estado: tieneArchivo ? 'Subido' : 'Pendiente',
            estadoClase: tieneArchivo ? 'estado-subido' : 'estado-pendiente',
            fechaFormateada: fecha ? formatearFecha(fecha) : '—'
        };
    })
);
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:wght@400;700&display=swap');

.documentos-content {
    background-color: white;
    padding: 2rem;
    border-radius: 12px;
}

.documentos-content h3 {
    font-size: 1.3rem;
    font-weight: 700;
    margin: 0 0 1.5rem 0;
    color: #333;
}

.documentos-table {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 2rem;
}

.table-header,
.table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1.2fr 2fr;
    gap: 1rem;
    padding: 1rem 1.5rem;
    align-items: center;
}

.table-header {
    background-color: #f9fafb;
    font-weight: 600;
    color: #666;
    font-size: 0.9rem;
    border-bottom: 1px solid #e5e7eb;
}

.table-row {
    border-bottom: 1px solid #f3f4f6;
    transition: background-color 0.2s ease;
}

.table-row:last-child {
    border-bottom: none;
}

.table-row:hover {
    background-color: #f9fafb;
}

.col-nombre {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 500;
    color: #333;
}

.doc-icon {
    color: #ef4444;
    font-size: 24px;
    flex-shrink: 0;
}

.badge {
    display: inline-block;
    padding: 0.4rem 1rem;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    text-align: center;
}

.badge.subido {
    background-color: #d1fae5;
    color: #059669;
}

.badge.pendiente {
    background-color: #fef3c7;
    color: #d97706;
}

.badge.rechazado {
    background-color: #fee2e2;
    color: #dc2626;
}

.col-fecha {
    color: #666;
    font-size: 0.9rem;
}

.col-acciones {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-start;
}

.btn-icon {
    background: white;
    border: 2px solid;
    padding: 0.5rem;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    min-width: 40px;
    height: 40px;
}

.btn-icon .material-symbols-rounded {
    font-size: 20px;
}

/* Verde - Subir archivo */
.btn-upload {
    border-color: #10b981;
    color: #10b981;
}

.btn-upload:hover {
    background-color: #10b981;
    color: white;
}

/* Azul - Ver */
.btn-view {
    border-color: #3b82f6;
    color: #3b82f6;
}

.btn-view:hover {
    background-color: #3b82f6;
    color: white;
}

/* Gris - Descargar */
.btn-download {
    border-color: #6b7280;
    color: #6b7280;
}

.btn-download:hover {
    background-color: #6b7280;
    color: white;
}

/* Rojo - Eliminar */
.btn-delete {
    border-color: #ef4444;
    color: #ef4444;
}

.btn-delete:hover {
    background-color: #ef4444;
    color: white;
}

/* Sección de subir documento */
.upload-section {
    background-color: #f9fafb;
    padding: 2rem;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
}

.upload-form {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 1.5rem;
    align-items: end;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
}

.form-select {
    padding: 0.875rem 1.25rem;
    border: 2px solid #d1d5db;
    border-radius: 8px;
    background-color: white;
    font-size: 0.95rem;
    color: #666;
    cursor: pointer;
    outline: none;
    transition: all 0.3s ease;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23666' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    padding-right: 3rem;
}

.form-select:hover {
    border-color: #9ca3af;
}

.form-select:focus {
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

/* File Input Styling */
.file-input-wrapper {
    position: relative;
}

.file-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
}

.file-input-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1.25rem;
    border: 2px solid #d1d5db;
    border-radius: 8px;
    background-color: white;
    font-size: 0.95rem;
    color: #666;
    cursor: pointer;
    transition: all 0.3s ease;
}

.file-input-label .material-symbols-rounded {
    color: #7c3aed;
    font-size: 20px;
}

.file-input-label:hover {
    border-color: #9ca3af;
}

.file-input:focus+.file-input-label {
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.btn-submit {
    padding: 0.875rem 2.5rem;
    background-color: #7c3aed;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    height: fit-content;
}

.btn-submit:hover {
    background-color: #6d28d9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.btn-submit:active {
    transform: translateY(0);
}

/* Responsive */
@media (max-width: 1024px) {

    .table-header,
    .table-row {
        grid-template-columns: 1.5fr 1fr 1fr 2fr;
    }

    .upload-form {
        grid-template-columns: 1fr;
    }

    .btn-submit {
        width: 100%;
    }
}

@media (max-width: 768px) {
    .table-header {
        display: none;
    }

    .table-row {
        grid-template-columns: 1fr;
        gap: 0.75rem;
        padding: 1.25rem;
    }

    .col-acciones {
        justify-content: flex-start;
        flex-wrap: wrap;
    }
}
</style>
