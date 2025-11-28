<template>
    <div class="enlace-crear-contrato">
        <!-- Header con flecha y título -->
        <div class="top-header">
            <button class="btn-back" @click="confirmarSalida">
                <span class="material-symbols-rounded">arrow_back</span>
            </button>
            <h1>Contrato/Creación</h1>
        </div>

        <!-- TODO lo que quieres que aparezca en el PDF -->
        <div class="content-box" id="contrato-preview">
            <h2 class="section-title">{{ tituloContrato }}</h2>

            <!-- Datos Personales -->
            <div class="form-section">
                <h3 class="subsection-title">Datos Personales</h3>

                <!-- Foto placeholder y Nombre completo -->
                <div class="form-row">
                    <div class="form-group" style="grid-column: 1 / 2;">
                        <div class="photo-placeholder">
                            <div class="photo-box-with-image">
                                <img :src="fotoUrl || defaultAvatar" alt="Foto empleado" class="aspirante-foto"
                                    @error="onImgError" crossorigin="anonymous" />
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
                                @input="limpiarYFormatearNombre('nombre', $event)"
                                @keydown="validarTeclaLetra"
                                placeholder="Nombre"
                                class="form-input" :disabled="esRenovacionEmpleado" />
                            <input type="text" :value="formData.apellidoPaterno"
                                @input="limpiarYFormatearNombre('apellidoPaterno', $event)"
                                @keydown="validarTeclaLetra"
                                placeholder="Apellido Paterno" class="form-input" :disabled="esRenovacionEmpleado" />
                            <input type="text" :value="formData.apellidoMaterno"
                                @input="limpiarYFormatearNombre('apellidoMaterno', $event)"
                                @keydown="validarTeclaLetra"
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
                            <option value="Remota">Remota</option>
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
                            <option v-for="p in puestosHastaJefeArea" :key="p.id" :value="p.id">
                                {{ formatRoleName(p.nombre) }}
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
                        <select v-model="formData.plantillaContrato" class="form-select" :disabled="!!formData.tipoContrato">
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
                            <option v-for="td in primerTipoDocumento" :key="td.id" :value="td.id">
                                {{ td.nombre }}
                            </option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Subir documento (PDF)</label>
                        <div class="upload-group">
                            <input type="file" accept="application/pdf" class="form-input" @change="onFileChange"
                                :disabled="!acuerdoGenerado" />
                            <button type="button" class="btn-generar-acuerdo" @click="generarAcuerdoConfidencialidad" 
                                title="Generar Acuerdo de Confidencialidad">
                                <span class="material-symbols-rounded">description</span>
                                Generar Acuerdo
                            </button>
                        </div>
                        <p class="file-hint aviso-acuerdo">
                            Descarga el Acuerdo de Confidencialidad para habilitar la carga y poder subirlo.
                        </p>
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
                        <input type="date" v-model="formData.fechaGeneracion" class="form-input" readonly />
                    </div>
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

    <!-- Modal de Vista Previa del Acuerdo -->
    <transition name="modal-fade">
        <div v-if="mostrarModalAcuerdo" class="modal-overlay" @click.self="cerrarModalAcuerdo">
            <div class="modal-container">
                <div class="modal-header">
                    <h2>Vista Previa - Acuerdo de Confidencialidad</h2>
                    <button class="btn-close-modal" @click="cerrarModalAcuerdo">
                        <span class="material-symbols-rounded">close</span>
                    </button>
                </div>
                <div class="modal-body">
                    <iframe v-if="pdfPreviewUrl" :src="pdfPreviewUrl" class="pdf-preview"></iframe>
                </div>
                <div class="modal-footer">
                    <button class="btn-descargar-pdf" @click="descargarAcuerdo">
                        <span class="material-symbols-rounded">download</span>
                        Descargar PDF
                    </button>
                    <button class="btn-cancelar" @click="cerrarModalAcuerdo">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    </transition>

    <!-- Modal de Vista Previa del Contrato -->
    <transition name="modal-fade">
        <div v-if="mostrarModalContrato" class="modal-overlay" @click.self="cerrarModalContrato">
            <div class="modal-container">
                <div class="modal-header">
                    <h2>Vista Previa - Contrato Laboral</h2>
                    <button class="btn-close-modal" @click="cerrarModalContrato">
                        <span class="material-symbols-rounded">close</span>
                    </button>
                </div>
                <div class="modal-body">
                    <iframe v-if="pdfContratoPreviewUrl" :src="pdfContratoPreviewUrl" class="pdf-preview"></iframe>
                </div>
                <div class="modal-footer">
                    <button class="btn-confirmar" @click="confirmarGuardarContrato">
                        <span class="material-symbols-rounded">check_circle</span>
                        Confirmar y Guardar
                    </button>
                    <button class="btn-cancelar" @click="cerrarModalContrato">
                        <span class="material-symbols-rounded">close</span>
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    </transition>

    <!-- Toast Notification -->
    <transition name="slide-fade">
        <div v-if="mostrarNotificacion" class="toast-notification" :class="tipoNotificacion">
            <div class="toast-content">
                <span class="material-symbols-rounded">
                    {{ tipoNotificacion === 'error' ? 'error' : tipoNotificacion === 'warning' ? 'warning' : tipoNotificacion === 'success' ? 'check_circle' : 'info' }}
                </span>
                <div class="toast-message">
                    <h4>{{ tituloNotificacion }}</h4>
                    <p>{{ mensajeNotificacion }}</p>
                </div>
                <button class="toast-close" @click="cerrarNotificacion">×</button>
            </div>
        </div>
    </transition>
</template>


<script setup>
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ref, watch, onMounted, computed } from 'vue';
import axios from 'axios';

import { useAspirantesContratos } from '@/composables/useAspirantesContratos';
import { useCatalogosContratos } from '@/composables/useCatalogoContratos';
import { useS3Files } from '@/composables/useS3Files';
import { useEmpleadoContratos } from '@/composables/useEmpleadoContratos';
import { useDocumentosPersona } from '@/composables/useDocumentosPersona';


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

// Avatar por defecto - usar una imagen de placeholder simple
const defaultAvatar = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%23e0e0e0" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="80" fill="%23999"%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E';

const onImgError = (event) => {
    console.warn('Error al cargar imagen, usando avatar por defecto');
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
const { subirArchivo, obtenerUrlFirmada } = useS3Files();
const { obtenerDatosRenovacionEmpleado, renovarContratoEmpleado } = useEmpleadoContratos();
const { asociarDocumentoPersona } = useDocumentosPersona();
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

// Estado para notificaciones toast
const mostrarNotificacion = ref(false);
const tipoNotificacion = ref('info'); // 'success', 'error', 'warning', 'info'
const tituloNotificacion = ref('');
const mensajeNotificacion = ref('');

// Función para mostrar notificación
const mostrarNotif = (tipo, titulo, mensaje, duracion = 5000) => {
    tipoNotificacion.value = tipo;
    tituloNotificacion.value = titulo;
    mensajeNotificacion.value = mensaje;
    mostrarNotificacion.value = true;

    if (duracion > 0) {
        setTimeout(() => {
            mostrarNotificacion.value = false;
        }, duracion);
    }
};

// Función para cerrar notificación manualmente
const cerrarNotificacion = () => {
    mostrarNotificacion.value = false;
};

// Filtrar puestos según área seleccionada
const puestosHastaJefeArea = computed(() => {
    const lista = puestos.value || [];
    const areaSeleccionada = areas.value.find(a => a.id === formData.value.area);
    const nombreArea = areaSeleccionada?.nombre;

    // Roles de jefes específicos por área
    const jefesPorArea = {
        'Contratos': 'JEFE_CONTRATOS',
        'Asistencias': 'JEFE_ASISTENCIAS',
        'Vacaciones': 'JEFE_VACACIONES',
        'Incidencias': 'JEFE_INCIDENCIAS',
        'Areas': 'JEFE_AREA'
    };

    // Todos los jefes específicos (para excluir si no es el área correspondiente)
    const todosLosJefes = Object.values(jefesPorArea);

    return lista.filter(puesto => {
        // Si es un jefe específico, solo mostrarlo si es el del área seleccionada
        if (todosLosJefes.includes(puesto.nombre)) {
            return nombreArea && jefesPorArea[nombreArea] === puesto.nombre;
        }
        // Mostrar todos los demás roles (ADMIN, EMPLEADO, GERENTE_GENERAL, y roles generales)
        return true;
    });
});
  
// Computed que devuelve sólo la primera opción del catálogo de tipos de documento
const primerTipoDocumento = computed(() => {
    return tiposDocumento.value && tiposDocumento.value.length ? [tiposDocumento.value[0]] : [];
});

// Formatea el nombre del rol/puesto del sistema
const formatRoleName = (role) => {
    const map = {
        'ADMIN': 'Admin',
        'EMPLEADO': 'Empleado',
        'JEFE_INCIDENCIAS': 'Jefe de Incidencias',
        'JEFE_VACACIONES': 'Jefe de Vacaciones',
        'JEFE_CONTRATOS': 'Jefe de Contratos',
        'JEFE_ASISTENCIAS': 'Jefe de Asistencias',
        'JEFE_AREA': 'Jefe de Área',
        'GERENTE_GENERAL': 'Gerente General',
        'Analista de Datos': 'Analista de Datos',
        'Contador General': 'Contador General',
        'Desarrollador Full Stack': 'Desarrollador Full Stack'
    };
    return map[role] || role;
};

const fotoUrl = ref(null);
const archivoPdf = ref(null); // aquí guardamos el File
const acuerdoGenerado = ref(false);

// ===== FECHAS - DECLARAR FUNCIONES PRIMERO =====
const obtenerHoy = () => {
    const now = new Date();
    // Fecha local a medianoche, sin saltos de zona horaria
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const formatearFechaInput = (fecha) => {
    // Si ya es un string en formato ISO, devolverlo directamente
    if (typeof fecha === 'string' && fecha.match(/^\d{4}-\d{2}-\d{2}/)) {
        return fecha.split('T')[0]; // Tomar solo la parte de fecha
    }
    
    // Si es un objeto Date o un timestamp
    const d = fecha instanceof Date ? fecha : new Date(fecha);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const parseFechaLocal = (valor) => {
    if (!valor) return null;
    const [year, month, day] = valor.split('-').map(Number);
    return new Date(year, month - 1, day);
};

// Fecha de hoy en formato ISO para inicialización
const hoyDate = obtenerHoy();
const hoyISO = formatearFechaInput(hoyDate);

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
    fechaGeneracion: hoyISO  // Inicializar automáticamente con fecha de hoy
});

const minFechaInicio = ref(formatearFechaInput(hoyDate));

const fechaMax = new Date(hoyDate.getTime());
fechaMax.setMonth(fechaMax.getMonth() + 3);
const maxFechaInicio = ref(formatearFechaInput(fechaMax));
  
  const minFechaTermino = computed(() => {
      if (!formData.value.fechaInicio) return '';
      const d = parseFechaLocal(formData.value.fechaInicio);
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
                  formData.value.modalidad = datos.modalidad || 'Presencial';

                  // No pre-cargar fechaInicio, dejar vacía para que el usuario seleccione
              }
          } catch (error) {
              console.warn('No se pudo cargar aspiración laboral del aspirante:', error);
          }

          // Intentar obtener foto en base64 desde backend (funciona para Aspirante o Empleado)
          try {
              const { data } = await axios.get(
                  `${API_URL}/empleados/${personaId}/foto-base64`,
                  { withCredentials: true }
              );

              if (data.ok && data.fotoDataUrl) {
                  fotoUrl.value = data.fotoDataUrl;
              }
          } catch (err) {
              console.error('Error al obtener foto base64 (aspirante):', err);
          }
      }

    actualizarEstadoInicial();
};

// ===== CARGA DATOS DEL EMPLEADO =====
const cargarDatosEmpleadoRenovacion = async () => {
    // personaId una sola vez
    const personaId =
        props.datosEmpleado?.persona_id ||
        props.datosEmpleado?.id ||
        null;

    if (!personaId) {
        console.warn('No hay personaId para renovar contrato');
        fotoUrl.value = defaultAvatar;
        return;
    }

    try {
        // 1) Obtener datos de renovación (lo que ya tenías)
        const datos = await obtenerDatosRenovacionEmpleado(personaId);

        // Foto (si tu endpoint de datos ya manda alguna URL, opcional)
        fotoUrl.value = datos.foto_url || fotoUrl.value;

        // Nombre y apellidos
        formData.value.nombre = datos.nombre || '';
        formData.value.apellidoPaterno = datos.apellido_paterno || '';
        formData.value.apellidoMaterno = datos.apellido_materno || '';

        // Asignación laboral
        formData.value.area = datos.area_id || '';
        formData.value.puesto = datos.puesto_id || '';

        // Contrato
        formData.value.tipoContrato = datos.tipo_contrato || '';
        formData.value.modalidad = datos.modalidad || 'Presencial';
        formData.value.sueldoMensual = datos.salario_mensual || '';

        // No pre-cargar fechaInicio, dejar vacía para que el usuario seleccione
        
        if (datos.fecha_fin) {
            formData.value.fechaTermino = formatearFechaInput(datos.fecha_fin);
        }

        // 2) Obtener FOTO en base64 desde backend
        try {
            const { data } = await axios.get(
                `${API_URL}/empleados/${personaId}/foto-base64`,
                { withCredentials: true }
            );

            console.log('Respuesta foto base64:', data);

            if (data.ok && data.fotoDataUrl) {
                // data:image/...;base64,...
                fotoUrl.value = data.fotoDataUrl;
                console.log('Foto cargada correctamente en base64');
            } else {
                console.warn('No se recibió fotoDataUrl válida');
                fotoUrl.value = defaultAvatar;
            }
        } catch (err) {
            console.error('Error al obtener foto base64:', err);
            // Intentar cargar avatar por defecto
            fotoUrl.value = defaultAvatar;
        }

        // 3) Guardar snapshot inicial para detectar cambios
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
        // Si existe al menos un tipo de documento, preseleccionar el primero
        if (tiposDocumento.value && tiposDocumento.value.length && !formData.value.tipoDocumento) {
            formData.value.tipoDocumento = tiposDocumento.value[0].id;
        }
    } catch (e) {
        console.error('Error cargando catálogos:', e);
    }
};

// ===== VALIDACIONES =====
const validarTeclaLetra = (event) => {
    const key = event.key;
    
    // Permitir teclas especiales de navegación y edición
    const teclasPermitidas = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 
                              'Home', 'End', 'Tab', 'Enter', 'Escape'];
    
    if (teclasPermitidas.includes(key)) {
        return; // Permitir estas teclas
    }
    
    // Permitir Ctrl/Cmd + teclas (copiar, pegar, etc.)
    if (event.ctrlKey || event.metaKey) {
        return;
    }
    
    // Solo permitir letras (incluyendo acentos y ñ) y espacios
    const regexLetra = /^[a-záéíóúàèìòùâêîôûäëïöüñA-ZÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÄËÏÖÑ\s]$/;
    
    if (!regexLetra.test(key)) {
        event.preventDefault(); // Bloquear la tecla
    }
};

const limpiarYFormatearNombre = (campo, event) => {
    // Si es renovación, no debe poder editar
    if (esRenovacionEmpleado.value) return;

    let valor = event.target.value || '';
    // Permitir solo letras (incluyendo acentos, ñ, diéresis) y espacios
    valor = valor.replace(/[^a-záéíóúàèìòùâêîôûäëïöüñA-ZÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÄËÏÖÑ\s]/g, '');
    valor = valor.replace(/\s+/g, ' ');
    valor = valor.replace(/^\s+/, '');
    
    // Capitalizar correctamente palabras con acentos
    // Dividir por espacios y capitalizar cada palabra
    const palabras = valor.split(' ');
    const palabrasCapitalizadas = palabras.map(palabra => {
        if (palabra.length === 0) return palabra;
        return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
    });
    
    formData.value[campo] = palabrasCapitalizadas.join(' ');
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
      const fi = parseFechaLocal(formData.value.fechaInicio);
  
      if (fi < hoyDate || fi > fechaMax) {
          mostrarNotif('error', '⚠️ Fecha Inválida', 'La fecha de inicio debe ser a partir de hoy y no mayor a tres meses.');
          formData.value.fechaInicio = '';
          return;
      }    if (formData.value.fechaTermino) {
        validarFechaTermino();
    }
};

const validarFechaTermino = () => {
    if (formData.value.tipoContrato === 'Indefinido') {
        formData.value.fechaTermino = '';
        return;
    }

    if (!formData.value.fechaInicio) {
        mostrarNotif('warning', '⚠️ Atención', 'Primero selecciona la fecha de inicio.');
        formData.value.fechaTermino = '';
        return;
    }

    if (!formData.value.fechaTermino) return;

      const fi = parseFechaLocal(formData.value.fechaInicio);
      const ft = parseFechaLocal(formData.value.fechaTermino);

    const minFin = new Date(fi.getTime());
    minFin.setMonth(minFin.getMonth() + 1);

    if (ft < minFin) {
        mostrarNotif(
            'error',
            '⚠️ Fecha Inválida',
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
        
        // Seleccionar automáticamente la plantilla según el tipo de contrato
        if (nuevo && plantillas.value.length > 0) {
            const plantillaCorrespondiente = plantillas.value.find(pl => 
                pl.nombre.toLowerCase().includes(nuevo.toLowerCase())
            );
            
            if (plantillaCorrespondiente) {
                formData.value.plantillaContrato = plantillaCorrespondiente.id;
            }
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
    if (!acuerdoGenerado.value) {
        mostrarNotif('warning', '⚠️ Genera el acuerdo', 'Primero genera el Acuerdo de Confidencialidad antes de intentar subirlo.');
        event.target.value = '';
        return;
    }

    const file = event.target.files?.[0] || null;
    
    if (file) {
        // Validar que sea un archivo PDF
        const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        
        if (!isPDF) {
            mostrarNotif('error', '❌ Formato No Válido', 'Solo se permiten archivos PDF para el acuerdo de confidencialidad.', 5000);
            event.target.value = ''; // Limpiar el input
            archivoPdf.value = null;
            formData.value.documento = '';
            return;
        }
        
        // Validar tamaño (máximo 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            mostrarNotif('error', '❌ Archivo Muy Pesado', `El archivo pesa ${sizeMB}MB. El tamaño máximo permitido es 10MB.`, 5000);
            event.target.value = '';
            archivoPdf.value = null;
            formData.value.documento = '';
            return;
        }
    }
    
    archivoPdf.value = file;
    formData.value.documento = file ? file.name : '';
};

// ===== GENERAR ACUERDO DE CONFIDENCIALIDAD =====
const mostrarModalAcuerdo = ref(false);
const pdfPreviewUrl = ref(null);
let pdfBlobActual = null;

// Estados para vista previa del contrato
const mostrarModalContrato = ref(false);
const pdfContratoPreviewUrl = ref(null);
let pdfContratoBlobActual = null;

const generarAcuerdoConfidencialidad = () => {
    // Al generar uno nuevo, se debe volver a descargar para habilitar el upload
    acuerdoGenerado.value = false;

    // Obtener datos del formulario
    const nombreCompleto = `${formData.value.nombre} ${formData.value.apellidoPaterno} ${formData.value.apellidoMaterno}`.trim();
    const puestoObj = puestos.value.find(p => p.id === formData.value.puesto);
    const puesto = puestoObj ? formatRoleName(puestoObj.nombre) : '';
    const area = areas.value.find(a => a.id === formData.value.area)?.nombre || '';
    
    if (!nombreCompleto || nombreCompleto === '') {
        mostrarNotif('warning', '⚠️ Datos Incompletos', 'Por favor completa el nombre del aspirante/empleado antes de generar el acuerdo.');
        return;
    }

    // Obtener fecha actual en formato largo
    const fecha = new Date();
    const dia = fecha.getDate();
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();

    // Crear el documento PDF
    const pdf = new jsPDF('p', 'mm', 'letter');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    
    // Título
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ACUERDO DE CONFIDENCIALIDAD', pageWidth / 2, 25, { align: 'center' });
    
    // Fecha y lugar
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    let yPosition = 40;
    pdf.text(`Morelos, a ${dia} de ${mes} de ${anio}.`, margin, yPosition);
    
    yPosition += 10;
    pdf.text('Ing. Alberto Miguel Flores Flores', margin, yPosition);
    yPosition += 5;
    pdf.text('Departamento de Documentación y Contratos', margin, yPosition);
    yPosition += 5;
    pdf.text('P r e s e n t e', margin, yPosition);
    
    // Cuerpo del documento
    yPosition += 10;
    pdf.setFontSize(9);
    
    const parrafo1 = `El que suscribe C. ${nombreCompleto}, adscrito a ${area || '(Unidad Administrativa: Departamento de Documentación y Contratos)'} y de conformidad con el artículo 42 de la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados; acepta las condiciones de resguardo, reserva, custodia y protección de la seguridad y confidencialidad de la información, datos personales y de todo tipo de documentos propiedad de la Dirección o Área correspondiente, o de la que tenga conocimiento, con motivo del trabajo, empleo, comisión o actividades asignadas.`;
    
    const lineasP1 = pdf.splitTextToSize(parrafo1, maxWidth);
    pdf.text(lineasP1, margin, yPosition);
    yPosition += lineasP1.length * 4 + 5;
    
    const parrafo2 = 'El presente deber de confidencialidad me responsabiliza respecto de la información que me sea proporcionada, ya sea de forma oral, escrita, impresa, sonora, visual, electrónica, informática u holográfica, contenida en cualquier tipo de documento, que puede consistir en: expedientes, reportes, estudios, actas, resoluciones, oficios, correspondencia, acuerdos, directrices, circulares, contratos, convenios, nómina, estadísticas o cualquier otro registro que documente el ejercicio de las facultades, funciones y competencias de la Unidad Administrativa.';
    
    const lineasP2 = pdf.splitTextToSize(parrafo2, maxWidth);
    pdf.text(lineasP2, margin, yPosition);
    yPosition += lineasP2.length * 4 + 5;
    
    const parrafo3 = 'La información que me sea proporcionada podría ser considerada, según el caso, como reservada, privilegiada y confidencial, en los términos del artículo 116 de la Ley General de Transparencia y Acceso a la Información Pública y el artículo 113 de la Ley Federal de Transparencia y Acceso a la Información, salvo aquella información que sea pública o que se autorice expresamente su divulgación, siempre que no cause daño o perjuicio a sus propietarios. Me obligo a protegerla, reservarla, resguardarla y no divulgarla, utilizándola única y exclusivamente para cumplir con las actividades y obligaciones que me sean conferidas.';
    
    const lineasP3 = pdf.splitTextToSize(parrafo3, maxWidth);
    
    // Verificar si necesitamos nueva página
    if (yPosition + lineasP3.length * 4 + 50 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
    }
    
    pdf.text(lineasP3, margin, yPosition);
    yPosition += lineasP3.length * 4 + 5;
    
    const parrafo4 = 'Me responsabilizo de no reproducir, hacer pública o divulgar a terceros la información objeto de esta Carta, y de cumplir con las medidas de seguridad aprobadas por la Unidad Administrativa.';
    
    const lineasP4 = pdf.splitTextToSize(parrafo4, maxWidth);
    pdf.text(lineasP4, margin, yPosition);
    yPosition += lineasP4.length * 4 + 5;
    
    const parrafo5 = 'De omitirse lo expresado se podrá hacer acreedor a las sanciones previstas en el Título Décimo Primero, Capítulo II de la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados, así como a otras responsabilidades administrativas correspondientes.';
    
    const lineasP5 = pdf.splitTextToSize(parrafo5, maxWidth);
    pdf.text(lineasP5, margin, yPosition);
    yPosition += lineasP5.length * 4 + 10;
    
    // Verificar espacio para firma
    if (yPosition + 45 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
    }
    
    // Firma
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('A t e n t a m e n t e', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 20;
    pdf.setFontSize(9);
    pdf.text('Nombre completo:', margin, yPosition);
    pdf.line(margin + 30, yPosition, pageWidth - margin, yPosition);
    pdf.setFont('helvetica', 'bold');
    pdf.text(nombreCompleto, margin + 32, yPosition - 1);
    
    yPosition += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.text('Firma:', margin, yPosition);
    pdf.line(margin + 30, yPosition, pageWidth - margin, yPosition);
    
    yPosition += 10;
    pdf.text('Puesto:', margin, yPosition);
    pdf.line(margin + 30, yPosition, pageWidth - margin, yPosition);
    if (puesto) {
        pdf.setFont('helvetica', 'bold');
        pdf.text(puesto, margin + 32, yPosition - 1);
    }
    
    // Generar Blob para vista previa
    pdfBlobActual = pdf.output('blob');
    const url = URL.createObjectURL(pdfBlobActual);
    pdfPreviewUrl.value = url;
    mostrarModalAcuerdo.value = true;
};

const descargarAcuerdo = () => {
    if (!pdfBlobActual) return;
    
    const nombreCompleto = `${formData.value.nombre} ${formData.value.apellidoPaterno} ${formData.value.apellidoMaterno}`.trim();
    const nombreArchivo = `Acuerdo_Confidencialidad_${nombreCompleto.replace(/\s+/g, '_')}.pdf`;
    
    const link = document.createElement('a');
    link.href = pdfPreviewUrl.value;
    link.download = nombreArchivo;
    link.click();
    acuerdoGenerado.value = true;
    
    mostrarNotif('success', '✅ Acuerdo Descargado', 'Acuerdo descargado. Ahora puedes subirlo en el campo "Subir documento (PDF)".');
};

const cerrarModalAcuerdo = () => {
    mostrarModalAcuerdo.value = false;
    if (pdfPreviewUrl.value) {
        URL.revokeObjectURL(pdfPreviewUrl.value);
        pdfPreviewUrl.value = null;
    }
};

// ===== GENERAR PDF DEL CONTRATO =====
const generarPdfContrato = async () => {
    // Obtener datos del formulario
    const nombreCompleto = `${formData.value.nombre} ${formData.value.apellidoPaterno} ${formData.value.apellidoMaterno}`.trim();
    const puestoObj = puestos.value.find(p => p.id === formData.value.puesto);
    const puesto = puestoObj ? formatRoleName(puestoObj.nombre) : '';
    const area = areas.value.find(a => a.id === formData.value.area)?.nombre || '';
    const jornada = jornadas.value.find(j => j.id === formData.value.jornadaLaboral)?.nombre || '';
    const plantilla = plantillas.value.find(pl => pl.id === formData.value.plantillaContrato)?.nombre || '';
    
    // Formatear fechas
    const fechaInicio = formData.value.fechaInicio ? new Date(formData.value.fechaInicio + 'T00:00:00') : null;
    const fechaTermino = formData.value.fechaTermino ? new Date(formData.value.fechaTermino + 'T00:00:00') : null;
    
    const formatoFechaLarga = (fecha) => {
        if (!fecha) return '';
        const dia = fecha.getDate();
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                       'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const mes = meses[fecha.getMonth()];
        const anio = fecha.getFullYear();
        return `${dia} de ${mes} de ${anio}`;
    };

    // Crear el documento PDF
    const pdf = new jsPDF('p', 'mm', 'letter');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    
    // Función auxiliar para agregar nueva página si es necesario
    const verificarEspacio = (espacioNecesario) => {
        if (yPosition + espacioNecesario > pageHeight - margin) {
            pdf.addPage();
            return margin;
        }
        return yPosition;
    };
    
    // Título
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CONTRATO LABORAL', pageWidth / 2, 25, { align: 'center' });
    pdf.setFontSize(11);
    pdf.text(plantilla.toUpperCase(), pageWidth / 2, 32, { align: 'center' });
    
    // Fecha y lugar
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    let yPosition = 45;
    const fecha = new Date();
    pdf.text(`Morelos, a ${formatoFechaLarga(fecha)}`, margin, yPosition);
    
    // Sección: Partes del contrato
    yPosition += 12;
    pdf.setFont('helvetica', 'bold');
    pdf.text('LAS PARTES', margin, yPosition);
    
    yPosition += 8;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    
    const parrafoPartes = `Por una parte, la empresa CORPORATIVO RRHH, con domicilio en Morelos, México, representada por el Ing. Alberto Miguel Flores Flores en su carácter de Gerente General, quien en lo sucesivo se denominará "EL EMPLEADOR", y por la otra parte, el/la C. ${nombreCompleto}, quien en lo sucesivo se denominará "EL TRABAJADOR", acuerdan celebrar el presente contrato de trabajo bajo las siguientes:`;
    
    const lineasPartes = pdf.splitTextToSize(parrafoPartes, maxWidth);
    pdf.text(lineasPartes, margin, yPosition);
    yPosition += lineasPartes.length * 4 + 8;
    
    // CLÁUSULAS
    yPosition = verificarEspacio(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('CLÁUSULAS', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    
    pdf.setFontSize(9);
    
    // Cláusula Primera: Puesto y Funciones
    yPosition = verificarEspacio(25);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PRIMERA. PUESTO Y FUNCIONES', margin, yPosition);
    yPosition += 6;
    pdf.setFont('helvetica', 'normal');
    
    const clausula1 = `EL TRABAJADOR se compromete a prestar sus servicios personales subordinados a EL EMPLEADOR, desempeñando el puesto de ${puesto} en el área de ${area}. Las funciones específicas del puesto incluyen todas aquellas actividades inherentes al cargo y aquellas que le sean asignadas por su superior inmediato, comprometiéndose a realizarlas con la diligencia y profesionalismo requeridos.`;
    
    const lineas1 = pdf.splitTextToSize(clausula1, maxWidth);
    pdf.text(lineas1, margin, yPosition);
    yPosition += lineas1.length * 4 + 8;
    
    // Cláusula Segunda: Vigencia del Contrato
    yPosition = verificarEspacio(25);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SEGUNDA. VIGENCIA DEL CONTRATO', margin, yPosition);
    yPosition += 6;
    pdf.setFont('helvetica', 'normal');
    
    let textoVigencia = '';
    if (formData.value.tipoContrato === 'Indefinido') {
        textoVigencia = `El presente contrato es por tiempo INDEFINIDO, iniciando el ${formatoFechaLarga(fechaInicio)}, y continuará vigente hasta que alguna de las partes decida darlo por terminado conforme a lo establecido en la legislación laboral aplicable.`;
    } else if (formData.value.tipoContrato === 'Temporal') {
        textoVigencia = `El presente contrato es de carácter TEMPORAL, con vigencia desde el ${formatoFechaLarga(fechaInicio)} hasta el ${formatoFechaLarga(fechaTermino)}. Al término de este período, el contrato podrá renovarse previo acuerdo de ambas partes.`;
    } else if (formData.value.tipoContrato === 'Por Proyecto') {
        const proyecto = formData.value.proyecto || '(nombre del proyecto)';
        textoVigencia = `El presente contrato es POR PROYECTO, específicamente para el proyecto "${proyecto}", con vigencia desde el ${formatoFechaLarga(fechaInicio)} hasta el ${formatoFechaLarga(fechaTermino)} o hasta la conclusión satisfactoria del proyecto, lo que ocurra primero.`;
    }
    
    const lineas2 = pdf.splitTextToSize(textoVigencia, maxWidth);
    pdf.text(lineas2, margin, yPosition);
    yPosition += lineas2.length * 4 + 8;
    
    // Cláusula Tercera: Jornada de Trabajo
    yPosition = verificarEspacio(25);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TERCERA. JORNADA DE TRABAJO', margin, yPosition);
    yPosition += 6;
    pdf.setFont('helvetica', 'normal');
    
    const clausula3 = `La jornada de trabajo será de tipo ${jornada}, con horario de entrada a las ${formData.value.entrada} horas y salida a las ${formData.value.salida} horas. EL TRABAJADOR se compromete a cumplir puntualmente con el horario establecido y a registrar su asistencia conforme a los procedimientos institucionales.`;
    
    const lineas3 = pdf.splitTextToSize(clausula3, maxWidth);
    pdf.text(lineas3, margin, yPosition);
    yPosition += lineas3.length * 4 + 8;
    
    // Cláusula Cuarta: Remuneración
    yPosition = verificarEspacio(25);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CUARTA. REMUNERACIÓN', margin, yPosition);
    yPosition += 6;
    pdf.setFont('helvetica', 'normal');
    
    const sueldoFormateado = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(formData.value.sueldoMensual);
    
    const clausula4 = `EL EMPLEADOR pagará a EL TRABAJADOR un salario mensual de ${sueldoFormateado} (${formData.value.sueldoMensual} pesos mexicanos), más las prestaciones de ley correspondientes. El pago se realizará de manera quincenal mediante depósito bancario en la cuenta proporcionada por EL TRABAJADOR.`;
    
    const lineas4 = pdf.splitTextToSize(clausula4, maxWidth);
    pdf.text(lineas4, margin, yPosition);
    yPosition += lineas4.length * 4 + 8;
    
    // Cláusula Quinta: Modalidad de Trabajo
    yPosition = verificarEspacio(25);
    pdf.setFont('helvetica', 'bold');
    pdf.text('QUINTA. MODALIDAD DE TRABAJO', margin, yPosition);
    yPosition += 6;
    pdf.setFont('helvetica', 'normal');
    
    let textoModalidad = '';
    const modalidadActual = formData.value.modalidad || 'Presencial';
    
    if (modalidadActual === 'Presencial') {
        textoModalidad = 'La modalidad de trabajo será PRESENCIAL, por lo que EL TRABAJADOR deberá desempeñar sus funciones en las instalaciones de EL EMPLEADOR ubicadas en Morelos, México.';
    } else if (modalidadActual === 'Remota') {
        textoModalidad = 'La modalidad de trabajo será REMOTA, permitiendo a EL TRABAJADOR desempeñar sus funciones desde un lugar distinto a las instalaciones de EL EMPLEADOR, debiendo contar con los equipos y conectividad necesarios.';
    } else if (modalidadActual === 'Híbrida') {
        textoModalidad = 'La modalidad de trabajo será HÍBRIDA, combinando días de trabajo presencial en las instalaciones de EL EMPLEADOR y días de trabajo remoto, conforme al calendario que establezca el área correspondiente.';
    }
    
    const lineas5 = pdf.splitTextToSize(textoModalidad, maxWidth);
    pdf.text(lineas5, margin, yPosition);
    yPosition += lineas5.length * 4 + 8;
    
    // Cláusula Sexta: Obligaciones del Trabajador
    yPosition = verificarEspacio(30);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SEXTA. OBLIGACIONES DEL TRABAJADOR', margin, yPosition);
    yPosition += 6;
    pdf.setFont('helvetica', 'normal');
    
    const clausula6 = 'EL TRABAJADOR se obliga a: (a) Cumplir con las políticas, reglamentos y procedimientos establecidos por EL EMPLEADOR; (b) Guardar confidencialidad sobre la información privilegiada a la que tenga acceso; (c) Utilizar adecuadamente los recursos y herramientas proporcionados; (d) Mantener una conducta profesional y respetuosa con compañeros, superiores y clientes; (e) Notificar oportunamente cualquier ausencia o incapacidad.';
    
    const lineas6 = pdf.splitTextToSize(clausula6, maxWidth);
    pdf.text(lineas6, margin, yPosition);
    yPosition += lineas6.length * 4 + 8;
    
    // Cláusula Séptima: Causas de Terminación
    yPosition = verificarEspacio(25);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SÉPTIMA. CAUSAS DE TERMINACIÓN', margin, yPosition);
    yPosition += 6;
    pdf.setFont('helvetica', 'normal');
    
    const clausula7 = 'El presente contrato podrá darse por terminado por: (a) Mutuo consentimiento de las partes; (b) Renuncia voluntaria de EL TRABAJADOR con preaviso de 15 días; (c) Conclusión del período o proyecto establecido; (d) Causas justificadas establecidas en la Ley Federal del Trabajo; (e) Incumplimiento grave de las obligaciones contractuales.';
    
    const lineas7 = pdf.splitTextToSize(clausula7, maxWidth);
    pdf.text(lineas7, margin, yPosition);
    yPosition += lineas7.length * 4 + 8;
    
    // Observaciones adicionales (si existen)
    if (formData.value.observaciones && formData.value.observaciones.trim()) {
        yPosition = verificarEspacio(25);
        pdf.setFont('helvetica', 'bold');
        pdf.text('OCTAVA. OBSERVACIONES ADICIONALES', margin, yPosition);
        yPosition += 6;
        pdf.setFont('helvetica', 'normal');
        
        const lineas8 = pdf.splitTextToSize(formData.value.observaciones, maxWidth);
        pdf.text(lineas8, margin, yPosition);
        yPosition += lineas8.length * 4 + 8;
    }
    
    // Aceptación y Firmas
    yPosition = verificarEspacio(50);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    
    const textoFinal = 'Leído que fue el presente contrato y enteradas las partes de su contenido y alcance legal, lo firman de conformidad en la ciudad de Morelos, México.';
    const lineasFinal = pdf.splitTextToSize(textoFinal, maxWidth);
    pdf.text(lineasFinal, margin, yPosition);
    yPosition += lineasFinal.length * 4 + 15;
    
    // Líneas de firma
    yPosition = verificarEspacio(40);
    const col1X = margin + 20;
    const col2X = pageWidth - margin - 60;
    
    pdf.line(col1X, yPosition, col1X + 50, yPosition);
    pdf.line(col2X, yPosition, col2X + 50, yPosition);
    
    yPosition += 5;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('EL EMPLEADOR', col1X + 25, yPosition, { align: 'center' });
    pdf.text('EL TRABAJADOR', col2X + 25, yPosition, { align: 'center' });
    
    yPosition += 4;
    pdf.setFont('helvetica', 'normal');
    pdf.text('Ing. Alberto Miguel Flores Flores', col1X + 25, yPosition, { align: 'center' });
    pdf.text(nombreCompleto, col2X + 25, yPosition, { align: 'center' });
    
    yPosition += 4;
    pdf.text('Gerente General', col1X + 25, yPosition, { align: 'center' });
    pdf.text(puesto, col2X + 25, yPosition, { align: 'center' });
    
    return pdf;
};

const mostrarVistaPrevia = async () => {
    // Validar antes de mostrar vista previa
    const errores = obtenerErroresValidacion();

    if (errores.length > 0) {
        const mensajeErrores = '\n\n' + errores.map(e => `• ${e}`).join('\n');
        mostrarNotif(
            'error',
            '❌ Formulario Incompleto',
            'No se puede generar la vista previa por los siguientes motivos:' + mensajeErrores,
            10000
        );
        return;
    }

    try {
        const pdf = await generarPdfContrato();
        pdfContratoBlobActual = pdf.output('blob');
        const url = URL.createObjectURL(pdfContratoBlobActual);
        pdfContratoPreviewUrl.value = url;
        mostrarModalContrato.value = true;
    } catch (error) {
        console.error('Error al generar vista previa del contrato:', error);
        mostrarNotif('error', '❌ Error', 'Error al generar la vista previa del contrato.');
    }
};

const cerrarModalContrato = () => {
    mostrarModalContrato.value = false;
    if (pdfContratoPreviewUrl.value) {
        URL.revokeObjectURL(pdfContratoPreviewUrl.value);
        pdfContratoPreviewUrl.value = null;
    }
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
    // Mostrar vista previa en lugar de guardar directamente
    await mostrarVistaPrevia();
};

const confirmarGuardarContrato = async () => {
    // Cerrar modal de vista previa
    cerrarModalContrato();
    
    // 1) Validaciones de formulario (ya se validaron en mostrarVistaPrevia, pero por seguridad)
    const errores = obtenerErroresValidacion();

    if (errores.length > 0) {
        const mensajeErrores = '\n\n' + errores.map(e => `• ${e}`).join('\n');
        mostrarNotif(
            'error',
            '❌ Formulario Incompleto',
            'No se puede guardar el contrato por los siguientes motivos:' + mensajeErrores,
            10000
        );
        return;
    }

    // 2) Id de persona según de dónde venga
    const personaId =
        props.datosAspirante?.persona_id ||
        props.datosAspirante?.id ||
        props.datosEmpleado?.persona_id ||
        props.datosEmpleado?.id ||
        null;

    if (!personaId) {
        mostrarNotif('error', '❌ Error', 'No se encontró el identificador de la persona.');
        console.error('Sin persona_id ni id en props:', props.datosAspirante, props.datosEmpleado);
        return;
    }

    // 3) Helper: convertir blob del PDF del contrato en File
    const obtenerPdfContratoFile = () => {
        if (!pdfContratoBlobActual) {
            throw new Error('No hay PDF del contrato generado');
        }

        const nombreArchivo = `Contrato-${new Date().toISOString().slice(0, 10)}.pdf`;
        return new File([pdfContratoBlobActual], nombreArchivo, { type: 'application/pdf' });
    };

    // 4) Helper: abrir PDF desde S3 con URL firmada (7 días)
    const abrirPdfDesdeS3 = async (archivo) => {
        if (!archivo || !archivo.storage_url) return;

        let fileName = null;

        try {
            const urlObj = new URL(archivo.storage_url);
            fileName = urlObj.pathname.slice(1); // quitar "/"
        } catch (e) {
            fileName = archivo.storage_url.split('/').pop();
        }

        if (!fileName) {
            console.warn('No se pudo determinar la key de S3 para el archivo:', archivo);
            return;
        }

        const url = await obtenerUrlFirmada(fileName); // /get-file/:fileName (7 días)
        window.open(url, '_blank');
    };

    try {
        // 5) Subir DOCUMENTO ASOCIADO (si hay archivo en el input)
        let archivoDocumentoId = null;

        if (archivoPdf.value) {
            const respDoc = await subirArchivo(archivoPdf.value);
            if (!respDoc?.ok || !respDoc.archivo) {

                console.log('📄 Respuesta de subirArchivo (DOCUMENTO ASOCIADO):', respDoc);

                throw new Error(respDoc?.error || 'No se recibió información del documento asociado');
            }

            const archivoDocumento = respDoc.archivo;
            archivoDocumentoId = archivoDocumento.id;

            console.log('✅ Registro en tabla archivo para DOCUMENTO:', archivoDocumento);
            console.log('➡️ archivoDocumentoId:', archivoDocumentoId);
            console.log('➡️ personaId:', personaId);
            console.log('➡️ tipoDocumento (formData):', formData.value.tipoDocumento);

            // Asociar el documento a la persona en documento_persona
            if (formData.value.tipoDocumento && archivoDocumentoId) {
                await asociarDocumentoPersona({
                    personaId,
                    documentoTipoId: formData.value.tipoDocumento,
                    archivoId: archivoDocumentoId
                });
            }
        }

        // 6) Obtener PDF del CONTRATO (ya generado en vista previa) y subirlo a S3
        const archivoContratoFile = obtenerPdfContratoFile();
        const respContrato = await subirArchivo(archivoContratoFile);
        if (!respContrato?.ok || !respContrato.archivo) {
            throw new Error(respContrato?.error || 'No se recibió información del PDF de contrato');
        }

        const archivoContrato = respContrato.archivo;  // registro en tabla archivo
        const archivoContratoId = archivoContrato.id;  // este va al contrato (archivoId)

        // 7) MODO RENOVACIÓN EMPLEADO
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
                archivoId: archivoContratoId   // PDF del contrato generado
            };

            console.log('Payload renovación empleado:', payloadRenovacion);

            await renovarContratoEmpleado(payloadRenovacion);

            // Mostrar el PDF generado (URL firmada 7 días)
            await abrirPdfDesdeS3(archivoContrato);

            mostrarNotif('success', '✅ Éxito', 'Contrato renovado correctamente.', 4000);
            actualizarEstadoInicial();
            emit('volver-inicio');
            return;
        }

        // 8) MODO ASPIRANTE (CONTRATO NUEVO)
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
            tipoDocumentoId: formData.value.tipoDocumento, // lo sigues mandando por si luego lo usas en backend
            archivoId: archivoContratoId,                  // PDF del contrato generado
            fechaGeneracion: formData.value.fechaGeneracion || hoyISO,
            // opcional: también podrías mandar archivoDocumentoId si luego
            // decides que el backend cree documento_persona desde aquí.
            archivoDocumentoId
        };

        console.log('Payload contrato aspirante:', payloadContrato);

        await axios.post(`${API_URL}/contratos/aspirante`, payloadContrato, {
            withCredentials: true
        });

        // Mostrar el PDF generado (URL firmada 7 días)
        await abrirPdfDesdeS3(archivoContrato);

        mostrarNotif('success', '✅ Contrato Guardado', 'Contrato guardado correctamente. El aspirante ahora es empleado.', 4000);
        actualizarEstadoInicial();
        emit('volver-inicio');
    } catch (error) {
        console.error('Error al guardar contrato:', error.response?.data || error);
        mostrarNotif(
            'error',
            '❌ Error al Guardar',
            `Ocurrió un error al guardar el contrato: ${error.response?.data?.error || error.message}`,
            6000
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

        // NO limpiar la fecha de generación (siempre debe ser la fecha actual)
        if (key === 'fechaGeneracion') {
            return;
        }

        formData.value[key] = '';
    });

    formData.value.documento = '';
    archivoPdf.value = null;
    acuerdoGenerado.value = false;

    console.log('Formulario limpiado');
    mostrarNotif('info', 'ℹ️ Formulario Limpiado', 'Formulario limpiado correctamente', 3000);

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

.form-select:disabled,
.form-input:disabled {
    background-color: #f5f5f5;
    color: #999;
    cursor: not-allowed;
    opacity: 0.7;
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
.aviso-acuerdo {
    color: #d35400;
    font-weight: 600;
}

/* Upload group con botón generar */
.upload-group {
    display: flex;
    gap: 0.75rem;
    align-items: stretch;
}

.upload-group input[type="file"] {
    flex: 1;
}

.btn-generar-acuerdo {
    padding: 0.6rem 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.btn-generar-acuerdo:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-generar-acuerdo:active {
    transform: translateY(0);
}

.btn-generar-acuerdo .material-symbols-rounded {
    font-size: 20px;
}

.file-name {
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: #4caf50;
    font-weight: 500;
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

/* Modal de Vista Previa */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 1rem;
}

.modal-container {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 900px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
    margin: 0;
    font-size: 1.3rem;
    color: #333;
    font-weight: 600;
}

.btn-close-modal {
    background: transparent;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.btn-close-modal:hover {
    background-color: #f5f5f5;
    color: #333;
}

.modal-body {
    flex: 1;
    overflow: hidden;
    padding: 1rem;
    background-color: #f8f9fa;
}

.pdf-preview {
    width: 100%;
    height: 100%;
    min-height: 500px;
    border: none;
    border-radius: 8px;
    background: white;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1.5rem;
    border-top: 1px solid #e0e0e0;
}

.btn-descargar-pdf {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-descargar-pdf:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-confirmar {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-confirmar:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.btn-cancelar {
    padding: 0.75rem 1.5rem;
    background: #e0e0e0;
    color: #333;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-cancelar:hover {
    background: #d0d0d0;
}

/* Animaciones del Modal */
.modal-fade-enter-active {
    animation: modalFadeIn 0.3s ease-out;
}

.modal-fade-leave-active {
    animation: modalFadeOut 0.2s ease-in;
}

@keyframes modalFadeIn {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

@keyframes modalFadeOut {
    0% {
        opacity: 1;
    }
    100% {
        opacity: 0;
    }
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
    
    .upload-group {
        flex-direction: column;
    }
    
    .btn-generar-acuerdo {
        width: 100%;
        justify-content: center;
    }
    
    .modal-container {
        width: 95%;
        max-height: 85vh;
    }
    
    .modal-header h2 {
        font-size: 1.1rem;
    }
    
    .pdf-preview {
        min-height: 400px;
    }
    
    .modal-footer {
        flex-direction: column;
    }
    
    .btn-descargar-pdf,
    .btn-cancelar {
        width: 100%;
        justify-content: center;
    }
}

/* Toast Notification Styles */
.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  min-width: 320px;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  overflow: hidden;
  border-left: 4px solid;
}

.toast-notification.error {
  border-left-color: #e74c3c;
}

.toast-notification.success {
  border-left-color: #27ae60;
}

.toast-notification.warning {
  border-left-color: #f39c12;
}

.toast-notification.info {
  border-left-color: #3498db;
}

.toast-content {
  padding: 16px 20px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.toast-content .material-symbols-rounded {
  font-size: 24px;
  flex-shrink: 0;
  margin-top: 2px;
}

.toast-notification.error .material-symbols-rounded {
  color: #e74c3c;
}

.toast-notification.success .material-symbols-rounded {
  color: #27ae60;
}

.toast-notification.warning .material-symbols-rounded {
  color: #f39c12;
}

.toast-notification.info .material-symbols-rounded {
  color: #3498db;
}

.toast-message {
  flex: 1;
}

.toast-message h4 {
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
}

.toast-message p {
  margin: 0;
  font-size: 14px;
  color: #5a6c7d;
  line-height: 1.4;
  white-space: pre-line;
}

.toast-close {
  background: none;
  border: none;
  color: #95a5a6;
  cursor: pointer;
  padding: 0;
  font-size: 20px;
  line-height: 1;
  transition: color 0.2s;
  flex-shrink: 0;
}

.toast-close:hover {
  color: #7f8c8d;
}

/* Slide Fade Transition */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
