<template>
    <div class="enlace-avencer">
        <!-- Header con flecha y título -->
        <div class="top-header">
            <button class="btn-back" @click="volverInicio">
                <span class="material-symbols-rounded">arrow_back</span>
            </button>
            <h1>Contratos - Próximos a Vencer</h1>
        </div>

        <div class="content-box">
            <h2 class="title">CONTRATOS PRÓXIMOS A VENCER</h2>

            <!-- Filtros -->
            <div class="filters-row">
                <div class="filter-group">
                    <label>Nombre</label>
                    <select v-model="filters.nombre" class="filter-select">
                        <option value="">Ingresa nombre</option>
                        <option v-for="nombre in nombresUnicos" :key="nombre" :value="nombre">
                            {{ nombre }}
                        </option>
                    </select>
                </div>

                <div class="filter-group">
                    <label>Área</label>
                    <select v-model="filters.area" class="filter-select">
                        <option value="">Seleccione área</option>
                        <option v-for="area in areasUnicas" :key="area" :value="area">
                            {{ area }}
                        </option>
                    </select>
                </div>

                <div class="filter-group">
                    <label>Fecha</label>
                    <select v-model="filters.fecha" class="filter-select">
                        <option value="">Seleccione la fecha</option>
                        <option value="reciente">Más reciente</option>
                        <option value="antiguo">Más antiguo</option>
                    </select>
                </div>
            </div>

            <!-- Tabla -->
            <div class="tabla-header">
                <span class="col-datos">Datos</span>
                <span class="col-puesto">Puesto</span>
                <span class="col-area">Área</span>
                <span class="col-action"></span>
            </div>

            <div class="tabla-body">
                <div v-for="contrato in contratosFiltrados" :key="contrato.id" class="tabla-row">
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

const props = defineProps({
    contratos: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['volver-inicio', 'revisar-contrato']);

// Función para volver al inicio
const volverInicio = () => {
    emit('volver-inicio');
};

const filters = ref({
    nombre: '',
    area: '',
    fecha: ''
});

const nombresUnicos = computed(() => {
    return [...new Set(props.contratos.map(c => c.nombre))];
});

const areasUnicas = computed(() => {
    return [...new Set(props.contratos.map(c => c.area))];
});

const contratosFiltrados = computed(() => {
    let resultado = [...props.contratos];

    if (filters.value.nombre) {
        resultado = resultado.filter(c => c.nombre === filters.value.nombre);
    }

    if (filters.value.area) {
        resultado = resultado.filter(c => c.area === filters.value.area);
    }

    if (filters.value.fecha === 'reciente') {
        resultado = resultado.sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio));
    } else if (filters.value.fecha === 'antiguo') {
        resultado = resultado.sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio));
    }

    return resultado;
});

const revisarContrato = (contrato) => {
    emit('revisar-contrato', contrato);
};
</script>

<style scoped>
.enlace-avencer {
    max-width: 1400px;
    margin: 0 auto;
}

/* Header con flecha */
.top-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem 1.5rem 1rem 1.5rem;
    background-color: transparent;
}

.btn-back {
    background: none;
    border: none;
    color: #333;
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s ease;
}

.btn-back:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.btn-back .material-symbols-rounded {
    font-size: 26px;
}

.top-header h1 {
    color: #333;
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
}

.content-box {
    background-color: white;
    border: 3px solid #ff9800;
    border-radius: 12px;
    padding: 2rem;
    margin: 0 1.5rem;
}

.title {
    color: #ff9800;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 2rem 0;
    letter-spacing: 0.5px;
}

/* Filtros */
.filters-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.filter-group label {
    font-weight: 600;
    color: #2c3e50;
    font-size: 0.95rem;
}

.filter-select {
    padding: 0.75rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.95rem;
    background-color: #f9f9f9;
    cursor: pointer;
    transition: border-color 0.3s ease;
}

.filter-select:focus {
    outline: none;
    border-color: #ff9800;
    background-color: white;
}

/* Tabla */
.tabla-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 150px;
    padding: 1rem 1.5rem;
    background-color: #fafafa;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-weight: 600;
    color: #555;
    font-size: 0.9rem;
}

.tabla-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.tabla-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 150px;
    padding: 1.5rem;
    background-color: #fafafa;
    border-radius: 12px;
    align-items: center;
    transition: all 0.3s ease;
}

.tabla-row:hover {
    background-color: #fff8f0;
    box-shadow: 0 2px 8px rgba(255, 152, 0, 0.15);
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
    color: #ff9800;
    font-weight: 600;
    margin: 0;
}

.col-puesto,
.col-area {
    font-weight: 600;
    color: #2c3e50;
}

.btn-revisar {
    padding: 0.6rem 1.5rem;
    background-color: white;
    color: #ff9800;
    border: 2px solid #ff9800;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-revisar:hover {
    background-color: #ff9800;
    color: white;
}

/* Responsive */
@media (max-width: 1024px) {
    .filters-row {
        grid-template-columns: 1fr;
    }

    .tabla-header,
    .tabla-row {
        grid-template-columns: 2fr 1fr 1fr 120px;
    }
}

@media (max-width: 768px) {
    .content-box {
        padding: 1.5rem;
    }

    .tabla-header {
        display: none;
    }

    .tabla-row {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
}
</style>
