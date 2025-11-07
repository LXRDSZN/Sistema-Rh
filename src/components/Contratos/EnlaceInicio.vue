<template>
    <div class="inicio-view">
        <!-- Encabezado con título -->
        <div class="header">
            <h1>Contratos/Inicio</h1>
        </div>

        <!-- Barra de búsqueda -->
        <div class="search-container">
            <div class="search-box">
                <input type="text" placeholder="Buscar" v-model="searchQuery">
                <span class="material-symbols-rounded search-icon">search</span>
            </div>
        </div>

        <!-- Tarjetas de estadísticas -->
        <div class="stats-grid">
            <div class="stat-card activos" @click="cambiarVista('activos')">
                <div class="stat-content">
                    <div class="stat-text">
                        <div class="stat-label">TOTAL DE<br>CONTRATOS ACTIVOS</div>
                    </div>
                    <div class="stat-icon-container">
                        <svg class="stat-icon" viewBox="0 0 64 64" fill="none">
                            <rect x="12" y="8" width="40" height="48" rx="2" fill="currentColor" opacity="0.2" />
                            <path d="M16 16h32M16 24h32M16 32h24M16 40h20" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" />
                        </svg>
                        <div class="stat-number">{{ stats.activos }}</div>
                    </div>
                </div>
            </div>

            <div class="stat-card proximos" @click="cambiarVista('avencer')">
                <div class="stat-content">
                    <div class="stat-text">
                        <div class="stat-label">CONTRATOS<br>PRÓXIMOS A VENCER</div>
                    </div>
                    <div class="stat-icon-container">
                        <svg class="stat-icon" viewBox="0 0 64 64" fill="none">
                            <rect x="12" y="8" width="40" height="48" rx="2" fill="currentColor" opacity="0.2" />
                            <path d="M16 16h32M16 24h32M16 32h24M16 40h20" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" />
                        </svg>
                        <div class="stat-number">{{ stats.proximosVencer }}</div>
                    </div>
                </div>
            </div>

            <div class="stat-card vencidos" @click="cambiarVista('vencidos')">
                <div class="stat-content">
                    <div class="stat-text">
                        <div class="stat-label">CONTRATOS<br>VENCIDOS</div>
                    </div>
                    <div class="stat-icon-container">
                        <svg class="stat-icon" viewBox="0 0 64 64" fill="none">
                            <rect x="12" y="8" width="40" height="48" rx="2" fill="currentColor" opacity="0.2" />
                            <path d="M16 16h32M16 24h32M16 32h24M16 40h20" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" />
                        </svg>
                        <div class="stat-number">{{ stats.vencidos }}</div>
                    </div>
                </div>
            </div>

            <div class="stat-card proceso" @click="cambiarVista('proceso')">
                <div class="stat-content">
                    <div class="stat-text">
                        <div class="stat-label">CONTRATOS<br>EN PROCESO</div>
                    </div>
                    <div class="stat-icon-container">
                        <svg class="stat-icon" viewBox="0 0 64 64" fill="none">
                            <rect x="12" y="8" width="40" height="48" rx="2" fill="currentColor" opacity="0.2" />
                            <path d="M16 16h32M16 24h32M16 32h24M16 40h20" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" />
                        </svg>
                        <div class="stat-number">{{ stats.enProceso }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sección DESTACADOS -->
        <div class="destacados-header">
            <h2>DESTACADOS</h2>
        </div>

        <!-- Contenedor de dos columnas: EMPLEADOS y ASPIRANTES -->
        <div class="columns-container">
            <!-- Columna EMPLEADOS -->
            <div class="column-section">
                <h3 class="column-title">EMPLEADOS</h3>

                <div class="table-container">
                    <div class="table-header">
                        <div class="col-datos">Datos</div>
                        <div class="col-puesto">Puesto</div>
                        <div class="col-area">Área</div>
                        <div class="col-action"></div>
                    </div>

                    <div class="table-body">
                        <div v-for="empleado in empleadosFiltrados" :key="empleado.id" class="table-row empleado-row">
                            <div class="col-datos">
                                <img :src="empleado.avatar" :alt="empleado.nombre" class="avatar">
                                <div class="datos-info">
                                    <div class="nombre">{{ empleado.nombre }}</div>
                                    <div class="estado" :class="empleado.estadoClase">{{ empleado.estadoTexto }}</div>
                                </div>
                            </div>
                            <div class="col-puesto">{{ empleado.puesto }}</div>
                            <div class="col-area">{{ empleado.area }}</div>
                            <div class="col-action">
                                <button class="btn-revisar empleado" @click="revisarContrato(empleado)">
                                    REVISAR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Columna ASPIRANTES -->
            <div class="column-section">
                <h3 class="column-title">ASPIRANTES</h3>

                <div class="table-container">
                    <div class="table-header">
                        <div class="col-datos">Datos</div>
                        <div class="col-puesto">Puesto</div>
                        <div class="col-area">Área</div>
                        <div class="col-action"></div>
                    </div>

                    <div class="table-body">
                        <div v-for="aspirante in aspirantesFiltrados" :key="aspirante.id"
                            class="table-row aspirante-row">
                            <div class="col-datos">
                                <img :src="aspirante.avatar" :alt="aspirante.nombre" class="avatar">
                                <div class="datos-info">
                                    <div class="nombre">{{ aspirante.nombre }}</div>
                                    <div class="estado" :class="aspirante.estadoClase">{{ aspirante.estadoTexto }}</div>
                                </div>
                            </div>
                            <div class="col-puesto">{{ aspirante.puesto }}</div>
                            <div class="col-area">{{ aspirante.area }}</div>
                            <div class="col-action">
                                <button class="btn-revisar aspirante" @click="revisarContrato(aspirante)">
                                    REVISAR
                                </button>
                            </div>
                        </div>
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
        required: true
    },
    stats: {
        type: Object,
        required: true
    }
});

// Emits
const emit = defineEmits(['crear-contrato', 'revisar-contrato', 'cambiar-vista']);

// Estado local
const searchQuery = ref('');

// Separar contratos en empleados y aspirantes
const empleados = computed(() =>
    props.contratos.filter(c => c.tipo === 'empleado')
);

const aspirantes = computed(() =>
    props.contratos.filter(c => c.tipo === 'aspirante')
);

// Filtrar empleados por búsqueda
const empleadosFiltrados = computed(() => {
    if (!searchQuery.value) return empleados.value;

    const query = searchQuery.value.toLowerCase();
    return empleados.value.filter(c =>
        c.nombre.toLowerCase().includes(query) ||
        c.puesto.toLowerCase().includes(query) ||
        c.area.toLowerCase().includes(query)
    );
});

// Filtrar aspirantes por búsqueda
const aspirantesFiltrados = computed(() => {
    if (!searchQuery.value) return aspirantes.value;

    const query = searchQuery.value.toLowerCase();
    return aspirantes.value.filter(c =>
        c.nombre.toLowerCase().includes(query) ||
        c.puesto.toLowerCase().includes(query) ||
        c.area.toLowerCase().includes(query)
    );
});

// Métodos
const revisarContrato = (contrato) => {
    emit('revisar-contrato', contrato);
};

const cambiarVista = (vista) => {
    emit('cambiar-vista', vista);
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:wght@400;700&display=swap');

.inicio-view {
    background-color: #d9d9d9;
    min-height: 100vh;
    padding: 2rem;
}

/* Header */
.header {
    margin-bottom: 1.5rem;
}

.header h1 {
    font-size: 1.75rem;
    font-weight: 600;
    color: #000;
    margin: 0;
}

/* Search Container */
.search-container {
    background-color: white;
    border: 3px solid #00a8e8;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 1.5rem;
}

.search-box {
    position: relative;
    width: 100%;
}

.search-box input {
    width: 100%;
    padding: 1rem 3rem 1rem 1.5rem;
    border: none;
    border-radius: 30px;
    background-color: #e8e8f0;
    font-size: 1rem;
    outline: none;
    color: #666;
}

.search-icon {
    position: absolute;
    right: 1.5rem;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
    font-size: 24px;
    cursor: pointer;
}

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.stat-card.activos {
    background-color: #d4edda;
}

.stat-card.proximos {
    background-color: #fff3cd;
}

.stat-card.vencidos {
    background-color: #f8d7da;
}

.stat-card.proceso {
    background-color: #d1ecf1;
}

.stat-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.stat-label {
    font-size: 0.75rem;
    font-weight: 700;
    line-height: 1.3;
    text-transform: uppercase;
}

.stat-card.activos .stat-label {
    color: #28a745;
}

.stat-card.proximos .stat-label {
    color: #ff9800;
}

.stat-card.vencidos .stat-label {
    color: #dc3545;
}

.stat-card.proceso .stat-label {
    color: #17a2b8;
}

.stat-icon-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.stat-icon {
    width: 50px;
    height: 50px;
}

.stat-card.activos .stat-icon {
    color: #28a745;
}

.stat-card.proximos .stat-icon {
    color: #ff9800;
}

.stat-card.vencidos .stat-icon {
    color: #dc3545;
}

.stat-card.proceso .stat-icon {
    color: #17a2b8;
}

.stat-number {
    font-size: 2rem;
    font-weight: 700;
}

.stat-card.activos .stat-number {
    color: #28a745;
}

.stat-card.proximos .stat-number {
    color: #ff9800;
}

.stat-card.vencidos .stat-number {
    color: #dc3545;
}

.stat-card.proceso .stat-number {
    color: #17a2b8;
}

/* Destacados Header */
.destacados-header {
    background-color: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    text-align: center;
}

.destacados-header h2 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #7b68ee;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 2px;
}

/* Columns Container */
.columns-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
}

.column-section {
    background-color: white;
    border-radius: 12px;
    padding: 1.5rem;
}

.column-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #333;
    margin: 0 0 1.5rem 0;
    text-align: center;
    text-transform: uppercase;
}

/* Table Container */
.table-container {
    background: white;
    border-radius: 8px;
    overflow: hidden;
}

.table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 120px;
    padding: 1rem;
    background-color: #f0f0f0;
    font-weight: 700;
    color: #555;
    font-size: 0.85rem;
    text-transform: uppercase;
}

.table-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
}

.table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 120px;
    padding: 1.25rem;
    border-radius: 12px;
    align-items: center;
    transition: all 0.3s ease;
}

.empleado-row {
    border: 2px solid #28a745;
    background-color: #f8fff9;
}

.empleado-row:hover {
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
    transform: translateY(-2px);
}

.aspirante-row {
    border: 2px solid #00bcd4;
    background-color: #f0fbff;
}

.aspirante-row:hover {
    box-shadow: 0 4px 12px rgba(0, 188, 212, 0.2);
    transform: translateY(-2px);
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
    font-weight: 700;
    color: #333;
    font-size: 0.95rem;
}

.estado {
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
}

.estado.activo {
    color: #28a745;
}

.estado.baja {
    color: #dc3545;
}

.estado.revision {
    color: #17a2b8;
}

.estado.evaluacion {
    color: #ff9800;
}

.col-datos,
.col-puesto,
.col-area {
    font-weight: 600;
    color: #333;
    font-size: 0.9rem;
}

.btn-revisar {
    padding: 0.6rem 1.5rem;
    border: 2px solid;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    background-color: white;
}

.btn-revisar.empleado {
    color: #28a745;
    border-color: #28a745;
}

.btn-revisar.empleado:hover {
    background-color: #28a745;
    color: white;
}

.btn-revisar.aspirante {
    color: #00bcd4;
    border-color: #00bcd4;
}

.btn-revisar.aspirante:hover {
    background-color: #00bcd4;
    color: white;
}

/* Responsive */
@media (max-width: 1400px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 1024px) {
    .columns-container {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }

    .table-header,
    .table-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
    }

    .col-datos {
        grid-column: 1 / -1;
    }
}
</style>
