<template>
    <div class="enlace-crear-contrato">
        <!-- Header con flecha y título -->
        <div class="top-header">
            <!-- Usa confirmarSalida para validar si hay cambios -->
            <button class="btn-back" @click="confirmarSalida">
                <span class="material-symbols-rounded">arrow_back</span>
            </button>
            <h1>Contrato/Creación</h1>
        </div>

        <div class="content-box">
            <h2 class="section-title">
                <!-- Podrías hacerlo dinámico después (CONTRATO NUEVO / RENOVAR CONTRATO) -->
                CONTRATO NUEVO
            </h2>

            <!-- Datos Personales -->
            <div class="form-section">
                <h3 class="subsection-title">Datos Personales</h3>

                <!-- Foto placeholder y Nombre completo -->
                <div class="form-row">
                    <div class="form-group" style="grid-column: 1 / 2;">
                        <div class="photo-placeholder">
                            <div v-if="fotoUrl" class="photo-box-with-image">
                                <img :src="fotoUrl" alt="Foto aspirante" class="aspirante-foto">
                            </div>
                            <div v-else class="photo-box">
                                <span class="material-symbols-rounded">person</span>
                            </div>
                        </div>
                    </div>
                    <div class="form-group" style="grid-column: 2 / 4;">
                        <label>Nombre Completo</label>
                        <div class="inline-fields">
                            <input type="text" v-model="formData.nombre" placeholder="Nombre" class="form-input"
                                @input="limpiarYFormatearNombre('nombre', $event)">
                            <input type="text" v-model="formData.apellidoPaterno" placeholder="Apellido Paterno"
                                class="form-input" @input="limpiarYFormatearNombre('apellidoPaterno', $event)">
                            <input type="text" v-model="formData.apellidoMaterno" placeholder="Apellido Materno"
                                class="form-input" @input="limpiarYFormatearNombre('apellidoMaterno', $event)">
                        </div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Tipo de Contrato</label>
                        <select v-model="formData.tipoContrato" class="form-select">
                            <option value="">Seleccione tipo</option>
                            <option value="Indeterminado">Indeterminado</option>
                            <option value="Temporal">Temporal</option>
                            <option value="Por Proyecto">Por Proyecto</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Fecha de inicio</label>
                        <input type="date" v-model="formData.fechaInicio" class="form-input" :min="minFechaInicio"
                            :max="maxFechaInicio" @change="validarFechaInicio">
                    </div>
                    <div class="form-group">
                        <label>Fecha de término</label>
                        <input type="date" v-model="formData.fechaTermino" class="form-input"
                            :disabled="formData.tipoContrato === 'Indeterminado'"
                            :min="minFechaTermino || minFechaInicio" @change="validarFechaTermino">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Proyecto (en caso de aplicar)</label>
                        <!-- Este campo NO se guardará en BD, solo sirve para el PDF -->
                        <input type="text" v-model="formData.proyecto" class="form-input"
                            placeholder="Nombre del proyecto">
                    </div>
                    <div class="form-group">
                        <label>Sueldo Mensual</label>
                        <input type="text" v-model="formData.sueldoMensual" class="form-input" placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <label>Modalidad</label>
                        <select v-model="formData.modalidad" class="form-select">
                            <option value="">Seleccione modalidad</option>
                            <option value="Presencial">Presencial</option>
                            <option value="Remoto">Remoto</option>
                            <option value="Híbrido">Híbrido</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group full-width">
                        <label>Observaciones</label>
                        <textarea v-model="formData.observaciones" class="form-textarea" rows="4"></textarea>
                    </div>
                </div>
            </div>

            <!-- Asignación Laboral -->
            <div class="form-section">
                <h3 class="subsection-title">Asignación Laboral</h3>

                <div class="form-row">
                    <div class="form-group">
                        <label>Área</label>
                        <!-- Cuando conectes catálogos, aquí irán las áreas de BD -->
                        <select v-model="formData.area" class="form-select">
                            <option value="">Seleccione área</option>
                            <option value="Contratos">Contratos</option>
                            <option value="Asistencias">Asistencias</option>
                            <option value="Incidencias">Incidencias</option>
                            <option value="Vacaciones">Vacaciones</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Puesto</label>
                        <select v-model="formData.puesto" class="form-select">
                            <option value="">Seleccione puesto</option>
                            <option value="Gerente">Gerente</option>
                            <option value="Supervisor">Supervisor</option>
                            <option value="Analista">Analista</option>
                            <option value="Asistente">Asistente</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Jornada Laboral</label>
                        <select v-model="formData.jornadaLaboral" class="form-select">
                            <option value="">Seleccione tipo</option>
                            <option value="Completa">Completa</option>
                            <option value="Parcial">Parcial</option>
                            <option value="Por turnos">Por turnos</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Plantilla Contrato</label>
                        <select v-model="formData.plantillaContrato" class="form-select">
                            <option value="">Seleccione</option>
                            <option value="Plantilla A">Plantilla A</option>
                            <option value="Plantilla B">Plantilla B</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Estado del contrato</label>
                        <select v-model="formData.estadoContrato" class="form-select">
                            <option value="">Seleccione</option>
                            <option value="Activo">Activo</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Finalizado">Finalizado</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Entrada</label>
                        <input type="time" v-model="formData.entrada" class="form-input time-input">
                    </div>
                    <div class="form-group">
                        <label>Salida</label>
                        <input type="time" v-model="formData.salida" class="form-input time-input">
                    </div>
                </div>
            </div>

            <!-- Documentos Asociados -->
            <div class="form-section">
                <h3 class="subsection-title">Documentos Asociados</h3>

                <div class="form-row">
                    <div class="form-group">
                        <label>Tipo de Documento</label>
                        <select v-model="formData.tipoDocumento" class="form-select">
                            <option value="">Seleccione</option>
                            <option value="REGlAMENTO">Reglamento</option>
                            <option value="CONTRATO">Contrato</option>
                            <option value="ANEXO">Anexo</option>
                            <option value="IDENTIFICACION">Identificación</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Subir documento (PDF)</label>
                        <input type="text" v-model="formData.documento" placeholder="Seleccione" class="form-input">
                    </div>
                </div>
            </div>

            <!-- Acciones -->
            <div class="form-section">
                <h3 class="subsection-title">Acciones</h3>

                <div class="form-row">
                    <div class="form-group">
                        <label>Fecha de Generación</label>
                        <input type="date" v-model="formData.fechaGeneracion" class="form-input" :max="maxFechaInicio">
                    </div>
                </div>
            </div>

            <!-- Botones de acción -->
            <div class="form-actions">
                <button class="btn-guardar" @click="guardarContrato">
                    <span class="material-symbols-rounded">save</span>
                    Guardar
                </button>
                <button class="btn-limpiar" @click="enviarLimpiar">
                    <span class="material-symbols-rounded">edit</span>
                    Limpiar
                </button>

            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useAspirantesContratos } from '@/composables/useAspirantesContratos';

const props = defineProps({
    datosAspirante: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['volver-inicio']);

const { obtenerAspiracionLaboralAspirante } = useAspirantesContratos();

// Variables ref
const fotoUrl = ref(null);

// Datos del formulario
const formData = ref({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    tipoContrato: '',
    fechaInicio: '',
    fechaTermino: '',
    proyecto: '',
    sueldoMensual: '',
    modalidad: '',
    observaciones: '',
    area: '',
    puesto: '',
    jornadaLaboral: '',
    plantillaContrato: '',
    estadoContrato: '',
    entrada: '',
    salida: '',
    tipoDocumento: '',
    documento: '',
    fechaGeneracion: ''
});

// ======== Helpers de fechas ========
const obtenerHoy = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};

const formatearFechaInput = (fecha) => {
    const d = new Date(fecha);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
};

const hoyDate = obtenerHoy();
const minFechaInicio = ref(formatearFechaInput(hoyDate));

const fechaMax = new Date(hoyDate.getTime());
fechaMax.setMonth(fechaMax.getMonth() + 3); // +3 meses
const maxFechaInicio = ref(formatearFechaInput(fechaMax));

const hoyISO = minFechaInicio.value;

const minFechaTermino = computed(() => {
    if (!formData.value.fechaInicio) return '';
    const d = new Date(formData.value.fechaInicio);
    d.setMonth(d.getMonth() + 1); // al menos 1 mes después
    return formatearFechaInput(d);
});

// ======== Manejo de estado inicial para detectar cambios ========
const initialFormData = ref({ ...formData.value });

const actualizarEstadoInicial = () => {
    initialFormData.value = JSON.parse(JSON.stringify(formData.value));
};

const hayCambiosEnFormulario = () => {
    return JSON.stringify(formData.value) !== JSON.stringify(initialFormData.value);
};

// ======== Carga de datos del aspirante + aspiración laboral (LOAD) ========
const cargarDatosAspirante = async () => {
    // 1) Datos que vienen del listado (foto, nombre, apellidos)
    if (props.datosAspirante) {
        formData.value.nombre = props.datosAspirante.nombreSolo || props.datosAspirante.nombre || '';
        formData.value.apellidoPaterno = props.datosAspirante.apellidoPaterno || '';
        formData.value.apellidoMaterno = props.datosAspirante.apellidoMaterno || '';
        fotoUrl.value = props.datosAspirante.avatar || null;
    }

    // 2) Consulta "Aspirante (primer contrato)" para aspiración laboral
    const personaId = props.datosAspirante?.persona_id;
    if (personaId) {
        try {
            const datos = await obtenerAspiracionLaboralAspirante(personaId);
            if (datos) {
                // Si vienen datos de nombre y foto y no estaban, los usamos
                if (!formData.value.nombre) formData.value.nombre = datos.nombre || '';
                if (!formData.value.apellidoPaterno) formData.value.apellidoPaterno = datos.apellido_paterno || '';
                if (!formData.value.apellidoMaterno) formData.value.apellidoMaterno = datos.apellido_materno || '';
                if (!fotoUrl.value) fotoUrl.value = datos.foto_url || null;

                // Tipo de contrato, modalidad, fecha disponible
                formData.value.tipoContrato = datos.tipo_contrato || '';
                formData.value.modalidad = datos.modalidad || '';

                if (datos.fecha_disponible) {
                    formData.value.fechaInicio = formatearFechaInput(datos.fecha_disponible);
                }

                // Si luego conectas catálogos de BD, aquí puedes asignar:
                // formData.value.area = datos.area_id;
                // formData.value.puesto = datos.puesto_id;
                // formData.value.jornadaLaboral = datos.jornada_id;
            }
        } catch (error) {
            console.warn('No se pudo cargar aspiración laboral del aspirante:', error);
        }
    }

    // 3) Fecha de generación por defecto = hoy
    if (!formData.value.fechaGeneracion) {
        formData.value.fechaGeneracion = hoyISO;
    }

    actualizarEstadoInicial();
};

// ======== Validaciones ========
// Nombre Completo: solo letras y capitalizar
const limpiarYFormatearNombre = (campo, event) => {
    let valor = event.target.value || '';

    // Solo letras (incluye tildes y ñ) y espacios
    valor = valor.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, '');
    // Quitar espacios dobles
    valor = valor.replace(/\s+/g, ' ');
    // Quitar espacios al inicio
    valor = valor.replace(/^\s+/, '');

    // Capitalizar cada palabra
    valor = valor.replace(/\b\w+/g, (palabra) => {
        return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
    });

    formData.value[campo] = valor;
};

// Fecha de inicio: hoy <= fechaInicio <= hoy+3 meses
const validarFechaInicio = () => {
    if (!formData.value.fechaInicio) return;

    const fi = new Date(formData.value.fechaInicio);
    fi.setHours(0, 0, 0, 0);

    if (fi < hoyDate || fi > fechaMax) {
        alert('La fecha de inicio debe ser a partir de hoy y no mayor a tres meses.');
        formData.value.fechaInicio = '';
        return;
    }

    // Si ya había fecha de término, la validamos de nuevo
    if (formData.value.fechaTermino) {
        validarFechaTermino();
    }
};

// Fecha de término: al menos 1 mes después de inicio; vacía si es indeterminado
const validarFechaTermino = () => {
    if (formData.value.tipoContrato === 'Indeterminado') {
        formData.value.fechaTermino = '';
        return;
    }

    if (!formData.value.fechaInicio) {
        alert('Primero selecciona la fecha de inicio.');
        formData.value.fechaTermino = '';
        return;
    }

    if (!formData.value.fechaTermino) return;

    const fi = new Date(formData.value.fechaInicio);
    const ft = new Date(formData.value.fechaTermino);
    fi.setHours(0, 0, 0, 0);
    ft.setHours(0, 0, 0, 0);

    const minFin = new Date(fi.getTime());
    minFin.setMonth(minFin.getMonth() + 1);

    if (ft < minFin) {
        alert('La fecha de término debe ser al menos un mes después de la fecha de inicio.');
        formData.value.fechaTermino = '';
    }
};

// Si cambia Tipo de contrato a Indeterminado, limpiamos fecha de término
watch(
    () => formData.value.tipoContrato,
    (nuevo) => {
        if (nuevo === 'Indeterminado') {
            formData.value.fechaTermino = '';
        }
    }
);

// ======== Lógica de salida con confirmación ========
const confirmarSalida = () => {
    const hayCambios = hayCambiosEnFormulario();

    const mensaje = hayCambios
        ? 'Tienes cambios sin guardar. ¿Deseas descartar los cambios y salir?'
        : 'No has capturado información en el formulario. ¿Deseas salir de la ventana?';

    if (window.confirm(mensaje)) {
        emit('volver-inicio');
    }
};

// Guardar contrato (aquí después conectarás con la API que haga los 4 pasos de tus consultas)
const guardarContrato = () => {
    // Validar campos requeridos mínimos
    if (!formData.value.nombre || !formData.value.apellidoPaterno || !formData.value.area) {
        alert('Por favor complete los campos requeridos (Nombre, Apellido Paterno y Área).');
        return;
    }

    if (!formData.value.tipoContrato || !formData.value.fechaInicio) {
        alert('Tipo de contrato y fecha de inicio son obligatorios.');
        return;
    }

    console.log('Guardando contrato (pendiente conectar con API):', formData.value);
    alert('Contrato guardado exitosamente (simulado).');

    // Consideramos este estado como "guardado"
    actualizarEstadoInicial();

    // Volver al inicio después de guardar
    setTimeout(() => {
        emit('volver-inicio');
    }, 500);
};

// Limpiar formulario
const enviarLimpiar = () => {
    Object.keys(formData.value).forEach(key => {
        formData.value[key] = '';
    });

    // Foto precargada del aspirante no se borra
    // Si quisieras borrarla también, descomenta:
    // fotoUrl.value = null;

    console.log('Formulario limpiado');
    alert('Formulario limpiado correctamente');

    formData.value.fechaGeneracion = hoyISO;

    actualizarEstadoInicial();
};

// Watch para cambios en props.datosAspirante
watch(
    () => props.datosAspirante,
    () => {
        cargarDatosAspirante();
    },
    { deep: true }
);

// Cargar datos al montar
onMounted(() => {
    cargarDatosAspirante();
});
</script>

<style scoped>
.enlace-crear-contrato {
    max-width: 1400px;
    margin: 0 auto;
}

/* Header con flecha */
.top-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem 1.5rem 1rem 1.5rem;
    background-color: transparent;
}

.btn-back {
    background: none;
    border: none;
    color: #333;
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s ease;
}

.btn-back:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.btn-back .material-symbols-rounded {
    font-size: 26px;
}

.top-header h1 {
    color: #333;
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
}

.content-box {
    background-color: white;
    border-radius: 12px;
    padding: 2rem;
    margin: 0 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
    color: #9370db;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 2rem 0;
    letter-spacing: 0.5px;
    text-align: center;
}

.form-section {
    margin-bottom: 2.5rem;
}

.subsection-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 1.5rem 0;
}

.form-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group.full-width {
    grid-column: 1 / -1;
}

.form-group label {
    font-weight: 500;
    color: #333;
    font-size: 0.9rem;
}

.form-input,
.form-select {
    padding: 0.75rem;
    border: 1px solid #d0d0d0;
    border-radius: 8px;
    font-size: 0.95rem;
    background-color: white;
    transition: border-color 0.3s ease;
}

.form-input:focus,
.form-select:focus {
    outline: none;
    border-color: #9370db;
}

.form-input::placeholder {
    color: #999;
}

.form-select {
    cursor: pointer;
    color: #666;
}

.form-textarea {
    padding: 0.75rem;
    border: 1px solid #d0d0d0;
    border-radius: 8px;
    font-size: 0.95rem;
    font-family: inherit;
    resize: vertical;
    transition: border-color 0.3s ease;
}

.form-textarea:focus {
    outline: none;
    border-color: #9370db;
}

/* Photo placeholder */
.photo-placeholder {
    display: flex;
    justify-content: center;
    align-items: flex-start;
}

.photo-box-with-image {
    width: 100px;
    height: 100px;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid #d0d0d0;
}

.aspirante-foto {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.photo-box {
    width: 100px;
    height: 100px;
    background-color: #d3d3d3;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
}

.photo-box .material-symbols-rounded {
    font-size: 48px;
}

/* Inline fields para nombre completo */
.inline-fields {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
}

/* Time input */
.time-input {
    cursor: pointer;
}

/* Botones de acción */
.form-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #e0e0e0;
}

.btn-guardar,
.btn-limpiar {
    padding: 0.85rem 2rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-guardar {
    background-color: #4caf50;
    color: white;
}

.btn-guardar:hover {
    background-color: #45a049;
}

.btn-limpiar {
    background-color: #ffc107;
    color: white;
}

.btn-limpiar:hover {
    background-color: #e0a800;
}

.material-symbols-rounded {
    font-size: 20px;
}

/* Responsive */
@media (max-width: 1024px) {
    .form-row {
        grid-template-columns: repeat(2, 1fr);
    }

    .inline-fields {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .content-box {
        padding: 1.5rem;
    }

    .form-row {
        grid-template-columns: 1fr;
    }

    .form-actions {
        flex-direction: column;
    }

    .btn-guardar,
    .btn-enviar {
        width: 100%;
    }
}
</style>
