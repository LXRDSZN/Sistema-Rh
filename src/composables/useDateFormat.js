// src/composables/useDateFormat.js
// Composable para formatear fechas evitando desfase de zona horaria

export const useDateFormat = () => {
  /**
   * Formatea una fecha a formato DD/MM/YYYY usando UTC
   * para evitar desfase de días por zona horaria
   * 
   * @param {string|Date} fecha - Fecha a formatear
   * @param {string} defaultValue - Valor por defecto si fecha es null/undefined
   * @returns {string} Fecha formateada en DD/MM/YYYY
   */
  const formatearFecha = (fecha, defaultValue = '—') => {
    if (!fecha) return defaultValue;

    // Si ya viene en formato DD/MM/YYYY, retornarla tal cual
    if (typeof fecha === 'string' && fecha.includes('/')) {
      return fecha;
    }

    // Si viene como objeto Date o string ISO, formatear con UTC
    const d = new Date(fecha);
    
    // Validar que sea una fecha válida
    if (isNaN(d.getTime())) {
      console.warn('Fecha inválida:', fecha);
      return defaultValue;
    }

    const dia = String(d.getUTCDate()).padStart(2, '0');
    const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
    const anio = d.getUTCFullYear();
    
    return `${dia}/${mes}/${anio}`;
  };

  /**
   * Formatea una fecha a formato YYYY-MM-DD (para inputs de tipo date)
   * 
   * @param {string|Date} fecha - Fecha a formatear
   * @returns {string} Fecha formateada en YYYY-MM-DD
   */
  const formatearFechaInput = (fecha) => {
    if (!fecha) return '';

    const d = new Date(fecha);
    
    if (isNaN(d.getTime())) {
      console.warn('Fecha inválida:', fecha);
      return '';
    }

    const anio = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    
    return `${anio}-${mes}-${dia}`;
  };

  /**
   * Formatea una fecha y hora a formato DD/MM/YYYY HH:MM
   * 
   * @param {string|Date} fecha - Fecha y hora a formatear
   * @returns {string} Fecha y hora formateadas
   */
  const formatearFechaHora = (fecha) => {
    if (!fecha) return '—';

    const d = new Date(fecha);
    
    if (isNaN(d.getTime())) {
      console.warn('Fecha inválida:', fecha);
      return '—';
    }

    const dia = String(d.getUTCDate()).padStart(2, '0');
    const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
    const anio = d.getUTCFullYear();
    const horas = String(d.getUTCHours()).padStart(2, '0');
    const minutos = String(d.getUTCMinutes()).padStart(2, '0');
    
    return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
  };

  /**
   * Obtiene la fecha actual en formato YYYY-MM-DD
   * 
   * @returns {string} Fecha actual formateada
   */
  const obtenerFechaHoy = () => {
    const hoy = new Date();
    return formatearFechaInput(hoy);
  };

  return {
    formatearFecha,
    formatearFechaInput,
    formatearFechaHora,
    obtenerFechaHoy
  };
};
