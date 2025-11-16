<template>
    <div class="historial-view">
        <!-- Header con botón de regreso -->
        <div class="top-header">
            <button class="btn-volver" @click="volverInicio">
                <span class="material-symbols-rounded">arrow_back</span>
            </button>
            <h1>Contratos/Historial</h1>
        </div>

        <!-- Barra de búsqueda -->
        <div class="search-section">
            <div class="search-box">
                <input type="text" placeholder="Buscar" v-model="searchQuery">
                <span class="material-symbols-rounded search-icon">search</span>
            </div>
        </div>

        <!-- Filtros -->
        <div class="filters-container">
            <div class="filter-group">
                <select v-model="filtroNombre" class="filter-select">
                    <option value="">Nombre</option>
                    <option v-for="nombre in nombresUnicos" :key="nombre" :value="nombre">
                        {{ nombre }}
                    </option>
                </select>
            </div>

            <div class="filter-group">
                <select v-model="filtroTipo" class="filter-select">
                    <option value="">Tipo</option>
                    <option value="INDEFINIDO">INDEFINIDO</option>
                    <option value="TEMPORAL">TEMPORAL</option>
                    <option value="POR PROYECTO">POR PROYECTO</option>
                </select>
            </div>

            <div class="filter-group">
                <select v-model="filtroFechaInicio" class="filter-select">
                    <option value="">Fecha inicio</option>
                    <option value="reciente">Más reciente</option>
                    <option value="antigua">Más antigua</option>
                </select>
            </div>

            <div class="filter-group">
                <select v-model="filtroArea" class="filter-select">
                    <option value="">Área</option>
                    <option v-for="area in areasUnicas" :key="area" :value="area">
                        {{ area }}
                    </option>
                </select>
            </div>
        </div>

        <!-- Lista de contratos históricos -->
        <div class="contratos-list">
            <div v-for="contrato in contratosFiltrados" :key="contrato.id" class="contrato-card">
                <!-- Icono de contrato -->
                <div class="contrato-icon">
                    <span class="material-symbols-rounded">description</span>
                </div>

                <!-- Información del contrato -->
                <div class="contrato-info">
                    <div class="nombre">{{ contrato.nombre }}</div>
                    <div class="detalles">
                        <span class="tipo">{{ contrato.tipo }}</span>
                        <span class="fecha">{{ contrato.fechaInicio }}</span>
                        <span class="area">{{ contrato.area }}</span>
                    </div>
                </div>

                <!-- Acciones -->
                <div class="contrato-actions">
                    <button class="btn-action" @click="descargarContrato(contrato)" title="Descargar">
                        <span class="material-symbols-rounded">download</span>
                    </button>
                    <button class="btn-action" @click="verContrato(contrato)" title="Ver">
                        <span class="material-symbols-rounded">visibility</span>
                    </button>
                </div>
            </div>

            <!-- Estado vacío -->
            <div v-if="contratosFiltrados.length === 0" class="empty-state">
                <span class="material-symbols-rounded empty-icon">folder_open</span>
                <p>No hay contratos en el historial</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    contratos: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['volver-inicio', 'ver-contrato', 'descargar-contrato']);

// Estados locales
const searchQuery = ref('');
const filtroNombre = ref('');
const filtroTipo = ref('');
const filtroFechaInicio = ref('');
const filtroArea = ref('');

// Computed para opciones de filtros
const nombresUnicos = computed(() => {
    return [...new Set(props.contratos.map(c => c.nombre))];
});

const areasUnicas = computed(() => {
    return [...new Set(props.contratos.map(c => c.area))];
});

// Computed para filtrar contratos
const contratosFiltrados = computed(() => {
    let result = props.contratos;

    // Filtro por búsqueda
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(c =>
            c.nombre.toLowerCase().includes(query) ||
            c.tipo.toLowerCase().includes(query) ||
            c.area.toLowerCase().includes(query)
        );
    }

    // Filtro por nombre
    if (filtroNombre.value) {
        result = result.filter(c => c.nombre === filtroNombre.value);
    }

    // Filtro por tipo
    if (filtroTipo.value) {
        result = result.filter(c => c.tipo === filtroTipo.value);
    }

    // Filtro por área
    if (filtroArea.value) {
        result = result.filter(c => c.area === filtroArea.value);
    }

    // Filtro por fecha
    if (filtroFechaInicio.value === 'reciente') {
        result = [...result].sort((a, b) =>
            new Date(b.fechaInicio) - new Date(a.fechaInicio)
        );
    } else if (filtroFechaInicio.value === 'antigua') {
        result = [...result].sort((a, b) =>
            new Date(a.fechaInicio) - new Date(b.fechaInicio)
        );
    }

    return result;
});

// Métodos
const volverInicio = () => {
    emit('volver-inicio');
};

const verContrato = (contrato) => {
    emit('ver-contrato', contrato);
};

const descargarContrato = (contrato) => {
    emit('descargar-contrato', contrato);
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:wght@400;700&display=swap');

.historial-view {
    background-color: #e0e0e0;
    min-height: 100vh;
    padding: 2rem;
}

.top-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
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

.search-section {
    background-color: white;
    border-radius: 12px;
    padding: 1.5rem;
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

.filters-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
}

.filter-group {
    display: flex;
    flex-direction: column;
}

.filter-select {
    padding: 0.875rem 1.25rem;
    border: 2px solid #999;
    border-radius: 8px;
    background-color: white;
    font-size: 0.95rem;
    color: #666;
    cursor: pointer;
    outline: none;
    transition: all 0.3s ease;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23999' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    padding-right: 3rem;
}

.filter-select:hover {
    border-color: #666;
}

.filter-select:focus {
    border-color: #4F39F6;
    box-shadow: 0 0 0 3px rgba(79, 57, 246, 0.1);
}

.contratos-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.contrato-card {
    background-color: white;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    transition: all 0.3s ease;
}

.contrato-card:hover {
    border-color: #4F39F6;
    box-shadow: 0 4px 12px rgba(79, 57, 246, 0.1);
    transform: translateY(-2px);
}

.contrato-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #FFB800 0%, #FF8C00 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.contrato-icon .material-symbols-rounded {
    font-size: 32px;
    color: white;
}

.contrato-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.nombre {
    font-size: 1.1rem;
    font-weight: 700;
    color: #333;
}

.detalles {
    display: flex;
    gap: 2rem;
    font-size: 0.9rem;
    color: #666;
}

.tipo {
    font-weight: 600;
    text-transform: uppercase;
}

.contrato-actions {
    display: flex;
    gap: 0.75rem;
}

.btn-action {
    width: 48px;
    height: 48px;
    border: 2px solid #e0e0e0;
    background-color: white;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-action .material-symbols-rounded {
    font-size: 24px;
    color: #666;
}

.btn-action:hover {
    border-color: #4F39F6;
    background-color: #4F39F6;
}

.btn-action:hover .material-symbols-rounded {
    color: white;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    background-color: white;
    border-radius: 12px;
    border: 2px dashed #ccc;
}

.empty-icon {
    font-size: 64px;
    color: #ccc;
    margin-bottom: 1rem;
}

.empty-state p {
    font-size: 1.1rem;
    color: #999;
    margin: 0;
}

@media (max-width: 1024px) {
    .filters-container {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .filters-container {
        grid-template-columns: 1fr;
    }

    .contrato-card {
        flex-direction: column;
        align-items: flex-start;
    }

    .detalles {
        flex-direction: column;
        gap: 0.5rem;
    }

    .contrato-actions {
        width: 100%;
        justify-content: flex-end;
    }
}
</style>
