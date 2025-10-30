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
            <!-- 3 campos solicitados -->
            <label class="field">
              <span class="label-text">Nombre:</span>
              <input v-model="nombre" type="text" placeholder="Espejel Anzurez Arturo Zuriel" autocomplete="name" />
            </label>

            <label class="field">
              <span class="label-text">Departamento:</span>
              <input v-model="departamento" type="text" placeholder="Tecnología de la Información (TI)" />
            </label>

            <label class="field">
              <span class="label-text">Fecha de Contratación:</span>
              <input v-model="fechaContratacion" type="date" />
            </label>

            <!-- Indicador de periodo seleccionado (si viene) -->
            <div class="divider" />
            <div class="period-summary">
              <div class="period-line">Período de Vacaciones Seleccionado</div>
              <div class="days-count">Días Seleccionados: <strong>{{ selectedCount }}</strong></div>
            </div>
            <div class="divider" />

            <!-- Fechas inicio / fin -->
            <div class="row date-row">
              <label class="field small">
                <span class="label-text">Fecha Inicio:</span>
                <input v-model="fechaInicio" type="date" />
              </label>

              <label class="field small">
                <span class="label-text">Fecha Fin:</span>
                <input v-model="fechaFin" type="date" />
              </label>
            </div>

            <!-- Descripción -->
            <label class="field">
              <span class="label-text">Descripción (Opcional):</span>
              <textarea v-model="descripcion" rows="6" placeholder="Descripción..."></textarea>
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
                  <input id="fileInput" ref="fileInput" class="file-input" type="file" @change="onFileChange" aria-label="Subir Archivo" />
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
export default {
  name: 'SolicitudComponent',
  props: {
    // fechas ya seleccionadas por el calendario (array de 'YYYY-MM-DD')
    selectedDates: {
      type: Array,
      default: () => []
    },
    // opcional: estado de días por fecha
    dayStatus: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['close', 'submitted'],
  data() {
    return {
      nombre: '',
      departamento: '',
      fechaContratacion: '',
      fechaInicio: '',
      fechaFin: '',
      descripcion: '',
      file: null,
      fileName: '',
      submitting: false,
      note: ''
    };
  },
  computed: {
    selectedCount() {
      return this.selectedDates ? this.selectedDates.length : 0;
    }
  },
  methods: {
    onFileChange(e) {
      const f = e.target.files && e.target.files[0];
      if (f) {
        this.file = f;
        this.fileName = f.name;
      } else {
        this.file = null;
        this.fileName = '';
      }
    },
    parseSelectedToDates() {
      // Si hay fechas seleccionadas por el calendario, asignar la primera y la última como defaults
      if (this.selectedDates && this.selectedDates.length) {
        // suponer formato YYYY-MM-DD
        const sorted = [...this.selectedDates].sort();
        this.fechaInicio = this.fechaInicio || sorted[0];
        this.fechaFin = this.fechaFin || sorted[sorted.length - 1];
      }
    },
    validate() {
      if (!this.nombre.trim()) { this.note = 'Ingresa el nombre.'; return false; }
      if (!this.departamento.trim()) { this.note = 'Ingresa el departamento.'; return false; }
      if (!this.fechaContratacion) { this.note = 'Ingresa la fecha de contratación.'; return false; }
      if (!this.fechaInicio) { this.note = 'Selecciona la fecha de inicio.'; return false; }
      if (!this.fechaFin) { this.note = 'Selecciona la fecha final.'; return false; }
      // fechaInicio <= fechaFin
      if (new Date(this.fechaInicio) > new Date(this.fechaFin)) {
        this.note = 'La fecha de inicio no puede ser posterior a la fecha fin.';
        return false;
      }
      this.note = '';
      return true;
    },
    submit() {
      if (!this.validate()) return;
      this.submitting = true;
      this.note = 'Enviando solicitud...';

      // Crear payload (ejemplo). En producción enviar a la API con fetch/axios.
      const payload = {
        nombre: this.nombre,
        departamento: this.departamento,
        fechaContratacion: this.fechaContratacion,
        fechaInicio: this.fechaInicio,
        fechaFin: this.fechaFin,
        descripcion: this.descripcion,
        fileName: this.fileName || null,
        selectedDates: this.selectedDates
      };

      // Simulación de envío
      setTimeout(() => {
        this.submitting = false;
        this.note = 'Solicitud enviada correctamente (simulado).';
        // Emitir payload para que el padre procese (marcar días como requested, etc.)
        this.$emit('submitted', { ...payload, file: this.file });
        // cerrar tras pequeña pausa
        setTimeout(() => {
          this.onClose();
        }, 700);
      }, 900);
    },
    onClose() {
      // limpiar estado interno mínimo
      this.nombre = '';
      this.departamento = '';
      this.fechaContratacion = '';
      this.fechaInicio = '';
      this.fechaFin = '';
      this.descripcion = '';
      this.file = null;
      this.fileName = '';
      this.note = '';
      this.submitting = false;
      this.$emit('close');
    }
  },
  mounted() {
    this.parseSelectedToDates();
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
.solicitud-form { display:flex; flex-direction:column; gap:14px; }
.field { display:flex; flex-direction:column; gap:8px; }
.label-text { font-size: 12px; color: #6b6b6b; }

/* Small variant for date inputs in the same row */
.field.small { width: 100%; }
.date-row { display:flex; gap:16px; justify-content:space-between; }
.date-row .field.small { flex: 1; }

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
input::placeholder, textarea::placeholder { color: #a9a9a9; font-size: 13px; }
textarea { min-height: 120px; }

/* Divider and period summary */
.divider { height: 1px; background: rgba(0,0,0,0.04); margin: 6px 0 10px; }
.period-summary { text-align:center; color:#888; font-size:13px; margin-bottom:6px; }
.days-count { margin-top:8px; color:#666; font-size:13px; }

/* Upload + Send row */
.row.actions {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
  margin-top:6px;
}
.upload { display:flex; flex-direction:column; gap:6px; }
.upload-top { display:flex; align-items:center; gap:8px; }
.upload-label {
  display:inline-flex;
  align-items:center;
  gap:8px;
  cursor:pointer;
  color:#222;
  font-size:14px;
  user-select:none;
}
.upload-label svg { opacity:0.95; }
.upload-text { font-size:14px; color:#111; }
.file-input { display:none; }
.upload-hint { font-size:12px; color:#8a8a8a; margin-top:2px; }

/* Send button style */
.submit-wrap { display:flex; align-items:center; }
.btn-send {
  background: var(--accent);
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display:inline-flex;
  gap:10px;
  align-items:center;
  box-shadow: 0 8px 24px rgba(79,57,246,0.18);
}
.btn-send:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-send .arrow { transform: translateX(2px); }

/* Note */
.form-note { margin-top:6px; font-size:13px; color:#666; min-height:1.2em; }

/* Responsive */
@media (max-width:760px) {
  .solicitud-header-bar, .solicitud-content { width: calc(100% - 24px); padding: 12px; }
  .solicitud-outer { padding: 20px; }
  .solicitud-card { padding: 20px; width:100%; }
  .date-row { flex-direction: column; gap:10px; }
  .close-btn { top:10px; right:10px; padding:6px; }
}
</style>