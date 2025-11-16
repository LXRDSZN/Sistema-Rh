<template>
    <div class="documentos-content">
        <h3>Documentos</h3>

        <!-- Tabla de documentos -->
        <div class="documentos-table">
            <div class="table-header">
                <div class="col-nombre"></div>
                <div class="col-estado">Estado</div>
                <div class="col-fecha">Fecha de subida</div>
                <div class="col-acciones">Acciones</div>
            </div>

            <div v-for="doc in documentos" :key="doc.id" class="table-row">
                <div class="col-nombre">
                    <span class="material-symbols-rounded doc-icon">description</span>
                    <span>{{ doc.nombre }}</span>
                </div>
                <div class="col-estado">
                    <span class="badge" :class="doc.estadoClase">{{ doc.estado }}</span>
                </div>
                <div class="col-fecha">{{ doc.fechaSubida }}</div>
                <div class="col-acciones">
                    <button class="btn-icon btn-download" @click="$emit('descargar', doc)" title="Descargar">
                        <span class="material-symbols-rounded">download</span>
                    </button>
                    <button class="btn-icon btn-view" @click="$emit('ver', doc)" title="Ver">
                        <span class="material-symbols-rounded">visibility</span>
                    </button>
                    <button class="btn-icon btn-share" @click="$emit('compartir', doc)" title="Compartir">
                        <span class="material-symbols-rounded">share</span>
                    </button>
                    <button class="btn-icon btn-delete" @click="$emit('eliminar', doc)" title="Eliminar">
                        <span class="material-symbols-rounded">delete</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Sección de subir documento -->
        <div class="upload-section">
            <div class="upload-form">
                <div class="form-group">
                    <label>Tipo de Documento</label>
                    <select v-model="tipoDocumento" class="form-select">
                        <option value="">Seleccione</option>
                        <option value="contrato">Contrato firmado</option>
                        <option value="anexos">Anexos</option>
                        <option value="recibos">Recibos</option>
                        <option value="constancias">Constancias</option>
                        <option value="cartas">Cartas</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Subir documento (PDF)</label>
                    <div class="file-input-wrapper">
                        <select v-model="archivoSeleccionado" class="form-select">
                            <option value="">Seleccione</option>
                            <option value="archivo1">Documento 1.pdf</option>
                            <option value="archivo2">Documento 2.pdf</option>
                        </select>
                    </div>
                </div>

                <button class="btn-upload" @click="subirDocumento">
                    Subir
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
    documentos: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['descargar', 'ver', 'compartir', 'eliminar', 'subir']);

const tipoDocumento = ref('');
const archivoSeleccionado = ref('');

const subirDocumento = () => {
    if (!tipoDocumento.value || !archivoSeleccionado.value) {
        alert('Por favor seleccione el tipo de documento y el archivo');
        return;
    }

    emit('subir', {
        tipo: tipoDocumento.value,
        archivo: archivoSeleccionado.value
    });

    // Limpiar campos
    tipoDocumento.value = '';
    archivoSeleccionado.value = '';
};
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
    grid-template-columns: 2fr 1fr 1.2fr 1.8fr;
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

.btn-download {
    border-color: #10b981;
    color: #10b981;
}

.btn-download:hover {
    background-color: #10b981;
    color: white;
}

.btn-view {
    border-color: #3b82f6;
    color: #3b82f6;
}

.btn-view:hover {
    background-color: #3b82f6;
    color: white;
}

.btn-share {
    border-color: #333;
    color: #333;
}

.btn-share:hover {
    background-color: #333;
    color: white;
}

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

.btn-upload {
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

.btn-upload:hover {
    background-color: #6d28d9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.btn-upload:active {
    transform: translateY(0);
}

/* Responsive */
@media (max-width: 1024px) {

    .table-header,
    .table-row {
        grid-template-columns: 1.5fr 1fr 1fr 1.5fr;
    }

    .upload-form {
        grid-template-columns: 1fr;
    }

    .btn-upload {
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
