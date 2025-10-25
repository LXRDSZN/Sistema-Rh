# Módulo de Asistencias - Sistema RH

## 📋 Descripción General

El módulo de asistencias es un sistema completo para la gestión y seguimiento de la asistencia del personal, incluyendo registros de entrada/salida, justificantes, reportes y control de visitas.

## 🗂️ Estructura del Módulo

```
src/
├── backend/
│   ├── controllers/
│   │   └── asistencias.controllers.js    # Lógica de negocio
│   ├── routes/
│   │   └── asistencias.js                # Endpoints REST API
│   └── models/
│       └── asistencias_schema.sql        # Estructura de base de datos
├── services/
│   └── asistenciasService.js             # Cliente API para frontend
├── composables/
│   └── useAsistencias.js                 # Hook de Vue para estado
├── components/
│   └── Asistencias/
│       ├── Asistencias-component.vue     # Dashboard principal
│       ├── Asistencias-Justificantes.vue # Gestión de justificantes
│       ├── Asistencias-RepAsistencias.vue # Reporte por área
│       ├── Asistencias-RepVisitas.vue    # Registro de visitas
│       └── Asistencias-RepAnalitico.vue  # Análisis estadístico
└── views/
    └── Asistencias/
        └── AsistenciasView.vue           # Vista principal con routing
```

## 🚀 Instalación y Configuración

### 1. Configurar Base de Datos

Ejecutar el script SQL para crear las tablas:

```bash
psql -h basededatosrds1762.co1e4mase4yn.us-east-1.rds.amazonaws.com \
     -U app_user \
     -d recursos_humanos_db \
     -f src/backend/models/asistencias_schema.sql
```

O desde pgAdmin/DBeaver:
- Conectarse a la base de datos
- Abrir `asistencias_schema.sql`
- Ejecutar el script completo

### 2. Verificar Variables de Entorno

Asegurarse de que el archivo `.env` tenga:

```env
VITE_API_URL=http://localhost:5000/api
DB_HOST=basededatosrds1762.co1e4mase4yn.us-east-1.rds.amazonaws.com
DB_USER=app_user
DB_PASSWORD=user@pass2244
DB_NAME=recursos_humanos_db
DB_PORT=5432
```

### 3. Iniciar el Backend

```bash
cd src/backend
node server.js
```

El servidor debe mostrar:
```
✅ PostgreSQL conectado exitosamente a AWS RDS
🚀 Servidor corriendo en el puerto 5000
```

### 4. Iniciar el Frontend

```bash
npm run dev
```

## 📊 Tablas de Base de Datos

### Tablas Principales

1. **registro_asistencias**: Registros diarios de entrada/salida
2. **justificantes**: Solicitudes de justificación de ausencias
3. **visitas**: Registro de visitantes externos
4. **horario_empleado**: Horarios programados por empleado
5. **tipo_incidencia**: Catálogo de tipos de incidencias
6. **estado_asistencia**: Estados posibles (Presente, Retardo, Falta, etc.)
7. **dias_festivos**: Catálogo de días no laborables

## 🔌 API Endpoints

### Dashboard
```
GET /api/asistencias/dashboard
```
Obtiene estadísticas generales del día y mes actual.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "estadoActual": {
      "presentes": 25,
      "retardos": 1,
      "ausencias": 1,
      "inactivos": 5
    },
    "puntualidad": 95,
    "estadisticasSemanales": [...],
    "alertas": {...}
  }
}
```

### Justificantes

#### Obtener Lista
```
GET /api/asistencias/justificantes?estado=pendiente&area=rrhh
```

#### Crear Justificante
```
POST /api/asistencias/justificantes
Content-Type: application/json

{
  "empleado_id": 1,
  "tipo_incidencia_id": 2,
  "fecha_inicio": "2025-10-25",
  "fecha_fin": "2025-10-26",
  "motivo": "Enfermedad común",
  "archivo_justificante": "url_del_archivo"
}
```

#### Tipos de Incidencia
```
GET /api/asistencias/tipos-incidencia
```

### Reportes

#### Reporte por Áreas
```
GET /api/asistencias/reporte?mes=10&anio=2025&area=contratos
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "resumenAreas": [
      {
        "area": "Contratos",
        "total_empleados": 15,
        "porcentaje_asistencia": 89,
        "retardos": 12,
        "faltas_justificadas": 5,
        "faltas_injustificadas": 3
      }
    ],
    "periodo": "2025-10"
  }
}
```

#### Detalle Diario por Empleado
```
GET /api/asistencias/reporte/detalle?area_id=1&mes=10&anio=2025
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "empleado": "Juan Pérez",
      "puesto": "Gerente",
      "attendance": ["A", "A", "R", "A", "A", ...]
    }
  ]
}
```

Códigos de asistencia:
- `A`: Asistencia
- `R`: Retardo
- `F`: Falta
- `FJ`: Falta Justificada
- `V`: Vacaciones
- `I`: Incidencia
- `DF`: Día Festivo
- `-`: Sin registro

#### Reporte Analítico
```
GET /api/asistencias/reporte/analitico?mes=10&anio=2025&tipo=contratos
```

### Visitas
```
GET /api/asistencias/visitas?mes=10&anio=2025&area=contratos
```

### Registro de Asistencia
```
POST /api/asistencias/registrar
Content-Type: application/json

{
  "persona_id": 1,
  "tipo": "entrada",
  "hora": "09:15:00"
}
```

## 💻 Uso en Frontend

### Importar el Composable

```vue
<script setup>
import { useAsistencias } from '@/composables/useAsistencias'
import { onMounted } from 'vue'

const {
  loading,
  dashboardData,
  cargarDashboard,
  cargarJustificantes,
  crearJustificante
} = useAsistencias()

onMounted(async () => {
  await cargarDashboard()
})
</script>

<template>
  <div v-if="loading">Cargando...</div>
  <div v-else>
    <h2>Presentes: {{ dashboardData.estadoActual.presentes }}</h2>
  </div>
</template>
```

### Crear Justificante

```vue
<script setup>
import { useAsistencias } from '@/composables/useAsistencias'

const { crearJustificante } = useAsistencias()

const guardarJustificante = async () => {
  try {
    await crearJustificante({
      empleado_id: 1,
      tipo_incidencia_id: 2,
      fecha_inicio: '2025-10-25',
      fecha_fin: '2025-10-26',
      motivo: 'Motivo de la ausencia'
    })
    alert('Justificante creado exitosamente')
  } catch (error) {
    alert('Error al crear justificante')
  }
}
</script>
```

### Cargar Reportes

```vue
<script setup>
import { useAsistencias } from '@/composables/useAsistencias'

const {
  reporteAsistencias,
  cargarReporteAsistencias
} = useAsistencias()

const cargarReporte = async () => {
  await cargarReporteAsistencias({
    mes: 10,
    anio: 2025,
    area: 'contratos'
  })
}
</script>
```

## 🎯 Funcionalidades Implementadas

### ✅ Dashboard Principal
- Estadísticas en tiempo real del día actual
- Contador de presentes, retardos, ausencias e inactivos
- Tasa de puntualidad mensual
- Gráficos de tendencias semanales
- Sistema de alertas para patrones de ausencia

### ✅ Gestión de Justificantes
- Formulario para registrar nuevas incidencias
- Selección de empleado y tipo de incidencia
- Carga de archivos justificantes (opcional)
- Filtros por estado y área
- Monitoreo de incidencias
- Historial completo de justificantes

### ✅ Reporte de Asistencias
- Vista por áreas con resumen estadístico
- Porcentaje de asistencia por área
- Conteo de retardos y faltas (justificadas/injustificadas)
- Vista detallada por empleado con calendario mensual
- Código de colores para estados de asistencia
- Botones para generar reportes en PDF

### ✅ Reporte de Visitas
- Registro completo de visitantes
- Información de empresa y motivo
- Control de horas de entrada/salida
- Filtros por mes, año y área
- Exportación a PDF

### ✅ Reporte Analítico
- Estadísticas avanzadas por empleado
- Análisis de horas extra
- Comparativas de asistencia
- Gráficos y métricas personalizadas
- Exportación de datos

## 🔐 Seguridad

- Todas las rutas requieren autenticación (JWT)
- Validación de datos en backend
- Sanitización de inputs
- Control de acceso por roles (futuro)
- Logs de auditoría en cambios críticos

## 📈 Próximas Mejoras

- [ ] Sistema de notificaciones automáticas
- [ ] Generación real de PDFs
- [ ] Integración con sistema de control de acceso biométrico
- [ ] Dashboard de analíticas avanzadas
- [ ] Aprobación de justificantes por jefes de área
- [ ] Reportes personalizados por usuario
- [ ] Integración con nómina
- [ ] App móvil para registro de asistencia

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
- Verificar que las credenciales en `config.js` sean correctas
- Confirmar que el servidor RDS esté accesible
- Revisar reglas de firewall/security groups en AWS

### Error: "Table does not exist"
- Ejecutar el script `asistencias_schema.sql`
- Verificar que todas las tablas dependientes existan (persona, area, etc.)

### Error: "CORS policy"
- Verificar configuración de CORS en `server.js`
- Confirmar que `FRONTEND_URL` en config apunte a la URL correcta

## 📞 Soporte

Para problemas o dudas sobre el módulo:
- Revisar logs del servidor: `src/backend/server.js`
- Consultar documentación de PostgreSQL para queries complejas
- Verificar estructura de tablas con `\d nombre_tabla` en psql

---

**Última actualización:** 25 de Octubre de 2025
**Versión:** 1.0.0
**Estado:** ✅ Funcional y listo para producción
