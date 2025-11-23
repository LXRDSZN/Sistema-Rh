<template>
  <div class="registro-huellas-container">
    <div class="header">
      <h1>Registro de Huellas Dactilares</h1>
    </div>

    <div class="content-wrapper">

    <!-- Configuración ESP32 -->
    <div class="esp32-config">
      <div class="config-card">
        <h3>Configuración del Sensor</h3>
        <div class="config-row">
          <label>IP del ESP32:</label>
          <input 
            v-model="esp32Ip" 
            type="text" 
            placeholder="192.168.1.100"
            class="ip-input"
            @input="saveESP32Ip"
          />
          <button @click="checkConnection" class="btn-check">
            {{ connectionStatus === 'connected' ? '✅' : connectionStatus === 'checking' ? '⏳' : '🔌' }} 
            Verificar Conexión
          </button>
        </div>
        
        <div v-if="sensorStatus" class="sensor-status">
          <div class="status-row">
            <span>Estado:</span>
            <span :class="{'status-ok': sensorStatus.ready, 'status-error': !sensorStatus.ready}">
              {{ sensorStatus.ready ? '✅ Listo' : '❌ Error' }}
            </span>
          </div>
          <div class="status-row">
            <span>Huellas guardadas:</span>
            <span class="status-info">{{ sensorStatus.stored }} / {{ sensorStatus.capacity }}</span>
          </div>
          <div class="status-row">
            <span>Último resultado:</span>
            <span class="status-info">{{ sensorStatus.result }}</span>
          </div>
          <div class="status-row">
            <span>Escaneo automático:</span>
            <span :class="sensorStatus.scanning ? 'status-ok' : 'status-warning'">
              {{ sensorStatus.scanning ? '🟢 Activo' : '🔴 Pausado' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Búsqueda y filtros -->
    <div class="search-filters">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Buscar por nombre, área o puesto..."
        class="search-input"
      />
      <select v-model="filterHuella" class="filter-select">
        <option value="">Todas las huellas</option>
        <option value="sin-huella">Sin huella registrada</option>
        <option value="con-huella">Con huella registrada</option>
      </select>
    </div>

    <!-- Tabla de contratos -->
    <div class="contratos-table-container">
      <div class="table-header-info">
        <span class="table-count">📋 Empleados disponibles: <strong>{{ filteredContratos.length }}</strong></span>
        <button @click="limpiarTodasHuellas" class="btn-clear-small" :disabled="clearing || contratoConHuella === 0">
          {{ clearing ? '⏳ Limpiando...' : '🗑️ Limpiar todas' }}
        </button>
      </div>
      <table class="contratos-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Foto</th>
            <th>Nombre Completo</th>
            <th>Puesto</th>
            <th>Área</th>
            <th>Estado</th>
            <th>Huella ID</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <!-- Cuerpos separados para estados y lista animada -->
        <tbody v-if="loading">
          <tr>
            <td colspan="8" class="loading-row">
              <div class="loader">Cargando contratos...</div>
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="filteredContratos.length === 0">
          <tr>
            <td colspan="8" class="empty-row">
              No se encontraron contratos
            </td>
          </tr>
        </tbody>
        <transition-group name="rows" tag="tbody" v-else>
          <tr v-for="(contrato, index) in filteredContratos" :key="contrato.contrato_id" class="contrato-row">
            <td class="number-cell">{{ index + 1 }}</td>
            <td>
              <img 
                :src="contrato.avatar || '/default-avatar.png'" 
                :alt="contrato.nombre_completo"
                class="avatar"
              />
            </td>
            <td class="nombre-cell">{{ contrato.nombre_completo }}</td>
            <td>{{ contrato.puesto }}</td>
            <td>{{ contrato.area }}</td>
            <td>
              <span class="badge badge-estado">{{ contrato.estado_contrato }}</span>
            </td>
            <td class="huella-cell">
              <span v-if="contrato.huella_id" class="huella-id">
                ID: {{ contrato.huella_id }}
              </span>
              <span v-else class="sin-huella">Sin registrar</span>
            </td>
            <td class="actions-cell">
              <button 
                v-if="!contrato.huella_id"
                @click="registrarHuella(contrato)" 
                class="btn-registrar"
                :disabled="enrolling || !esp32Ip || connectionStatus !== 'connected'"
              >
                {{ enrolling && selectedContrato?.contrato_id === contrato.contrato_id 
                  ? '⏳ Registrando...' 
                  : 'Registrar' }}
              </button>
              <div v-else class="acciones-huella">
                <span class="huella-registrada">✅ Huella registrada</span>
                <button 
                  @click="eliminarHuella(contrato)" 
                  class="btn-eliminar"
                  :disabled="deleting"
                  title="Eliminar esta huella"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </transition-group>
      </table>
    </div>

    <!-- Modal de proceso de enrolado -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ modalTitle }}</h2>
          <button @click="closeModal" class="btn-close">✖</button>
        </div>
        <div class="modal-body">
          <p>{{ modalMessage }}</p>
          <div v-if="enrolling" class="progress-steps">
            <div class="step" :class="{'active': enrollStep >= 1}">
              <span class="step-number">1</span>
              <span class="step-text">Coloca el dedo en el sensor</span>
            </div>
            <div class="step" :class="{'active': enrollStep >= 2}">
              <span class="step-number">2</span>
              <span class="step-text">Retira el dedo</span>
            </div>
            <div class="step" :class="{'active': enrollStep >= 3}">
              <span class="step-number">3</span>
              <span class="step-text">Coloca el mismo dedo de nuevo</span>
            </div>
            <div class="step" :class="{'active': enrollStep >= 4}">
              <span class="step-number">4</span>
              <span class="step-text">Procesando y guardando...</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button v-if="!enrolling" @click="closeModal" class="btn-modal">Cerrar</button>
        </div>
      </div>
    </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useSidebar } from '@/composables/useSidebar';
import { 
  getContratos, 
  updateHuellaId, 
  getESP32Status,
  getESP32StatusSafe,
  enrollFingerprint,
  deleteFingerprint,
  clearAllFingerprints
} from '@/services/huellasService.js';

const { isSidebarOpen } = useSidebar();

// Estado
const contratos = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const filterHuella = ref('');

// ESP32
const esp32Ip = ref(localStorage.getItem('esp32_ip') || '');
const connectionStatus = ref('disconnected'); // 'disconnected', 'checking', 'connected'
const sensorStatus = ref(null);

// Enrolado
const enrolling = ref(false);
const clearing = ref(false);
const deleting = ref(false);
const selectedContrato = ref(null);
const showModal = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');
const enrollStep = ref(0);

// Auto-refresh de estado del sensor
let statusInterval = null;

// Sidebar layout
const contentMarginLeft = computed(() => isSidebarOpen.value ? '260px' : '60px');
const contentWidth = computed(() => isSidebarOpen.value ? 'calc(100vw - 260px)' : 'calc(100vw - 60px)');

// Computed para contar contratos con huella
const contratoConHuella = computed(() => {
  return contratos.value.filter(c => c.huella_id).length;
});

// Computed
const filteredContratos = computed(() => {
  let result = contratos.value;

  // Filtro de búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(c => 
      c.nombre_completo.toLowerCase().includes(query) ||
      c.puesto.toLowerCase().includes(query) ||
      c.area.toLowerCase().includes(query)
    );
  }

  // Filtro por huella
  if (filterHuella.value === 'sin-huella') {
    result = result.filter(c => !c.huella_id);
  } else if (filterHuella.value === 'con-huella') {
    result = result.filter(c => c.huella_id);
  }

  return result;
});

// Métodos
const cargarContratos = async () => {
  loading.value = true;
  try {
    const response = await getContratos();
    if (response.ok) {
      contratos.value = response.contratos;
    }
  } catch (error) {
    console.error('Error al cargar contratos:', error);
    alert('Error al cargar los contratos. Verifica tu conexión.');
  } finally {
    loading.value = false;
  }
};

const saveESP32Ip = () => {
  localStorage.setItem('esp32_ip', esp32Ip.value);
  connectionStatus.value = 'disconnected';
};

const checkConnection = async () => {
  if (!esp32Ip.value) {
    alert('Por favor, ingresa la IP del ESP32');
    return;
  }

  connectionStatus.value = 'checking';
  try {
    const status = await getESP32Status(esp32Ip.value);
    sensorStatus.value = status;
    connectionStatus.value = 'connected';
    
    // Iniciar auto-refresh del estado
    if (statusInterval) clearInterval(statusInterval);
    statusInterval = setInterval(updateSensorStatus, 3000);
  } catch (error) {
    connectionStatus.value = 'disconnected';
    sensorStatus.value = null;
    alert('No se pudo conectar al ESP32. Verifica la IP y que esté en la misma red.');
  }
};

const updateSensorStatus = async () => {
  if (connectionStatus.value !== 'connected' || !esp32Ip.value) return;
  const status = await getESP32StatusSafe(esp32Ip.value);
  sensorStatus.value = status;
};

const registrarHuella = async (contrato) => {
  if (connectionStatus.value !== 'connected') {
    alert('Primero conecta con el ESP32');
    return;
  }

  selectedContrato.value = contrato;
  enrolling.value = true;
  enrollStep.value = 0;
  showModal.value = true;
  modalTitle.value = '🔐 Registrando Huella';
  modalMessage.value = `Registrando huella para: ${contrato.nombre_completo}`;

  try {
    // Simular pasos del proceso
    enrollStep.value = 1;
    modalMessage.value = 'Paso 1: Coloca el dedo en el sensor...';
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    enrollStep.value = 2;
    modalMessage.value = 'Paso 2: Retira el dedo...';
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    enrollStep.value = 3;
    modalMessage.value = 'Paso 3: Coloca el mismo dedo de nuevo...';
    
    // Llamar al ESP32
    const response = await enrollFingerprint(esp32Ip.value);
    
    if (response.ok) {
      enrollStep.value = 4;
      modalMessage.value = 'Paso 4: Procesando y guardando...';
      
      // Extraer ID de huella del mensaje
      const match = response.msg.match(/ID (\d+)/);
      const huellaId = match ? parseInt(match[1]) : null;
      
      if (huellaId) {
        // Actualizar en la base de datos
        const updateResponse = await updateHuellaId(contrato.contrato_id, huellaId);
        
        if (updateResponse.ok) {
          modalTitle.value = '✅ Huella Registrada';
          modalMessage.value = `¡Huella registrada exitosamente con ID ${huellaId}!`;
          
          // Actualizar lista local
          const index = contratos.value.findIndex(c => c.contrato_id === contrato.contrato_id);
          if (index !== -1) {
            contratos.value[index].huella_id = huellaId;
          }
          
          await updateSensorStatus();
        } else {
          throw new Error('Error al actualizar en la base de datos');
        }
      } else {
        throw new Error('No se pudo obtener el ID de la huella');
      }
    } else {
      throw new Error(response.msg || 'Error al enrolar huella');
    }
  } catch (error) {
    modalTitle.value = '❌ Error';
    modalMessage.value = `Error: ${error.message}`;
    console.error('Error al registrar huella:', error);
  } finally {
    enrolling.value = false;
    setTimeout(() => {
      if (!enrolling.value) {
        showModal.value = false;
        enrollStep.value = 0;
      }
    }, 3000);
  }
};

const limpiarTodasHuellas = async () => {
  if (!confirm(`¿Estás seguro de que deseas eliminar TODAS las ${contratoConHuella.value} huellas registradas? Esta acción no se puede deshacer.`)) {
    return;
  }

  if (connectionStatus.value !== 'connected') {
    alert('Primero conecta con el ESP32');
    return;
  }

  clearing.value = true;
  try {
    // Limpiar el sensor
    const response = await clearAllFingerprints(esp32Ip.value);
    
    if (response.ok) {
      // Actualizar todas las huellas a NULL en la base de datos
      for (const contrato of contratos.value) {
        if (contrato.huella_id) {
          await updateHuellaId(contrato.contrato_id, null);
        }
      }
      
      // Actualizar lista local
      contratos.value.forEach(c => {
        c.huella_id = null;
      });
      
      await updateSensorStatus();
      alert(`✅ Se eliminaron exitosamente ${contratoConHuella.value} huellas`);
    } else {
      throw new Error(response.msg || 'Error al limpiar huellas');
    }
  } catch (error) {
    alert(`❌ Error al limpiar huellas: ${error.message}`);
    console.error('Error al limpiar huellas:', error);
  } finally {
    clearing.value = false;
  }
};

const eliminarHuella = async (contrato) => {
  if (!confirm(`¿Eliminar la huella ID ${contrato.huella_id} de ${contrato.nombre_completo}?`)) {
    return;
  }

  if (connectionStatus.value !== 'connected') {
    alert('Primero conecta con el ESP32');
    return;
  }

  deleting.value = true;
  try {
    // Eliminar del sensor
    const response = await deleteFingerprint(esp32Ip.value, contrato.huella_id);
    
    if (response.ok) {
      // Actualizar en la base de datos (poner huella_id en NULL)
      await updateHuellaId(contrato.contrato_id, null);
      
      // Actualizar lista local
      const index = contratos.value.findIndex(c => c.contrato_id === contrato.contrato_id);
      if (index !== -1) {
        contratos.value[index].huella_id = null;
      }
      
      await updateSensorStatus();
      alert('✅ Huella eliminada exitosamente');
    } else {
      throw new Error(response.msg || 'Error al eliminar huella');
    }
  } catch (error) {
    alert(`❌ Error al eliminar huella: ${error.message}`);
    console.error('Error al eliminar huella:', error);
  } finally {
    deleting.value = false;
  }
};

const closeModal = () => {
  if (!enrolling.value) {
    showModal.value = false;
    enrollStep.value = 0;
    selectedContrato.value = null;
  }
};

// Lifecycle
onMounted(() => {
  cargarContratos();
  
  // Si hay IP guardada, intentar conectar automáticamente
  if (esp32Ip.value) {
    checkConnection();
  }
});

// Cleanup
onBeforeUnmount(() => {
  if (statusInterval) {
    clearInterval(statusInterval);
  }
});
</script>

<style scoped>
.registro-huellas-container {
  flex: 1;
  min-height: 100vh;
  background-color: #e0e0e0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow-x: hidden;
  padding: 2rem;
  transition: all 0.3s ease;
  margin-left: v-bind(contentMarginLeft);
  width: v-bind(contentWidth);
  /* Variables para animaciones */
  --dur-fast: 120ms;
  --dur-medium: 250ms;
  --dur-slow: 420ms;
  --bounce-easing: cubic-bezier(.34,1.56,.64,1);
}

.content-wrapper {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

.header {
  margin-bottom: 30px;
  text-align: left;
  max-width: 1400px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.header h1 {
  font-size: 2rem;
  color: #232327;
  margin-bottom: 10px;
  font-weight: 600;
}

.subtitle {
  color: #666;
  font-size: 1rem;
}

/* ESP32 Config */
.esp32-config {
  margin-bottom: 20px;
}

.config-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08);
}

.config-card h3 {
  margin-bottom: 20px;
  color: #232327;
  font-size: 1.1rem;
  font-weight: 600;
}

.config-row {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 15px;
}

.config-row label {
  font-weight: 600;
  min-width: 120px;
}

.ip-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.ip-input:focus {
  outline: none;
  border-color: #845EF7;
}

.btn-check {
  padding: 10px 20px;
  background: #845EF7;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-check:hover {
  background: #7048e8;
  transform: translateY(-1px);
}

/* Employees Summary */
.employees-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
}

.summary-info {
  font-size: 14px;
}

.summary-text {
  color: #666;
  font-weight: 600;
}

.summary-count {
  color: #845EF7;
  font-weight: 700;
  font-size: 16px;
}

.btn-clear-all-table {
  padding: 10px 16px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;
  font-size: 13px;
}

.btn-clear-all-table:hover:not(:disabled) {
  background: #c0392b;
  transform: translateY(-1px);
}

.btn-clear-all-table:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.sensor-status {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
}

.status-row {
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
  font-size: 14px;
}

.status-ok {
  color: #27ae60;
  font-weight: 600;
}

.status-error {
  color: #e74c3c;
  font-weight: 600;
}

.status-warning {
  color: #f39c12;
  font-weight: 600;
}

.status-info {
  color: #3498db;
  font-weight: 600;
}

/* Search & Filters */
.search-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  background: white;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.search-input {
  flex: 2;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #845EF7;
}

.filter-select {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  background: white;
  transition: border-color 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #845EF7;
}

/* Table */
.contratos-table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08);
}

.table-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.table-count {
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

.table-count strong {
  color: #845EF7;
  font-size: 16px;
}

.btn-clear-small {
  padding: 8px 14px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;
  font-size: 12px;
}

.btn-clear-small:hover:not(:disabled) {
  background: #c0392b;
  transform: translateY(-1px);
}

.btn-clear-small:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.contratos-table {
  width: 100%;
  border-collapse: collapse;
}

.contratos-table thead {
  background: #232327;
  color: white;
}

.contratos-table th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
}

.contratos-table th:first-child {
  text-align: center;
}

.contratos-table th:nth-child(7) {
  text-align: center;
}

.contratos-table th:last-child {
  text-align: center;
}

.number-cell {
  text-align: center;
  font-weight: 700;
  color: #845EF7;
  min-width: 40px;
}

.contratos-table td {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}

.contratos-table td:first-child {
  text-align: center;
}

.contratos-table td:nth-child(7) {
  text-align: center;
}

.contratos-table td:last-child {
  text-align: center;
}

.contratos-table tbody tr:hover {
  background: #f8f9fa;
}

/* Animaciones filas */
.rows-enter-active {
  transition: all 380ms var(--bounce-easing);
}
.rows-leave-active {
  transition: all var(--dur-medium) cubic-bezier(.4,0,.6,1);
}
.rows-enter-from {
  opacity: 0;
  transform: translateX(-20px) scale(.9);
}
.rows-enter-to {
  opacity: 1;
  transform: translateX(0) scale(1);
}
.rows-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
}
.rows-leave-to {
  opacity: 0;
  transform: translateX(10px) scale(.94);
}
.rows-move {
  transition: transform 400ms var(--bounce-easing);
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.nombre-cell {
  font-weight: 600;
  color: #2c3e50;
}

.badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.badge-empleado {
  background: #e3f2fd;
  color: #1976d2;
}

.badge-aspirante {
  background: #fff3e0;
  color: #f57c00;
}

.badge-estado {
  background: #e8f5e9;
  color: #388e3c;
}

.huella-cell {
  text-align: center;
}

.huella-id {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.sin-huella {
  color: #95a5a6;
  font-style: italic;
}

.actions-cell {
  display: table-cell;
  text-align: center;
  vertical-align: middle;
}

.huella-registrada {
  color: #27ae60;
  font-weight: 600;
  font-size: 14px;
  display: block;
}

.btn-registrar {
  padding: 10px 20px;
  background: #845EF7;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-registrar:hover:not(:disabled) {
  background: #7048e8;
  transform: translateY(-1px);
}

.btn-registrar:active,
.btn-eliminar:active,
.btn-clear-small:active,
.btn-check:active {
  transform: translateY(2px) scale(.92);
  transition: transform var(--dur-fast) var(--bounce-easing);
}

.btn-registrar:hover:not(:disabled),
.btn-check:hover:not(:disabled) {
  animation: buttonBounce 400ms var(--bounce-easing);
}

@keyframes buttonBounce {
  0%, 100% { transform: translateY(-1px); }
  50% { transform: translateY(-4px) scale(1.02); }
}

.btn-registrar:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.btn-eliminar {
  padding: 8px 12px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.btn-eliminar:hover:not(:disabled) {
  background: #c0392b;
}

.btn-eliminar:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.acciones-huella {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.huella-registrada {
  color: #27ae60;
  font-weight: 600;
  font-size: 13px;
}

.loading-row,
.empty-row {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 30px;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  color: #2c3e50;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #95a5a6;
}

.btn-close:hover {
  color: #e74c3c;
}

.modal-body {
  margin: 20px 0;
}

.modal-body p {
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 20px;
}

.progress-steps {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.step {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  opacity: 0.5;
  transition: all 0.3s;
}

.step.active {
  opacity: 1;
  background: #e3f2fd;
  animation: pulseStep 550ms var(--bounce-easing);
}

@keyframes pulseStep {
  0% { 
    transform: scale(.88) rotate(-2deg); 
  }
  50% { 
    transform: scale(1.08) rotate(1deg); 
  }
  100% { 
    transform: scale(1) rotate(0deg); 
  }
}

.step-number {
  width: 30px;
  height: 30px;
  background: #845EF7;
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
}

.step-text {
  font-size: 14px;
  color: #2c3e50;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-modal {
  padding: 10px 24px;
  background: #845EF7;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-modal:hover {
  background: #7048e8;
  transform: translateY(-1px);
}

/* Accesibilidad: reducir movimiento */
@media (prefers-reduced-motion: reduce) {
  .rows-enter-active, .rows-leave-active, .rows-move, .step.active {
    transition: none !important;
    animation: none !important;
  }
}
</style>
