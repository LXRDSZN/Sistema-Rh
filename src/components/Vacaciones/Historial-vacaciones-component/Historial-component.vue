<template>
  <div class="hist-root" role="region" aria-label="Historial de vacaciones">
    <div class="page-frame">
      <h2 class="page-title">H I S T O R I A L</h2>

      <div class="card">
        <!-- Header row with small controls icon on right -->
        <div class="table-head" role="row">
          <div class="col col-no">No</div>
          <div class="col col-period">Periodo</div>
          <div class="col col-days">Días</div>
          <div class="col col-status">Estado</div>
          <div class="col col-actions" aria-hidden="true">
            <button class="icon-btn" title="Opciones de vista">
              <!-- simple funnel / filter icon -->
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                <path d="M3 5h18M6 12h12M10 19h4" stroke="#6b6b6b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- List of records -->
        <ul class="rows" role="list">
          <li
            v-for="(item, idx) in items"
            :key="item.id"
            class="row"
            role="listitem"
          >
            <div class="col col-no">{{ idx + 1 }}</div>

            <div class="col col-period">
              <div class="period-line">{{ item.periodShort }}</div>
              <div class="period-sub">{{ item.periodFull }}</div>
            </div>

            <div class="col col-days">{{ item.days }} Días</div>

            <div class="col col-status">
              <div class="status">
                <span class="status-label">{{ statusLabel(item.status) }}</span>
                <span
                  class="status-dot"
                  :class="statusClass(item.status)"
                  :aria-label="statusLabel(item.status)"
                  role="img"
                ></span>
              </div>
            </div>

            <div class="col col-actions">
              <button
                class="action-btn"
                @click="openRequest(item)"
                :title="'Ver solicitud ' + (idx+1)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                  <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="#222" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M15 3h6v6" stroke="#222" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M10 14L21 3" stroke="#222" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="action-text">Solicitud</span>
              </button>

              <button
                class="action-btn remove"
                @click="removeItem(item)"
                :title="'Eliminar registro ' + (idx+1)"
                aria-label="Eliminar registro"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                  <path d="M3 6h18" stroke="#666" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="#666" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M10 11v6M14 11v6" stroke="#666" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="#666" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </li>

          <!-- show empty area like image -->
          <li v-if="items.length === 0" class="empty">No hay registros</li>
        </ul>
      </div>
    </div>

    <!-- Modal: Re-using the incidencia form (view / edit) -->
    <div v-if="modalOpen" class="modal-backdrop" role="dialog" aria-modal="true" :aria-label="modalTitle">
      <div class="modal-card" @click.self="closeModal">
        <div class="modal-inner" role="document">
          <button class="close-btn" @click="closeModal" aria-label="Cerrar">✕</button>

          <form class="incidencia-form" @submit.prevent="saveModal">
            <h3 class="modal-heading">{{ modalTitle }}</h3>

            <label class="field">
              <span class="label-text">Usuario (Empleado)</span>
              <input v-model="editing.usuario" type="text" />
            </label>

            <label class="field">
              <span class="label-text">Periodo</span>
              <input v-model="editing.periodFull" type="text" />
            </label>

            <label class="field">
              <span class="label-text">Días</span>
              <input v-model.number="editing.days" type="number" min="0" />
            </label>

            <label class="field">
              <span class="label-text">Estado</span>
              <select v-model="editing.status" class="select-status">
                <option value="approved">Aprobado</option>
                <option value="rejected">Rechazada</option>
                <option value="pending">Pendiente</option>
              </select>
            </label>

            <label class="field">
              <span class="label-text">Descripción</span>
              <textarea v-model="editing.descripcion" rows="4"></textarea>
            </label>

            <div class="row actions">
              <div class="upload">
                <label for="fileInputModal" class="upload-label" :title="editing.fileName || 'Agregar'">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                    <path d="M12 3v12" stroke="#222" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 7l4-4 4 4" stroke="#222" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M21 21H3" stroke="#222" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span class="upload-text">{{ editing.fileName || 'Adjuntar' }}</span>
                </label>
                <input id="fileInputModal" class="file-input" type="file" @change="onModalFile" />
                <div class="upload-hint">Acta emitida</div>
              </div>

              <div class="submit-wrap">
                <button class="btn-primary" type="submit">{{ saving ? 'Guardando...' : 'Guardar' }}</button>
              </div>
            </div>

            <p class="form-note" aria-live="polite">{{ modalNote }}</p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HistorialVacaciones',
  data() {
    return {
      items: [
        {
          id: 'r1',
          periodShort: 'De Ago 25 a Ago 29',
          periodFull: 'De Agosto 25 al Agosto 29',
          days: 5,
          status: 'rejected',
          usuario: 'Juan Perez',
          descripcion: 'Solicitud rechazada por coincidencia de fechas',
          fileName: '',
        },
        {
          id: 'r2',
          periodShort: 'De Sep 01 a Sep 05',
          periodFull: 'De Septiembre 01 al Septiembre 05',
          days: 5,
          status: 'approved',
          usuario: 'Ana Gómez',
          descripcion: 'Aprobado por RRHH',
          fileName: '',
        },
        {
          id: 'r3',
          periodShort: 'De Sep 08 a Sep 12',
          periodFull: 'De Septiembre 08 al Septiembre 12',
          days: 5,
          status: 'pending',
          usuario: 'Luis Díaz',
          descripcion: 'Pendiente por verificación',
          fileName: '',
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
      return this.editing ? `Solicitud - ${this.editing.usuario || 'Sin usuario'}` : 'Solicitud';
    }
  },
  methods: {
    statusClass(status) {
      // map status to a CSS class for dot color
      return {
        rejected: 'st-rejected',
        approved: 'st-approved',
        pending: 'st-pending'
      }[status] || 'st-pending';
    },
    statusLabel(status) {
      return {
        rejected: 'Rechazada',
        approved: 'Aprobado',
        pending: 'Pendiente'
      }[status] || 'Pendiente';
    },
    openRequest(item) {
      // open modal with a clone of the item so changes don't apply until saved
      this.editing = JSON.parse(JSON.stringify(item));
      this.modalNote = '';
      this.modalOpen = true;
    },
    closeModal() {
      this.modalOpen = false;
      this.editing = null;
      this.saving = false;
      this.modalNote = '';
    },
    onModalFile(e) {
      const f = e.target.files && e.target.files[0];
      if (f && this.editing) {
        this.editing.fileName = f.name;
        // If desired you can store the file object as well:
        this.editing.file = f;
      }
    },
    saveModal() {
      if (!this.editing) return;
      // Basic validation
      if (!this.editing.usuario || !this.editing.periodFull) {
        this.modalNote = 'Complete usuario y periodo.';
        return;
      }
      this.saving = true;
      this.modalNote = 'Guardando...';

      // simulate API save delay
      setTimeout(() => {
        // find and update original item
        const idx = this.items.findIndex(i => i.id === this.editing.id);
        if (idx !== -1) {
          this.items.splice(idx, 1, { ...this.editing });
        } else {
          // If it was a new item, push
          this.items.push({ ...this.editing, id: 'r' + (Math.random() * 1e6).toFixed(0) });
        }
        this.saving = false;
        this.modalNote = 'Guardado correctamente (simulado).';
        setTimeout(() => {
          this.closeModal();
        }, 700);
      }, 800);
    },
    removeItem(item) {
      if (!confirm('¿Eliminar este registro?')) return;
      const idx = this.items.findIndex(i => i.id === item.id);
      if (idx !== -1) this.items.splice(idx, 1);
    }
  }
};
</script>

<style scoped>
/* Fonts and base */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');

:root{
  --bg: #e9e9ec; /* page light gray as in image */
  --panel-bg: #ffffff;
  --muted: #8a8a8a;
  --title: #111;
  --card-shadow: 0 8px 20px rgba(12,12,20,0.06);
  --rejected: #E7000B;
  --approved: #7CCF00;
  --pending: #FFBA00;
}

/* Root layout similar to screenshot */
.hist-root{
  min-height: 100vh;
  background: linear-gradient(90deg, var(--bg) 0%, var(--bg) 100%);
  padding: 28px 36px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  font-family: 'Montserrat', system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  color: var(--title);
}

/* page frame matches white card area in image */
.page-frame{
  width: 820px;
  max-width: calc(100% - 48px);
  background: transparent;
}

/* Header text with spaced letters */
.page-title{
  margin: 4px 0 18px 8px;
  font-size: 18px;
  letter-spacing: 8px;
  font-weight: 700;
  color: #111;
  text-transform: uppercase;
}

/* main white card container */
.card{
  background: var(--panel-bg);
  border-radius: 10px;
  padding: 18px;
  box-shadow: var(--card-shadow);
  min-height: 420px;
}

/* table-like header */
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
}

/* columns */
.col{
  display:flex;
  align-items:center;
  gap:8px;
  padding: 6px 8px;
}

/* sizing for each column */
.col-no{ width: 40px; justify-content: flex-start; color: #6b6b6b; }
.col-period{ flex: 1 1 420px; min-width: 260px; }
.col-days{ width: 90px; justify-content: flex-start; color: #6b6b6b; }
.col-status{ width: 120px; justify-content: flex-start; }
.col-actions{ width: 160px; justify-content: flex-end; }

/* rows list */
.rows{
  list-style: none;
  margin: 0;
  padding: 0;
}

/* each row looks like the image: card with subtle shadow */
.row{
  display:flex;
  align-items:center;
  gap:12px;
  background: #fff;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 12px;
  box-shadow: 0 6px 18px rgba(13,13,20,0.04);
}

/* period lines */
.period-line{ font-weight: 600; color: #111; font-size: 13px; }
.period-sub{ font-size: 12px; color: #8a8a8a; margin-top: 2px; }

/* status area */
.status{ display:flex; align-items:center; gap:10px; }
.status-label{ font-size: 13px; color: #333; }
.status-dot{
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display:inline-block;
  box-shadow: 0 6px 14px rgba(12,12,20,0.06);
  border: 1px solid rgba(0,0,0,0.04);
}

.status-dot.st-rejected{ background: var(--rejected); }
.status-dot.st-approved{ background: var(--approved); }
.status-dot.st-pending{ background: var(--pending); }

/* actions buttons */
.action-btn{
  display:inline-flex;
  align-items:center;
  gap:8px;
  border: none;
  background: transparent;
  color: #222;
  cursor: pointer;
  font-size: 13px;
  padding: 6px 8px;
  border-radius: 8px;
}
.action-btn:hover{ background: rgba(0,0,0,0.03); }

.action-btn.remove{
  margin-left: 8px;
  color: #666;
}
.action-text{ font-size: 13px; color: #111; }

/* empty state */
.empty{
  height: 240px;
  border-radius: 8px;
  display:flex;
  align-items:flex-start;
  padding: 18px;
  color: #999;
}

/* Modal styles - reusing previous form visuals but adjusted */
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
}

.modal-inner{
  background: #f6f6f8;
  border-radius: 10px;
  padding: 20px 22px;
  position: relative;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.6);
}

/* close button */
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

/* inputs */
input[type="text"], input[type="number"], textarea, .select-status {
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.06);
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  color: #222;
}
textarea{ resize: vertical; min-height: 72px; }

/* action row */
.row.actions{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:6px; }
.upload{ display:flex; flex-direction:column; gap:6px; }
.upload-label{
  display:inline-flex;
  align-items:center;
  gap:8px;
  cursor:pointer;
  color:#222;
  font-size:14px;
  user-select:none;
}
.file-input{ display:none; }
.upload-hint{ font-size:12px; color:#8a8a8a; }

/* primary button */
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

/* small utilities */
.icon-btn{
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
}
.icon-btn:hover{ background: rgba(0,0,0,0.03); }

/* Responsive */
@media (max-width: 760px){
  .page-frame{ width: 100%; }
  .col-period{ min-width: 160px; }
  .col-actions{ width: 140px; }
  .action-text{ display:none; }
  .card{ padding: 12px; }
  .row{ padding: 10px; }
  .modal-card{ width: 96%; }
}
</style>