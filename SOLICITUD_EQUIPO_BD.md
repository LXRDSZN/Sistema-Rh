# 📧 SOLICITUD AL EQUIPO DE BASE DE DATOS
## Módulo de Asistencias - Sistema RH

---

## 📋 Resumen

Necesitamos configurar el módulo de Asistencias. El usuario `app_user` actualmente **NO tiene permisos** para crear tablas. Les pedimos que ejecuten el script SQL adjunto o nos otorguen los permisos necesarios.

---

## ✅ Estado Actual

### Tablas que SÍ existen:
- ✅ `persona`
- ✅ `area`
- ✅ `puesto`
- ✅ `asignacion_puesto`
- ✅ `tipo_incidencia` (parcialmente configurada)

### Tablas que FALTAN crear:
- ❌ `estado_asistencia`
- ❌ `horario_empleado`
- ❌ `registro_asistencias`
- ❌ `justificantes`
- ❌ `visitas`
- ❌ `dias_festivos`

---

## 🔧 OPCIÓN 1: Ejecutar el Script SQL (RECOMENDADO)

Por favor ejecuten el siguiente script SQL con el usuario **`postgres`** (administrador):

**Ubicación del archivo:** `src/backend/models/asistencias_schema.sql`

### Comandos a ejecutar:

```sql
-- Conectarse como usuario postgres (admin)
-- Ejecutar el contenido completo del archivo asistencias_schema.sql

-- Después, otorgar permisos al usuario app_user:
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
```

---

## 🔧 OPCIÓN 2: Otorgar Permisos a app_user

Si prefieren que nosotros creemos las tablas, necesitamos estos permisos:

```sql
-- Otorgar permiso de creación
GRANT CREATE ON SCHEMA public TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;

-- Otorgar permisos sobre todas las tablas existentes
GRANT ALL ON ALL TABLES IN SCHEMA public TO app_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Otorgar permisos sobre tablas futuras (opcional pero recomendado)
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL ON TABLES TO app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL ON SEQUENCES TO app_user;
```

---

## 📄 Script SQL Completo

El script incluye:

1. **7 Tablas principales:**
   - `estado_asistencia` - Estados de asistencia (Presente, Retardo, Falta, etc.)
   - `tipo_incidencia` - Tipos de incidencias (si no existe, la crea)
   - `horario_empleado` - Horarios por empleado
   - `registro_asistencias` - Registros diarios de entrada/salida
   - `justificantes` - Solicitudes de justificación
   - `visitas` - Control de visitantes
   - `dias_festivos` - Catálogo de días no laborables

2. **Índices optimizados** para consultas rápidas

3. **Triggers automáticos:**
   - Actualización de timestamps
   - Cálculo automático de horas trabajadas

4. **Datos iniciales:**
   - 7 estados de asistencia
   - 6 tipos de incidencia
   - Días festivos de México 2025

5. **Foreign Keys** que referencian:
   - `persona(id)`
   - `area(id)`
   - Todas con `ON DELETE CASCADE` para integridad referencial

---

## 🎯 Verificación Post-Setup

Después de ejecutar el script, por favor verifiquen que se crearon correctamente:

```sql
-- Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'estado_asistencia',
  'tipo_incidencia',
  'horario_empleado',
  'registro_asistencias',
  'justificantes',
  'visitas',
  'dias_festivos'
);

-- Verificar datos iniciales
SELECT COUNT(*) FROM estado_asistencia;  -- Debe mostrar 7
SELECT COUNT(*) FROM tipo_incidencia;    -- Debe mostrar 6
SELECT COUNT(*) FROM dias_festivos;      -- Debe mostrar 7

-- Verificar permisos de app_user
SELECT 
  has_table_privilege('app_user', 'registro_asistencias', 'SELECT') as puede_select,
  has_table_privilege('app_user', 'registro_asistencias', 'INSERT') as puede_insert,
  has_table_privilege('app_user', 'registro_asistencias', 'UPDATE') as puede_update,
  has_table_privilege('app_user', 'registro_asistencias', 'DELETE') as puede_delete;
```

Todos deben mostrar `true` (t).

---

## 📊 Estructura de Dependencias

```
persona (existente)
  ├── registro_asistencias (nueva)
  ├── justificantes (nueva)
  ├── horario_empleado (nueva)
  └── visitas (nueva)

area (existente)
  └── visitas (nueva)

estado_asistencia (nueva)
  └── registro_asistencias (nueva)

tipo_incidencia (existente)
  └── justificantes (nueva)
```

---

## ⚠️ IMPORTANTE

- **NO eliminar** tablas existentes
- Las nuevas tablas usan **`IF NOT EXISTS`** para evitar conflictos
- Los datos iniciales usan **`ON CONFLICT DO NOTHING`** para no duplicar
- El script es **idempotente** (se puede ejecutar múltiples veces sin problemas)

---

## 📞 Contacto

Si tienen alguna duda o necesitan aclaraciones:
- Revisar: `src/backend/models/asistencias_schema.sql`
- Revisar: `src/backend/README_ASISTENCIAS.md`

---

## ⏱️ Tiempo Estimado de Ejecución

- Creación de tablas: ~5 segundos
- Inserción de datos iniciales: ~2 segundos
- Otorgar permisos: ~1 segundo

**Total: ~10 segundos**

---

## ✅ Confirmación

Una vez completado, por favor confirmen que:
- [  ] Script SQL ejecutado exitosamente
- [  ] 7 tablas creadas
- [  ] Datos iniciales insertados
- [  ] Permisos otorgados a `app_user`
- [  ] Verificación ejecutada sin errores

---

**Gracias por su apoyo! 🙏**

---

## 📎 Archivos Adjuntos

1. `asistencias_schema.sql` - Script SQL completo
2. Este documento de instrucciones

---

**Fecha de solicitud:** 25 de Octubre de 2025  
**Prioridad:** Alta  
**Módulo:** Asistencias  
**Usuario BD:** app_user  
**Base de datos:** recursos_humanos_db  
**Host:** basededatosrds1762.co1e4mase4yn.us-east-1.rds.amazonaws.com
