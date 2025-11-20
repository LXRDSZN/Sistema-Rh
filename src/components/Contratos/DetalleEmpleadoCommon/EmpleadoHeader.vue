<template>
    <div class="employee-info">
        <!-- Avatar del empleado -->
        <div class="employee-avatar">
            <img :src="empleado.avatar || defaultAvatar" :alt="empleado.nombre" @error="onImgError" />
        </div>

        <!-- Información del empleado -->
        <div class="employee-details">
            <h3>{{ empleado.nombre }}</h3>
            <p><strong>PUESTO:</strong> {{ empleado.puesto || 'XXXXXXXXXXXXXXXX' }}</p>
            <p><strong>ÁREA:</strong> {{ empleado.area || 'XXXXXXXXXXXXXXXXXX' }}</p>

            <!-- Botones de acción -->
            <div class="action-buttons">
                <button class="btn-action btn-contrato" @click="$emit('ver-contrato')">
                    <span class="material-symbols-rounded">description</span>
                    <span>Contrato</span>
                </button>
                <button class="btn-action btn-renovar" @click="$emit('renovar-contrato')">
                    <span class="material-symbols-rounded">autorenew</span>
                    <span>Renovar</span>
                </button>
            </div>
        </div>

        <!-- Estado y fecha de ingreso -->
        <div class="employee-status">
            <div class="status-item">
                <span class="status-label">Estado</span>
                <span class="status-value" :class="empleado.estadoClase">
                    {{ empleado.estadoTexto || 'ACTIVO' }}
                </span>
            </div>
            <div class="status-item">
                <span class="status-label">Fecha de Ingreso:</span>
                <span class="status-value">{{ formatearFecha(empleado.fechaRegistro) }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    empleado: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['ver-contrato', 'renovar-contrato']);

// Avatar por defecto
const defaultAvatar = '/src/assets/default-user.png';

const onImgError = (event) => {
    event.target.onerror = null;
    event.target.src = defaultAvatar;
};

// Función para formatear fecha
const formatearFecha = (fecha) => {
    if (!fecha) return '16/08/2023';

    // Si ya viene en formato DD/MM/YYYY, retornarla tal cual
    if (fecha.includes('/')) return fecha;

    // Si viene como objeto Date o string ISO, formatear
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:wght@400;700&display=swap');

.employee-info {
    display: grid;
    grid-template-columns: 140px 1fr auto;
    gap: 2rem;
    align-items: center;
    padding: 2rem;
    background-color: white;
    border-radius: 16px;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.employee-avatar {
    position: relative;
}

.employee-avatar img {
    width: 130px;
    height: 130px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #f0f0f0;
}

.employee-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.employee-details h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: #1a1a1a;
}

.employee-details p {
    margin: 0.25rem 0;
    color: #333;
    font-size: 0.95rem;
    line-height: 1.6;
}

.employee-details p strong {
    font-weight: 600;
    color: #666;
}

.action-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.btn-action {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: 2px solid;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: white;
}

.btn-action .material-symbols-rounded {
    font-size: 22px;
}

.btn-contrato {
    border-color: #10b981;
    color: #10b981;
}

.btn-contrato:hover {
    background-color: #10b981;
    color: white;
}

.btn-renovar {
    border-color: #f59e0b;
    color: #f59e0b;
}

.btn-renovar:hover {
    background-color: #f59e0b;
    color: white;
}

.employee-status {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    text-align: right;
}

.status-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.status-label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-value {
    font-size: 1.2rem;
    font-weight: 700;
    color: #333;
}

.status-value.activo {
    color: #7c3aed;
}

.status-value.baja {
    color: #ef4444;
}

.status-value.en-proceso {
    color: #f59e0b;
}

.status-value.vencido {
    color: #ef4444;
}
.status-value.indefinido {
    color: #7c3aed;
}

/* Responsive */
@media (max-width: 1024px) {
    .employee-info {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 1.5rem;
    }

    .employee-avatar {
        margin: 0 auto;
    }

    .employee-details {
        align-items: center;
    }

    .action-buttons {
        justify-content: center;
    }

    .employee-status {
        text-align: center;
        gap: 1rem;
    }
}

@media (max-width: 640px) {
    .action-buttons {
        flex-direction: column;
        width: 100%;
    }

    .btn-action {
        width: 100%;
        justify-content: center;
    }

    .employee-avatar img {
        width: 100px;
        height: 100px;
    }
}
</style>
