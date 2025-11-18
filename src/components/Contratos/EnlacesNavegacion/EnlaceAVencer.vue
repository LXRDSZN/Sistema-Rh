<template>
    <ContratosListView :contratos="contratos" headerTitle="Contratos/Próximos a Vencer"
        sectionTitle="CONTRATOS PRÓXIMOS A VENCER" primaryColor="#ffc107" secondaryColor="#ff9800"
        lightBackground="#fffbf0" @revisar-contrato="$emit('revisar-contrato', $event)"
        @volver-inicio="$emit('volver-inicio')" />
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
        contratos.value = await obtenerContratosPorEstado('avencer');
    } catch (error) {
        console.error('Error al cargar contratos próximos a vencer:', error);
    }
});
</script>
