<template>
    <div class="tab-panel">
        <div class="proceso-container">
            <!-- Información de Etapas -->
            <div class="etapas-info">
                <div class="etapa-item">
                    <span class="etapa-label">Etapa</span>
                    <span class="etapa-value">{{ etapaActual }}</span>
                </div>
                <div class="etapa-item">
                    <span class="etapa-label">Fecha de registro</span>
                    <span class="etapa-value">{{ fechaRegistro }}</span>
                </div>
                <div class="etapa-item">
                    <span class="etapa-label">Resultado de entrevista</span>
                    <span class="etapa-value">Aprobado</span>
                </div>
                <div class="etapa-item">
                    <span class="etapa-label">Resultado de examen</span>
                    <span class="etapa-value">80 / 100</span>
                </div>
                <div class="etapa-item">
                    <span class="etapa-label">Evaluador Asignado</span>
                    <span class="etapa-value">Lic. Recursos Humanos</span>
                </div>
            </div>

            <!-- Línea de Progreso -->
            <div class="progreso-linea">
                <div class="progreso-step" :class="claseEtapa('Registro')">
                    <div class="step-circle">
                        <span class="material-symbols-rounded">check</span>
                    </div>
                    <span class="step-label">Registro</span>
                </div>
                <div class="progreso-conexion" :class="claseConexion('Revisión')"></div>
                
                <div class="progreso-step" :class="claseEtapa('Revisión')">
                    <div class="step-circle">
                        <span class="material-symbols-rounded">check</span>
                    </div>
                    <span class="step-label">Revisión</span>
                </div>
                <div class="progreso-conexion" :class="claseConexion('Entrevista')"></div>
                
                <div class="progreso-step" :class="claseEtapa('Entrevista')">
                    <div class="step-circle">
                        <span class="material-symbols-rounded">check</span>
                    </div>
                    <span class="step-label">Entrevista</span>
                </div>
                <div class="progreso-conexion" :class="claseConexion('Evaluación')"></div>
                
                <div class="progreso-step" :class="claseEtapa('Evaluación')">
                    <div class="step-circle">
                        <span class="material-symbols-rounded">check</span>
                    </div>
                    <span class="step-label">Evaluación</span>
                </div>
                <div class="progreso-conexion" :class="claseConexion('Contratación')"></div>
                
                <div class="progreso-step" :class="claseEtapa('Contratación')">
                    <div class="step-circle">
                        <span class="material-symbols-rounded">check</span>
                    </div>
                    <span class="step-label">Contratación</span>
                </div>
            </div>

            <!-- Sección de Comentarios y Historial -->
            <div class="comentarios-historial-grid">
                <!-- Comentarios -->
                <div class="comentarios-box">
                    <h4>Comentarios</h4>
                    <textarea
                        v-model="comentario"
                        placeholder="Agregar un Comentario..."
                    ></textarea>
                    <button class="btn-comentar" @click="enviarComentario">COMENTAR</button>
                </div>

                <!-- Historial -->
                <div class="historial-box">
                    <div class="historial-item">
                        <span class="historial-text">
                            {{ comentarioActual || 'Sin comentarios registrados.' }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Botones de Acción -->
            <div class="proceso-acciones">
                <button class="btn-mover" @click="moverSiguienteEtapa">Mover a siguiente etapa</button>
            </div>
        </div>

        <!-- Notificación de Contratación Lista -->
        <transition name="slide-fade">
            <div v-if="mostrarNotificacionContratacion" class="notificacion-contratacion">
                <div class="notificacion-contenido">
                    <span class="material-symbols-rounded icono-success">check_circle</span>
                    <div class="notificacion-texto">
                        <h3>¡Aspirante listo para contratar!</h3>
                        <p>{{ nombreCompleto }} ha completado todas las etapas del proceso de selección y está listo para ser contratado.</p>
                    </div>
                    <button class="btn-cerrar-notificacion" @click="cerrarNotificacion">
                        <span class="material-symbols-rounded">close</span>
                    </button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';

const emit = defineEmits(['etapa-actualizada', 'comentario-enviado']);

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

const etapasOrdenadas = ['Registro', 'Revisión', 'Entrevista', 'Evaluación', 'Contratación'];

const etapaLocal = ref(props.aspirante.estadoProceso || 'Registro');
const comentario = ref('');
const mostrarNotificacionContratacion = ref(false);

const comentarioActual = computed(() => props.aspiracionLaboral?.comentario || '');

const nombreCompleto = computed(() => {
    const { nombre, apellidoPaterno, apellidoMaterno } = props.aspirante;
    return `${nombre || ''} ${apellidoPaterno || ''} ${apellidoMaterno || ''}`.trim();
});

// Verificar si está en etapa de contratación al montar
onMounted(() => {
    verificarEtapaContratacion();
});

watch(
    () => props.aspirante.estadoProceso,
    (nueva) => {
        etapaLocal.value = nueva || 'Registro';
        verificarEtapaContratacion();
    }
);

const verificarEtapaContratacion = () => {
    if (etapaLocal.value === 'Contratación') {
        mostrarNotificacionContratacion.value = true;
        // Auto-cerrar después de 8 segundos
        setTimeout(() => {
            mostrarNotificacionContratacion.value = false;
        }, 8000);
    }
};

const etapaActual = computed(() => etapaLocal.value);

const fechaRegistro = computed(() => props.aspirante.fechaRegistro || '');

const indiceEtapa = (nombreEtapa) => etapasOrdenadas.indexOf(nombreEtapa);

const claseEtapa = (nombreEtapa) => {
    const actualIndex = indiceEtapa(etapaActual.value);
    const etapaIndex = indiceEtapa(nombreEtapa);
    return etapaIndex <= actualIndex ? 'completado' : 'pendiente';
};

const claseConexion = (etapaDestino) => {
    const actualIndex = indiceEtapa(etapaActual.value);
    const destinoIndex = indiceEtapa(etapaDestino);
    return destinoIndex <= actualIndex ? 'completado' : 'pendiente';
};

const moverSiguienteEtapa = () => {
    let actualIndex = indiceEtapa(etapaActual.value);
    // Si la etapa actual no está en la lista, empezamos desde el inicio
    if (actualIndex < 0) {
        actualIndex = 0;
    }
    if (actualIndex >= etapasOrdenadas.length - 1) {
        return;
    }
    const siguienteEtapa = etapasOrdenadas[actualIndex + 1];
    etapaLocal.value = siguienteEtapa;
    emit('etapa-actualizada', siguienteEtapa);
    
    // Mostrar notificación si llegó a Contratación
    if (siguienteEtapa === 'Contratación') {
        mostrarNotificacionContratacion.value = true;
        setTimeout(() => {
            mostrarNotificacionContratacion.value = false;
        }, 8000);
    }
};

const enviarComentario = () => {
    if (!comentario.value.trim()) {
        return;
    }
    emit('comentario-enviado', comentario.value.trim());
    comentario.value = '';
};

const cerrarNotificacion = () => {
    mostrarNotificacionContratacion.value = false;
};
</script>

<style scoped>
.tab-panel {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.proceso-container {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
}

.etapas-info {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.etapa-item {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.etapa-label {
    font-weight: 600;
    color: #333;
    min-width: 200px;
}

.etapa-value {
    color: #666;
}

.progreso-linea {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2rem 0;
    position: relative;
}

.progreso-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    flex: 0 0 auto;
}

.step-circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #4caf50;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    transition: all 0.3s ease;
}

.progreso-step.pendiente .step-circle {
    background-color: #e0e0e0;
    color: #999;
}

.step-label {
    font-size: 0.85rem;
    font-weight: 500;
    color: #333;
    text-align: center;
}

.progreso-conexion {
    flex: 1;
    height: 4px;
    background-color: #4caf50;
    margin: 0 -10px;
    margin-bottom: 25px;
}

.progreso-conexion.pendiente {
    background-color: #e0e0e0;
}

.comentarios-historial-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
}

.comentarios-box {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.comentarios-box h4 {
    margin: 0;
    font-size: 1rem;
    color: #333;
    font-weight: 600;
}

.comentarios-box textarea {
    width: 100%;
    min-height: 100px;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: inherit;
    resize: vertical;
}

.btn-comentar {
    align-self: flex-start;
    padding: 0.6rem 1.5rem;
    background-color: transparent;
    border: 1px solid #7c4dff;
    color: #7c4dff;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn-comentar:hover {
    background-color: #7c4dff;
    color: white;
}

.historial-box {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.historial-item {
    padding: 0.8rem;
    background-color: #f5f5f5;
    border-radius: 4px;
}

.historial-text {
    color: #666;
    font-size: 0.9rem;
}

.proceso-acciones {
    display: flex;
    gap: 1rem;
    justify-content: center;
    padding-top: 1rem;
}

.btn-actualizar,
.btn-mover {
    padding: 0.8rem 2rem;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
}

.btn-actualizar {
    background-color: #4caf50;
    color: white;
}

.btn-actualizar:hover {
    background-color: #45a049;
}

.btn-mover {
    background-color: transparent;
    border: 2px solid #7c4dff;
    color: #7c4dff;
}

.btn-mover:hover {
    background-color: #7c4dff;
    color: white;
}

/* Notificación de Contratación */
.notificacion-contratacion {
    position: fixed;
    top: 2rem;
    right: 2rem;
    z-index: 9999;
    max-width: 450px;
    animation: slideInRight 0.5s ease-out;
}

.notificacion-contenido {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative;
}

.icono-success {
    font-size: 48px;
    color: #4ade80;
    flex-shrink: 0;
}

.notificacion-texto h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    font-weight: 600;
}

.notificacion-texto p {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.5;
    opacity: 0.95;
}

.btn-cerrar-notificacion {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;
}

.btn-cerrar-notificacion:hover {
    background-color: rgba(255, 255, 255, 0.2);
}

.btn-cerrar-notificacion .material-symbols-rounded {
    font-size: 20px;
}

/* Animaciones */
@keyframes slideInRight {
    0% {
        transform: translateX(400px);
        opacity: 0;
    }
    100% {
        transform: translateX(0);
        opacity: 1;
    }
}

.slide-fade-enter-active {
    transition: all 0.5s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.3s ease-in;
}

.slide-fade-enter-from {
    transform: translateX(400px);
    opacity: 0;
}

.slide-fade-leave-to {
    transform: translateX(400px);
    opacity: 0;
}

@media (max-width: 768px) {
    .notificacion-contratacion {
        right: 1rem;
        left: 1rem;
        max-width: none;
    }
    
    .notificacion-contenido {
        padding: 1rem;
    }
    
    .icono-success {
        font-size: 36px;
    }
    
    .notificacion-texto h3 {
        font-size: 1rem;
    }
    
    .notificacion-texto p {
        font-size: 0.875rem;
    }
}

@media (max-width: 1024px) {
    .comentarios-historial-grid {
        grid-template-columns: 1fr;
    }

    .progreso-linea {
        overflow-x: auto;
        padding: 1rem;
        justify-content: flex-start;
        gap: 1rem;
    }

    .proceso-acciones {
        flex-direction: column;
    }

    .btn-actualizar,
    .btn-mover {
        width: 100%;
    }
}

@media (max-width: 768px) {
    .tab-panel {
        padding: 1rem;
    }

    .etapa-item {
        flex-direction: column;
        align-items: flex-start;
    }

    .etapa-label {
        min-width: auto;
    }

    .progreso-linea {
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .progreso-conexion {
        display: none;
    }
}
</style>
