<template>
    <div class="contratos-list-view">
        <!-- Header con flecha de regreso y título -->
        <div class="top-header">
            <button class="btn-volver" @click="volverInicio">
                <span class="material-symbols-rounded">arrow_back</span>
            </button>
            <div class="header-content">
                <h1>{{ headerTitle }}</h1>
            </div>
        </div>

        <!-- Barra de búsqueda -->
        <div class="search-section">
            <div class="search-box">
                <span class="material-symbols-rounded search-icon">search</span>
                <input type="text" placeholder="Buscar empleado, área o puesto..." v-model="searchQuery">
            </div>
        </div>

        <!-- Título de sección -->
        <div class="section-title">
            <h2 :style="{ color: primaryColor }">
                {{ sectionTitle }}
                <span class="underline" :style="{ background: primaryColor }"></span>
            </h2>
        </div>

        <!-- Filtros -->
        <div class="filters-container">
            <div class="filter-group">
                <label>Ordenar</label>
                <select v-model="filtroNombre" class="filter-select" :style="filterStyle">
                    <option value="">Sin filtro</option>
                    <option value="asc">A - Z (Ascendente)</option>
                    <option value="desc">Z - A (Descendente)</option>
                </select>
            </div>

            <div class="filter-group">
                <label>Área</label>
                <select v-model="filtroArea" class="filter-select" :style="filterStyle">
                    <option value="">Seleccione área</option>
                    <option v-for="area in areasUnicas" :key="area" :value="area">
                        {{ area }}
                    </option>
                </select>
            </div>

            <div class="filter-group">
                <label>Fecha</label>
                <select v-model="filtroFecha" class="filter-select" :style="filterStyle">
                    <option value="">Seleccione la fecha</option>
                    <option value="reciente">Más reciente</option>
                    <option value="antigua">Más antigua</option>
                </select>
            </div>

        </div>

        <!-- Tabla de contratos -->
        <div class="contratos-table">
            <div class="table-header">
                <div class="col-datos">Datos</div>
                <div class="col-puesto">Puesto</div>
                <div class="col-area">Área</div>
                <div class="col-action"></div>
            </div>

            <div class="table-body">
                <div v-for="contrato in contratosFiltrados" :key="contrato.id" class="table-row" :style="rowStyle">
                    <div class="col-datos">
                        <img :src="contrato.avatar || defaultAvatar" :alt="contrato.nombre" class="avatar" @error="onImgError">
                        <div class="datos-info">
                            <div class="nombre">{{ contrato.nombre }}</div>
                            <div class="estado">{{ contrato.estadoTexto || contrato.fase }}</div>
                        </div>
                    </div>
                    <div class="col-puesto">{{ formatRoleName(contrato.puesto) }}</div>
                    <div class="col-area">{{ contrato.area }}</div>
                    <div class="col-action">
                        <button class="btn-revisar" :style="buttonStyle" @click="revisarContrato(contrato)">
                            REVISAR
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    contratos: {
        type: Array,
        required: true
    },
    headerTitle: {
        type: String,
        required: true
    },
    sectionTitle: {
        type: String,
        required: true
    },
    primaryColor: {
        type: String,
        default: '#28a745'
    },
    secondaryColor: {
        type: String,
        default: '#1e7e34'
    },
    lightBackground: {
        type: String,
        default: '#f0fff4'
    }
});

const emit = defineEmits(['revisar-contrato', 'volver-inicio']);

// Avatar por defecto
const defaultAvatar = '/src/assets/default-user.png';

const onImgError = (event) => {
    event.target.onerror = null;
    event.target.src = defaultAvatar;
};

const searchQuery = ref('');
const filtroNombre = ref('');
const filtroArea = ref('');
const filtroFecha = ref('');

// Computed para gradiente del avatar
const avatarGradient = computed(() => {
    return `linear-gradient(135deg, ${props.primaryColor} 0%, ${props.secondaryColor} 100%)`;
});

// Computed para estilo de filtros
const filterStyle = computed(() => ({
    borderColor: props.primaryColor,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='${encodeURIComponent(props.primaryColor)}' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`
}));

// Computed para estilo de filas
const rowStyle = computed(() => ({
    borderColor: props.primaryColor,
    backgroundColor: props.lightBackground
}));

// Computed para estilo de botón
const buttonStyle = computed(() => ({
    color: props.primaryColor,
    borderColor: props.primaryColor
}));

const areasUnicas = computed(() => {
    return [...new Set(props.contratos.map(c => c.area))];
});

const contratosFiltrados = computed(() => {
    let result = props.contratos;

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(c =>
            c.nombre.toLowerCase().includes(query) ||
            c.puesto.toLowerCase().includes(query) ||
            c.area.toLowerCase().includes(query)
        );
    }

    if (filtroArea.value) {
        result = result.filter(c => c.area === filtroArea.value);
    }

    // Ordenar por nombre si se seleccionó (igual que EnlaceHistorial)
    if (filtroNombre.value === 'asc') {
        result = [...result].sort((a, b) =>
            (a.nombre || '').toString().localeCompare((b.nombre || '').toString(), 'es', { sensitivity: 'base' })
        );
    } else if (filtroNombre.value === 'desc') {
        result = [...result].sort((a, b) =>
            (b.nombre || '').toString().localeCompare((a.nombre || '').toString(), 'es', { sensitivity: 'base' })
        );
    }

    if (filtroFecha.value === 'reciente') {
        result = [...result].sort((a, b) =>
            new Date(b.fechainicio) - new Date(a.fechainicio)
        );
    } else if (filtroFecha.value === 'antigua') {
        result = [...result].sort((a, b) =>
            new Date(a.fechainicio) - new Date(b.fechainicio)
        );
    }

    return result;
});

// Formatea el nombre del rol/puesto del sistema
const formatRoleName = (role) => {
    const map = {
        'ADMIN': 'Admin',
        'EMPLEADO': 'Empleado',
        'JEFE_INCIDENCIAS': 'Jefe de Incidencias',
        'JEFE_VACACIONES': 'Jefe de Vacaciones',
        'JEFE_CONTRATOS': 'Jefe de Contratos',
        'JEFE_ASISTENCIAS': 'Jefe de Asistencias',
        'JEFE_AREA': 'Jefe de Área',
        'GERENTE_GENERAL': 'Gerente General',
        'Analista de Datos': 'Analista de Datos',
        'Contador General': 'Contador General',
        'Desarrollador Full Stack': 'Desarrollador Full Stack'
    };
    return map[role] || role;
};

const revisarContrato = (contrato) => {
    emit('revisar-contrato', contrato);
};

const volverInicio = () => {
    emit('volver-inicio');
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:wght@400;700&display=swap');

.contratos-list-view {
    background-color: #d9d9d9;
    min-height: 100vh;
    padding: 2rem;
}

.top-header {
    background: white;
    padding: 2rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    border-radius: 0 0 20px 20px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.btn-volver {
    background: #f3f4f6;
    border: none;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.btn-volver:hover {
    background: #e5e7eb;
    transform: translateX(-4px);
}

.btn-volver .material-symbols-rounded {
    font-size: 1.5rem;
    color: #1f2937;
}

.header-content {
    flex: 1;
}

.top-header h1 {
    font-size: 1.75rem;
    font-weight: 800;
    color: #1f2937;
    margin: 0;
}

.search-section {
    background-color: white;
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.search-box {
    position: relative;
    width: 100%;
}

.search-box input {
    width: 100%;
    padding: 1rem 1.5rem 1rem 3.5rem;
    border: 2px solid #e5e7eb;
    border-radius: 14px;
    background-color: white;
    font-size: 1rem;
    outline: none;
    color: #1f2937;
    transition: all 0.3s ease;
}

.search-box input:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-box input::placeholder {
    color: #6b7280;
}

.search-icon {
    position: absolute;
    left: 1.25rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    font-size: 22px;
    pointer-events: none;
}

.section-title {
    background-color: white;
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 1.5rem;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.section-title h2 {
    font-size: 1.75rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 2px;
    position: relative;
    display: inline-block;
    padding-bottom: 1rem;
}

.section-title .underline {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    border-radius: 2px;
}

.filters-container {
    background-color: white;
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 1.5rem;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.filter-group label {
    font-size: 0.9rem;
    font-weight: 700;
    color: #1f2937;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.filter-select {
    padding: 0.875rem 1.25rem;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    background-color: white;
    font-size: 0.95rem;
    color: #1f2937;
    cursor: pointer;
    outline: none;
    transition: all 0.3s ease;
    appearance: none;
    background-repeat: no-repeat;
    background-position: right 1rem center;
    padding-right: 3rem;
}

.filter-select:hover {
    border-color: #667eea;
}

.filter-select:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Estilos para input fecha */
.filter-group input[type="date"] {
    padding: 0.875rem 1.25rem;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    background-color: white;
    font-size: 0.95rem;
    color: #1f2937;
    cursor: pointer;
    outline: none;
    transition: all 0.3s ease;
}

.filter-group input[type="date"]:hover {
    border-color: #667eea;
}

.filter-group input[type="date"]:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.contratos-table {
    background-color: white;
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 150px;
    padding: 1.25rem 1.5rem;
    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
    border-radius: 12px;
    font-weight: 800;
    color: #6b7280;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 1rem;
}

.table-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 150px;
    padding: 1.5rem;
    border: 2px solid;
    border-radius: 16px;
    align-items: center;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.table-row::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: currentColor;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.table-row:hover::before {
    opacity: 1;
}

.table-row:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
}

.col-datos {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.avatar {
    width: 55px;
    height: 55px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
    font-size: 0.85rem;
    color: #666;
}

.col-puesto,
.col-area {
    font-weight: 600;
    color: #333;
    font-size: 0.9rem;
}

.btn-revisar {
    padding: 0.75rem 1.75rem;
    background: white;
    border: 2px solid;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    position: relative;
    overflow: hidden;
}

.btn-revisar::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.3);
    transition: left 0.3s ease;
}

.btn-revisar:hover::before {
    left: 100%;
}

.btn-revisar:hover {
    background-color: currentColor;
    color: white !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 1024px) {
    .filters-container {
        grid-template-columns: 1fr;
    }

    .table-header,
    .table-row {
        grid-template-columns: 2fr 1fr 1fr 120px;
    }
}

@media (max-width: 768px) {
    .search-section {
        flex-direction: column;
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
