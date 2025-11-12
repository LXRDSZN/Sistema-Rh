<template>
    <ContratosListView :contratos="contratos" headerTitle="Contratos/Próximos a Vencer"
        sectionTitle="CONTRATOS PRÓXIMOS A VENCER" primaryColor="#ffc107" secondaryColor="#ff9800"
        lightBackground="#fffbf0" @revisar-contrato="$emit('revisar-contrato', $event)"
        @volver-inicio="$emit('volver-inicio')" />
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
