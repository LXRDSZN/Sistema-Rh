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
    { title: 'Áreas', value: 'areas' },
    { title: 'Vacaciones', value: 'vacaciones' },
    { title: 'Incidencias', value: 'incidencias' },
    { title: 'Asistencias', value: 'asistencias' }
  ]
  
  // Data
  const visitsData = ref([
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
  ])
  
  // Functions
  const aplicarFiltros = () => {
    mostrarMensaje('Filtros aplicados correctamente')
  }
  
  const generarReporte = () => {
    mostrarMensaje('Generando reporte de visitas...', 'info')
    
    // Simular generación de reporte
    setTimeout(() => {
      const link = document.createElement('a')
      link.href = '#'
      link.download = `reporte-visitas-${selectedMonth.value}.pdf`
      link.click()
      mostrarMensaje('Reporte generado exitosamente', 'success')
    }, 1500)
  }
  </script>
  
  <style scoped>
  .reportevisitas-content {
    flex: 1;
    padding: 2rem;
    margin-left: 60px;
    margin-right: 15px;
    display: flex;
    align-items: flex-start;
    width: 5vw;
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
    max-width: 1200px;
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
  .card-monitoreo {
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
  }
  </style>