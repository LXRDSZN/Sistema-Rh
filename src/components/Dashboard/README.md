# Dashboard - Estructura Modular

## 📁 Estructura de Carpetas

```
src/
├── components/Dashboard/
│   ├── Dashboard-component.vue          # ⚠️ Archivo original (1325 líneas)
│   ├── Dashboard-component-refactored.vue # ✅ Versión refactorizada
│   ├── DashboardCommon/
│   │   ├── DashboardHeader.vue         # Header con acciones
│   │   └── RegisterModal.vue           # Modal de registro de usuarios
│   ├── DashboardStats/
│   │   └── StatCard.vue                # Tarjeta de estadística reutilizable
│   └── DashboardCharts/
│       └── (Para futuros componentes de gráficas)
│
├── composables/dashboard/
│   ├── useDashboardData.js             # Lógica de datos y estadísticas
│   └── useUserRegistration.js          # Lógica de registro de usuarios
│
└── constants/dashboard/
    └── index.js                         # Constantes del módulo
```

## 🎯 Componentes Creados

### 1. **DashboardHeader.vue**
- **Responsabilidad**: Mostrar información del usuario y botones de acción
- **Props**: `userName`, `userRole`, `totalPermissions`
- **Eventos**: `openRegisterModal`, `logout`
- **Líneas**: ~150 (vs 50 en original)

### 2. **StatCard.vue**
- **Responsabilidad**: Tarjeta de estadística reutilizable
- **Props**: `icon`, `iconClass`, `label`, `value`, `percentage`, `trend`, `emoji`, `formatNumber`
- **Características**: 
  - Soporte para tendencias (up/neutral/down)
  - Formateo opcional de números
  - Emojis opcionales
  - Animaciones hover
- **Líneas**: ~180

### 3. **RegisterModal.vue**
- **Responsabilidad**: Modal para registrar nuevos usuarios
- **Props**: `show`, `modelValue`, `userRole`, `isRegistering`
- **Eventos**: `update:show`, `submit`
- **Características**:
  - Validación de formulario
  - Estado de carga
  - Roles dinámicos según permisos
- **Líneas**: ~250

## 🔧 Composables

### 1. **useDashboardData.js**
```javascript
export function useDashboardData() {
  const stats = ref({...});
  const empleadosPorArea = ref([...]);
  const loadDashboardStats = async () => {...};
  
  return { stats, empleadosPorArea, loadDashboardStats };
}
```
- **Responsabilidad**: Gestionar datos y estadísticas del dashboard
- **Retorna**: `stats`, `empleadosPorArea`, `areaColors`, `loadDashboardStats()`

### 2. **useUserRegistration.js**
```javascript
export function useUserRegistration() {
  const newUser = ref({...});
  const isRegistering = ref(false);
  const handleRegisterUser = async () => {...};
  
  return { newUser, isRegistering, showRegisterModal, handleRegisterUser };
}
```
- **Responsabilidad**: Gestionar lógica de registro de usuarios
- **Características**:
  - Validación de campos
  - Conversión de sexo (Hombre/Mujer → M/F)
  - Manejo de errores
  - Estado de carga
- **Retorna**: `newUser`, `isRegistering`, `showRegisterModal`, `handleRegisterUser()`, `resetForm()`

## 📊 Constantes

### constants/dashboard/index.js
```javascript
export const AREA_COLORS = ['#667EEA', '#F093FB', ...];
export const DIAS_SEMANA = ['Dom', 'Lun', ...];
export const MESES = ['Enero', 'Febrero', ...];
export const RANGOS_EDAD_INICIAL = [...];
export const ROLES = { ADMIN: 'ADMIN', ... };
export const SEXO_OPTIONS = [...];
export const ROL_OPTIONS = [...];
```

## 🚀 Cómo Usar

### Opción 1: Reemplazar el archivo original
```bash
# Hacer backup del original
mv Dashboard-component.vue Dashboard-component-old.vue

# Renombrar el refactorizado
mv Dashboard-component-refactored.vue Dashboard-component.vue
```

### Opción 2: Migración gradual
1. Mantén ambos archivos
2. Actualiza la importación en `DashboardView.vue`
3. Prueba la versión refactorizada
4. Una vez validado, elimina el original

## ✅ Beneficios de la Refactorización

1. **Mejor mantenibilidad**: Código dividido en archivos de ~150-250 líneas
2. **Reutilización**: `StatCard` puede usarse en otros dashboards
3. **Testabilidad**: Composables fáciles de probar aisladamente
4. **Separación de responsabilidades**: Lógica separada de presentación
5. **Mejor rendimiento**: Componentes más pequeños = re-renders más eficientes

## 📝 Próximos Pasos

1. ✅ Crear componentes modulares básicos
2. ✅ Extraer lógica a composables
3. ✅ Definir constantes centralizadas
4. ⏳ Migrar componentes de gráficas (DonutChart, BarChart)
5. ⏳ Migrar componente de calendario
6. ⏳ Crear tests unitarios
7. ⏳ Documentar cada composable

## 🔄 Comparación

| Métrica | Original | Refactorizado |
|---------|----------|---------------|
| Líneas totales | 1,325 | ~800 distribuidas |
| Archivos | 1 | 7 |
| Componentes | 1 | 4 |
| Composables | 0 | 2 |
| Constantes | Inline | 1 archivo |
| Mantenibilidad | ⚠️ Baja | ✅ Alta |

## 🎨 Estándares de Código

- **Vue 3 Composition API**: Uso de `<script setup>`
- **Props tipadas**: Definición clara de props
- **Eventos emisores**: Uso de `defineEmits`
- **Scoped styles**: Estilos encapsulados por componente
- **Responsive design**: Diseño adaptable a móviles
