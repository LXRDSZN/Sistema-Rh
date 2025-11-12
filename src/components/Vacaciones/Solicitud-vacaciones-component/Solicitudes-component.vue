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
              <div class="col col-date" role="columnheader">Fecha Solicitud</div>
              <div class="col col-days" role="columnheader">Días</div>
              <div class="col col-name" role="columnheader">Nombre</div>
              <div class="col col-status" role="columnheader">Estado</div>
              <div class="col col-actions" aria-hidden="true"></div>
            </div>

            <!-- Contenedor que mantiene cada solicitud en su propio sub-div -->
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

                  <div class="col col-date">
                    <div class="date-line">{{ formatDate(req.fecha_solicitud) }}</div>
                  </div>

                  <div class="col col-days">{{ req.dias_solicitados }} Días</div>

                  <div class="col col-name">
                    <div class="name-line" :title="req.nombre_empleado">{{ truncate(req.nombre_empleado, 28) }}</div>
                  </div>

                  <div class="col col-status">
                    <span :class="['status-badge', 'status-' + req.estado.toLowerCase()]">
                      {{ req.estado }}
                    </span>
                  </div>

                  <div class="col col-actions">
                    <button 
                      v-if="req.estado === 'Pendiente'"
                      class="action-btn approve" 
                      @click="approveRequest(req)" 
                      :title="'Aprobar solicitud ' + (idx+1)" 
                      aria-label="Aprobar solicitud"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                        <path d="M20 6L9 17l-5-5" stroke="#2b8a00" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span class="action-text">Aprobar</span>
                    </button>

                    <button 
                      v-if="req.estado === 'Pendiente'"
                      class="action-btn reject" 
                      @click="rejectRequest(req)" 
                      :title="'Rechazar solicitud ' + (idx+1)" 
                      aria-label="Rechazar solicitud"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                        <path d="M18 6L6 18M6 6l12 12" stroke="#d32f2f" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span class="action-text">Rechazar</span>
                    </button>

                    <button 
                      v-if="req.estado === 'Aprobada'"
                      class="action-btn cancel" 
                      @click="cancelRequest(req)" 
                      :title="'Cancelar solicitud ' + (idx+1)" 
                      aria-label="Cancelar solicitud"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                        <path d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="#666" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M10 11v6M14 11v6" stroke="#666" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span class="action-text">Cancelar</span>
                    </button>
                  </div>
                </div>
              </template>

              <div v-else class="empty">
                <p v-if="loading" class="loading-text">Cargando solicitudes...</p>
                <p v-else class="empty-text">No hay solicitudes de vacaciones</p>
              </div>
            </div>
            <!-- fin requests-wrap -->
          </div>
        </div>
      </div>

      <!-- Modal para ver detalles -->
      <div v-if="detailsOpen" class="modal-backdrop" @click.self="closeDetails" role="dialog" aria-modal="true" aria-label="Detalles de solicitud">
        <div class="modal-card" @click.self="closeDetails">
          <div class="modal-inner" role="document">
            <button class="close-btn" @click="closeDetails" aria-label="Cerrar">✕</button>

            <div v-if="selectedRequest" class="details-view">
              <h3 class="modal-heading">Detalles de Solicitud</h3>

              <div class="detail-group">
                <label class="detail-label">Solicitud ID</label>
                <p class="detail-value">{{ selectedRequest.id }}</p>
              </div>

              <div class="detail-group">
                <label class="detail-label">Nombre del Empleado</label>
                <p class="detail-value">{{ selectedRequest.nombre_empleado }}</p>
              </div>

              <div class="detail-group">
                <label class="detail-label">Departamento</label>
                <p class="detail-value">{{ selectedRequest.departamento || 'Sin asignar' }}</p>
              </div>

              <div class="detail-group">
                <label class="detail-label">Fecha de Solicitud</label>
                <p class="detail-value">{{ formatDate(selectedRequest.fecha_solicitud) }}</p>
              </div>

              <div class="detail-group">
                <label class="detail-label">Días Solicitados</label>
                <p class="detail-value">{{ selectedRequest.dias_solicitados }} días</p>
              </div>

              <div class="detail-group">
                <label class="detail-label">Estado</label>
                <p class="detail-value">
                  <span :class="['status-badge', 'status-' + selectedRequest.estado.toLowerCase()]">
                    {{ selectedRequest.estado }}
                  </span>
                </p>
              </div>

              <div v-if="selectedRequest.descripcion" class="detail-group">
                <label class="detail-label">Descripción</label>
                <p class="detail-value">{{ selectedRequest.descripcion }}</p>
              </div>

              <div v-if="selectedRequest.fecha_aprobacion" class="detail-group">
                <label class="detail-label">Fecha de Aprobación</label>
                <p class="detail-value">{{ formatDate(selectedRequest.fecha_aprobacion) }}</p>
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
  name: 'SolicitudesVacaciones',
  data() {
    return {
      requests: [],
      loading: true,
      detailsOpen: false,
      selectedRequest: null,
      notification: {
        show: false,
        message: '',
        type: 'success' // 'success', 'error', 'info'
      }
    };
  },
  methods: {
    /**
     * Cargar todas las solicitudes de vacaciones
     */
    async loadRequests() {
      this.loading = true;
      try {
        console.log('📋 Cargando solicitudes de vacaciones...');

        // Primero obtener el empleado actual
        const empleadoResp = await vacacionesService.getEmpleadoActual();

        if (!empleadoResp.success) {
          throw new Error('No se pudo obtener datos del empleado');
        }

        const empleadoId = empleadoResp.data.id;

        // Obtener solicitudes del empleado
        const solicitudesResp = await vacacionesService.getSolicitudesVacaciones(empleadoId);

        if (solicitudesResp.success) {
          // Mapear las solicitudes y agregar datos adicionales
          this.requests = solicitudesResp.data.map(sol => ({
            ...sol,
            nombre_empleado: empleadoResp.data.nombre,
            departamento: empleadoResp.data.departamento
          }));

          console.log('✅ Solicitudes cargadas:', this.requests.length);
        } else {
          throw new Error(solicitudesResp.message || 'Error al cargar solicitudes');
        }
      } catch (error) {
        console.error('❌ Error cargando solicitudes:', error);
        this.showNotification('Error al cargar las solicitudes', 'error');
      } finally {
        this.loading = false;
      }
    },

    /**
     * Formatear fecha a formato legible
     */
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const options = { day: '2-digit', month: 'short', year: 'numeric' };
      return date.toLocaleDateString('es-ES', options);
    },

    /**
     * Truncar texto
     */
    truncate(text, n = 20) {
      if (!text) return '';
      return text.length > n ? text.slice(0, n - 1) + '…' : text;
    },

    /**
     * Aprobar solicitud de vacaciones
     */
    async approveRequest(req) {
      if (!confirm(`¿Aprobar la solicitud de vacaciones de ${req.dias_solicitados} días?`)) {
        return;
      }

      try {
        console.log('✅ Aprobando solicitud:', req.id);

        // Llamar al servicio para aprobar
        const resp = await vacacionesService.aprobarSolicitud(req.id);

        if (resp.success) {
          // Actualizar el estado local
          const idx = this.requests.findIndex(r => r.id === req.id);
          if (idx !== -1) {
            this.requests[idx].estado = 'Aprobada';
            this.requests[idx].fecha_aprobacion = new Date().toISOString().split('T')[0];
          }

          this.showNotification('Solicitud aprobada correctamente', 'success');
        } else {
          throw new Error(resp.message);
        }
      } catch (error) {
        console.error('❌ Error aprobando solicitud:', error);
        this.showNotification('Error al aprobar la solicitud', 'error');
      }
    },

    /**
     * Rechazar solicitud de vacaciones
     */
    async rejectRequest(req) {
      if (!confirm(`¿Rechazar la solicitud de vacaciones de ${req.dias_solicitados} días?`)) {
        return;
      }

      try {
        console.log('❌ Rechazando solicitud:', req.id);

        // Llamar al servicio para rechazar
        const resp = await vacacionesService.rechazarSolicitud(req.id);

        if (resp.success) {
          // Actualizar el estado local
          const idx = this.requests.findIndex(r => r.id === req.id);
          if (idx !== -1) {
            this.requests[idx].estado = 'Rechazada';
            this.requests[idx].fecha_aprobacion = new Date().toISOString().split('T')[0];
          }

          this.showNotification('Solicitud rechazada', 'success');
        } else {
          throw new Error(resp.message);
        }
      } catch (error) {
        console.error('❌ Error rechazando solicitud:', error);
        this.showNotification('Error al rechazar la solicitud', 'error');
      }
    },

    /**
     * Cancelar solicitud aprobada
     */
    async cancelRequest(req) {
      if (!confirm(`¿Cancelar la solicitud aprobada de ${req.dias_solicitados} días?`)) {
        return;
      }

      try {
        console.log('🔄 Cancelando solicitud:', req.id);

        // Llamar al servicio para cancelar
        const resp = await vacacionesService.cancelarSolicitud(req.id);

        if (resp.success) {
          // Actualizar el estado local
          const idx = this.requests.findIndex(r => r.id === req.id);
          if (idx !== -1) {
            this.requests[idx].estado = 'Cancelada';
          }

          this.showNotification('Solicitud cancelada', 'success');
        } else {
          throw new Error(resp.message);
        }
      } catch (error) {
        console.error('❌ Error cancelando solicitud:', error);
        this.showNotification('Error al cancelar la solicitud', 'error');
      }
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
     * Cerrar modal de detalles
     */
    closeDetails() {
      this.detailsOpen = false;
      this.selectedRequest = null;
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
    console.log('🎯 Componente SolicitudesVacaciones montado');
    this.loadRequests();
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
  padding-top: 24px;
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
  margin: 0 0 18px 8px;
  font-weight: 700;
  letter-spacing: 6px;
  font-size: 18px;
  color: #111;
  text-transform: uppercase;
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

.solicitud-card {
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

.solicitud-card:hover {
  box-shadow: 0 8px 24px rgba(13, 13, 20, 0.08);
}

.col {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  box-sizing: border-box;
}

.col-no {
  width: 44px;
  color: #6b6b6b;
  font-weight: 600;
}

.col-date {
  flex: 1 1 140px;
  min-width: 100px;
}

.col-days {
  width: 90px;
  color: #6b6b6b;
}

.col-name {
  flex: 1 1 240px;
  min-width: 140px;
}

.col-status {
  width: 120px;
}

.col-actions {
  width: 180px;
  justify-content: flex-end;
  display: flex;
  gap: 8px;
}

.date-line {
  font-weight: 600;
  color: #111;
  font-size: 13px;
}

.name-line {
  font-size: 13px;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.status-pendiente {
  background: #fff3cd;
  color: #856404;
}

.status-aprobada {
  background: #d4edda;
  color: #155724;
}

.status-rechazada {
  background: #f8d7da;
  color: #721c24;
}

.status-cancelada {
  background: #e2e3e5;
  color: #383d41;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: #222;
  cursor: pointer;
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.04);
}

.action-text {
  display: inline-block;
  font-size: 12px;
  color: #111;
}

.action-btn.approve svg {
  stroke: #2b8a00;
}

.action-btn.reject svg {
  stroke: #d32f2f;
}

.action-btn.cancel svg {
  stroke: #666;
}

.empty {
  height: 200px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  color: #999;
  background: linear-gradient(180deg, rgba(250, 250, 252, 1), rgba(247, 247, 249, 1));
  border: 1px dashed rgba(0, 0, 0, 0.02);
}

.loading-text,
.empty-text {
  margin: 0;
  font-size: 14px;
}

/* Modal styles */
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

/* Notificación flotante */
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

.notification-info {
  background: #2196f3;
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
  .col-name {
    display: none;
  }
  .col-date {
    flex: 1 1 100px;
    min-width: 80px;
  }
  .col-actions {
    width: 100px;
  }
  .action-text {
    display: none;
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