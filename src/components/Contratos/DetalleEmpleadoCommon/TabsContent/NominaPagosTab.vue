<template>
    <div class="nomina-pagos-content">
        <h3>Nómina y pagos</h3>

        <div class="nomina-grid">
            <div class="nomina-column">
                <div class="nomina-item">
                    <span class="label">Periodos de pago</span>
                    <span class="value">{{ nomina.periodosPago }}</span>
                </div>
                <div class="nomina-item">
                    <span class="label">Salario Bruto</span>
                    <span class="value">{{ nomina.salarioBruto }}</span>
                </div>
                <div class="nomina-item">
                    <span class="label">Deducciones</span>
                    <span class="value">{{ nomina.deducciones }}</span>
                </div>
                <div class="nomina-item">
                    <span class="label">Neto</span>
                    <span class="value">{{ nomina.neto }}</span>
                </div>
            </div>

            <div class="nomina-column">
                <div class="nomina-item">
                    <span class="label">Bonos recibidos</span>
                    <span class="value">{{ nomina.bonosRecibidos }}</span>
                </div>
                <div class="nomina-item">
                    <span class="label">Deducciones aplicadas</span>
                    <span class="value">{{ nomina.deduccionesAplicadas }}</span>
                </div>
                <div class="nomina-item">
                    <span class="label">Historial de aguinaldos</span>
                    <span class="value">{{ nomina.historialAguinaldos }}</span>
                </div>
            </div>
        </div>

        <button class="btn-descargar-pdf">Descargar recibo PDF</button>
    </div>
</template>

<script setup>
defineProps({
    nomina: {
        type: Object,
        required: true
    }
});
</script>

<style scoped>
.nomina-pagos-content h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
    color: #333;
}

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

@media (max-width: 1024px) {
    .nomina-grid {
        grid-template-columns: 1fr;
    }
}
</style>
