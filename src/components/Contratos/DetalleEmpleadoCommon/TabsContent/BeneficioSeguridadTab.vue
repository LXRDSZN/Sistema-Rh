<template>
    <div class="beneficios-seguridad-content">
        <h3>Beneficios y seguridad</h3>

        <div class="beneficios-table-container">
            <div class="beneficios-table">
                <div class="table-header">
                    <div class="col-beneficio">Beneficios y seguridad</div>
                    <div class="col-valor"></div>
                    <div class="col-estado">Estado</div>
                    <div class="col-accion"></div>
                </div>

                <div v-for="beneficio in beneficios" :key="beneficio.id" class="table-row">
                    <div class="col-beneficio">{{ beneficio.nombre }}</div>
                    <div class="col-valor">{{ beneficio.valor }}</div>
                    <div class="col-estado">
                        <span class="estado-badge" :class="{ activo: beneficio.activo, suspendido: !beneficio.activo }">
                            {{ beneficio.activo ? 'Activo' : 'Suspendido' }}
                        </span>
                    </div>
                    <div class="col-accion">
                        <button class="btn-toggle" :class="{ activo: beneficio.activo, suspendido: !beneficio.activo }"
                            @click="$emit('toggle-beneficio', beneficio)">
                            {{ beneficio.activo ? 'Desactivar' : 'Activar' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    beneficios: {
        type: Array,
        required: true
    }
});

defineEmits(['toggle-beneficio']);
</script>

<style scoped>
.beneficios-seguridad-content h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
    color: #333;
}

.beneficios-table-container {
    width: 100%;
}

.beneficios-table {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
}

.table-header,
.table-row {
    display: grid;
    grid-template-columns: 2fr 2fr 1.5fr 1.5fr;
    gap: 1rem;
    padding: 1rem 1.5rem;
    align-items: center;
}

.table-header {
    background-color: #f5f5f5;
    font-weight: 600;
    color: #333;
    border-bottom: 2px solid #e0e0e0;
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

.col-beneficio {
    font-weight: 500;
    color: #333;
}

.col-valor {
    color: #666;
}

.col-estado {
    display: flex;
    justify-content: center;
}

.estado-badge {
    display: inline-block;
    padding: 0.5rem 1.5rem;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    text-align: center;
    min-width: 120px;
}

.estado-badge.activo {
    background-color: #d1fae5;
    color: #059669;
}

.estado-badge.suspendido {
    background-color: #fee2e2;
    color: #dc2626;
}

.col-accion {
    display: flex;
    justify-content: center;
}

.btn-toggle {
    padding: 0.5rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 120px;
}

.btn-toggle.activo {
    background-color: #10b981;
    color: white;
}

.btn-toggle.activo:hover {
    background-color: #059669;
}

.btn-toggle.suspendido {
    background-color: #ef4444;
    color: white;
}

.btn-toggle.suspendido:hover {
    background-color: #dc2626;
}

@media (max-width: 1024px) {

    .table-header,
    .table-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
    }
}
</style>
