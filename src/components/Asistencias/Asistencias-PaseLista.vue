<template>
  <div class="pase-lista-container">
    <!-- Header -->
    <div class="header">
      <h1>Pase de Lista por Huella Digital</h1>
    </div>

    <!-- Configuración ESP32 solo para roles distintos a EMPLEADO -->
    <div v-if="userRole !== 'EMPLEADO'" class="config-section">
      <div class="config-card">
        <h3>Configuración del Sensor</h3>
        <div class="config-row">
          <label>IP del ESP32:</label>
          <input 
            v-model="esp32Ip" 
            type="text" 
            placeholder="192.168.0.181"
            class="ip-input"
            @input="saveESP32Ip"
          />
          <button @click="checkConnection" class="btn-check" :disabled="checking">
            {{ connectionStatus === 'connected' ? '✅' : checking ? '⏳' : '🔌' }} 
            {{ checking ? 'Verificando...' : 'Verificar Conexión' }}
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
          <div class="status-row">
            <span>Base de datos:</span>
            <span :class="estadoBaseDatos === 'limpiada' ? 'status-info' : 'status-ok'">
              {{ estadoBaseDatos === 'limpiada' ? '🔄 Limpia (0 registros hoy)' : '📊 Con registros' }}
            </span>
          </div>
        </div>

        <div class="status-actions">
          <button 
            @click="limpiarBaseDatos" 
            class="btn-limpiar"
            :disabled="limpiando || connectionStatus !== 'connected'"
          >
            {{ limpiando ? '⏳ Limpiando...' : '🗑️ Limpiar Base de Datos' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Controles de registro manual -->
    <div v-if="huellaDetectada" class="acciones-registro">
      <div class="acciones-info">
        <span class="acciones-label">Huella detectada:</span>
        <span class="acciones-valor">ID {{ huellaDetectada }}</span>
      </div>
      <div class="acciones-botones">
        <button 
          class="btn-accion entrada"
          @click="registrarDesdeBoton('entrada')"
          :disabled="procesandoRegistro"
        >
          {{ procesandoRegistro ? 'Registrando...' : 'Registrar Entrada' }}
        </button>
        <button 
          class="btn-accion salida"
          @click="registrarDesdeBoton('salida')"
          :disabled="procesandoRegistro"
        >
          {{ procesandoRegistro ? 'Registrando...' : 'Registrar Salida' }}
        </button>
      </div>
    </div>

    <!-- Tarjeta de último registro (animada) o estado de espera -->
    <transition name="registro" mode="out-in">
      <template v-if="ultimoRegistro">
        <div class="registro-card">
          <div class="registro-header" :class="{'entrada': ultimoRegistro.tipo === 'entrada', 'salida': ultimoRegistro.tipo === 'salida'}">
            <div class="registro-icon">
              {{ ultimoRegistro.tipo === 'entrada' ? '➡️' : '⬅️' }}
            </div>
            <div class="registro-tipo">
              {{ ultimoRegistro.tipo === 'entrada' ? 'ENTRADA' : 'SALIDA' }}
            </div>
            <button @click="cerrarRegistro" class="btn-cerrar-registro">✖</button>
          </div>
          
          <div class="registro-body">
            <div class="empleado-info">
              <div class="info-row nombre-row">
                <span class="label">Nombre:</span>
                <span class="value">{{ ultimoRegistro.empleado.nombre_completo }}</span>
              </div>
              <div class="info-row">
                <span class="label">Área:</span>
                <span class="value">{{ ultimoRegistro.empleado.area }}</span>
              </div>
              <div class="info-row">
                <span class="label">Puesto:</span>
                <span class="value">{{ ultimoRegistro.empleado.puesto }}</span>
              </div>
              <div class="info-row">
                <span class="label">Turno:</span>
                <span class="value">{{ ultimoRegistro.empleado.turno }}</span>
              </div>
              <div class="info-row hora-row">
                <span class="label">Hora:</span>
                <span class="value hora">{{ ultimoRegistro.registro.hora }}</span>
              </div>
            </div>
          </div>
          
          <div class="registro-footer">
            <span class="mensaje">{{ ultimoRegistro.mensaje }}</span>
            <span class="fecha">{{ formatearFecha(ultimoRegistro.registro.fecha) }}</span>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="waiting-card">
          <div class="waiting-icon">👆</div>
          <h2>En espera de huella...</h2>
          <p>Coloque su dedo en el sensor para registrar su asistencia</p>
        </div>
      </template>
    </transition>

    <!-- Historial de registros del día -->
    <div class="historial-section">
      <h3>Registros de hoy</h3>
      
      <!-- Búsqueda en historial -->
      <div class="historial-search">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            v-model="searchRegistros" 
            type="text" 
            placeholder="Buscar por nombre, área o puesto..."
            class="search-input"
          />
          <button 
            v-if="searchRegistros" 
            @click="searchRegistros = ''" 
            class="clear-search"
            title="Limpiar búsqueda"
          >
            ✖
          </button>
        </div>
      </div>

      <div class="historial-stats">
        <div class="stat-card">
          <div class="stat-value">{{ registrosFiltrados.length }}</div>
          <div class="stat-label">Registros encontrados</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ contarRegistrosFiltrados('entrada') }}</div>
          <div class="stat-label">Entradas</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ contarRegistrosFiltrados('salida') }}</div>
          <div class="stat-label">Salidas</div>
        </div>
      </div>

      <div class="historial-list">
        <div v-if="registrosFiltrados.length === 0" class="empty-historial">
          No hay registros que coincidan con la búsqueda
        </div>

        <transition-group name="list" tag="div" v-else class="historial-items">
          <div 
            v-for="registro in registrosFiltrados" 
            :key="registro.registro_id"
            class="historial-item"
            :class="registro.tipo"
          >
            <div class="historial-icon">
              {{ registro.tipo === 'entrada' ? '➡️' : '⬅️' }}
            </div>
            <div class="historial-info">
              <div class="historial-nombre">{{ registro.empleado.nombre_completo }}</div>
              <div class="historial-detalles">
                {{ registro.empleado.area }} • {{ registro.empleado.puesto }}
              </div>
            </div>
            <div class="historial-hora">
              <div class="hora-badge" :class="registro.tipo">
                {{ registro.tipo.toUpperCase() }}
              </div>
              <div class="hora-value">{{ registro.registro.hora }}</div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>

    <!-- Modal de error -->
    <div v-if="showError" class="modal-overlay" @click="closeError">
      <div class="modal-content error-modal" @click.stop>
        <div class="modal-header">
          <h2>❌ Error</h2>
          <button @click="closeError" class="btn-close">✖</button>
        </div>
        <div class="modal-body">
          <p>{{ errorMessage }}</p>
        </div>
        <div class="modal-footer">
          <button @click="closeError" class="btn-modal">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth';
const { userRole } = useAuth();
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { getESP32Status, getESP32StatusSafe } from '@/services/huellasService.js';
import { registrarAsistenciaPorHuella, getChecadasHoy } from '@/services/asistenciasService.js';

// Estado
const esp32Ip = ref(localStorage.getItem('esp32_ip') || '');
const connectionStatus = ref('disconnected');
const checking = ref(false);
const sensorStatus = ref(null);
const ultimoRegistro = ref(null);
const registrosHoy = ref([]);
const searchRegistros = ref('');
const showError = ref(false);
const errorMessage = ref('');
const limpiando = ref(false);
const estadoBaseDatos = ref('normal');

// Huella detectada en el sensor (pendiente de registrar)
const huellaDetectada = ref(null);
const procesandoRegistro = ref(false);

// Intervalos
let statusInterval = null;
let scanInterval = null;

// Métodos
const cargarRegistrosHoy = async () => {
  try {
    const response = await getChecadasHoy();
    if (response.success) {
      registrosHoy.value = response.data.map(r => ({
        ...r,
        tipo: r.registro?.tipo || r.tipo || ''
      }));
    }
  } catch (error) {
    console.error('Error al cargar checadas de hoy:', error);
  }
};

const saveESP32Ip = () => {
  localStorage.setItem('esp32_ip', esp32Ip.value);
  connectionStatus.value = 'disconnected';
};

const checkConnection = async () => {
  if (!esp32Ip.value) {
    mostrarError('Por favor, ingresa la IP del ESP32');
    return;
  }

  checking.value = true;
  connectionStatus.value = 'checking';
  
  try {
    const status = await getESP32Status(esp32Ip.value);
    sensorStatus.value = status;
    connectionStatus.value = 'connected';
    
    // Iniciar auto-refresh del estado y escaneo
    if (statusInterval) clearInterval(statusInterval);
    if (scanInterval) clearInterval(scanInterval);
    
    statusInterval = setInterval(updateSensorStatus, 3000);
    scanInterval = setInterval(checkForNewFingerprint, 2000);
    
  } catch (error) {
    connectionStatus.value = 'disconnected';
    sensorStatus.value = null;
    mostrarError('No se pudo conectar al ESP32. Verifica la IP y que esté en la misma red.');
  } finally {
    checking.value = false;
  }
};

const updateSensorStatus = async () => {
  if (connectionStatus.value !== 'connected' || !esp32Ip.value) return;
  const status = await getESP32StatusSafe(esp32Ip.value);
  sensorStatus.value = status;
};

const checkForNewFingerprint = async () => {
  if (connectionStatus.value !== 'connected' || !esp32Ip.value) return;
  if (!sensorStatus.value?.scanning) return;
  
  try {
    // Obtener el último resultado del sensor (modo silencioso)
    const status = await getESP32StatusSafe(esp32Ip.value);
    sensorStatus.value = status;

    // Si el sensor reporta una huella, la tomamos siempre como un nuevo intento de registro
    if (status.result && status.result !== 'waiting...') {
      console.log('Resultado ESP32:', status.result);
      // Aceptar distintos formatos, por ejemplo: "Found ID #12", "ID 12", etc.
      const match = String(status.result).match(/(\d+)/);
      if (match) {
        const huellaId = parseInt(match[1]);
        // Guardamos la huella detectada; el usuario decide si registra entrada o salida
        huellaDetectada.value = huellaId;
      }
    }
  } catch (error) {
    console.error('Error al verificar huella:', error);
  }
};

const procesarHuella = async (huellaId) => {
  try {
    console.log('Procesando huella ID:', huellaId);
    procesandoRegistro.value = true;
    
    const response = await registrarAsistenciaPorHuella(huellaId);
    
    if (response.success) {
      const tipoRegistro = response.data?.registro?.tipo || '';

      ultimoRegistro.value = {
        ...response.data,
        tipo: tipoRegistro,
        mensaje: response.message
      };

      // Limpiar huella detectada una vez registrado
      huellaDetectada.value = null;
      
      // Agregar al historial (incluyendo tipo a nivel superior para la vista)
      registrosHoy.value.unshift({
        ...response.data,
        tipo: tipoRegistro
      });
      
      // Auto-ocultar después de 10 segundos (sin persistencia en localStorage)
      setTimeout(() => {
        if (ultimoRegistro.value?.registro_id === response.data.registro_id) {
          ultimoRegistro.value = null;
        }
      }, 10000);
      
    } else {
      mostrarError(response.message || 'Error al registrar asistencia');
    }
    
  } catch (error) {
    console.error('Error al procesar huella:', error);
    
    if (error.response?.data?.message) {
      mostrarError(error.response.data.message);
    } else {
      mostrarError('Error al registrar asistencia. Intente nuevamente.');
    }
  } finally {
    procesandoRegistro.value = false;
  }
};

// Registrar asistencia desde los botones de Entrada/Salida
const registrarDesdeBoton = async (tipo) => {
  if (!huellaDetectada.value) {
    mostrarError('No hay una huella detectada para registrar.');
    return;
  }

  console.log(`Registrando asistencia (${tipo}) para huella ID:`, huellaDetectada.value);
  await procesarHuella(huellaDetectada.value);
};

const limpiarBaseDatos = async () => {
  if (!confirm('¿Estás seguro de que deseas limpiar la base de datos de hoy? Esto eliminará todos los registros del día actual.')) {
    return;
  }

  limpiando.value = true;
  try {
    // Aquí deberías implementar el endpoint para limpiar la base de datos
    // Por ahora solo limpiamos la vista local
    registrosHoy.value = [];
    ultimoRegistro.value = null;
    estadoBaseDatos.value = 'limpiada';
    
    // Resetear después de 3 segundos
    setTimeout(() => {
      estadoBaseDatos.value = 'normal';
    }, 3000);
    
  } catch (error) {
    mostrarError('Error al limpiar la base de datos');
  } finally {
    limpiando.value = false;
  }
};

const mostrarError = (mensaje) => {
  errorMessage.value = mensaje;
  showError.value = true;
};

const cerrarRegistro = () => {
  ultimoRegistro.value = null;
  localStorage.removeItem('ultimoRegistro');
};

const closeError = () => {
  showError.value = false;
  errorMessage.value = '';
};

const formatearFecha = (fecha) => {
  const date = new Date(fecha);
  return date.toLocaleDateString('es-MX', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const contarRegistros = (tipo) => {
  return registrosHoy.value.filter(r => (r.tipo || r.registro?.tipo) === tipo).length;
};

// Computed para filtrar registros por búsqueda
const registrosFiltrados = computed(() => {
  if (!searchRegistros.value) {
    return registrosHoy.value;
  }
  
  const query = searchRegistros.value.toLowerCase();
  return registrosHoy.value.filter(r => 
    r.empleado.nombre_completo.toLowerCase().includes(query) ||
    r.empleado.area.toLowerCase().includes(query) ||
    r.empleado.puesto.toLowerCase().includes(query)
  );
});

const contarRegistrosFiltrados = (tipo) => {
  return registrosFiltrados.value.filter(r => (r.tipo || r.registro?.tipo) === tipo).length;
};

// Lifecycle
onMounted(async () => {
  // Cargar registros del día desde la base de datos
  await cargarRegistrosHoy();

  // Si hay IP guardada, intentar conectar automáticamente
  if (esp32Ip.value) {
    checkConnection();
  }
});

onBeforeUnmount(() => {
  if (statusInterval) clearInterval(statusInterval);
  if (scanInterval) clearInterval(scanInterval);
});
</script>

<style scoped>
.pase-lista-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  margin-bottom: 30px;
  text-align: left;
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

/* Configuración del sensor */
.config-section {
  margin-bottom: 30px;
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

.btn-check:hover:not(:disabled) {
  background: #7048e8;
  transform: translateY(-1px);
}

.btn-check:disabled {
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

.status-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.btn-limpiar {
  padding: 10px 20px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-limpiar:hover:not(:disabled) {
  background: #c0392b;
  transform: translateY(-1px);
}

.btn-limpiar:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

/* Tarjeta de registro */
.registro-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  margin-bottom: 30px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.registro-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  justify-content: space-between;
}

.registro-header.entrada {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
}

.registro-header.salida {
  background: linear-gradient(135deg, #3498db, #5dade2);
}

.registro-icon {
  font-size: 3rem;
}

.registro-tipo {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  flex: 1;
}

.btn-cerrar-registro {
  background: rgba(255, 255, 255, 0.3);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-cerrar-registro:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}

.registro-body {
  padding: 30px;
}

.empleado-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row.nombre-row {
  font-size: 1.2rem;
  font-weight: 700;
  border-bottom: 2px solid #845EF7;
}

.info-row.hora-row {
  border-bottom: none;
  margin-top: 10px;
}

.info-row .label {
  color: #666;
  font-weight: 600;
}

.info-row .value {
  color: #232327;
  font-weight: 500;
}

.info-row .hora {
  font-size: 1.5rem;
  font-weight: 700;
  color: #845EF7;
}

.registro-footer {
  padding: 20px 30px;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mensaje {
  color: #27ae60;
  font-weight: 600;
  font-size: 1.1rem;
}

.fecha {
  color: #666;
  font-size: 0.9rem;
}

/* Estado de espera */
.acciones-registro {
  background: #fefce8;
  border-radius: 12px;
  padding: 16px 24px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid #facc15;
}

.acciones-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.acciones-label {
  font-weight: 600;
  color: #854d0e;
}

.acciones-valor {
  font-weight: 700;
  color: #92400e;
}

.acciones-botones {
  display: flex;
  gap: 10px;
}

.btn-accion {
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  color: white;
  transition: all 0.2s;
}

.btn-accion.entrada {
  background: #22c55e;
}

.btn-accion.salida {
  background: #3b82f6;
}

.btn-accion:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-accion:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(0.95);
}

.waiting-card {
  background: white;
  border-radius: 12px;
  padding: 60px 30px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  margin-bottom: 30px;
}

.waiting-icon {
  font-size: 5rem;
  margin-bottom: 20px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.waiting-card h2 {
  color: #232327;
  margin-bottom: 10px;
}

.waiting-card p {
  color: #666;
  font-size: 1.1rem;
}

/* Historial */
.historial-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
}

.historial-section h3 {
  margin-bottom: 20px;
  color: #232327;
  font-size: 1.3rem;
  font-weight: 600;
}

.historial-search {
  margin-bottom: 20px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 4px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-box:focus-within {
  border-color: #845EF7;
  box-shadow: 0 4px 16px rgba(132, 94, 247, 0.15);
  transform: translateY(-2px);
}

.search-icon {
  font-size: 1.3rem;
  padding: 0 14px;
  color: #845EF7;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px 8px;
  font-size: 1rem;
  color: #232327;
  outline: none;
  font-weight: 500;
}

.search-input::placeholder {
  color: #adb5bd;
  font-weight: 400;
}

.clear-search {
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-right: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.clear-search:hover {
  background: #fa5252;
  transform: scale(1.1);
}

.clear-search:active {
  transform: scale(0.95);
}

.historial-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #845EF7;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
  margin-top: 5px;
}

.historial-list {
  max-height: 400px;
  overflow-y: auto;
}

.empty-historial {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
}

.historial-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.historial-item:hover {
  background: #f8f9fa;
}

.historial-icon {
  font-size: 1.5rem;
}

.historial-info {
  flex: 1;
}

.historial-nombre {
  font-weight: 600;
  color: #232327;
  margin-bottom: 5px;
}

.historial-detalles {
  font-size: 0.9rem;
  color: #666;
}

.historial-hora {
  text-align: right;
}

.hora-badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 5px;
}

.hora-badge.entrada {
  background: #e8f5e9;
  color: #27ae60;
}

.hora-badge.salida {
  background: #e3f2fd;
  color: #3498db;
}

.hora-value {
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
}

/* Animaciones y transiciones */
.registro-enter-active {
  transition: all 450ms cubic-bezier(.34,1.56,.64,1);
}
.registro-leave-active {
  transition: all 280ms cubic-bezier(.4,0,.6,1);
}
.registro-enter-from {
  transform: translateY(-24px) scale(0.92);
  opacity: 0;
}
.registro-enter-to {
  transform: translateY(0) scale(1);
  opacity: 1;
}
.registro-leave-from {
  transform: translateY(0) scale(1);
  opacity: 1;
}
.registro-leave-to {
  transform: translateY(16px) scale(0.96);
  opacity: 0;
}

.historial-items .historial-item {
  transition: transform 350ms cubic-bezier(.34,1.56,.64,1), opacity 220ms ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateX(-16px) scale(0.92);
}
.list-enter-to {
  opacity: 1;
  transform: translateX(0) scale(1);
}
.list-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(12px) scale(0.94);
}
.list-move {
  transition: transform 380ms cubic-bezier(.34,1.56,.64,1);
}

/* Pequeñas microinteracciones */
.btn-accion:active {
  transform: translateY(2px) scale(0.96);
  transition: transform 80ms cubic-bezier(.34,1.56,.64,1);
}

.btn-cerrar-registro:active,
.clear-search:active {
  transform: scale(0.88) rotate(90deg);
  transition: transform 120ms cubic-bezier(.34,1.56,.64,1);
}

/* Respect user preference for reduced motion */
@media (prefers-reduced-motion: reduce) {
  .registro-enter-active, .registro-leave-active,
  .historial-items .historial-item,
  .list-enter-from, .list-enter-to, .list-leave-from, .list-leave-to,
  .list-move {
    transition: none !important;
    animation: none !important;
  }
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
  max-width: 500px;
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
  color: #e74c3c;
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

@media (max-width: 768px) {
  .config-row {
    flex-direction: column;
    align-items: stretch;
  }

  .config-row label {
    min-width: auto;
  }

  .historial-stats {
    grid-template-columns: 1fr;
  }

  .registro-tipo {
    font-size: 1.5rem;
  }
}
</style>
