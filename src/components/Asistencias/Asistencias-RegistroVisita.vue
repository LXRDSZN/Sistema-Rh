<template>
  <div class="justificaciones-content">
    <div class="content-inner">
      <h2 class="page-title">Gestión de Visitas</h2>
      
      <!-- Formulario: Registro de Visitas -->
      <v-card class="card-formulario" elevation="0">
        <h2 class="card-titulo">Registrar Nueva Visita</h2>

        <v-card-text class="card-text-custom">
          <!-- Información del Visitante -->
          <div class="seccion-formulario">
            
            <div class="campos-grid">
              <div class="campo-grupo">
                <label class="form-label">Nombre*</label>
                <v-text-field
                  v-model="formulario.nombre"
                  placeholder="Ingrese el nombre"
                  class="input-custom"
                  variant="outlined"
                  density="comfortable"
                  required
                  hide-details
                />
              </div>

              <div class="campo-grupo">
                <label class="form-label">Apellido Paterno*</label>
                <v-text-field
                  v-model="formulario.apellido_paterno"
                  placeholder="Ingrese el apellido paterno"
                  class="input-custom"
                  variant="outlined"
                  density="comfortable"
                  required
                  hide-details
                />
              </div>

              <div class="campo-grupo">
                <label class="form-label">Apellido Materno</label>
                <v-text-field
                  v-model="formulario.apellido_materno"
                  placeholder="Ingrese el apellido materno"
                  class="input-custom"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
              </div>

              <div class="campo-grupo">
                <label class="form-label">Cargo*</label>
                <v-text-field
                  v-model="formulario.cargo"
                  placeholder="Cargo del visitante"
                  class="input-custom"
                  variant="outlined"
                  density="comfortable"
                  required
                  hide-details
                />
              </div>

              <div class="campo-grupo">
                <label class="form-label">Identificación*</label>
                <v-text-field
                  v-model="formulario.identificacion"
                  placeholder="Número de identificación"
                  class="input-custom"
                  variant="outlined"
                  density="comfortable"
                  required
                  hide-details
                />
              </div>

              <div class="campo-grupo">
                <label class="form-label">Teléfono*</label>
                <v-text-field
                  v-model="formulario.telefono"
                  placeholder="Número de teléfono"
                  class="input-custom"
                  variant="outlined"
                  density="comfortable"
                  required
                  hide-details
                  type="tel"
                />
              </div>

              <div class="campo-grupo">
                <label class="form-label">Email</label>
                <v-text-field
                  v-model="formulario.email"
                  placeholder="correo@ejemplo.com"
                  class="input-custom"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  type="email"
                />
              </div>

              <div class="campo-grupo">
                <label class="form-label">Empresa/Institución*</label>
                <v-select
                  v-model="formulario.empresa"
                  :items="empresas"
                  placeholder="Seleccione empresa"
                  class="input-custom"
                  variant="outlined"
                  density="comfortable"
                  required
                  hide-details
                />
              </div>
            </div>
          </div>

          <!-- Información de la Visita -->
          <div class="seccion-formulario">
            <h3 class="seccion-titulo">Información de la Visita</h3>
            
            <div class="campos-grid">
              <div class="campo-grupo">
                <label class="form-label">Área Visitada*</label>
                <v-select
                  v-model="formulario.area_visitada"
                  :items="areasVisitadas"
                  placeholder="Seleccione el área"
                  class="input-custom"
                  variant="outlined"
                  density="comfortable"
                  required
                  hide-details
                />
              </div>

              <div class="campo-grupo">
                <label class="form-label">Persona Visitada*</label>
                <v-autocomplete
                  v-model="formulario.persona_visitada"
                  :items="empleados"
                  item-title="nombre_completo"
                  item-value="id"
                  placeholder="Seleccione la persona"
                  class="input-custom"
                  variant="outlined"
                  density="comfortable"
                  required
                  hide-details
                />
              </div>

              <div class="campo-grupo">
                <label class="form-label">Motivo de la Visita*</label>
                <v-select
                  v-model="formulario.motivo"
                  :items="motivosVisita"
                  placeholder="Seleccione el motivo"
                  class="input-custom"
                  variant="outlined"
                  density="comfortable"
                  required
                  hide-details
                />
              </div>

              <div class="campo-grupo">
                <label class="form-label">Fecha de Ingreso</label>
                <v-text-field
                  :model-value="fechaActual"
                  class="input-custom"
                  variant="outlined"
                  density="comfortable"
                  readonly
                  hide-details
                />
              </div>

              <div class="campo-grupo">
                <label class="form-label">Hora de Ingreso</label>
                <v-text-field
                  :model-value="horaActual"
                  class="input-custom"
                  variant="outlined"
                  density="comfortable"
                  readonly
                  hide-details
                />
              </div>
            </div>
          </div>

          <!-- Información Adicional -->
          <div class="seccion-formulario" v-if="formulario.motivo === 'Otro'">
            <h3 class="seccion-titulo">Especificar Motivo</h3>
            <div class="campo-grupo-full">
              <v-textarea
                v-model="formulario.motivo_especifico"
                placeholder="Por favor, especifique el motivo de la visita..."
                class="input-custom"
                rows="3"
                variant="outlined"
                hide-details
                required
              />
            </div>
          </div>

          <!-- Botones -->
          <div class="form-botones">
            <v-btn
              color="#5E47FF"
              class="btn-action btn-primario"
              @click="registrarIngreso"
              :loading="guardando"
              size="large"
            >
              <v-icon left size="20">mdi-login</v-icon>
              Registrar Ingreso
            </v-btn>
            <v-btn
              color="#6C6C85"
              class="btn-action"
              @click="limpiarFormulario"
              size="large"
            >
              <v-icon left size="20">mdi-broom</v-icon>
              Limpiar Formulario
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <!-- Tabla de Monitoreo de Visitas Activas -->
      <v-card class="card-monitoreo" elevation="0">
        <h2 class="card-titulo">Monitoreo de Visitas</h2>

        <v-card-text>
          <div class="filtros-monitoreo">
            <v-text-field
              v-model="filtroBusqueda"
              placeholder="Buscar visitante, empresa o persona visitada..."
              class="search-input-monitor input-white"
              variant="outlined"
              density="compact"
              hide-details
              style="width: 250px;"
            >
              <template v-slot:append-inner>
                <v-icon size="18" color="#9ca3af">mdi-magnify</v-icon>
              </template>
            </v-text-field>

            <v-btn
              color="#5E47FF"
              class="filter-btn"
              @click="aplicarFiltros"
              size="small"
            >
              Aplicar Filtro
            </v-btn>
          </div>

          <v-table class="tabla-monitoreo">
            <thead>
              <tr>
                <th class="text-center">Visitante</th>
                <th class="text-center">Empresa</th>
                <th class="text-center">Persona Visitada</th>
                <th class="text-center">Área</th>
                <th class="text-center">Hora Entrada</th>
                <th class="text-center">Estado</th>
                <th class="text-center tabla-acciones-header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7" class="text-center py-4">
                  <v-progress-circular indeterminate color="#5E47FF"></v-progress-circular>
                  <p class="mt-2">Cargando visitas...</p>
                </td>
              </tr>
              <tr v-else-if="visitasActivasFiltradas.length === 0">
                <td colspan="7" class="text-center py-4 text-grey">
                  No hay visitas activas
                </td>
              </tr>
              <tr v-for="(visita, index) in visitasActivasFiltradas" :key="visita.id || index" v-else>
                <td class="text-center">
                  {{ visita.nombre_visitante }}
                </td>
                <td class="text-center">{{ visita.empresa }}</td>
                <td class="text-center">{{ visita.persona_visitada }}</td>
                <td class="text-center">{{ visita.area_visitada }}</td>
                <td class="text-center">{{ visita.hora_entrada }}</td>
                <td class="text-center">
                  <span class="estado-en-curso">
                    En curso
                  </span>
                </td>
                <td class="text-center">
                  <v-btn
                    color="#10b981"
                    class="btn-salida"
                    @click="registrarSalida(visita)"
                    size="small"
                  >
                    <v-icon left size="16">mdi-logout</v-icon>
                    Registrar Salida
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAsistencias } from '@/composables/useAsistencias'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Composable de asistencias
const {
  visitas,
  cargarVisitas: cargarVisitasAPI,
  crearVisita,
  actualizarVisita
} = useAsistencias()

// Estados del formulario
const formulario = ref({
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  cargo: '',
  identificacion: '',
  telefono: '',
  email: '',
  empresa: null,
  area_visitada: null,
  persona_visitada: null,
  motivo: '',
  motivo_especifico: ''
})

// Estados de UI
const guardando = ref(false)
const loading = ref(false)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Filtros
const filtroBusqueda = ref('')

// Listas de opciones
const empresas = ref([
  'Tech Solutions SA',
  'Consultores Asociados',
  'Innovation Labs',
  'Global Services Corp',
  'Digital Transformations',
  'Enterprise Systems',
  'Smart Solutions Inc',
  'Future Technologies'
])

const areasVisitadas = ref([])
const areas = ref([])

const motivosVisita = ref([
  'Reunión de trabajo',
  'Entrevista',
  'Entrega de documentación',
  'Recolección de información',
  'Mantenimiento técnico',
  'Capacitación',
  'Visita comercial',
  'Auditoría',
  'Otro'
])

const empleados = ref([])

// Visitas registradas
const visitasRegistradas = ref([])

// Tiempo actual
const fechaActual = ref('')
const horaActual = ref('')
let intervaloReloj

// Actualizar hora y fecha en tiempo real
const actualizarReloj = () => {
  const ahora = new Date()
  fechaActual.value = ahora.toLocaleDateString('es-ES')
  horaActual.value = ahora.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  })
}

onMounted(async () => {
  actualizarReloj()
  intervaloReloj = setInterval(actualizarReloj, 1000)
  await cargarDatosIniciales()
  await cargarVisitas()
})

onUnmounted(() => {
  if (intervaloReloj) {
    clearInterval(intervaloReloj)
  }
})

// Computed para visitas activas filtradas
const visitasActivasFiltradas = computed(() => {
  let visitasArray = Array.isArray(visitasRegistradas.value) ? visitasRegistradas.value : []
  let visitasActivas = visitasArray.filter(visita => !visita.hora_salida)

  // Filtro por búsqueda
  if (filtroBusqueda.value) {
    const busqueda = filtroBusqueda.value.toLowerCase().trim()
    visitasActivas = visitasActivas.filter(visita => 
      (visita.nombre_visitante && visita.nombre_visitante.toLowerCase().includes(busqueda)) ||
      (visita.empresa && visita.empresa.toLowerCase().includes(busqueda)) ||
      (visita.persona_visitada && visita.persona_visitada.toLowerCase().includes(busqueda)) ||
      (visita.area_visitada && visita.area_visitada.toLowerCase().includes(busqueda))
    )
  }

  return visitasActivas
})

// Cargar datos iniciales de empleados y áreas
const cargarDatosIniciales = async () => {
  try {
    // Cargar empleados
    const responseEmpleados = await axios.get(`${API_URL}/empleados`, { 
      withCredentials: true 
    })
    
    const empleadosData = responseEmpleados.data.data || responseEmpleados.data.empleados || []
    empleados.value = empleadosData.map(emp => ({
      id: emp.id,
      nombre_completo: `${emp.nombre} ${emp.apellido_paterno} ${emp.apellido_materno || ''}`.trim()
    }))

    // Cargar áreas
    const responseAreas = await axios.get(`${API_URL}/areas`, { 
      withCredentials: true 
    })
    areas.value = responseAreas.data.data || responseAreas.data || []
    
    // Mapear áreas para el select (con id y nombre)
    areasVisitadas.value = areas.value.map(area => ({
      title: area.nombre,
      value: area.id
    }))
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error)
    mostrarMensaje('Error al cargar datos iniciales', 'error')
  }
}

// Funciones principales
const cargarVisitas = async () => {
  try {
    // Cargar visitas del mes actual
    const now = new Date()
    const filtros = {
      mes: now.getMonth() + 1,
      anio: now.getFullYear()
    }
    await cargarVisitasAPI(filtros)
    // Sincronizar con las visitas del composable
    if (visitas.value && Array.isArray(visitas.value)) {
      visitasRegistradas.value = visitas.value
    }
  } catch (error) {
    console.error('Error al cargar visitas:', error)
    mostrarMensaje('Error al cargar visitas', 'error')
  }
}

const registrarIngreso = async () => {
  try {
    // Validación básica
    const camposObligatorios = [
      'nombre', 'apellido_paterno', 'cargo', 'identificacion', 'telefono',
      'empresa', 'area_visitada', 'persona_visitada', 'motivo'
    ]
    
    const formularioValido = camposObligatorios.every(campo => {
      const valor = formulario.value[campo]
      return valor && valor.toString().trim().length > 0
    })

    if (!formularioValido) {
      mostrarMensaje('Por favor complete todos los campos obligatorios', 'error')
      return
    }

    if (formulario.value.motivo === 'Otro' && !formulario.value.motivo_especifico) {
      mostrarMensaje('Debe especificar el motivo de la visita', 'error')
      return
    }

    guardando.value = true

    // Construir nombre completo del visitante
    const nombreCompleto = `${formulario.value.nombre} ${formulario.value.apellido_paterno} ${formulario.value.apellido_materno || ''}`.trim()

    // Preparar datos para enviar a la API (según estructura del backend)
    const datosVisita = {
      nombre_visitante: nombreCompleto,
      cargo_rol: formulario.value.cargo,
      area_visitada_id: formulario.value.area_visitada, // Debe ser ID del área
      persona_visitada_id: formulario.value.persona_visitada, // Debe ser ID de la persona
      empresa_pertenece: formulario.value.empresa,
      motivo_visita: formulario.value.motivo === 'Otro' ? formulario.value.motivo_especifico : formulario.value.motivo
    }

    console.log('📤 Datos a enviar:', datosVisita)

    // Crear visita en la API
    await crearVisita(datosVisita)
    
    // Recargar visitas para mostrar la nueva
    await cargarVisitas()

    mostrarMensaje('Ingreso de visita registrado correctamente')
    limpiarFormulario()
    
  } catch (error) {
    console.error('Error al registrar ingreso:', error)
    mostrarMensaje('Error al registrar el ingreso', 'error')
  } finally {
    guardando.value = false
  }
}

const registrarSalida = async (visita) => {
  try {
    // Formato TIME para PostgreSQL (HH:MM:SS)
    const now = new Date()
    const horaSalida = now.toTimeString().split(' ')[0] // HH:MM:SS
    
    // Actualizar visita en la API
    await actualizarVisita(visita.id, { hora_salida: horaSalida })
    
    // Recargar visitas
    await cargarVisitas()
    
    const horaDisplay = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    mostrarMensaje(`Salida registrada para ${visita.nombre_visitante} a las ${horaDisplay}`)
  } catch (error) {
    console.error('Error al registrar salida:', error)
    mostrarMensaje('Error al registrar la salida', 'error')
  }
}

const aplicarFiltros = () => {
  mostrarMensaje('Filtros aplicados correctamente')
}

const limpiarFormulario = () => {
  formulario.value = {
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    cargo: '',
    identificacion: '',
    telefono: '',
    email: '',
    empresa: null,
    area_visitada: null,
    persona_visitada: null,
    motivo: '',
    motivo_especifico: ''
  }
}

const mostrarMensaje = (texto, color = 'success') => {
  snackbar.value = {
    show: true,
    text: texto,
    color: color
  }
}
</script>

<style scoped>
.visitas-content {
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

.card-formulario,
.card-monitoreo {
  padding: 1.2rem;
  background-color: #FAFAFA;
  box-sizing: border-box;
  border-radius: 12px;
  margin-bottom: 1.7rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08) !important;
}

.card-titulo {
  font-size: 1.125rem;
  font-weight: 600;
  color: #544F65;
  margin: 0 0 0.8rem 0;
  text-align: left;
}

.seccion-formulario {
  margin-bottom: 2rem;
}

.seccion-titulo {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.campos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  align-items: start;
}

.campo-grupo {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.campo-grupo-full {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.input-custom {
  width: 100%;
}

.input-custom :deep(.v-field) {
  background-color: #ffffff;
  border-radius: 8px;
}

.form-botones {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.btn-action {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0;
  border-radius: 8px;
  min-width: 200px;
}

.btn-primario {
  background: linear-gradient(135deg, #5E47FF, #8B5CF6);
}

/* Filtros de monitoreo */
.filtros-monitoreo {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  align-items: center;
  flex-wrap: nowrap;
  width: 40%;
}

.search-input-monitor {
  width: 250px;
}

.filter-btn {
  text-transform: none;
  font-weight: 500 !important;
  font-size: 0.85rem;
  letter-spacing: 0;
  height: 40px;
}

/* Tabla de monitoreo */
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
  width: 150px;
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

/* Estados */
.estado-en-curso {
  color: #f59e0b;
  font-weight: 600;
}

/* Botón de salida */
.btn-salida {
  text-transform: none;
  border-radius: 6px;
  font-size: 0.75rem;
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

/* Responsive */
@media (max-width: 768px) {
  .content-inner {
    padding: 0 1rem;
  }
  
  .campos-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .card-formulario,
  .card-monitoreo {
    padding: 1rem;
  }
  
  .form-botones {
    flex-direction: column;
  }
  
  .btn-action {
    min-width: 100%;
  }
  
  .filtros-monitoreo {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input-monitor {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  .card-titulo {
    font-size: 1.2rem;
  }
  
  .content-inner {
    padding: 0 0.5rem;
  }
}
</style>