<template>
  <div class="reportevisitas-content">
    <div class="content-inner">
      <h2 class="page-title">Reporte de Visitas</h2>
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
                  <th class="text-center columna-visitante">Visitante</th>
                  <th class="text-center columna-cargo">Cargo/Rol</th>
                  <th class="text-center columna-area">Área Visitada</th>
                  <th class="text-center columna-persona">Persona Visitada</th>
                  <th class="text-center columna-empresa">Empresa</th>
                  <th class="text-center columna-hora">Hora Ingreso</th>
                  <th class="text-center columna-hora">Hora Salida</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(visit, index) in visitsData" :key="index">
                  <td class="text-center columna-visitante">{{ visit.visitante }}</td>
                  <td class="text-center columna-cargo">{{ visit.cargoRol }}</td>
                  <td class="text-center columna-area">{{ visit.areaVisitada }}</td>
                  <td class="text-center columna-persona">{{ visit.personaVisitada }}</td>
                  <td class="text-center columna-empresa">{{ visit.empresaPertenece }}</td>
                  <td class="text-center columna-hora">{{ visit.horaIngreso }}</td>
                  <td class="text-center columna-hora">{{ visit.horaSalida }}</td>
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
import { ref, computed } from 'vue'
import jsPDF from 'jspdf'

// Refs
const selectedMonth = ref('enero-2024')
const selectedArea = ref('todas')
const searchTerm = ref('')
const busquedaError = ref(false)
const generandoPdf = ref(false)

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

// Items para selects
const monthsItems = [
  { title: 'Enero 2024', value: 'enero-2024' },
  { title: 'Febrero 2024', value: 'febrero-2024' },
  { title: 'Marzo 2024', value: 'marzo-2024' }
]

const areasItems = [
  { title: 'Todas las Áreas', value: 'todas' },
  { title: 'Contratos', value: 'contratos' },
  { title: 'Áreas', value: 'areas' },
  { title: 'Vacaciones', value: 'vacaciones' },
  { title: 'Incidencias', value: 'incidencias' },
  { title: 'Asistencias', value: 'asistencias' }
]

// Data (master + visible)
const originalVisits = [
  {
    visitante: 'Laura Hernández',
    cargoRol: 'Analista legal',
    areaVisitada: 'Contratos',
    personaVisitada: 'Miriam Ríos',
    empresaPertenece: 'Jurídica Integral S.A.',
    horaIngreso: '09:00 a.m.',
    horaSalida: '12:00 p.m.'
  },
  {
    visitante: 'Jorge Ramírez',
    cargoRol: 'Coordinador de operaciones',
    areaVisitada: 'Áreas',
    personaVisitada: 'Luis Martínez',
    empresaPertenece: 'Logística MX',
    horaIngreso: '10:15 a.m.',
    horaSalida: '1:30 p.m.'
  },
  {
    visitante: 'Sofía Méndez',
    cargoRol: 'Asistente de RRHH',
    areaVisitada: 'Contratos',
    personaVisitada: 'Ana Torres',
    empresaPertenece: 'RH Global',
    horaIngreso: '08:45 a.m.',
    horaSalida: '11:00 a.m.'
  },
  {
    visitante: 'Carlos Vázquez',
    cargoRol: 'Técnico de soporte',
    areaVisitada: 'Incidencias',
    personaVisitada: 'Jorge Ruiz',
    empresaPertenece: 'Soluciones TI',
    horaIngreso: '11:00 a.m.',
    horaSalida: '2:00 p.m.'
  },
  {
    visitante: 'Mariana López',
    cargoRol: 'Coordinadora administrativa',
    areaVisitada: 'Vacaciones',
    personaVisitada: 'Patricia Gómez',
    empresaPertenece: 'Corporativo Sur',
    horaIngreso: '09:30 a.m.',
    horaSalida: '12:30 p.m.'
  },
  {
    visitante: 'Daniel Ortega',
    cargoRol: 'Auditor externo',
    areaVisitada: 'Contratos',
    personaVisitada: 'Miriam Ríos',
    empresaPertenece: 'Consultores Financieros',
    horaIngreso: '10:00 a.m.',
    horaSalida: '1:00 p.m.'
  },
  {
    visitante: 'Fernanda Ruiz',
    cargoRol: 'Supervisora de personal',
    areaVisitada: 'Asistencias',
    personaVisitada: 'Ana Torres',
    empresaPertenece: 'RH Global',
    horaIngreso: '08:30 a.m.',
    horaSalida: '10:30 a.m.'
  },
  {
    visitante: 'Luis Fernando Morales',
    cargoRol: 'Coordinador de mantenimiento',
    areaVisitada: 'Áreas',
    personaVisitada: 'Luis Martínez',
    empresaPertenece: 'Infraestructura Total',
    horaIngreso: '11:15 a.m.',
    horaSalida: '2:15 p.m.'
  }
]

const visitsData = ref([...originalVisits])

// ================== COMPUTED ==================
const mesSeleccionado = computed(() => {
  const meses = {
    'enero-2024': 'Enero 2024',
    'febrero-2024': 'Febrero 2024',
    'marzo-2024': 'Marzo 2024'
  }
  return meses[selectedMonth.value] || 'Enero 2024'
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

const aplicarFiltros = () => {
  const area = (selectedArea.value || '').toLowerCase()
  const term = (searchTerm.value || '').trim().toLowerCase()

  const filtrados = originalVisits.filter(v => {
    const cumpleArea = area === 'todas' || v.areaVisitada.toLowerCase() === area
    const texto = `${v.visitante} ${v.personaVisitada} ${v.empresaPertenece}`.toLowerCase()
    const cumpleBusqueda = term === '' || texto.includes(term)
    return cumpleArea && cumpleBusqueda
  })

  visitsData.value = filtrados

  mostrarMensaje(`Filtros aplicados: ${filtrados.length} registro(s) encontrados`)
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

      // Encabezados de la tabla con anchos ajustados
      const headers = ['Visitante', 'Cargo/Rol', 'Área', 'Persona Visitada', 'Empresa', 'H. Ingreso', 'H. Salida']
      const columnWidths = [35, 40, 25, 35, 45, 20, 20]

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
        
        // Datos de cada columna con tamaños ajustados
        const datosFila = [
          visit.visitante.substring(0, 20),
          visit.cargoRol.substring(0, 22),
          visit.areaVisitada.substring(0, 12),
          visit.personaVisitada.substring(0, 20),
          visit.empresaPertenece.substring(0, 25),
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
  display: grid;
  grid-template-columns: 180px 180px 1fr auto auto;
  gap: 0.75rem;
  width: 75%;
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

/* Contenedor para tabla con scroll horizontal */
.table-container {
  overflow-x: auto;
  width: 100%;
  border-radius: 4px;
  margin-top: 1rem;
}

/* Tabla con ancho optimizado */
.tabla-monitoreo {
  width: 100%;
  min-width: 1000px;
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

/* Columnas con tamaños específicos */
.columna-visitante {
  width: 160px !important;
  min-width: 160px !important;
  max-width: 160px !important;
}

.columna-cargo {
  width: 180px !important;
  min-width: 180px !important;
  max-width: 180px !important;
}

.columna-area {
  width: 120px !important;
  min-width: 120px !important;
  max-width: 120px !important;
}

.columna-persona {
  width: 160px !important;
  min-width: 160px !important;
  max-width: 160px !important;
}

.columna-empresa {
  width: 200px !important;
  min-width: 200px !important;
  max-width: 200px !important;
}

.columna-hora {
  width: 100px !important;
  min-width: 100px !important;
  max-width: 100px !important;
}

/* Filas alternadas */
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
  .reportevisitas-content { 
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
  .reportevisitas-content { 
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
    min-width: 900px;
  }
  
  .tabla-monitoreo :deep(thead th) { 
    padding: 0.6rem 0.4rem !important;
    font-size: 0.8rem !important;
  }
  
  .tabla-monitoreo :deep(tbody td) {
    padding: 0.6rem 0.4rem !important;
    font-size: 0.8rem !important;
  }
  
  /* Ajustes de columnas para móvil */
  .columna-visitante {
    width: 140px !important;
    min-width: 140px !important;
    max-width: 140px !important;
  }
  
  .columna-cargo {
    width: 150px !important;
    min-width: 150px !important;
    max-width: 150px !important;
  }
  
  .columna-area {
    width: 100px !important;
    min-width: 100px !important;
    max-width: 100px !important;
  }
  
  .columna-persona {
    width: 140px !important;
    min-width: 140px !important;
    max-width: 140px !important;
  }
  
  .columna-empresa {
    width: 160px !important;
    min-width: 160px !important;
    max-width: 160px !important;
  }
  
  .columna-hora {
    width: 90px !important;
    min-width: 90px !important;
    max-width: 90px !important;
  }
}

@media (max-width: 480px) {
  .reportevisitas-content { 
    padding: 0.5rem; 
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .tabla-monitoreo {
    min-width: 850px;
  }
  
  .columna-visitante {
    width: 120px !important;
    min-width: 120px !important;
    max-width: 120px !important;
  }
  
  .columna-cargo {
    width: 130px !important;
    min-width: 130px !important;
    max-width: 130px !important;
  }
  
  .columna-area {
    width: 90px !important;
    min-width: 90px !important;
    max-width: 90px !important;
  }
  
  .columna-persona {
    width: 120px !important;
    min-width: 120px !important;
    max-width: 120px !important;
  }
  
  .columna-empresa {
    width: 140px !important;
    min-width: 140px !important;
    max-width: 140px !important;
  }
  
  .columna-hora {
    width: 80px !important;
    min-width: 80px !important;
    max-width: 80px !important;
  }
  
  .no-data-message {
    padding: 2rem 0.5rem;
  }
  
  .no-data-message p {
    font-size: 0.9rem;
  }
}
</style>