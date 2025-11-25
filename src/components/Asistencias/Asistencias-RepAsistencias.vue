<template>
  <div class="reporteasistencias-content">
    <div class="content-inner">
      <h2 class="page-title">Informe de Asistencias</h2>
      
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

        <!-- Botón para generar reportes -->
        <v-btn
          color="#10b981"
          class="filter-btn btn-reporte"
          @click="generarReporteGeneral"
          :loading="generandoReporte"
          :disabled="generandoReporte || employeesFiltered.length === 0"
        >
          <v-icon left size="18">mdi-file-pdf</v-icon>
          {{ generandoReporte ? 'Generando...' : 'Generar Reporte' }}
        </v-btn>
      </div>

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
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>

      <!-- Detalle de asistencias -->
      <v-card class="card-registro" elevation="0">
        <h2 class="card-titulo">Detalle: {{ areaSeleccionada }} - {{ mesSeleccionado }}</h2>

        <!-- Leyenda de Estados debajo del encabezado -->
        <div class="leyenda-container">
          <h3 class="leyenda-titulo">Leyenda de Estados</h3>
          <div class="legend-items">
            <div class="legend-item">
              <span class="legend-color asistencia"></span>
              <span>A - Asistencia</span>
            </div>
            <div class="legend-item">
              <span class="legend-color retardo"></span>
              <span>R - Retardo</span>
            </div>
            <div class="legend-item">
              <span class="legend-color falta"></span>
              <span>F - Falta</span>
            </div>
            <div class="legend-item">
              <span class="legend-color incidencia"></span>
              <span>I - Incidencia</span>
            </div>
            <div class="legend-item">
              <span class="legend-color falta-justificada"></span>
              <span>FJ - Falta Justificada</span>
            </div>
            <div class="legend-item">
              <span class="legend-color dias-feriados"></span>
              <span>DF - Días Feriados</span>
            </div>
            <div class="legend-item">
              <span class="legend-color vacaciones"></span>
              <span>V - Vacaciones</span>
            </div>
          </div>
        </div>

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
                  <td class="text-center fixed-column fixed-cell">{{ formatRoleName(emp.puesto) }}</td>
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
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())
const selectedArea = ref('todas')
const searchTerm = ref('')
const busquedaError = ref(false)
const generandoReporte = ref(false)
const areas = ref([])

const snackbar = ref({ show: false, text: '', color: 'success' })
const mostrarMensaje = (texto, color = 'success') => {
  snackbar.value = { show: true, text: texto, color }
}

// Cargar datos iniciales
onMounted(async () => {
  await cargarAreas()
  await cargarDatos()
  await cargarDetalleInicial()
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

const cargarDetalleInicial = async () => {
  try {
    await cargarDetalleAsistencias({
      mes: Number(selectedMonth.value),
      anio: Number(selectedYear.value)
    })
  } catch (error) {
    console.error('Error al cargar detalle inicial:', error)
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
    faltInjustif: item.faltas_injustificadas || 0
  }))
})

const employeesData = computed(() => {
  if (!detalleAsistencias.value || detalleAsistencias.value.length === 0) return []

  return detalleAsistencias.value.map(emp => {
    const areaBD = emp.area || emp.area_nombre || emp.nombre_area || emp.areaName || emp.area_name || 'Sin área'

    return {
      empleado: emp.empleado || 'Sin nombre',
      puesto: emp.puesto || 'Sin puesto',
      area: areaBD,
      attendance: emp.attendance || []
    }
  })
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
  if (selectedArea.value !== 'todas') {
    const areaObj = areas.value.find(a => a.nombre.toLowerCase() === selectedArea.value)
    if (areaObj) {
      await cargarDetalleAsistencias({
        mes: Number(selectedMonth.value),
        anio: Number(selectedYear.value),
        area_id: areaObj.id
      })
    }
  } else {
    await cargarDetalleAsistencias({
      mes: Number(selectedMonth.value),
      anio: Number(selectedYear.value)
    })
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

// Validación de búsqueda 
const validarBusqueda = () => {
  const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
  if (searchTerm.value && !soloLetrasRegex.test(searchTerm.value)) {
    busquedaError.value = true
    searchTerm.value = searchTerm.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
  } else {
    busquedaError.value = false
  }
}

// Formatear nombre de puesto
const formatRoleName = (role) => {
  if (!role) return 'Sin puesto';
  const map = {
    'ADMIN': 'Admin',
    'EMPLEADO': 'Empleado',
    'JEFE_RH': 'Jefe de Recursos Humanos',
    'JEFE_AREA': 'Jefe de Área',
    'JEFE_ASISTENCIAS': 'Jefe de Asistencias',
    'JEFE_CONTRATOS': 'Jefe de Contratos',
    'JEFE_VACACIONES': 'Jefe de Vacaciones',
    'JEFE_INCIDENCIAS': 'Jefe de Incidencias'
  };
  return map[role] || role;
};

// Botón aplicar filtros
const aplicarFiltros = async () => {
  try {
    if (selectedArea.value !== 'todas') {
      const areaObj = areas.value.find(a => a.nombre.toLowerCase() === selectedArea.value)
      if (areaObj) {
        await cargarDetalleAsistencias({
          mes: Number(selectedMonth.value),
          anio: Number(selectedYear.value),
          area_id: areaObj.id
        })
      }
    } else {
      await cargarDetalleAsistencias({
        mes: Number(selectedMonth.value),
        anio: Number(selectedYear.value)
      })
    }
    
    const labelArea = selectedArea.value === 'todas' ? 'Todas las Áreas' : areaSeleccionada.value
    mostrarMensaje(`Filtros aplicados: ${labelArea} - ${mesSeleccionado.value}. Empleados encontrados: ${employeesFiltered.value.length}`)
  } catch (error) {
    console.error('Error al aplicar filtros:', error)
    mostrarMensaje('Error al aplicar filtros', 'error')
  }
}

// Generar reporte general según filtros aplicados
const generarReporteGeneral = async () => {
  generandoReporte.value = true
  try {
    mostrarMensaje('Generando reporte PDF...', 'info')

    if (employeesFiltered.value.length === 0) {
      mostrarMensaje('No hay datos para generar el reporte', 'warning')
      return
    }

    await generarPDFGeneral()

    mostrarMensaje('Reporte PDF generado exitosamente', 'success')
  } catch (error) {
    console.error('Error generando PDF:', error)
    mostrarMensaje('Error al generar el reporte PDF', 'error')
  } finally {
    generandoReporte.value = false
  }
}

const generarPDFGeneral = async () => {
  try {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const daysInMonth = new Date(selectedYear.value, selectedMonth.value, 0).getDate()

    // Colores
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

    // Encabezado
    pdf.setFontSize(16)
    pdf.setTextColor(...colors.primary)
    pdf.text(`Reporte de Asistencias - ${areaSeleccionada.value}`, 20, 20)

    pdf.setFontSize(12)
    pdf.setTextColor(...colors.gray)
    pdf.text(`Período: ${mesSeleccionado.value}`, 20, 28)
    pdf.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 34)
    pdf.text(`Total de empleados: ${employeesFiltered.value.length}`, 20, 40)

    let yPosition = 50

    // Resumen estadístico
    const estadisticas = calcularEstadisticas(employeesFiltered.value)

    pdf.setFillColor(...colors.primary)
    pdf.setTextColor(255, 255, 255)
    pdf.rect(20, yPosition, 250, 8, 'F')
    pdf.text('Resumen Estadístico', 22, yPosition + 6)

    yPosition += 15

    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(10)

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

    const headers = [
      'Empleado',
      'Puesto',
      'Área',
      ...Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString())
    ]
    const columnWidths = [45, 40, 30, ...Array(daysInMonth).fill(4.5)]

    let xPosition = 20

    // Encabezados
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

    // Filas
    employeesFiltered.value.forEach((emp, empIndex) => {
      if (yPosition > 180 && empIndex < employeesFiltered.value.length - 1) {
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

      pdf.setFillColor(empIndex % 2 === 0 ? 255 : 245, 255, 255)
      pdf.rect(20, yPosition, 250, 6, 'F')

      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(6)

      pdf.text(emp.empleado.substring(0, 20), xPosition + 2, yPosition + 4)
      xPosition += columnWidths[0]

      pdf.text(formatRoleName(emp.puesto).substring(0, 15), xPosition + 2, yPosition + 4)
      xPosition += columnWidths[1]

      pdf.text(emp.area.substring(0, 10), xPosition + 2, yPosition + 4)
      xPosition += columnWidths[2]

      const asistencias = emp.attendance || []
      for (let day = 1; day <= daysInMonth; day++) {
        const att = asistencias[day - 1]

        const cellWidth = columnWidths[3]
        const cellHeight = 6
        const badgeWidth = cellWidth - 1.2
        const badgeHeight = 4.2
        const badgeX = xPosition + (cellWidth - badgeWidth) / 2
        const badgeY = yPosition + (cellHeight - badgeHeight) / 2
        const radius = 1.2

        let fillColor
        switch (att) {
          case 'A': fillColor = colors.success; break
          case 'R': fillColor = colors.warning; break
          case 'F': fillColor = colors.error; break
          case 'I': fillColor = colors.purple; break
          case 'FJ': fillColor = colors.info; break
          case 'DF': fillColor = colors.gray; break
          case 'V': fillColor = colors.pink; break
          default:  fillColor = [255, 255, 255]
        }

        if (!att) {
          pdf.setFillColor(255, 255, 255)
          pdf.setDrawColor(230, 230, 230)
          pdf.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, radius, radius, 'S')
        } else {
          pdf.setFillColor(...fillColor)
          pdf.setDrawColor(255, 255, 255)
          pdf.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, radius, radius, 'FD')
        }

        let textoColor
        if (['A', 'FJ', 'V', 'I'].includes(att)) {
          textoColor = [255, 255, 255]
        } else if (!att) {
          textoColor = [200, 200, 200]
        } else {
          textoColor = [0, 0, 0]
        }

        pdf.setFontSize(5.5)
        pdf.setTextColor(...textoColor)
        pdf.text(att || '-', badgeX + badgeWidth / 2, badgeY + badgeHeight / 2 + 1.3, {
          align: 'center'
        })

        xPosition += cellWidth
      }
      yPosition += 6
    })

    // Leyenda
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
    ]

    let xLeyenda = 20
    leyendas.forEach((leyenda) => {
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
      pdf.text(
        `Página ${i} de ${totalPages} - Generado el ${new Date().toLocaleDateString('es-ES')}`,
        20,
        200
      )
    }

    const nombreArchivo = searchTerm.value.trim() !== '' && employeesFiltered.value.length === 1
      ? `reporte-${employeesFiltered.value[0].empleado.toLowerCase().replace(/\s+/g, '-')}-${selectedMonth.value}.pdf`
      : `reporte-${areaSeleccionada.value.toLowerCase().replace(/\s+/g, '-')}-${selectedMonth.value}.pdf`

    pdf.save(nombreArchivo)
  } catch (error) {
    throw error
  }
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
        if (dia) {
          totalDias++
          switch (dia) {
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
  flex-wrap: nowrap;
  gap: 1rem;
  width: 85%;
  padding: 0;
  box-sizing: border-box;
  margin-bottom: 1rem;
}

.filter-select {
  width: 100px;
}

.filter-btn {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0;
}

.btn-reporte {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: white !important;
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0;
}

.btn-reporte:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4) !important;
}

/* Cards */
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

/* Leyenda Container */
.leyenda-container {
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin: 0 1.5rem 1rem;
  border: 1px solid #e5e7eb;
}

.leyenda-titulo {
  font-size: 1rem;
  font-weight: 600;
  color: #544F65;
  margin-bottom: 0.75rem;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;
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
.sin-registro { 
  background-color: #f3f4f6; 
  border: 1px solid #d1d5db;
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
  width: 80%;
  flex-wrap: nowrap;
  justify-content: flex-start;
}

.filter-select-monitor {
  min-width: 150px;
  flex: 1;
}

.search-input-monitor {
  min-width: 300px;
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

  .btn-reporte {
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