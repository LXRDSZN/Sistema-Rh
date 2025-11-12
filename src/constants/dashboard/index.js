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
  JEFE_RH: 'JEFE_RH',
  JEFE_AREA: 'JEFE_AREA',
  EMPLEADO: 'EMPLEADO'
};

export const SEXO_OPTIONS = [
  { label: 'Hombre', value: 'Hombre', codigo: 'M' },
  { label: 'Mujer', value: 'Mujer', codigo: 'F' }
];

export const ROL_OPTIONS = [
  { label: 'Jefe de Recursos Humanos', value: 'JEFE_RH', requiredRole: 'ADMIN' },
  { label: 'Jefe de Área', value: 'JEFE_AREA', requiredRole: ['ADMIN', 'JEFE_RH'] },
  { label: 'Empleado', value: 'EMPLEADO', requiredRole: null }
];
