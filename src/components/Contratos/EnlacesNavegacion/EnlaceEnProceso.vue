<template>
    <ContratosListView :contratos="contratos" headerTitle="Contratos/En Proceso" sectionTitle="CONTRATOS EN PROCESO"
        primaryColor="#007bff" secondaryColor="#0056b3" lightBackground="#f0f7ff"
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
        contratos.value = await obtenerContratosPorEstado('proceso');
    } catch (error) {
        console.error('Error al cargar contratos en proceso:', error);
    }
});
</script>
