<template>
  <div class="reportevisitas-content">
    <div class="content-inner">
      <h2 class="page-title">Informe de Visitas</h2>
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
      </div>

      <!-- Tabla de Visitas -->
      <v-card class="card-monitoreo" elevation="0">
        <h2 class="card-titulo">Registro de Visitas - {{ mesSeleccionado }}</h2>

        <v-card-text>
          <!-- Contenedor para scroll horizontal -->
          <div class="table-container">
            <v-table class="tabla-monitoreo">
              <thead>
                <tr>
                  <th class="text-center">Visitante</th>
                  <th class="text-center">Cargo/Rol Durante la Visita</th>
                  <th class="text-center">Área Visitada</th>
                  <th class="text-center">Persona Visitada</th>
                  <th class="text-center">Empresa</th>
                  <th class="text-center">Hora Ingreso</th>
                  <th class="text-center">Hora Salida</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(visit, index) in visitsData" :key="index">
                  <td class="text-center">{{ visit.visitante }}</td>
                  <td class="text-center">{{ visit.cargoRol }}</td>
                  <td class="text-center">{{ visit.areaVisitada }}</td>
                  <td class="text-center">{{ visit.personaVisitada }}</td>
                  <td class="text-center">{{ visit.empresaPertenece }}</td>
                  <td class="text-center">{{ visit.horaIngreso }}</td>
                  <td class="text-center">{{ visit.horaSalida }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>

          <!-- Mensaje cuando no hay datos -->
          <div v-if="visitsData.length === 0" class="no-data-message">
            <v-icon size="48" color="#9ca3af">mdi-clipboard-text-outline</v-icon>
            <p>No se encontraron visitas con los filtros aplicados</p>
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
import { ref, computed, onMounted } from 'vue'
import { useAsistencias } from '@/composables/useAsistencias'
import axios from 'axios'
import jsPDF from 'jspdf'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Composable
const {
  visitas,
  loading,
  cargarVisitas
} = useAsistencias()

// Estados
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())
const selectedArea = ref('todas')
const searchTerm = ref('')
const busquedaError = ref(false)
const generandoPdf = ref(false)
const areas = ref([])

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
    color
  }
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
    await cargarVisitas(filtros)
  } catch (error) {
    console.error('Error al cargar visitas:', error)
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

// Áreas: value = nombre tal cual (para backend) 
const areasItems = computed(() => [
  { title: 'Todas las Áreas', value: 'todas' },
  ...areas.value.map(area => ({ title: area.nombre, value: area.nombre }))
])

// Datos mostrados en la tabla, filtrados en frontend por área y búsqueda
const visitsData = computed(() => {
  if (!visitas.value || visitas.value.length === 0) return []
  
  let resultado = visitas.value.map(v => ({
    visitante: v.nombre_visitante || 'N/A',
    cargoRol: v.cargo_rol || 'N/A',
    areaVisitada: v.area_visitada || 'N/A',
    personaVisitada: v.persona_visitada || 'N/A',
    empresaPertenece: v.empresa || 'N/A',
    horaIngreso: v.hora_entrada || 'N/A',
    horaSalida: v.hora_salida || 'N/A'
  }))

  // Filtro por área (solo cuando no es "todas")
  if (selectedArea.value && selectedArea.value !== 'todas') {
    const areaFiltro = selectedArea.value.toLowerCase()
    resultado = resultado.filter(v =>
      v.areaVisitada && v.areaVisitada.toLowerCase() === areaFiltro
    )
  }
  
  // Filtro por búsqueda
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    resultado = resultado.filter(v =>
      v.visitante.toLowerCase().includes(search) ||
      v.personaVisitada.toLowerCase().includes(search) ||
      v.empresaPertenece.toLowerCase().includes(search)
    )
  }
  
  return resultado
})

// ================== COMPUTED ==================
const mesSeleccionado = computed(() => {
  return monthsItems.value.find(m => m.value === selectedMonth.value)?.title || ''
})

// ================== MÉTODOS ==================
// Validación de búsqueda (solo letras y espacios)
const validarBusqueda = () => {
  const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
  if (searchTerm.value && !soloLetrasRegex.test(searchTerm.value)) {
    busquedaError.value = true
    searchTerm.value = searchTerm.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    mostrarMensaje('Solo se permiten letras y espacios en la búsqueda', 'warning')
  } else {
    busquedaError.value = false
  }
}

const aplicarFiltros = async () => {
  await cargarDatos()
  mostrarMensaje(`Filtros aplicados: ${visitsData.value.length} registro(s) encontrados`)
}

const generarReporte = async () => {
  generandoPdf.value = true
  try {
    mostrarMensaje('Generando reporte PDF de visitas...', 'info')
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
        gray: [107, 114, 128]
      }

      // ========== ENCABEZADO DEL REPORTE ==========
      pdf.setFontSize(16)
      pdf.setTextColor(...colors.primary)
      pdf.text('REPORTE DE VISITAS', 20, 20)

      pdf.setFontSize(12)
      pdf.setTextColor(...colors.gray)
      pdf.text(`Período: ${mesSeleccionado.value}`, 20, 30)
      pdf.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 37)
      pdf.text(`Total de visitas registradas: ${visitsData.value.length}`, 20, 44)

      let yPosition = 55

      // ========== TABLA DE VISITAS ==========
      pdf.setFillColor(...colors.primary)
      pdf.setTextColor(255, 255, 255)
      pdf.rect(20, yPosition, 250, 8, 'F')
      pdf.text('DETALLE DE VISITAS REGISTRADAS', 22, yPosition + 6)

      yPosition += 15

      // Encabezados de la tabla
      const headers = ['Visitante', 'Cargo/Rol', 'Área Visitada', 'Persona Visitada', 'Empresa', 'Hora Ingreso', 'Hora Salida']
      const columnWidths = [30, 35, 25, 30, 40, 25, 25]

      let xPosition = 20

      // Dibujar encabezados
      headers.forEach((header, index) => {
        pdf.setFillColor(...colors.primary)
        pdf.rect(xPosition, yPosition, columnWidths[index], 8, 'F')
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(7)
        pdf.text(header, xPosition + 2, yPosition + 5)
        xPosition += columnWidths[index]
      })

      yPosition += 8

      // Datos de las visitas
      visitsData.value.forEach((visit, index) => {
        // Control de paginación
        if (yPosition > 180 && index < visitsData.value.length - 1) {
          pdf.addPage()
          yPosition = 20
          
          // Redibujar encabezados en nueva página
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
        
        // Fondo alternado para mejor legibilidad
        pdf.setFillColor(index % 2 === 0 ? 255 : 245, 255, 255)
        pdf.rect(20, yPosition, 250, 6, 'F')
        
        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(6)
        
        // Datos de cada columna
        const datosFila = [
          visit.visitante.substring(0, 18),
          visit.cargoRol.substring(0, 20),
          visit.areaVisitada.substring(0, 15),
          visit.personaVisitada.substring(0, 18),
          visit.empresaPertenece.substring(0, 22),
          visit.horaIngreso,
          visit.horaSalida
        ]

        datosFila.forEach((dato, colIndex) => {
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
        pdf.text(`Página ${i} de ${totalPages} - Generado el ${new Date().toLocaleDateString('es-ES')}`, 20, 200)
      }

      // Guardar PDF
      pdf.save(`reporte-visitas-${selectedMonth.value}.pdf`)
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}
</script>

<style scoped>
.reportevisitas-content {
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

/* Título sin margen extra */
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

/* ===== Filtros ===== */
.filtros-superiores {
  display: flex;
  grid-template-columns: 200px 200px minmax(300px, 1fr) auto auto;
  gap: 1rem;
  width: 100%;
  max-width: 1200px;
  padding: 0rem 0;
  box-sizing: border-box;
  margin: 0 0 2rem 0;
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
}

/* ===== Tarjeta / Tabla ===== */
.card-monitoreo {
  width: 100%;
  margin: 1rem 0 1rem 0;
  padding: 0;
  background-color: #FFFFFF;
  border-radius: 12px;
  box-sizing: border-box;
  overflow: hidden;
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
  padding: 1.5rem 1.5rem 1.5rem;
  margin: 0;
  background-color: #FFFFFF;
}

/* Contenedor para tabla con scroll horizontal */
.table-container {
  overflow-x: auto;
  width: 100%;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  position: center;
}

/* Tabla con ancho fijo para forzar scroll horizontal cuando sea necesario */
.tabla-monitoreo {
  width: 100%;
  min-width: 1000px; /* Ancho mínimo para mantener las columnas visibles */
  border-collapse: collapse;
  background-color: #FFFFFF;
}

.tabla-monitoreo :deep(thead) { 
  background-color: #221A68; 
  position: sticky;
  left: 0;
}

.tabla-monitoreo :deep(thead th) { 
  color: #fff !important; 
  font-weight: 600 !important; 
  font-size: 0.875rem; 
  padding: 0.75rem;
  white-space: nowrap;
  min-width: 120px;
}

/* Filas alternadas */
.tabla-monitoreo :deep(tbody) { background-color: #FFFFFF; }
.tabla-monitoreo :deep(tbody tr:nth-child(odd)) { background-color: #FFFFFF; }
.tabla-monitoreo :deep(tbody tr:nth-child(even)) { background-color: #f8fafc; }
.tabla-monitoreo :deep(tbody td) {
  padding: 0.75rem; 
  font-size: 0.875rem; 
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
  min-width: 120px;
}

/* Mensaje cuando no hay datos */
.no-data-message {
  text-align: center;
  padding: 3rem 2rem;
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
  .reportevisitas-content { padding-left: 2rem; }
}

@media (max-width: 768px) {
  .reportevisitas-content { 
    padding: 1rem; 
    margin-left: 48px; 
  }
  
  .filtros-superiores { 
    grid-template-columns: 1fr; 
    max-width: 100%; 
    gap: 0.5rem;
  }
  
  .card-monitoreo { 
    max-width: 100%; 
    border-radius: 12px; 
    margin: 0.5rem 0 1rem 0;
  }
  
  .card-monitoreo :deep(.v-card-text) { 
    padding: 0 1rem 1rem; 
  }
  
  .filter-select, .search-input-monitor { 
    width: 100%; 
  }
  
  .table-container {
    border-radius: 6px;
    border: 1px solid #e5e7eb;
  }
  
  .tabla-monitoreo {
    min-width: 800px; /* Menos ancho mínimo para móviles */
  }
  
  .tabla-monitoreo :deep(thead th),
  .tabla-monitoreo :deep(tbody td) {
    padding: 0.5rem;
    font-size: 0.8rem;
    min-width: 100px;
  }
}
</style>