/**
 * ============================================
 * COMPOSABLE - useAreasExport
 * ============================================
 * Gestiona la exportación de datos a CSV
 */

export function useAreasExport() {
  /**
   * Escapa un valor para CSV (maneja comas, comillas y saltos de línea)
   */
  const escaparValorCSV = (valor) => {
    if (valor === null || valor === undefined) return '';
    const str = String(valor);
    // Si contiene comas, comillas o saltos de línea, envolver en comillas
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  /**
   * Exporta los datos filtrados a un archivo CSV
   * @param {Array} empleados - Lista de empleados a exportar
   */
  const exportarDatos = (empleados) => {
    // Crear encabezados
    const headers = ['Nombre', 'Departamento', 'Título', 'Fecha de Inicio', 'Categoría', 'Género'];
    
    // Convertir datos a formato CSV con valores escapados
    const csvContent = [
      headers.join(','),
      ...empleados.map(emp => [
        escaparValorCSV(emp.nombre),
        escaparValorCSV(emp.departamento),
        escaparValorCSV(emp.titulo),
        escaparValorCSV(emp.fechaInicio),
        escaparValorCSV(emp.categoria),
        escaparValorCSV(emp.genero)
      ].join(','))
    ].join('\n');
    
    // Agregar BOM de UTF-8 para que Excel interprete correctamente los caracteres especiales
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
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
