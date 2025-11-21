<template>
    <div class="inicio-view">
        <!-- Encabezado simplificado -->
        <div class="header">
            <h1>Contratos/Inicio</h1>
        </div>

        <!-- Barra de búsqueda con botón de incidencia (todo en una línea) -->
        <div class="search-container">
            <div class="search-box">
                <input type="text" placeholder="Buscar" v-model="searchQuery">
                <span class="material-symbols-rounded search-icon">search</span>
            </div>
            <button class="btn-incidencia" @click="registrarIncidencia">
                + Registrar Incidencia
            </button>
            <button class="btn-registro" @click="irARegistro">
                📝 Registro de Solicitud
            </button>
        </div>

        <!-- Tarjetas de estadísticas clickeables (4 en una línea) -->
        <div class="stats-grid">
            <div class="stat-card activos" @click="cambiarVista('activos')">
                <div class="stat-label">TOTAL DE<br>CONTRATOS ACTIVOS</div>
                <div class="stat-value-with-icon">                     
                    <span class="material-symbols-rounded contract-icon activo">
                        article
                    </span>
                    <div class="stat-value">{{ stats.activos }}</div>
                </div>
            </div>
            <div class="stat-card proximos" @click="cambiarVista('avencer')">
                <div class="stat-label">CONTRATOS<br>PRÓXIMOS A VENCER</div>
                <div class="stat-value-with-icon">                     
                    <span class="material-symbols-rounded contract-icon por-vencer">
                        article
                    </span>
                    <div class="stat-value">{{ stats.proximosVencer }}</div>
                </div>
            </div>
            <div class="stat-card vencidos" @click="cambiarVista('vencidos')">
                <div class="stat-label">CONTRATOS<br>VENCIDOS</div>
                <div class="stat-value-with-icon">                     
                    <span class="material-symbols-rounded contract-icon vencido">
                        article
                    </span>
                    <div class="stat-value">{{ stats.vencidos }}</div>
                </div>
            </div>
            <div class="stat-card proceso" @click="cambiarVista('proceso')">
                <div class="stat-label">CONTRATOS<br>EN PROCESO</div>
                <div class="stat-value-with-icon">                     
                    <span class="material-symbols-rounded contract-icon proceso">
                        article
                    </span>
                <div class="stat-value">{{ stats.enProceso }}</div>
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
                                <img :src="empleado.avatar || defaultAvatar" :alt="empleado.nombre" class="avatar" @error="onImgError">
                                <div class="datos-info">
                                    <div class="nombre">{{ empleado.nombre }}</div>
                                    <div class="estado" :class="empleado.estadoClase">{{ empleado.estadoTexto ||
                                        empleado.fase }}</div>
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
                                <img :src="aspirante.avatar || defaultAvatar" :alt="aspirante.nombre" class="avatar" @error="onImgError">
                                <div class="datos-info">
                                    <div class="nombre">{{ aspirante.nombre }}</div>
                                    <div class="estado" :class="aspirante.estadoClase">{{ aspirante.estadoTexto ||
                                        aspirante.fase }}</div>
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

// Props - recibe datos del componente raíz
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

// Emits - envía eventos al componente raíz
const emit = defineEmits(['crear-contrato', 'revisar-contrato', 'cambiar-vista', 'registrar-incidencia']);

const defaultAvatar = '/src/assets/default-user.png';

const onImgError = (event) => {
    event.target.onerror = null;
    event.target.src = defaultAvatar;
};

// Estado local
const searchQuery = ref('');

// Separar contratos por tipo
const empleados = computed(() =>
    props.contratos.filter(c => !c.tipo || c.tipo === 'empleado')
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
const crearContrato = () => {
    emit('crear-contrato');
};

const revisarContrato = (contrato) => {
    emit('revisar-contrato', contrato);
};

const cambiarVista = (vista) => {
    emit('cambiar-vista', vista);
};

const registrarIncidencia = () => {
    emit('registrar-incidencia');
};

const irARegistro = () => {
    emit('cambiar-vista', 'registro');
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:wght@400;700&display=swap');

.inicio-view {
    background-color: #d9d9d9;
    min-height: 100vh;
    padding: 0;
}

/* Header - Separado */
.header {
    background-color: transparent;
    padding: 2rem 2rem 1.5rem 2rem;
    margin-bottom: 0;
}

.header h1 {
    font-size: 1.75rem;
    font-weight: 600;
    color: #000;
    margin: 0;
}

/* Search Container - En línea */
.search-container {
    background-color: white;
    border-radius: 12px;
    padding: 2rem;
    margin: 0 2rem 1rem 2rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.search-box {
    position: relative;
    flex: 1;
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

.search-box input::placeholder {
    color: #999;
}

.search-icon {
    position: absolute;
    right: 1.5rem;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
    font-size: 24px;
    cursor: pointer;
    pointer-events: none;
}

.btn-incidencia {
    padding: 0.875rem 1.75rem;
    background: linear-gradient(135deg, #4F39F6, #5a4fc7);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(79, 57, 246, 0.2);
    transition: all 0.3s ease;
    white-space: nowrap;
    flex-shrink: 0;
}

.btn-incidencia:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(79, 57, 246, 0.3);
    background: linear-gradient(135deg, #5a4fc7, #4F39F6);
}

.btn-incidencia:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(79, 57, 246, 0.3);
}

.btn-registro {
    padding: 0.875rem 1.75rem;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
    transition: all 0.3s ease;
    white-space: nowrap;
    flex-shrink: 0;
}

.btn-registro:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
    background: linear-gradient(135deg, #059669, #10b981);
}

.btn-registro:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}


/* Stats Grid - 4 columnas en una línea */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin: 0 2rem 1rem 2rem;
    padding: 0;
}

.stat-card {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
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

.stat-label {
    font-size: 0.9rem;
    font-weight: 700;
    line-height: 1.3;
    text-transform: uppercase;
    margin-bottom: 1rem;
}

.stat-card.activos .stat-label {
    color: #333;
    text-align: center;
}

.stat-card.proximos .stat-label {
    color: #000000;
    text-align: center;
}

.stat-card.vencidos .stat-label {
    color: #000000;
    text-align: center;
}

.stat-card.proceso .stat-label {
    color: #000000;
    text-align: center;
}

.stat-value {
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
}

.stat-card.activos .stat-value {
    color: #000000;
}

.stat-card.proximos .stat-value {
    color: #000000;
}

.stat-card.vencidos .stat-value {
    color: #000000;
}

.stat-card.proceso .stat-value {
    color: #000000;
}

/* Destacados Header */
.destacados-header {
    background-color: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin: 0 2rem 1rem 2rem;
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
    padding: 0 2rem 2rem 2rem;
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
    padding: 1rem 1rem 1rem 2.5rem;
    background-color: #f0f0f0;
    font-weight: 700;
    color: #000000;
    font-size: 0.9rem;
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
    border: 2px solid #e2e2e2;
    background-color: #f8fff9;
}

.empleado-row:hover {
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
    transform: translateY(-2px);
}

.aspirante-row {
    border: 2px solid #e2e2e2;
    background-color: #f0fbff;
}

.aspirante-row:hover {
    box-shadow: 0 4px 12px rgba(0, 188, 212, 0.2);
    transform: translateY(-2px);
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

.avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #d4e9ff;
    font-size: 24px;
    color: #666;
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
    color: #669571;
    border-color: #669571;
}

.btn-revisar.empleado:hover {
    background-color: #28a745;
    color: white;
}

.btn-revisar.aspirante {
    color: #75a1a7;
    border-color: #abcace;
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
    .inicio-view {
        padding: 0;
    }

    .header,
    .search-container,
    .stats-grid,
    .destacados-header,
    .columns-container {
        margin: 0;
        padding-left: 1rem;
        padding-right: 1rem;
    }

    .search-container {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .btn-incidencia {
        width: 100%;
    }

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

.stat-value-with-icon {
    display: flex;
    align-items: center;
    justify-content: center; 
    gap: 10px;
    margin-top: 0px; 
}

.contract-icon.activo {
    font-size: 50px;
    color: #10b981; 
}

.contract-icon.vencido {
    font-size: 50px;
    color: #dc3545; 
}

.contract-icon.por-vencer {
    font-size: 50px;
    color: #ddc851; 
}

.contract-icon.proceso {
    font-size: 50px;
    color: #17a2b8; 
}
</style>
