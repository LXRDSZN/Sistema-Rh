<template>
    <div class="tabs-container">
        <button class="tab-btn" :class="{ active: activeTab === 'contratoActual' }"
            @click="$emit('cambiar-tab', 'contratoActual')">
            Contrato Actual
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'nominaPagos' }"
            @click="$emit('cambiar-tab', 'nominaPagos')">
            Nómina y pagos
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'beneficiosSeguridad' }"
            @click="$emit('cambiar-tab', 'beneficiosSeguridad')">
            Beneficios y seguridad
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'documentos' }"
            @click="$emit('cambiar-tab', 'documentos')">
            Documentos
        </button>
    </div>
</template>

<script setup>
defineProps({
    activeTab: {
        type: String,
        default: 'contratoActual'
    }
});

defineEmits(['cambiar-tab']);
</script>

<style scoped>
.tabs-container {
    display: flex;
    gap: 0;
    border-bottom: 2px solid #e0e0e0;
    margin-bottom: 2rem;
}

.tab-btn {
    flex: 1;
    padding: 1rem 2rem;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    color: #666;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    bottom: -2px;
}

.tab-btn:hover {
    color: #9370db;
}

.tab-btn.active {
    color: #9370db;
    border-bottom-color: #9370db;
    font-weight: 600;
}

@media (max-width: 768px) {
    .tabs-container {
        flex-wrap: wrap;
    }

    .tab-btn {
        flex: 1 1 45%;
    }
}
</style>
