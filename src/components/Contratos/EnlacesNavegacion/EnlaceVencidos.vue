<template>
    <ContratosListView :contratos="contratos" headerTitle="Contratos/Vencidos" sectionTitle="CONTRATOS VENCIDOS"
        primaryColor="#dc3545" secondaryColor="#c82333" lightBackground="#fff0f0"
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
