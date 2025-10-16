/**
 * ============================================
 * COMPOSABLE - useAreasExport
 * ============================================
 * Gestiona la exportación de datos a CSV
 */

export function useAreasExport() {
  /**
   * Exporta los datos filtrados a un archivo CSV
   * @param {Array} empleados - Lista de empleados a exportar
   */
  const exportarDatos = (empleados) => {
    // Crear encabezados
    const headers = ['Nombre', 'Departamento', 'Título', 'Fecha de Inicio', 'Categoría', 'Género'];
    
    // Convertir datos a formato CSV
    const csvContent = [
      headers.join(','),
      ...empleados.map(emp => [
        emp.nombre,
        emp.departamento,
        emp.titulo,
        emp.fechaInicio,
        emp.categoria,
        emp.genero
      ].join(','))
    ].join('\n');
    
    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `empleados_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    exportarDatos
  };
}
