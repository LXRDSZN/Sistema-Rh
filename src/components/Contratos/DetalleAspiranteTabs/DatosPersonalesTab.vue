<template>
    <div class="tab-panel">
        <div class="panel-grid">
            <!-- Persona -->
            <div class="info-card">
                <div class="card-icon">
                    <span class="material-symbols-rounded">person</span>
                </div>
                <h4>Persona</h4>
                <div class="info-rows">
                    <div class="info-row">
                        <span class="label">Nombre:</span>
                        <span class="value">{{ getNombre() }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Apellido Paterno:</span>
                        <span class="value">{{ getApellidoPaterno() }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Apellido Materno:</span>
                        <span class="value">{{ getApellidoMaterno() }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Fecha de Nacimiento:</span>
                        <span class="value">{{ aspirante.fechaNacimiento || '12/11/1996' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Sexo:</span>
                        <span class="value">{{ aspirante.sexo || 'Masculino' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Nacionalidad:</span>
                        <span class="value">{{ aspirante.nacionalidad || 'Mexicana' }}</span>
                    </div>
                </div>
            </div>

            <!-- Identificación -->
            <div class="info-card">
                <div class="card-icon">
                    <span class="material-symbols-rounded">badge</span>
                </div>
                <h4>Identificación</h4>
                <div class="info-rows">
                    <div class="info-row">
                        <span class="label">CURP:</span>
                        <span class="value">{{ aspirante.curp || 'XXXX' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">RFC:</span>
                        <span class="value">{{ aspirante.rfc || 'XXXX' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">NSS:</span>
                        <span class="value">{{ aspirante.nss || 'XXXX' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Teléfono:</span>
                        <span class="value">{{ aspirante.telefono || 'XXXX' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Domicilio:</span>
                        <span class="value">{{ aspirante.domicilio || 'XXXX' }}</span>
                    </div>
                </div>
            </div>

            <!-- Documentos cargados -->
            <div class="info-card">
                <div class="card-icon">
                    <span class="material-symbols-rounded">upload_file</span>
                </div>
                <h4>Documentos cargados</h4>
                <div class="documentos-list">
                    <div class="documento-item">
                        <span class="doc-nombre">INE</span>
                        <span class="material-symbols-rounded check">check_circle</span>
                    </div>
                    <div class="documento-item">
                        <span class="doc-nombre">Comprobante de domicilio</span>
                        <span class="material-symbols-rounded check">check_circle</span>
                    </div>
                    <div class="documento-item">
                        <span class="doc-nombre">CURP</span>
                        <span class="material-symbols-rounded check">check_circle</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    aspirante: {
        type: Object,
        required: true
    }
});

const getNombre = () => {
    return props.aspirante.nombreSolo || 'XXXX';
};

const getApellidoPaterno = () => {
    return props.aspirante.apellidoPaterno || 'XXXX';
};

const getApellidoMaterno = () => {
    return props.aspirante.apellidoMaterno || 'XXXX';
};
</script>

<style scoped>
.tab-panel {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.panel-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
}

.info-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1.5rem;
}

.card-icon {
    width: 50px;
    height: 50px;
    background-color: #7c4dff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
}

.card-icon .material-symbols-rounded {
    color: white;
    font-size: 28px;
}

.info-card h4 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1.1rem;
    font-weight: 600;
}

.info-rows {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.info-row {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.info-row .label {
    font-size: 0.85rem;
    color: #666;
    font-weight: 500;
}

.info-row .value {
    color: #333;
    font-weight: 500;
}

.documentos-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.documento-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.8rem;
    background-color: #f5f5f5;
    border-radius: 6px;
}

.doc-nombre {
    color: #333;
    font-weight: 500;
}

.documento-item .material-symbols-rounded {
    color: #4caf50;
    font-size: 20px;
}

@media (max-width: 1024px) {
    .panel-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .tab-panel {
        padding: 1rem;
    }
}
</style>
