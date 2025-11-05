<template>
    <div class="reporteasistencias-content">
      <div class="content-inner">
        <h2 class="page-title">Reporte de asistencias</h2>
        <br>
  
        <!-- Filtros Superiores -->
        <div class="filtros-superiores">
          <v-select
            v-model="selectedMonth"
            :items="monthsItems"
            placeholder="Seleccionar mes"
            class="filter-select input-white"
            variant="outlined"
            density="compact"
            hide-details
          />
  
          <v-select
            v-model="selectedArea"
            :items="areasItems"
            placeholder="Seleccionar área"
            class="filter-select input-white"
            variant="outlined"
            density="compact"
            hide-details
          />
  
          <v-text-field
            v-model="searchTerm"
            placeholder="Buscar Área"
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
            @click="aplicarFiltros"
          >
            Aplicar Filtro
          </v-btn>
        </div>
  
        <!-- Leyenda de Estados -->
        <v-card class="card-formulario" elevation="0">
          <h2 class="card-titulo">Leyenda de Estados</h2>
          <v-card-text class="card-text-custom">
            <div class="legend-items">
              <div class="legend-item">
                <span class="legend-color asistencia"></span>
                <span>Asistencia</span>
              </div>
              <div class="legend-item">
                <span class="legend-color retardo"></span>
                <span>Retardo</span>
              </div>
              <div class="legend-item">
                <span class="legend-color falta"></span>
                <span>Falta</span>
              </div>
              <div class="legend-item">
                <span class="legend-color incidencia"></span>
                <span>Incidencia</span>
              </div>
              <div class="legend-item">
                <span class="legend-color falta-justificada"></span>
                <span>Falta Justificada</span>
              </div>
              <div class="legend-item">
                <span class="legend-color dias-feriados"></span>
                <span>Días Feriados</span>
              </div>
              <div class="legend-item">
                <span class="legend-color vacaciones"></span>
                <span>Vacaciones</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
  
        <!-- Resumen por Áreas -->
        <v-card class="card-monitoreo" elevation="0">
          <h2 class="card-titulo">Resumen por Áreas</h2>
  
          <v-card-text>
            <!-- Tabla de Resumen -->
            <v-table class="tabla-monitoreo">
              <thead>
                <tr>
                  <th class="text-center">Áreas</th>
                  <th class="text-center">Total Empleados</th>
                  <th class="text-center">% Asistencia</th>
                  <th class="text-center">Retardos</th>
                  <th class="text-center">Falt. Justif.</th>
                  <th class="text-center">Falt. Injustif.</th>
                  <th class="text-center tabla-acciones-header">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in summaryData" :key="index">
                  <td class="text-center">{{ item.area }}</td>
                  <td class="text-center">{{ item.totalEmpleados }}</td>
                  <td class="text-center">{{ item.asistencia }}</td>
                  <td class="text-center">{{ item.retardos }}</td>
                  <td class="text-center">{{ item.faltJustif }}</td>
                  <td class="text-center">{{ item.faltInjustif }}</td>
                  <td class="text-center">
                    <div class="action-buttons">
                      <v-btn
                        class="btn-detalle"
                        size="small"
                        @click="verDetalle(item)"
                      >
                        Detalle
                      </v-btn>
                      <v-btn
                        class="btn-generar"
                        size="small"
                        @click="generarReporte(item)"
                      >
                        Generar Reporte
                      </v-btn>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
  
        <!-- Detalle de Asistencias -->
        <v-card v-if="mostrarDetalle" class="card-registro" elevation="0">
          <h2 class="card-titulo">Detalle: Área de {{ areaSeleccionada }} - {{ mesSeleccionado }}</h2>
  
          <v-card-text>
            <!-- Tabla de Detalle -->
            <div class="table-container">
              <v-table class="tabla-registro detail-table">
                <thead>
                  <tr>
                    <th class="text-center fixed-column header-blue">Empleado</th>
                    <th class="text-center fixed-column header-blue">Puesto</th>
                    <th 
                      v-for="day in 31" 
                      :key="day" 
                      class="text-center day-column"
                    >
                      {{ day }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(emp, empIndex) in employeesFiltered" :key="empIndex">
                    <td class="text-center fixed-column">{{ emp.empleado }}</td>
                    <td class="text-center fixed-column">{{ emp.puesto }}</td>
                    <td 
                      v-for="day in 31" 
                      :key="day" 
                      class="text-center day-column"
                    >
                      <div 
                        v-if="emp.attendance[day - 1]" 
                        :class="['status-badge', getStatusClass(emp.attendance[day - 1])]"
                      >
                        {{ emp.attendance[day - 1] }}
                      </div>
                      <div v-else class="status-badge empty-badge">
                        -
                      </div>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
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

// Refs
const selectedMonth = ref('enero-2024')
const selectedArea  = ref('todas')   // ← por defecto: Todas las Áreas
const searchTerm    = ref('')
const mostrarDetalle = ref(false)

// Snackbar
const snackbar = ref({ show: false, text: '', color: 'success' })
const mostrarMensaje = (texto, color = 'success') => {
  snackbar.value = { show: true, text: texto, color }
}

// Items para selects
const monthsItems = [
  { title: 'Enero 2024', value: 'enero-2024' },
  { title: 'Febrero 2024', value: 'febrero-2024' },
  { title: 'Marzo 2024',  value: 'marzo-2024' }
]

const areasItems = [
  { title: 'Todas las Áreas', value: 'todas' },  // ← opción agregada
  { title: 'Contratos',       value: 'contratos' },
  { title: 'Ventas',          value: 'ventas' },
  { title: 'Marketing',       value: 'marketing' }
]

// ================== DATA ==================
const originalSummaryData = [
  { area: 'Contratos', totalEmpleados: 15, asistencia: '89%', retardos: 12, faltJustif: 5, faltInjustif: 3 },
  { area: 'Ventas',    totalEmpleados: 20, asistencia: '92%', retardos: 8,  faltJustif: 3, faltInjustif: 2 },
  { area: 'Marketing', totalEmpleados: 10, asistencia: '85%', retardos: 15, faltJustif: 7, faltInjustif: 4 }
]

const summaryData   = ref([...originalSummaryData])

const employeesData = ref([
  { empleado: 'Julio Peña',      puesto: 'Director comercial', attendance: ['C','A','A','A','FJ','DF','DF','R','A','A','A','A','FJ','A','A','R','A','A','A','F','DF','DF','A','A','A','A','FJ','A','R','A','A'] },
  { empleado: 'Martha Higadera', puesto: 'Gerente',             attendance: ['I','A','A','F','A','DF','DF','A','R','V','V','V','V','A','A','A','A','R','A','A','DF','DF','A','F','A','A','A','A','A','R','A'] },
  { empleado: 'Joaquín Pérez',   puesto: 'Key Account Manager', attendance: ['A','A','FJ','A','R','DF','DF','A','A','A','R','A','A','A','F','A','A','A','A','A','DF','DF','R','A','A','A','A','FJ','A','A','A'] },
  { empleado: 'Rafael Quijada',  puesto: 'Ejecutivo',           attendance: ['A','A','A','A','A','DF','DF','A','A','A','A','F','R','A','A','A','A','A','R','A','DF','DF','A','A','A','F','A','A','A','A','A'] },
  { empleado: 'Jose Martínez',   puesto: 'Coordinador',         attendance: ['A','A','A','A','A','DF','DF','A','FJ','A','A','A','A','R','A','A','A','A','A','A','DF','DF','A','A','F','A','A','A','A','A','R'] },
  { empleado: 'Zayra López',     puesto: 'Asistente',           attendance: ['A','A','F','A','A','DF','DF','A','A','A','A','A','A','A','A','R','A','A','A','A','DF','DF','A','A','A','A','FJ','A','A','A','A'] },
  { empleado: 'Emylin Camargo',  puesto: 'Supervisor',          attendance: ['A','A','A','R','A','DF','DF','A','A','A','FJ','I','A','A','A','A','F','A','A','A','DF','DF','A','R','A','A','A','A','A','A','A'] },
  { empleado: 'Johana Pérez',    puesto: 'Analista',            attendance: ['A','A','A','F','A','DF','DF','A','A','A','A','A','A','A','R','A','A','A','A','A','DF','DF','A','A','A','FJ','A','A','F','A','A'] },
  { empleado: 'Fernando Cruz',   puesto: 'Repr. comercial',     attendance: ['A','A','A','A','A','DF','DF','A','A','A','R','A','F','A','A','A','A','A','A','R','DF','DF','A','A','A','A','A','A','A','A','FJ'] },
  { empleado: 'Jaqueline Ortiz', puesto: 'Coach',               attendance: ['R','A','A','A','A','DF','DF','A','A','F','A','A','A','A','A','A','R','A','A','A','DF','DF','A','A','A','A','A','FJ','A','A','A'] }
])

// ================== COMPUTED ==================
const areaSeleccionada = computed(() =>
  selectedArea.value.charAt(0).toUpperCase() + selectedArea.value.slice(1)
)

const mesSeleccionado = computed(() => {
  const meses = {
    'enero-2024': 'Enero 2024',
    'febrero-2024': 'Febrero 2024',
    'marzo-2024':  'Marzo 2024'
  }
  return meses[selectedMonth.value] || 'Enero 2024'
})

const employeesFiltered = computed(() => {
  if (!searchTerm.value) return employeesData.value
  const search = searchTerm.value.toLowerCase()
  return employeesData.value.filter(emp =>
    emp.empleado.toLowerCase().includes(search) ||
    emp.puesto.toLowerCase().includes(search)
  )
})

// ================== FUNCTIONS ==================
const getStatusClass = (status) => {
  const classes = {
    'A': 'status-asistencia',
    'R': 'status-retardo',
    'F': 'status-falta',
    'I': 'status-incidencia',
    'FJ': 'status-falta-justificada',
    'DF': 'status-dias-feriados',
    'V': 'status-vacaciones',
    'C': 'status-asistencia'
  }
  return classes[status] || ''
}

const aplicarFiltros = () => {
  const area = (selectedArea.value || 'todas').toLowerCase()

  // 1) Filtrar resumen por área (o mostrar todas)
  summaryData.value = area === 'todas'
    ? [...originalSummaryData]
    : originalSummaryData.filter(a => a.area.toLowerCase() === area)

  // 2) (Mes no aplica en datos de ejemplo; aquí iría el filtro por fecha si agregas campo)

  // 3) Contar coincidencias del buscador (aplica en employeesFiltered)
  const coincidencias = employeesFiltered.value.length

  const labelArea = area === 'todas' ? 'Todas las Áreas' : areaSeleccionada.value
  mostrarMensaje(`Filtros aplicados: ${labelArea}. Empleados que coinciden: ${coincidencias}`)
}

const verDetalle = (row) => {
  mostrarDetalle.value = true
  mostrarMensaje(`Mostrando detalle del área: ${row.area}`, 'info')
  setTimeout(() => {
    const detailSection = document.querySelector('.card-registro')
    if (detailSection) detailSection.scrollIntoView({ behavior: 'smooth' })
  }, 100)
}

const generarReporte = (row) => {
  mostrarMensaje(`Generando PDF para: ${row.area}`, 'success')
  setTimeout(() => {
    const link = document.createElement('a')
    link.href = '#'
    link.download = `reporte-${row.area.toLowerCase()}-${selectedMonth.value}.pdf`
    link.click()
  }, 1000)
}
</script>

  <style scoped>
  .reporteasistencias-content {
    flex: 1;
    padding: 2rem;
    margin-left: 60px;
    margin-right: 15px;
    display: flex;
    align-items: flex-start;
    width: 85vw;
    height: 100vw;
    box-sizing: border-box;
    background-color: #E4E4E7;
  }
  
  .content-inner {
    width: 100vw;
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
    max-width: 1000px;
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
    margin-top: 1rem;
  }
  
  .card-titulo {
    font-size: 1.125rem;
    font-weight: 600;
    color: #544F65;
    padding: 1rem 1.5rem 0.4rem;
    background-color: #FAFAFA;
  }
  
  .card-text-custom {
    padding-bottom: 0;
    margin-bottom: 1rem;
  }
  
  /* Leyenda */
  .legend-items {
    margin-top: 0.1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    align-items: center;
    padding: 0.5rem 0;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    display: inline-block;
  }
  
  .asistencia { background-color: #10b981; }
  .retardo { background-color: #f59e0b; }
  .falta { background-color: #ef4444; }
  .incidencia { background-color: #8b5cf6; }
  .falta-justificada { background-color: #3b82f6; }
  .dias-feriados { background-color: #6b7280; }
  .vacaciones { background-color: #ec4899; }
  
  /* Tablas con filas alternadas */
  .tabla-monitoreo,
  .tabla-registro {
    border: 1px solid #e5e7eb;
    background-color: #221A68;
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
    width: 250px;
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
  
  /* Tabla de detalle con scroll horizontal */
  .table-container {
    overflow-x: auto;
    max-width: 100%;
  }
  
  .detail-table {
    min-width: 1200px;
  }

  
  
  .fixed-column {
    position: sticky;
    left: 0;
    background-color: #FAFAFA;
    z-index: 1;
    min-width: 180px;
  }
  
  .day-column {
    min-width: 60px;
    max-width: 60px;
  }
  
  /* Status Badges */
  .status-badge {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    margin: 0 auto;
  }
  
  .empty-badge {
    background-color: #f3f4f6;
    color: #9ca3af;
  }
  
  .status-asistencia {
    background-color: #10b981;
    color: white;
  }
  
  .status-retardo {
    background-color: #f59e0b;
    color: white;
  }
  
  .status-falta {
    background-color: #ef4444;
    color: white;
  }
  
  .status-incidencia {
    background-color: #8b5cf6;
    color: white;
  }
  
  .status-falta-justificada {
    background-color: #3b82f6;
    color: white;
  }
  
  .status-dias-feriados {
    background-color: #6b7280;
    color: white;
  }
  
  .status-vacaciones {
    background-color: #ec4899;
    color: white;
  }
  
  /* Action Buttons */
  .action-buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
  }
  
  .btn-detalle {
    background-color: #3b82f6;
    color: white;
    text-transform: none;
    font-size: 0.75rem;
    padding: 0 12px;
    height: 32px;
  }
  
  .btn-generar {
    background-color: #10b981;
    color: white;
    text-transform: none;
    font-size: 0.75rem;
    padding: 0 12px;
    height: 32px;
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
  
    .filtros-superiores {
      flex-direction: column;
      align-items: stretch;
    }
  
    .filter-select,
    .filter-select-monitor,
    .search-input-monitor {
      width: 100%;
    }
  
    .legend-items {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
  
    .action-buttons {
      flex-direction: column;
      gap: 0.25rem;
    }
  
    .btn-detalle,
    .btn-generar {
      width: 100%;
    }
  }
  </style>