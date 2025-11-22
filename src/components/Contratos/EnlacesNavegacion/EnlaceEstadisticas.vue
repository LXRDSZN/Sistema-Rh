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
                    <div class="card-icon">
                        <span class="material-symbols-rounded">badge</span>
                    </div>
                    <div class="card-content">
                        <p class="card-title">CONTRATOS ACTIVOS</p>
                        <p class="card-number">{{ stats.activos }}</p>
                    </div>
                </div>

                <div class="summary-card blue">
                    <div class="card-icon">
                        <span class="material-symbols-rounded">person_search</span>
                    </div>
                    <div class="card-content">
                        <p class="card-title">SOLICITUDES VACANTES</p>
                        <p class="card-number">{{ stats.vacantes }}</p>
                    </div>
                </div>
            </div>

            <!-- Grid de gráficos -->
            <div class="charts-grid">
                <!-- Gráfico de dona: Distribución por tipo de contrato -->
                <div class="chart-card">
                    <h3 class="chart-title">Distribución por tipo de contrato</h3>
                    <div class="chart-content donut-container">
                        <div class="donut-chart-wrapper">
                            <canvas ref="donutChart" width="300" height="300"></canvas>
                            <div class="donut-center-text">
                                <div class="center-number">{{ totalContratos }}</div>
                                <div class="center-label">Total</div>
                            </div>
                        </div>
                        <div class="donut-legend">
                            <div v-for="(item, index) in distribucionContratos" :key="index" 
                                class="legend-item"
                                @mouseenter="highlightSlice(index)"
                                @mouseleave="unhighlightSlice()">
                                <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
                                <div class="legend-info">
                                    <span class="legend-label">{{ item.tipo }}</span>
                                    <span class="legend-value">{{ item.total }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Gráfico de barras: Contratos por área -->
                <div class="chart-card">
                    <h3 class="chart-title">Contratos por área</h3>
                    <div class="chart-content modern-bars">
                        <div v-for="(item, index) in areasData" :key="index" class="bar-group">
                            <div class="bar-wrapper">
                                <div class="bar-fill" 
                                    :style="{ 
                                        height: calcularPorcentaje(item.total_contratos, areasMax) + '%',
                                        background: `linear-gradient(180deg, ${getColorArea(index)}, ${getColorArea(index)}dd)`
                                    }">
                                    <span class="bar-value-top">{{ item.total_contratos }}</span>
                                </div>
                            </div>
                            <span class="bar-label-bottom">{{ item.area }}</span>
                        </div>
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
                    <div class="calendar-header-wrapper">
                        <h3 class="chart-title">Mes {{ currentMonth }} {{ currentYear }}</h3>
                        <div class="calendar-nav">
                            <span class="material-symbols-rounded">chevron_left</span>
                            <span class="material-symbols-rounded">chevron_right</span>
                        </div>
                    </div>
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
const highlightedSlice = ref(null);

// Calcular máximo para el gráfico de proceso
const procesoMax = computed(() => {
    if (procesoData.value.length === 0) return 1;
    return Math.max(...procesoData.value.map(d => d.value));
});

// Calcular total de contratos
const totalContratos = computed(() => {
    return distribucionContratos.value.reduce((sum, item) => sum + item.total, 0);
});

// Calcular máximo para el gráfico de áreas
const areasMax = computed(() => {
    if (areasData.value.length === 0) return 1;
    return Math.max(...areasData.value.map(d => d.total_contratos));
});

// Función para calcular porcentaje
const calcularPorcentaje = (valor, maximo) => {
    if (maximo === 0) return 0;
    return (valor / maximo) * 100;
};

// Colores para las barras de áreas
const coloresAreas = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
const getColorArea = (index) => {
    return coloresAreas[index % coloresAreas.length];
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
    const radius = 100;
    const innerRadius = 65;

    // Calcular total
    const total = distribucionContratos.value.reduce((sum, item) => sum + item.total, 0);
    if (total === 0) return;

    let currentAngle = -Math.PI / 2;
    chartAreas.value = [];

    // Añadir sombra al canvas
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    // Dibujar cada slice
    distribucionContratos.value.forEach((item, index) => {
        const sliceAngle = (item.total / total) * 2 * Math.PI;
        const isHighlighted = highlightedSlice.value === index;
        
        // Ajustar radio si está resaltado
        const currentRadius = isHighlighted ? radius + 5 : radius;
        const currentInnerRadius = isHighlighted ? innerRadius - 2 : innerRadius;

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
        ctx.arc(centerX, centerY, currentRadius, currentAngle, currentAngle + sliceAngle);
        ctx.arc(centerX, centerY, currentInnerRadius, currentAngle + sliceAngle, currentAngle, true);
        ctx.closePath();
        
        // Aplicar gradiente si está resaltado
        if (isHighlighted) {
            const gradient = ctx.createRadialGradient(centerX, centerY, currentInnerRadius, centerX, centerY, currentRadius);
            gradient.addColorStop(0, item.color);
            gradient.addColorStop(1, item.color + 'dd');
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = item.color;
        }
        
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        currentAngle += sliceAngle;
    });

    // Resetear sombra
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

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

const highlightSlice = (index) => {
    highlightedSlice.value = index;
    renderDonutChart();
};

const unhighlightSlice = () => {
    highlightedSlice.value = null;
    renderDonutChart();
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
            // Paleta de colores moderna y vibrante
            const modernColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
            distribucionContratos.value = distribucion.map((item, index) => ({
                tipo: item.tipo,
                total: parseInt(item.total),
                color: modernColors[index] || '#6b7280'
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
    background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
    animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
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
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 0 10px 20px rgba(0, 0, 0, 0.05);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: slideUp 0.6s ease-out;
    position: relative;
    overflow: hidden;
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.summary-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
}

.summary-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1), 0 16px 32px rgba(0, 0, 0, 0.08);
}

.summary-card:hover::before {
    opacity: 0.1;
}

.summary-card.green {
    background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
}

.summary-card.green::before {
    background: linear-gradient(135deg, #28a745, #20c997);
}

.summary-card.blue {
    background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
}

.summary-card.blue::before {
    background: linear-gradient(135deg, #17a2b8, #138496);
}

.card-icon {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.3s ease;
}

.summary-card:hover .card-icon {
    transform: scale(1.1) rotate(5deg);
}

.summary-card.green .card-icon {
    background: linear-gradient(135deg, #28a745, #20c997);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.summary-card.blue .card-icon {
    background: linear-gradient(135deg, #17a2b8, #138496);
    box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
}

.card-icon .material-symbols-rounded {
    font-size: 32px;
    color: white;
}

.card-content {
    flex: 1;
}

.card-title {
    font-size: 0.85rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    line-height: 1.4;
    letter-spacing: 0.5px;
}

.summary-card.green .card-title {
    color: #155724;
}

.summary-card.blue .card-title {
    color: #0c5460;
}

.card-number {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0;
    line-height: 1;
}

.summary-card.green .card-number {
    color: #28a745;
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
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 0 10px 20px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    animation: slideUp 0.6s ease-out;
    animation-delay: 0.2s;
    animation-fill-mode: both;
}

.chart-card:hover {
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1), 0 16px 32px rgba(0, 0, 0, 0.08);
}

.chart-title {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 1.5rem 0;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #f3f4f6;
}

.chart-content {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 250px;
}

.modern-bars {
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    gap: 1rem;
    min-height: 250px;
    padding: 1rem 0.5rem;
}

.bar-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    max-width: 80px;
}

.bar-wrapper {
    width: 100%;
    height: 200px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}

.bar-fill {
    width: 100%;
    border-radius: 8px 8px 0 0;
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: barGrow 0.8s ease-out;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 0.5rem;
}

@keyframes barGrow {
    from { height: 0; opacity: 0; }
    to { opacity: 1; }
}

.bar-fill:hover {
    transform: scaleY(1.05);
    filter: brightness(1.1);
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
}

.bar-value-top {
    font-size: 0.875rem;
    font-weight: 700;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.bar-label-bottom {
    font-size: 0.75rem;
    font-weight: 600;
    color: #4b5563;
    text-align: center;
    line-height: 1.2;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
}

.donut-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    padding: 1rem;
}

.donut-chart-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.donut-center-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    pointer-events: none;
}

.center-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    line-height: 1;
}

.center-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
    margin-top: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.donut-legend {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-width: 180px;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.legend-item:hover {
    background-color: #f3f4f6;
    transform: translateX(4px);
}

.legend-color {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    flex-shrink: 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.legend-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    flex: 1;
}

.legend-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
}

.legend-value {
    font-size: 0.75rem;
    font-weight: 500;
    color: #6b7280;
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
    grid-template-columns: 100px 1fr 40px;
    gap: 1rem;
    align-items: center;
}

.bar-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    text-align: right;
}

.bar-container {
    height: 32px;
    background: linear-gradient(90deg, #f3f4f6, #e5e7eb);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
}

.bar {
    height: 100%;
    border-radius: 16px;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    animation: barSlide 0.8s ease-out;
    position: relative;
    overflow: hidden;
}

@keyframes barSlide {
    from { width: 0 !important; }
}

.bar::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

.bar-value {
    font-size: 0.875rem;
    font-weight: 700;
    color: #1f2937;
}

.calendar {
    width: 100%;
}

.calendar-header-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #f3f4f6;
}

.calendar-header-wrapper .chart-title {
    margin: 0;
    padding: 0;
    border: none;
}

.calendar-nav {
    display: flex;
    gap: 0.5rem;
}

.calendar-nav span {
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    transition: background 0.2s;
}

.calendar-nav span:hover {
    background: #f3f4f6;
}

.calendar-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.5rem;
    margin-bottom: 0.75rem;
}

.day-name {
    text-align: center;
    font-size: 0.85rem;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.5px;
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
    color: #374151;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
}

.calendar-day:hover:not(.other-month):not(.today) {
    background-color: #f3f4f6;
    color: #1f2937;
    transform: scale(1.05);
}

.calendar-day.other-month {
    visibility: hidden;
}

.calendar-day.today {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    font-weight: 700;
    box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
    transform: scale(1.05);
}

.chart-tooltip {
    position: fixed;
    background-color: rgba(17, 24, 39, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 14px;
    pointer-events: none;
    z-index: 1000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
    backdrop-filter: blur(4px);
}

.chart-tooltip strong {
    display: block;
    margin-bottom: 4px;
    font-weight: 600;
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
        grid-template-columns: 80px 1fr 30px;
    }
    
    .donut-container {
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .donut-legend {
        width: 100%;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
    }
}
</style>
