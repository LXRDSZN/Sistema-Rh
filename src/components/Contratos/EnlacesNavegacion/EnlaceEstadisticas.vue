<template>
    <div class="enlace-estadisticas">
        <!-- Filtros superiores -->
        <div class="filters-container">
            <div class="filter-group">
                <label>Departamento</label>
                <select v-model="filters.departamento" class="filter-select">
                    <option value="">Todos</option>
                    <option v-for="dept in departamentos" :key="dept" :value="dept">
                        {{ dept }}
                    </option>
                </select>
            </div>

            <div class="filter-group">
                <label>Tipo de contrato</label>
                <select v-model="filters.tipoContrato" class="filter-select">
                    <option value="">Todos</option>
                    <option value="temporal">Temporal</option>
                    <option value="permanente">Permanente</option>
                    <option value="proyecto">Por Proyecto</option>
                    <option value="outsourcing">Outsourcing</option>
                </select>
            </div>

            <div class="filter-group">
                <label>Período</label>
                <select v-model="filters.periodo" class="filter-select">
                    <option value="indefinido">Indefinido</option>
                    <option value="mensual">Mensual</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="anual">Anual</option>
                </select>
            </div>
        </div>

        <!-- Tarjetas de resumen -->
        <div class="summary-cards">
            <div class="summary-card green">
                <p class="card-title">CONTRATOS ACTIVOS</p>
                <p class="card-number">{{ stats.activos }}</p>
            </div>

            <div class="summary-card blue">
                <p class="card-title">SOLICITUDES DE VACANTES</p>
                <p class="card-number">{{ stats.vacantes }}</p>
            </div>
        </div>

        <!-- Grid de gráficos -->
        <div class="charts-grid">
            <!-- Gráfico de dona: Distribución por tipo de contrato -->
            <div class="chart-card">
                <div class="chart-header">
                    <h3>Distribución por tipo de contrato</h3>
                </div>
                <div class="chart-content">
                    <div class="donut-chart">
                        <svg viewBox="0 0 200 200" class="donut-svg">
                            <!-- Permanente (Verde) -->
                            <circle cx="100" cy="100" r="70" fill="none" :stroke="chartColors.permanente"
                                stroke-width="40"
                                :stroke-dasharray="`${getPercentage('permanente')} ${100 - getPercentage('permanente')}`"
                                stroke-dashoffset="25" transform="rotate(-90 100 100)" />
                            <!-- Temporal (Naranja) -->
                            <circle cx="100" cy="100" r="70" fill="none" :stroke="chartColors.temporal"
                                stroke-width="40"
                                :stroke-dasharray="`${getPercentage('temporal')} ${100 - getPercentage('temporal')}`"
                                :stroke-dashoffset="`${25 - getPercentage('permanente')}`"
                                transform="rotate(-90 100 100)" />
                            <!-- Outsourcing (Azul) -->
                            <circle cx="100" cy="100" r="70" fill="none" :stroke="chartColors.outsourcing"
                                stroke-width="40"
                                :stroke-dasharray="`${getPercentage('outsourcing')} ${100 - getPercentage('outsourcing')}`"
                                :stroke-dashoffset="`${25 - getPercentage('permanente') - getPercentage('temporal')}`"
                                transform="rotate(-90 100 100)" />
                        </svg>
                        <div class="donut-legend">
                            <div class="legend-item">
                                <span class="legend-color" :style="{ backgroundColor: chartColors.permanente }"></span>
                                <span class="legend-text">Permanente</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color" :style="{ backgroundColor: chartColors.temporal }"></span>
                                <span class="legend-text">Temporal</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color" :style="{ backgroundColor: chartColors.outsourcing }"></span>
                                <span class="legend-text">Outsourcing</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color" :style="{ backgroundColor: chartColors.otros }"></span>
                                <span class="legend-text">Otros</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Gráfico de barras: Contratos por área -->
            <div class="chart-card">
                <div class="chart-header">
                    <h3>Contratos por área</h3>
                </div>
                <div class="chart-content">
                    <div class="bar-chart">
                        <div class="bar-container">
                            <div v-for="(area, index) in areasData" :key="index" class="bar-wrapper">
                                <div class="bar" :style="{ height: `${(area.value / maxAreaValue) * 100}%` }"></div>
                                <span class="bar-label">{{ area.label }}</span>
                            </div>
                        </div>
                        <div class="bar-y-axis">
                            <span v-for="n in 6" :key="n" class="y-label">{{ (6 - n) * 2 }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Estado del proceso de contratación -->
            <div class="chart-card">
                <div class="chart-header">
                    <h3>Estado del proceso de contratación</h3>
                </div>
                <div class="chart-content">
                    <div class="process-list">
                        <div v-for="(proceso, index) in procesosContratacion" :key="index" class="process-item">
                            <div class="process-bar">
                                <div class="process-fill" :style="{ width: `${proceso.porcentaje}%` }"></div>
                            </div>
                            <span class="process-label">{{ proceso.nombre }}</span>
                            <span class="process-count">{{ proceso.cantidad }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Calendario -->
            <div class="chart-card">
                <div class="chart-header">
                    <h3>{{ mesActual }}</h3>
                </div>
                <div class="chart-content">
                    <div class="calendar">
                        <div class="calendar-weekdays">
                            <span v-for="day in diasSemana" :key="day" class="weekday">{{ day }}</span>
                        </div>
                        <div class="calendar-days">
                            <div v-for="(day, index) in diasCalendario" :key="index" :class="['calendar-day', {
                                'today': day === diaActual && day !== null,
                                'empty': day === null,
                                'has-event': tieneEvento(day)
                            }]">
                                {{ day }}
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
    stats: {
        type: Object,
        default: () => ({
            activos: 456,
            vacantes: 18
        })
    },
    departamentos: {
        type: Array,
        default: () => ['RRHH', 'Finanzas', 'Operaciones', 'TI', 'Marketing']
    }
});

// Filtros
const filters = ref({
    departamento: '',
    tipoContrato: '',
    periodo: 'indefinido'
});

// Colores del gráfico
const chartColors = {
    permanente: '#4caf50',
    temporal: '#ff9800',
    outsourcing: '#17a2b8',
    otros: '#e91e63'
};

// Datos para el gráfico de dona
const distribucionContratos = ref({
    permanente: 180,
    temporal: 120,
    outsourcing: 100,
    otros: 56
});

const totalContratos = computed(() => {
    return Object.values(distribucionContratos.value).reduce((a, b) => a + b, 0);
});

const getPercentage = (tipo) => {
    return (distribucionContratos.value[tipo] / totalContratos.value) * 100;
};

// Datos para el gráfico de barras
const areasData = ref([
    { label: '0', value: 8 },
    { label: '1', value: 7 },
    { label: '2', value: 10 },
    { label: '3', value: 9 },
    { label: '4', value: 11 }
]);

const maxAreaValue = computed(() => {
    return Math.max(...areasData.value.map(a => a.value));
});

// Datos del proceso de contratación
const procesosContratacion = ref([
    { nombre: 'Solicitud recibida', cantidad: 25, porcentaje: 80 },
    { nombre: 'En revisión', cantidad: 18, porcentaje: 60 },
    { nombre: 'Entrevistas', cantidad: 12, porcentaje: 40 },
    { nombre: 'Oferta enviada', cantidad: 8, porcentaje: 25 },
    { nombre: 'Contratado', cantidad: 5, porcentaje: 15 }
]);

// Calendario
const mesActual = 'Mes Octubre 2025';
const diaActual = 22;
const diasSemana = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

// Generar días del calendario (Octubre 2025)
const diasCalendario = computed(() => {
    const dias = [];
    // Días vacíos al inicio (Octubre 2025 empieza en miércoles)
    for (let i = 0; i < 3; i++) {
        dias.push(null);
    }
    // Días del mes
    for (let i = 1; i <= 31; i++) {
        dias.push(i);
    }
    return dias;
});

const tieneEvento = (dia) => {
    // Días con eventos de ejemplo
    const diasConEventos = [5, 12, 19, 26];
    return diasConEventos.includes(dia);
};
</script>

<style scoped>
.enlace-estadisticas {
    max-width: 1400px;
    margin: 0 auto;
}

/* Filtros */
.filters-container {
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
    font-size: 0.9rem;
}

.filter-select {
    padding: 0.75rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.95rem;
    background-color: white;
    cursor: pointer;
    transition: border-color 0.3s ease;
}

.filter-select:focus {
    outline: none;
    border-color: #5b4cdb;
}

/* Tarjetas de resumen */
.summary-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.summary-card {
    padding: 2rem;
    border-radius: 12px;
    text-align: center;
}

.summary-card.green {
    background-color: #d4edda;
}

.summary-card.blue {
    background-color: #d1ecf1;
}

.card-title {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    line-height: 1.4;
}

.summary-card.green .card-title {
    color: #4caf50;
}

.summary-card.blue .card-title {
    color: #17a2b8;
}

.card-number {
    font-size: 3rem;
    font-weight: 700;
    margin: 0;
}

.summary-card.green .card-number {
    color: #4caf50;
}

.summary-card.blue .card-number {
    color: #17a2b8;
}

/* Grid de gráficos */
.charts-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
}

.chart-card {
    background-color: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.chart-header h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
}


/* Gráfico de dona */
.donut-chart {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.donut-svg {
    width: 180px;
    height: 180px;
}

.donut-legend {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.legend-color {
    width: 16px;
    height: 16px;
    border-radius: 3px;
}

.legend-text {
    font-size: 0.9rem;
    color: #666;
}

/* Gráfico de barras */
.bar-chart {
    position: relative;
    height: 200px;
    display: flex;
    align-items: flex-end;
}

.bar-container {
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    width: 100%;
    height: 100%;
    padding-left: 30px;
}

.bar-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    height: 100%;
    justify-content: flex-end;
}

.bar {
    width: 40px;
    background-color: #4caf50;
    border-radius: 4px 4px 0 0;
    transition: all 0.3s ease;
}

.bar-wrapper:hover .bar {
    background-color: #45a049;
}

.bar-label {
    font-size: 0.85rem;
    color: #666;
    font-weight: 600;
}

.bar-y-axis {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-bottom: 25px;
}

.y-label {
    font-size: 0.75rem;
    color: #999;
}

/* Lista de procesos */
.process-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.process-item {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.process-bar {
    flex: 1;
    height: 24px;
    background-color: #f0f0f0;
    border-radius: 12px;
    overflow: hidden;
}

.process-fill {
    height: 100%;
    background: linear-gradient(90deg, #5b4cdb, #7c6fd9);
    border-radius: 12px;
    transition: width 0.3s ease;
}

.process-label {
    font-size: 0.85rem;
    color: #666;
    min-width: 120px;
}

.process-count {
    font-size: 0.9rem;
    font-weight: 600;
    color: #2c3e50;
    min-width: 30px;
    text-align: right;
}

/* Calendario */
.calendar {
    padding: 1rem;
}

.calendar-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.weekday {
    text-align: center;
    font-size: 0.85rem;
    font-weight: 600;
    color: #666;
}

.calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.5rem;
}

.calendar-day {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    color: #2c3e50;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.calendar-day:hover:not(.empty) {
    background-color: #f0f0f5;
}

.calendar-day.empty {
    cursor: default;
}

.calendar-day.today {
    background-color: #17a2b8;
    color: white;
    font-weight: 700;
}

.calendar-day.has-event {
    background-color: #fff3cd;
    font-weight: 600;
}

/* Responsive */
@media (max-width: 1200px) {
    .charts-grid {
        grid-template-columns: 1fr;
    }

    .donut-chart {
        flex-direction: column;
    }
}

@media (max-width: 768px) {
    .filters-container {
        grid-template-columns: 1fr;
    }

    .summary-cards {
        grid-template-columns: 1fr;
    }

    .bar-container {
        padding-left: 20px;
    }

    .bar {
        width: 30px;
    }

    .process-label {
        min-width: 80px;
        font-size: 0.75rem;
    }
}
</style>
