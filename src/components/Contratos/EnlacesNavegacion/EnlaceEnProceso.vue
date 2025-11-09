<template>
    <ContratosListView :contratos="contratos" headerTitle="Contratos/En Proceso" sectionTitle="CONTRATOS EN PROCESO"
        primaryColor="#007bff" secondaryColor="#0056b3" lightBackground="#f0f7ff"
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
