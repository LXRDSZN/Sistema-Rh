import { ref } from 'vue';

export function useDashboardData() {
  const stats = ref({
    nuevosEmpleados: { total: 0, porcentaje: 0, tendencia: 'up' },
    totalEmpleados: { total: 0, porcentaje: 0, tendencia: 'up' },
    asistenciasActivas: { total: 0, emoji: '💻📊📈', tendencia: 'neutral' }
  });

  const empleadosPorArea = ref([
    { area: 'Desarrollo', total: 45 },
    { area: 'Ventas', total: 32 },
    { area: 'Marketing', total: 28 },
    { area: 'Recursos Humanos', total: 15 },
    { area: 'Finanzas', total: 20 }
  ]);

  const areaColors = ['#667EEA', '#F093FB', '#4FACFE', '#FA709A', '#FEE140'];

  const loadDashboardStats = async () => {
    try {
      // Simular carga de datos
      stats.value = {
        nuevosEmpleados: { total: 12, porcentaje: 15, tendencia: 'up' },
        totalEmpleados: { total: 140, porcentaje: 8, tendencia: 'up' },
        asistenciasActivas: { total: 98, emoji: '💻📊📈', tendencia: 'neutral' }
      };
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  return {
    stats,
    empleadosPorArea,
    areaColors,
    loadDashboardStats
  };
}
