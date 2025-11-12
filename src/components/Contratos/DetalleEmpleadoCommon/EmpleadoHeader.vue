<template>
    <div class="employee-info">
        <div class="employee-avatar">
            <img :src="empleado.avatar" :alt="empleado.nombre" />
        </div>

        <div class="employee-details">
            <h3>{{ empleado.nombre }}</h3>
            <p>PUESTO: {{ empleado.puesto }}</p>
            <p>ÁREA: {{ empleado.area }}</p>
            <button class="btn-ver-contrato" @click="$emit('ver-contrato')">Ver contrato actual</button>
        </div>

        <div class="employee-status">
            <div class="status-item">
                <span class="status-label">Estado</span>
                <span class="status-value" :class="empleado.estadoClase">{{ empleado.estadoTexto }}</span>
            </div>
            <div class="status-item">
                <span class="status-label">Fecha de Ingreso:</span>
                <span class="status-value">{{ empleado.fechaRegistro }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    empleado: {
        type: Object,
        required: true
    }
});

defineEmits(['ver-contrato']);
</script>

<style scoped>
.employee-info {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 2rem;
    align-items: center;
    padding: 2rem;
    background-color: #f9f9f9;
    border-radius: 12px;
    margin-bottom: 2rem;
}

.employee-avatar img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
}

.employee-details h3 {
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: #333;
}

.employee-details p {
    margin: 0.25rem 0;
    color: #666;
    font-size: 0.95rem;
}

.btn-ver-contrato {
    margin-top: 1rem;
    padding: 0.75rem 2rem;
    background-color: #9370db;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.btn-ver-contrato:hover {
    background-color: #7b5cb8;
}

.employee-status {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    text-align: right;
}

.status-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.status-label {
    font-size: 0.9rem;
    color: #666;
}

.status-value {
    font-size: 1.1rem;
    font-weight: 600;
}

.status-value.activo {
    color: #10b981;
}

.status-value.baja {
    color: #ef4444;
}

@media (max-width: 1024px) {
    .employee-info {
        grid-template-columns: 1fr;
        text-align: center;
    }

    .employee-status {
        text-align: center;
    }
}
</style>
