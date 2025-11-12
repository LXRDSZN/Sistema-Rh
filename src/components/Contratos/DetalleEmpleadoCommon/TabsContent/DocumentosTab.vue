<template>
    <div class="documentos-content">
        <h3>Documentos</h3>

        <div class="documentos-table">
            <div class="table-header">
                <div class="col-nombre">Nombre</div>
                <div class="col-estado">Estado</div>
                <div class="col-fecha">Fecha de subida</div>
                <div class="col-acciones">Acciones</div>
            </div>

            <div v-for="doc in documentos" :key="doc.id" class="table-row">
                <div class="col-nombre">
                    <span class="material-symbols-rounded doc-icon">description</span>
                    {{ doc.nombre }}
                </div>
                <div class="col-estado">
                    <span class="badge" :class="doc.estadoClase">{{ doc.estado }}</span>
                </div>
                <div class="col-fecha">{{ doc.fechaSubida }}</div>
                <div class="col-acciones">
                    <button class="btn-icon btn-download" @click="$emit('descargar', doc)">
                        <span class="material-symbols-rounded">download</span>
                    </button>
                    <button class="btn-icon btn-view" @click="$emit('ver', doc)">
                        <span class="material-symbols-rounded">visibility</span>
                    </button>
                    <button class="btn-icon btn-share" @click="$emit('compartir', doc)">
                        <span class="material-symbols-rounded">share</span>
                    </button>
                    <button class="btn-icon btn-delete" @click="$emit('eliminar', doc)">
                        <span class="material-symbols-rounded">delete</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    documentos: {
        type: Array,
        required: true
    }
});

defineEmits(['descargar', 'ver', 'compartir', 'eliminar']);
</script>

<style scoped>
.documentos-content h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
    color: #333;
}

.documentos-table {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
}

.table-header,
.table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.5fr;
    gap: 1rem;
    padding: 1rem;
    align-items: center;
}

.table-header {
    background-color: #f5f5f5;
    font-weight: 600;
    color: #333;
    border-bottom: 1px solid #e0e0e0;
}

.table-row {
    border-bottom: 1px solid #e0e0e0;
}

.table-row:last-child {
    border-bottom: none;
}

.table-row:hover {
    background-color: #f9f9f9;
}

.col-nombre {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.doc-icon {
    color: #ef4444;
    font-size: 20px;
}

.badge {
    display: inline-block;
    padding: 0.4rem 1rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
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

.col-acciones {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
}

.btn-icon {
    background: none;
    border: 1px solid #d0d0d0;
    padding: 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.btn-icon .material-symbols-rounded {
    font-size: 18px;
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
    border-color: #6b7280;
    color: #6b7280;
}

.btn-share:hover {
    background-color: #6b7280;
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

@media (max-width: 768px) {

    .table-header,
    .table-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
    }

    .col-acciones {
        justify-content: flex-start;
    }
}
</style>
