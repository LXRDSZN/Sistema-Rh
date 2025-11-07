<template>
    <div class="tab-panel">
        <div class="documentacion-container">
            <!-- Tabla de Documentos -->
            <div class="documentos-tabla">
                <!-- Header de la tabla -->
                <div class="tabla-header">
                    <div class="tabla-col">Tipo</div>
                    <div class="tabla-col">Estado</div>
                    <div class="tabla-col">Fecha de subida</div>
                    <div class="tabla-col">Acciones</div>
                </div>

                <!-- Filas de documentos -->
                <div class="tabla-row">
                    <div class="tabla-col tipo-col">
                        <span class="doc-icon"></span>
                        <span>CV</span>
                    </div>
                    <div class="tabla-col">
                        <span class="estado-badge subido">Subido</span>
                    </div>
                    <div class="tabla-col">11/11/25</div>
                    <div class="tabla-col acciones-col">
                        <button class="btn-accion upload" title="Subir">
                            <span class="material-symbols-rounded">upload</span>
                        </button>
                        <button class="btn-accion delete" title="Eliminar">
                            <span class="material-symbols-rounded">delete</span>
                        </button>
                        <button class="btn-accion view" title="Ver">
                            <span class="material-symbols-rounded">visibility</span>
                        </button>
                        <button class="btn-accion download" title="Descargar">
                            <span class="material-symbols-rounded">download</span>
                        </button>
                    </div>
                </div>

                <div class="tabla-row">
                    <div class="tabla-col tipo-col">
                        <span class="doc-icon"></span>
                        <span>Identificación</span>
                    </div>
                    <div class="tabla-col">
                        <span class="estado-badge pendiente">Pendiente</span>
                    </div>
                    <div class="tabla-col">11/11/25</div>
                    <div class="tabla-col acciones-col">
                        <button class="btn-accion upload">
                            <span class="material-symbols-rounded">upload</span>
                        </button>
                        <button class="btn-accion delete">
                            <span class="material-symbols-rounded">delete</span>
                        </button>
                        <button class="btn-accion view">
                            <span class="material-symbols-rounded">visibility</span>
                        </button>
                        <button class="btn-accion download">
                            <span class="material-symbols-rounded">download</span>
                        </button>
                    </div>
                </div>

                <div class="tabla-row">
                    <div class="tabla-col tipo-col">
                        <span class="doc-icon"></span>
                        <span>Comprobante</span>
                    </div>
                    <div class="tabla-col">
                        <span class="estado-badge rechazado">Rechazado</span>
                    </div>
                    <div class="tabla-col">11/11/25</div>
                    <div class="tabla-col acciones-col">
                        <button class="btn-accion upload">
                            <span class="material-symbols-rounded">upload</span>
                        </button>
                        <button class="btn-accion delete">
                            <span class="material-symbols-rounded">delete</span>
                        </button>
                        <button class="btn-accion view">
                            <span class="material-symbols-rounded">visibility</span>
                        </button>
                        <button class="btn-accion download">
                            <span class="material-symbols-rounded">download</span>
                        </button>
                    </div>
                </div>

                <div class="tabla-row">
                    <div class="tabla-col tipo-col">
                        <span class="doc-icon"></span>
                        <span>Carta de recomendación</span>
                    </div>
                    <div class="tabla-col">
                        <span class="estado-badge subido">Subido</span>
                    </div>
                    <div class="tabla-col">11/11/25</div>
                    <div class="tabla-col acciones-col">
                        <button class="btn-accion upload">
                            <span class="material-symbols-rounded">upload</span>
                        </button>
                        <button class="btn-accion delete">
                            <span class="material-symbols-rounded">delete</span>
                        </button>
                        <button class="btn-accion view">
                            <span class="material-symbols-rounded">visibility</span>
                        </button>
                        <button class="btn-accion download">
                            <span class="material-symbols-rounded">download</span>
                        </button>
                    </div>
                </div>

                <div class="tabla-row">
                    <div class="tabla-col tipo-col">
                        <span class="doc-icon"></span>
                        <span>XXXXXXXX</span>
                    </div>
                    <div class="tabla-col">
                        <span class="estado-badge pendiente">Pendiente</span>
                    </div>
                    <div class="tabla-col">11/11/25</div>
                    <div class="tabla-col acciones-col">
                        <button class="btn-accion upload">
                            <span class="material-symbols-rounded">upload</span>
                        </button>
                        <button class="btn-accion delete">
                            <span class="material-symbols-rounded">delete</span>
                        </button>
                        <button class="btn-accion view">
                            <span class="material-symbols-rounded">visibility</span>
                        </button>
                        <button class="btn-accion download">
                            <span class="material-symbols-rounded">download</span>
                        </button>
                    </div>
                </div>

                <div class="tabla-row">
                    <div class="tabla-col tipo-col">
                        <span class="doc-icon"></span>
                        <span>XXXXXXXX</span>
                    </div>
                    <div class="tabla-col">
                        <span class="estado-badge rechazado">Rechazado</span>
                    </div>
                    <div class="tabla-col">11/11/25</div>
                    <div class="tabla-col acciones-col">
                        <button class="btn-accion upload">
                            <span class="material-symbols-rounded">upload</span>
                        </button>
                        <button class="btn-accion delete">
                            <span class="material-symbols-rounded">delete</span>
                        </button>
                        <button class="btn-accion view">
                            <span class="material-symbols-rounded">visibility</span>
                        </button>
                        <button class="btn-accion download">
                            <span class="material-symbols-rounded">download</span>
                        </button>
                    </div>
                </div>

                <div class="tabla-row">
                    <div class="tabla-col tipo-col">
                        <span class="doc-icon"></span>
                        <span>XXXXXXXX</span>
                    </div>
                    <div class="tabla-col">
                        <span class="estado-badge subido">Subido</span>
                    </div>
                    <div class="tabla-col">11/11/25</div>
                    <div class="tabla-col acciones-col">
                        <button class="btn-accion upload">
                            <span class="material-symbols-rounded">upload</span>
                        </button>
                        <button class="btn-accion delete">
                            <span class="material-symbols-rounded">delete</span>
                        </button>
                        <button class="btn-accion view">
                            <span class="material-symbols-rounded">visibility</span>
                        </button>
                        <button class="btn-accion download">
                            <span class="material-symbols-rounded">download</span>
                        </button>
                    </div>
                </div>

                <div class="tabla-row">
                    <div class="tabla-col tipo-col">
                        <span class="doc-icon"></span>
                        <span>XXXXXXXX</span>
                    </div>
                    <div class="tabla-col">
                        <span class="estado-badge pendiente">Pendiente</span>
                    </div>
                    <div class="tabla-col">11/11/25</div>
                    <div class="tabla-col acciones-col">
                        <button class="btn-accion upload">
                            <span class="material-symbols-rounded">upload</span>
                        </button>
                        <button class="btn-accion delete">
                            <span class="material-symbols-rounded">delete</span>
                        </button>
                        <button class="btn-accion view">
                            <span class="material-symbols-rounded">visibility</span>
                        </button>
                        <button class="btn-accion download">
                            <span class="material-symbols-rounded">download</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    aspirante: {
        type: Object,
        required: true
    }
});
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
