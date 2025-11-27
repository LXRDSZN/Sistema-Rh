<template>
    <div>
        <!-- Título -->
        <div class="titulo-section">
            <h2>ASPIRANTE</h2>
        </div>

        <!-- Información Principal -->
        <div class="info-principal">
            <div class="info-left">
                <img :src="aspirante.avatar || defaultAvatar" :alt="aspirante.nombre" class="avatar-grande"
                    @error="onImgError">
                <div class="datos-principales">
                    <h3>{{ aspirante.nombre }}</h3>
                    <div class="info-item">
                        <span class="label">CURP:</span>
                        <span class="value">{{ aspirante.curp || '----' }}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">RFC:</span>
                        <span class="value">{{ aspirante.rfc || '----' }}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">NSS:</span>
                        <span class="value">{{ aspirante.nss || '----' }}</span>
                    </div>
                </div>
            </div>

            <!-- Iconos de estado -->
            <div class="iconos-estado">
                <div class="icono-card" :class="{ 'disabled': !cvUrl }" @click="abrirCV" role="button" tabindex="0">
                    <span class="material-symbols-rounded">badge</span>
                    <span class="icono-label">CV</span>
                </div>

                <div 
                    class="icono-card" 
                    :class="{ 'disabled': !contratoHabilitado }" 
                    @click="contratoHabilitado && verContrato()" 
                    :title="contratoHabilitado ? 'Ver o crear contrato' : 'El aspirante debe estar en etapa de Contratación'"
                    role="button" 
                    :tabindex="contratoHabilitado ? 0 : -1"
                >
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
import { computed } from 'vue';
import { useAspirantesContratos } from '@/composables/useAspirantesContratos';

const props = defineProps({
    aspirante: {
        type: Object,
        required: true
    },
    // opcional: si el padre ya trae precargada la URL
    cvUrl: {
        type: String,
        default: null
    }
});

const emit = defineEmits(['crear-contrato']);

// Avatar por defecto
const defaultAvatar = '/src/assets/default-user.png';

// Computed para verificar si el contrato debe estar habilitado
const contratoHabilitado = computed(() => {
    // El botón se habilita solo cuando la etapa es "Contratación"
    const etapa = props.aspirante.etapa || props.aspirante.estadoProceso || '';
    return etapa.toLowerCase().includes('contratación') || etapa.toLowerCase().includes('contratacion');
});

const onImgError = (event) => {
    event.target.onerror = null;
    event.target.src = defaultAvatar;
};

const formatearFecha = (fecha) => {
    if (!fecha) return '16/08/2025';
    
    // Si ya viene en formato DD/MM/YYYY, retornarla tal cual
    if (typeof fecha === 'string' && fecha.includes('/')) return fecha;
    
    // Si viene como objeto Date o string ISO, formatear con UTC
    const date = new Date(fecha);
    const dia = String(date.getUTCDate()).padStart(2, '0');
    const mes = String(date.getUTCMonth() + 1).padStart(2, '0');
    const anio = date.getUTCFullYear();
    return `${dia}/${mes}/${anio}`;
};

const { obtenerCvAspirante } = useAspirantesContratos();

const abrirCV = async () => {
    try {
        // 1) Si ya viene la URL por prop, úsala directo
        let url = props.cvUrl;

        // 2) Si no hay URL, la pedimos al backend
        if (!url) {
            const personaId = props.aspirante.persona_id || props.aspirante.id;

            if (!personaId) {
                alert('No se encontró el identificador del aspirante.');
                return;
            }

            url = await obtenerCvAspirante(personaId);
        }

        // 3) Validar resultado
        if (!url) {
            alert('Este aspirante no tiene CV cargado.');
            return;
        }

        // 4) Abrir el PDF en una pestaña nueva
        window.open(url, '_blank');
    } catch (error) {
        console.error('Error al abrir el CV del aspirante:', error);
        alert('Ocurrió un error al intentar abrir el CV. Intenta de nuevo más tarde.');
    }
};

const verContrato = () => {
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
    opacity: 0.4;
    cursor: not-allowed;
    background-color: #f5f5f5;
    pointer-events: none;
}

.icono-card.disabled .material-symbols-rounded,
.icono-card.disabled .icono-label {
    color: #9e9e9e !important;
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
