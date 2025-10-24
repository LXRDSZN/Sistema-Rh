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
            v-model="selectedType"
            :items="typesItems"
            placeholder="Seleccionar tipo"
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
          <h2 class="card-titulo">Datos Analíticos por Empleado</h2>
  
          <v-card-text>
            <v-table class="tabla-monitoreo">
              <thead>
                <tr>
                  <th class="text-center">Empleado</th>
                  <th class="text-center">Días Trabajados</th>
                  <th class="text-center">Retardos</th>
                  <th class="text-center">Falt. Justif.</th>
                  <th class="text-center">Falt. Injustif.</th>
                  <th class="text-center">Incidencias</th>
                  <th class="text-center">Horas Extra</th>
                  <th class="text-center">D. Fdos. Trabajados</th>
                  <th class="text-center tabla-acciones-header">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in analyticsData" :key="index">
                  <td class="text-center">{{ item.empleado }}</td>
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
                  <td class="text-center">
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      @click="verDetalleEmpleado(item)"
                      color="primary"
                    >
                      <v-icon size="20">mdi-eye</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      @click="descargarDetalle(item)"
                      color="success"
                    >
                      <v-icon size="20">mdi-download</v-icon>
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
  
  // Refs
  const selectedMonth = ref('enero-2024')
  const selectedType = ref('asistencia')
  const searchTerm = ref('')
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
  
  const typesItems = [
    { title: 'Asistencia', value: 'asistencia' },
    { title: 'Retardos', value: 'retardos' },
    { title: 'Faltas', value: 'faltas' }
  ]
  
  // Data
  const analyticsData = ref([
    {
      empleado: 'Luis Hernández',
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
      diasTrabajados: 18,
      retardos: 1,
      faltJustif: 3,
      faltInjustif: 0,
      incidencias: 0,
      horasExtra: 0,
      dFdosTrabajados: 1
    }
  ])
  
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
  
  // Functions
  const aplicarFiltros = () => {
    mostrarMensaje('Filtros aplicados correctamente')
  }
  
  const generarReporte = () => {
    mostrarMensaje('Generando reporte analítico...', 'info')
    
    setTimeout(() => {
      const link = document.createElement('a')
      link.href = '#'
      link.download = `reporte-analitico-${selectedMonth.value}.pdf`
      link.click()
      mostrarMensaje('Reporte generado exitosamente', 'success')
    }, 1500)
  }
  
  const mostrarEstadisticas = () => {
    mostrarStats.value = !mostrarStats.value
    if (mostrarStats.value) {
      mostrarMensaje('Estadísticas mostradas', 'info')
    }
  }
  
  const verDetalleEmpleado = (empleado) => {
    mostrarMensaje(`Viendo detalle de: ${empleado.empleado}`, 'info')
    // Aquí podrías abrir un diálogo o navegar a otra vista con el detalle
  }
  
  const descargarDetalle = (empleado) => {
    mostrarMensaje(`Descargando detalle de: ${empleado.empleado}`, 'info')
    
    setTimeout(() => {
      const link = document.createElement('a')
      link.href = '#'
      link.download = `detalle-${empleado.empleado.toLowerCase().replace(' ', '-')}.pdf`
      link.click()
      mostrarMensaje('Detalle descargado', 'success')
    }, 1000)
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
    max-width: 1400px;
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
  
  .card-text-custom {
    padding-bottom: 0;
  }
  
  /* Estadísticas */
  .stats-grid {
    margin-top: 1rem;
  }
  
  .stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    border-left: 4px solid #5E47FF;
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }
  
  .stat-label {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
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
  
  .tabla-acciones-header {
    width: 120px;
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
  
    .stats-grid {
      gap: 1rem;
    }
  }
  </style>