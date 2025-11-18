<template>
  <div class="registro-solicitud-container">
    <!-- Header con botón atrás -->
    <div class="registro-header">
      <button class="btn-back" @click="volver">
        <span class="icon">←</span>
      </button>
      <h1>Solicitud</h1>
    </div>

    <!-- Contenido principal -->
    <form @submit.prevent="enviarSolicitud" class="registro-form">
      <!-- Mensajes de error y éxito -->
      <div v-if="error" class="alert alert-error">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>{{ error }}</span>
          <button type="button" @click="cargarCatalogos" style="padding: 5px 15px; background: #c33; border: none; color: white; border-radius: 4px; cursor: pointer;">Reintentar</button>
        </div>
      </div>
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
          </div>
          <div class="form-group">
            <label>Apellido Paterno</label>
            <input v-model="formulario.apellidoPaterno" name="apellidoPaterno" type="text" @input="validarSoloLetras" />
          </div>
          <div class="form-group">
            <label>Apellido Materno</label>
            <input v-model="formulario.apellidoMaterno" name="apellidoMaterno" type="text" @input="validarSoloLetras" />
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
            <input v-model="formulario.curp" type="text" placeholder="Ej: PEPA900315HDFRNN09 (18 caracteres)" />
          </div>
          <div class="form-group">
            <label>RFC</label>
            <input v-model="formulario.rfc" type="text" placeholder="Ej: PEPA900315XY1 (13 caracteres)" />
          </div>
          <div class="form-group">
            <label>NSS</label>
            <input v-model="formulario.nss" type="text" placeholder="Ej: 12345678901 (11 dígitos)" />
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
            <input v-model="formulario.telefonoCelular" type="tel" />
          </div>
          <div class="form-group">
            <label>Correo Electrónico</label>
            <input v-model="formulario.correoElectronico" type="email" />
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
            <label>Pretensión Salarial</label>
            <input v-model="formulario.pretensionSalarial" type="text" />
          </div>
          <div class="form-group">
            <label>Fecha Disponible</label>
            <input v-model="formulario.fechaDisponible" type="date" />
          </div>
          <div class="form-group">
            <label>Modalidad</label>
            <input v-model="formulario.modalidad" type="text" />
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
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" @change="manejarArchivo('curpFile', $event)" />
              <span v-if="formulario.curpFile">✓</span>
            </div>
            <small class="file-hint">PDF, JPG, PNG - Máx 5MB</small>
            <span v-if="erroresArchivos.curpFile" class="error">{{ erroresArchivos.curpFile }}</span>
          </div>
          <div class="form-group">
            <label>INE</label>
            <div class="file-input">
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" @change="manejarArchivo('ineFile', $event)" />
              <span v-if="formulario.ineFile">✓</span>
            </div>
            <small class="file-hint">PDF, JPG, PNG - Máx 5MB</small>
            <span v-if="erroresArchivos.ineFile" class="error">{{ erroresArchivos.ineFile }}</span>
          </div>
          <div class="form-group">
            <label>Comprobante Domicilio</label>
            <div class="file-input">
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" @change="manejarArchivo('domicilioFile', $event)" />
              <span v-if="formulario.domicilioFile">✓</span>
            </div>
            <small class="file-hint">PDF, JPG, PNG - Máx 5MB</small>
            <span v-if="erroresArchivos.domicilioFile" class="error">{{ erroresArchivos.domicilioFile }}</span>
          </div>
          <div class="form-group">
            <label>CV</label>
            <div class="file-input">
              <input type="file" accept=".pdf,.doc,.docx" @change="manejarArchivo('cvFile', $event)" />
              <span v-if="formulario.cvFile">✓</span>
            </div>
            <small class="file-hint">PDF, DOC, DOCX - Máx 10MB</small>
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
import { ref } from 'vue';
import { crearSolicitud, subirArchivo, obtenerCatalogos } from '@/services/solicitudesService';

const emit = defineEmits(['volver-inicio']);

// Estado del formulario y UI
const cargando = ref(false);
const error = ref(null);
const exito = ref(false);

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
      error.value = response.message || 'Error al cargar los datos';
    }
  } catch (err) {
    console.error('Error al cargar catálogos:', err);
    error.value = 'Error al cargar los datos. Por favor recarga la página.';
  }
};

// Filtrar sexos a solo Masculino y Femenino
import { computed } from 'vue';
const sexosFiltrados = computed(() => {
  return catalogos.value.sexos.filter(sexo => 
    ['Masculino', 'Femenino'].includes(sexo.nombre)
  );
});

// Filtrar y formatear puestos (mostrar todos)
const puestosFiltrados = computed(() => {
  return catalogos.value.puestos.map(puesto => ({
    ...puesto,
    nombreFormateado: formatearNombrePuesto(puesto.nombre)
  }));
});

// Función para formatear nombres de puestos
const formatearNombrePuesto = (nombre) => {
  const mapa = {
    'ADMIN': 'Administrador',
    'EMPLEADO': 'Empleado',
    'JEFE_RH': 'Jefe de Recursos Humanos',
    'JEFE_AREA': 'Jefe de Área'
  };
  return mapa[nombre] || nombre;
};

// Validar que solo se ingresen letras y espacios (no números)
const validarSoloLetras = (event) => {
  const input = event.target;
  const valor = input.value;
  // Permitir solo letras (incluyendo acentos), espacios y guiones
  const valorLimpio = valor.replace(/[^a-záéíóúàèìòùâêîôûäëïöüA-ZÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÄËÏÖ\s\-]/g, '');
  input.value = valorLimpio;
  // Actualizar el v-model
  if (input.name === 'nombres') formulario.value.nombres = valorLimpio;
  if (input.name === 'apellidoPaterno') formulario.value.apellidoPaterno = valorLimpio;
  if (input.name === 'apellidoMaterno') formulario.value.apellidoMaterno = valorLimpio;
};

// Llamar a cargarCatalogos cuando se monta el componente
import { onMounted } from 'vue';
onMounted(() => {
  cargarCatalogos();
});

const manejarFoto = (event) => {
  const archivo = event.target.files[0];
  if (archivo) {
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
    curpFile: { maxSize: 5 * 1024 * 1024, formatos: ['pdf', 'jpg', 'jpeg', 'png'] },
    ineFile: { maxSize: 5 * 1024 * 1024, formatos: ['pdf', 'jpg', 'jpeg', 'png'] },
    domicilioFile: { maxSize: 5 * 1024 * 1024, formatos: ['pdf', 'jpg', 'jpeg', 'png'] },
    cvFile: { maxSize: 10 * 1024 * 1024, formatos: ['pdf', 'doc', 'docx'] }
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
    error.value = 'Debe aceptar las confirmaciones antes de enviar.';
    return;
  }

  cargando.value = true;
  error.value = null;

  try {
    // Función auxiliar para obtener el ID de tipo de documento por nombre
    const obtenerDocumentoTipoId = (nombreTipo) => {
      const tipo = catalogos.value.tiposDocumento.find(
        t => t.nombre.toLowerCase().includes(nombreTipo.toLowerCase())
      );
      return tipo ? tipo.id : null;
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
        error.value = 'Error al subir la foto. Continuando sin foto...';
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
        error.value = 'Error al subir CURP. Continuando...';
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
        error.value = 'Error al subir INE. Continuando...';
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
        error.value = 'Error al subir comprobante de domicilio. Continuando...';
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
        error.value = 'Error al subir CV. Continuando...';
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

    const response = await crearSolicitud(datosParaEnviar);
    
    if (response.success) {
      exito.value = true;
      limpiarFormulario();
      
      setTimeout(() => {
        exito.value = false;
        emit('volver-inicio');
      }, 2000);
    }
  } catch (err) {
    console.error('Error al enviar solicitud:', err);
    error.value = 'Error al enviar la solicitud. Por favor intenta nuevamente.';
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
  max-width: 900px;
  margin: 0 auto;
}

.form-section {
  background: white;
  padding: 25px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-section h2 {
  font-size: 18px;
  color: #333;
  margin: 0 0 20px 0;
  font-weight: 600;
  border-bottom: 2px solid #5a5aff;
  padding-bottom: 10px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
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
  margin-bottom: 5px;
  font-size: 13px;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
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
  min-height: 80px;
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
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
  margin-top: 10px;
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
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-primary,
.btn-secondary {
  padding: 12px 40px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  min-width: 160px;
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
</style>
