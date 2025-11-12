<template>
    <div class="contrato-actual-content">
        <h3>Contrato Actual</h3>

        <div class="info-grid">
            <div class="info-item">
                <span class="label">Tipo de contrato:</span>
                <span class="value">{{ contrato.tipoContrato }}</span>
            </div>
            <div class="info-item">
                <span class="label">Fecha de inicio/fin:</span>
                <span class="value">{{ contrato.fechaInicioFin }}</span>
            </div>
            <div class="info-item">
                <span class="label">Salario base:</span>
                <span class="value">{{ contrato.salarioBase }}</span>
            </div>
            <div class="info-item">
                <span class="label">Jornada laboral y horario:</span>
                <span class="value">{{ contrato.jornadaHorario }}</span>
            </div>
            <div class="info-item">
                <span class="label">Estado de firma:</span>
                <span class="value">{{ contrato.estadoFirma }}</span>
            </div>
        </div>

        <button class="btn-renovar" @click="$emit('renovar')">Renovar</button>
    </div>
</template>

<script setup>
defineProps({
    contrato: {
        type: Object,
        required: true
    }
});

defineEmits(['renovar']);
</script>

<style scoped>
.contrato-actual-content h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
    color: #333;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.info-item {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 8px;
}

.info-item .label {
    font-weight: 600;
    color: #333;
}

.info-item .value {
    color: #666;
}

.btn-renovar {
    padding: 0.85rem 2rem;
    background-color: #9370db;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.btn-renovar:hover {
    background-color: #7b5cb8;
}

@media (max-width: 1024px) {
    .info-grid {
        grid-template-columns: 1fr;
    }
}
</style>
