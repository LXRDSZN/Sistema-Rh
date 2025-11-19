<template>
    <ContratosListView :contratos="contratos" headerTitle="Contratos/Activos" sectionTitle="CONTRATOS ACTIVOS"
        primaryColor="#28a745" secondaryColor="#1e7e34" lightBackground="#f0fff4"
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
        contratos.value = await obtenerContratosPorEstado('activo');
    } catch (error) {
        console.error('Error al cargar contratos activos:', error);
    }
});
</script>
