<template>
    <ContratosListView :contratos="contratos" headerTitle="Contratos/Activos" sectionTitle="CONTRATOS ACTIVOS"
        primaryColor="#28a745" secondaryColor="#1e7e34" lightBackground="#f0fff4"
        @revisar-contrato="$emit('revisar-contrato', $event)" @volver-inicio="$emit('volver-inicio')" />
</template>

<script setup>
import ContratosListView from './ContratosListView.vue';

defineProps({
    contratos: {
        type: Array,
        required: true
    }
});

defineEmits(['revisar-contrato', 'volver-inicio']);
</script>
