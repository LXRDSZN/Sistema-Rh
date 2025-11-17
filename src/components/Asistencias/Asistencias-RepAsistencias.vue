<template>
  <div class="reporteasistencias-content">
    <div class="content-inner">
      <h2 class="page-title">Reporte de Asistencias</h2>
      
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
                <td class="text-center action-cell">
                  <div class="btn-wrapper">
                    <v-btn
                      class="btn-generar"
                      size="small"
                      @click="generarReporte(item)"
                      :loading="generandoPdf"
                      :disabled="generandoPdf"
                    >
                      <v-icon left size="16">mdi-file-pdf</v-icon>
                      {{ generandoPdf ? 'Generando...' : 'Generar Reporte' }}
                    </v-btn>
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>

      <!-- Detalle de asistencias -->
      <v-card class="card-registro" elevation="0">
        <h2 class="card-titulo">Detalle: {{ areaSeleccionada }} - {{ mesSeleccionado }}</h2>

        <v-card-text>
          <div class="table-container">
            <v-table class="tabla-registro detail-table">
              <thead>
                <tr>
                  <th class="text-center fixed-column fixed-header">Empleado</th>
                  <th class="text-center fixed-column fixed-header">Puesto</th>
                  <th class="text-center fixed-column fixed-header">Área</th>
                  <th 
                    v-for="day in diasEnMes" 
                    :key="day" 
                    class="text-center day-column"
                  >
                    {{ day }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(emp, empIndex) in employeesFiltered" :key="empIndex">
                  <td class="text-center fixed-column fixed-cell">{{ emp.empleado }}</td>
                  <td class="text-center fixed-column fixed-cell">{{ emp.puesto }}</td>
                  <td class="text-center fixed-column fixed-cell">{{ emp.area }}</td>
                  <td 
                    v-for="day in diasEnMes" 
                    :key="day" 
                    class="text-center day-column"
                  >
                    <div 
                      v-if="emp.attendance && emp.attendance[day - 1]" 
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
import jsPDF from 'jspdf'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Composable
const {
  reporteAsistencias,
  detalleAsistencias,
  loading,
  cargarReporteAsistencias,
  cargarDetalleAsistencias
} = useAsistencias()

// Estados
const selectedMonth = ref(new Date().getMonth() + 1) // Mes actual
const selectedYear = ref(new Date().getFullYear())
const selectedArea = ref('todas')
const searchTerm = ref('')
const busquedaError = ref(false)
const generandoPdf = ref(false)
const areas = ref([])

const snackbar = ref({ show: false, text: '', color: 'success' })
const mostrarMensaje = (texto, color = 'success') => {
  snackbar.value = { show: true, text: texto, color }
}

// Cargar datos iniciales
onMounted(async () => {
  await cargarAreas()
  await cargarDatos()
})

const cargarAreas = async () => {
  try {
    const response = await axios.get(`${API_URL}/areas`, { withCredentials: true })
    areas.value = response.data.data || response.data || []
  } catch (error) {
    console.error('Error al cargar áreas:', error)
  }
}

const cargarDatos = async () => {
  try {
    const filtros = {
      mes: selectedMonth.value,
      anio: selectedYear.value,
      area: selectedArea.value !== 'todas' ? selectedArea.value : undefined
    }
    await cargarReporteAsistencias(filtros)
  } catch (error) {
    console.error('Error al cargar reporte:', error)
    mostrarMensaje('Error al cargar datos', 'error')
  }
}

// Items para selects
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

const areasItems = computed(() => [
  { title: 'Todas las Áreas', value: 'todas' },
  ...areas.value.map(area => ({ title: area.nombre, value: area.nombre.toLowerCase() }))
])

const summaryData = computed(() => {
  if (!reporteAsistencias.value?.resumenAreas) return []
  return reporteAsistencias.value.resumenAreas.map(item => ({
    area: item.area,
    totalEmpleados: item.total_empleados || 0,
    asistencia: `${item.porcentaje_asistencia || 0}%`,
    retardos: item.retardos || 0,
    faltJustif: item.faltas_justificadas || 0,
    faltInjustif: item.faltas_injustificadas || 0,
    area_id: item.id
  }))
})

const employeesData = computed(() => {
  if (!detalleAsistencias.value || detalleAsistencias.value.length === 0) return []
  return detalleAsistencias.value.map(emp => ({
    empleado: emp.empleado,
    puesto: emp.puesto || 'Sin puesto',
    area: selectedArea.value !== 'todas' ? selectedArea.value : emp.area,
    attendance: emp.attendance || []
  }))
})

const areaSeleccionada = computed(() => {
  return areasItems.value.find(a => a.value === selectedArea.value)?.title || 'Todas las Áreas'
})

const mesSeleccionado = computed(() => {
  return monthsItems.value.find(m => m.value === selectedMonth.value)?.title || ''
})

const diasEnMes = computed(() => {
  const year = selectedYear.value
  const month = selectedMonth.value
  const daysInMonth = new Date(year, month, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => i + 1)
})

const employeesFiltered = computed(() => {
  let resultado = [...employeesData.value]
  
  // Filtro por búsqueda
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    resultado = resultado.filter(emp =>
      emp.empleado.toLowerCase().includes(search) ||
      emp.puesto.toLowerCase().includes(search) ||
      emp.area.toLowerCase().includes(search)
    )
  }
  
  return resultado
})

// Watch para recargar datos cuando cambien filtros
watch([selectedMonth, selectedYear, selectedArea], async () => {
  await cargarDatos()
  // Cargar detalle si hay un área específica seleccionada
  if (selectedArea.value !== 'todas') {
    const areaObj = areas.value.find(a => a.nombre.toLowerCase() === selectedArea.value)
    if (areaObj) {
      await cargarDetalleAsistencias({
        mes: selectedMonth.value,
        anio: selectedYear.value,
        area_id: areaObj.id
      })
    }
  }
})

const getStatusClass = (status) => {
  const classes = {
    'A': 'status-asistencia',
    'R': 'status-retardo',
    'F': 'status-falta',
    'I': 'status-incidencia',
    'FJ': 'status-falta-justificada',
    'DF': 'status-dias-feriados',
    'V': 'status-vacaciones',
  }
  return classes[status] || ''
}

const calcularEstadisticas = (empleados) => {
  let totalAsistencias = 0
  let totalDias = 0
  let totalRetardos = 0
  let totalFaltasJustificadas = 0
  let totalFaltasInjustificadas = 0
  let totalIncidencias = 0
  let totalDiasFeriados = 0
  let totalVacaciones = 0

  empleados.forEach(emp => {
    if (emp.attendance) {
      emp.attendance.forEach(dia => {
        if (dia) { // Solo contar si hay dato
          totalDias++
          switch(dia) {
            case 'A': totalAsistencias++; break
            case 'R': totalRetardos++; break
            case 'F': totalFaltasInjustificadas++; break
            case 'FJ': totalFaltasJustificadas++; break
            case 'I': totalIncidencias++; break
            case 'DF': totalDiasFeriados++; break
            case 'V': totalVacaciones++; break
          }
        }
      })
    }
  })

  const asistenciaPromedio = totalDias > 0 
    ? `${Math.round((totalAsistencias / totalDias) * 100)}%`
    : '0%'

  return {
    asistenciaPromedio,
    totalRetardos,
    totalFaltasJustificadas,
    totalFaltasInjustificadas,
    totalIncidencias,
    totalDiasFeriados,
    totalVacaciones
  }
}

// Validación de búsqueda 
const validarBusqueda = () => {
  const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
  if (searchTerm.value && !soloLetrasRegex.test(searchTerm.value)) {
    busquedaError.value = true
    // Remover caracteres no válidos
    searchTerm.value = searchTerm.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
  } else {
    busquedaError.value = false
  }
}

const aplicarFiltros = () => {
  const area = selectedArea.value.toLowerCase()

  // Filtrar resumen por área
  summaryData.value = area === 'todas'
    ? [...originalSummaryData]
    : originalSummaryData.filter(a => a.area.toLowerCase() === area)

  const labelArea = area === 'todas' ? 'Todas las Áreas' : areaSeleccionada.value
  mostrarMensaje(`Filtros aplicados: ${labelArea} - ${mesSeleccionado.value}. Empleados encontrados: ${employeesFiltered.value.length}`)
}

const generarReporte = async (row) => {
  generandoPdf.value = true
  try {
    mostrarMensaje(`Generando reporte PDF para: ${row.area}...`, 'info')
    
    // Crear PDF
    await generarPDF(row)
    
    mostrarMensaje(`Reporte PDF generado exitosamente para: ${row.area}`, 'success')
  } catch (error) {
    console.error('Error generando PDF:', error)
    mostrarMensaje('Error al generar el reporte PDF', 'error')
  } finally {
    generandoPdf.value = false
  }
}

const generarPDF = async (row) => {
  return new Promise((resolve, reject) => {
    try {
      // Nuevo PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })

      // Configuración de colores
      const colors = {
        primary: [34, 26, 104],
        secondary: [94, 71, 255],
        success: [16, 185, 129],
        warning: [245, 158, 11],
        error: [239, 68, 68],
        info: [59, 130, 246],
        gray: [107, 114, 128],
        pink: [236, 72, 153],
        purple: [139, 92, 246]
      }

      // Encabezado del reporte
      pdf.setFontSize(16)
      pdf.setTextColor(...colors.primary)
      pdf.text(`Reporte de Asistencias - ${row.area}`, 20, 20)
      
      pdf.setFontSize(12)
      pdf.setTextColor(...colors.gray)
      pdf.text(`Período: ${mesSeleccionado.value}`, 20, 28)
      pdf.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 34)
      pdf.text(`Total de empleados en el área: ${employeesFiltered.value.length}`, 20, 40)

      let yPosition = 50

      // Resumen estadístico dinámico
      pdf.setFillColor(...colors.primary)
      pdf.setTextColor(255, 255, 255)
      pdf.rect(20, yPosition, 250, 8, 'F')
      pdf.text('Resumen Estadístico del Área', 22, yPosition + 6)

      yPosition += 15

      // Calcular estadísticas dinámicas desde los datos filtrados
      const estadisticas = calcularEstadisticas(employeesFiltered.value)

      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(10)
      
      // Datos del resumen - dinámicos
      const datosResumen = [
        { label: 'Total Empleados:', valor: employeesFiltered.value.length.toString() },
        { label: '% Asistencia Promedio:', valor: estadisticas.asistenciaPromedio },
        { label: 'Total Retardos:', valor: estadisticas.totalRetardos.toString() },
        { label: 'Total Faltas Justificadas:', valor: estadisticas.totalFaltasJustificadas.toString() },
        { label: 'Total Faltas Injustificadas:', valor: estadisticas.totalFaltasInjustificadas.toString() },
        { label: 'Total Incidencias:', valor: estadisticas.totalIncidencias.toString() },
        { label: 'Total Días Feriados:', valor: estadisticas.totalDiasFeriados.toString() },
        { label: 'Total Vacaciones:', valor: estadisticas.totalVacaciones.toString() }
      ]

      datosResumen.forEach((dato, index) => {
        const y = yPosition + (index * 6)
        pdf.setFont(undefined, 'bold')
        pdf.text(dato.label, 22, y)
        pdf.setFont(undefined, 'normal')
        pdf.text(dato.valor, 85, y)
      })

      yPosition += 60

      // Detalle de asistencias
      pdf.setFillColor(...colors.primary)
      pdf.setTextColor(255, 255, 255)
      pdf.rect(20, yPosition, 250, 8, 'F')
      pdf.text('Detalle de Asistencias por Empleado', 22, yPosition + 6)

      yPosition += 15

      // Encabezados de la tabla adaptativos
      const headers = ['Empleado', 'Puesto', 'Área', ...Array.from({length: diasEnMes.value}, (_, i) => (i + 1).toString())]
      const columnWidths = [45, 40, 30, ...Array(diasEnMes.value).fill(4.5)]
      
      let xPosition = 20
      
      // Dibujar encabezados
      headers.forEach((header, index) => {
        pdf.setFillColor(...colors.primary)
        pdf.rect(xPosition, yPosition, columnWidths[index], 8, 'F')
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(6)
        
        if (index < 3) {
          pdf.text(header.substring(0, 15), xPosition + 2, yPosition + 5)
        } else {
          pdf.text(header, xPosition + columnWidths[index] / 2, yPosition + 5, { align: 'center' })
        }
        
        xPosition += columnWidths[index]
      })

      yPosition += 8

      // Datos de empleados
      const empleadosParaPDF = employeesFiltered.value

      empleadosParaPDF.forEach((emp, empIndex) => {
        // Control de paginación
        if (yPosition > 180 && empIndex < empleadosParaPDF.length - 1) {
          pdf.addPage()
          yPosition = 20
          
          // Redibujar encabezados
          xPosition = 20
          headers.forEach((header, index) => {
            pdf.setFillColor(...colors.primary)
            pdf.rect(xPosition, yPosition, columnWidths[index], 8, 'F')
            pdf.setTextColor(255, 255, 255)
            pdf.setFontSize(6)
            
            if (index < 3) {
              pdf.text(header.substring(0, 15), xPosition + 2, yPosition + 5)
            } else {
              pdf.text(header, xPosition + columnWidths[index] / 2, yPosition + 5, { align: 'center' })
            }
            
            xPosition += columnWidths[index]
          })
          yPosition += 8
        }

        xPosition = 20
        
        // Fondo alternado para mejor legibilidad
        pdf.setFillColor(empIndex % 2 === 0 ? 255 : 245, 255, 255)
        pdf.rect(20, yPosition, 250, 6, 'F')
        
        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(6)
        
        // Información del empleado
        pdf.text(emp.empleado.substring(0, 20), xPosition + 2, yPosition + 4)
        xPosition += columnWidths[0]
        
        pdf.text(emp.puesto.substring(0, 15), xPosition + 2, yPosition + 4)
        xPosition += columnWidths[1]
        
        pdf.text(emp.area.substring(0, 10), xPosition + 2, yPosition + 4)
        xPosition += columnWidths[2]
        
        // Asistencias
        const asistencias = emp.attendance || []
        for (let day = 1; day <= diasEnMes.value; day++) {
          const att = asistencias[day - 1]
          let color
          
          switch(att) {
            case 'A': color = colors.success; break
            case 'R': color = colors.warning; break
            case 'F': color = colors.error; break
            case 'I': color = colors.purple; break
            case 'FJ': color = colors.info; break
            case 'DF': color = colors.gray; break
            case 'V': color = colors.pink; break
            default: color = [240, 240, 240] // Sin dato
          }
          
          pdf.setFillColor(...color)
          pdf.rect(xPosition, yPosition, columnWidths[3], 6, 'F')
          
          // Color del texto según el fondo
          const textoColor = (att === 'A' || att === 'FJ' || att === 'V') ? [255, 255, 255] : [0, 0, 0]
          pdf.setTextColor(...textoColor)
          pdf.text(att || '-', xPosition + columnWidths[3] / 2, yPosition + 4, { align: 'center' })
          
          xPosition += columnWidths[3]
        }
        
        yPosition += 6
      })

      // Leyenda de estados
      yPosition += 10
      pdf.setFontSize(8)
      pdf.setTextColor(...colors.primary)
      pdf.text('Leyenda de Estados:', 20, yPosition)
      
      yPosition += 6
      const leyendas = [
        { texto: 'A - Asistencia', color: colors.success },
        { texto: 'R - Retardo', color: colors.warning },
        { texto: 'F - Falta', color: colors.error },
        { texto: 'I - Incidencia', color: colors.purple },
        { texto: 'FJ - Falta Justificada', color: colors.info },
        { texto: 'DF - Días Feriados', color: colors.gray },
        { texto: 'V - Vacaciones', color: colors.pink },
        { texto: '- - Sin registro', color: [240, 240, 240] }
      ]
      
      let xLeyenda = 20
      leyendas.forEach((leyenda, index) => {
        if (xLeyenda > 180) {
          xLeyenda = 20
          yPosition += 8
        }
        
        pdf.setFillColor(...leyenda.color)
        pdf.rect(xLeyenda, yPosition, 4, 4, 'F')
        pdf.setTextColor(0, 0, 0)
        pdf.text(leyenda.texto, xLeyenda + 6, yPosition + 3)
        
        xLeyenda += 45
      })

      // Pie de página
      const totalPages = pdf.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setTextColor(...colors.gray)
        pdf.text(`Página ${i} de ${totalPages} - Generado el ${new Date().toLocaleDateString('es-ES')}`, 20, 200)
      }

      // Guardar PDF
      pdf.save(`reporte-asistencias-${row.area.toLowerCase().replace(/\s+/g, '-')}-${selectedMonth.value}.pdf`)
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}
</script>

<style scoped>
.reporteasistencias-content {
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

/* Input con error (solo borde rojo) */
.input-error :deep(.v-field) {
  border-color: #ef4444 !important;
}

/* Filtros superiores */
.filtros-superiores {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
  max-width: 1000px;
  padding: 0;
  box-sizing: border-box;
  margin-bottom: 1rem;
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
  width: 180px;
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

/* Tabla de detalle */
.table-container {
  overflow-x: auto;
  max-width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  position: relative;
}

.detail-table {
  min-width: 1400px;
  border-collapse: separate;
  border-spacing: 0;
}

/*HEADER */
.fixed-header {
  position: sticky;
  left: 0;
  background-color: #221A68 !important;
  color: white !important;
  z-index: 3;
  min-width: 150px;
  border-right: 2px solid #1a144f !important;
}

.fixed-header:nth-child(1) { left: 0; }
.fixed-header:nth-child(2) { left: 150px; }
.fixed-header:nth-child(3) { left: 300px; }

/* CELDAS */
.fixed-cell {
  position: sticky;
  left: 0;
  background-color: inherit;
  z-index: 2;
  min-width: 150px;
  border-right: 2px solid #e5e7eb;
}

/* Posicionamiento específico para cada columna fija */
.fixed-cell:nth-child(1) { 
  left: 0; 
  background-color: #ffffff;
}
.fixed-cell:nth-child(2) { 
  left: 150px; 
  background-color: #ffffff;
}
.fixed-cell:nth-child(3) { 
  left: 300px; 
  background-color: #ffffff;
}

/* Filas pares - ajustar colores de fondo para columnas fijas */
.tabla-registro :deep(tbody tr:nth-child(even) .fixed-cell:nth-child(1)) {
  background-color: #f8fafc;
}
.tabla-registro :deep(tbody tr:nth-child(even) .fixed-cell:nth-child(2)) {
  background-color: #f8fafc;
}
.tabla-registro :deep(tbody tr:nth-child(even) .fixed-cell:nth-child(3)) {
  background-color: #f8fafc;
}

.day-column {
  min-width: 50px;
  max-width: 50px;
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

/* BOTÓN GENERAR REPORTE */
.action-cell {
  width: 180px !important;
  padding: 8px 4px !important;
}

.btn-wrapper {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
}

.btn-generar {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: white !important;
  text-transform: none !important;
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  height: 36px !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
  margin: 0 auto !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 16px !important;
  min-width: 160px !important;
  box-shadow: none !important;
  letter-spacing: normal !important;
}

.btn-generar :deep(.v-btn__content) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  gap: 6px !important;
}

.btn-generar :deep(.v-icon) {
  margin: 0 !important;
  margin-right: 6px !important;
  font-size: 16px !important;
}

.btn-generar:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4) !important;
  transform: translateY(-1px) !important;
}

.btn-generar:active {
  transform: translateY(0) !important;
  box-shadow: 0 1px 2px rgba(16, 185, 129, 0.3) !important;
}

.btn-generar:disabled {
  background: #9ca3af !important;
  box-shadow: none !important;
  transform: none !important;
  cursor: not-allowed !important;
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

/* Filtros de monitoreo */
.filtros-monitoreo {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
  width: 100%;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.filter-select-monitor {
  min-width: 150px;
  flex: 1;
}

.search-input-monitor {
  min-width: 400px;
  flex: 2;
}

/* Responsive */
@media (min-width: 1024px) {
  .reporteasistencias-content {
    padding: 3rem;
  }
}

@media (max-width: 768px) {
  .reporteasistencias-content {
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

  .btn-generar {
    width: 100%;
  }

  .fixed-header,
  .fixed-cell {
    min-width: 120px;
  }

  .fixed-header:nth-child(2) { left: 120px; }
  .fixed-header:nth-child(3) { left: 240px; }
  .fixed-cell:nth-child(2) { left: 120px; }
  .fixed-cell:nth-child(3) { left: 240px; }
}
</style>