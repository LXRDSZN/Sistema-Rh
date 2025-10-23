<template>
    <div class="inicio-view">
        <!-- Barra de búsqueda y botón -->
        <div class="top-bar">
            <div class="search-box">
                <input type="text" placeholder="Buscar" v-model="searchQuery">
                <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" />
                </svg>
            </div>
            <button class="btn-crear" @click="crearContrato">CREAR CONTRATO NUEVO</button>
        </div>

        <!-- Tarjetas de estadísticas -->
        <div class="stats-grid">
            <div class="stat-card green">
                <p class="stat-label">TOTAL DE<br>CONTRATOS ACTIVOS</p>
                <p class="stat-number">{{ stats.activos }}</p>
            </div>
            <div class="stat-card orange">
                <p class="stat-label">CONTRATOS<br>PRÓXIMOS A VENCER</p>
                <p class="stat-number">{{ stats.proximosVencer }}</p>
            </div>
            <div class="stat-card red">
                <p class="stat-label">CONTRATOS<br>VENCIDOS</p>
                <p class="stat-number">{{ stats.vencidos }}</p>
            </div>
            <div class="stat-card blue">
                <p class="stat-label">CONTRATOS<br>EN PROCESO</p>
                <p class="stat-number">{{ stats.enProceso }}</p>
            </div>
        </div>

        <!-- Tabla de contratos -->
        <div class="contratos-table">
            <div class="table-header">
                <span class="col-datos">Datos</span>
                <span class="col-puesto">Puesto</span>
                <span class="col-area">Área</span>
                <span class="col-action"></span>
            </div>

            <div class="table-body">
                <div v-for="contrato in contratosFiltrados" :key="contrato.id" class="table-row">
                    <div class="col-datos">
                        <img :src="contrato.avatar" :alt="contrato.nombre" class="avatar">
                        <div class="datos-info">
                            <p class="nombre">{{ contrato.nombre }}</p>
                            <p class="fase">Fase: {{ contrato.fase }}</p>
                            <p class="cuenta">{{ contrato.cuenta }}</p>
                        </div>
                    </div>
                    <div class="col-puesto">{{ contrato.puesto }}</div>
                    <div class="col-area">{{ contrato.area }}</div>
                    <div class="col-action">
                        <button class="btn-revisar" @click="revisarContrato(contrato)">REVISAR</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Props
const props = defineProps({
    contratos: {
        type: Array,
        default: () => []
    },
    stats: {
        type: Object,
        default: () => ({
            activos: 47,
            proximosVencer: 9,
            vencidos: 2,
            enProceso: 13
        })
    }
});

// Emits
const emit = defineEmits(['crear-contrato', 'revisar-contrato']);

// Estado local
const searchQuery = ref('');

// Computed
const contratosFiltrados = computed(() => {
    if (!searchQuery.value) {
        return props.contratos;
    }

    const query = searchQuery.value.toLowerCase();
    return props.contratos.filter(contrato =>
        contrato.nombre.toLowerCase().includes(query) ||
        contrato.fase.toLowerCase().includes(query) ||
        contrato.cuenta.toLowerCase().includes(query) ||
        contrato.puesto.toLowerCase().includes(query) ||
        contrato.area.toLowerCase().includes(query)
    );
});

// Métodos
const crearContrato = () => {
    emit('crear-contrato');
};

const revisarContrato = (contrato) => {
    emit('revisar-contrato', contrato);
};
</script>

<style scoped>
.inicio-view {
    max-width: 1400px;
    margin: 0 auto;
}

/* Top Bar */
.top-bar {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    align-items: center;
}

.search-box {
    position: relative;
    flex: 1;
    max-width: 400px;
}

.search-box input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.95rem;
    background-color: #f0f0f5;
}

.search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
}

.btn-crear {
    padding: 0.875rem 2rem;
    background-color: #5b4cdb;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
    white-space: nowrap;
}

.btn-crear:hover {
    background-color: #4a3cb8;
}

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    padding: 2rem;
    border-radius: 12px;
    text-align: center;
}

.stat-card.green {
    background-color: #d4edda;
}

.stat-card.orange {
    background-color: #fff3cd;
}

.stat-card.red {
    background-color: #f8d7da;
}

.stat-card.blue {
    background-color: #d1ecf1;
}

.stat-label {
    font-size: 0.95rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    line-height: 1.4;
}

.stat-card.green .stat-label {
    color: #4caf50;
}

.stat-card.orange .stat-label {
    color: #ff9800;
}

.stat-card.red .stat-label {
    color: #dc3545;
}

.stat-card.blue .stat-label {
    color: #17a2b8;
}

.stat-number {
    font-size: 3.5rem;
    font-weight: 700;
    margin: 0;
}

.stat-card.green .stat-number {
    color: #4caf50;
}

.stat-card.orange .stat-number {
    color: #ff9800;
}

.stat-card.red .stat-number {
    color: #dc3545;
}

.stat-card.blue .stat-number {
    color: #17a2b8;
}

/* Tabla */
.contratos-table {
    background-color: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 150px;
    padding: 1rem 1.5rem;
    background-color: #fafafa;
    border-bottom: 1px solid #e0e0e0;
    font-weight: 600;
    color: #555;
    font-size: 0.9rem;
}

.table-body {
    display: flex;
    flex-direction: column;
}

.table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 150px;
    padding: 1.5rem;
    border-bottom: 1px solid #f0f0f0;
    align-items: center;
    transition: background-color 0.2s ease;
}

.table-row:hover {
    background-color: #f9f9ff;
}

.table-row:last-child {
    border-bottom: none;
}

.col-datos {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
}

.datos-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.nombre {
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
    font-size: 0.95rem;
}

.fase {
    font-size: 0.85rem;
    color: #666;
    margin: 0;
}

.cuenta {
    font-size: 0.85rem;
    color: #17a2b8;
    font-weight: 600;
    margin: 0;
}

.col-puesto,
.col-area {
    font-weight: 600;
    color: #2c3e50;
}

.btn-revisar {
    padding: 0.5rem 1.5rem;
    background-color: white;
    color: #17a2b8;
    border: 2px solid #17a2b8;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-revisar:hover {
    background-color: #17a2b8;
    color: white;
}

/* Responsive */
@media (max-width: 1024px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .table-header,
    .table-row {
        grid-template-columns: 2fr 1fr 1fr 120px;
    }
}

@media (max-width: 768px) {
    .top-bar {
        flex-direction: column;
    }

    .search-box {
        max-width: 100%;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }
}
</style>
