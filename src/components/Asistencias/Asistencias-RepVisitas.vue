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
        </div>
  
        <!-- Tabla de Visitas -->
        <v-card class="card-monitoreo" elevation="0">
          <h2 class="card-titulo">Registro de Visitas</h2>
  
          <v-card-text>
            <v-table class="tabla-monitoreo">
              <thead>
                <tr>
                  <th class="text-center">Visitante</th>
                  <th class="text-center">Cargo/Rol Durante la Visita</th>
                  <th class="text-center">Área Visitada</th>
                  <th class="text-center">Persona Visitada</th>
                  <th class="text-center">Empresa a la que pertenece</th>
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
import { ref } from 'vue'

// Refs
const selectedMonth = ref('enero-2024')
const selectedArea = ref('todas')
const searchTerm = ref('')

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

// Functions
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

  // Nota: el dataset de ejemplo no tiene fecha, por eso el "mes" no afecta
  const msgMes = ' (el mes no aplica con datos de ejemplo)'
  mostrarMensaje(`Filtros aplicados: ${filtrados.length} registro(s)${msgMes}`)
}

const generarReporte = () => {
  mostrarMensaje('Generando reporte de visitas...', 'info')

  // Simular generación de reporte
  setTimeout(() => {
    const link = document.createElement('a')
    link.href = '#'
    link.download = `reporte-visitas-${selectedMonth.value}.pdf` // ← corregido
    link.click()
    mostrarMensaje('Reporte generado exitosamente', 'success')
  }, 1500)
}
</script>

  
  <style scoped>
.reportevisitas-content {
  flex: 1;
  /* ↓ acercamos todo a la izquierda */
  padding: 1.25rem 15px 2rem;   /* antes: 2rem;  margin-right ya es 15px */
  margin-left: 48px;            /* antes: 60px (queda como asistencias visualmente) */
  margin-right: 15px;
  display: flex;
  align-items: flex-start;
  width: 100%;
  min-height: 100vh;
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
  margin: 0;
}

/* Inputs con fondo blanco */
.input-white :deep(.v-field) { background-color: #FAFAFA; }

/* ===== Filtros (misma “respiración” que asistencias) ===== */
.filtros-superiores {
  display: grid;
  grid-template-columns: 240px 240px minmax(320px, 1fr) 160px; /* Mes | Área | Buscar | Aplicar */
  gap: 1rem;
  width: 100%;
  max-width: 1000px;        /* igual que asistencias */
  padding: 0.5rem 0;        /* sin padding lateral extra */
  box-sizing: border-box;
  margin: 0 0 1rem 0;       /* sin margen izquierdo adicional */
  align-items: center;
}
.filter-select,
.search-input-monitor { width: 100%; }

/* Alineaciones de botones dentro del grid */
.filtros-superiores .filter-btn:nth-of-type(1) { justify-self: end; }   /* Aplicar Filtro */
.filtros-superiores .filter-btn:nth-of-type(2) {
  grid-column: 1 / 2;      /* Generar Reporte en la fila de abajo, a la izquierda */
  margin-top: 0.25rem;
}

.filter-btn {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0;
}

/* ===== Tarjeta / Tabla — alineada y proporcionada ===== */
.card-monitoreo {
  /* MISMO ancho que los filtros */
  max-width: 1000px;
  margin: 1rem 0 2rem 0;    /* sin desplazamiento lateral */
  padding: 0;               /* quitamos padding del card para que la tabla “asiente” bien */
  background-color: #FFFFFF;
  border-radius: 12px;
  box-sizing: border-box;
  overflow: hidden;         /* respeta el radio del card */
}

/* Padding parejo dentro del contenido del card */
.card-monitoreo :deep(.v-card-text) {
  padding: 0 1.5rem 1.25rem;
  background-color: #FFFFFF;
  box-sizing: border-box;
}

/* Título del card en blanco y sin saltos raros */
.card-titulo {
  font-size: 1.125rem;
  font-weight: 600;
  color: #544F65;
  padding: 1rem 1.5rem 0.4rem;
  margin: 0;
  background-color: #FFFFFF;
}

/* Tabla */
.tabla-monitoreo {
  width: 100%;
  min-width: 800px;          /* evita colapso en pantallas angostas */
  border: 1px solid #e5e7eb; /* borde sutil como en asistencias */
  background-color: #FFFFFF; /* cuerpo blanco */
}
.tabla-monitoreo :deep(thead)       { background-color: #221A68; }
.tabla-monitoreo :deep(thead th)    { color:#fff!important; font-weight:600!important; font-size:0.875rem; padding:0.75rem; }

/* Filas alternadas (blanco / gris muy claro) */
.tabla-monitoreo :deep(tbody) { background-color: #FFFFFF; }
.tabla-monitoreo :deep(tbody tr:nth-child(odd))  { background-color:#FFFFFF; }
.tabla-monitoreo :deep(tbody tr:nth-child(even)) { background-color:#f8fafc; }
.tabla-monitoreo :deep(tbody td) {
  padding:0.75rem; font-size:0.875rem; border-bottom:1px solid #e5e7eb;
}

/* (Legacy utilitarias) */
.filtros-monitoreo { display:flex; gap:1rem; margin-bottom:1.5rem; align-items:center; width:1100px; flex-wrap:nowrap; justify-content:flex-start; }
.filter-select-monitor { width:200px; }
.search-input-monitor  { width:350px; }

/* Responsive */
@media (min-width: 1024px) {
  .reportevisitas-content { padding-left: 2rem; } /* un poco más de aire en pantallas grandes */
}
@media (max-width: 768px) {
  .reportevisitas-content { padding: 1rem; margin-left: 48px; }
  .filtros-superiores { grid-template-columns: 1fr; max-width: 100%; }
  .filtros-superiores .filter-btn:nth-of-type(1),
  .filtros-superiores .filter-btn:nth-of-type(2) { justify-self: stretch; grid-column: auto; }
  .card-monitoreo { max-width: 100%; border-radius: 12px; }
  .card-monitoreo :deep(.v-card-text) { padding: 0 1rem 1rem; }
  .filter-select, .search-input-monitor { width: 100%; }
}
</style>