<template>
    <div class="inicio-view">
        <!-- Encabezado simplificado -->
        <div class="header">
            <div class="header-content">
                <h1>Contratos</h1>
                <div class="header-sub">Panel de control y administración</div>
            </div>
        </div>

        <!-- Barra de búsqueda con botón de incidencia (todo en una línea) -->
        <div class="search-container">
            <div class="search-box">
                <input type="text" placeholder="Buscar" v-model="searchQuery">
                <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21l-4.35-4.35" stroke="#666" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="11" cy="11" r="6" stroke="#666" stroke-width="1.6" fill="none"/>
                </svg>
            </div>
            <button class="btn-incidencia" @click="registrarIncidencia">
                + Registrar Incidencia
            </button>
            <button
                class="btn-registro"
                @click="!isEmpleado && irARegistro()"
                :disabled="isEmpleado"
                :title="isEmpleado ? 'No tienes permiso para usar esto' : ''"
                :style="isEmpleado ? 'background: #ccc; color: #888; cursor: not-allowed;' : ''"
            >
                📄 Registro de Solicitud
            </button>
        </div>

        <!-- Tarjetas de estadísticas clickeables (4 en una línea) -->
        <div class="stats-grid">
            <div class="stat-card activos" @click="cambiarVista('activos')">
                <div class="stat-label">TOTAL DE<br>CONTRATOS ACTIVOS</div>
                <div class="stat-value-with-icon">                     
                    <div class="icon-box">
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 7a2 2 0 012-2h6l4 4v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>
                            <path d="M13 7v4h4" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <div class="stat-value"><span class="num">{{ activosDisplay }}</span></div>
                </div>
            </div>
            <div class="stat-card proximos" @click="cambiarVista('avencer')">
                <div class="stat-label">CONTRATOS<br>PRÓXIMOS A VENCER</div>
                <div class="stat-value-with-icon">                     
                    <div class="icon-box">
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="4" width="14" height="16" rx="2" stroke="currentColor" stroke-width="1.4" fill="none"/>
                            <path d="M7 8h6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <div class="stat-value"><span class="num">{{ proximosDisplay }}</span></div>
                </div>
            </div>
            <div class="stat-card vencidos" @click="cambiarVista('vencidos')">
                <div class="stat-label">CONTRATOS<br>VENCIDOS</div>
                <div class="stat-value-with-icon">                     
                    <div class="icon-box">
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2v6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                            <path d="M6 8h12v10a2 2 0 01-2 2H8a2 2 0 01-2-2V8z" stroke="currentColor" stroke-width="1.4" fill="none"/>
                        </svg>
                    </div>
                    <div class="stat-value"><span class="num">{{ vencidosDisplay }}</span></div>
                </div>
            </div>
            <div class="stat-card proceso" @click="cambiarVista('proceso')">
                <div class="stat-label">CONTRATOS<br>EN PROCESO</div>
                <div class="stat-value-with-icon">                      
                    <div class="icon-box">
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.4" fill="none"/>
                        </svg>
                    </div>
                <div class="stat-value"><span class="num">{{ enProcesoDisplay }}</span></div>
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
                            <div class="col-puesto">{{ formatRoleName(empleado.puesto) }}</div>
                            <div class="col-area">{{ empleado.area }}</div>
                            <div class="col-action">
                                <div class="row-actions">
                                    <button class="btn-revisar empleado" @click="revisarContrato(empleado)">REVISAR</button>
                                </div>
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
                            <div class="col-puesto">{{ formatRoleName(aspirante.puesto) }}</div>
                            <div class="col-area">{{ aspirante.area }}</div>
                            <div class="col-action">
                                <div class="row-actions">
                                    <button class="btn-revisar aspirante" @click="revisarContrato(aspirante)">REVISAR</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';

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

// Animated stats display
const activosDisplay = ref(0);
const proximosDisplay = ref(0);
const vencidosDisplay = ref(0);
const enProcesoDisplay = ref(0);

const animateCount = (targetRef, to, duration = 700) => {
    const start = performance.now();
    const from = Number(targetRef.value) || 0;
    const diff = to - from;
    if (diff === 0) { targetRef.value = to; return; }
    const step = (now) => {
        const t = Math.min((now - start) / duration, 1);
        targetRef.value = Math.floor(from + diff * t);
        if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
};

// Per-row actions state (three-dot menus removed)

const onImgError = (event) => {
    event.target.onerror = null;
    event.target.src = defaultAvatar;
};

// Estado local
const searchQuery = ref('');

// Separar contratos por tipo y ordenar empleados por fecha_creacion (más reciente primero)
const empleados = computed(() => {
    return [...props.contratos.filter(c => !c.tipo || c.tipo === 'empleado')]
        .sort((a, b) => {
            const fa = a.fecha_creacion ? new Date(a.fecha_creacion) : 0;
            const fb = b.fecha_creacion ? new Date(b.fecha_creacion) : 0;
            return fb - fa;
        });
});

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

// animate stats on mount and when props.stats changes
onMounted(() => {
    if (props.stats) {
        animateCount(activosDisplay, props.stats.activos || 0);
        animateCount(proximosDisplay, props.stats.proximosVencer || 0);
        animateCount(vencidosDisplay, props.stats.vencidos || 0);
        animateCount(enProcesoDisplay, props.stats.enProceso || 0);
    }
});

watch(() => props.stats, (ns) => {
    if (!ns) return;
    animateCount(activosDisplay, ns.activos || 0);
    animateCount(proximosDisplay, ns.proximosVencer || 0);
    animateCount(vencidosDisplay, ns.vencidos || 0);
    animateCount(enProcesoDisplay, ns.enProceso || 0);
}, { deep: true });

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

const { userRole } = useAuth();
const isEmpleado = computed(() => userRole.value === 'EMPLEADO');

// Formatea el nombre del rol del sistema
function formatRoleName(role) {
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
}
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
    background: white;
    padding: 2rem;
    margin-bottom: 1.5rem;
    border-radius: 0 0 20px 20px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border-left: 6px solid #667eea;
}

.header-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.header h1 {
    font-size: 2rem;
    font-weight: 800;
    color: #1f2937;
    margin: 0;
}

.header-sub {
    color: #6b7280;
    font-size: 1rem;
    margin: 0;
    font-weight: 500;
}

/* Search Container - En línea */
.search-container {
    background-color: white;
    border-radius: 16px;
    padding: 2rem;
    margin: 0 2rem 1.5rem 2rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.search-box {
    position: relative;
    flex: 1;
}

.search-box input {
    width: 100%;
    padding: 1rem 3rem 1rem 1.5rem;
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
    background-color: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-box input::placeholder {
    color: #6b7280;
    font-weight: 500;
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
    padding: 2.2rem 2.4rem;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    position: relative;
    overflow: hidden;
}

.stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
}

.stat-card:hover::before {
    transform: scaleX(1);
}

.stat-card:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.stat-card.activos {
    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
}

.stat-card.activos::before {
    background: linear-gradient(90deg, #34d399, #10b981);
}

.stat-card.proximos {
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.stat-card.proximos::before {
    background: linear-gradient(90deg, #fbbf24, #f59e0b);
}

.stat-card.vencidos {
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
}

.stat-card.vencidos::before {
    background: linear-gradient(90deg, #f87171, #ef4444);
}

.stat-card.proceso {
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.stat-card.proceso::before {
    background: linear-gradient(90deg, #60a5fa, #3b82f6);
}

.stat-label {
    font-size: 0.8rem;
    font-weight: 800;
    line-height: 1.3;
    text-transform: uppercase;
    margin-bottom: 1rem;
    color: #6b7280;
    letter-spacing: 1px;
}

.stat-card.activos .stat-label {
    text-align: center;
}

.stat-card.proximos .stat-label {
    text-align: center;
}

.stat-card.vencidos .stat-label {
    text-align: center;
}

.stat-card.proceso .stat-label {
    text-align: center;
}

.stat-value {
    font-size: 2.6rem;
    font-weight: 900;
    text-align: center;
}

.stat-card.activos .stat-value {
    background: linear-gradient(135deg, #34d399, #10b981);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.stat-card.proximos .stat-value {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.stat-card.vencidos .stat-value {
    background: linear-gradient(135deg, #f87171, #ef4444);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.stat-card.proceso .stat-value {
    background: linear-gradient(135deg, #60a5fa, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

/* Icon box inside stat cards */
.stat-value-with-icon { display:flex; align-items:center; justify-content:center; gap:18px; }
.icon-box { 
    width:65px; 
    height:65px; 
    border-radius:16px; 
    display:flex; 
    align-items:center; 
    justify-content:center; 
    box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
    transition: all 0.3s ease;
}
.stat-card:hover .icon-box { 
    transform: rotate(5deg) scale(1.1); 
}
.stat-card.activos .icon-box { 
    background: linear-gradient(135deg, #34d399, #10b981); 
    color: white; 
}
.stat-card.proximos .icon-box { 
    background: linear-gradient(135deg, #fbbf24, #f59e0b); 
    color: white; 
}
.stat-card.vencidos .icon-box { 
    background: linear-gradient(135deg, #f87171, #ef4444); 
    color: white; 
}
.stat-card.proceso .icon-box { 
    background: linear-gradient(135deg, #60a5fa, #3b82f6); 
    color: white; 
}

.stat-label { text-align:center; font-size:0.85rem; letter-spacing: 0.6px; }
.stat-value { display:flex; align-items:center; justify-content:center; gap:12px; }
.stat-value .num { font-size: 2.6rem; }

/* Destacados Header */
.destacados-header {
    background-color: white;
    border-radius: 16px;
    padding: 1.5rem 2rem;
    margin: 0 2rem 1.5rem 2rem;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.destacados-header h2 {
    font-size: 1.75rem;
    font-weight: 800;
    color: #1f2937;
    margin: 0;
    position: relative;
    display: inline-block;
}

.destacados-header h2::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 2px;
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
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.column-title {
    font-size: 1.3rem;
    font-weight: 800;
    color: #1f2937;
    margin: 0 0 1.5rem 0;
    text-align: left;
    padding-left: 1rem;
    border-left: 5px solid;
    border-image: linear-gradient(180deg, #667eea, #764ba2) 1;
    text-transform: uppercase;
    letter-spacing: 1px;
}

/* Table Container */
.table-container {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 120px;
    padding: 1.25rem 1.25rem 1.25rem 1.5rem;
    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
    font-weight: 800;
    color: #6b7280;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 2px solid #e5e7eb;
}

.table-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    /* Altura para mostrar exactamente 8 filas (cada fila ~75px + gap de 1rem) */
    max-height: calc((75px + 1rem) * 8 + 1rem);
    overflow-y: auto;
}

/* Ocultar scrollbar pero mantener funcionalidad */
.table-body::-webkit-scrollbar {
    width: 0px;
    display: none;
}

.table-body {
    -ms-overflow-style: none;
    scrollbar-width: none;
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
    border: 2px solid #d1fae5;
    background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
    position: relative;
}

.empleado-row::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(180deg, #34d399 0%, #10b981 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.empleado-row:hover::before {
    opacity: 1;
}

.empleado-row:hover {
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
    transform: translateY(-3px);
    border-color: #10b981;
}

.aspirante-row {
    border: 2px solid #dbeafe;
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    position: relative;
}

.aspirante-row::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.aspirante-row:hover::before {
    opacity: 1;
}

.aspirante-row:hover {
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
    transform: translateY(-3px);
    border-color: #3b82f6;
}

.col-datos {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #000;
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
    padding: 0.7rem 1.75rem;
    border: none;
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

.btn-revisar.empleado {
    background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-revisar.empleado:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.btn-revisar.aspirante {
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-revisar.aspirante:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
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

/* Small enhancements: animated numbers and row action menu */
.header-sub { color: #6b7280; font-size: 0.95rem; margin-top: 6px; }
.num { transition: all 0.2s ease; font-variant-numeric: tabular-nums; }
.row-actions { display:flex; gap:0.5rem; align-items:center; }
</style>
