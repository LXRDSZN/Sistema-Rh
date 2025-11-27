<template>
    <div class="enlace-historial">
        <!-- Header -->
        <div class="top-header">
            <button class="btn-back" @click="volverInicio">
                <span class="material-symbols-rounded">arrow_back</span>
            </button>
            <h1>Contratos/Historial</h1>
        </div>

        <!-- Contenido -->
        <div class="content-card">
            <!-- Barra de búsqueda -->
            <div class="search-section">
                <div class="search-box">
                    <span class="material-symbols-rounded">search</span>
                    <input v-model="searchQuery" type="text" placeholder="Buscar" @input="aplicarFiltros" />
                </div>
            </div>

            <!-- Filtros -->
            <div class="filters-section">
                <div class="filter-group">
                    <label>Nombre</label>
                    <select v-model="filtros.nombre" @change="aplicarFiltros">
                        <option value="">Sin filtro</option>
                        <option value="asc">A-Z (Ascendente)</option>
                        <option value="desc">Z-A (Descendente)</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label>Tipo</label>
                    <select v-model="filtros.tipo" @change="aplicarFiltros">
                        <option value="">Todos</option>
                        <option value="Indefinido">Indefinido</option>
                        <option value="Temporal">Temporal</option>
                        <option value="Por Proyecto">Por Proyecto</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label>Fecha Inicio</label>
                    <select v-model="filtros.fecha" @change="aplicarFiltros">
                        <option value="">Sin filtro</option>
                        <option value="reciente">Más reciente</option>
                        <option value="antiguo">Más antiguo</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label>Área</label>
                    <select v-model="filtros.area" @change="aplicarFiltros">
                        <option value="">Todas las áreas</option>
                        <option v-for="area in areas" :key="area.id" :value="area.id">
                            {{ area.nombre }}
                        </option>
                    </select>
                </div>
            </div>

            <!-- Tabla de contratos -->
            <div class="table-section" v-if="contratosFiltrados.length > 0">
                <div class="contract-card" v-for="contrato in contratosFiltrados" :key="contrato.id">
                    <div class="card-content">
                        <!-- Icono -->
                        <div class="card-icon">
                            <span class="material-symbols-rounded">description</span>
                        </div>

                        <!-- Información principal -->
                        <!-- Información principal -->
                        <div class="card-info">
                            <div class="info-left">
                                <h3>{{ contrato.nombre_empleado }}</h3>
                            </div>
                            <div class="info-badge">
                                <span class="badge">{{ contrato.tipo_contrato }}</span>
                            </div>
                            <div class="info-center">
                                <span class="date">{{ formatDate(contrato.fecha_inicio) }}</span>
                            </div>
                            <div class="info-right">
                                <span class="area">{{ contrato.area_nombre }}</span>
                            </div>
                        </div>


                        <!-- Botones de acción -->
                        <div class="card-actions">
                            <button class="btn-action descargar" @click="descargarPDF(contrato)" title="Descargar PDF">
                                <span class="material-symbols-rounded">download</span>
                            </button>
                            <button class="btn-action visualizar" @click="visualizarContrato(contrato)"
                                title="Visualizar y editar">
                                <span class="material-symbols-rounded">visibility</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            <!-- Mensaje cuando no hay contratos -->
            <div v-else class="no-contracts">
                <span class="material-symbols-rounded">folder_open</span>
                <p>No hay contratos en el historial</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useContratos } from '@/composables/useContratos';
import { useS3Files } from '@/composables/useS3Files';

const router = useRouter();
const {
    obtenerHistorialContratos,
    obtenerTiposContratos,
    obtenerAreas
} = useContratos();
const { obtenerUrlFirmada, descargarArchivo } = useS3Files();

const searchQuery = ref('');
const contratos = ref([]);
const areas = ref([]);

const filtros = ref({
    nombre: '',
    tipo: '',
    fecha: '',
    area: ''
});

const volverInicio = () => {
    router.push('/Contratos');
};

const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const dia = String(d.getUTCDate()).padStart(2, '0');
    const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
    const anio = d.getUTCFullYear();
    return `${dia}/${mes}/${anio}`;
};

// ✅ Filtrado computado
const contratosFiltrados = computed(() => {
    let resultado = contratos.value;

    // Filtro por búsqueda
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        resultado = resultado.filter(c =>
            c.nombre_empleado.toLowerCase().includes(query)
        );
    }

    // Filtro por tipo
    if (filtros.value.tipo) {
        resultado = resultado.filter(c => c.tipo_contrato === filtros.value.tipo);
    }

    // Filtro por área
    if (filtros.value.area) {
        resultado = resultado.filter(c => c.area_id === filtros.value.area);
    }

    // Ordenar por nombre
    if (filtros.value.nombre === 'asc') {
        resultado.sort((a, b) =>
            a.nombre_empleado.localeCompare(b.nombre_empleado)
        );
    } else if (filtros.value.nombre === 'desc') {
        resultado.sort((a, b) =>
            b.nombre_empleado.localeCompare(a.nombre_empleado)
        );
    }

    // Ordenar por fecha
    if (filtros.value.fecha === 'reciente') {
        resultado.sort((a, b) =>
            new Date(b.fecha_inicio) - new Date(a.fecha_inicio)
        );
    } else if (filtros.value.fecha === 'antiguo') {
        resultado.sort((a, b) =>
            new Date(a.fecha_inicio) - new Date(b.fecha_inicio)
        );
    }

    return resultado;
});

const aplicarFiltros = () => {
    // Los filtros se aplican automáticamente por el computed
    console.log('Filtros aplicados');
};

// helper para extraer la key de S3 desde la URL completa
const obtenerKeyDesdeUrl = (url) => {
    if (!url) return null;
    try {
        const u = new URL(url);
        // quita el primer "/" => "carpeta/archivo.pdf"
        return u.pathname.slice(1);
    } catch {
        // si alguna vez te llega ya como key, lo regresa tal cual
        return url;
    }
};

// ⬇ Descargar PDF
const descargarPDF = async (contrato) => {
    try {
        console.log('Descargando PDF del contrato:', contrato.id);

        if (!contrato.url_almacenamiento) {
            alert('No hay archivo disponible');
            return;
        }

        const key = obtenerKeyDesdeUrl(contrato.url_almacenamiento);
        await descargarArchivo(key); // 👈 usa el helper que ya tienes
    } catch (error) {
        console.error('Error al descargar PDF:', error);
        alert('Ocurrió un error al descargar el contrato');
    }
};


// 👁 Visualizar PDF
const visualizarContrato = async (contrato) => {
    try {
        console.log('Visualizando contrato:', contrato.id);

        if (!contrato.url_almacenamiento) {
            alert('No hay archivo disponible');
            return;
        }

        const key = obtenerKeyDesdeUrl(contrato.url_almacenamiento);
        const url = await obtenerUrlFirmada(key);

        window.open(url, '_blank');
    } catch (error) {
        console.error('Error al abrir contrato:', error);
        alert('Ocurrió un error al abrir el contrato');
    }
};


// Cargar datos iniciales
onMounted(async () => {
    try {
        console.log('Cargando datos del historial...');

        // Cargar contratos del historial
        const res = await obtenerHistorialContratos();
        contratos.value = res || [];
        console.log('✅ Contratos cargados:', contratos.value.length);

        // Cargar tipos de contratos
        const tiposRes = await obtenerTiposContratos();
        console.log('Tipos disponibles:', tiposRes);

        // Cargar áreas para el filtro
        const areasRes = await obtenerAreas();
        areas.value = areasRes || [];
        console.log('✅ Áreas cargadas:', areas.value.length);

    } catch (error) {
        console.error('Error al cargar contratos:', error);
    }
});

</script>

<style scoped>
.enlace-historial {
    min-height: 100vh;
    background-color: #f5f5f5;
}

.top-header {
    background-color: transparent;
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
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

.content-card {
    background-color: white;
    padding: 2rem;
    margin: 1.5rem;
    border-radius: 8px;
}

.search-section {
    margin-bottom: 1.5rem;
}

.search-box {
    display: flex;
    align-items: center;
    background-color: #f0f0f0;
    border-radius: 24px;
    padding: 0.75rem 1.5rem;
    gap: 0.75rem;
}

.search-box .material-symbols-rounded {
    color: #999;
    font-size: 20px;
}

.search-box input {
    flex: 1;
    border: none;
    background: none;
    outline: none;
    font-size: 1rem;
}

.filters-section {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
}

.filter-group {
    display: flex;
    flex-direction: column;
}

.filter-group label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #666;
    margin-bottom: 0.5rem;
}

.filter-group select {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.9rem;
    background-color: white;
    cursor: pointer;
    transition: border-color 0.3s ease;
}

.filter-group select:hover,
.filter-group select:focus {
    border-color: #2196f3;
    outline: none;
}

.table-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.table-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.contract-card {
    border: 2px solid #e8f4f8;
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    background: white;
}

.contract-card:hover {
    border-color: #2196f3;
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.1);
    background: #f8fbfc;
}

.card-content {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.card-icon {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #fff3cd 0%, #ffe8a8 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.card-icon .material-symbols-rounded {
    color: #ff9800;
    font-size: 28px;
}

.card-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.info-left {
    flex: 0.5;
}

.info-left h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    white-space: nowrap;
}

.info-badge {
    flex: 0.2;
}

.info-badge .badge {
    background-color: #e3f2fd;
    color: #1976d2;
    padding: 0.35rem 0.75rem;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.8rem;
    white-space: nowrap;
    display: inline-block;
}

.info-center {
    flex: 0.2;
}

.info-center .date {
    color: #666;
    font-size: 0.95rem;
    font-weight: 500;
    white-space: nowrap;
}

.info-right {
    flex: 0.2;
}

.info-right .area {
    color: #888;
    font-size: 0.9rem;
    background: #f5f5f5;
    padding: 0.35rem 0.75rem;
    border-radius: 6px;
    display: inline-block;
    white-space: nowrap;
}

.card-actions {
    display: flex;
    gap: 0.75rem;
    flex-shrink: 0;
}

.btn-action {
    width: 44px;
    height: 44px;
    border: 1.5px solid #ddd;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.btn-action:hover {
    background: #e3f2fd;
    border-color: #2196f3;
}

.btn-action .material-symbols-rounded {
    font-size: 20px;
    color: #2196f3;
}

.btn-action.descargar:hover {
    background: #c8e6c9;
    border-color: #4caf50;
}

.btn-action.descargar:hover .material-symbols-rounded {
    color: #4caf50;
}

.btn-action.visualizar:hover {
    background: #bbdefb;
    border-color: #2196f3;
}

.no-contracts {
    text-align: center;
    padding: 3rem 1rem;
    color: #999;
}

.no-contracts .material-symbols-rounded {
    font-size: 48px;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.no-contracts p {
    margin: 0;
    font-size: 1.1rem;
}

@media (max-width: 1200px) {
    .card-info {
        gap: 0.75rem;
    }

    .info-left {
        flex: 0.6;
    }

    .info-badge {
        flex: 0.25;
    }

    .info-center {
        flex: 0.15;
    }

    .info-right {
        flex: 0.15;
    }
}

@media (max-width: 768px) {
    .card-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .card-info {
        flex-direction: row;
        gap: 0.5rem;
        width: 100%;
        flex-wrap: wrap;
    }

    .info-left,
    .info-badge,
    .info-center,
    .info-right {
        width: auto;
        flex: none !important;
    }

    .card-actions {
        width: 100%;
        justify-content: flex-end;
    }
}
</style>
