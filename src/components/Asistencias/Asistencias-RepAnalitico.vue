<template>
  <div class="repanalitico-content">
    <div class="content-inner">
      <h2 class="page-title">Reporte Analítico</h2>
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
          placeholder="Todas las Áreas"
          class="filter-select input-white"
          variant="outlined"
          density="compact"
          hide-details
        />

        <v-text-field
          v-model="searchTerm"
          placeholder="Buscar Empleado"
          class="search-input-monitor input-white"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          @input="validarBusqueda"
          @keypress="prevenirCaracteresInvalidos"
          :class="{ 'input-error': busquedaError }"
        >
          <template v-slot:append-inner>
            <v-icon size="20" color="#9ca3af">mdi-magnify</v-icon>
          </template>
          <template v-slot:details>
            <div v-if="busquedaError" class="error-message">
              Solo se permiten letras y espacios
            </div>
          </template>
        </v-text-field>

        <v-btn
          color="#5E47FF"
          class="filter-btn"
          @click="aplicarFiltros"
        >
          Aplicar Filtro
        </v-btn>

        <v-btn
          color="#312e81"
          class="filter-btn"
          @click="generarReporte"
          :loading="generandoPdf"
          :disabled="generandoPdf"
        >
          <v-icon left size="16">mdi-file-pdf</v-icon>
          {{ generandoPdf ? 'Generando...' : 'Generar Reporte' }}
        </v-btn>

        <v-btn
          color="#10b981"
          class="filter-btn"
          @click="mostrarEstadisticas"
        >
          <v-icon left size="18">mdi-chart-bar</v-icon>
          Ver Estadísticas
        </v-btn>
      </div>

      <!-- Estadísticas Resumen -->
      <v-card v-if="mostrarStats" class="card-formulario" elevation="0">
        <h2 class="card-titulo">Estadísticas del Mes</h2>
        <v-card-text class="card-text-custom">
          <v-row class="stats-grid">
            <v-col cols="12" sm="6" md="3">
              <div class="stat-card">
                <div class="stat-value">{{ estadisticas.promedioAsistencia }}%</div>
                <div class="stat-label">Asistencia Promedio</div>
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <div class="stat-card">
                <div class="stat-value">{{ estadisticas.totalRetardos }}</div>
                <div class="stat-label">Total Retardos</div>
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <div class="stat-card">
                <div class="stat-value">{{ estadisticas.totalFaltas }}</div>
                <div class="stat-label">Total Faltas</div>
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <div class="stat-card">
                <div class="stat-value">{{ estadisticas.totalHorasExtra }}</div>
                <div class="stat-label">Horas Extra</div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Tabla Analítica -->
      <v-card class="card-monitoreo" elevation="0">
        <h2 class="card-titulo">Datos Analíticos por Empleado - {{ mesSeleccionado }}</h2>

        <v-card-text>
          <!-- Contenedor para scroll horizontal -->
          <div class="table-container">
            <v-table class="tabla-monitoreo">
              <thead>
                <tr>
                  <th class="text-center columna-empleado">Empleado</th>
                  <th class="text-center columna-area">Área</th>
                  <th class="text-center">Días Trab.</th>
                  <th class="text-center">Retardos</th>
                  <th class="text-center">F. Justif.</th>
                  <th class="text-center">F. Injustif.</th>
                  <th class="text-center">Incidencias</th>
                  <th class="text-center">H. Extra</th>
                  <th class="text-center">D. Fdos.</th>
                  <th class="text-center tabla-acciones-header">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in analyticsData" :key="index">
                  <td class="text-center columna-empleado">{{ item.empleado }}</td>
                  <td class="text-center columna-area">{{ item.area }}</td>
                  <td class="text-center">{{ item.diasTrabajados }}</td>
                  <td class="text-center">
                    <span :class="getRetardosClass(item.retardos)">{{ item.retardos }}</span>
                  </td>
                  <td class="text-center">{{ item.faltJustif }}</td>
                  <td class="text-center">
                    <span :class="getFaltasClass(item.faltInjustif)">{{ item.faltInjustif }}</span>
                  </td>
                  <td class="text-center">{{ item.incidencias }}</td>
                  <td class="text-center">
                    <span :class="getHorasExtraClass(item.horasExtra)">{{ item.horasExtra }}</span>
                  </td>
                  <td class="text-center">{{ item.dFdosTrabajados }}</td>
                  <td class="text-center action-cell">
                    <div class="btn-wrapper">
                      <v-btn
                        size="small"
                        variant="text"
                        @click="descargarDetalle(item)"
                        color="success"
                        :loading="descargandoIndividual"
                        :disabled="descargandoIndividual"
                      >
                        <v-icon left size="16">mdi-download</v-icon>
                        Descargar
                      </v-btn>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>

          <!-- Mensaje cuando no hay datos -->
          <div v-if="analyticsData.length === 0" class="no-data-message">
            <v-icon size="48" color="#9ca3af">mdi-clipboard-text-outline</v-icon>
            <p>No se encontraron datos con los filtros aplicados</p>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Snackbar para mensajes -->
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
import jsPDF from 'jspdf'

// Refs
const selectedMonth = ref('enero-2024')
const selectedArea = ref('todas')
const searchTerm = ref('')
const busquedaError = ref(false)
const generandoPdf = ref(false)
const descargandoIndividual = ref(false)
const mostrarStats = ref(false)

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

// Items para selects
const monthsItems = [
  { title: 'Enero 2024', value: 'enero-2024' },
  { title: 'Febrero 2024', value: 'febrero-2024' },
  { title: 'Marzo 2024', value: 'marzo-2024' }
]

const areasItems = [
  { title: 'Todas las Áreas', value: 'todas' },
  { title: 'Contratos', value: 'contratos' },
  { title: 'Ventas', value: 'ventas' },
  { title: 'Marketing', value: 'marketing' },
  { title: 'Recursos Humanos', value: 'rh' },
  { title: 'TI', value: 'ti' }
]

// Data
const originalAnalyticsData = [
  {
    empleado: 'Luis Hernández',
    area: 'Contratos',
    diasTrabajados: 22,
    retardos: 1,
    faltJustif: 0,
    faltInjustif: 0,
    incidencias: 0,
    horasExtra: 3,
    dFdosTrabajados: 1
  },
  {
    empleado: 'Carolina Reyes',
    area: 'Ventas',
    diasTrabajados: 20,
    retardos: 0,
    faltJustif: 2,
    faltInjustif: 0,
    incidencias: 0,
    horasExtra: 5,
    dFdosTrabajados: 0
  },
  {
    empleado: 'Roberto Silva',
    area: 'Marketing',
    diasTrabajados: 18,
    retardos: 3,
    faltJustif: 1,
    faltInjustif: 1,
    incidencias: 1,
    horasExtra: 2,
    dFdosTrabajados: 1
  },
  {
    empleado: 'Gabriela Morales',
    area: 'Recursos Humanos',
    diasTrabajados: 21,
    retardos: 0,
    faltJustif: 0,
    faltInjustif: 0,
    incidencias: 0,
    horasExtra: 1,
    dFdosTrabajados: 2
  },
  {
    empleado: 'Fernando Castro',
    area: 'TI',
    diasTrabajados: 19,
    retardos: 2,
    faltJustif: 0,
    faltInjustif: 2,
    incidencias: 0,
    horasExtra: 0,
    dFdosTrabajados: 0
  },
  {
    empleado: 'Daniela Ortega',
    area: 'Contratos',
    diasTrabajados: 22,
    retardos: 1,
    faltJustif: 1,
    faltInjustif: 0,
    incidencias: 0,
    horasExtra: 0,
    dFdosTrabajados: 1
  },
  {
    empleado: 'Ángel Santos',
    area: 'Ventas',
    diasTrabajados: 17,
    retardos: 4,
    faltJustif: 2,
    faltInjustif: 1,
    incidencias: 0,
    horasExtra: 1,
    dFdosTrabajados: 0
  },
  {
    empleado: 'Alejandra Pares',
    area: 'Marketing',
    diasTrabajados: 20,
    retardos: 0,
    faltJustif: 0,
    faltInjustif: 0,
    incidencias: 1,
    horasExtra: 2,
    dFdosTrabajados: 0
  },
  {
    empleado: 'Luis Ríos',
    area: 'Recursos Humanos',
    diasTrabajados: 21,
    retardos: 2,
    faltJustif: 0,
    faltInjustif: 0,
    incidencias: 0,
    horasExtra: 0,
    dFdosTrabajados: 0
  },
  {
    empleado: 'Patricia Mendoza',
    area: 'TI',
    diasTrabajados: 18,
    retardos: 1,
    faltJustif: 3,
    faltInjustif: 0,
    incidencias: 0,
    horasExtra: 0,
    dFdosTrabajados: 1
  }
]

const analyticsData = ref([...originalAnalyticsData])

// ================== COMPUTED ==================
const mesSeleccionado = computed(() => {
  const meses = {
    'enero-2024': 'Enero 2024',
    'febrero-2024': 'Febrero 2024',
    'marzo-2024': 'Marzo 2024'
  }
  return meses[selectedMonth.value] || 'Enero 2024'
})

// Computed - Estadísticas
const estadisticas = computed(() => {
  const totalEmpleados = analyticsData.value.length
  const totalDiasTrabajados = analyticsData.value.reduce((sum, emp) => sum + emp.diasTrabajados, 0)
  const totalRetardos = analyticsData.value.reduce((sum, emp) => sum + emp.retardos, 0)
  const totalFaltas = analyticsData.value.reduce((sum, emp) => sum + emp.faltJustif + emp.faltInjustif, 0)
  const totalHorasExtra = analyticsData.value.reduce((sum, emp) => sum + emp.horasExtra, 0)
  
  const promedioAsistencia = ((totalDiasTrabajados / (totalEmpleados * 22)) * 100).toFixed(1)
  
  return {
    promedioAsistencia,
    totalRetardos,
    totalFaltas,
    totalHorasExtra
  }
})

// ================== MÉTODOS ==================
// Validación de búsqueda (solo letras y espacios)
const validarBusqueda = () => {
  const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
  if (searchTerm.value && !soloLetrasRegex.test(searchTerm.value)) {
    busquedaError.value = true
    // Remover caracteres no válidos
    searchTerm.value = searchTerm.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    mostrarMensaje('Solo se permiten letras y espacios en la búsqueda', 'warning')
  } else {
    busquedaError.value = false
  }
}

// Prevenir que se ingresen caracteres inválidos desde el teclado
const prevenirCaracteresInvalidos = (event) => {
  const key = event.key
  const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/
  
  // Permitir teclas de control (backspace, delete, tab, etc.)
  const teclasPermitidas = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End'
  ]
  
  if (!soloLetrasRegex.test(key) && !teclasPermitidas.includes(key)) {
    event.preventDefault()
    busquedaError.value = true
    setTimeout(() => {
      mostrarMensaje('Solo se permiten letras y espacios', 'warning')
    }, 100)
  } else {
    busquedaError.value = false
  }
}

const aplicarFiltros = () => {
  // Si hay error de validación, no aplicar filtros
  if (busquedaError.value) {
    mostrarMensaje('Corrija la búsqueda antes de aplicar filtros', 'error')
    return
  }

  const area = (selectedArea.value || '').toLowerCase()
  const term = (searchTerm.value || '').trim().toLowerCase()

  const filtrados = originalAnalyticsData.filter(emp => {
    const cumpleArea = area === 'todas' || emp.area.toLowerCase() === area
    const texto = `${emp.empleado}`.toLowerCase()
    const cumpleBusqueda = term === '' || texto.includes(term)
    return cumpleArea && cumpleBusqueda
  })

  analyticsData.value = filtrados

  mostrarMensaje(`Filtros aplicados: ${filtrados.length} empleado(s) encontrados`)
}

const generarReporte = async () => {
  generandoPdf.value = true
  try {
    mostrarMensaje('Generando reporte PDF analítico...', 'info')
    await generarPDF()
    mostrarMensaje('Reporte PDF generado exitosamente', 'success')
  } catch (error) {
    console.error('Error generando PDF:', error)
    mostrarMensaje('Error al generar el reporte PDF', 'error')
  } finally {
    generandoPdf.value = false
  }
}

const generarPDF = async () => {
  return new Promise((resolve, reject) => {
    try {
      // Crear nuevo documento PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })

      // Configuración de colores
      const colors = {
        primary: [34, 26, 104],
        secondary: [94, 71, 255],
        gray: [107, 114, 128],
        success: [16, 185, 129],
        warning: [245, 158, 11],
        error: [239, 68, 68]
      }

      // ========== ENCABEZADO DEL REPORTE ==========
      pdf.setFontSize(16)
      pdf.setTextColor(...colors.primary)
      pdf.text('REPORTE ANALÍTICO DE ASISTENCIAS', 20, 20)

      pdf.setFontSize(12)
      pdf.setTextColor(...colors.gray)
      pdf.text(`Período: ${mesSeleccionado.value}`, 20, 30)
      pdf.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 37)
      pdf.text(`Total de empleados: ${analyticsData.value.length}`, 20, 44)

      let yPosition = 55

      // ========== ESTADÍSTICAS ==========
      pdf.setFillColor(...colors.primary)
      pdf.setTextColor(255, 255, 255)
      pdf.rect(20, yPosition, 250, 8, 'F')
      pdf.text('ESTADÍSTICAS DEL MES', 22, yPosition + 6)

      yPosition += 15

      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(10)

      const statsData = [
        { label: 'Asistencia Promedio:', valor: `${estadisticas.value.promedioAsistencia}%` },
        { label: 'Total Retardos:', valor: estadisticas.value.totalRetardos.toString() },
        { label: 'Total Faltas:', valor: estadisticas.value.totalFaltas.toString() },
        { label: 'Total Horas Extra:', valor: estadisticas.value.totalHorasExtra.toString() }
      ]

      statsData.forEach((stat, index) => {
        const y = yPosition + (index * 6)
        pdf.setFont(undefined, 'bold')
        pdf.text(stat.label, 22, y)
        pdf.setFont(undefined, 'normal')
        pdf.text(stat.valor, 80, y)
      })

      yPosition += 30

      // ========== TABLA ANALÍTICA ==========
      pdf.setFillColor(...colors.primary)
      pdf.setTextColor(255, 255, 255)
      pdf.rect(20, yPosition, 250, 8, 'F')
      pdf.text('DETALLE ANALÍTICO POR EMPLEADO', 22, yPosition + 6)

      yPosition += 15

      // Encabezados de la tabla
      const headers = ['Empleado', 'Área', 'Días Trab.', 'Retardos', 'F. Justif.', 'F. Injustif.', 'Incidencias', 'H. Extra', 'D. Fdos.']
      const columnWidths = [25, 25, 15, 15, 15, 15, 15, 15, 15]

      let xPosition = 20

      // Dibujar encabezados
      headers.forEach((header, index) => {
        pdf.setFillColor(...colors.primary)
        pdf.rect(xPosition, yPosition, columnWidths[index], 8, 'F')
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(6)
        pdf.text(header, xPosition + 1, yPosition + 5)
        xPosition += columnWidths[index]
      })

      yPosition += 8

      // Datos de los empleados
      analyticsData.value.forEach((emp, index) => {
        // Control de paginación
        if (yPosition > 180 && index < analyticsData.value.length - 1) {
          pdf.addPage()
          yPosition = 20
          
          // Redibujar encabezados en nueva página
          xPosition = 20
          headers.forEach((header, idx) => {
            pdf.setFillColor(...colors.primary)
            pdf.rect(xPosition, yPosition, columnWidths[idx], 8, 'F')
            pdf.setTextColor(255, 255, 255)
            pdf.setFontSize(6)
            pdf.text(header, xPosition + 1, yPosition + 5)
            xPosition += columnWidths[idx]
          })
          yPosition += 8
        }

        xPosition = 20
        
        // Fondo alternado para mejor legibilidad
        pdf.setFillColor(index % 2 === 0 ? 255 : 245, 255, 255)
        pdf.rect(20, yPosition, 250, 6, 'F')
        
        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(5)
        
        // Datos de cada columna
        const datosFila = [
          emp.empleado.substring(0, 15),
          emp.area.substring(0, 12),
          emp.diasTrabajados.toString(),
          emp.retardos.toString(),
          emp.faltJustif.toString(),
          emp.faltInjustif.toString(),
          emp.incidencias.toString(),
          emp.horasExtra.toString(),
          emp.dFdosTrabajados.toString()
        ]

        datosFila.forEach((dato, colIndex) => {
          pdf.text(dato, xPosition + 1, yPosition + 4)
          xPosition += columnWidths[colIndex]
        })
        
        yPosition += 6
      })

      // ========== PIE DE PÁGINA ==========
      const totalPages = pdf.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setTextColor(...colors.gray)
        pdf.text(`Página ${i} de ${totalPages} - Generado el ${new Date().toLocaleDateString('es-ES')}`, 20, 200)
      }

      // Guardar PDF
      pdf.save(`reporte-analitico-${selectedMonth.value}.pdf`)
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

const descargarDetalle = async (empleado) => {
  descargandoIndividual.value = true
  try {
    mostrarMensaje(`Generando reporte individual para: ${empleado.empleado}...`, 'info')
    await generarPDFIndividual(empleado)
    mostrarMensaje(`Reporte de ${empleado.empleado} descargado`, 'success')
  } catch (error) {
    console.error('Error generando PDF individual:', error)
    mostrarMensaje('Error al generar el reporte individual', 'error')
  } finally {
    descargandoIndividual.value = false
  }
}

const generarPDFIndividual = async (empleado) => {
  return new Promise((resolve, reject) => {
    try {
      // Crear nuevo documento PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // Configuración de colores
      const colors = {
        primary: [34, 26, 104],
        secondary: [94, 71, 255],
        gray: [107, 114, 128]
      }

      // ========== ENCABEZADO DEL REPORTE ==========
      pdf.setFontSize(18)
      pdf.setTextColor(...colors.primary)
      pdf.text(`REPORTE INDIVIDUAL - ${empleado.empleado.toUpperCase()}`, 20, 25)

      pdf.setFontSize(12)
      pdf.setTextColor(...colors.gray)
      pdf.text(`Período: ${mesSeleccionado.value}`, 20, 35)
      pdf.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 42)
      pdf.text(`Área: ${empleado.area}`, 20, 49)

      let yPosition = 65

      // ========== DATOS DEL EMPLEADO ==========
      pdf.setFillColor(...colors.primary)
      pdf.setTextColor(255, 255, 255)
      pdf.rect(20, yPosition, 170, 8, 'F')
      pdf.text('DATOS DEL EMPLEADO', 22, yPosition + 6)

      yPosition += 15

      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(11)

      const datosEmpleado = [
        { label: 'Días Trabajados:', valor: empleado.diasTrabajados.toString() },
        { label: 'Retardos:', valor: empleado.retardos.toString() },
        { label: 'Faltas Justificadas:', valor: empleado.faltJustif.toString() },
        { label: 'Faltas Injustificadas:', valor: empleado.faltInjustif.toString() },
        { label: 'Incidencias:', valor: empleado.incidencias.toString() },
        { label: 'Horas Extra:', valor: empleado.horasExtra.toString() },
        { label: 'Días Feriados Trabajados:', valor: empleado.dFdosTrabajados.toString() }
      ]

      datosEmpleado.forEach((dato, index) => {
        const y = yPosition + (index * 7)
        pdf.setFont(undefined, 'bold')
        pdf.text(dato.label, 22, y)
        pdf.setFont(undefined, 'normal')
        pdf.text(dato.valor, 80, y)
      })

      yPosition += 60

      // ========== RESUMEN ==========
      pdf.setFillColor(...colors.primary)
      pdf.setTextColor(255, 255, 255)
      pdf.rect(20, yPosition, 170, 8, 'F')
      pdf.text('RESUMEN', 22, yPosition + 6)

      yPosition += 15

      const porcentajeAsistencia = ((empleado.diasTrabajados / 22) * 100).toFixed(1)
      const totalFaltas = empleado.faltJustif + empleado.faltInjustif

      const resumenData = [
        { label: 'Porcentaje de Asistencia:', valor: `${porcentajeAsistencia}%` },
        { label: 'Total de Faltas:', valor: totalFaltas.toString() },
        { label: 'Promedio Retardos por Mes:', valor: empleado.retardos.toString() }
      ]

      resumenData.forEach((dato, index) => {
        const y = yPosition + (index * 7)
        pdf.setFont(undefined, 'bold')
        pdf.text(dato.label, 22, y)
        pdf.setFont(undefined, 'normal')
        pdf.text(dato.valor, 85, y)
      })

      // ========== PIE DE PÁGINA ==========
      pdf.setFontSize(8)
      pdf.setTextColor(...colors.gray)
      pdf.text(`Generado el ${new Date().toLocaleDateString('es-ES')} - Sistema de Reportes`, 20, 287)

      // Guardar PDF
      const nombreArchivo = `reporte-${empleado.empleado.toLowerCase().replace(/\s+/g, '-')}-${selectedMonth.value}.pdf`
      pdf.save(nombreArchivo)
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

const mostrarEstadisticas = () => {
  mostrarStats.value = !mostrarStats.value
  if (mostrarStats.value) {
    mostrarMensaje('Estadísticas mostradas', 'info')
  }
}

// Funciones para clases condicionales
const getRetardosClass = (retardos) => {
  if (retardos === 0) return 'buen-estado'
  if (retardos <= 2) return 'estado-regular'
  return 'mal-estado'
}

const getFaltasClass = (faltas) => {
  if (faltas === 0) return 'buen-estado'
  if (faltas <= 1) return 'estado-regular'
  return 'mal-estado'
}

const getHorasExtraClass = (horas) => {
  if (horas > 0) return 'horas-positivas'
  return ''
}
</script>

<style scoped>
.repanalitico-content {
  flex: 1;
  padding: 0rem !important;
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
  margin: 0 0rem 0rem 1rem;
  padding: 0.2rem;
}

/* Inputs con fondo blanco */
.input-white :deep(.v-field) { 
  background-color: #FAFAFA; 
}

/* Input con error (solo borde rojo) */
.input-error :deep(.v-field) {
  border-color: #ef4444 !important;
}

/* Mensaje de error debajo del input */
.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 4px;
  padding: 0 4px;
}

/* ===== Filtros Compactos ===== */
.filtros-superiores {
  display: grid;
  grid-template-columns: 180px 180px 1fr auto auto auto;
  gap: 0.75rem;
  width: 92%;
  padding: 0.5rem 0;
  box-sizing: border-box;
  margin: 0 0 1rem 0;
  align-items: center;
}

.filter-select,
.search-input-monitor { 
  width: 100%; 
}

.filter-btn {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0;
  white-space: nowrap;
  height: 40px !important;
}

/* ===== Tarjeta de Estadísticas ===== */
.card-formulario {
  padding: 0.2rem;
  background-color: #FAFAFA;
  box-sizing: border-box;
  border-radius: 12px;
  margin-bottom: 1.7rem;
  width: 100%;
}

.card-titulo {
  font-size: 1.125rem;
  font-weight: 600;
  color: #544F65;
  padding: 1rem 1.5rem 0.4rem;
  margin: 0.5rem 0 0.5rem;
  background-color: #FAFAFA;
  width: 100%;
}

.card-text-custom {
  padding-bottom: 0;
}

/* Estadísticas */
.stats-grid {
  margin-top: 0.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid #5E47FF;
  margin-bottom: 1rem;
  width: 100%;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* ===== Tarjeta / Tabla ===== */
.card-monitoreo {
  margin: 1rem 0 2rem 0;
  padding: 0;
  background-color: #FFFFFF;
  border-radius: 12px;
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  width: 100%;
}

.card-monitoreo :deep(.v-card-text) {
  padding: 0 1.5rem 1.25rem;
  background-color: #FFFFFF;
  box-sizing: border-box;
}

.card-titulo {
  font-size: 1.125rem;
  font-weight: 600;
  color: #544F65;
  padding: 1rem 1.5rem 0.75rem;
  margin: 0;
  background-color: #FFFFFF;
  border-bottom: 1px solid #e5e7eb;
}

/* Contenedor compacto para tabla */
.table-container {
  overflow-x: auto;
  width: 100%;
  border-radius: 4px;
  margin-top: 1rem;
}

/* Tabla con letra más grande */
.tabla-monitoreo {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  background-color: #FFFFFF;
}

.tabla-monitoreo :deep(thead) { 
  background-color: #221A68; 
}

.tabla-monitoreo :deep(thead th) { 
  color: #fff !important; 
  font-weight: 600 !important; 
  font-size: 0.875rem !important;
  padding: 1rem 0.5rem !important;
  white-space: nowrap;
  border: none;
}

/* Columnas más compactas */
.columna-empleado {
  width: 140px !important;
  min-width: 140px !important;
  max-width: 140px !important;
  font-size: 0.875rem !important;
}

.columna-area {
  width: 120px !important;
  min-width: 120px !important;
  max-width: 120px !important;
  font-size: 0.875rem !important;
}

.tabla-acciones-header {
  width: 120px;
}

/* Filas con letra más grande y mejor espaciado */
.tabla-monitoreo :deep(tbody) { background-color: #FFFFFF; }
.tabla-monitoreo :deep(tbody tr:nth-child(odd)) { background-color: #FFFFFF; }
.tabla-monitoreo :deep(tbody tr:nth-child(even)) { background-color: #f8fafc; }
.tabla-monitoreo :deep(tbody td) {
  padding: 0.75rem 0.5rem !important;
  font-size: 0.875rem !important;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
  line-height: 1.4;
}

/* Celda de acciones centrada */
.action-cell {
  width: 120px !important;
  padding: 8px 4px !important;
}

.btn-wrapper {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
}

/* Estados condicionales */
.buen-estado {
  color: #10b981;
  font-weight: 600;
}

.estado-regular {
  color: #f59e0b;
  font-weight: 600;
}

.mal-estado {
  color: #ef4444;
  font-weight: 600;
}

.horas-positivas {
  color: #3b82f6;
  font-weight: 600;
}

/* Mensaje cuando no hay datos */
.no-data-message {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.no-data-message p {
  margin-top: 1rem;
  font-size: 1rem;
  font-weight: 500;
}

/* Snackbar personalizado */
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

/* ===== RESPONSIVE ===== */
@media (min-width: 1024px) {
  .repanalitico-content { 
    padding: 3rem;
  }
}

@media (max-width: 1200px) {
  .filtros-superiores {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.5rem;
  }
}

@media (max-width: 768px) {
  .repanalitico-content { 
    padding: 1rem;
  }
  
  .filtros-superiores { 
    grid-template-columns: 1fr; 
    gap: 0.5rem;
  }
  
  .card-monitoreo { 
    margin: 0.25rem 0 0.5rem 0;
  }
  
  .card-monitoreo :deep(.v-card-text) { 
    padding: 0 1rem 1rem; 
  }
  
  .card-titulo {
    padding: 0.75rem 1rem 0.5rem;
    font-size: 1rem;
  }
  
  .tabla-monitoreo {
    min-width: 800px;
  }
  
  .tabla-monitoreo :deep(thead th) { 
    padding: 0.6rem 0.4rem !important;
    font-size: 0.8rem !important;
  }
  
  .tabla-monitoreo :deep(tbody td) {
    padding: 0.6rem 0.4rem !important;
    font-size: 0.8rem !important;
  }
  
  .columna-empleado {
    width: 120px !important;
    min-width: 120px !important;
    max-width: 120px !important;
  }
  
  .columna-area {
    width: 100px !important;
    min-width: 100px !important;
    max-width: 100px !important;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .repanalitico-content { 
    padding: 0.5rem; 
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .tabla-monitoreo {
    min-width: 750px;
  }
  
  .columna-empleado {
    width: 100px !important;
    min-width: 100px !important;
    max-width: 100px !important;
  }
  
  .columna-area {
    width: 90px !important;
    min-width: 90px !important;
    max-width: 90px !important;
  }
  
  .no-data-message {
    padding: 2rem 0.5rem;
  }
  
  .no-data-message p {
    font-size: 0.9rem;
  }
}
</style>