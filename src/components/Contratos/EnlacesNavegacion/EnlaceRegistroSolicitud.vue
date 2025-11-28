<template>
  <div class="registro-solicitud-container">
    <!-- Notificación Toast -->
    <transition name="slide-fade">
      <div v-if="mostrarNotificacion" class="toast-notification" :class="tipoNotificacion">
        <div class="toast-content">
          <span class="material-symbols-rounded toast-icon">
            {{ tipoNotificacion === 'success' ? 'check_circle' : tipoNotificacion === 'error' ? 'error' : 'info' }}
          </span>
          <div class="toast-message">
            <strong>{{ tituloNotificacion }}</strong>
            <p>{{ mensajeNotificacion }}</p>
          </div>
          <button class="toast-close" @click="cerrarNotificacion">
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>
      </div>
    </transition>

    <!-- Header con botón atrás -->
    <div class="registro-header">
      <button class="btn-back" @click="volver">
        <span class="material-symbols-rounded">arrow_back</span>
      </button>
      <h1>Solicitud</h1>
    </div>

    <!-- Contenido principal -->
    <form @submit.prevent="enviarSolicitud" class="registro-form">
      <!-- Mensajes de éxito (mantener solo para compatibilidad) -->
      <div v-if="exito" class="alert alert-success">
        ¡Solicitud enviada correctamente! Redirigiendo...
      </div>

      <!-- Indicador de carga -->
      <section class="form-section">
        <h2>Datos Personales</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>Nombre(s)</label>
            <input v-model="formulario.nombres" name="nombres" type="text" placeholder="Nombre completo" @input="validarSoloLetras" />
            <span v-if="erroresValidacion.nombres" class="error-message">{{ erroresValidacion.nombres }}</span>
          </div>
          <div class="form-group">
            <label>Apellido Paterno</label>
            <input v-model="formulario.apellidoPaterno" name="apellidoPaterno" type="text" @input="validarSoloLetras" />
            <span v-if="erroresValidacion.apellidoPaterno" class="error-message">{{ erroresValidacion.apellidoPaterno }}</span>
          </div>
          <div class="form-group">
            <label>Apellido Materno</label>
            <input v-model="formulario.apellidoMaterno" name="apellidoMaterno" type="text" @input="validarSoloLetras" />
            <span v-if="erroresValidacion.apellidoMaterno" class="error-message">{{ erroresValidacion.apellidoMaterno }}</span>
          </div>
          <div class="form-group foto">
            <label>FOTO</label>
            <div class="foto-placeholder">
              <input type="file" accept="image/*" @change="manejarFoto" />
              <img v-if="formulario.foto" :src="formulario.foto" alt="Foto" style="display: block;" />
              <span v-else style="display: flex; align-items: center; justify-content: center;">📷</span>
            </div>
          </div>

          <div class="form-group">
            <label>CURP</label>
            <input v-model="formulario.curp" type="text" maxlength="18" placeholder="Ej: PEPA900315HDFRNN09 (18 caracteres)" @input="handleInputCURP" />
            <span v-if="erroresValidacion.curp" class="error-message">{{ erroresValidacion.curp }}</span>
          </div>
          <div class="form-group">
            <label>RFC</label>
            <input v-model="formulario.rfc" type="text" maxlength="13" placeholder="Ej: PEPA900315XY1 (13 caracteres)" @input="handleInputRFC" />
            <span v-if="erroresValidacion.rfc" class="error-message">{{ erroresValidacion.rfc }}</span>
          </div>
          <div class="form-group">
            <label>NSS</label>
            <input v-model="formulario.nss" type="text" maxlength="11" placeholder="Ej: 12345678901 (11 dígitos)" @input="handleInputNSS" />
            <span v-if="erroresValidacion.nss" class="error-message">{{ erroresValidacion.nss }}</span>
          </div>

          <div class="form-group">
            <label>Fecha de Nacimiento</label>
            <input v-model="formulario.fechaNacimiento" type="date" />
          </div>
          <div class="form-group">
            <label>Sexo</label>
            <select v-model="formulario.sexoId">
              <option value="">Seleccionar</option>
              <option v-for="sexo in sexosFiltrados" :key="sexo.id" :value="sexo.id">{{ sexo.nombre }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Estado Civil</label>
            <select v-model="formulario.estadoCivilId">
              <option value="">Seleccionar</option>
              <option v-for="civil in catalogos.estadosCiviles" :key="civil.id" :value="civil.id">{{ civil.nombre }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Nacionalidad</label>
            <select v-model="formulario.nacionalidadId">
              <option value="">Seleccionar</option>
              <option v-for="nac in catalogos.nacionalidades" :key="nac.id" :value="nac.id">{{ nac.nombre }}</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Dirección y Contacto -->
      <section class="form-section">
        <h2>Dirección y Contacto</h2>
        <div class="form-group">
          <label>Domicilio</label>
          <input v-model="formulario.domicilio" type="text" placeholder="Calle #, Colonia, Municipio, Estado, CP." />
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Teléfono Celular</label>
            <input v-model="formulario.telefonoCelular" type="tel" maxlength="10" placeholder="Solo números" @input="handleInputCelular" />
            <span v-if="erroresValidacion.telefonoCelular" class="error-message">{{ erroresValidacion.telefonoCelular }}</span>
          </div>
          <div class="form-group">
            <label>Correo Electrónico</label>
            <input v-model="formulario.correoElectronico" type="email" placeholder="nombre@dominio.com" @input="handleInputCorreo" />
            <span v-if="erroresValidacion.correoElectronico" class="error-message">{{ erroresValidacion.correoElectronico }}</span>
          </div>
        </div>
      </section>

      <!-- Formación Académica -->
      <section class="form-section">
        <h2>Formación Académica</h2>
        <div v-for="(formacion, index) in formulario.formacionesAcademicas" :key="index" class="form-sub-group">
          <div class="form-grid">
            <div class="form-group">
              <label>Nivel Académico</label>
              <input v-model="formacion.nivel" type="text" />
            </div>
            <div class="form-group">
              <label>Institución</label>
              <input v-model="formacion.institucion" type="text" />
            </div>
            <div class="form-group">
              <label>Título o Carrera</label>
              <input v-model="formacion.titulo" type="text" />
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Año Inicio</label>
              <input v-model="formacion.anoInicio" type="number" />
            </div>
            <div class="form-group">
              <label>Año Fin</label>
              <input v-model="formacion.anoFin" type="number" />
            </div>
          </div>
          <button type="button" class="btn-remove" @click="removerFormacion(index)">🗑️</button>
        </div>
        <button type="button" class="btn-add" @click="agregarFormacion">+ Añadir</button>
      </section>

      <!-- Experiencia Laboral -->
      <section class="form-section">
        <h2>Experiencia Laboral</h2>
        <div v-for="(experiencia, index) in formulario.experienciasLaborales" :key="index" class="form-sub-group">
          <div class="form-grid">
            <div class="form-group">
              <label>Empresa</label>
              <input v-model="experiencia.empresa" type="text" />
            </div>
            <div class="form-group">
              <label>Puesto</label>
              <input v-model="experiencia.puesto" type="text" />
            </div>
            <div class="form-group">
              <label>Fecha Inicio</label>
              <input v-model="experiencia.fechaInicio" type="date" />
            </div>
            <div class="form-group">
              <label>Fecha Fin</label>
              <input v-model="experiencia.fechaFin" type="date" />
            </div>
          </div>
          <div class="form-group">
            <label>Descripción de Actividades</label>
            <textarea v-model="experiencia.descripcion" placeholder="Describe tus responsabilidades"></textarea>
          </div>
          <button type="button" class="btn-remove" @click="removerExperiencia(index)">🗑️</button>
        </div>
        <button type="button" class="btn-add" @click="agregarExperiencia">+ Añadir</button>
      </section>

      <!-- Interés Laboral -->
      <section class="form-section">
        <h2>Interés Laboral</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>Área de Interés</label>
            <select v-model="formulario.areaId">
              <option value="">Seleccionar</option>
              <option v-for="area in catalogos.areas" :key="area.id" :value="area.id">{{ area.nombre }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Puesto Deseado</label>
            <select v-model="formulario.puestoId">
              <option value="">Seleccionar</option>
              <option v-for="puesto in puestosFiltrados" :key="puesto.id" :value="puesto.id">{{ formatearNombrePuesto(puesto.nombre) }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Jornada Preferida</label>
            <select v-model="formulario.jornadaId">
              <option value="">Seleccionar</option>
              <option v-for="jornada in catalogos.jornadas" :key="jornada.id" :value="jornada.id">{{ jornada.nombre }}</option>
            </select>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Tipo de Contrato</label>
            <select v-model="formulario.tipoContrato">
              <option value="">Seleccionar</option>
              <option v-for="tipo in catalogos.tiposContrato" :key="tipo.id" :value="tipo.nombre">{{ tipo.nombre }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Pretensión Salarial (Moneda)</label>
            <input v-model="formulario.pretensionSalarial" type="text" placeholder="Ej: 5000.50" @input="handleInputSalario" />
            <span v-if="erroresValidacion.pretensionSalarial" class="error-message">{{ erroresValidacion.pretensionSalarial }}</span>
          </div>
          <div class="form-group">
            <label>Fecha Disponible</label>
            <input v-model="formulario.fechaDisponible" type="date" />
          </div>
          <div class="form-group">
            <label>Modalidad</label>
            <select v-model="formulario.modalidad" @change="handleInputModalidad">
              <option value="">Seleccionar</option>
              <option value="Remota">Remota</option>
              <option value="Híbrida">Híbrida</option>
              <option value="Presencial">Presencial</option>
            </select>
            <span v-if="erroresValidacion.modalidad" class="error-message">{{ erroresValidacion.modalidad }}</span>
          </div>
        </div>
      </section>

      <!-- Documentos Adjuntos -->
      <section class="form-section">
        <h2>Documentos Adjuntos</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>CURP</label>
            <div class="file-input">
              <input type="file" accept="application/pdf" @change="manejarArchivo('curpFile', $event)" />
              <span v-if="formulario.curpFile">✓</span>
            </div>
            <small class="file-hint">PDF - Máx 5MB</small>
            <span v-if="erroresArchivos.curpFile" class="error">{{ erroresArchivos.curpFile }}</span>
          </div>
          <div class="form-group">
            <label>INE</label>
            <div class="file-input">
              <input type="file" accept="application/pdf" @change="manejarArchivo('ineFile', $event)" />
              <span v-if="formulario.ineFile">✓</span>
            </div>
            <small class="file-hint">PDF - Máx 5MB</small>
            <span v-if="erroresArchivos.ineFile" class="error">{{ erroresArchivos.ineFile }}</span>
          </div>
          <div class="form-group">
            <label>Comprobante Domicilio</label>
            <div class="file-input">
              <input type="file" accept="application/pdf" @change="manejarArchivo('domicilioFile', $event)" />
              <span v-if="formulario.domicilioFile">✓</span>
            </div>
            <small class="file-hint">PDF - Máx 5MB</small>
            <span v-if="erroresArchivos.domicilioFile" class="error">{{ erroresArchivos.domicilioFile }}</span>
          </div>
          <div class="form-group">
            <label>CV</label>
            <div class="file-input">
              <input type="file" accept="application/pdf" @change="manejarArchivo('cvFile', $event)" />
              <span v-if="formulario.cvFile">✓</span>
            </div>
            <small class="file-hint">PDF - Máx 10MB</small>
            <span v-if="erroresArchivos.cvFile" class="error">{{ erroresArchivos.cvFile }}</span>
          </div>
        </div>
      </section>

      <!-- Confirmación -->
      <section class="form-section">
        <h2>Confirmación</h2>
        <div class="checkbox-group">
          <label>
            <input v-model="formulario.confirmacionDatos" type="checkbox" />
            Confirmo que los datos son verídicos.
          </label>
          <label>
            <input v-model="formulario.aceptoPrivacidad" type="checkbox" />
            Acepto al Aviso de Privacidad
          </label>
        </div>
      </section>

      <!-- Botones de acción -->
      <div class="form-actions">
        <button type="submit" class="btn-primary" :disabled="cargando">
          {{ cargando ? 'ENVIANDO...' : 'ENVIAR SOLICITUD' }}
        </button>
        <button type="button" class="btn-secondary" @click="limpiarFormulario" :disabled="cargando">LIMPIAR</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { crearSolicitud, subirArchivo, obtenerCatalogos } from '@/services/solicitudesService';
import { useValidacionesSolicitud } from '@/composables/useValidacionesSolicitud';

const emit = defineEmits(['volver-inicio']);

// Composable de validaciones
const validaciones = useValidacionesSolicitud();

// Estado del formulario y UI
const cargando = ref(false);
const error = ref(null);
const exito = ref(false);

// Estado de notificaciones
const mostrarNotificacion = ref(false);
const tipoNotificacion = ref('error'); // 'success', 'error', 'warning', 'info'
const tituloNotificacion = ref('');
const mensajeNotificacion = ref('');

// Función para mostrar notificación
const mostrarNotif = (tipo, titulo, mensaje, duracion = 5000) => {
  tipoNotificacion.value = tipo;
  tituloNotificacion.value = titulo;
  mensajeNotificacion.value = mensaje;
  mostrarNotificacion.value = true;
  
  // Auto cerrar después de la duración especificada
  setTimeout(() => {
    mostrarNotificacion.value = false;
  }, duracion);
};

const cerrarNotificacion = () => {
  mostrarNotificacion.value = false;
};

// Estado de errores de validación por campo
const erroresValidacion = ref({
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  curp: '',
  rfc: '',
  nss: '',
  telefonoCelular: '',
  correoElectronico: '',
  pretensionSalarial: '',
  modalidad: ''
});

// Catálogos
const catalogos = ref({
  sexos: [],
  estadosCiviles: [],
  nacionalidades: [],
  areas: [],
  puestos: [],
  jornadas: [],
  tiposDocumento: [],
  tiposContrato: []
});

const formulario = ref({
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  foto: null,
  fotoFile: null,
  curp: '',
  rfc: '',
  nss: '',
  fechaNacimiento: '',
  sexoId: '',
  estadoCivilId: '',
  nacionalidadId: '',
  domicilio: '',
  telefonoCelular: '',
  correoElectronico: '',
  formacionesAcademicas: [],
  experienciasLaborales: [],
  areaId: '',
  puestoId: '',
  jornadaId: '',
  tipoContrato: '',
  pretensionSalarial: '',
  fechaDisponible: '',
  modalidad: '',
  curpFile: null,
  ineFile: null,
  domicilioFile: null,
  cvFile: null,
  documentos: [],
  confirmacionDatos: false,
  aceptoPrivacidad: false
});

const erroresArchivos = ref({
  curpFile: '',
  ineFile: '',
  domicilioFile: '',
  cvFile: ''
});

// Cargar catálogos al montar el componente
const cargarCatalogos = async () => {
  try {
    const response = await obtenerCatalogos();
    if (response.success) {
      catalogos.value = response.catalogos;
    } else {
      mostrarNotif('error', '❌ Error de Carga', response.message || 'Error al cargar los datos');
    }
  } catch (err) {
    console.error('Error al cargar catálogos:', err);
    mostrarNotif('error', '❌ Error de Carga', 'Error al cargar los datos. Por favor recarga la página.');
  }
};

// Filtrar sexos a solo Masculino y Femenino
const sexosFiltrados = computed(() => {
  return catalogos.value.sexos.filter(sexo => 
    ['Masculino', 'Femenino'].includes(sexo.nombre)
  );
});

  // Filtrar puestos según área seleccionada
  const puestosFiltrados = computed(() => {
    const lista = catalogos.value.puestos || [];
    const areaSeleccionada = catalogos.value.areas.find(a => a.id === formulario.value.areaId);
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

    return lista
      .filter(puesto => {
        // Si es un jefe específico, solo mostrarlo si es el del área seleccionada
        if (todosLosJefes.includes(puesto.nombre)) {
          return nombreArea && jefesPorArea[nombreArea] === puesto.nombre;
        }
        // Mostrar todos los demás roles (ADMIN, EMPLEADO, GERENTE_GENERAL, y roles generales)
        return true;
      })
      .map(puesto => ({
        ...puesto,
        nombreFormateado: formatearNombrePuesto(puesto.nombre)
      }));
  });

// Función para formatear nombres de puestos
const formatearNombrePuesto = (nombre) => {
  const mapa = {
    'ADMIN': 'Admin',
    'EMPLEADO': 'Empleado',
    'GERENTE_GENERAL': 'Gerente General',
    'JEFE_AREA': 'Jefe de Área',
    'JEFE_ASISTENCIAS': 'Jefe de Asistencias',
    'JEFE_CONTRATOS': 'Jefe de Contratos',
    'JEFE_VACACIONES': 'Jefe de Vacaciones',
    'JEFE_INCIDENCIAS': 'Jefe de Incidencias',
    'Analista de Datos': 'Analista de Datos',
    'Contador General': 'Contador General',
    'Desarrollador Full Stack': 'Desarrollador Full Stack'
  };
  return mapa[nombre] || nombre;
};

// === VALIDACIONES EN TIEMPO REAL ===

const validarCampo = (campo, valor) => {
  let resultado;
  
  switch(campo) {
    case 'nombres':
    case 'apellidoPaterno':
    case 'apellidoMaterno':
      resultado = validaciones.validarSoloLetras(valor, campo === 'nombres' ? 'Nombre' : (campo === 'apellidoPaterno' ? 'Apellido Paterno' : 'Apellido Materno'));
      if (!resultado.valido) {
        erroresValidacion.value[campo] = resultado.error;
      } else {
        erroresValidacion.value[campo] = '';
        // Capitalizar
        formulario.value[campo] = resultado.valorCapitalizado || valor;
      }
      break;
      
    case 'curp':
      resultado = validaciones.validarCURP(valor);
      erroresValidacion.value[campo] = resultado.error || '';
      break;
      
    case 'rfc':
      resultado = validaciones.validarRFC(valor);
      erroresValidacion.value[campo] = resultado.error || '';
      break;
      
    case 'nss':
      resultado = validaciones.validarNSS(valor);
      erroresValidacion.value[campo] = resultado.error || '';
      break;
      
    case 'telefonoCelular':
      resultado = validaciones.validarCelular(valor);
      erroresValidacion.value[campo] = resultado.error || '';
      break;
      
    case 'correoElectronico':
      resultado = validaciones.validarCorreo(valor);
      erroresValidacion.value[campo] = resultado.error || '';
      break;
      
    case 'pretensionSalarial':
      resultado = validaciones.validarPretensionSalarial(valor);
      erroresValidacion.value[campo] = resultado.error || '';
      break;
      
    case 'modalidad':
      resultado = validaciones.validarModalidad(valor);
      erroresValidacion.value[campo] = resultado.error || '';
      break;
  }
};

// Listener para validar en tiempo real
  const handleInputCURP = (event) => {
  let valor = event.target.value.toUpperCase();
  // Eliminar espacios y limitar a 18 caracteres
  valor = valor.replace(/\s/g, '');
  if (valor.length > 18) valor = valor.substring(0, 18);
  formulario.value.curp = valor;
  validarCampo('curp', valor);
};

const handleInputRFC = (event) => {
  let valor = event.target.value.toUpperCase();
  // Eliminar espacios y limitar a 13 caracteres
  valor = valor.replace(/\s/g, '');
  if (valor.length > 13) valor = valor.substring(0, 13);
  formulario.value.rfc = valor;
  validarCampo('rfc', valor);
};

const handleInputNSS = (event) => {
  let valor = event.target.value;
  // Solo permitir números, eliminar espacios y limitar a 11
  const soloNumeros = valor.replace(/[^0-9]/g, '').substring(0, 11);
  formulario.value.nss = soloNumeros;
  validarCampo('nss', soloNumeros);
};

const handleInputCelular = (event) => {
  let valor = event.target.value;
  // Solo permitir números y limitar a 10
  const soloNumeros = valor.replace(/[^0-9]/g, '').substring(0, 10);
  formulario.value.telefonoCelular = soloNumeros;
  validarCampo('telefonoCelular', soloNumeros);
};

const handleInputCorreo = (event) => {
  const valor = event.target.value.toLowerCase();
  formulario.value.correoElectronico = valor;
  validarCampo('correoElectronico', valor);
};

const handleInputSalario = (event) => {
  const valor = event.target.value;
  // Solo permitir números y punto (máximo 2 decimales)
  const soloNumeros = valor.replace(/[^0-9.]/g, '');
  // Limitar a 2 decimales
  const partes = soloNumeros.split('.');
  let resultado = partes[0];
  if (partes[1]) {
    resultado += '.' + partes[1].substring(0, 2);
  }
  formulario.value.pretensionSalarial = resultado;
  validarCampo('pretensionSalarial', resultado);
};

const handleInputModalidad = (event) => {
  const valor = event.target.value;
  formulario.value.modalidad = valor;
  validarCampo('modalidad', valor);
};

// Validar que solo se ingresen letras y espacios (no números)
const validarSoloLetras = (event) => {
  const input = event.target;
  const valor = input.value;
  // Permitir solo letras (incluyendo acentos), espacios y guiones
  const valorLimpio = valor.replace(/[^a-záéíóúàèìòùâêîôûäëïöüñA-ZÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÄËÏÖÑ\s\-]/g, '');
  input.value = valorLimpio;
  // Actualizar el v-model
  if (input.name === 'nombres') {
    formulario.value.nombres = valorLimpio;
    validarCampo('nombres', valorLimpio);
  }
  if (input.name === 'apellidoPaterno') {
    formulario.value.apellidoPaterno = valorLimpio;
    validarCampo('apellidoPaterno', valorLimpio);
  }
  if (input.name === 'apellidoMaterno') {
    formulario.value.apellidoMaterno = valorLimpio;
    validarCampo('apellidoMaterno', valorLimpio);
  }
};

onMounted(() => {
  cargarCatalogos();
});

const manejarFoto = (event) => {
  const archivo = event.target.files[0];
  if (archivo) {
    // Validar que sea una imagen (jpg, jpeg, png)
    const formatosPermitidos = ['image/jpeg', 'image/jpg', 'image/png'];
    const extensionesPermitidas = ['jpg', 'jpeg', 'png'];
    const extension = archivo.name.split('.').pop().toLowerCase();
    
    if (!formatosPermitidos.includes(archivo.type) || !extensionesPermitidas.includes(extension)) {
      mostrarNotif('error', '❌ Formato No Válido', 'Solo se permiten imágenes en formato JPG, JPEG o PNG', 5000);
      event.target.value = ''; // Limpiar el input
      return;
    }
    
    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (archivo.size > maxSize) {
      const sizeMB = (archivo.size / (1024 * 1024)).toFixed(2);
      mostrarNotif('error', '❌ Archivo Muy Pesado', `La imagen pesa ${sizeMB}MB. El tamaño máximo permitido es 5MB`, 5000);
      event.target.value = '';
      return;
    }
    
    formulario.value.fotoFile = archivo;
    const reader = new FileReader();
    reader.onload = (e) => {
      formulario.value.foto = e.target.result;
    };
    reader.readAsDataURL(archivo);
  }
};

const manejarArchivo = (campo, event) => {
  const archivo = event.target.files[0];
  erroresArchivos.value[campo] = '';
  
  if (!archivo) return;
  
  // Definir límites de peso y formatos permitidos
  const configArchivos = {
    curpFile: { maxSize: 5 * 1024 * 1024, formatos: ['pdf'] },
    ineFile: { maxSize: 5 * 1024 * 1024, formatos: ['pdf'] },
    domicilioFile: { maxSize: 5 * 1024 * 1024, formatos: ['pdf'] },
    cvFile: { maxSize: 10 * 1024 * 1024, formatos: ['pdf'] }
  };
  
  const config = configArchivos[campo];
  const extension = archivo.name.split('.').pop().toLowerCase();
  const tamanoMB = (archivo.size / (1024 * 1024)).toFixed(2);
  
  // Validar formato
  if (!config.formatos.includes(extension)) {
    erroresArchivos.value[campo] = `Formato no permitido. Acepta: ${config.formatos.join(', ').toUpperCase()}`;
    event.target.value = '';
    return;
  }
  
  // Validar peso
  if (archivo.size > config.maxSize) {
    const maxMB = config.maxSize / (1024 * 1024);
    erroresArchivos.value[campo] = `Archivo muy pesado (${tamanoMB}MB). Máximo: ${maxMB}MB`;
    event.target.value = '';
    return;
  }
  
  formulario.value[campo] = archivo;
};

const agregarFormacion = () => {
  formulario.value.formacionesAcademicas.push({
    nivel: '',
    institucion: '',
    titulo: '',
    anioInicio: '',
    anioFin: ''
  });
};

const removerFormacion = (index) => {
  formulario.value.formacionesAcademicas.splice(index, 1);
};

const agregarExperiencia = () => {
  formulario.value.experienciasLaborales.push({
    empresa: '',
    puesto: '',
    fechaInicio: '',
    fechaFin: '',
    descripcion: ''
  });
};

const removerExperiencia = (index) => {
  formulario.value.experienciasLaborales.splice(index, 1);
};

const enviarSolicitud = async () => {
  if (!formulario.value.confirmacionDatos || !formulario.value.aceptoPrivacidad) {
    mostrarNotif('error', '⚠️ Confirmación Requerida', 'Debe aceptar las confirmaciones antes de enviar.');
    return;
  }

  // Validar todo el formulario
  const validacion = validaciones.validarFormulario(formulario.value);
  
  if (validacion.tieneErrores) {
    // Actualizar erroresValidacion con todos los errores encontrados
    Object.assign(erroresValidacion.value, validacion.errores);
    mostrarNotif('error', '⚠️ Errores en el Formulario', 'Por favor corrige los errores en el formulario antes de enviar.');
    console.log('Errores encontrados:', validacion.errores);
    return;
  }

  cargando.value = true;

  try {
    // Función auxiliar para obtener el ID de tipo de documento por nombre
    // Más robusta: intenta sinónimos comunes (cv, curriculum, etc.), acepta id numérico
    const obtenerDocumentoTipoId = (nombreTipo) => {
      if (!catalogos.value || !Array.isArray(catalogos.value.tiposDocumento)) return null;

      const nameLower = String(nombreTipo || '').toLowerCase();

      const synonyms = {
        cv: ['cv', 'curriculum', 'currículum', 'curriculum vitae', 'currículum vitae', 'curr'],
        curp: ['curp'],
        ine: ['ine', 'identificacion', 'identificación', 'credencial', 'identificación oficial'],
        domicilio: ['domicilio', 'comprobante domicilio', 'comprobante de domicilio']
      };

      const patterns = synonyms[nameLower] || [nameLower];

      // Try to find by matching any synonym in the catalog name
      for (const p of patterns) {
        const tipo = catalogos.value.tiposDocumento.find(t => t.nombre && t.nombre.toLowerCase().includes(p));
        if (tipo) return tipo.id;
      }

      // If nombreTipo looks like an id, try to find by id
      const maybeId = parseInt(nombreTipo, 10);
      if (!isNaN(maybeId)) {
        const tipoById = catalogos.value.tiposDocumento.find(t => String(t.id) === String(maybeId));
        if (tipoById) return tipoById.id;
      }

      // Not found — log to help debugging
      console.warn(`No se encontró tipo de documento para '${nombreTipo}'. Catálogo disponible:`, catalogos.value.tiposDocumento);
      return null;
    };

    // Subir documentos a AWS S3 si existen
    const documentosCargados = [];

    if (formulario.value.fotoFile) {
      try {
        const resFoto = await subirArchivo(formulario.value.fotoFile, 'foto');
        if (resFoto.success) {
          formulario.value.fotoUrl = resFoto.storageUrl;
        } else {
          throw new Error('Error al subir foto: ' + resFoto.message);
        }
      } catch (err) {
        console.error('Error en foto:', err);
        mostrarNotif('warning', '⚠️ Error en Foto', 'Error al subir la foto. Continuando sin foto...', 4000);
        formulario.value.fotoUrl = null;
      }
    }

    if (formulario.value.curpFile) {
      try {
        const resCurp = await subirArchivo(formulario.value.curpFile, 'curp');
        if (resCurp.success) {
          documentosCargados.push({
            nombre: formulario.value.curpFile.name,
            tipoMime: formulario.value.curpFile.type,
            tamanoBytes: formulario.value.curpFile.size,
            storageUrl: resCurp.storageUrl,
            documentoTipoId: obtenerDocumentoTipoId('curp')
          });
        }
      } catch (err) {
        console.error('Error en CURP:', err);
        mostrarNotif('warning', '⚠️ Error en CURP', 'Error al subir CURP. Continuando...', 4000);
      }
    }

    if (formulario.value.ineFile) {
      try {
        const resIne = await subirArchivo(formulario.value.ineFile, 'ine');
        if (resIne.success) {
          documentosCargados.push({
            nombre: formulario.value.ineFile.name,
            tipoMime: formulario.value.ineFile.type,
            tamanoBytes: formulario.value.ineFile.size,
            storageUrl: resIne.storageUrl,
            documentoTipoId: obtenerDocumentoTipoId('ine')
          });
        }
      } catch (err) {
        console.error('Error en INE:', err);
        mostrarNotif('warning', '⚠️ Error en INE', 'Error al subir INE. Continuando...', 4000);
      }
    }

    if (formulario.value.domicilioFile) {
      try {
        const resDom = await subirArchivo(formulario.value.domicilioFile, 'domicilio');
        if (resDom.success) {
          documentosCargados.push({
            nombre: formulario.value.domicilioFile.name,
            tipoMime: formulario.value.domicilioFile.type,
            tamanoBytes: formulario.value.domicilioFile.size,
            storageUrl: resDom.storageUrl,
            documentoTipoId: obtenerDocumentoTipoId('domicilio')
          });
        }
      } catch (err) {
        console.error('Error en Comprobante de Domicilio:', err);
        mostrarNotif('warning', '⚠️ Error en Domicilio', 'Error al subir comprobante de domicilio. Continuando...', 4000);
      }
    }

    if (formulario.value.cvFile) {
      try {
        const resCv = await subirArchivo(formulario.value.cvFile, 'cv');
        if (resCv.success) {
          documentosCargados.push({
            nombre: formulario.value.cvFile.name,
            tipoMime: formulario.value.cvFile.type,
            tamanoBytes: formulario.value.cvFile.size,
            storageUrl: resCv.storageUrl,
            documentoTipoId: obtenerDocumentoTipoId('cv')
          });
        }
      } catch (err) {
        console.error('Error en CV:', err);
        mostrarNotif('warning', '⚠️ Error en CV', 'Error al subir CV. Continuando...', 4000);
      }
    }

    // Crear solicitud con todos los datos
    const datosParaEnviar = {
      nombres: formulario.value.nombres,
      apellidoPaterno: formulario.value.apellidoPaterno,
      apellidoMaterno: formulario.value.apellidoMaterno,
      curp: formulario.value.curp,
      rfc: formulario.value.rfc,
      nss: formulario.value.nss,
      fechaNacimiento: formulario.value.fechaNacimiento,
      sexoId: formulario.value.sexoId ? formulario.value.sexoId : null,
      estadoCivilId: formulario.value.estadoCivilId ? formulario.value.estadoCivilId : null,
      nacionalidadId: formulario.value.nacionalidadId ? formulario.value.nacionalidadId : null,
      fotoUrl: formulario.value.fotoUrl || null,
      telefonoCelular: formulario.value.telefonoCelular,
      correoElectronico: formulario.value.correoElectronico,
      domicilio: formulario.value.domicilio,
      formacionesAcademicas: formulario.value.formacionesAcademicas,
      experienciasLaborales: formulario.value.experienciasLaborales,
      areaId: formulario.value.areaId ? formulario.value.areaId : null,
      puestoId: formulario.value.puestoId ? formulario.value.puestoId : null,
      jornadaId: formulario.value.jornadaId ? formulario.value.jornadaId : null,
      tipoContrato: formulario.value.tipoContrato || null,
      modalidad: formulario.value.modalidad || null,
      pretensionSalarial: formulario.value.pretensionSalarial || null,
      fechaDisponible: formulario.value.fechaDisponible || null,
      documentos: documentosCargados
    };

    // Log documentos para depuración: asegura que documentoTipoId está presente
    console.log('documentosCargados', documentosCargados);
    const documentosSinTipo = documentosCargados.filter(d => !d.documentoTipoId);
    if (documentosSinTipo.length) console.warn('Documentos sin tipo detectados (esto causará documento_tipo_id=NULL):', documentosSinTipo);

    const response = await crearSolicitud(datosParaEnviar);
    
    if (response.success) {
      exito.value = true;
      limpiarFormulario();

      // Mostrar mensaje de éxito brevemente y recargar la página
      setTimeout(() => {
        exito.value = false;
        // Recarga la página completa para reflejar el nuevo registro
        if (typeof window !== 'undefined' && window.location) {
          window.location.reload();
        } else {
          // Fallback: emitir evento para que el padre maneje la navegación
          emit('volver-inicio');
        }
      }, 2000);
    }
  } catch (err) {
    console.error('Error al enviar solicitud:', err);
    
    // Manejar error de duplicado (409 Conflict)
    if (err.status === 409) {
      mostrarNotif('error', '⚠️ Registro Duplicado', err.message || 'Ya existe un registro con estos datos de identificación (RFC, CURP o NSS).', 7000);
    } else if (err.status === 400) {
      mostrarNotif('error', '❌ Datos Inválidos', err.message || 'Por favor verifica los campos del formulario.', 5000);
    } else {
      mostrarNotif('error', '❌ Error al Enviar', err.message || 'Error al enviar la solicitud. Por favor intenta nuevamente.', 5000);
    }
  } finally {
    cargando.value = false;
  }
};

const limpiarFormulario = () => {
  formulario.value = {
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    foto: null,
    fotoFile: null,
    fotoUrl: null,
    curp: '',
    rfc: '',
    nss: '',
    fechaNacimiento: '',
    sexoId: '',
    estadoCivilId: '',
    nacionalidadId: '',
    domicilio: '',
    telefonoCelular: '',
    correoElectronico: '',
    formacionesAcademicas: [],
    experienciasLaborales: [],
    areaId: '',
    puestoId: '',
    jornadaId: '',
    tipoContrato: '',
    pretensionSalarial: '',
    fechaDisponible: '',
    modalidad: '',
    curpFile: null,
    ineFile: null,
    domicilioFile: null,
    cvFile: null,
    documentos: [],
    confirmacionDatos: false,
    aceptoPrivacidad: false
  };
};

const volver = () => {
  emit('volver-inicio');
};
</script>

<style scoped>
/* Alertas */
.alert {
  padding: 15px 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  font-weight: 500;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert-error {
  background-color: #fee;
  color: #c33;
  border-left: 4px solid #c33;
}

.alert-success {
  background-color: #efe;
  color: #3c3;
  border-left: 4px solid #3c3;
}

.registro-solicitud-container {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.registro-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  padding: 2rem 2rem 1.5rem 2rem;
  background-color: transparent;
  position: relative;
}

.btn-back {
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  padding: 0;
  color: #333;
  position: absolute;
  left: 2rem;
  font-size: 24px;
}

.btn-back:hover {
  color: #5a5aff;
}

.registro-header h1 {
  margin: 0;
  font-size: 1.75rem;
  color: #000;
  font-weight: 600;
}

.registro-form {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.form-section {
  background: white;
  padding: 35px 40px;
  margin-bottom: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-section h2 {
  font-size: 18px;
  color: #333;
  margin: 0 0 25px 0;
  font-weight: 600;
  border-bottom: 2px solid #5a5aff;
  padding-bottom: 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.foto {
  align-items: center;
}

.form-group label {
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #5a5aff;
  box-shadow: 0 0 0 3px rgba(90, 90, 255, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.foto-placeholder {
  width: 120px;
  height: 120px;
  border: 2px dashed #5a5aff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0ff;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.foto-placeholder:hover {
  border-color: #3a3acc;
  background: #e8e8ff;
}

.foto-placeholder input {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  padding: 0;
  z-index: 10;
}

.foto-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.foto-placeholder span {
  font-size: 40px;
  position: relative;
  z-index: 1;
}

.form-sub-group {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
  border: 1px solid #eee;
  position: relative;
}

.btn-remove {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #e74c3c;
  padding: 0;
}

.btn-remove:hover {
  transform: scale(1.2);
}

.btn-add {
  background: #5a5aff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  margin-top: 15px;
  transition: background 0.3s;
}

.btn-add:hover {
  background: #4a4aee;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
}

.checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #5a5aff;
}

.file-input {
  position: relative;
  display: inline-block;
}

.file-input input {
  padding: 10px;
  border: 1px dashed #ddd;
  border-radius: 6px;
  width: 100%;
}

.file-input span {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #27ae60;
  font-weight: bold;
}

.file-input .error {
  position: static;
  transform: none;
  color: #e74c3c;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

.file-hint {
  display: block;
  color: #7f8c8d;
  font-size: 12px;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 40px;
  background: white;
  padding: 35px 40px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-primary,
.btn-secondary {
  padding: 14px 50px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.3s;
  min-width: 180px;
}

.btn-primary {
  background: #5a5aff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #4a4aee;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e0e0;
}

.btn-secondary:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Mensajes de error */
.error-message {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 5px;
  display: block;
  font-weight: 500;
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: #e74c3c;
  background-color: #ffe8e8;
}

.alert {
  padding: 15px 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  font-weight: 500;
  animation: slideDown 0.3s ease;
}

.alert-error {
  background-color: #ffe8e8;
  border: 1px solid #e74c3c;
  color: #c0392b;
}

.alert-success {
  background-color: #d4edda;
  border: 1px solid #28a745;
  color: #155724;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

