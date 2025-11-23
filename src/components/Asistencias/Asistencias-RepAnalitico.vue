<template>
  <div class="repanalitico-content">
    <div class="content-inner">
      <h2 class="page-title">Informe Analítico</h2>

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

        <!-- CAMBIO: filtro por ÁREA -->
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

        <v-btn
          color="#312e81"
          class="filter-btn"
          @click="generarReporte"
        >
          Generar Reporte
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
              <div class="stat-card">
                <div class="stat-value">{{ estadisticas.promedioAsistencia }}%</div>
                <div class="stat-label">Asistencia Promedio</div>
              </div>

              <div class="stat-card">
                <div class="stat-value">{{ estadisticas.totalRetardos }}</div>
                <div class="stat-label">Total Retardos</div>
              </div>

              <div class="stat-card">
                <div class="stat-value">{{ estadisticas.totalFaltas }}</div>
                <div class="stat-label">Total Faltas Injustificadas</div>
              </div>

              <div class="stat-card">
                <div class="stat-value">{{ estadisticas.totalHorasExtra }}</div>
                <div class="stat-label">Horas Extra</div>
              </div>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Tabla Analítica -->
      <v-card class="card-monitoreo" elevation="0">
        <h2 class="card-titulo">Datos Analíticos por Empleado</h2>
        <v-card-text>
          <v-table class="tabla-monitoreo">
            <thead>
              <tr>
                <th class="text-center">Empleado</th>
                <th class="text-center">Área</th>
                <th class="text-center">Días Trabajados</th>
                <th class="text-center">Retardos</th>
                <th class="text-center">Falt. Justif.</th>
                <th class="text-center">Falt. Injustif.</th>
                <th class="text-center">Incidencias</th>
                <th class="text-center">Horas Extra</th>
                <th class="text-center">D. Fdos. Trabajados</th>
              </tr>
            </thead>
            <tbody>
              <!-- Estado de carga -->
              <tr v-if="loading">
                <td colspan="8" class="text-center py-8">
                  <v-progress-circular indeterminate color="#5E47FF" size="40"></v-progress-circular>
                  <p class="mt-4 text-grey">Cargando datos...</p>
                </td>
              </tr>
              
              <!-- Sin resultados -->
              <tr v-else-if="analyticsData.length === 0">
                <td colspan="8" class="text-center py-8">
                  <v-icon size="64" color="#9ca3af">mdi-account-search-outline</v-icon>
                  <p class="mt-4 text-grey-darken-1 font-weight-medium">No se encontraron empleados</p>
                  <p class="text-grey text-caption">Abre la consola (F12) para ver logs de depuración</p>
                  <p class="text-grey text-caption">reporteAnalitico: {{ reporteAnalitico ? 'SÍ tiene datos' : 'NULL' }}</p>
                  <p class="text-grey text-caption">analyticsData.length: {{ analyticsData.length }}</p>
                </td>
              </tr>
              
              <!-- Datos -->
              <tr v-else v-for="(item, index) in analyticsData" :key="index">
                <td class="text-center">{{ item.empleado }}</td>
                <td class="text-center">{{ item.area || 'N/A' }}</td>
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
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </div>

        <!-- Diálogo Detalle Empleado -->
    <v-dialog
      v-model="dialogDetalle"
      max-width="520"
    >
      <v-card>
        <v-card-title class="detalle-title">
          <div class="detalle-header">
            <div class="detalle-nombre">
              {{ empleadoSeleccionado?.empleado || 'Empleado' }}
            </div>
            <div class="detalle-periodo">
              {{ mesSeleccionado }}
            </div>
          </div>
        </v-card-title>

        <v-card-text>
          <v-row dense>
            <v-col cols="12" sm="6">
              <p class="detalle-label">Días trabajados</p>
              <p class="detalle-value">{{ empleadoSeleccionado?.diasTrabajados }}</p>
            </v-col>

            <v-col cols="12" sm="6">
              <p class="detalle-label">Retardos</p>
              <p class="detalle-value">{{ empleadoSeleccionado?.retardos }}</p>
            </v-col>

            <v-col cols="12" sm="6">
              <p class="detalle-label">Faltas justificadas</p>
              <p class="detalle-value">{{ empleadoSeleccionado?.faltJustif }}</p>
            </v-col>

            <v-col cols="12" sm="6">
              <p class="detalle-label">Faltas injustificadas</p>
              <p class="detalle-value">{{ empleadoSeleccionado?.faltInjustif }}</p>
            </v-col>

            <v-col cols="12" sm="6">
              <p class="detalle-label">Incidencias</p>
              <p class="detalle-value">{{ empleadoSeleccionado?.incidencias }}</p>
            </v-col>

            <v-col cols="12" sm="6">
              <p class="detalle-label">Horas extra</p>
              <p class="detalle-value">{{ empleadoSeleccionado?.horasExtra }}</p>
            </v-col>

            <v-col cols="12" sm="6">
              <p class="detalle-label">Días festivos trabajados</p>
              <p class="detalle-value">{{ empleadoSeleccionado?.dFdosTrabajados }}</p>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="dialogDetalle = false">
            Cerrar
          </v-btn>
          <v-btn
            color="success"
            variant="flat"
            @click="descargarDetalle(empleadoSeleccionado)"
          >
            <v-icon left size="18">mdi-file-pdf</v-icon>
            Descargar PDF
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { ref, computed, onMounted, watch } from 'vue'
import { useAsistencias } from '@/composables/useAsistencias'
import jsPDF from 'jspdf'   //  IMPORT jsPDF

// Composable
const { reporteAnalitico, loading, cargarReporteAnalitico } = useAsistencias()

// Estados
// 🔄 CAMBIO: Usar octubre 2025 por defecto (mes con más probabilidad de tener datos)
const selectedMonth = ref(10)  // Octubre
const selectedYear = ref(2025)

// CAMBIO: ahora usamos selectedArea en vez de selectedType
const selectedArea = ref(null)
const searchTerm = ref('')
const mostrarStats = ref(false)

// Diálogo detalle
const dialogDetalle = ref(false)
const empleadoSeleccionado = ref(null)


// filtros aplicados (para que solo cambie al dar clic en Aplicar Filtro)
const filtrosAplicados = ref({
  searchTerm: '',
  area: null
})

// Snackbar
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const mostrarMensaje = (texto, color = 'success') => {
  snackbar.value = { show: true, text: texto, color }
}

// Cargar datos iniciales
onMounted(async () => {
  await cargarDatos()
})

const cargarDatos = async () => {
  try {
    const filtros = {
      mes: selectedMonth.value,
      anio: selectedYear.value
    }
    await cargarReporteAnalitico(filtros)
  } catch (error) {
    console.error('Error al cargar reporte analítico:', error)
    mostrarMensaje('Error al cargar datos', 'error')
  }
}

// Items para selects
const monthsItems = computed(() => {
  const meses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ]
  return meses.map((mes, index) => ({
    title: `${mes} ${selectedYear.value}`,
    value: index + 1
  }))
})

//  Nombre del mes seleccionado (para usar en el PDF)
const mesSeleccionado = computed(() => {
  return monthsItems.value.find(m => m.value === selectedMonth.value)?.title || ''
})

// CAMBIO: items de áreas (según tu imagen)
const areasItems = [
  { title: 'Todas las Áreas', value: 'todas' },
  { title: 'Contratos',   value: 'Contratos' },
  { title: 'Asistencias', value: 'Asistencias' },
  { title: 'Vacaciones',  value: 'Vacaciones' },
  { title: 'Incidencias', value: 'Incidencias' },
  { title: 'Areas',       value: 'Areas' }
]

// Data
const analyticsData = computed(() => {
  if (!reporteAnalitico.value) {
    console.log('⚠️ reporteAnalitico.value es null/undefined')
    return []
  }

  // El backend retorna { estadisticas: {...}, empleados: [...] }
  let resultado = Array.isArray(reporteAnalitico.value)
    ? reporteAnalitico.value
    : (reporteAnalitico.value.empleados || [])

  // 🔍 LOG: Ver datos crudos del backend
  console.log('📥 Datos recibidos del backend:', {
    total: resultado.length,
    primerEmpleado: resultado[0],
    primerEmpleadoCompleto: JSON.parse(JSON.stringify(resultado[0])),
    todosLosNombres: resultado.map(e => e.empleado || e.nombre)
  })

  // mapeo base
  resultado = resultado.map(emp => ({
    empleado: emp.empleado || 'N/A',
    area: emp.area || emp.area_nombre || emp.departamento || 'N/A',

    //  Forzamos a número todos los campos numéricos
    diasTrabajados: Number(emp.dias_trabajados) || 0,
    retardos: Number(emp.retardos) || 0,
    faltJustif: Number(emp.faltas_justificadas) || 0,
    faltInjustif: Number(emp.faltas_injustificadas) || 0,
    incidencias: Number(emp.incidencias) || 0,
    horasExtra: Number(emp.horas_extra) || 0,
    dFdosTrabajados: Number(emp.dias_festivos_trabajados) || 0,

    empleado_id: emp.empleado_id
  }))

  // 🔍 LOG: Ver datos después del mapeo
  console.log('✅ Datos mapeados:', {
    total: resultado.length,
    primerEmpleadoMapeado: resultado[0],
    empleados: resultado.map(e => e.empleado)
  })

  // Filtro búsqueda
  if (filtrosAplicados.value.searchTerm) {
    const search = filtrosAplicados.value.searchTerm.toLowerCase()
    const antesDeFiltar = resultado.length
    resultado = resultado.filter(emp =>
      emp.empleado.toLowerCase().includes(search)
    )
    console.log(`🔍 Búsqueda "${search}": ${antesDeFiltar} → ${resultado.length} empleados`)
  }

  // Filtro área
  if (filtrosAplicados.value.area && filtrosAplicados.value.area !== 'todas') {
    const antesDeFiltar = resultado.length
    resultado = resultado.filter(emp => emp.area === filtrosAplicados.value.area)
    console.log(`📍 Filtro área "${filtrosAplicados.value.area}": ${antesDeFiltar} → ${resultado.length} empleados`)
  }

  console.log('🎯 RESULTADO FINAL analyticsData:', resultado.length, 'empleados')
  return resultado
})

// Watch para recargar datos cuando cambien filtros de fecha
watch([selectedMonth, selectedYear], async () => {
  await cargarDatos()
})

// Computed - Estadísticas (calculadas dinámicamente)
const estadisticas = computed(() => {
  if (!analyticsData.value || analyticsData.value.length === 0) {
    return {
      promedioAsistencia: '0.0',
      totalRetardos: 0,
      totalFaltas: 0,
      totalHorasExtra: 0
    }
  }

  const totalEmpleados = analyticsData.value.length
  
  // Sumar todos los días trabajados de todos los empleados
  const totalDiasTrabajados = analyticsData.value
    .reduce((sum, emp) => sum + Number(emp.diasTrabajados || 0), 0)
  
  // Sumar retardos
  const totalRetardos = analyticsData.value
    .reduce((sum, emp) => sum + Number(emp.retardos || 0), 0)
  
  // Sumar solo faltas injustificadas (NO incluir justificadas)
  const totalFaltas = analyticsData.value
    .reduce((sum, emp) => sum + Number(emp.faltInjustif || 0), 0)
  
  // Sumar horas extra
  const totalHorasExtra = analyticsData.value
    .reduce((sum, emp) => sum + Number(emp.horasExtra || 0), 0)

  // Calcular días hábiles del mes (excluyendo fines de semana)
  const year = selectedYear.value
  const month = selectedMonth.value // 1-12
  // Para obtener días del mes: new Date(year, month, 0) da el último día del mes indicado
  // Ejemplo: new Date(2025, 11, 0) = 30 de noviembre (correcto)
  const diasEnMes = new Date(year, month, 0).getDate()
  
  let diasHabiles = 0
  for (let dia = 1; dia <= diasEnMes; dia++) {
    // month - 1 porque Date espera 0-11
    const fecha = new Date(year, month - 1, dia)
    const diaSemana = fecha.getDay()
    // 0 = Domingo, 6 = Sábado
    if (diaSemana !== 0 && diaSemana !== 6) {
      diasHabiles++
    }
  }

  // Calcular promedio de asistencia: (días trabajados / días hábiles esperados) * 100
  const diasEsperados = totalEmpleados * diasHabiles
  const promedioAsistencia = diasEsperados > 0
    ? ((totalDiasTrabajados / diasEsperados) * 100).toFixed(1)
    : '0.0'

  // 🔍 LOG PARA DEBUGGING - Puedes comentar esto en producción
  console.log('📊 Estadísticas Reporte Analítico:', {
    totalEmpleados,
    diasEnMes,
    diasHabiles,
    diasEsperados,
    totalDiasTrabajados,
    promedioAsistencia: `${promedioAsistencia}%`,
    totalRetardos,
    totalFaltas,
    totalHorasExtra,
    formula: `(${totalDiasTrabajados} / ${diasEsperados}) × 100 = ${promedioAsistencia}%`
  })

  return {
    promedioAsistencia,
    totalRetardos,
    totalFaltas,
    totalHorasExtra,
    diasHabiles,  // Agregamos para referencia
    totalEmpleados  // Agregamos para referencia
  }
})

// Functions
const aplicarFiltros = async () => {
  filtrosAplicados.value = {
    searchTerm: searchTerm.value,
    area: selectedArea.value
  }

  await cargarDatos()
  mostrarMensaje(`Filtros aplicados: ${analyticsData.value.length} registro(s) encontrados`)
}

/*  NUEVO: genera un PDF con formato PRO como el de visitas */
const generarReporte = () => {
  try {
    if (!analyticsData.value.length) {
      mostrarMensaje('No hay datos para generar el reporte', 'warning')
      return
    }

    // Configuración base del PDF (igual que el de visitas)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const colors = {
      primary: [34, 26, 104],
      secondary: [94, 71, 255],
      gray: [107, 114, 128]
    }

    // ========== ENCABEZADO ==========
    pdf.setFontSize(16)
    pdf.setTextColor(...colors.primary)
    pdf.text('REPORTE ANALÍTICO DE ASISTENCIAS', 20, 20)

    pdf.setFontSize(12)
    pdf.setTextColor(...colors.gray)
    pdf.text(`Período: ${mesSeleccionado.value}`, 20, 30)
    pdf.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 37)
    pdf.text(`Total de empleados: ${analyticsData.value.length}`, 20, 44)

    let yPosition = 55

    // ========== BLOQUE RESUMEN (estadísticas) ==========
    pdf.setFillColor(...colors.secondary)
    pdf.setTextColor(255, 255, 255)
    pdf.rect(20, yPosition, 250, 8, 'F')
    pdf.setFontSize(10)
    pdf.text('RESUMEN GENERAL', 22, yPosition + 5)

    yPosition += 12
    pdf.setTextColor(...colors.gray)
    pdf.setFontSize(9)
    pdf.text(
      `Asistencia promedio: ${estadisticas.value.promedioAsistencia}%   |   Total retardos: ${estadisticas.value.totalRetardos}   |   Total faltas: ${estadisticas.value.totalFaltas}   |   Horas extra totales: ${estadisticas.value.totalHorasExtra}`,
      22,
      yPosition
    )

    yPosition += 10

    // ========== TABLA DE DETALLE ==========
    pdf.setFillColor(...colors.primary)
    pdf.setTextColor(255, 255, 255)
    pdf.rect(20, yPosition, 250, 8, 'F')
    pdf.setFontSize(10)
    pdf.text('DETALLE POR EMPLEADO', 22, yPosition + 5)

    yPosition += 12

    const headers = [
      'Empleado',
      'Área',
      'Días Trab.',
      'Retardos',
      'Falt. Justif.',
      'Falt. Injustif.',
      'Incidencias',
      'Horas Extra',
      'Días Fdos. Trab.'
    ]

    const columnWidths = [40, 30, 18, 18, 22, 22, 22, 22, 35] // suma = 229
    let xPosition = 20

    // Encabezados de tabla
    headers.forEach((header, index) => {
      pdf.setFillColor(...colors.primary)
      pdf.rect(xPosition, yPosition, columnWidths[index], 8, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(7)
      pdf.text(header, xPosition + 2, yPosition + 5)
      xPosition += columnWidths[index]
    })

    yPosition += 8

    // Filas
    analyticsData.value.forEach((emp, index) => {
      // Salto de página
      if (yPosition > 190 && index < analyticsData.value.length - 1) {
        pdf.addPage()
        yPosition = 20

        // Redibujar encabezados de tabla
        xPosition = 20
        headers.forEach((header, idx) => {
          pdf.setFillColor(...colors.primary)
          pdf.rect(xPosition, yPosition, columnWidths[idx], 8, 'F')
          pdf.setTextColor(255, 255, 255)
          pdf.setFontSize(7)
          pdf.text(header, xPosition + 2, yPosition + 5)
          xPosition += columnWidths[idx]
        })
        yPosition += 8
      }

      xPosition = 20

      // Fondo alternado
      pdf.setFillColor(index % 2 === 0 ? 255 : 245, 255, 255)
      pdf.rect(20, yPosition, 229, 6, 'F')

      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(6)

      const fila = [
        (emp.empleado || '').substring(0, 25),
        (emp.area || 'N/A').substring(0, 15),
        String(emp.diasTrabajados),
        String(emp.retardos),
        String(emp.faltJustif),
        String(emp.faltInjustif),
        String(emp.incidencias),
        String(emp.horasExtra),
        String(emp.dFdosTrabajados)
      ]

      fila.forEach((dato, colIndex) => {
        pdf.text(dato, xPosition + 2, yPosition + 4)
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
      pdf.text(
        `Página ${i} de ${totalPages} - Generado el ${new Date().toLocaleDateString('es-ES')}`,
        20,
        200
      )
    }

    pdf.save(`reporte-analitico-${selectedMonth.value}-${selectedYear.value}.pdf`)
    mostrarMensaje('Reporte generado exitosamente', 'success')
  } catch (error) {
    console.error('Error al generar PDF:', error)
    mostrarMensaje('Error al generar el PDF', 'error')
  }
}

const mostrarEstadisticas = () => {
  mostrarStats.value = !mostrarStats.value
  if (mostrarStats.value) {
    mostrarMensaje('Estadísticas mostradas', 'info')
  }
}

const verDetalleEmpleado = (empleado) => {
  empleadoSeleccionado.value = empleado
  dialogDetalle.value = true
}

/*  PDF individual por empleado con franja azul */
const descargarDetalle = (empleado) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const colors = {
      primary: [34, 26, 104],
      gray: [107, 114, 128]
    }

    const pageWidth = doc.internal.pageSize.getWidth()

    // ===== FRANJA AZUL SUPERIOR =====
    doc.setFillColor(...colors.primary)
    doc.rect(0, 0, pageWidth, 30, 'F') // franja de lado a lado

    // Título en blanco dentro de la franja
    doc.setFontSize(16)
    doc.setTextColor(255, 255, 255)
    doc.text('DETALLE DE ASISTENCIAS', 20, 18)

    // ===== DATOS GENERALES =====
    doc.setFontSize(12)
    doc.setTextColor(...colors.gray)
    doc.text(`Empleado: ${empleado.empleado}`, 20, 40)
    doc.text(`Área: ${empleado.area || 'N/A'}`, 20, 47)
    doc.text(`Período: ${mesSeleccionado.value}`, 20, 54)
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 61)

    // ===== CUERPO DEL REPORTE =====
    let y = 75

    const drawRow = (label, value) => {
      doc.setFontSize(10)
      doc.setTextColor(...colors.primary)
      doc.text(label, 20, y)
      doc.setTextColor(0, 0, 0)
      doc.text(String(value), 80, y)
      y += 8
    }

    drawRow('Días trabajados:', empleado.diasTrabajados)
    drawRow('Retardos:', empleado.retardos)
    drawRow('Faltas justificadas:', empleado.faltJustif)
    drawRow('Faltas injustificadas:', empleado.faltInjustif)
    drawRow('Incidencias:', empleado.incidencias)
    drawRow('Horas extra:', empleado.horasExtra)
    drawRow('Días festivos trabajados:', empleado.dFdosTrabajados)

    const fileName = `detalle-${empleado.empleado.toLowerCase().replace(/\s+/g, '-')}.pdf`
    doc.save(fileName)

    mostrarMensaje('Detalle descargado', 'success')
  } catch (error) {
    console.error('Error al generar PDF de detalle:', error)
    mostrarMensaje('Error al generar el PDF de detalle', 'error')
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

/* Filtros superiores - PEGADOS AL TÍTULO */
.filtros-superiores {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 1rem;
  width: 100%;
  padding: 0;
  box-sizing: border-box;
  margin-bottom: 1rem;
}

.filter-select {
  width: 230px;
}

.filter-btn {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0;
}

/* Cards */
.card-formulario,
.card-monitoreo {
  padding: 0.5rem;
  background-color: #FAFAFA;
  box-sizing: border-box;
  border-radius: 12px;
  margin-bottom: 2rem;
  margin-top: 1rem;
  width: 100%;
}

.card-titulo {
  font-size: 1.125rem;
  font-weight: 600;
  color: #544F65;
  padding: 1rem 1rem 0.4rem;
  background-color: #FAFAFA;
  width: 100%;
}

.card-text-custom {
  width: 100%;
  padding: 1.5rem 2rem;
  margin: 0.5rem 0 0.5rem;
}

/* Estadísticas - MEJOR ESPACIADO */
.stats-grid {
  gap: 2.1rem;
  width: 100%;
}

.stat-card {
  background: rgb(242, 241, 241);
  padding: 1.5rem 2rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border-left: 5px solid #5E47FF;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  width: 315px;
  display: flex;
  flex: 1;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.stat-label {
  font-size: 1rem;
  color: #6b7280;
  font-weight: 500;
  padding: 0.7rem;
}

/* Tablas con filas alternadas */
.tabla-monitoreo {
  border: 1px solid #e5e7eb;
  background-color: #FAFAFA;
}

.tabla-monitoreo :deep(thead) {
  background-color: #221A68;
}

.tabla-monitoreo :deep(thead th) {
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
  .repanalitico-content {
    padding: 3rem;
  }
}

@media (max-width: 768px) {
  .repanalitico-content {
    padding: 1rem;
  }

  .filtros-superiores {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    margin-left: 0;
  }

  .filter-select,
  .filter-select-monitor,
  .search-input-monitor {
    width: 100%;
  }

  .stats-grid {
    gap: 1rem;
  }

  .stat-card {
    padding: 1.5rem 1rem;
  }

  .stat-value {
    font-size: 2rem;
  }
}

.detalle-title {
  padding: 1rem 1.5rem 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.detalle-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detalle-nombre {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
}

.detalle-periodo {
  font-size: 0.9rem;
  color: #6b7280;
}

.detalle-label {
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 0.1rem;
}

.detalle-value {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem;
}
</style>