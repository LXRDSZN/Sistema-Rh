<template>
    <div class="enlace-estadisticas">
        <!-- Header gris con flecha y título -->
        <div class="top-header">
            <button class="btn-back" @click="volverInicio">
                <span class="material-symbols-rounded">arrow_back</span>
            </button>
            <h1>Contratos/Estadísticas</h1>
        </div>

        <!-- Contenido blanco -->
        <div class="content-card">

            <!-- Tarjetas de resumen -->
            <div class="summary-cards">
                <div class="summary-card green">
                    <p class="card-title">CONTRATOS ACTIVOS</p>
                    <p class="card-number">{{ stats.activos }}</p>
                </div>

                <div class="summary-card blue">
                    <p class="card-title">SOLICITUDES VACANTES</p>
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
                    <div class="chart-content horizontal-bars">
                        <div v-for="(item, index) in procesoData" :key="index" class="bar-item">
                            <span class="bar-label">{{ item.label }}</span>
                            <div class="bar-container">
                                <div class="bar"
                                    :style="{ width: calcularPorcentaje(item.value, procesoMax) + '%', backgroundColor: getColorProceso(index) }">
                                </div>
                            </div>
                            <span class="bar-value">{{ item.value }}</span>
                        </div>
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
                {{ tooltip.value }} contratos
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useContratos } from '@/composables/useContratos';

const { obtenerDistribucionTipo, obtenerContratosPorArea, obtenerEstadoProceso } = useContratos();
const router = useRouter();

const volverInicio = () => {
    router.push('/Contratos');
};

const donutChart = ref(null);
const barChart = ref(null);

const tooltip = ref({
    show: false,
    x: 0,
    y: 0,
    label: '',
    value: 0
});

const props = defineProps({
    stats: {
        type: Object,
        default: () => ({
            activos: 0,
            vacantes: 0
        })
    }
});

// ✅ NUEVOS: Datos dinámicos de los gráficos
const distribucionContratos = ref([]);
const areasData = ref([]);
const procesoData = ref([]);

// Calcular máximo para el gráfico de proceso
const procesoMax = computed(() => {
    if (procesoData.value.length === 0) return 1;
    return Math.max(...procesoData.value.map(d => d.value));
});

// Función para calcular porcentaje
const calcularPorcentaje = (valor, maximo) => {
    return (valor / maximo) * 100;
};

// Colores para las barras de proceso
const coloresProceso = ['#0c4a7a', '#0c5a8a', '#0c6a9a', '#0c7aaa', '#0c8aba'];
const getColorProceso = (index) => {
    return coloresProceso[index] || '#0c4a7a';
};

const today = new Date();
const currentMonth = computed(() => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[today.getMonth()];
});
const currentYear = today.getFullYear();
const diaActual = today.getDate();
const mesActual = today.getMonth();
const añoActual = today.getFullYear();
const diasSemana = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const calendarDays = computed(() => {
    const days = [];
    const firstDay = new Date(añoActual, mesActual, 1).getDay();
    const daysInMonth = new Date(añoActual, mesActual + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        days.push({ day: null, otherMonth: true, isToday: false, date: null });
    }

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

const chartAreas = ref([]);

const renderDonutChart = () => {
    if (!donutChart.value || distribucionContratos.value.length === 0) {
        console.warn('Canvas o datos no disponibles');
        return;
    }

    const canvas = donutChart.value;
    const ctx = canvas.getContext('2d');

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;
    const innerRadius = 50;

    // Calcular total
    const total = distribucionContratos.value.reduce((sum, item) => sum + item.total, 0);
    if (total === 0) return;

    let currentAngle = -Math.PI / 2;
    chartAreas.value = [];

    // Dibujar cada slice
    distribucionContratos.value.forEach((item, index) => {
        const sliceAngle = (item.total / total) * 2 * Math.PI;
        const middleAngle = currentAngle + sliceAngle / 2;

        // Guardar área para hover
        chartAreas.value.push({
            startAngle: currentAngle,
            endAngle: currentAngle + sliceAngle,
            innerRadius: innerRadius,
            outerRadius: radius,
            centerX: centerX,
            centerY: centerY,
            label: item.tipo,
            value: item.total,
            color: item.color
        });

        // Dibujar el slice
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
        ctx.closePath();
        ctx.fillStyle = item.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Dibujar etiqueta con línea
        const labelDistance = radius + 30;
        const labelX = centerX + Math.cos(middleAngle) * labelDistance;
        const labelY = centerY + Math.sin(middleAngle) * labelDistance;

        const lineStartX = centerX + Math.cos(middleAngle) * (radius + 5);
        const lineStartY = centerY + Math.sin(middleAngle) * (radius + 5);

        // Línea conectora
        ctx.beginPath();
        ctx.moveTo(lineStartX, lineStartY);
        ctx.lineTo(labelX - (labelX > centerX ? 5 : -5), labelY);
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Texto de etiqueta
        ctx.fillStyle = item.color;
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = labelX > centerX ? 'left' : 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.tipo, labelX, labelY);

        // Texto de valor
        ctx.fillStyle = '#666';
        ctx.font = 'normal 11px Arial';
        ctx.fillText(`(${item.total})`, labelX, labelY + 15);

        currentAngle += sliceAngle;
    });

    console.log('Gráfico de dona renderizado correctamente');
};


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

        if (distance >= area.innerRadius && distance <= area.outerRadius) {
            let angle = Math.atan2(dy, dx);
            if (angle < -Math.PI / 2) angle += 2 * Math.PI;

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

const handleDonutLeave = () => {
    tooltip.value.show = false;
    if (donutChart.value) {
        donutChart.value.style.cursor = 'default';
    }
};

const renderBarChart = () => {
    if (!barChart.value || areasData.value.length === 0) return;

    const ctx = barChart.value.getContext('2d');
    const width = barChart.value.width;
    const height = barChart.value.height;

    const data = areasData.value;
    const maxValue = Math.max(...data.map(d => d.total_contratos), 1);
    const barWidth = 50;
    const spacing = (width - (data.length * barWidth)) / (data.length + 1);
    const chartHeight = height - 60;

    ctx.clearRect(0, 0, width, height);

    data.forEach((item, index) => {
        const barHeight = (item.total_contratos / maxValue) * chartHeight;
        const x = spacing + (index * (barWidth + spacing));
        const y = height - 40 - barHeight;

        ctx.fillStyle = '#4caf50';
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.area, x + barWidth / 2, height - 20);

        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(item.total_contratos, x + barWidth / 2, y - 10);
    });
};

// ✅ Cargar todos los datos del API
const cargarDatos = async () => {
    try {
        console.log('Iniciando carga de datos...');

        // Cargar distribución por tipo
        const distribucion = await obtenerDistribucionTipo();
        console.log('Distribución:', distribucion);

        if (distribucion && distribucion.length > 0) {
            distribucionContratos.value = distribucion.map((item, index) => ({
                tipo: item.tipo,
                total: parseInt(item.total),
                color: ['#4caf50', '#ff9800', '#2196f3', '#9c27b0'][index] || '#757575'
            }));
            console.log('distribucionContratos actualizado:', distribucionContratos.value);
        } else {
            console.warn('No hay datos de distribución');
        }

        // Cargar contratos por área
        const areas = await obtenerContratosPorArea();
        console.log('Áreas:', areas);

        if (areas && areas.length > 0) {
            areasData.value = areas;
            console.log('areasData actualizado:', areasData.value);
        } else {
            console.warn('No hay datos de áreas');
        }

        // Cargar estado del proceso
        const proceso = await obtenerEstadoProceso();
        console.log('Proceso:', proceso);

        if (proceso && proceso.length > 0) {
            procesoData.value = proceso.map(item => ({
                label: item.etapa,
                value: parseInt(item.total)
            }));
            console.log('procesoData actualizado:', procesoData.value);
        } else {
            console.warn('No hay datos de proceso');
        }

        // Renderizar gráficos
        setTimeout(() => {
            console.log('Renderizando gráficos...');
            renderDonutChart();
            renderBarChart();
        }, 500);

    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
};

onMounted(async () => {
    // Cargar datos del API
    await cargarDatos();

    if (donutChart.value) {
        donutChart.value.addEventListener('mousemove', handleDonutHover);
        donutChart.value.addEventListener('mouseleave', handleDonutLeave);
    }
});

watch(() => distribucionContratos.value, () => {
    renderDonutChart();
}, { deep: true });

watch(() => areasData.value, () => {
    renderBarChart();
}, { deep: true });
</script>

<style scoped>
.enlace-estadisticas {
    margin: 0;
    padding: 0;
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
    background-color: transparent;
    padding: 2rem;
    margin: 1.5rem;
}

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

.horizontal-bars {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: auto !important;
    align-items: stretch;
    justify-content: flex-start;
    padding: 1rem 0;
}

.bar-item {
    display: grid;
    grid-template-columns: 80px 1fr 30px;
    gap: 1rem;
    align-items: center;
}

.bar-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #0c4a7a;
    text-align: right;
}

.bar-container {
    height: 25px;
    background-color: #f0f0f0;
    border-radius: 4px;
    overflow: hidden;
}

.bar {
    height: 100%;
    transition: width 0.3s ease;
}

.bar-value {
    font-size: 0.9rem;
    font-weight: 600;
    color: #333;
}

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

@media (max-width: 1200px) {
    .charts-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .enlace-estadisticas {
        padding: 1rem;
    }

    .summary-cards {
        grid-template-columns: 1fr;
    }

    .bar-item {
        grid-template-columns: 60px 1fr 30px;
    }
}
</style>
