<template>
  <div class="justificaciones-content">
    <div class="content-inner">
      <h2 class="page-title">Gestión de Justificaciones</h2>
      <br>
      
      <!-- Filtros Superiores -->
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

      <!-- Formulario: Registrar Nueva Justificación -->
      <v-card class="card-formulario" elevation="0">
        <h2 class="card-titulo">Registrar Nueva Justificación</h2>

        <v-card-text class="card-text-custom">
          <!-- Fila de Encabezados -->
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

          <!-- Fila de Inputs -->
          <v-row class="mt-0 mb-4 row-no-padding">
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="formulario.empleado"
                :items="empleadosConPlaceholder"
                item-title="title"
                item-value="value"
                class="input-white"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="formulario.tipoIncidencia"
                :items="tiposIncidenciaConPlaceholder"
                item-title="title"
                item-value="value"
                class="input-white"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-text-field
                v-model="formulario.fechaInicio"
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
                v-model="formulario.fechaFin"
                type="date"
                placeholder="dd/mm/aaaa"
                class="input-white"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>
          </v-row>

          <!-- Motivo/Descripción -->
          <div class="mb-6">
            <label class="form-label">Motivo/Descripción*</label>
            <v-textarea
              v-model="formulario.motivo"
              placeholder="Describa el motivo de la incidencia..."
              class="input-white"
              rows="4"
              variant="outlined"
              hide-details
            />
          </div>

          <!-- Cargar Justificante -->
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
              />
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="form-botones">
            <v-btn
              color="#5E47FF"
              class="btn-action"
              @click="guardarIncidencia"
            >
              <v-icon left size="18">mdi-content-save</v-icon>
              Guardar Incidencias
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

      <!-- Monitoreo de Incidencias -->
      <v-card class="card-monitoreo" elevation="0">
        <h2 class="card-titulo">Monitoreo de Incidencias</h2>

        <v-card-text>
          <!-- Filtros de Monitoreo -->
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

            <v-select
              v-model="monitoreo.area"
              :items="areasMonitoreoItems"
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
              clearable
              hide-details
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

          <!-- Tabla de Monitoreo -->
          <v-table class="tabla-monitoreo">
            <thead>
              <tr>
                <th class="text-center">Empleado</th>
                <th class="text-center">Tipo de Incidencias</th>
                <th class="text-center">Fecha</th>
                <th class="text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in incidenciasFiltradas" :key="index">
                <td class="text-center">{{ item.empleado }}</td>
                <td class="text-center">{{ item.tipoIncidencia }}</td>
                <td class="text-center">{{ item.fecha }}</td>
                <td class="text-center">
                  <span :class="item.estado === 'A tiempo' ? 'estado-a-tiempo' : 'estado-ausente'">
                    {{ item.estado }}
                  </span>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>

      <!-- Registro de Incidencias -->
      <v-card class="card-registro" elevation="0">
        <h2 class="card-titulo">Registro de Incidencias</h2>

        <v-card-text>
          <v-table class="tabla-registro">
            <thead>
              <tr>
                <th class="text-center">Empleado</th>
                <th class="text-center">Área</th>
                <th class="text-center">Fecha</th>
                <th class="text-center">Motivo</th>
                <th class="text-center tabla-acciones-header"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in registroIncidencias" :key="index">
                <td class="text-center">{{ item.empleado }}</td>
                <td class="text-center">{{ item.area }}</td>
                <td class="text-center">{{ item.fecha }}</td>
                <td class="text-center">{{ item.motivo }}</td>
                <td class="text-center">
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    @click="verDetalle(item)"
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

    <!-- Snackbar para mensajes -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Constantes
const ESTADOS = {
  TODOS: 'todos',
  A_TIEMPO: 'a-tiempo',
  AUSENTE: 'ausente',
  PENDIENTE: 'pendiente'
}

const AREAS = {
  TODAS: 'todas',
  RRHH: 'rrhh',
  VENTAS: 'ventas',
  OPERACIONES: 'operaciones'
}

const TIPOS_INCIDENCIA = {
  TRAFICO: 'trafico',
  ENFERMEDAD: 'enfermedad',
  FAMILIARES: 'familiares',
  MEDICA: 'medica'
}

// Snackbar
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const mostrarMensaje = (texto, color = 'success') => {
  snackbar.value = {
    show: true,
    text: texto,
    color: color
  }
}

// Filtros superiores
const filtroEstado = ref(ESTADOS.TODOS)
const filtroArea = ref(AREAS.TODAS)

const estadosItems = [
  { title: 'Todos los estados', value: ESTADOS.TODOS },
  { title: 'A tiempo', value: ESTADOS.A_TIEMPO },
  { title: 'Ausente', value: ESTADOS.AUSENTE },
  { title: 'Pendiente', value: ESTADOS.PENDIENTE }
]

const areasItems = [
  { title: 'Todas las áreas', value: AREAS.TODAS },
  { title: 'RRHH', value: AREAS.RRHH },
  { title: 'Ventas', value: AREAS.VENTAS },
  { title: 'Operaciones', value: AREAS.OPERACIONES }
]

// Formulario
const formulario = ref({
  empleado: '',
  tipoIncidencia: '',
  fechaInicio: '',
  fechaFin: '',
  motivo: ''
})

const empleadosItems = [
  { title: 'Juan Pérez', value: 'juan' },
  { title: 'Mariana Botas', value: 'mariana' },
  { title: 'Juan Hidalgo', value: 'hidalgo' },
  { title: 'Marcela Valencia', value: 'marcela' }
]

const empleadosConPlaceholder = computed(() => {  
  if (!formulario.value.empleado) {
    return [
      { title: 'Seleccionar Empleado', value: '', disabled: true }, 
      ...empleadosItems
    ]
  }
  return empleadosItems
})

const tiposIncidenciaItems = [
  { title: 'Tráfico', value: TIPOS_INCIDENCIA.TRAFICO },
  { title: 'Enfermedad', value: TIPOS_INCIDENCIA.ENFERMEDAD },
  { title: 'Asuntos Familiares', value: TIPOS_INCIDENCIA.FAMILIARES },
  { title: 'Cita Médica', value: TIPOS_INCIDENCIA.MEDICA }
]

const tiposIncidenciaConPlaceholder = computed(() => {
  if (!formulario.value.tipoIncidencia) {
    return [
      { title: 'Seleccionar Tipo', value: '', disabled: true }, 
      ...tiposIncidenciaItems
    ]
  }
  return tiposIncidenciaItems
})

// Archivo
const fileInput = ref(null)
const nombreArchivo = ref('Ningún archivo seleccionado')

// Filtros de monitoreo
const monitoreo = ref({
  periodo: 'mes-pasado',
  area: AREAS.TODAS,
  busqueda: ''
})

const periodosItems = [
  { title: 'Mes pasado', value: 'mes-pasado' },
  { title: 'Este mes', value: 'este-mes' },
  { title: 'Último trimestre', value: 'trimestre' }
]

const areasMonitoreoItems = [
  { title: 'Todas las áreas', value: AREAS.TODAS },
  { title: 'RRHH', value: AREAS.RRHH },
  { title: 'Ventas', value: AREAS.VENTAS }
]

// Datos
const incidenciasMonitoreo = ref([
  { empleado: 'Juan Pérez', tipoIncidencia: 'Tráfico', fecha: '14/02/2025', estado: 'A tiempo' },
  { empleado: 'Mariana Botas', tipoIncidencia: 'Tráfico', fecha: '20/08/2025', estado: 'A tiempo' },
  { empleado: 'Juan Hidalgo', tipoIncidencia: 'Enfermedad', fecha: '10/03/2025', estado: 'Ausente' },
  { empleado: 'Marcela Valencia', tipoIncidencia: 'Asuntos Familiares', fecha: '09/09/2025', estado: 'Ausente' }
])

const registroIncidencias = ref([
  { empleado: 'Juan Pérez', area: 'RRHH', fecha: '14/02/2025', motivo: 'Tráfico' },
  { empleado: 'Mariana Botas', area: 'Asistencias/Retardos', fecha: '20/08/2025', motivo: 'Tráfico' }
])

// Computed
const incidenciasFiltradas = computed(() => {
  let resultado = [...incidenciasMonitoreo.value]
  
  if (monitoreo.value.busqueda) {
    const busqueda = monitoreo.value.busqueda.toLowerCase().trim()
    resultado = resultado.filter(item => 
      item.empleado.toLowerCase().includes(busqueda)
    )
  }
  
  return resultado
})

// Funciones
const aplicarFiltrosSuperior = () => {
  mostrarMensaje('Filtros superiores aplicados')
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
    nombreArchivo.value = archivo ? archivo.name : 'Ningún archivo seleccionado'
  } catch (error) {
    mostrarMensaje('Error al seleccionar archivo', 'error')
  }
}

const guardarIncidencia = () => {
  try {
    if (!formulario.value.empleado || !formulario.value.tipoIncidencia || 
        !formulario.value.fechaInicio || !formulario.value.motivo) {
      mostrarMensaje('Por favor complete todos los campos obligatorios', 'warning')
      return
    }
    
    mostrarMensaje('Incidencia guardada correctamente')
    limpiarFormulario()
  } catch (error) {
    mostrarMensaje('Error al guardar la incidencia', 'error')
  }
}

const limpiarFormulario = () => {
  formulario.value = {
    empleado: '',
    tipoIncidencia: '',
    fechaInicio: '',
    fechaFin: '',
    motivo: ''
  }
  nombreArchivo.value = 'Ningún archivo seleccionado'
  
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const verDetalle = (item) => {
  if (item) {
    mostrarMensaje(`Ver detalle de: ${item.empleado}`, 'info')
  }
}
</script>

<style scoped>
.justificaciones-content {
  flex: 1;
  padding: 2rem;
  display: flex;
  align-items: flex-start;
  width: 100%;
  box-sizing: border-box;
  background-color: #E4E4E7;
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
  margin: 0;
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
  padding: 0.5rem;
  box-sizing: border-box;
  margin-bottom: 0.2rem;
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
  padding: 0.5;
  background-color: #FAFAFA;
  box-sizing: border-box;
  border-radius: 12px;
  margin-bottom: 2rem;
  margin-top: 2rem;
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