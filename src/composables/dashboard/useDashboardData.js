import { ref } from 'vue';
import { getDashboardStats, getEmpleadosPorArea, getDemografia } from '@/services/dashboardService';

export function useDashboardData() {
  const stats = ref({
    nuevosEmpleados: { total: 0, porcentaje: 0, tendencia: 'up' },
    totalEmpleados: { total: 0, porcentaje: 0, tendencia: 'up' },
    asistenciasActivas: { total: 0, emoji: '💻📊📈', tendencia: 'neutral' }
  });

  const empleadosPorArea = ref([]);
  const estadisticasEdadGenero = ref([]);

  const areaColors = ['#22C55E', '#3B82F6', '#A855F7', '#F59E0B', '#14B8A6'];

  const loadDashboardStats = async () => {
    try {
      // Cargar estadísticas del dashboard
      const statsResponse = await getDashboardStats();
      if (statsResponse.success) {
        stats.value = statsResponse.data;
      }

      // Cargar empleados por área
      const areasResponse = await getEmpleadosPorArea();
      if (areasResponse.success) {
        empleadosPorArea.value = areasResponse.data;
      }

      // Cargar demografía
      const demografiaResponse = await getDemografia();
      if (demografiaResponse.success) {
        estadisticasEdadGenero.value = demografiaResponse.data;
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      // Mantener valores por defecto en caso de error
    }
  };

  return {
    stats,
    empleadosPorArea,
    estadisticasEdadGenero,
    areaColors,
    loadDashboardStats
  };
}
