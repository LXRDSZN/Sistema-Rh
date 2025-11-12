<template>
  <div class="hist-root" role="region" aria-label="Historial de vacaciones">
    <div class="content">
      <h1 class="page-title">H I S T O R I A L</h1>

      <div class="hist-wrap" role="dialog" aria-modal="false" aria-label="Historial de solicitudes">
        <div class="card-outer" @click.self>
          <!-- Close "X" en el div padre -->
          <button class="close-x-outer" @click="goToVacaciones" aria-label="Regresar a Vacaciones">✕</button>

          <div class="card-inner" role="table" aria-label="Lista de solicitudes de vacaciones">
            <!-- Header row -->
            <div class="table-head" role="row">
              <div class="col col-no" role="columnheader">No</div>
              <div class="col col-date" role="columnheader">Fecha Solicitud</div>
              <div class="col col-days" role="columnheader">Días</div>
              <div class="col col-status" role="columnheader">Estado</div>
              <div class="col col-actions" aria-hidden="true"></div>
            </div>

            <!-- requests-wrap -->
            <div class="requests-wrap" role="region" aria-label="Contenedor de solicitudes">
              <ul class="rows" role="list">
                <li
                  v-for="(item, idx) in solicitudes"
                  :key="item.id"
                  class="row"
                  role="listitem"
                >
                  <div class="col col-no">{{ idx + 1 }}</div>

                  <div class="col col-date">
                    <div class="date-line">{{ formatDate(item.fecha_solicitud) }}</div>
                  </div>

                  <div class="col col-days">{{ item.dias_solicitados }} Días</div>

                  <div class="col col-status">
                    <div class="status">
                      <span class="status-label">{{ item.estado }}</span>
                      <span
                        class="status-dot"
                        :class="statusClass(item.estado)"
                        :aria-label="item.estado"
                        role="img"
                      ></span>
                    </div>
                  </div>

                  <div class="col col-actions">
                    <button
                      class="action-btn remove"
                      @click="deleteItem(item)"
                      :title="'Eliminar solicitud ' + (idx+1)"
                      aria-label="Eliminar solicitud"
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

                <li v-if="solicitudes.length === 0" class="empty" role="listitem">
                  <p v-if="loading">Cargando historial...</p>
                  <p v-else>No hay registros en el historial</p>
                </li>
              </ul>
            </div>
            <!-- fin requests-wrap -->
          </div>
        </div>
      </div>
      <!-- fin hist-wrap -->

      <!-- Modal para ver detalles -->
      <div v-if="detailsOpen" class="modal-backdrop" @click.self="closeDetails" role="dialog" aria-modal="true" aria-label="Detalles de solicitud">
        <div class="modal-card" @click.self="closeDetails">
          <div class="modal-inner" role="document">
            <button class="close-btn" @click="closeDetails" aria-label="Cerrar">✕</button>

            <div v-if="selectedSolicitud" class="details-view">
              <h3 class="modal-heading">Detalles de Solicitud</h3>

              <div class="detail-group">
                <label class="detail-label">Solicitud ID</label>
                <p class="detail-value">{{ selectedSolicitud.id }}</p>
              </div>

              <div class="detail-group">
                <label class="detail-label">Fecha de Solicitud</label>
                <p class="detail-value">{{ formatDate(selectedSolicitud.fecha_solicitud) }}</p>
              </div>

              <div class="detail-group">
                <label class="detail-label">Días Solicitados</label>
                <p class="detail-value">{{ selectedSolicitud.dias_solicitados }} días</p>
              </div>

              <div class="detail-group">
                <label class="detail-label">Estado</label>
                <p class="detail-value">
                  <span :class="['status-badge', 'status-' + selectedSolicitud.estado.toLowerCase()]">
                    {{ selectedSolicitud.estado }}
                  </span>
                </p>
              </div>

              <div v-if="selectedSolicitud.descripcion" class="detail-group">
                <label class="detail-label">Descripción</label>
                <p class="detail-value">{{ selectedSolicitud.descripcion }}</p>
              </div>

              <div v-if="selectedSolicitud.fecha_aprobacion" class="detail-group">
                <label class="detail-label">Fecha de Aprobación/Rechazo</label>
                <p class="detail-value">{{ formatDate(selectedSolicitud.fecha_aprobacion) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- fin modal detalles -->

      <!-- Notificación flotante -->
      <div v-if="notification.show" :class="['notification', 'notification-' + notification.type]">
        {{ notification.message }}
      </div>
    </div>
  </div>
</template>

<script>
import * as vacacionesService from '@/services/vacacionesService.js';

export default {
  name: 'HistorialVacaciones',
  data() {
    return {
      solicitudes: [],
      loading: true,
      detailsOpen: false,
      selectedSolicitud: null,
      notification: {
        show: false,
        message: '',
        type: 'success'
      }
    };
  },
  methods: {
    /**
     * Cargar solicitudes del historial
     */
    async loadSolicitudes() {
      this.loading = true;
      try {
        console.log('📋 Cargando historial de vacaciones...');

        // Obtener empleado actual
        const empleadoResp = await vacacionesService.getEmpleadoActual();

        if (!empleadoResp.success) {
          throw new Error('No se pudo obtener datos del empleado');
        }

        const empleadoId = empleadoResp.data.id;

        // Obtener solicitudes del empleado
        const solicitudesResp = await vacacionesService.getSolicitudesVacaciones(empleadoId);

        if (solicitudesResp.success) {
          this.solicitudes = solicitudesResp.data;
          console.log('✅ Historial cargado:', this.solicitudes.length);
        } else {
          throw new Error(solicitudesResp.message || 'Error al cargar historial');
        }
      } catch (error) {
        console.error('❌ Error cargando historial:', error);
        this.showNotification('Error al cargar el historial', 'error');
      } finally {
        this.loading = false;
      }
    },

    /**
     * Formatear fecha
     */
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const options = { day: '2-digit', month: 'short', year: 'numeric' };
      return date.toLocaleDateString('es-ES', options);
    },

    /**
     * Determinar clase de estado
     */
    statusClass(estado) {
      return {
        'Rechazada': 'st-rejected',
        'Aprobada': 'st-approved',
        'Pendiente': 'st-pending',
        'Cancelada': 'st-cancelled'
      }[estado] || 'st-pending';
    },

    /**
     * Eliminar solicitud
     */
    async deleteItem(solicitud) {
      if (!confirm(`¿Eliminar esta solicitud de ${solicitud.dias_solicitados} días?`)) {
        return;
      }

      try {
        console.log('🗑️ Eliminando solicitud:', solicitud.id);

        // Llamar al servicio para eliminar
        const resp = await vacacionesService.eliminarSolicitud(solicitud.id);

        if (resp.success) {
          // Remover del array local
          const idx = this.solicitudes.findIndex(s => s.id === solicitud.id);
          if (idx !== -1) {
            this.solicitudes.splice(idx, 1);
          }

          this.showNotification('Solicitud eliminada correctamente', 'success');
        } else {
          throw new Error(resp.message);
        }
      } catch (error) {
        console.error('❌ Error eliminando solicitud:', error);
        this.showNotification('Error al eliminar la solicitud', 'error');
      }
    },

    /**
     * Ver detalles de solicitud
     */
    viewDetails(solicitud) {
      this.selectedSolicitud = JSON.parse(JSON.stringify(solicitud));
      this.detailsOpen = true;
    },

    /**
     * Cerrar modal de detalles
     */
    closeDetails() {
      this.detailsOpen = false;
      this.selectedSolicitud = null;
    },

    /**
     * Mostrar notificación
     */
    showNotification(message, type = 'success') {
      this.notification = {
        show: true,
        message,
        type
      };

      setTimeout(() => {
        this.notification.show = false;
      }, 3000);
    },

    /**
     * Ir a Vacaciones
     */
    goToVacaciones() {
      if (this.$router) {
        this.$router.push({ path: '/Vacaciones', name: 'Vacaciones' });
      } else {
        window.location.href = '/#/Vacaciones';
      }
    }
  },
  mounted() {
    console.log('🎯 Componente HistorialVacaciones montado');
    this.loadSolicitudes();
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');

/* layout */
.hist-root {
  width: 100%;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  padding-top: 25px;
  padding-bottom: 36px;
  background: linear-gradient(180deg, #e9e9ec, #e9e9ec);
  font-family: 'Montserrat', system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}

.content {
  width: 820px;
  max-width: calc(100% - 32px);
  box-sizing: border-box;
}

.page-title {
  margin: 0 0 12px 8px;
  font-family: 'Montserrat', system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  font-weight: 700;
  letter-spacing: 8px;
  font-size: 18px;
  color: #111;
  text-transform: uppercase;
  align-self: flex-start;
}

.hist-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
}

.card-outer {
  position: relative;
  width: 100%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(247, 247, 249, 1));
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.04), 0 14px 36px rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
}

.close-x-outer {
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

.close-x-outer:hover {
  color: #111;
}

.card-inner {
  background: #ffffff;
  border-radius: 10px;
  padding: 16px;
  min-height: 420px;
  box-shadow: 0 10px 30px rgba(12, 12, 20, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
  max-width: 100%;
  box-sizing: border-box;
}

.table-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  color: #6b6b6b;
  font-size: 13px;
  margin-bottom: 12px;
  user-select: none;
  background: linear-gradient(180deg, rgba(250, 250, 252, 1), rgba(247, 247, 249, 1));
  border: 1px solid rgba(0, 0, 0, 0.02);
  font-weight: 600;
}

.requests-wrap {
  background: transparent;
  padding: 6px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.02);
  min-height: 300px;
  box-sizing: border-box;
  max-height: 520px;
  overflow: auto;
  scroll-behavior: smooth;
}

.col {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
}

.col-no {
  width: 44px;
  justify-content: flex-start;
  color: #6b6b6b;
  text-align: left;
  font-weight: 600;
}

.col-date {
  flex: 1 1 140px;
  min-width: 100px;
}

.col-days {
  width: 96px;
  justify-content: flex-start;
  color: #6b6b6b;
}

.col-status {
  width: 130px;
  justify-content: flex-start;
}

.col-actions {
  width: 100px;
  justify-content: flex-end;
}

.rows {
  list-style: none;
  margin: 0;
  padding: 0;
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 12px;
  box-shadow: 0 6px 18px rgba(13, 13, 20, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.03);
  transition: box-shadow 0.2s ease;
}

.row:hover {
  box-shadow: 0 8px 24px rgba(13, 13, 20, 0.08);
}

.date-line {
  font-weight: 600;
  color: #111;
  font-size: 13px;
}

.status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-label {
  font-size: 13px;
  color: #333;
  min-width: 80px;
  font-weight: 600;
}

.status-dot {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  display: inline-block;
  box-shadow: 0 6px 14px rgba(12, 12, 20, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.status-dot.st-rejected {
  background: #E7000B;
}

.status-dot.st-approved {
  background: #7CCF00;
}

.status-dot.st-pending {
  background: #FFBA00;
}

.status-dot.st-cancelled {
  background: #999999;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  background: transparent;
  color: #222;
  cursor: pointer;
  font-size: 13px;
  padding: 6px 8px;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.03);
}

.action-btn.remove {
  color: #666;
}

.empty {
  height: 240px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  color: #999;
  background: linear-gradient(180deg, rgba(250, 250, 252, 1), rgba(247, 247, 249, 1));
  border: 1px dashed rgba(0, 0, 0, 0.02);
}

.empty p {
  margin: 0;
  font-size: 14px;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 12, 0.42);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  z-index: 60;
}

.modal-card {
  width: 560px;
  max-width: calc(100% - 48px);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 247, 249, 1));
  padding: 18px;
  box-shadow: 0 26px 60px rgba(20, 20, 40, 0.16);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.modal-inner {
  background: #f6f6f8;
  border-radius: 10px;
  padding: 20px 22px;
  position: relative;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.close-btn {
  position: absolute;
  right: 12px;
  top: 10px;
  background: rgba(255, 255, 255, 0.6);
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #444;
  padding: 8px;
  border-radius: 8px;
  line-height: 1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.8);
  color: #111;
}

.modal-heading {
  margin: 2px 0 12px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 1px;
}

.details-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-label {
  font-size: 12px;
  color: #6b6b6b;
  font-weight: 600;
}

.detail-value {
  margin: 0;
  font-size: 13px;
  color: #222;
  padding: 8px 10px;
  background: white;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-rechazada {
  background: #f8d7da;
  color: #721c24;
}

.status-aprobada {
  background: #d4edda;
  color: #155724;
}

.status-pendiente {
  background: #fff3cd;
  color: #856404;
}

.status-cancelada {
  background: #e2e3e5;
  color: #383d41;
}

/* Notificación */
.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  z-index: 100;
  animation: slideIn 0.3s ease-out;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.notification-success {
  background: #4caf50;
  color: white;
}

.notification-error {
  background: #f44336;
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 760px) {
  .content {
    width: 94%;
  }
  .col-date {
    flex: 1 1 100px;
    min-width: 80px;
  }
  .col-actions {
    width: 80px;
  }
  .card-outer {
    padding: 20px;
  }
  .card-inner {
    padding: 12px;
  }
  .modal-card {
    width: 96%;
  }
}
</style>