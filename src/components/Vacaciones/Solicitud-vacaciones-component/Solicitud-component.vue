<template>
    <h1 class="solicitud-title">SOLICITUD</h1>
  <div class="solicitud-root" role="region" aria-label="Solicitud de vacaciones">
    <!-- Barra superior blanca con título (fuera del card) -->
    <div class="solicitud-header-bar" role="banner" aria-hidden="false">
      

    <!-- Área de contenido centrada -->
    <div class="solicitud-content">
      <!-- Contenedor exterior con sombra fija (no hover) -->
      <div class="solicitud-outer" @click.self="onClose">
        <div class="solicitud-card" role="document" aria-label="Formulario de solicitud">
          <!-- Botón X (regresa al menú Vacaciones) -->
          <button class="close-btn" @click="onClose" aria-label="Regresar al menú Vacaciones">✕</button>

          <form class="solicitud-form" @submit.prevent="submit">
            <!-- 2 campos solicitados (nombre y departamento) -->
            <label class="field">
              <span class="label-text">Nombre:</span>
              <input 
                v-model="nombre" 
                type="text" 
                placeholder="Nombre del empleado" 
                autocomplete="name" 
                readonly
              />
            </label>

            <label class="field">
              <span class="label-text">Departamento:</span>
              <input 
                v-model="departamento" 
                type="text" 
                placeholder="Departamento" 
                readonly
              />
            </label>

            <!-- Indicador de periodo seleccionado -->
            <div class="divider" />
            <div class="period-summary">
              <div class="period-line">Período de Vacaciones Seleccionado</div>
              <div class="days-count">
                Días Seleccionados: <strong>{{ selectedCount }}</strong>
                <span v-if="vacacionesData" class="saldo-info">
                  Saldo disponible: {{ vacacionesData.saldo.dias_disponibles }} días
                </span>
              </div>
            </div>

            <!-- Mostrar los días seleccionados en formato visual -->
            <div v-if="selectedDates.length > 0" class="dias-seleccionados">
              <div class="dias-label">Días solicitados:</div>
              <div class="dias-grid">
                <div v-for="fecha in diasFormateados" :key="fecha.iso" class="dia-item">
                  <div class="dia-numero">{{ fecha.dia }}</div>
                  <div class="dia-mes">{{ fecha.mesCorto }}</div>
                </div>
              </div>
            </div>

            <div class="divider" />

            <!-- Descripción -->
            <label class="field">
              <span class="label-text">Descripción (Opcional):</span>
              <textarea v-model="descripcion" rows="6" placeholder="Descripción o motivo de la solicitud..."></textarea>
            </label>

            <!-- Upload -->
            <div class="row actions">
              <div class="upload">
                <div class="upload-top">
                  <label for="fileInput" class="upload-label" :title="fileName || 'Agregar'">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                      <path d="M12 3v12" stroke="#222" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M8 7l4-4 4 4" stroke="#222" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M21 21H3" stroke="#222" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span class="upload-text">{{ fileName || 'Agregar' }}</span>
                  </label>
                  <input id="fileInput" ref="fileInput" class="file-input" type="file" accept=".pdf" @change="onFileChange" aria-label="Subir Archivo" />
                </div>
                <div class="upload-hint">Subir Archivo</div>
              </div>

              <!-- Botón enviar -->
              <div class="submit-wrap">
                <button class="btn-send" type="submit" :disabled="submitting">
                  <span class="arrow">▶</span>
                  <span>{{ submitting ? 'Enviando...' : 'Enviar' }}</span>
                </button>
              </div>
            </div>

            <p class="form-note" aria-live="polite">{{ note }}</p>
          </form>
        </div>
      </div>
    </div>
  </div>
 </div>
</template>

<script>
import * as vacacionesService from '@/services/vacacionesService.js';

export default {
  name: 'SolicitudComponent',
  props: {
    selectedDates: {
      type: Array,
      default: () => []
    },
    dayStatus: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['close', 'submitted'],
  data() {
    return {
      empleadoActual: null,
      vacacionesData: null,
      nombre: '',
      departamento: '',
      descripcion: '',
      file: null,
      fileName: '',
      submitting: false,
      note: '',
      cargando: false
    };
  },
  computed: {
    selectedCount() {
      return this.selectedDates ? this.selectedDates.length : 0;
    },
    diasFormateados() {
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      
      return this.selectedDates.map(fecha => {
        const date = new Date(fecha + 'T00:00:00');
        return {
          iso: fecha,
          dia: date.getDate().toString().padStart(2, '0'),
          mesCorto: meses[date.getMonth()],
          mesNum: date.getMonth() + 1,
          anio: date.getFullYear()
        };
      });
    }
  },
  methods: {
    async cargarDatosEmpleado() {
      this.cargando = true;
      this.note = 'Cargando datos...';
      
      try {
        console.log('🔄 Iniciando carga de datos del empleado...');
        
        // Obtener datos del empleado autenticado
        const respuesta = await vacacionesService.getEmpleadoActual();
        
        console.log('📦 Respuesta recibida:', respuesta);
        
        if (!respuesta.success) {
          throw new Error(respuesta.message || 'Error desconocido');
        }

        if (!respuesta.data) {
          throw new Error('No hay datos en la respuesta');
        }

        this.empleadoActual = respuesta.data;
        this.nombre = respuesta.data.nombre || 'Sin nombre';
        this.departamento = respuesta.data.departamento || 'Sin asignar';
        
        console.log('✅ Datos del empleado cargados:', {
          nombre: this.nombre,
          departamento: this.departamento,
          id: this.empleadoActual.id
        });

        // Obtener datos de vacaciones
        if (this.empleadoActual?.id) {
          console.log('🔄 Obteniendo datos de vacaciones para empleado:', this.empleadoActual.id);
          
          const vacacionesResp = await vacacionesService.getVacacionesEmpleado(this.empleadoActual.id);
          
          if (vacacionesResp.success && vacacionesResp.data) {
            this.vacacionesData = vacacionesResp.data;
            console.log('✅ Datos de vacaciones cargados:', this.vacacionesData);
          } else {
            console.warn('⚠️ No se pudieron obtener datos de vacaciones');
            this.vacacionesData = {
              saldo: {
                dias_disponibles: 0,
                dias_utilizados: 0,
                dias_pendientes: 0
              },
              solicitudes: {
                pendientes: 0,
                aprobadas: 0,
                rechazadas: 0
              }
            };
          }
        }

        this.note = '';
        
      } catch (error) {
        console.error('❌ Error completo:', error);
        this.note = `Error: ${error.message}`;
      } finally {
        this.cargando = false;
      }
    },
    onFileChange(e) {
      const f = e.target.files && e.target.files[0];
      if (f) {
        // Validar que sea PDF
        if (f.type !== 'application/pdf') {
          this.note = 'Solo se permiten archivos PDF';
          this.file = null;
          this.fileName = '';
          // Resetear el input
          if (this.$refs.fileInput) {
            this.$refs.fileInput.value = '';
          }
          return;
        }
        this.file = f;
        this.fileName = f.name;
      } else {
        this.file = null;
        this.fileName = '';
      }
    },
    validate() {
      if (!this.nombre.trim()) { 
        this.note = 'Ingresa el nombre.'; 
        return false; 
      }
      if (!this.departamento.trim()) { 
        this.note = 'Ingresa el departamento.'; 
        return false; 
      }
      if (this.selectedCount === 0) { 
        this.note = 'Debes seleccionar al menos un día de vacaciones.'; 
        return false; 
      }

      // Validar saldo disponible
      if (this.vacacionesData && this.selectedCount > this.vacacionesData.saldo.dias_disponibles) {
        this.note = `No tienes suficientes días. Disponibles: ${this.vacacionesData.saldo.dias_disponibles}`;
        return false;
      }

      this.note = '';
      return true;
    },
    async submit() {
      if (!this.validate()) return;
      this.submitting = true;
      this.note = 'Enviando solicitud...';

      try {
        // Calcular fecha de inicio y fin de los días seleccionados
        const sortedDates = [...this.selectedDates].sort();
        const fechaInicio = sortedDates[0];
        const fechaFin = sortedDates[sortedDates.length - 1];

        const payload = {
          persona_id: this.empleadoActual.id,
          dias_solicitados: this.selectedCount,
          descripcion: this.descripcion,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          selectedDates: this.selectedDates
        };

        console.log('📤 Enviando payload:', payload);

        const respuesta = await vacacionesService.crearSolicitudVacaciones(payload, this.file);

        if (respuesta.success) {
          this.note = 'Solicitud enviada correctamente.';
          this.$emit('submitted', { ...payload, file: this.file });
          
          setTimeout(() => {
            this.onClose();
          }, 700);
        } else {
          this.note = respuesta.message || 'Error al enviar la solicitud';
          this.submitting = false;
        }
      } catch (error) {
        console.error('❌ Error en submit:', error);
        this.note = `Error: ${error.message}`;
        this.submitting = false;
      }
    },
    onClose() {
      this.nombre = '';
      this.departamento = '';
      this.descripcion = '';
      this.file = null;
      this.fileName = '';
      this.note = '';
      this.submitting = false;
      this.$emit('close');
    }
  },
  mounted() {
    console.log('🎯 Componente montado, iniciando carga...');
    this.cargarDatosEmpleado();
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');

:root{
  --bg-page: #efeff3;           
  --header-white: #ffffff;     
  --outer-bg: #fbfbfc;          
  --card-bg: #f6f6f8;         
  --muted-input: #ececec;
  --text: #222;
  --accent: #4F39F6;           
  --shadow-fixed: 0 28px 70px rgba(15,15,15,0.12); 
}

/* raíz: fondo gris general */
.solicitud-root{
  background: var(--bg-page);
  padding: 18px 0 40px;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  margin-left: 15%;
}

/* Banda superior blanca con título (fuera del card) */
.solicitud-header-bar {
  width: 820px;
  max-width: calc(100% - 32px);
  background: var(--header-white);
  border-radius: 4px;
  padding: 18px 20px;
  box-shadow: 0 6px 20px rgba(10,10,10,0.06); 
  margin-bottom: 18px;
  box-sizing: border-box;
  margin-left: 15%;
}

.solicitud-title {
  margin: 0;
  font-family: 'Montserrat', system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  font-weight: 700;
  letter-spacing: 8px;
  font-size: 20px;
  color: #111;
  text-transform: uppercase;
  margin-left: 25%;
}

/* Contenido centrado con la misma anchura que la banda */
.solicitud-content {
  width: 820px;
  max-width: calc(100% - 32px);
  box-sizing: border-box;
  display: flex;
  justify-content: center;
}

/* Contenedor exterior: área blanca muy clara */
.solicitud-outer {
  width: 100%;
  background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,247,249,1));
  border-radius: 16px;
  padding: 36px;
  box-shadow: 0 2px 0 rgba(0,0,0,0.04), 0 14px 36px rgba(0,0,0,0.06);
  box-sizing: border-box;
}

/* Card frontal con sombra fija (destaca sobre el outer) */
.solicitud-card {
  position: relative;
  max-width: 560px;
  margin: 0 auto;
  background: var(--card-bg);
  border-radius: 12px;
  padding: 28px 36px;
  box-shadow: var(--shadow-fixed), inset 0 1px 0 rgba(255,255,255,0.6);
  box-sizing: border-box;
}

/* Close X botón en la esquina superior derecha */
.close-btn {
  position: absolute;
  right: 14px;
  top: 12px;
  background: rgba(255,255,255,0.6);
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #444;
  padding: 8px;
  border-radius: 8px;
  line-height: 1;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.close-btn:hover {
  background: rgba(255,255,255,0.8);
  color: #111;
}

/* Form */
.solicitud-form { 
  display: flex; 
  flex-direction: column; 
  gap: 14px; 
}

.field { 
  display: flex; 
  flex-direction: column; 
  gap: 8px; 
}

.label-text { 
  font-size: 12px; 
  color: #6b6b6b; 
  font-weight: 600;
}

/* Inputs and textarea */
input[type="text"], input[type="date"], textarea {
  background: var(--muted-input);
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  color: var(--text);
  resize: vertical;
  box-sizing: border-box;
}

input[readonly] {
  background: #f0f0f0;
  cursor: not-allowed;
  opacity: 0.9;
}

input::placeholder, textarea::placeholder { 
  color: #a9a9a9; 
  font-size: 13px; 
}

textarea { 
  min-height: 120px; 
}

/* Divider and period summary */
.divider { 
  height: 1px; 
  background: rgba(0,0,0,0.04); 
  margin: 10px 0; 
}

.period-summary { 
  text-align: center; 
  color: #888; 
  font-size: 13px; 
  margin-bottom: 6px;
  padding: 12px 0;
}

.period-line {
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
}

.days-count { 
  margin-top: 8px; 
  color: #666; 
  font-size: 13px; 
}

.saldo-info {
  display: block;
  margin-top: 8px;
  color: #4F39F6;
  font-weight: 600;
  font-size: 12px;
}

/* Días seleccionados grid */
.dias-seleccionados {
  padding: 16px;
  background: rgba(79, 57, 246, 0.05);
  border-radius: 8px;
  border-left: 4px solid #4F39F6;
  margin: 10px 0;
}

.dias-label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 10px;
}

.dias-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 8px;
}

.dia-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #4F39F6;
  border-radius: 8px;
  padding: 8px 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.dia-numero {
  font-weight: 700;
  font-size: 16px;
  color: #4F39F6;
}

.dia-mes {
  font-size: 11px;
  color: #888;
  font-weight: 600;
  margin-top: 2px;
}

/* Upload + Send row */
.row.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 6px;
}

.upload { 
  display: flex; 
  flex-direction: column; 
  gap: 6px; 
}

.upload-top { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
}

.upload-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #222;
  font-size: 14px;
  user-select: none;
}

.upload-label svg { 
  opacity: 0.95; 
}

.upload-text { 
  font-size: 14px; 
  color: #111; 
}

.file-input { 
  display: none; 
}

.upload-hint { 
  font-size: 12px; 
  color: #8a8a8a; 
  margin-top: 2px; 
}

/* Send button style */
.submit-wrap { 
  display: flex; 
  align-items: center; 
}

.btn-send {
  background: var(--accent);
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  gap: 10px;
  align-items: center;
  box-shadow: 0 8px 24px rgba(79,57,246,0.18);
}

.btn-send:disabled { 
  opacity: 0.6; 
  cursor: not-allowed; 
}

.btn-send .arrow { 
  transform: translateX(2px); 
}

/* Note */
.form-note { 
  margin-top: 6px; 
  font-size: 13px; 
  color: #666; 
  min-height: 1.2em; 
}

/* Responsive */
@media (max-width: 760px) {
  .solicitud-header-bar, .solicitud-content { 
    width: calc(100% - 24px); 
    padding: 12px; 
  }
  .solicitud-outer { 
    padding: 20px; 
  }
  .solicitud-card { 
    padding: 20px; 
    width: 100%; 
  }
  .close-btn { 
    top: 10px; 
    right: 10px; 
    padding: 6px; 
  }
  .dias-grid {
    grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
  }
}
</style>