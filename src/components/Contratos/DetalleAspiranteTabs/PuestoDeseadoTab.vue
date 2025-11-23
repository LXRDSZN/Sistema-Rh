<template>
    <div class="tab-panel">
        <div class="puesto-deseado-grid">
            <!-- Columna Izquierda -->
            <div class="puesto-columna">
                <!-- Área o departamento -->
                <div class="puesto-item">
                    <div class="puesto-icon">
                        <span class="material-symbols-rounded">corporate_fare</span>
                    </div>
                    <div class="puesto-info">
                        <span class="puesto-label">Área o departamento deseado:</span>
                        <span class="puesto-value">{{ areaMostrada }}</span>
                    </div>
                </div>

                <!-- Puesto solicitado -->
                <div class="puesto-item">
                    <div class="puesto-icon">
                        <span class="material-symbols-rounded">computer</span>
                    </div>
                    <div class="puesto-info">
                        <span class="puesto-label">Puesto solicitado:</span>
                        <span class="puesto-value">{{ puestoFormateado }}</span>
                    </div>
                </div>

                <!-- Tipo de contrato -->
                <div class="puesto-item">
                    <div class="puesto-icon">
                        <span class="material-symbols-rounded">description</span>
                    </div>
                    <div class="puesto-info">
                        <span class="puesto-label">Tipo de contrato:</span>
                        <span class="puesto-value">{{ tipoContratoMostrado }}</span>
                    </div>
                </div>
            </div>

            <!-- Columna Derecha -->
            <div class="puesto-columna">
                <!-- Jornada -->
                <div class="puesto-item">
                    <div class="puesto-icon-circle">
                        <span class="puesto-icon-letter">W</span>
                    </div>
                    <div class="puesto-info">
                        <span class="puesto-label">Jornada:</span>
                        <span class="puesto-value">{{ jornadaMostrada }}</span>
                    </div>
                </div>

                <!-- Modalidad -->
                <div class="puesto-item">
                    <div class="puesto-icon">
                        <span class="material-symbols-rounded">work</span>
                    </div>
                    <div class="puesto-info">
                        <span class="puesto-label">Modalidad:</span>
                        <span class="puesto-value">{{ modalidadMostrada }}</span>
                    </div>
                </div>

                <!-- Domicilio -->
                <div class="puesto-item">
                    <div class="puesto-icon">
                        <span class="material-symbols-rounded">home</span>
                    </div>
                    <div class="puesto-info">
                        <span class="puesto-label">Domicilio:</span>
                        <span class="puesto-value">{{ aspirante.domicilio || '----XXXXXXXX' }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    aspirante: {
        type: Object,
        required: true
    },
    aspiracionLaboral: {
        type: Object,
        default: null
    }
});

/**
 * Formatea el nombre del puesto para mostrarlo en la UI
 */
const formatearNombrePuesto = (nombre) => {
  const formato = {
    'ADMIN': 'Admin',
    'EMPLEADO': 'Empleado',
    'JEFE_AREA': 'Jefe de Área',
    'JEFE_RH': 'Jefe de Recursos Humanos',
    'JEFE_ASISTENCIAS': 'Jefe de Asistencias',
    'JEFE_CONTRATOS': 'Jefe de Contratos',
    'JEFE_VACACIONES': 'Jefe de Vacaciones',
    'JEFE_INCIDENCIAS': 'Jefe de Incidencias'
  };
  return formato[nombre] || nombre;
};

/**
 * Computed property para formatear el puesto deseado
 */
const puestoFormateado = computed(() => {
  const nombrePuesto = props.aspiracionLaboral?.puesto || props.aspirante.puesto;
  return formatearNombrePuesto(nombrePuesto) || '----';
});

const areaMostrada = computed(() => {
  return (props.aspiracionLaboral && props.aspiracionLaboral.area) || props.aspirante.area || '----';
});

const tipoContratoMostrado = computed(() => {
  return (props.aspiracionLaboral && props.aspiracionLaboral.tipo_contrato) || '----';
});

const jornadaMostrada = computed(() => {
  return (props.aspiracionLaboral && props.aspiracionLaboral.jornada) || '----';
});

const modalidadMostrada = computed(() => {
  return (props.aspiracionLaboral && props.aspiracionLaboral.modalidad) || '----';
});
</script>

<style scoped>
.tab-panel {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.puesto-deseado-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
}

.puesto-columna {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.puesto-item {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
}

.puesto-icon {
    width: 60px;
    height: 60px;
    background-color: #7c4dff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.puesto-icon .material-symbols-rounded {
    color: white;
    font-size: 28px;
}

.puesto-icon-circle {
    width: 60px;
    height: 60px;
    border: 3px solid #7c4dff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.puesto-icon-letter {
    font-size: 24px;
    font-weight: 700;
    color: #7c4dff;
}

.puesto-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.puesto-label {
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
}

.puesto-value {
    color: #666;
    font-size: 0.9rem;
}

@media (max-width: 1024px) {
    .puesto-deseado-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
    }
}

@media (max-width: 768px) {
    .tab-panel {
        padding: 1rem;
    }
}
</style>
