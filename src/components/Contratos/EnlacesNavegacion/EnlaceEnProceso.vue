<template>
    <div class="proceso-view">
        <!-- Header con flecha de regreso y título -->
        <div class="top-header">
            <button class="btn-volver" @click="volverInicio">
                <span class="material-symbols-rounded">arrow_back</span>
            </button>
            <h1>Contratos/Proceso</h1>
        </div>

        <!-- Barra de búsqueda con avatar -->
        <div class="search-section">
            <div class="search-box">
                <input type="text" placeholder="Buscar" v-model="searchQuery">
                <span class="material-symbols-rounded search-icon">search</span>
            </div>
            <div class="user-avatar">
                <span class="material-symbols-rounded">person</span>
            </div>
        </div>

        <!-- Título de sección -->
        <div class="section-title">
            <h2>CONTRATOS EN PROCESO</h2>
        </div>

        <!-- Filtros -->
        <div class="filters-container">
            <div class="filter-group">
                <label>Nombre</label>
                <select v-model="filtroNombre" class="filter-select">
                    <option value="">Ingresa nombre</option>
                    <option v-for="nombre in nombresUnicos" :key="nombre" :value="nombre">
                        {{ nombre }}
                    </option>
                </select>
            </div>

            <div class="filter-group">
                <label>Área</label>
                <select v-model="filtroArea" class="filter-select">
                    <option value="">Seleccione área</option>
                    <option v-for="area in areasUnicas" :key="area" :value="area">
                        {{ area }}
                    </option>
                </select>
            </div>

            <div class="filter-group">
                <label>Fecha</label>
                <select v-model="filtroFecha" class="filter-select">
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
                <div v-for="contrato in contratosFiltrados" :key="contrato.id" class="table-row">
                    <div class="col-datos">
                        <img :src="contrato.avatar" :alt="contrato.nombre" class="avatar">
                        <div class="datos-info">
                            <div class="nombre">{{ contrato.nombre }}</div>
                            <div class="estado">{{ contrato.estadoTexto || contrato.fase }}</div>
                        </div>
                    </div>
                    <div class="col-puesto">{{ contrato.puesto }}</div>
                    <div class="col-area">{{ contrato.area }}</div>
                    <div class="col-action">
                        <button class="btn-revisar" @click="revisarContrato(contrato)">
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

// Props
const props = defineProps({
    contratos: {
        type: Array,
        required: true
    }
});

// Emits
const emit = defineEmits(['revisar-contrato', 'volver-inicio']);

// Estado local
const searchQuery = ref('');
const filtroNombre = ref('');
const filtroArea = ref('');
const filtroFecha = ref('');

// Obtener nombres únicos para el filtro
const nombresUnicos = computed(() => {
    return [...new Set(props.contratos.map(c => c.nombre))];
});

// Obtener áreas únicas para el filtro
const areasUnicas = computed(() => {
    return [...new Set(props.contratos.map(c => c.area))];
});

// Filtrar contratos
const contratosFiltrados = computed(() => {
    let result = props.contratos;

    // Filtro por búsqueda
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(c =>
            c.nombre.toLowerCase().includes(query) ||
            c.puesto.toLowerCase().includes(query) ||
            c.area.toLowerCase().includes(query)
        );
    }

    // Filtro por nombre
    if (filtroNombre.value) {
        result = result.filter(c => c.nombre === filtroNombre.value);
    }

    // Filtro por área
    if (filtroArea.value) {
        result = result.filter(c => c.area === filtroArea.value);
    }

    // Ordenar por fecha si se selecciona
    if (filtroFecha.value === 'reciente') {
        result = [...result].sort((a, b) =>
            new Date(b.fechaInicio) - new Date(a.fechaInicio)
        );
    } else if (filtroFecha.value === 'antigua') {
        result = [...result].sort((a, b) =>
            new Date(a.fechaInicio) - new Date(b.fechaInicio)
        );
    }

    return result;
});

// Métodos
const revisarContrato = (contrato) => {
    emit('revisar-contrato', contrato);
};

const volverInicio = () => {
    emit('volver-inicio');
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:wght@400;700&display=swap');

.proceso-view {
    background-color: #d9d9d9;
    min-height: 100vh;
    padding: 2rem;
}

/* Top Header */
.top-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.btn-volver {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
}

.btn-volver:hover {
    transform: translateX(-4px);
}

.btn-volver .material-symbols-rounded {
    font-size: 2rem;
    color: #333;
}

.top-header h1 {
    font-size: 1.75rem;
    font-weight: 600;
    color: #000;
    margin: 0;
}

/* Search Section */
.search-section {
    background-color: white;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 1.5rem;
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

.search-icon {
    position: absolute;
    right: 1.5rem;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
    font-size: 24px;
    cursor: pointer;
}

.user-avatar {
    width: 70px;
    height: 70px;
    background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.user-avatar .material-symbols-rounded {
    font-size: 40px;
    color: white;
}

/* Section Title */
.section-title {
    background-color: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
}

.section-title h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #00bcd4;
    margin: 0;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 2px;
}

/* Filters Container */
.filters-container {
    background-color: white;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 1.5rem;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.filter-group label {
    font-size: 1rem;
    font-weight: 600;
    color: #333;
}

.filter-select {
    padding: 0.875rem 1.25rem;
    border: 2px solid #00bcd4;
    border-radius: 8px;
    background-color: white;
    font-size: 0.95rem;
    color: #999;
    cursor: pointer;
    outline: none;
    transition: all 0.3s ease;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%2300bcd4' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    padding-right: 3rem;
}

.filter-select:hover {
    border-color: #0097a7;
}

.filter-select:focus {
    border-color: #0097a7;
    box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.1);
}

/* Table */
.contratos-table {
    background-color: white;
    border-radius: 12px;
    padding: 1.5rem;
}

.table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 150px;
    padding: 1rem;
    background-color: #f0f0f0;
    border-radius: 8px;
    font-weight: 700;
    color: #555;
    font-size: 0.9rem;
    text-transform: uppercase;
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
    border: 2px solid #00bcd4;
    border-radius: 12px;
    background-color: #f0fbff;
    align-items: center;
    transition: all 0.3s ease;
}

.table-row:hover {
    box-shadow: 0 4px 12px rgba(0, 188, 212, 0.2);
    transform: translateY(-2px);
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
    padding: 0.6rem 1.5rem;
    background-color: white;
    color: #00bcd4;
    border: 2px solid #00bcd4;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
}

.btn-revisar:hover {
    background-color: #00bcd4;
    color: white;
}

/* Responsive */
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
