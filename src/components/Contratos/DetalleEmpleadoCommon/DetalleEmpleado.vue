<template>
    <div class="detalle-empleado">
        <!-- Header con flecha y título -->
        <div class="top-header">
            <button class="btn-back" @click="cerrar">
                <span class="material-symbols-rounded">arrow_back</span>
            </button>
            <h1>Contratos/Empleado</h1>
        </div>

        <div class="content-box">
            <h2 class="section-title">EMPLEADO</h2>

            <!-- Información del Empleado -->
            <div class="employee-info">
                <div class="employee-avatar">
                    <img :src="empleado.avatar" :alt="empleado.nombre" />
                </div>

                <div class="employee-details">
                    <h3>{{ empleado.nombre }}</h3>
                    <p>PUESTO: {{ empleado.puesto }}</p>
                    <p>ÁREA: {{ empleado.area }}</p>
                    <button class="btn-ver-contrato" @click="verContratoActual">Ver contrato actual</button>
                </div>

                <div class="employee-status">
                    <div class="status-item">
                        <span class="status-label">Estado</span>
                        <span class="status-value" :class="empleado.estadoClase">{{ empleado.estadoTexto }}</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Fecha de Ingreso:</span>
                        <span class="status-value">{{ empleado.fechaRegistro }}</span>
                    </div>
                </div>
            </div>

            <!-- Tabs de navegación -->
            <DetalleEmpleadoTabs :activeTab="activeTab" @cambiar-tab="cambiarTab" />

            <!-- Contenido según la pestaña activa -->
            <div class="tab-content">
                <!-- Tab: Contrato Actual -->
                <div v-if="activeTab === 'contratoActual'" class="contrato-actual-content">
                    <h3>Contrato Actual</h3>

                    <div class="info-grid">
                        <div class="info-item">
                            <span class="label">Tipo de contrato:</span>
                            <span class="value">{{ contratoActual.tipoContrato }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Fecha de inicio/fin:</span>
                            <span class="value">{{ contratoActual.fechaInicioFin }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Salario base:</span>
                            <span class="value">{{ contratoActual.salarioBase }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Jornada laboral y horario:</span>
                            <span class="value">{{ contratoActual.jornadaHorario }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Estado de firma:</span>
                            <span class="value">{{ contratoActual.estadoFirma }}</span>
                        </div>
                    </div>

                    <button class="btn-renovar" @click="renovarContrato">Renovar</button>
                </div>

                <!-- Tab: Nómina y pagos -->
                <div v-if="activeTab === 'nominaPagos'" class="nomina-pagos-content">
                    <h3>Nómina y pagos</h3>

                    <div class="nomina-grid">
                        <div class="nomina-column">
                            <div class="nomina-item">
                                <span class="label">Periodos de pago</span>
                                <span class="value">{{ nominaPagos.periodosPago }}</span>
                            </div>
                            <div class="nomina-item">
                                <span class="label">Salario Bruto</span>
                                <span class="value">{{ nominaPagos.salarioBruto }}</span>
                            </div>
                            <div class="nomina-item">
                                <span class="label">Deducciones</span>
                                <span class="value">{{ nominaPagos.deducciones }}</span>
                            </div>
                            <div class="nomina-item">
                                <span class="label">Neto</span>
                                <span class="value">{{ nominaPagos.neto }}</span>
                            </div>
                        </div>

                        <div class="nomina-column">
                            <div class="nomina-item">
                                <span class="label">Bonos recibidos</span>
                                <span class="value">{{ nominaPagos.bonosRecibidos }}</span>
                            </div>
                            <div class="nomina-item">
                                <span class="label">Deducciones aplicadas</span>
                                <span class="value">{{ nominaPagos.deduccionesAplicadas }}</span>
                            </div>
                            <div class="nomina-item">
                                <span class="label">Historial de aguinaldos</span>
                                <span class="value">{{ nominaPagos.historialAguinaldos }}</span>
                            </div>
                        </div>
                    </div>

                    <button class="btn-descargar-pdf">Descargar recibo PDF</button>
                </div>

                <!-- Tab: Beneficios y seguridad -->
                <div v-if="activeTab === 'beneficiosSeguridad'" class="beneficios-seguridad-content">
                    <h3>Beneficios y seguridad</h3>

                    <div class="beneficios-table-container">
                        <div class="beneficios-table">
                            <div class="table-header">
                                <div class="col-beneficio">Beneficios y seguridad</div>
                                <div class="col-valor"></div>
                                <div class="col-estado">Estado</div>
                                <div class="col-accion"></div>
                            </div>

                            <div v-for="beneficio in beneficiosSeguridad" :key="beneficio.id" class="table-row">
                                <div class="col-beneficio">{{ beneficio.nombre }}</div>
                                <div class="col-valor">{{ beneficio.valor }}</div>
                                <div class="col-estado">
                                    <span class="estado-badge"
                                        :class="{ activo: beneficio.activo, suspendido: !beneficio.activo }">
                                        {{ beneficio.activo ? 'Activo' : 'Suspendido' }}
                                    </span>
                                </div>
                                <div class="col-accion">
                                    <button class="btn-toggle"
                                        :class="{ activo: beneficio.activo, suspendido: !beneficio.activo }"
                                        @click="toggleBeneficio(beneficio)">
                                        {{ beneficio.activo ? 'Desactivar' : 'Activar' }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tab: Documentos -->
                <div v-if="activeTab === 'documentos'" class="documentos-content">
                    <h3>Documentos</h3>

                    <div class="documentos-table">
                        <div class="table-header">
                            <div class="col-nombre">Nombre</div>
                            <div class="col-estado">Estado</div>
                            <div class="col-fecha">Fecha de subida</div>
                            <div class="col-acciones">Acciones</div>
                        </div>

                        <div v-for="doc in documentos" :key="doc.id" class="table-row">
                            <div class="col-nombre">
                                <span class="material-symbols-rounded doc-icon">description</span>
                                {{ doc.nombre }}
                            </div>
                            <div class="col-estado">
                                <span class="badge" :class="doc.estadoClase">{{ doc.estado }}</span>
                            </div>
                            <div class="col-fecha">{{ doc.fechaSubida }}</div>
                            <div class="col-acciones">
                                <button class="btn-icon btn-download" @click="descargarDocumento(doc)">
                                    <span class="material-symbols-rounded">download</span>
                                </button>
                                <button class="btn-icon btn-view" @click="verDocumento(doc)">
                                    <span class="material-symbols-rounded">visibility</span>
                                </button>
                                <button class="btn-icon btn-share" @click="compartirDocumento(doc)">
                                    <span class="material-symbols-rounded">share</span>
                                </button>
                                <button class="btn-icon btn-delete" @click="eliminarDocumento(doc)">
                                    <span class="material-symbols-rounded">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import DetalleEmpleadoTabs from './DetalleEmpleadoTabs.vue';

const props = defineProps({
    empleado: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['cerrar', 'renovar-contrato']);

const activeTab = ref('contratoActual');

// Datos del contrato actual (sin documento pdf)
const contratoActual = ref({
    tipoContrato: 'XXXXX',
    fechaInicioFin: 'XXXXX',
    salarioBase: 'XXXXX',
    jornadaHorario: 'XXXXX',
    estadoFirma: 'XXXXX'
});

// Datos de nómina y pagos
const nominaPagos = ref({
    periodosPago: 'XXXXX',
    salarioBruto: 'XXXXX',
    deducciones: 'XXXXX',
    neto: 'XXXXX',
    bonosRecibidos: 'XXXXX',
    deduccionesAplicadas: 'XXXXX',
    historialAguinaldos: 'XXXXX'
});

// Datos de beneficios y seguridad (ahora como array para la tabla)
const beneficiosSeguridad = ref([
    { id: 1, nombre: 'Beneficios activos', valor: 'XXXXX', activo: true },
    { id: 2, nombre: 'NSS', valor: 'XXXXX', activo: false },
    { id: 3, nombre: 'Tipo de afiliación', valor: 'XXXXX', activo: true },
    { id: 4, nombre: 'Clínica', valor: 'XXXXX', activo: false },
    { id: 5, nombre: 'Riesgo laboral', valor: 'XXXXX', activo: false }
]);

// Datos de documentos
const documentos = ref([
    { id: 1, nombre: 'Contrato firmado', estado: 'Subido', estadoClase: 'subido', fechaSubida: '12/12/2025' },
    { id: 2, nombre: 'Anexos', estado: 'Pendiente', estadoClase: 'pendiente', fechaSubida: '12/12/2025' },
    { id: 3, nombre: 'Recibos', estado: 'Rechazado', estadoClase: 'rechazado', fechaSubida: '12/12/2025' },
    { id: 4, nombre: 'Constancias', estado: 'Subido', estadoClase: 'subido', fechaSubida: '12/12/2025' },
    { id: 5, nombre: 'Cartas', estado: 'Pendiente', estadoClase: 'pendiente', fechaSubida: '12/12/2025' }
]);

const cambiarTab = (tab) => {
    activeTab.value = tab;
};

const cerrar = () => {
    emit('cerrar');
};

const verContratoActual = () => {
    activeTab.value = 'contratoActual';
};

// Función para renovar contrato (navega a la ventana de crear contrato)
const renovarContrato = () => {
    emit('renovar-contrato');
};

// Función para activar/desactivar beneficio
const toggleBeneficio = (beneficio) => {
    beneficio.activo = !beneficio.activo;
    console.log(`Beneficio ${beneficio.nombre} ahora está ${beneficio.activo ? 'activo' : 'suspendido'}`);
};

const descargarDocumento = (doc) => {
    console.log('Descargar documento:', doc);
};

const verDocumento = (doc) => {
    console.log('Ver documento:', doc);
};

const compartirDocumento = (doc) => {
    console.log('Compartir documento:', doc);
};

const eliminarDocumento = (doc) => {
    console.log('Eliminar documento:', doc);
};
</script>

<style scoped>
.detalle-empleado {
    max-width: 1400px;
    margin: 0 auto;
}

/* Header */
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

/* Content Box */
.content-box {
    background-color: white;
    border-radius: 12px;
    padding: 2rem;
    margin: 0 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
    color: #9370db;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 2rem 0;
    letter-spacing: 0.5px;
    text-align: center;
}

/* Employee Info */
.employee-info {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 2rem;
    align-items: center;
    padding: 2rem;
    background-color: #f9f9f9;
    border-radius: 12px;
    margin-bottom: 2rem;
}

.employee-avatar img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
}

.employee-details h3 {
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: #333;
}

.employee-details p {
    margin: 0.25rem 0;
    color: #666;
    font-size: 0.95rem;
}

.btn-ver-contrato {
    margin-top: 1rem;
    padding: 0.75rem 2rem;
    background-color: #9370db;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.btn-ver-contrato:hover {
    background-color: #7b5cb8;
}

.employee-status {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    text-align: right;
}

.status-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.status-label {
    font-size: 0.9rem;
    color: #666;
}

.status-value {
    font-size: 1.1rem;
    font-weight: 600;
}

.status-value.activo {
    color: #10b981;
}

.status-value.baja {
    color: #ef4444;
}

/* Tab Content */
.tab-content {
    padding: 2rem 0;
}

.tab-content h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
    color: #333;
}

/* Contrato Actual */
.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.info-item {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 8px;
}

.info-item .label {
    font-weight: 600;
    color: #333;
}

.info-item .value {
    color: #666;
}

.btn-renovar {
    padding: 0.85rem 2rem;
    background-color: #9370db;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.btn-renovar:hover {
    background-color: #7b5cb8;
}

/* Nómina y Pagos */
.nomina-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 3rem;
    margin-bottom: 2rem;
}

.nomina-column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.nomina-item {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 8px;
}

.nomina-item .label {
    font-weight: 600;
    color: #333;
}

.nomina-item .value {
    color: #666;
}

.btn-descargar-pdf {
    padding: 0.85rem 2rem;
    background-color: #9370db;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.btn-descargar-pdf:hover {
    background-color: #7b5cb8;
}

/* Beneficios y Seguridad - Tabla */
.beneficios-table-container {
    width: 100%;
}

.beneficios-table {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
}

.table-header,
.table-row {
    display: grid;
    grid-template-columns: 2fr 2fr 1.5fr 1.5fr;
    gap: 1rem;
    padding: 1rem 1.5rem;
    align-items: center;
}

.table-header {
    background-color: #f5f5f5;
    font-weight: 600;
    color: #333;
    border-bottom: 2px solid #e0e0e0;
}

.table-row {
    border-bottom: 1px solid #e0e0e0;
}

.table-row:last-child {
    border-bottom: none;
}

.table-row:hover {
    background-color: #f9f9f9;
}

.col-beneficio {
    font-weight: 500;
    color: #333;
}

.col-valor {
    color: #666;
}

.col-estado {
    display: flex;
    justify-content: center;
}

.estado-badge {
    display: inline-block;
    padding: 0.5rem 1.5rem;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    text-align: center;
    min-width: 120px;
}

.estado-badge.activo {
    background-color: #d1fae5;
    color: #059669;
}

.estado-badge.suspendido {
    background-color: #fee2e2;
    color: #dc2626;
}

.col-accion {
    display: flex;
    justify-content: center;
}

.btn-toggle {
    padding: 0.5rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 120px;
}

.btn-toggle.activo {
    background-color: #10b981;
    color: white;
}

.btn-toggle.activo:hover {
    background-color: #059669;
}

.btn-toggle.suspendido {
    background-color: #ef4444;
    color: white;
}

.btn-toggle.suspendido:hover {
    background-color: #dc2626;
}

/* Documentos */
.documentos-table {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
}

.documentos-table .table-header,
.documentos-table .table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.5fr;
    gap: 1rem;
    padding: 1rem;
    align-items: center;
}

.documentos-table .table-header {
    background-color: #f5f5f5;
    font-weight: 600;
    color: #333;
    border-bottom: 1px solid #e0e0e0;
}

.documentos-table .table-row {
    border-bottom: 1px solid #e0e0e0;
}

.documentos-table .table-row:last-child {
    border-bottom: none;
}

.documentos-table .table-row:hover {
    background-color: #f9f9f9;
}

.col-nombre {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.doc-icon {
    color: #ef4444;
    font-size: 20px;
}

.badge {
    display: inline-block;
    padding: 0.4rem 1rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
}

.badge.subido {
    background-color: #d1fae5;
    color: #059669;
}

.badge.pendiente {
    background-color: #fef3c7;
    color: #d97706;
}

.badge.rechazado {
    background-color: #fee2e2;
    color: #dc2626;
}

.col-acciones {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
}

.btn-icon {
    background: none;
    border: 1px solid #d0d0d0;
    padding: 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.btn-icon .material-symbols-rounded {
    font-size: 18px;
}

.btn-download {
    border-color: #10b981;
    color: #10b981;
}

.btn-download:hover {
    background-color: #10b981;
    color: white;
}

.btn-view {
    border-color: #3b82f6;
    color: #3b82f6;
}

.btn-view:hover {
    background-color: #3b82f6;
    color: white;
}

.btn-share {
    border-color: #6b7280;
    color: #6b7280;
}

.btn-share:hover {
    background-color: #6b7280;
    color: white;
}

.btn-delete {
    border-color: #ef4444;
    color: #ef4444;
}

.btn-delete:hover {
    background-color: #ef4444;
    color: white;
}

/* Responsive */
@media (max-width: 1024px) {
    .employee-info {
        grid-template-columns: 1fr;
        text-align: center;
    }

    .employee-status {
        text-align: center;
    }

    .info-grid,
    .nomina-grid {
        grid-template-columns: 1fr;
    }

    .table-header,
    .table-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
    }
}

@media (max-width: 768px) {
    .content-box {
        padding: 1.5rem;
    }

    .documentos-table .table-header,
    .documentos-table .table-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
    }

    .col-acciones {
        justify-content: flex-start;
    }
}
</style>
