<template>
  <div class="hist-root" role="region" aria-label="Solicitudes de vacaciones">
    <div class="content">
      <h1 class="page-title">SOLICITUDES DE VACACIONES</h1>

      <div class="hist-wrap" role="dialog" aria-modal="false" aria-label="Solicitudes de vacaciones">
        <div class="card-outer" @click.self>
          <!-- Close X en el div padre para regresar al calendario -->
          <button class="close-x-outer" @click="goToVacaciones" aria-label="Regresar a Vacaciones">✕</button>

          <div class="card-inner" role="table" aria-label="Lista de solicitudes de vacaciones">
            <!-- Header row -->
            <div class="table-head" role="row">
              <div class="col col-no" role="columnheader">No</div>
              <div class="col col-period" role="columnheader">Periodo</div>
              <div class="col col-days" role="columnheader">Días</div>
              <div class="col col-name" role="columnheader">Nombre</div>
              <div class="col col-actions" aria-hidden="true">
                <button class="icon-btn" title="Opciones de vista" aria-label="Opciones de vista">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                    <path d="M3 5h18M6 12h12M10 19h4" stroke="#6b6b6b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Contenedor que mantiene cada solicitud en su propio sub-div (como en el mockup) -->
            <div class="requests-wrap" role="region" aria-label="Contenedor de solicitudes">
              <template v-if="requests.length">
                <div
                  v-for="(req, idx) in requests"
                  :key="req.id"
                  class="solicitud-card"
                  role="article"
                  :aria-label="'Solicitud ' + (idx+1)"
                >
                  <div class="col col-no">{{ idx + 1 }}</div>

                  <div class="col col-period">
                    <div class="period-line">{{ req.periodShort }}</div>
                    <div class="period-sub">{{ req.periodFull }}</div>
                  </div>

                  <div class="col col-days">{{ req.days }} Días</div>

                  <div class="col col-name">
                    <div class="name-line" :title="req.nombre">{{ truncate(req.nombre, 28) }}</div>
                  </div>

                  <div class="col col-actions">
                    <button class="action-btn" @click="openRequest(req)" :title="'Ver solicitud ' + (idx+1)" :aria-label="'Ver solicitud ' + (idx+1)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                        <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="#222" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M15 3h6v6" stroke="#222" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M10 14L21 3" stroke="#222" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span class="action-text">Solicitud</span>
                    </button>

                    <button class="action-btn approve" @click="approveRequest(req)" :title="'Aprobar solicitud ' + (idx+1)" aria-label="Aprobar solicitud">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                        <path d="M20 6L9 17l-5-5" stroke="#2b8a00" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>

                    <button class="action-btn remove" @click="removeRequest(req)" :title="'Eliminar solicitud ' + (idx+1)" aria-label="Eliminar solicitud">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                        <path d="M3 6h18" stroke="#666" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="#666" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M10 11v6M14 11v6" stroke="#666" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="#666" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </template>

              <div v-else class="empty">No hay solicitudes</div>
            </div>
            <!-- fin requests-wrap -->
          </div>
        </div>
      </div>

      <!-- Modal para ver/editar solicitud -->
      <div v-if="modalOpen" class="modal-backdrop" role="dialog" aria-modal="true" :aria-label="modalTitle">
        <div class="modal-card" @click.self="closeModal">
          <div class="modal-inner" role="document">
            <button class="close-btn" @click="closeModal" aria-label="Cerrar">✕</button>

            <form class="incidencia-form" @submit.prevent="saveModal">
              <h3 class="modal-heading">{{ modalTitle }}</h3>

              <label class="field">
                <span class="label-text">Nombre</span>
                <input v-model="editing.nombre" type="text" />
              </label>

              <label class="field">
                <span class="label-text">Periodo</span>
                <input v-model="editing.periodFull" type="text" />
              </label>

              <label class="field">
                <span class="label-text">Días</span>
                <input v-model.number="editing.days" type="number" min="0" />
              </label>

              <div class="row actions">
                <div class="submit-wrap">
                  <button class="btn-primary" type="submit" :disabled="saving">{{ saving ? 'Guardando...' : 'Guardar' }}</button>
                </div>
              </div>

              <p class="form-note" aria-live="polite">{{ modalNote }}</p>
            </form>
          </div>
        </div>
      </div>
      <!-- fin modal -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'SolicitudesVacaciones',
  data() {
    return {
      requests: [
        {
          id: 's1',
          periodShort: 'De Sep 01 a Sep 05',
          periodFull: 'De Septiembre 01 al Septiembre 05',
          days: 5,
          nombre: 'Espejel Anzurez Alejandro',
        },
        {
          id: 's2',
          periodShort: 'De Oct 10 a Oct 14',
          periodFull: 'De Octubre 10 al Octubre 14',
          days: 5,
          nombre: 'María López',
        }
      ],
      modalOpen: false,
      editing: null,
      saving: false,
      modalNote: ''
    };
  },
  computed: {
    modalTitle() {
      return this.editing ? `Solicitud - ${this.editing.nombre || 'Sin nombre'}` : 'Solicitud';
    }
  },
  methods: {
    truncate(text, n = 20) {
      if (!text) return '';
      return text.length > n ? text.slice(0, n - 1) + '…' : text;
    },
    openRequest(req) {
      this.editing = JSON.parse(JSON.stringify(req));
      this.modalNote = '';
      this.modalOpen = true;
      this.$nextTick(() => {
        const input = document.querySelector('.modal-inner input[type="text"]');
        if (input) input.focus();
      });
    },
    closeModal() {
      this.modalOpen = false;
      this.editing = null;
      this.saving = false;
      this.modalNote = '';
    },
    saveModal() {
      if (!this.editing) return;
      if (!this.editing.nombre || !this.editing.periodFull) {
        this.modalNote = 'Completa nombre y periodo.';
        return;
      }
      this.saving = true;
      this.modalNote = 'Guardando...';
      setTimeout(() => {
        const idx = this.requests.findIndex(r => r.id === this.editing.id);
        if (idx !== -1) {
          this.requests.splice(idx, 1, { ...this.editing });
        } else {
          this.requests.push({ ...this.editing, id: 's' + (Math.random() * 1e6).toFixed(0) });
        }
        this.saving = false;
        this.modalNote = 'Guardado (simulado).';
        setTimeout(() => this.closeModal(), 700);
      }, 700);
    },
    approveRequest(req) {
      // Simple simulation: mark as approved and remove from list
      if (!confirm('Aprobar esta solicitud?')) return;
      const idx = this.requests.findIndex(r => r.id === req.id);
      if (idx !== -1) this.requests.splice(idx, 1);
      // aquí podrías enviar a la API y mostrar notificación
    },
    removeRequest(req) {
      if (!confirm('¿Eliminar esta solicitud?')) return;
      const idx = this.requests.findIndex(r => r.id === req.id);
      if (idx !== -1) this.requests.splice(idx, 1);
    },
    goToVacaciones() {
      if (this.$router) {
        this.$router.push({ path: '/Vacaciones', name: 'Vacaciones' });
      } else {
        window.location.href = '/#/Vacaciones';
      }
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');

/* layout */
/* layout similar a tu plantilla de incidencia para evitar overlay por la navbar */
.hist-root{
  width: 100%;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  padding-top: 24px; /* ajusta por navbar */
  padding-bottom: 36px;
  /* color corregido: hex válido */
  background: linear-gradient(180deg, #e9e9ec, #e9e9ec);
  font-family: 'Montserrat', system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}

/* content */
.content{
  width: 820px;
  max-width: calc(100% - 32px);
  box-sizing: border-box;
}

/* title */
.page-title{
  margin: 0 0 18px 8px;
  font-weight: 700;
  letter-spacing: 6px;
  font-size: 18px;
  color: #111;
  text-transform: uppercase;
}

/* wrapper and card */
.hist-wrap{ width: 100%; display:flex; justify-content:center; }
.card-outer{
  position: relative;
  width: 100%;
  background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,247,249,1));
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 2px 0 rgba(0,0,0,0.04), 0 14px 36px rgba(0,0,0,0.06);
  box-sizing: border-box;
}

/* X en el div padre (.card-outer) */
.close-x-outer{
  position: absolute;
  right: 12px;
  top: 12px;
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  color: #444;
  z-index: 20;
}
.close-x-outer:hover{ color:#111; }

/* inner */
.card-inner{
  background: #ffffff;
  border-radius: 10px;
  padding: 16px;
  min-height: 420px;
  box-shadow: 0 10px 30px rgba(12,12,20,0.06);
  border: 1px solid rgba(0,0,0,0.04);
  box-sizing: border-box;
}

/* header row */
.table-head{
  display:flex;
  align-items:center;
  gap:12px;
  padding: 10px 14px;
  border-radius: 8px;
  color: #6b6b6b;
  font-size: 13px;
  margin-bottom: 12px;
  user-select: none;
  background: linear-gradient(180deg, rgba(250,250,252,1), rgba(247,247,249,1));
  border: 1px solid rgba(0,0,0,0.02);
}

/* requests wrapper */
.requests-wrap{
  background: transparent;
  padding: 6px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.02);
  min-height: 300px;
  box-sizing: border-box;
  max-height: 520px;
  overflow: auto;
  scroll-behavior: smooth;
}

/* solicitud-card: cada solicitud es un sub-div (como en mockup) */
.solicitud-card{
  display:flex;
  align-items:center;
  gap:12px;
  background: #fff;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 12px;
  box-shadow: 0 6px 18px rgba(13,13,20,0.04);
  border: 1px solid rgba(0,0,0,0.03);

  /* layout columns inside card */
  /* use the same column classes (col-*) for consistency */
}

/* columns */
.col{ display:flex; align-items:center; gap:8px; padding: 6px 8px; box-sizing: border-box; }
.col-no{ width: 44px; color:#6b6b6b; }
.col-period{ flex: 1 1 360px; min-width: 220px; }
.col-days{ width: 90px; color:#6b6b6b; }
.col-name{ flex: 1 1 240px; min-width: 140px; }
.col-actions{ width: 160px; justify-content:flex-end; display:flex; gap:8px; }

/* period text */
.period-line{ font-weight: 600; color: #111; font-size: 13px; }
.period-sub{ font-size: 12px; color: #8a8a8a; margin-top: 2px; }

/* name */
.name-line{ font-size: 13px; color:#222; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

/* action buttons */
.action-btn{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  border: none;
  background: transparent;
  color: #222;
  cursor: pointer;
  font-size: 13px;
  padding: 6px;
  border-radius: 8px;
}
.action-text{ margin-left:6px; display:inline-block; font-size:13px; color:#111; }
.action-btn:hover{ background: rgba(0,0,0,0.03); }

.action-btn.approve svg { stroke: #2b8a00; }
.action-btn.remove svg { stroke: #666; }

/* empty state */
.empty{
  height: 200px;
  border-radius: 8px;
  display:flex;
  align-items:flex-start;
  padding: 18px;
  color: #999;
  background: linear-gradient(180deg, rgba(250,250,252,1), rgba(247,247,249,1));
  border: 1px dashed rgba(0,0,0,0.02);
}

/* modal styles (reused) */
.modal-backdrop{
  position: fixed;
  inset: 0;
  background: rgba(10,10,12,0.42);
  display:flex;
  justify-content:center;
  align-items:center;
  padding: 24px;
  z-index: 60;
}
.modal-card{
  width: 560px;
  max-width: calc(100% - 48px);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,247,249,1));
  padding: 18px;
  box-shadow: 0 26px 60px rgba(20,20,40,0.16);
  border: 1px solid rgba(0,0,0,0.04);
}
.modal-inner{
  background: #f6f6f8;
  border-radius: 10px;
  padding: 20px 22px;
  position: relative;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.6);
}
.close-btn{
  position: absolute;
  right: 12px;
  top: 10px;
  background: rgba(255,255,255,0.6);
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #444;
  padding: 8px;
  border-radius: 8px;
  line-height: 1;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}
.close-btn:hover{ background: rgba(255,255,255,0.8); color:#111; }

/* form */
.incidencia-form{ display:flex; flex-direction:column; gap:12px; }
.modal-heading{ margin: 2px 0 6px; font-size: 15px; font-weight: 700; letter-spacing: 1px; }
.field{ display:flex; flex-direction:column; gap:8px; }
.label-text{ font-size: 12px; color: #6b6b6b; }
input[type="text"], input[type="number"] {
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.06);
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  color: #222;
}

/* buttons */
.btn-primary{
  background: #4F39F6;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(79,57,246,0.18);
}
.btn-primary:disabled{ opacity: 0.6; cursor: not-allowed; }

/* responsive */
@media (max-width: 760px){
  .content{ width: 94%; }
  .col-period{ min-width: 140px; }
  .col-name{ min-width: 100px; display:none; } /* hide name on small screens to save space */
  .col-actions{ width: 120px; }
  .action-text{ display:none; }
  .card-outer{ padding: 20px; }
  .card-inner{ padding: 12px; }
  .modal-card{ width: 96%; }
}
</style>