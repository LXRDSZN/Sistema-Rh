// Constantes del Dashboard

export const AREA_COLORS = ['#667EEA', '#F093FB', '#4FACFE', '#FA709A', '#FEE140'];

export const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const RANGOS_EDAD_INICIAL = [
  { label: '18-25', hombres: 0, mujeres: 0, porcentajeHombres: 0, porcentajeMujeres: 0 },
  { label: '26-35', hombres: 0, mujeres: 0, porcentajeHombres: 0, porcentajeMujeres: 0 },
  { label: '36-45', hombres: 0, mujeres: 0, porcentajeHombres: 0, porcentajeMujeres: 0 },
  { label: '46-55', hombres: 0, mujeres: 0, porcentajeHombres: 0, porcentajeMujeres: 0 },
  { label: '56+', hombres: 0, mujeres: 0, porcentajeHombres: 0, porcentajeMujeres: 0 }
];

export const ROLES = {
  ADMIN: 'ADMIN',
  GERENTE_GENERAL: 'GERENTE_GENERAL',
  JEFE_AREA: 'JEFE_AREA',
  JEFE_ASISTENCIAS: 'JEFE_ASISTENCIAS',
  JEFE_CONTRATOS: 'JEFE_CONTRATOS',
  JEFE_VACACIONES: 'JEFE_VACACIONES',
  JEFE_INCIDENCIAS: 'JEFE_INCIDENCIAS',
  EMPLEADO: 'EMPLEADO'
};

export const SEXO_OPTIONS = [
  { label: 'Hombre', value: 'Hombre', codigo: 'M' },
  { label: 'Mujer', value: 'Mujer', codigo: 'F' }
];

export const ROL_OPTIONS = [
  { label: 'Gerente General', value: 'GERENTE_GENERAL', requiredRole: 'ADMIN' },
  { label: 'Jefe de Área', value: 'JEFE_AREA', requiredRole: ['ADMIN', 'GERENTE_GENERAL'] },
  { label: 'Jefe de Asistencias', value: 'JEFE_ASISTENCIAS', requiredRole: ['ADMIN', 'GERENTE_GENERAL'] },
  { label: 'Jefe de Contratos', value: 'JEFE_CONTRATOS', requiredRole: ['ADMIN', 'GERENTE_GENERAL'] },
  { label: 'Jefe de Vacaciones', value: 'JEFE_VACACIONES', requiredRole: ['ADMIN', 'GERENTE_GENERAL'] },
  { label: 'Jefe de Incidencias', value: 'JEFE_INCIDENCIAS', requiredRole: ['ADMIN', 'GERENTE_GENERAL'] },
  { label: 'Empleado', value: 'EMPLEADO', requiredRole: null }
];
