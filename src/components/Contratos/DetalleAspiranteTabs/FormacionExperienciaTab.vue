<template>
    <div class="tab-panel">
        <div class="formacion-experiencia-grid">
            <!-- Formación académica -->
            <div class="seccion-formacion">
                <h3 class="seccion-titulo">Formación académica</h3>

                <div class="formacion-card">
                    <div class="formacion-icon">
                        <span class="material-symbols-rounded">school</span>
                    </div>
                    <div class="formacion-detalles">
                        <div class="detalle-row">
                            <span class="detalle-label">Nivel de estudios:</span>
                            <span class="detalle-value">Licenciatura</span>
                        </div>
                        <div class="detalle-row">
                            <span class="detalle-label">Institución:</span>
                            <span class="detalle-value">TECNM</span>
                        </div>
                        <div class="detalle-row">
                            <span class="detalle-label">Título:</span>
                            <span class="detalle-value">ING. IND</span>
                        </div>
                        <div class="detalle-row">
                            <span class="detalle-label">Fecha Inicio:</span>
                            <span class="detalle-value">12/11/2018</span>
                        </div>
                        <div class="detalle-row">
                            <span class="detalle-label">Fecha Fin:</span>
                            <span class="detalle-value">12/11/2018</span>
                        </div>
                    </div>
                </div>

                <div class="formacion-card">
                    <div class="formacion-icon">
                        <span class="material-symbols-rounded">school</span>
                    </div>
                    <div class="formacion-detalles">
                        <div class="detalle-row">
                            <span class="detalle-label">Nivel de estudios:</span>
                            <span class="detalle-value">Licenciatura</span>
                        </div>
                        <div class="detalle-row">
                            <span class="detalle-label">Institución:</span>
                            <span class="detalle-value">TECNM</span>
                        </div>
                        <div class="detalle-row">
                            <span class="detalle-label">Título:</span>
                            <span class="detalle-value">ING. IND</span>
                        </div>
                        <div class="detalle-row">
                            <span class="detalle-label">Fecha Inicio:</span>
                            <span class="detalle-value">12/11/2018</span>
                        </div>
                        <div class="detalle-row">
                            <span class="detalle-label">Fecha Fin:</span>
                            <span class="detalle-value">12/11/2018</span>
                        </div>
                    </div>
                </div>


            </div>

            <!-- Experiencia laboral -->
            <div class="seccion-experiencia">
                <h3 class="seccion-titulo">Experiencia laboral</h3>

                <div class="experiencia-card">
                    <div class="experiencia-icon">
                        <span class="material-symbols-rounded">work</span>
                    </div>
                    <div class="experiencia-detalles">
                        <div class="detalle-row">
                            <span class="detalle-label">Empresa:</span>
                            <span class="detalle-value">Licenciatura</span>
                        </div>
                        <div class="detalle-row">
                            <span class="detalle-label">Puesto:</span>
                            <span class="detalle-value">TECNM</span>
                        </div>
                        <div class="detalle-row">
                            <span class="detalle-label">Periodo:</span>
                            <span class="detalle-value">ING. IND</span>
                        </div>
                        <div class="detalle-row">
                            <span class="detalle-label">Actividades Principales:</span>
                        </div>
                        <ul class="actividades-list">
                            <li>XXX</li>
                            <li>XXX</li>
                        </ul>
                        <div class="detalle-row">
                            <span class="detalle-label">Motivo de Salida:</span>
                            <span class="detalle-value">Echar la wueva</span>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    aspirante: {
        type: Object,
        required: true
    }
});
</script>

<style scoped>
.tab-panel {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.formacion-experiencia-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
}

.seccion-titulo {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 1.5rem;
}

.seccion-formacion,
.seccion-experiencia {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.formacion-card,
.experiencia-card {
    display: flex;
    gap: 1.5rem;
    padding: 1.5rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: #fafafa;
}

.formacion-icon,
.experiencia-icon {
    width: 60px;
    height: 60px;
    background-color: #7c4dff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.formacion-icon .material-symbols-rounded,
.experiencia-icon .material-symbols-rounded {
    color: white;
    font-size: 32px;
}

.formacion-detalles,
.experiencia-detalles {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.detalle-row {
    display: flex;
    gap: 0.5rem;
    align-items: baseline;
}

.detalle-label {
    font-weight: 600;
    color: #333;
    font-size: 0.9rem;
}

.detalle-value {
    color: #666;
    font-size: 0.9rem;
}

.actividades-list {
    margin: 0.5rem 0 0.5rem 1.5rem;
    padding: 0;
}

.actividades-list li {
    color: #333;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
}



@media (max-width: 1024px) {
    .formacion-experiencia-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .tab-panel {
        padding: 1rem;
    }

    .formacion-card,
    .experiencia-card {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
}
</style>
