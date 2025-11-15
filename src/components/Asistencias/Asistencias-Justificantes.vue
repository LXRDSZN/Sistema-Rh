<template>
  <div class="justificaciones-content">
    <div class="content-inner">
      <h2 class="page-title">Gestión de Justificaciones</h2>
      
      <!-- Filtros superiores -->
      <div class="filtros-superiores">
        <v-select
          v-model="filtroEstado"
          :items="estadosItems"
          placeholder="Todos los estados"
          class="filter-select input-white"
          variant="outlined"
          density="compact"
          hide-details
        />

        <v-select
          v-model="filtroArea"
          :items="areasItems"
          placeholder="Todas las áreas"
          class="filter-select input-white"
          variant="outlined"
          density="compact"
          hide-details
        />

        <v-btn
          color="#5E47FF"
          class="filter-btn"
          @click="aplicarFiltrosSuperior"
        >
          Aplicar Filtro
        </v-btn>
      </div>

      <!-- Formulario: Nueva Justificación -->
      <v-card class="card-formulario" elevation="0">
        <h2 class="card-titulo">Registrar Nueva Justificación</h2>

        <v-card-text class="card-text-custom">
          <v-row class="mb-0">
            <v-col cols="12" sm="6" md="3">
              <div class="form-header">Empleado*</div>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <div class="form-header">Tipo de Incidencia*</div>
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
              <v-select
                v-model="formulario.empleado_id"
                :items="empleadosConPlaceholder"
                item-title="nombre_completo"
                item-value="id"
                class="input-white"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="formulario.tipo_incidencia_id"
                :items="tiposIncidenciaConPlaceholder"
                item-title="nombre"
                item-value="id"
                class="input-white"
                variant="outlined"
                density="compact"
                hide-details
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

      <v-card class="card-monitoreo" elevation="0">
        <h2 class="card-titulo">Monitoreo de Justificaciones</h2>

        <v-card-text>
          <div class="filtros-monitoreo">
            <v-select
              v-model="monitoreo.periodo"
              :items="periodosItems"
              placeholder="Mes pasado"
              class="filter-select-monitor input-white"
              variant="outlined"
              density="compact"
              hide-details
            />

            <!-- 👇 AQUÍ ESTÁ EL COMBOBOX CORREGIDO -->
            <v-select
              v-model="monitoreo.area_id"
              :items="areasMonitoreoItems"
              item-title="title"
              item-value="value"
              placeholder="Todas las áreas"
              class="filter-select-monitor input-white"
              variant="outlined"
              density="compact"
              hide-details
            />

            <v-text-field
              v-model="monitoreo.busqueda"
              placeholder="Buscar Empleado"
              class="search-input-monitor input-white"
              variant="outlined"
              density="compact"
              hide-details
              @input="validarBusqueda"
              :class="{ 'input-error': busquedaError }"
            >
              <template v-slot:append-inner>
                <v-icon size="20" color="#9ca3af">mdi-magnify</v-icon>
              </template>
            </v-text-field>

            <v-btn
              color="#5E47FF"
              class="filter-btn"
              @click="aplicarFiltrosMonitoreo"
            >
              Aplicar Filtro
            </v-btn>
          </div>
          <v-table class="tabla-monitoreo">
            <thead>
              <tr>
                <th class="text-center">Empleado</th>
                <th class="text-center">Tipo de Incidencia</th>
                <th class="text-center">Fecha</th>
                <th class="text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in justificacionesFiltradas" :key="item.id || index">
                <td class="text-center">{{ obtenerNombreEmpleado(item.empleado_id) }}</td>
                <td class="text-center">{{ obtenerNombreTipoIncidencia(item.tipo_incidencia_id) }}</td>
                <td class="text-center">{{ formatearFecha(item.fecha_inicio) }}</td>
                <td class="text-center">
                  <span :class="obtenerClaseEstado(item.estado)">
                    {{ obtenerTextoEstado(item.estado) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>

      <v-card class="card-registro" elevation="0">
        <h2 class="card-titulo">Registro de Justificaciones</h2>

        <v-card-text>
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
              <tr v-for="(item, index) in registroJustificaciones" :key="item.id || index">
                <td class="text-center">{{ obtenerNombreEmpleado(item.empleado_id) }}</td>
                <td class="text-center">{{ obtenerNombreArea(item.area_id) }}</td>
                <td class="text-center">{{ formatearFecha(item.fecha_creacion) }}</td>
                <td class="text-center">{{ item.motivo }}</td>
                <td class="text-center">
                  <div class="archivo-tabla" v-if="item.archivo_nombre">
                    <span class="archivo-texto-tabla">{{ item.archivo_nombre }}</span>
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
              <strong>Empleado:</strong> {{ obtenerNombreEmpleado(justificacionSeleccionada.empleado_id) }}
            </div>
            <div class="detalle-item">
              <strong>Área:</strong> {{ obtenerNombreArea(justificacionSeleccionada.area_id) }}
            </div>
            <div class="detalle-item">
              <strong>Fecha de Inicio:</strong> {{ formatearFecha(justificacionSeleccionada.fecha_inicio) }}
            </div>
            <div class="detalle-item">
              <strong>Fecha de Fin:</strong> {{ formatearFecha(justificacionSeleccionada.fecha_fin) }}
            </div>
            <div class="detalle-item">
              <strong>Tipo de Incidencia:</strong> {{ obtenerNombreTipoIncidencia(justificacionSeleccionada.tipo_incidencia_id) }}
            </div>
            <div class="detalle-item">
              <strong>Motivo:</strong> {{ justificacionSeleccionada.motivo }}
            </div>
            <div class="detalle-item" v-if="justificacionSeleccionada.archivo_nombre">
              <strong>Archivo:</strong> 
              <div class="archivo-detalle">
                <span class="archivo-texto-detalle">{{ justificacionSeleccionada.archivo_nombre }}</span>
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
import { ref, computed } from 'vue'

// Estados para BD
const ESTADOS_JUSTIFICACION = {
  PENDIENTE: 'pendiente',
  APROBADO: 'aprobado',
  RECHAZADO: 'rechazado'
}

// Datos simulando estructura de BD
const empleados = ref([
  { id: 1, nombre_completo: 'Juan Pérez', area_id: 1, activo: true },
  { id: 2, nombre_completo: 'Mariana Botas', area_id: 2, activo: true },
  { id: 3, nombre_completo: 'Juan Hidalgo', area_id: 1, activo: true },
  { id: 4, nombre_completo: 'Marcela Valencia', area_id: 3, activo: true }
])

const areas = ref([
  { id: 1, nombre: 'RRHH', activo: true },
  { id: 2, nombre: 'Ventas', activo: true },
  { id: 3, nombre: 'Operaciones', activo: true }
])

const tiposIncidencia = ref([
  { id: 1, nombre: 'Tráfico', requiere_archivo: false },
  { id: 2, nombre: 'Enfermedad', requiere_archivo: true },
  { id: 3, nombre: 'Asuntos Familiares', requiere_archivo: false },
  { id: 4, nombre: 'Cita Médica', requiere_archivo: true }
])

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
const busquedaError = ref(false)

// Archivo
const fileInput = ref(null)
const nombreArchivo = ref('Ningún archivo seleccionado')
const archivoPrevisualizacion = ref(null)

// Datos del formulario
const formulario = ref({
  empleado_id: null,
  tipo_incidencia_id: null,
  fecha_inicio: '',
  fecha_fin: '',
  motivo: ''
})

// Filtros
const filtroEstado = ref('todos')
const filtroArea = ref('todas')
const monitoreo = ref({
  periodo: 'mes-pasado',
  area_id: null,
  busqueda: ''
})

// Datos de ejemplo
const justificaciones = ref([
  { 
    id: 1, 
    empleado_id: 1, 
    tipo_incidencia_id: 1, 
    area_id: 1,
    fecha_inicio: '2025-02-14', 
    fecha_fin: '2025-02-14',
    fecha_creacion: '2025-02-14T10:30:00',
    motivo: 'Tráfico pesado en Periférico', 
    estado: ESTADOS_JUSTIFICACION.APROBADO,
    archivo_nombre: null
  },
  { 
    id: 2, 
    empleado_id: 2, 
    tipo_incidencia_id: 2, 
    area_id: 2,
    fecha_inicio: '2025-08-20', 
    fecha_fin: '2025-08-21',
    fecha_creacion: '2025-08-19T15:45:00',
    motivo: 'Gripe con fiebre', 
    estado: ESTADOS_JUSTIFICACION.PENDIENTE,
    archivo_nombre: 'justificante_medico.pdf'
  }
])

const estadosItems = [
  { title: 'Todos los estados', value: 'todos' },
  { title: 'Pendiente', value: ESTADOS_JUSTIFICACION.PENDIENTE },
  { title: 'Aprobado', value: ESTADOS_JUSTIFICACION.APROBADO },
  { title: 'Rechazado', value: ESTADOS_JUSTIFICACION.RECHAZADO }
]

const areasItems = [
  { title: 'Todas las áreas', value: 'todas' },
  ...areas.value.map(area => ({ title: area.nombre, value: area.id }))
]

const periodosItems = [
  { title: 'Mes pasado', value: 'mes-pasado' },
  { title: 'Este mes', value: 'este-mes' },
  { title: 'Último trimestre', value: 'trimestre' }
]

const areasMonitoreoItems = [
  { title: 'Todas las áreas', value: null },
  ...areas.value.map(area => ({ title: area.nombre, value: area.id }))
]

// Computed
const empleadosConPlaceholder = computed(() => {  
  return [
    { id: null, nombre_completo: 'Seleccionar Empleado', disabled: true }, 
    ...empleados.value.filter(emp => emp.activo)
  ]
})

const tiposIncidenciaConPlaceholder = computed(() => {
  return [
    { id: null, nombre: 'Seleccionar Tipo', disabled: true }, 
    ...tiposIncidencia.value
  ]
})

const justificacionesFiltradas = computed(() => {
  let resultado = [...justificaciones.value]
  
  // Filtro por búsqueda de empleado
  if (monitoreo.value.busqueda) {
    const busqueda = monitoreo.value.busqueda.toLowerCase().trim()
    resultado = resultado.filter(item => {
      const empleado = empleados.value.find(emp => emp.id === item.empleado_id)
      return empleado && empleado.nombre_completo.toLowerCase().includes(busqueda)
    })
  }
  
  // Filtro por área (select de monitoreo)
  if (monitoreo.value.area_id) {
    resultado = resultado.filter(item => item.area_id === monitoreo.value.area_id)
  }

  // Filtro por estado (combobox superior)
  if (filtroEstado.value !== 'todos') {
    resultado = resultado.filter(item => item.estado === filtroEstado.value)
  }

  // Filtro por área (combobox superior)
  if (filtroArea.value !== 'todas') {
    resultado = resultado.filter(item => item.area_id === filtroArea.value)
  }
  
  return resultado
})

const registroJustificaciones = computed(() => {
  let resultado = [...justificaciones.value]

  // Filtro por estado (combobox superior)
  if (filtroEstado.value !== 'todos') {
    resultado = resultado.filter(item => item.estado === filtroEstado.value)
  }

  // Filtro por área (combobox superior)
  if (filtroArea.value !== 'todas') {
    resultado = resultado.filter(item => item.area_id === filtroArea.value)
  }

  return resultado
})

// Funciones de utilidad
const obtenerNombreEmpleado = (empleadoId) => {
  const empleado = empleados.value.find(emp => emp.id === empleadoId)
  return empleado ? empleado.nombre_completo : 'N/A'
}

const obtenerNombreArea = (areaId) => {
  const area = areas.value.find(a => a.id === areaId)
  return area ? area.nombre : 'N/A'
}

const obtenerNombreTipoIncidencia = (tipoId) => {
  const tipo = tiposIncidencia.value.find(t => t.id === tipoId)
  return tipo ? tipo.nombre : 'N/A'
}

const obtenerClaseEstado = (estado) => {
  const clases = {
    [ESTADOS_JUSTIFICACION.PENDIENTE]: 'estado-pendiente',
    [ESTADOS_JUSTIFICACION.APROBADO]: 'estado-aprobado',
    [ESTADOS_JUSTIFICACION.RECHAZADO]: 'estado-rechazado'
  }
  return clases[estado] || 'estado-pendiente'
}

const obtenerTextoEstado = (estado) => {
  const textos = {
    [ESTADOS_JUSTIFICACION.PENDIENTE]: 'Pendiente',
    [ESTADOS_JUSTIFICACION.APROBADO]: 'Aprobado',
    [ESTADOS_JUSTIFICACION.RECHAZADO]: 'Rechazado'
  }
  return textos[estado] || 'Pendiente'
}

const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleDateString('es-ES')
}

// Validación de búsqueda 
const validarBusqueda = () => {
  const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
  if (monitoreo.value.busqueda && !soloLetrasRegex.test(monitoreo.value.busqueda)) {
    busquedaError.value = true
    // Remover caracteres no válidos
    monitoreo.value.busqueda = monitoreo.value.busqueda.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
  } else {
    busquedaError.value = false
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

const aplicarFiltrosSuperior = () => {
  mostrarMensaje('Filtros aplicados correctamente')
}

const aplicarFiltrosMonitoreo = () => {
  mostrarMensaje('Filtros de monitoreo aplicados')
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
      
      const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 
                              'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!tiposPermitidos.includes(archivo.type)) {
        mostrarMensaje('Tipo de archivo no permitido', 'error')
        limpiarArchivo()
        return
      }
      
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
    if (!formulario.value.empleado_id || !formulario.value.tipo_incidencia_id || 
        !formulario.value.fecha_inicio || !formulario.value.motivo) {
      mostrarMensaje('Por favor complete todos los campos obligatorios', 'warning')
      return
    }

    if (formulario.value.fecha_fin && formulario.value.fecha_fin < formulario.value.fecha_inicio) {
      mostrarMensaje('La fecha de fin no puede ser anterior a la fecha de inicio', 'error')
      return
    }

    guardando.value = true

    const nuevaJustificacion = {
      id: Date.now(),
      empleado_id: formulario.value.empleado_id,
      tipo_incidencia_id: formulario.value.tipo_incidencia_id,
      area_id: empleados.value.find(emp => emp.id === formulario.value.empleado_id)?.area_id,
      fecha_inicio: formulario.value.fecha_inicio,
      fecha_fin: formulario.value.fecha_fin || formulario.value.fecha_inicio,
      fecha_creacion: new Date().toISOString(),
      motivo: formulario.value.motivo,
      estado: ESTADOS_JUSTIFICACION.PENDIENTE,
      archivo_nombre: archivoPrevisualizacion.value ? archivoPrevisualizacion.value.name : null
    }
    
    justificaciones.value.unshift(nuevaJustificacion)
    
    mostrarMensaje('Justificación guardada correctamente')
    limpiarFormulario()
    
  } catch (error) {
    mostrarMensaje('Error al guardar la justificación', 'error')
  } finally {
    guardando.value = false
  }
}

const limpiarFormulario = () => {
  formulario.value = {
    empleado_id: null,
    tipo_incidencia_id: null,
    fecha_inicio: '',
    fecha_fin: '',
    motivo: ''
  }
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

const verArchivoRegistro = (item) => {
  mostrarMensaje(`Visualizando archivo: ${item.archivo_nombre}`, 'info')
}
</script>

<style scoped>
.estado-pendiente {
  color: #f59e0b;
  font-weight: 600;
}

.estado-aprobado {
  color: #10b981;
  font-weight: 600;
}

.estado-rechazado {
  color: #ef4444;
  font-weight: 600;
}

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

/* Filtros superiores */
.filtros-superiores {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
  max-width: 700px;
  padding: 1;
  box-sizing: border-box;
  margin-bottom: 2rem;
}

.filter-select {
  width: 200px;
}

.filter-btn {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0;
}

/* Cards */
.card-formulario,
.card-monitoreo,
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

/* Filtros de monitoreo */
.filtros-monitoreo {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
  width: 1100px;
  flex-wrap: nowrap;
  justify-content: flex-start;
}

.filter-select-monitor {
  width: 200px;
}

.search-input-monitor {
  width: 350px;
}

/* Tablas con filas alternadas */
.tabla-monitoreo,
.tabla-registro {
  border: 1px solid #e5e7eb;
  background-color: #FAFAFA;
}

.tabla-monitoreo :deep(thead),
.tabla-registro :deep(thead) {
  background-color: #221A68;
}

.tabla-monitoreo :deep(thead th),
.tabla-registro :deep(thead th) {
  color: #ffffff !important;
  font-weight: 600 !important;
  font-size: 0.875rem;
  padding: 0.75rem;
}

.tabla-acciones-header {
  width: 80px;
}

/* Filas alternadas para tabla de monitoreo */
.tabla-monitoreo :deep(tbody tr:nth-child(odd)) {
  background-color: #ffffff;
}

.tabla-monitoreo :deep(tbody tr:nth-child(even)) {
  background-color: #f8fafc;
}

.tabla-monitoreo :deep(tbody td) {
  padding: 0.75rem;
  font-size: 0.875rem;
  border-bottom: 1px solid #e5e7eb;
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

.estado-a-tiempo {
  color: #10b981;
  font-weight: 600;
}

.estado-ausente {
  color: #ef4444;
  font-weight: 600;
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

  .filtros-superiores,
  .filtros-monitoreo {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select,
  .filter-select-monitor,
  .search-input-monitor {
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
