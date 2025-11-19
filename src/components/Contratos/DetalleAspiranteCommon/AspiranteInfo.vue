<template>
    <div>
        <!-- Título -->
        <div class="titulo-section">
            <h2>ASPIRANTE</h2>
        </div>

        <!-- Información Principal -->
        <div class="info-principal">
            <div class="info-left">
                <img :src="aspirante.avatar" :alt="aspirante.nombre" class="avatar-grande">
                <div class="datos-principales">
                    <h3>{{ aspirante.nombre }}</h3>
                    <div class="info-item">
                        <span class="label">CURP:</span>
                        <span class="value">{{ aspirante.curp || 'XXXXXXXXXXXXXXXXXXXX' }}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">RFC:</span>
                        <span class="value">{{ aspirante.rfc || 'XXXXXXXXXXXXXXXXXXXX' }}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">NSS:</span>
                        <span class="value">{{ aspirante.nss || 'XXXXXXXXXXXXXXXXXXXX' }}</span>
                    </div>
                </div>
            </div>

            <!-- Iconos de estado -->
            <div class="iconos-estado">
                <div class="icono-card" :class="{ 'disabled': !cvUrl }" @click="abrirCV" role="button" tabindex="0">
                    <span class="material-symbols-rounded">badge</span>
                    <span class="icono-label">CV</span>
                </div>

                <div class="icono-card" @click="verContrato" role="button" tabindex="0">
                    <span class="material-symbols-rounded">description</span>
                    <span class="icono-label">Contrato</span>
                </div>
            </div>

            <!-- Estado y Fecha -->
            <div class="info-right">
                <div class="estado-box">
                    <span class="label">Estado del proceso</span>
                    <span class="estado-valor">{{ aspirante.estadoProceso || 'EN REVISIÓN' }}</span>
                </div>
                <div class="fecha-box">
                    <span class="label">Fecha de Registro:</span>
                    <span class="fecha-valor">{{ formatearFecha(aspirante.fechaRegistro) }}</span>
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
    cvUrl: {
        type: String,
        default: null
    }
});

const emit = defineEmits(['crear-contrato']);

const formatearFecha = (fecha) => {
    if (!fecha) return '16/08/2025';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const abrirCV = () => {
    if (props.cvUrl) {
        window.open(props.cvUrl, '_blank');
    } else {
        alert('Este aspirante no tiene CV cargado');
    }
};


const verContrato = () => {
    // Emitir evento con los datos del aspirante
    emit('crear-contrato', props.aspirante);
};
</script>

<style scoped>
.titulo-section {
    background-color: white;
    padding: 1rem;
    text-align: center;
    margin-bottom: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.titulo-section h2 {
    margin: 0;
    color: #7c4dff;
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: 0.5px;
}

.info-principal {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    gap: 2rem;
    align-items: flex-start;
    margin-bottom: 1.5rem;
}

.info-left {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
}

.avatar-grande {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
}

.datos-principales h3 {
    margin: 0 0 1rem 0;
    font-size: 1.25rem;
    color: #333;
    font-weight: 700;
}

.info-item {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.info-item .label {
    font-weight: 600;
    color: #333;
}

.info-item .value {
    color: #666;
}

.iconos-estado {
    display: flex;
    gap: 1rem;
    flex-shrink: 0;
}

.icono-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    min-width: 70px;
    cursor: pointer;
    transition: all 0.2s;
}

.icono-card:hover:not(.disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.icono-card.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}


.icono-card .material-symbols-rounded {
    font-size: 28px;
}

.icono-card:nth-child(1) {
    border-color: #7c4dff;
}

.icono-card:nth-child(1) .material-symbols-rounded {
    color: #7c4dff;
}

.icono-card:nth-child(2) {
    border-color: #666;
}

.icono-card:nth-child(2) .material-symbols-rounded {
    color: #666;
}

.icono-card:nth-child(3) {
    border-color: #4caf50;
}

.icono-card:nth-child(3) .material-symbols-rounded {
    color: #4caf50;
}

.icono-label {
    font-size: 0.85rem;
    font-weight: 500;
    color: #333;
}

.info-right {
    margin-left: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-end;
}

.estado-box,
.fecha-box {
    text-align: right;
}

.label {
    display: block;
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 0.25rem;
}

.estado-valor {
    display: block;
    color: #7c4dff;
    font-weight: 600;
    font-size: 1rem;
}

.fecha-valor {
    display: block;
    color: #333;
    font-weight: 600;
    font-size: 1rem;
}

@media (max-width: 1024px) {
    .info-principal {
        flex-direction: column;
        align-items: stretch;
    }

    .info-left {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .iconos-estado {
        justify-content: center;
    }

    .info-right {
        width: 100%;
        align-items: center;
        text-align: center;
    }

    .estado-box,
    .fecha-box {
        text-align: center;
    }
}

@media (max-width: 768px) {
    .info-principal {
        padding: 1.5rem;
    }
}
</style>
