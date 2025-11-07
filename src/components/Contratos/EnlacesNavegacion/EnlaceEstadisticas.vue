<template>
    <div class="enlace-estadisticas">
        <!-- Header gris con flecha y título -->
        <div class="top-header">
            <button class="btn-back" @click="volverInicio">
                <span class="material-symbols-rounded">arrow_back</span>
            </button>
            <h1>Contratos - Estadísticas</h1>
        </div>

        <!-- Contenido blanco -->
        <div class="content-card">
            <!-- Barra de búsqueda y notificaciones -->
            <div class="search-notifications">
                <div class="search-box">
                    <input type="text" placeholder="Buscar" v-model="searchQuery">
                    <span class="material-symbols-rounded">search</span>
                </div>
                <button class="icon-btn">
                    <span class="material-symbols-rounded">notifications</span>
                </button>
            </div>

            <!-- Filtros superiores -->
            <div class="filters-container">
                <div class="filter-group">
                    <label>Departamento</label>
                    <select v-model="filters.area" class="filter-select">
                        <option value="">Todos</option>
                        <option value="Contratos">Contratos</option>
                        <option value="Asistencias">Asistencias</option>
                        <option value="Incidencias">Incidencias</option>
                        <option value="Vacaciones">Vacaciones</option>
                        <option value="Areas">Areas</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label>Tipo de contrato</label>
                    <select v-model="filters.tipoContrato" class="filter-select">
                        <option value="">Todos</option>
                        <option value="Indefinidos">Indefinidos</option>
                        <option value="Temporales">Temporales</option>
                        <option value="Por Obra">Por Obra</option>
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
            </div> <!-- Tarjetas de resumen -->
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
                    <h3 class="chart-title">Distribución por tipo de contrato</h3>
                    <div class="chart-content">
                        <canvas ref="donutChart" width="400" height="300"></canvas>
                    </div>
                </div>

                <!-- Gráfico de barras: Contratos por área -->
                <div class="chart-card">
                    <h3 class="chart-title">Contratos por área</h3>
                    <div class="chart-content">
                        <canvas ref="barChart" width="400" height="300"></canvas>
                    </div>
                </div>

                <!-- Estado del proceso de contratación -->
                <div class="chart-card">
                    <h3 class="chart-title">Estado del proceso de contratación</h3>
                    <div class="chart-content empty-state">
                        <p>No hay datos disponibles</p>
                    </div>
                </div>

                <!-- Calendario -->
                <div class="chart-card">
                    <h3 class="chart-title">Mes {{ currentMonth }} {{ currentYear }}</h3>
                    <div class="chart-content">
                        <div class="calendar">
                            <div class="calendar-header">
                                <div v-for="day in diasSemana" :key="day" class="day-name">
                                    {{ day }}
                                </div>
                            </div>
                            <div class="calendar-body">
                                <div v-for="day in calendarDays" :key="day.date" :class="['calendar-day', {
                                    'other-month': day.otherMonth,
                                    'today': day.isToday
                                }]">
                                    {{ day.day }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tooltip para el gráfico de dona -->
            <div v-if="tooltip.show" class="chart-tooltip" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
                <strong>{{ tooltip.label }}</strong><br>
                {{ tooltip.value }} empleados
            </div>
        </div> <!-- Cierre de content-card -->
    </div> <!-- Cierre de enlace-estadisticas -->
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Función para volver al inicio
const volverInicio = () => {
    router.push('/Contratos');
};

// Referencias de canvas para los gráficos
const donutChart = ref(null);
const barChart = ref(null);

// Estado del tooltip
const tooltip = ref({
    show: false,
    x: 0,
    y: 0,
    label: '',
    value: 0
});

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

// Estado de búsqueda
const searchQuery = ref('');

// Filtros
const filters = ref({
    area: '',
    tipoContrato: '',
    periodo: 'indefinido'
});

// Calendario dinámico
const today = new Date();
const currentMonth = computed(() => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[today.getMonth()];
});
const currentYear = today.getFullYear();
const diaActual = today.getDate(); // Día actual
const mesActual = today.getMonth();
const añoActual = today.getFullYear();
const diasSemana = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Generar días del calendario dinámicamente
const calendarDays = computed(() => {
    const days = [];
    const firstDay = new Date(añoActual, mesActual, 1).getDay();
    const daysInMonth = new Date(añoActual, mesActual + 1, 0).getDate();

    // Días vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
        days.push({ day: null, otherMonth: true, isToday: false, date: null });
    }

    // Días del mes
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({
            day: i,
            otherMonth: false,
            isToday: i === diaActual && mesActual === today.getMonth() && añoActual === today.getFullYear(),
            date: `${añoActual}-${(mesActual + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`
        });
    }

    return days;
});

// Datos del gráfico de dona (reactivos para poder actualizarse)
const distribucionContratos = ref([
    { label: 'Indefinidos', value: 156, color: '#4caf50' },
    { label: 'Temporales', value: 180, color: '#ff9800' },
    { label: 'Por Obra', value: 100, color: '#2196f3' }
]);

// Guardar las áreas del gráfico para detección de hover
const chartAreas = ref([]);

// Renderizar gráficos
const renderDonutChart = () => {
    if (!donutChart.value) return;

    const canvas = donutChart.value;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 90;
    const innerRadius = 60;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const total = distribucionContratos.value.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -Math.PI / 2;

    // Resetear áreas del gráfico
    chartAreas.value = [];

    // Dibujar segmentos y etiquetas
    distribucionContratos.value.forEach(item => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        const middleAngle = currentAngle + sliceAngle / 2;

        // Guardar información del área para detección de hover
        chartAreas.value.push({
            startAngle: currentAngle,
            endAngle: currentAngle + sliceAngle,
            innerRadius: innerRadius,
            outerRadius: radius,
            centerX: centerX,
            centerY: centerY,
            label: item.label,
            value: item.value,
            color: item.color
        });

        // Dibujar segmento
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
        ctx.closePath();
        ctx.fillStyle = item.color;
        ctx.fill();

        // Calcular posición de la etiqueta (fuera del círculo)
        const labelDistance = radius + 40;
        const labelX = centerX + Math.cos(middleAngle) * labelDistance;
        const labelY = centerY + Math.sin(middleAngle) * labelDistance;

        // Dibujar línea desde el segmento hasta la etiqueta
        const lineStartX = centerX + Math.cos(middleAngle) * (radius + 5);
        const lineStartY = centerY + Math.sin(middleAngle) * (radius + 5);

        ctx.beginPath();
        ctx.moveTo(lineStartX, lineStartY);
        ctx.lineTo(labelX - (labelX > centerX ? 10 : -10), labelY);
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Dibujar texto de la etiqueta
        ctx.fillStyle = item.color;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = labelX > centerX ? 'left' : 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.label, labelX, labelY);

        currentAngle += sliceAngle;
    });
};

// Detectar hover en el gráfico de dona
const handleDonutHover = (event) => {
    if (!donutChart.value) return;

    const canvas = donutChart.value;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let found = false;

    for (const area of chartAreas.value) {
        const dx = x - area.centerX;
        const dy = y - area.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Verificar si está dentro del anillo
        if (distance >= area.innerRadius && distance <= area.outerRadius) {
            let angle = Math.atan2(dy, dx);
            // Normalizar ángulo
            if (angle < -Math.PI / 2) angle += 2 * Math.PI;

            // Verificar si está dentro del segmento
            if (angle >= area.startAngle && angle <= area.endAngle) {
                tooltip.value = {
                    show: true,
                    x: event.clientX + 10,
                    y: event.clientY - 30,
                    label: area.label,
                    value: area.value
                };
                canvas.style.cursor = 'pointer';
                found = true;
                break;
            }
        }
    }

    if (!found) {
        tooltip.value.show = false;
        canvas.style.cursor = 'default';
    }
};

// Ocultar tooltip al salir del canvas
const handleDonutLeave = () => {
    tooltip.value.show = false;
    if (donutChart.value) {
        donutChart.value.style.cursor = 'default';
    }
};

const renderBarChart = () => {
    if (!barChart.value) return;

    const ctx = barChart.value.getContext('2d');
    const width = barChart.value.width;
    const height = barChart.value.height;

    // Datos del gráfico - Áreas del sistema
    const data = [
        { label: 'Contratos', value: 87 },
        { label: 'Asistencias', value: 65 },
        { label: 'Incidencias', value: 92 },
        { label: 'Vacaciones', value: 73 },
        { label: 'Areas', value: 104 }
    ];

    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = 50;
    const spacing = (width - (data.length * barWidth)) / (data.length + 1);
    const chartHeight = height - 60;

    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);

    // Dibujar barras
    data.forEach((item, index) => {
        const barHeight = (item.value / maxValue) * chartHeight;
        const x = spacing + (index * (barWidth + spacing));
        const y = height - 40 - barHeight;

        // Barra
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(x, y, barWidth, barHeight);

        // Etiqueta
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, x + barWidth / 2, height - 20);

        // Valor
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(item.value, x + barWidth / 2, y - 10);
    });
};

// Lifecycle
onMounted(() => {
    renderDonutChart();
    renderBarChart();

    // Agregar event listeners para el hover en el gráfico de dona
    if (donutChart.value) {
        donutChart.value.addEventListener('mousemove', handleDonutHover);
        donutChart.value.addEventListener('mouseleave', handleDonutLeave);
    }
});

// Watch para re-renderizar cuando cambien los datos
watch(() => distribucionContratos.value, () => {
    renderDonutChart();
}, { deep: true });

// Función para actualizar datos (ejemplo de uso)
const actualizarDistribucion = (nuevosdatos) => {
    distribucionContratos.value = nuevosdatos;
};
</script>

<style scoped>
.enlace-estadisticas {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    background-color: #f5f5f5;
}

/* Header sin fondo */
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

/* Contenido blanco */
.content-card {
    background-color: transparent;
    padding: 2rem;
    margin: 1.5rem;
}

/* Barra de búsqueda y notificaciones */
.search-notifications {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.search-box {
    position: relative;
    flex: 1;
}

.search-box input {
    width: 100%;
    padding: 0.75rem 3rem 0.75rem 1rem;
    border: none;
    border-radius: 25px;
    font-size: 0.9rem;
    background-color: #f0ebf8;
    color: #666;
}

.search-box input::placeholder {
    color: #999;
}

.search-box input:focus {
    outline: none;
    background-color: #e8e0f5;
}

.search-box .material-symbols-rounded {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
    font-size: 20px;
    pointer-events: none;
}

.icon-btn {
    width: 40px;
    height: 40px;
    border: none;
    background-color: transparent;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.icon-btn:hover {
    background-color: #f5f5f5;
}

.icon-btn .material-symbols-rounded {
    font-size: 24px;
    color: #333;
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
    color: #333;
    font-size: 0.9rem;
}

.filter-select {
    padding: 0.75rem;
    border: 2px solid #17a2b8;
    border-radius: 8px;
    font-size: 0.95rem;
    background-color: white;
    cursor: pointer;
    transition: border-color 0.3s ease;
    color: #333;
}

.filter-select:focus {
    outline: none;
    border-color: #0d8ca0;
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
    border-radius: 8px;
    padding: 1.5rem;
    border: 2px solid #b3e5fc;
}

.chart-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 1.5rem 0;
}

.chart-content {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 250px;
}

.chart-content.empty-state {
    color: #999;
    font-style: italic;
}

.chart-content.empty-state p {
    margin: 0;
}

/* Calendario */
.calendar {
    width: 100%;
}

.calendar-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.day-name {
    text-align: center;
    font-size: 0.85rem;
    font-weight: 600;
    color: #666;
}

.calendar-body {
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

.calendar-day:hover:not(.other-month) {
    background-color: #f0f0f5;
}

.calendar-day.other-month {
    visibility: hidden;
}

.calendar-day.today {
    background-color: #4fc3f7;
    color: white;
    font-weight: 700;
    border-radius: 50%;
}

/* Tooltip para gráfico */
.chart-tooltip {
    position: fixed;
    background-color: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    pointer-events: none;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    white-space: nowrap;
}

.chart-tooltip strong {
    display: block;
    margin-bottom: 4px;
}

/* Responsive */
@media (max-width: 1200px) {
    .charts-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .enlace-estadisticas {
        padding: 1rem;
    }

    .stats-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .search-box {
        width: 100%;
    }

    .filters-container {
        grid-template-columns: 1fr;
    }

    .summary-cards {
        grid-template-columns: 1fr;
    }
}
</style>
