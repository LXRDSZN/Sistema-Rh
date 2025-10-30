<template>
  <div class="incidencia-root" role="region" aria-label="Sección incidencia">
    <div class="content">
      <h1 class="incidencia-title">INCIDENCIA</h1>

      <div class="incidencia-wrap" role="dialog" aria-modal="true" aria-label="Registrar incidencia de vacaciones">
        <div class="incidencia-card-outer" @click.self="onClose">
          <div class="incidencia-card-inner" role="document">
            <!-- Close button en la esquina superior derecha -->
            <button class="close-btn" @click="onClose" aria-label="Cerrar incidencia">✕</button>

            <form class="incidencia-form" @submit.prevent="submit">
              <label class="field">
                <span class="label-text">Usuario (Empleado)</span>
                <input
                  v-model="usuario"
                  id="usuario"
                  name="usuario"
                  type="text"
                  placeholder="Nombre o id del usuario"
                  autocomplete="off"
                />
              </label>

              <label class="field">
                <span class="label-text">Asunto</span>
                <input
                  v-model="asunto"
                  id="asunto"
                  name="asunto"
                  type="text"
                  placeholder="Breve asunto"
                />
              </label>

              <label class="field">
                <span class="label-text">Descripción</span>
                <textarea
                  v-model="descripcion"
                  id="descripcion"
                  name="descripcion"
                  rows="5"
                  placeholder="Describe la incidencia en relación a las vacaciones"
                ></textarea>
              </label>

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
                    <input
                      id="fileInput"
                      ref="fileInput"
                      class="file-input"
                      type="file"
                      @change="onFileChange"
                      aria-label="Subir acta emitida"
                    />
                  </div>
                  <div class="upload-hint">Subir Acta Emitida</div>
                </div>

                <div class="submit-wrap">
                  <button class="btn-primary" type="submit" :disabled="submitting">
                    {{ submitting ? 'Enviando...' : 'Reportar' }}
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
  name: 'VacacionIncidenciaComponent',
  emits: ['close', 'submitted'],
  data() {
    return {
      usuario: '',
      asunto: '',
      descripcion: '',
      file: null,
      fileName: '',
      note: '',
      submitting: false
    };
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
    validate() {
      if (!this.usuario.trim() || !this.asunto.trim() || !this.descripcion.trim()) {
        this.note = 'Por favor completa todos los campos antes de reportar.';
        return false;
      }
      return true;
    },
    async submit() {
      if (!this.validate()) return;
      this.submitting = true;
      this.note = 'Enviando incidencia...';

      const payload = {
        usuario: this.usuario,
        asunto: this.asunto,
        descripcion: this.descripcion,
        fileName: this.fileName || null
      };

      setTimeout(() => {
        this.submitting = false;
        this.note = 'Incidencia enviada correctamente (simulado).';
        this.$emit('submitted', { ...payload, file: this.file });
        setTimeout(() => {
          this.onClose();
        }, 700);
      }, 900);
    },
    onClose() {
      this.usuario = '';
      this.asunto = '';
      this.descripcion = '';
      this.file = null;
      this.fileName = '';
      this.note = '';
      this.submitting = false;
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');

:root {
  --bg: #1c1c24;            
  --outer-bg: #f7f7f9;      
  --card-bg: #f6f6f8;      
  --muted-input: #ececec;
  --text: #222;
  --accent: #4F39F6;        
  --front-shadow: 0 26px 60px rgba(20, 20, 40, 0.16); 
}

.incidencia-root {
  width: 100%;
  background: var(--bg);
  padding: 18px 0 28px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
}

.content {
  width: 820px;
  max-width: calc(100% - 32px);
  box-sizing: border-box;
}

.incidencia-title {
  margin: 0 0 12px 8px;
  font-family: 'Montserrat', system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  font-weight: 700;
  letter-spacing: 8px;
  font-size: 20px;
  color: #111;
  text-transform: uppercase;
  align-self: flex-start;
}

.incidencia-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
}

.incidencia-card-outer {
  width: 100%;
  background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,247,249,1));
  border-radius: 16px;
  padding: 36px;
  box-shadow: 0 2px 0 rgba(0,0,0,0.04), 0 14px 36px rgba(0,0,0,0.06);
}


.incidencia-card-inner {
  background: var(--card-bg); 
  border-radius: 12px;
  padding: 28px 36px;
  max-width: 560px;
  margin: 0 auto;
  box-shadow: var(--front-shadow), inset 0 1px 0 rgba(255,255,255,0.6);
  position: relative;
}

.close-btn {
  position: absolute;
  right: 12px;
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

.incidencia-form { display: flex; flex-direction: column; gap: 14px; }
.field { display:flex; flex-direction:column; gap:8px; }
.label-text { font-size: 12px; color: #6b6b6b; }

input[type="text"], textarea {
  background: var(--muted-input);
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  color: var(--text);
  resize: vertical;
  transition: box-shadow .12s ease, transform .08s ease;
}
input::placeholder, textarea::placeholder { color: #a9a9a9; font-size: 13px; }
input:focus, textarea:focus { box-shadow: 0 0 0 3px rgba(79,57,246,0.08); transform: translateY(-1px); }

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

.submit-wrap { display:flex; align-items:center; }
.btn-primary {
  background: #4F39F6; 
  color: #ffffff;      
  border: none;
  padding: 10px 22px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(79,57,246,0.18);
  transition: transform .08s ease, box-shadow .12s ease, opacity .12s ease;
}
.btn-primary:active { transform: translateY(1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.form-note {
  margin: 6px 0 0;
  font-size: 13px;
  color: #666;
  min-height: 1.2em;
}

@media (max-width: 760px) {
  .content { width: 94%; }
  .incidencia-card-outer { padding: 20px; }
  .incidencia-card-inner { padding: 20px; width: 100%; }
  .row.actions { flex-direction: column; align-items: flex-start; }
  .submit-wrap { width: 100%; display:flex; justify-content:flex-end; }
  .incidencia-title { margin-left: 4px; font-size: 18px; }
  .close-btn { right: 10px; top: 10px; padding: 6px; }
}
</style>