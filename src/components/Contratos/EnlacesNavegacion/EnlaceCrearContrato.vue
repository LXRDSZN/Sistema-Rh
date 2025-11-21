<template>
    <div class="enlace-crear-contrato">
        <!-- Header con flecha y título -->
        <div class="top-header">
            <button class="btn-back" @click="confirmarSalida">
                <span class="material-symbols-rounded">arrow_back</span>
            </button>
            <h1>Contrato/Creación</h1>
        </div>

        <div class="content-box">
            <h2 class="section-title">{{ tituloContrato }}</h2>

            <!-- Datos Personales -->
            <div class="form-section">
                <h3 class="subsection-title">Datos Personales</h3>

                <!-- Foto placeholder y Nombre completo -->
                <div class="form-row">
                    <div class="form-group" style="grid-column: 1 / 2;">
                        <div class="photo-placeholder">
                            <div v-if="fotoUrl" class="photo-box-with-image">
                                <img :src="fotoUrl || defaultAvatar" alt="Foto aspirante" class="aspirante-foto"
                                    @error="onImgError" />
                            </div>
                            <div v-else class="photo-box">
                                <span class="material-symbols-rounded">person</span>
                            </div>
                        </div>
                    </div>

                    <div class="form-group" style="grid-column: 2 / 4;">
                        <label>
                            Nombre Completo
                            <small v-if="esRenovacionEmpleado" class="helper-text">
                                (solo lectura en renovación)
                            </small>
                        </label>
                        <div class="inline-fields">
                            <input type="text" :value="formData.nombre"
                                @input="limpiarYFormatearNombre('nombre', $event)" placeholder="Nombre"
                                class="form-input" :disabled="esRenovacionEmpleado" />
                            <input type="text" :value="formData.apellidoPaterno"
                                @input="limpiarYFormatearNombre('apellidoPaterno', $event)"
                                placeholder="Apellido Paterno" class="form-input" :disabled="esRenovacionEmpleado" />
                            <input type="text" :value="formData.apellidoMaterno"
                                @input="limpiarYFormatearNombre('apellidoMaterno', $event)"
                                placeholder="Apellido Materno" class="form-input" :disabled="esRenovacionEmpleado" />
                        </div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Tipo de Contrato</label>
                        <select v-model="formData.tipoContrato" class="form-select">
                            <option value="">Seleccione tipo</option>
                            <option value="Indefinido">Indefinido</option>
                            <option value="Temporal">Temporal</option>
                            <option value="Por Proyecto">Por Proyecto</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Fecha de inicio</label>
                        <input type="date" v-model="formData.fechaInicio" class="form-input" :min="minFechaInicio"
                            :max="maxFechaInicio" @change="validarFechaInicio" />
                    </div>
                    <div class="form-group">
                        <label>Fecha de término</label>
                        <input type="date" v-model="formData.fechaTermino" class="form-input"
                            :min="minFechaTermino || undefined" @change="validarFechaTermino" />
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Proyecto (en caso de aplicar)</label>
                        <input type="text" v-model="formData.proyecto" placeholder="Nombre del proyecto"
                            class="form-input" />
                    </div>
                    <div class="form-group">
                        <label>Sueldo Mensual</label>
                        <input type="text" v-model="formData.sueldoMensual" class="form-input" placeholder="0.00"
                            @input="limpiarNumero('sueldoMensual')" />
                    </div>
                    <div class="form-group">
                        <label>Modalidad</label>
                        <select v-model="formData.modalidad" class="form-select">
                            <option value="">Seleccione modalidad</option>
                            <option value="Híbrida">Híbrida</option>
                            <option value="Remoto">Remoto</option>
                            <option value="Presencial">Presencial</option>
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
                        <select v-model="formData.area" class="form-select">
                            <option value="">Seleccione área</option>
                            <option v-for="a in areas" :key="a.id" :value="a.id">
                                {{ a.nombre }}
                            </option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Puesto</label>
                        <select v-model="formData.puesto" class="form-select">
                            <option value="">Seleccione puesto</option>
                            <option v-for="p in puestos" :key="p.id" :value="p.id">
                                {{ p.nombre }}
                            </option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Jornada Laboral</label>
                        <select v-model="formData.jornadaLaboral" class="form-select">
                            <option value="">Seleccione tipo</option>
                            <option v-for="j in jornadas" :key="j.id" :value="j.id">
                                {{ j.nombre }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Plantilla Contrato</label>
                        <select v-model="formData.plantillaContrato" class="form-select">
                            <option value="">Seleccione</option>
                            <option v-for="pl in plantillas" :key="pl.id" :value="pl.id">
                                {{ pl.nombre }}
                            </option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Estado del contrato</label>
                        <select v-model="formData.estadoContrato" class="form-select">
                            <option value="">Seleccione</option>
                            <option v-for="e in estadosContrato" :key="e.id" :value="e.id">
                                {{ e.nombre }}
                            </option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Entrada</label>
                        <input type="time" v-model="formData.entrada" class="form-input time-input" />
                    </div>
                    <div class="form-group">
                        <label>Salida</label>
                        <input type="time" v-model="formData.salida" class="form-input time-input" />
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
                            <option v-for="td in tiposDocumento" :key="td.id" :value="td.id">
                                {{ td.nombre }}
                            </option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Subir documento (PDF)</label>
                        <input type="file" accept="application/pdf" class="form-input" @change="onFileChange" />
                        <p v-if="formData.documento" class="file-name">
                            Archivo seleccionado: {{ formData.documento }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Acciones -->
            <div class="form-section">
                <h3 class="subsection-title">Acciones</h3>

                <div class="form-row">
                    <div class="form-group">
                        <label>Fecha de Generación</label>
                        <input type="date" v-model="formData.fechaGeneracion" class="form-input" />
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
import axios from 'axios';

import { useAspirantesContratos } from '@/composables/useAspirantesContratos';
import { useCatalogosContratos } from '@/composables/useCatalogoContratos';
import { useS3Files } from '@/composables/useS3Files';
import { useEmpleadoContratos } from '@/composables/useEmpleadoContratos';

const API_URL = 'http://localhost:5000/api';

const props = defineProps({
    datosAspirante: {
        type: Object,
        default: null
    },
    // Cuando vienes desde EMPLEADO (renovación)
    datosEmpleado: {
        type: Object,
        default: null
    },
    // Para saber si es contrato nuevo o renovación
    modo: {
        type: String,
        default: 'aspirante-nuevo' // 'aspirante-nuevo' | 'empleado-renovar'
    }
});

const emit = defineEmits(['volver-inicio']);

// Avatar por defecto
const defaultAvatar = '/src/assets/default-user.png';

const onImgError = (event) => {
    event.target.onerror = null;
    event.target.src = defaultAvatar;
};

// Composables
const { obtenerAspiracionLaboralAspirante } = useAspirantesContratos();
const {
    obtenerAreas,
    obtenerPuestos,
    obtenerJornadas,
    obtenerPlantillasContrato,
    obtenerEstadosContrato,
    obtenerTiposDocumento
} = useCatalogosContratos();
const { subirArchivo } = useS3Files();
const { obtenerDatosRenovacionEmpleado } = useEmpleadoContratos();

// Modo renovación
const esRenovacionEmpleado = computed(() => props.modo === 'empleado-renovar');

const tituloContrato = computed(() =>
    esRenovacionEmpleado.value ? 'RENOVAR CONTRATO' : 'CONTRATO NUEVO'
);

// ========================
//  ESTADOS
// ========================
const areas = ref([]);
const puestos = ref([]);
const jornadas = ref([]);
const plantillas = ref([]);
const estadosContrato = ref([]);
const tiposDocumento = ref([]);

const fotoUrl = ref(null);
const archivoPdf = ref(null); // aquí guardamos el File

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
    documento: '', // nombre del archivo seleccionado
    fechaGeneracion: ''
});

// ===== FECHAS =====
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
fechaMax.setMonth(fechaMax.getMonth() + 3);
const maxFechaInicio = ref(formatearFechaInput(fechaMax));

const hoyISO = minFechaInicio.value;

const minFechaTermino = computed(() => {
    if (!formData.value.fechaInicio) return '';
    const d = new Date(formData.value.fechaInicio);
    d.setMonth(d.getMonth() + 1);
    return formatearFechaInput(d);
});

// ===== DETECCIÓN DE CAMBIOS =====
const initialFormData = ref({ ...formData.value });

const actualizarEstadoInicial = () => {
    initialFormData.value = JSON.parse(JSON.stringify(formData.value));
};

const hayCambiosEnFormulario = () => {
    return JSON.stringify(formData.value) !== JSON.stringify(initialFormData.value);
};

// ===== CARGA ASPIRANTE =====
const cargarDatosAspirante = async () => {
    if (props.datosAspirante) {
        formData.value.nombre =
            props.datosAspirante.nombreSolo || props.datosAspirante.nombre || '';
        formData.value.apellidoPaterno = props.datosAspirante.apellidoPaterno || '';
        formData.value.apellidoMaterno = props.datosAspirante.apellidoMaterno || '';
        fotoUrl.value = props.datosAspirante.avatar || null;
    }

    const personaId =
        props.datosAspirante?.persona_id || props.datosAspirante?.id || null;

    if (personaId) {
        try {
            const datos = await obtenerAspiracionLaboralAspirante(personaId);
            if (datos) {
                if (!formData.value.nombre) formData.value.nombre = datos.nombre || '';
                if (!formData.value.apellidoPaterno)
                    formData.value.apellidoPaterno = datos.apellido_paterno || '';
                if (!formData.value.apellidoMaterno)
                    formData.value.apellidoMaterno = datos.apellido_materno || '';
                if (!fotoUrl.value) fotoUrl.value = datos.foto_url || null;

                formData.value.tipoContrato = datos.tipo_contrato || '';
                formData.value.modalidad = datos.modalidad || '';

                if (datos.fecha_disponible) {
                    formData.value.fechaInicio = formatearFechaInput(datos.fecha_disponible);
                }
            }
        } catch (error) {
            console.warn('No se pudo cargar aspiración laboral del aspirante:', error);
        }
    }

    if (!formData.value.fechaGeneracion) {
        formData.value.fechaGeneracion = hoyISO;
    }

    actualizarEstadoInicial();
};

// ===== CARGA DATOS DEL EMPLEADO =====
const cargarDatosEmpleadoRenovacion = async () => {
    const personaId = props.datosEmpleado?.persona_id;
    if (!personaId) return;

    try {
        const datos = await obtenerDatosRenovacionEmpleado(personaId);

        // Foto y nombre
        fotoUrl.value = datos.foto_url || fotoUrl.value;
        formData.value.nombre = datos.nombre || '';
        formData.value.apellidoPaterno = datos.apellido_paterno || '';
        formData.value.apellidoMaterno = datos.apellido_materno || '';

        // Asignación laboral
        formData.value.area = datos.area_id || '';
        formData.value.puesto = datos.puesto_id || '';

        // Contrato
        formData.value.tipoContrato = datos.tipo_contrato || '';
        formData.value.modalidad = datos.modalidad || '';
        formData.value.sueldoMensual = datos.salario_mensual || '';

        if (datos.fecha_inicio) {
            formData.value.fechaInicio = formatearFechaInput(datos.fecha_inicio);
        }
        if (datos.fecha_fin) {
            formData.value.fechaTermino = formatearFechaInput(datos.fecha_fin);
        }

        // Fecha de generación = hoy
        if (!formData.value.fechaGeneracion) {
            formData.value.fechaGeneracion = hoyISO;
        }

        actualizarEstadoInicial();
    } catch (error) {
        console.error('Error al cargar datos de renovación del empleado:', error);
    }
};

// ===== CARGA CATÁLOGOS =====
const cargarCatalogos = async () => {
    try {
        [
            areas.value,
            puestos.value,
            jornadas.value,
            plantillas.value,
            estadosContrato.value,
            tiposDocumento.value
        ] = await Promise.all([
            obtenerAreas(),
            obtenerPuestos(),
            obtenerJornadas(),
            obtenerPlantillasContrato(),
            obtenerEstadosContrato(),
            obtenerTiposDocumento()
        ]);
    } catch (e) {
        console.error('Error cargando catálogos:', e);
    }
};

// ===== VALIDACIONES =====
const limpiarYFormatearNombre = (campo, event) => {
    // Si es renovación, no debe poder editar
    if (esRenovacionEmpleado.value) return;

    let valor = event.target.value || '';
    // Solo letras y espacios
    valor = valor.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, '');
    valor = valor.replace(/\s+/g, ' ');
    valor = valor.replace(/^\s+/, '');
    valor = valor.replace(/\b\w+/g, (palabra) => {
        return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
    });
    formData.value[campo] = valor;
};

const limpiarNumero = (campo) => {
    let valor = String(formData.value[campo] ?? '');
    // Solo dígitos y punto
    valor = valor.replace(/[^0-9.]/g, '');
    // Un solo punto decimal
    const partes = valor.split('.');
    if (partes.length > 2) {
        valor = partes[0] + '.' + partes.slice(1).join('');
    }
    formData.value[campo] = valor;
};

const validarFechaInicio = () => {
    if (!formData.value.fechaInicio) return;
    const fi = new Date(formData.value.fechaInicio);
    fi.setHours(0, 0, 0, 0);

    if (fi < hoyDate || fi > fechaMax) {
        alert('La fecha de inicio debe ser a partir de hoy y no mayor a tres meses.');
        formData.value.fechaInicio = '';
        return;
    }

    if (formData.value.fechaTermino) {
        validarFechaTermino();
    }
};

const validarFechaTermino = () => {
    if (formData.value.tipoContrato === 'Indefinido') {
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
        alert(
            'La fecha de término debe ser al menos un mes después de la fecha de inicio.'
        );
        formData.value.fechaTermino = '';
    }
};

watch(
    () => formData.value.tipoContrato,
    (nuevo) => {
        if (nuevo === 'Indefinido') {
            formData.value.fechaTermino = '';
        }
    }
);

// Validación general antes de guardar
const obtenerErroresValidacion = () => {
    const errores = [];

    // Datos personales (solo para aspirante nuevo)
    if (!esRenovacionEmpleado.value) {
        if (!formData.value.nombre.trim()) {
            errores.push('El nombre es obligatorio.');
        }
        if (!formData.value.apellidoPaterno.trim()) {
            errores.push('El apellido paterno es obligatorio.');
        }
    }

    // Asignación laboral
    if (!formData.value.area) {
        errores.push('Debes seleccionar un área de trabajo.');
    }
    if (!formData.value.puesto) {
        errores.push('Debes seleccionar un puesto.');
    }

    // Contrato
    if (!formData.value.tipoContrato) {
        errores.push('Debes seleccionar el tipo de contrato.');
    }
    if (!formData.value.fechaInicio) {
        errores.push('Debes indicar la fecha de inicio del contrato.');
    }
    if (
        formData.value.tipoContrato !== 'Indefinido' &&
        !formData.value.fechaTermino
    ) {
        errores.push(
            'Debes indicar la fecha de término para contratos que no son indefinidos.'
        );
    }

    if (!formData.value.modalidad) {
        errores.push('Debes seleccionar la modalidad de trabajo.');
    }

    // Sueldo
    const sueldo = Number(formData.value.sueldoMensual);
    if (!formData.value.sueldoMensual || isNaN(sueldo) || sueldo <= 0) {
        errores.push('Debes capturar un sueldo mensual mayor a cero.');
    }

    // Jornada / horario
    if (!formData.value.jornadaLaboral) {
        errores.push('Debes seleccionar una jornada laboral.');
    }
    if (!formData.value.entrada) {
        errores.push('Debes capturar la hora de entrada.');
    }
    if (!formData.value.salida) {
        errores.push('Debes capturar la hora de salida.');
    }

    // Plantilla y estado
    if (!formData.value.plantillaContrato) {
        errores.push('Debes seleccionar la plantilla de contrato.');
    }
    if (!formData.value.estadoContrato) {
        errores.push('Debes seleccionar el estado del contrato.');
    }

    // Documentos
    if (!formData.value.tipoDocumento) {
        errores.push('Debes seleccionar el tipo de documento asociado.');
    }
    if (!archivoPdf.value) {
        errores.push('Debes seleccionar el archivo PDF a subir.');
    }

    // Fecha de generación
    if (!formData.value.fechaGeneracion) {
        errores.push('Debes indicar la fecha de generación del documento.');
    }

    return errores;
};

// ===== FILE INPUT =====
const onFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    archivoPdf.value = file;
    formData.value.documento = file ? file.name : '';
};

// ===== SALIR CON CONFIRMACIÓN =====
const confirmarSalida = () => {
    const hayCambios = hayCambiosEnFormulario();

    const mensaje = hayCambios
        ? 'Tienes cambios sin guardar. ¿Deseas descartar los cambios y salir?'
        : 'No has capturado información en el formulario. ¿Deseas salir de la ventana?';

    if (window.confirm(mensaje)) {
        emit('volver-inicio');
    }
};

// ===== GUARDAR CONTRATO =====
const guardarContrato = async () => {
    // Validaciones de formulario
    const errores = obtenerErroresValidacion();

    if (errores.length > 0) {
        alert(
            'No se puede guardar el contrato por los siguientes motivos:\n\n- ' +
            errores.join('\n- ')
        );
        return;
    }

    // Id de persona según de dónde venga
    const personaId =
        props.datosAspirante?.persona_id ||
        props.datosAspirante?.id ||
        props.datosEmpleado?.persona_id ||
        props.datosEmpleado?.id ||
        null;

    if (!personaId) {
        alert('No se encontró el identificador de la persona.');
        console.error('Sin persona_id ni id en props:', props.datosAspirante, props.datosEmpleado);
        return;
    }

    try {
        // 1) Subir archivo a S3
        const respS3 = await subirArchivo(archivoPdf.value);
        if (!respS3?.ok || !respS3.archivo) {
            throw new Error(respS3?.error || 'No se recibió información del archivo subido');
        }
        const archivoId = respS3.archivo.id;

        // 2) Modo RENOVACIÓN EMPLEADO
        if (esRenovacionEmpleado.value) {
            const payloadRenovacion = {
                personaId,
                plantillaId: formData.value.plantillaContrato || null,
                puestoId: formData.value.puesto || null,
                areaId: formData.value.area,
                salarioMensual: formData.value.sueldoMensual || null,
                fechaInicio: formData.value.fechaInicio,
                fechaFin: formData.value.fechaTermino || null,
                tipoContrato: formData.value.tipoContrato,
                modalidad: formData.value.modalidad || null,
                observaciones: formData.value.observaciones || null,
                archivoId
            };

            console.log('Payload renovación empleado:', payloadRenovacion);

            await axios.post(`${API_URL}/contratos/empleado/renovar`, payloadRenovacion, {
                withCredentials: true
            });

            alert('Contrato renovado correctamente.');
            actualizarEstadoInicial();
            emit('volver-inicio');
            return;
        }

        // 3) Modo ASPIRANTE (CONTRATO NUEVO)
        //    Primero, si cambió el nombre/apellidos, actualizamos persona
        const nombreCambiado =
            formData.value.nombre !== initialFormData.value.nombre ||
            formData.value.apellidoPaterno !== initialFormData.value.apellidoPaterno ||
            formData.value.apellidoMaterno !== initialFormData.value.apellidoMaterno;

        if (nombreCambiado) {
            const payloadNombre = {
                nombre: formData.value.nombre,
                apellidoPaterno: formData.value.apellidoPaterno,
                apellidoMaterno: formData.value.apellidoMaterno || null
            };

            await axios.put(`${API_URL}/aspirantes/${personaId}/nombre`, payloadNombre, {
                withCredentials: true
            });
        }

        const payloadContrato = {
            personaId,
            plantillaId: formData.value.plantillaContrato || null,
            puestoId: formData.value.puesto || null,
            areaId: formData.value.area,
            salarioMensual: formData.value.sueldoMensual || null,
            fechaInicio: formData.value.fechaInicio,
            fechaFin: formData.value.fechaTermino || null,
            tipoContrato: formData.value.tipoContrato,
            modalidad: formData.value.modalidad || null,
            observaciones: formData.value.observaciones || null,
            jornadaId: formData.value.jornadaLaboral || null,
            horaEntrada: formData.value.entrada || null,
            horaSalida: formData.value.salida || null,
            tipoDocumentoId: formData.value.tipoDocumento,
            archivoId,
            fechaGeneracion: formData.value.fechaGeneracion || hoyISO
        };

        console.log('Payload contrato aspirante:', payloadContrato);

        await axios.post(`${API_URL}/contratos/aspirante`, payloadContrato, {
            withCredentials: true
        });

        alert('Contrato guardado correctamente. El aspirante ahora es empleado.');
        actualizarEstadoInicial();
        emit('volver-inicio');
    } catch (error) {
        console.error('Error al guardar contrato:', error.response?.data || error);
        alert(
            `Ocurrió un error al guardar el contrato: ${error.response?.data?.error || error.message
            }`
        );
    }
};

// ===== LIMPIAR =====
const enviarLimpiar = () => {
    Object.keys(formData.value).forEach((key) => {
        // En renovación NO limpiamos nombre ni apellidos
        if (
            esRenovacionEmpleado.value &&
            ['nombre', 'apellidoPaterno', 'apellidoMaterno'].includes(key)
        ) {
            return;
        }

        formData.value[key] = '';
    });

    formData.value.fechaGeneracion = hoyISO;
    formData.value.documento = '';
    archivoPdf.value = null;

    console.log('Formulario limpiado');
    alert('Formulario limpiado correctamente');

    actualizarEstadoInicial();
};

// ===== WATCH & MOUNT =====
watch(
    () => props.datosAspirante,
    (nuevo) => {
        if (props.modo === 'aspirante-nuevo' && nuevo) {
            cargarDatosAspirante();
        }
    }
);

watch(
    () => props.datosEmpleado,
    (nuevo) => {
        if (props.modo === 'empleado-renovar' && nuevo) {
            cargarDatosEmpleadoRenovacion();
        }
    }
);

onMounted(async () => {
    await cargarCatalogos();

    if (props.modo === 'aspirante-nuevo' && props.datosAspirante) {
        await cargarDatosAspirante();
    } else if (props.modo === 'empleado-renovar' && props.datosEmpleado) {
        await cargarDatosEmpleadoRenovacion();
    }
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

.file-hint {
    margin-top: 0.25rem;
    font-size: 0.8rem;
    color: #1a5dc1;
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
