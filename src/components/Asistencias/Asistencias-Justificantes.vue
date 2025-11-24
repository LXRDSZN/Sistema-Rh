<template>
  <div class="justificaciones-content">
    <div class="content-inner">
      <h2 class="page-title">Gestión de Justificaciones</h2>
      
      <!-- Formulario: Nueva Justificación -->
      <v-card class="card-formulario" elevation="0">
        <h2 class="card-titulo">Registrar Nueva Justificación</h2>

        <v-card-text class="card-text-custom">
          <v-row class="mb-0">
            <v-col cols="12" sm="6" md="3">
              <div class="form-header">Empleado*</div>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <div class="form-header">Área*</div>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <div class="form-header">Fecha de Inicio*</div>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <div class="form-header">Fecha de Fin*</div>
            </v-col>
          </v-row>

          <v-row class="mt-0 mb-4 row-no-padding">
            <v-col cols="12" sm="6" md="3">
              <v-autocomplete
                v-model="formulario.empleado_id"
                :items="empleadosFiltrados"
                item-title="nombre_completo"
                item-value="id"
                :search-input.sync="busquedaEmpleado"
                placeholder="Buscar empleado..."
                class="input-white"
                variant="outlined"
                density="compact"
                hide-details
                clearable
                @update:model-value="actualizarAreaPorEmpleado"
                @update:search-input="filtrarEmpleados"
              >
                <template v-slot:append-inner>
                  <v-icon size="20" color="#9ca3af">mdi-magnify</v-icon>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-text-field
                v-model="areaEmpleadoSeleccionado"
                class="input-white"
                variant="outlined"
                density="compact"
                hide-details
                readonly
                placeholder="Seleccione un empleado"
              />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-text-field
                v-model="formulario.fecha_inicio"
                type="date"
                placeholder="dd/mm/aaaa"
                class="input-white"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-text-field
                v-model="formulario.fecha_fin"
                type="date"
                placeholder="dd/mm/aaaa"
                class="input-white"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>
          </v-row>

          <div class="mb-6">
            <label class="form-label">Motivo/Descripción*</label>
            <v-textarea
              v-model="formulario.motivo"
              placeholder="Describa el motivo de la incidencia..."
              class="input-white"
              rows="4"
              variant="outlined"
              hide-details
              counter="500"
              :rules="[v => !v || v.length <= 500 || 'Máximo 500 caracteres']"
            />
          </div>
          <div class="mb-6">
            <label class="form-label label-spacing">Cargar Justificante (Opcional)</label>
            <div class="archivo-selector">
              <v-btn
                color="#6C6C85"
                class="btn-archivo"
                @click="abrirSelectorArchivo"
              >
                Seleccionar Archivo
              </v-btn>
              <span class="archivo-nombre">{{ nombreArchivo }}</span>
              <input 
                type="file" 
                ref="fileInput" 
                @change="manejarArchivoSeleccionado" 
                class="file-input-hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </div>
            <!-- Vista previa del archivo -->
            <div v-if="archivoPrevisualizacion" class="archivo-preview">
              <div class="archivo-info">
                <span class="archivo-texto">{{ nombreArchivo }}</span>
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  @click="verArchivo"
                  color="#5E47FF"
                  class="ml-2"
                >
                  <v-icon size="20">mdi-eye</v-icon>
                </v-btn>
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  @click="quitarArchivo"
                  color="#ef4444"
                  class="action-btn"
                >
                  <v-icon size="20">mdi-close</v-icon>
                </v-btn>
              </div>
            </div>
          </div>

          <!-- Botones -->
          <div class="form-botones">
            <v-btn
              color="#5E47FF"
              class="btn-action"
              @click="guardarJustificacion"
              :loading="guardando"
            >
              <v-icon left size="18">mdi-content-save</v-icon>
              Guardar Justificación
            </v-btn>
            <v-btn
              color="#5E47FF"
              class="btn-action"
              @click="limpiarFormulario"
            >
              <v-icon left size="18">mdi-broom</v-icon>
              Limpiar Formulario
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <v-card class="card-registro" elevation="0">
        <h2 class="card-titulo">Registro de Justificaciones</h2>

        <v-card-text>
          <!-- Filtros para la tabla de registro -->
          <div class="filtros-registro">
            <v-select
              v-model="registro.mes"
              :items="monthsItems"
              placeholder="Seleccionar mes"
              class="filter-select-registro input-white"
              variant="outlined"
              density="compact"
              hide-details
            />

            <v-select
              v-model="registro.area_id"
              :items="areasRegistroItems"
              item-title="title"
              item-value="value"
              placeholder="Todas las áreas"
              class="filter-select-registro input-white"
              variant="outlined"
              density="compact"
              hide-details
              :menu-props="{ 
                location: 'bottom',
                offsetY: true,
                maxHeight: 170
              }"
            />

            <v-text-field
              v-model="registro.busqueda"
              placeholder="Buscar Empleado"
              class="search-input-registro input-white"
              variant="outlined"
              density="compact"
              hide-details
              @input="validarBusquedaRegistro"
              :class="{ 'input-error': busquedaRegistroError }"
            >
              <template v-slot:append-inner>
                <v-icon size="20" color="#9ca3af">mdi-magnify</v-icon>
              </template>
            </v-text-field>

            <v-btn
              color="#5E47FF"
              class="filter-btn"
              @click="aplicarFiltrosRegistro"
            >
              Aplicar Filtro
            </v-btn>
          </div>

          <v-table class="tabla-registro">
            <thead>
              <tr>
                <th class="text-center">Empleado</th>
                <th class="text-center">Área</th>
                <th class="text-center">Fecha</th>
                <th class="text-center">Motivo</th>
                <th class="text-center">Archivo</th>
                <th class="text-center tabla-acciones-header"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="text-center py-4">
                  <v-progress-circular indeterminate color="#5E47FF"></v-progress-circular>
                  <p class="mt-2">Cargando registros...</p>
                </td>
              </tr>
              <tr v-else-if="registroJustificacionesFiltradas.length === 0">
                <td colspan="6" class="text-center py-4 text-grey">
                  No hay justificaciones registradas
                </td>
              </tr>
              <tr v-for="(item, index) in registroJustificacionesFiltradas" :key="item.id || index" v-else>
                <td class="text-center">{{ item.empleado || 'N/A' }}</td>
                <td class="text-center">{{ item.area || 'N/A' }}</td>
                <td class="text-center">{{ formatearFecha(item.fecha_creacion) }}</td>
                <td class="text-center">{{ item.motivo }}</td>
                <td class="text-center">
                  <div class="archivo-tabla" v-if="item.archivo_justificante">
                    <span class="archivo-texto-tabla">{{ obtenerNombreArchivoTabla(item) }}</span>
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      @click="verArchivoRegistro(item)"
                      color="#5E47FF"
                      class="ml-1"
                    >
                      <v-icon size="18">mdi-eye</v-icon>
                    </v-btn>
                  </div>
                  <span v-else class="text-grey">Sin archivo</span>
                </td>
                <td class="text-center">
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    @click="verDetalle(item)"
                    color="#5E47FF"
                  >
                    <v-icon size="20">mdi-plus-circle</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </div>

    <!-- Dialog para ver detalles -->
    <v-dialog v-model="dialogDetalle" max-width="600px">
      <v-card>
        <v-card-title class="dialog-title">
          Detalle de Justificación
        </v-card-title>
        <v-card-text>
          <div v-if="justificacionSeleccionada" class="detalle-content">
            <div class="detalle-item">
              <strong>Empleado:</strong> {{ justificacionSeleccionada.empleado || 'N/A' }}
            </div>
            <div class="detalle-item">
              <strong>Área:</strong> {{ justificacionSeleccionada.area || 'N/A' }}
            </div>
            <div class="detalle-item">
              <strong>Fecha de Inicio:</strong> {{ formatearFecha(justificacionSeleccionada.fecha_inicio) }}
            </div>
            <div class="detalle-item">
              <strong>Fecha de Fin:</strong> {{ formatearFecha(justificacionSeleccionada.fecha_fin) }}
            </div>
            <div class="detalle-item">
              <strong>Motivo:</strong> {{ justificacionSeleccionada.motivo }}
            </div>
            <div class="detalle-item" v-if="justificacionSeleccionada.archivo_justificante">
              <strong>Archivo:</strong> 
              <div class="archivo-detalle">
                <span class="archivo-texto-detalle">{{ obtenerNombreArchivoTabla(justificacionSeleccionada) }}</span>
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  @click="verArchivoRegistro(justificacionSeleccionada)"
                  color="#5E47FF"
                  class="ml-1"
                >
                  <v-icon size="18">mdi-eye</v-icon>
                </v-btn>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="#5E47FF" @click="dialogDetalle = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="5000"
      location="bottom center"
      min-width="auto"
      class="custom-snackbar"
    >
      <div class="snackbar-content">
        {{ snackbar.text }}
      </div>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAsistencias } from '@/composables/useAsistencias'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Composable de asistencias
const {
  justificantes,
  tiposIncidencia,
  loading,
  cargarJustificantes,
  cargarTiposIncidencia,
  crearJustificante
} = useAsistencias()

// Estados para BD
const ESTADOS_JUSTIFICACION = {
  PENDIENTE: 'pendiente',
  APROBADO: 'aprobado',
  RECHAZADO: 'rechazado'
}

// Datos de empleados y áreas desde la BD
const empleados = ref([])
const areas = ref([])

// Búsqueda de empleado en el formulario
const busquedaEmpleado = ref('')

// Mapa idArchivo -> nombreArchivo
const archivoNombres = ref({})

// Snackbar
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Estados de UI
const dialogDetalle = ref(false)
const justificacionSeleccionada = ref(null)
const guardando = ref(false)
const busquedaRegistroError = ref(false)

// Archivo
const fileInput = ref(null)
const nombreArchivo = ref('Ningún archivo seleccionado')
const archivoPrevisualizacion = ref(null)

// Área del empleado seleccionado
const areaEmpleadoSeleccionado = ref('')

// Año actual para los meses
const currentDate = new Date()
const selectedYear = ref(currentDate.getFullYear())

// Datos del formulario
const formulario = ref({
  empleado_id: null,
  area_id: null,
  fecha_inicio: '',
  fecha_fin: '',
  motivo: ''
})

// Filtros para registro
const registro = ref({
  mes: currentDate.getMonth() + 1,
  area_id: null,
  busqueda: ''
})

// Cargar datos iniciales
onMounted(async () => {
  try {
    await cargarDatosIniciales()
    await cargarTiposIncidencia()
    console.log('Tipos de incidencia cargados:', tiposIncidencia.value)
    await cargarJustificantes()
    await cargarNombresArchivos()
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error)
  }
})

// Función para cargar empleados y áreas
const cargarDatosIniciales = async () => {
  try {
    // Cargar empleados
    const responseEmpleados = await axios.get(`${API_URL}/empleados`, { 
      withCredentials: true 
    })
    
    const empleadosData = responseEmpleados.data.data || responseEmpleados.data.empleados || []
    empleados.value = empleadosData.map(emp => {
      if (emp.nombre && !emp.apellido_paterno) {
        const partes = emp.nombre.split(' ')
        return {
          id: emp.id,
          nombre: partes[0] || '',
          apellido_paterno: partes[1] || '',
          apellido_materno: partes[2] || '',
          nombre_completo: emp.nombre,
          area_id: emp.area_id,
          area_nombre: emp.area_nombre || 'Sin área'
        }
      }
      return {
        ...emp,
        nombre_completo: `${emp.nombre} ${emp.apellido_paterno} ${emp.apellido_materno || ''}`.trim(),
        area_nombre: emp.area_nombre || 'Sin área'
      }
    })

    // Cargar áreas
    const responseAreas = await axios.get(`${API_URL}/areas`, { 
      withCredentials: true 
    })
    const areasData = responseAreas.data.data || responseAreas.data || []
    areas.value = areasData
    
    // Crear mapa de áreas para búsqueda rápida
    areasMap.value = areasData.reduce((map, area) => {
      map[area.id] = area.nombre
      return map
    }, {})

  } catch (error) {
    console.error('Error al cargar datos iniciales:', error)
    mostrarMensaje('Error al cargar empleados y áreas', 'error')
  }
}

// Mapa de áreas para búsqueda rápida
const areasMap = ref({})

// Computed para empleados filtrados por búsqueda
const empleadosFiltrados = computed(() => {
  if (!busquedaEmpleado.value) {
    return empleados.value
  }
  
  const busqueda = busquedaEmpleado.value.toLowerCase().trim()
  return empleados.value.filter(empleado => 
    empleado.nombre_completo.toLowerCase().includes(busqueda) ||
    empleado.nombre.toLowerCase().includes(busqueda) ||
    empleado.apellido_paterno.toLowerCase().includes(busqueda) ||
    (empleado.apellido_materno && empleado.apellido_materno.toLowerCase().includes(busqueda))
  )
})

// Función para filtrar empleados (se ejecuta cuando se escribe)
const filtrarEmpleados = (valor) => {
  busquedaEmpleado.value = valor
}

// Función para actualizar el área cuando se selecciona un empleado
const actualizarAreaPorEmpleado = (empleadoId) => {
  if (!empleadoId) {
    areaEmpleadoSeleccionado.value = ''
    formulario.value.area_id = null
    return
  }

  const empleadoSeleccionado = empleados.value.find(emp => emp.id === empleadoId)
  if (empleadoSeleccionado) {
    // Si el empleado ya tiene el nombre del área en sus datos
    if (empleadoSeleccionado.area_nombre) {
      areaEmpleadoSeleccionado.value = empleadoSeleccionado.area_nombre
      formulario.value.area_id = empleadoSeleccionado.area_id
    } 
    // Si no, buscar el nombre del área en el mapa
    else if (empleadoSeleccionado.area_id && areasMap.value[empleadoSeleccionado.area_id]) {
      areaEmpleadoSeleccionado.value = areasMap.value[empleadoSeleccionado.area_id]
      formulario.value.area_id = empleadoSeleccionado.area_id
    } 
    // Si no se encuentra el área
    else {
      areaEmpleadoSeleccionado.value = 'Sin área asignada'
      formulario.value.area_id = null
    }
  } else {
    areaEmpleadoSeleccionado.value = ''
    formulario.value.area_id = null
  }
}

// Items para selector de meses
const monthsItems = computed(() => {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return meses.map((mes, index) => ({
    title: `${mes} ${selectedYear.value}`,
    value: index + 1
  }))
})

const areasRegistroItems = computed(() => [
  { title: 'Todas las áreas', value: null },
  ...areas.value.map(area => ({ title: area.nombre, value: area.nombre }))
])

const registroJustificacionesFiltradas = computed(() => {
  let resultado = [...(justificantes.value || [])]
  
  // Filtro por mes
  if (registro.value.mes) {
    resultado = resultado.filter(item => {
      if (!item.fecha_inicio) return false
      const fechaItem = new Date(item.fecha_inicio)
      return fechaItem.getMonth() + 1 === registro.value.mes && 
             fechaItem.getFullYear() === selectedYear.value
    })
  }
  
  // Filtro por búsqueda de empleado
  if (registro.value.busqueda) {
    const busqueda = registro.value.busqueda.toLowerCase().trim()
    resultado = resultado.filter(item => {
      return item.empleado && item.empleado.toLowerCase().includes(busqueda)
    })
  }
  
  // Filtro por área
  if (registro.value.area_id) {
    resultado = resultado.filter(item => 
      item.area && item.area.toLowerCase() === registro.value.area_id.toLowerCase()
    )
  }
  
  return resultado
})

// Cargar nombres de archivos
const cargarNombresArchivos = async () => {
  try {
    const items = justificantes.value || []
    const ids = [...new Set(items.map(i => i.archivo_justificante).filter(Boolean))]

    for (const id of ids) {
      if (!archivoNombres.value[id]) {
        const resp = await axios.get(`${API_URL}/archivo/${id}`, {
          withCredentials: true
        })
        const info = resp.data.archivo || resp.data.data || resp.data
        archivoNombres.value[id] = info.nombre || info.filename || id
      }
    }
  } catch (error) {
    console.error('Error al cargar nombres de archivos:', error)
  }
}

// Función para que la tabla muestre el nombre del archivo
const obtenerNombreArchivoTabla = (item) => {
  const id = item.archivo_justificante || item.archivo_id
  if (!id) return ''
  return archivoNombres.value[id] || id
}

// Funciones de utilidad
const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleDateString('es-ES')
}

// Validación de búsqueda 
const validarBusquedaRegistro = () => {
  const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
  if (registro.value.busqueda && !soloLetrasRegex.test(registro.value.busqueda)) {
    busquedaRegistroError.value = true
    registro.value.busqueda = registro.value.busqueda.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
  } else {
    busquedaRegistroError.value = false
  }
}

// Funciones principales
const mostrarMensaje = (texto, color = 'success') => {
  snackbar.value = {
    show: true,
    text: texto,
    color: color
  }
}

const quitarArchivo = () => {
  limpiarArchivo()
  mostrarMensaje('Archivo removido correctamente')
}

const aplicarFiltrosRegistro = async () => {
  try {
    await cargarJustificantes()
    mostrarMensaje('Filtros de registro aplicados')
  } catch (error) {
    console.error('Error al aplicar filtros:', error)
  }
}

const abrirSelectorArchivo = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const manejarArchivoSeleccionado = (event) => {
  try {
    const archivo = event.target.files?.[0]
    if (archivo) {
      nombreArchivo.value = archivo.name
      archivoPrevisualizacion.value = archivo
      
      // Validar tipo de archivo
      const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 
                              'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!tiposPermitidos.includes(archivo.type)) {
        mostrarMensaje('Tipo de archivo no permitido', 'error')
        limpiarArchivo()
        return
      }
      
      // Validar tamaño (max 5MB)
      if (archivo.size > 5 * 1024 * 1024) {
        mostrarMensaje('El archivo no debe superar los 5MB', 'error')
        limpiarArchivo()
        return
      }
      
      mostrarMensaje('Archivo seleccionado correctamente')
    }
  } catch (error) {
    mostrarMensaje('Error al seleccionar archivo', 'error')
  }
}

const limpiarArchivo = () => {
  nombreArchivo.value = 'Ningún archivo seleccionado'
  archivoPrevisualizacion.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const guardarJustificacion = async () => {
  try {
    // Validaciones
    if (!formulario.value.empleado_id || !formulario.value.area_id || 
        !formulario.value.fecha_inicio || !formulario.value.motivo) {
      mostrarMensaje('Por favor complete todos los campos obligatorios', 'warning')
      return
    }

    if (formulario.value.fecha_fin && formulario.value.fecha_fin < formulario.value.fecha_inicio) {
      mostrarMensaje('La fecha de fin no puede ser anterior a la fecha de inicio', 'error')
      return
    }

    guardando.value = true

    let archivoId = null

    if (archivoPrevisualizacion.value) {
      const formData = new FormData()
      formData.append('archivo', archivoPrevisualizacion.value)

      const respUpload = await axios.post(`${API_URL}/upload`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      console.log('Respuesta de /upload:', respUpload.data)

      const archivoResp = respUpload.data.archivo || respUpload.data.data || respUpload.data
      archivoId = archivoResp.id
    }

    const datosJustificante = {
      empleado_id: formulario.value.empleado_id,
      area_id: formulario.value.area_id,
      fecha_inicio: formulario.value.fecha_inicio,
      fecha_fin: formulario.value.fecha_fin || formulario.value.fecha_inicio,
      motivo: formulario.value.motivo,
      archivo_justificante: archivoId
    }

    await crearJustificante(datosJustificante)

    mostrarMensaje('Justificación guardada correctamente')
    limpiarFormulario()
    await cargarJustificantes()
    await cargarNombresArchivos()
    
  } catch (error) {
    console.error('Error al guardar justificante:', error)
    mostrarMensaje('Error al guardar la justificación', 'error')
  } finally {
    guardando.value = false
  }
}

const limpiarFormulario = () => {
  formulario.value = {
    empleado_id: null,
    area_id: null,
    fecha_inicio: '',
    fecha_fin: '',
    motivo: ''
  }
  busquedaEmpleado.value = ''
  areaEmpleadoSeleccionado.value = ''
  limpiarArchivo()
}

const verDetalle = (item) => {
  justificacionSeleccionada.value = item
  dialogDetalle.value = true
}

const verArchivo = () => {
  if (archivoPrevisualizacion.value) {
    const url = URL.createObjectURL(archivoPrevisualizacion.value)
    window.open(url, '_blank')
  }
}

const verArchivoRegistro = async (item) => {
  const archivoId = item.archivo_justificante || item.archivo_id

  if (!archivoId) {
    mostrarMensaje('Este registro no tiene archivo para visualizar', 'warning')
    return
  }

  try {
    const resp = await axios.get(`${API_URL}/archivo/${archivoId}`, {
      withCredentials: true
    })

    console.log('Info archivo:', resp.data)

    const info = resp.data.archivo || resp.data.data || resp.data
    let url = info.storage_url || info.url || info.location

    if (!url) {
      mostrarMensaje('No se encontró la URL del archivo', 'error')
      return
    }

    if (!url.startsWith('http')) {
      url = `${API_URL.replace('/api', '')}${url}`
    }

    window.open(url, '_blank')
  } catch (error) {
    console.error('Error al obtener archivo:', error)
    mostrarMensaje('No se pudo abrir el archivo', 'error')
  }
}

// Cuando cambien los justificantes, volver a buscar nombres de archivos nuevos
watch(justificantes, () => {
  cargarNombresArchivos()
})
</script>

<style scoped>
.input-error :deep(.v-field) {
  border-color: #ef4444 !important;
}

.custom-snackbar {
  border-radius: 8px;
  bottom: 20px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  min-width: 300px !important;
  justify-content: center !important;
}

.snackbar-content {
  text-align: center;
  padding: 8px 16px;
}

/* Estilos para archivos */
.archivo-info {
  display: flex;
  align-items: center;
  margin-top: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.archivo-texto {
  flex: 1;
  font-size: 0.875rem;
  color: #374151;
}

.archivo-tabla {
  display: flex;
  align-items: center;
  justify-content: center;
}

.archivo-texto-tabla {
  font-size: 0.875rem;
  color: #374151;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.archivo-detalle {
  display: flex;
  align-items: center;
}

.archivo-texto-detalle {
  font-size: 0.875rem;
  color: #374151;
}

/* Estilos para el detalle */
.detalle-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detalle-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.detalle-item strong {
  min-width: 140px;
  color: #544F65;
}

.dialog-title {
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  color: #544F65;
}

.justificaciones-content {
  flex: 1;
  padding: 0rem !important;
  display: flex;
  align-items: flex-start;
  width: 100%;
  box-sizing: border-box;
  background-color: #E4E4E7;
  margin-left: auto;
}

.content-inner {
  width: 100%;
  max-width: 100%;
  background-color: #E4E4E7;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0rem 2rem 1rem;
  padding: 0.2rem;
}

/* Inputs con fondo blanco */
.input-white :deep(.v-field) {
  background-color: #FAFAFA;
}

/* Campo de área readonly */
.input-white :deep(.v-field--readonly) {
  background-color: #f3f4f6 !important;
  border-color: #d1d5db !important;
}

/* Autocomplete personalizado */
.input-white :deep(.v-autocomplete .v-field) {
  background-color: #FAFAFA;
}

.input-white :deep(.v-autocomplete .v-field__input) {
  padding-right: 40px;
}

/* Cards */
.card-formulario,
.card-registro {
  padding: 0.2rem;
  background-color: #FAFAFA;
  box-sizing: border-box;
  border-radius: 12px;
  margin-bottom: 1.7rem;
}

.card-titulo {
  font-size: 1.125rem;
  font-weight: 600;
  color: #544F65;
  padding: 1rem 1.5rem 0.4rem;
  margin: 0.5rem 0 0.5rem;
  background-color: #FAFAFA;
}

.card-text-custom {
  padding-bottom: 0;
}

/* Formulario */
.form-header {
  background-color: #544F65;
  color: white;
  padding: 0.75rem;
  border-radius: 0.375rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
  font-size: 0.875rem;
}

.label-spacing {
  padding-bottom: 8px;
}

.row-no-padding {
  padding: 0;
}

.archivo-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.btn-archivo {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0;
}

.archivo-nombre {
  color: #9ca3af;
  font-size: 0.875rem;
}

.file-input-hidden {
  display: none;
}

.form-botones {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-action {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0;
  margin-bottom: 20px;
}

.btn-action :deep(.v-icon) {
  margin-right: 0.5rem;
}

/* Filtros de registro */
.filtros-registro {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
  width: 1100px;
  flex-wrap: nowrap;
  justify-content: flex-start;
}

.filter-select-registro {
  width: 200px;
}

.search-input-registro {
  width: 350px;
}

.filter-btn {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0;
}

/* Tablas con filas alternadas */
.tabla-registro {
  border: 1px solid #e5e7eb;
  background-color: #FAFAFA;
}

.tabla-registro :deep(thead) {
  background-color: #221A68;
}

.tabla-registro :deep(thead th) {
  color: #ffffff !important;
  font-weight: 600 !important;
  font-size: 0.875rem;
  padding: 0.75rem;
}

.tabla-acciones-header {
  width: 80px;
}

/* Filas alternadas para tabla de registro */
.tabla-registro :deep(tbody tr:nth-child(odd)) {
  background-color: #ffffff;
}

.tabla-registro :deep(tbody tr:nth-child(even)) {
  background-color: #f8fafc;
}

.tabla-registro :deep(tbody td) {
  padding: 0.75rem;
  font-size: 0.875rem;
  border-bottom: 1px solid #e5e7eb;
}

/* Responsive */
@media (min-width: 1024px) {
  .justificaciones-content {
    padding: 3rem;
  }
}

@media (max-width: 768px) {
  .justificaciones-content {
    padding: 1rem;
  }

  .filtros-registro {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select-registro,
  .search-input-registro {
    width: 100%;
  }

  .form-botones {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }
}
</style>