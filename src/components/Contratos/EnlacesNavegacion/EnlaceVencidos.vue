<template>
    <ContratosListView :contratos="contratos" headerTitle="Contratos/Vencidos" sectionTitle="CONTRATOS VENCIDOS"
        primaryColor="#dc3545" secondaryColor="#c82333" lightBackground="#fff0f0"
        @revisar-contrato="$emit('revisar-contrato', $event)" @volver-inicio="$emit('volver-inicio')" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ContratosListView from './ContratosListView.vue';
import { useContratos } from '@/composables/useContratos';

const { obtenerContratosPorEstado } = useContratos();
const contratos = ref([]);

defineEmits(['revisar-contrato', 'volver-inicio']);

onMounted(async () => {
    try {
        contratos.value = await obtenerContratosPorEstado('vencido');
    } catch (error) {
        console.error('Error al cargar contratos vencidos:', error);
    }
});
</script>
