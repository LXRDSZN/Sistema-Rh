/**
 * ============================================
 * CONSTANTS - Areas Module
 * ============================================
 * Constantes compartidas para el módulo de gestión de áreas
 * Incluye departamentos, títulos, categorías y géneros
 */

/**
 * Lista de departamentos disponibles en el sistema
 */
export const DEPARTAMENTOS = [
  'Contratos',
  'Asistencias',
  'Incidencias',
  'Vacaciones',
  'Documentación'
];

/**
 * Lista de títulos/puestos laborales
 */
export const TITULOS = [
  'Jefe de área',
  'Empleado',
  'Supervisor',
  'Gerente'
];

/**
 * Lista de categorías de contratación
 */
export const CATEGORIAS = [
  'Tiempo completo',
  'Tiempo parcial',
  'Por contrato',
  'Temporal'
];

/**
 * Lista de géneros para filtrado
 */
export const GENEROS = [
  'Hombre',
  'Mujer'
];

/**
 * Datos de ejemplo para empleados
 * TODO: Reemplazar con llamadas a API
 */
export const EMPLEADOS_MOCK = [
  {
    id: 1,
    nombre: 'José López',
    departamento: 'Contratos',
    titulo: 'Jefe de área',
    fechaInicio: '22/09/2025',
    categoria: 'Tiempo completo',
    genero: 'Hombre'
  },
  {
    id: 2,
    nombre: 'feven tesfaye',
    departamento: 'Asistencias',
    titulo: 'Jefe de área',
    fechaInicio: '22/09/2025',
    categoria: 'Tiempo completo',
    genero: 'Mujer'
  },
  {
    id: 3,
    nombre: 'AMANUEL BEYENE',
    departamento: 'Incidencias',
    titulo: 'Jefe de área',
    fechaInicio: '22/09/2025',
    categoria: 'Tiempo completo',
    genero: 'Hombre'
  },
  {
    id: 4,
    nombre: 'iecila atalav',
    departamento: 'Vacaciones',
    titulo: 'Jefe de área',
    fechaInicio: '22/09/2025',
    categoria: 'Tiempo completo',
    genero: 'Hombre'
  },
  {
    id: 5,
    nombre: 'redwan husen',
    departamento: 'Incidencias',
    titulo: 'Empleado',
    fechaInicio: '22/09/2025',
    categoria: 'Tiempo completo',
    genero: 'Hombre'
  },
  {
    id: 6,
    nombre: 'abel beyene',
    departamento: 'Contratos',
    titulo: 'Empleado',
    fechaInicio: '22/09/2025',
    categoria: 'Tiempo completo',
    genero: 'Hombre'
  },
  {
    id: 7,
    nombre: 'temesgem melak',
    departamento: 'Incidencias',
    titulo: 'Empleado',
    fechaInicio: '22/09/2025',
    categoria: 'Tiempo completo',
    genero: 'Hombre'
  }
];
