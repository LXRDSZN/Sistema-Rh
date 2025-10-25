# 🚀 Guía Rápida - Módulo de Asistencias

## Pasos para Poner en Marcha el Módulo

### 1️⃣ Configurar Base de Datos

Conéctate a tu base de datos PostgreSQL y ejecuta el script SQL:

```bash
# Desde la terminal
psql -h basededatosrds1762.co1e4mase4yn.us-east-1.rds.amazonaws.com \
     -U app_user \
     -d recursos_humanos_db \
     -f src/backend/models/asistencias_schema.sql
```

**O usa una herramienta GUI:**
- DBeaver, pgAdmin, TablePlus, etc.
- Abre el archivo `src/backend/models/asistencias_schema.sql`
- Ejecuta todo el script

### 2️⃣ Verificar que el Backend esté Corriendo

```bash
cd src/backend
node server.js
```

**Deberías ver:**
```
✅ PostgreSQL conectado exitosamente a AWS RDS
📍 Host: basededatosrds1762.co1e4mase4yn.us-east-1.rds.amazonaws.com
🗄️  Base de datos: recursos_humanos_db
🚀 Servidor corriendo en el puerto 5000
```

### 3️⃣ Iniciar el Frontend

```bash
# Desde la raíz del proyecto
npm run dev
```

### 4️⃣ Navegar al Módulo

1. Inicia sesión en el sistema
2. Haz clic en "**Asistencias**" en el sidebar
3. Verás el menú desplegable con las opciones:
   - **Dashboard** - Vista general con estadísticas
   - **Justificantes** - Gestión de incidencias
   - **Reporte de Asistencias** - Reportes por área
   - **Reporte de Visitas** - Control de visitantes
   - **Reporte Analítico** - Análisis detallado

## 🧪 Probar el Módulo

### Probar el Dashboard

```javascript
// En el navegador, abre la consola (F12) y ejecuta:
fetch('http://localhost:5000/api/asistencias/dashboard', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(console.log)
```

### Probar Crear Justificante

```javascript
fetch('http://localhost:5000/api/asistencias/justificantes', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    empleado_id: 1,
    tipo_incidencia_id: 2,
    fecha_inicio: '2025-10-25',
    fecha_fin: '2025-10-25',
    motivo: 'Prueba de justificante'
  })
})
  .then(r => r.json())
  .then(console.log)
```

### Probar Reporte de Asistencias

```javascript
fetch('http://localhost:5000/api/asistencias/reporte?mes=10&anio=2025', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(console.log)
```

## 📋 Verificar que Todo Funcione

### ✅ Checklist de Verificación

- [ ] El backend arranca sin errores
- [ ] Se muestra el menú desplegable de Asistencias en el sidebar
- [ ] Dashboard muestra las estadísticas (aunque sean 0)
- [ ] Se pueden ver los formularios de justificantes
- [ ] Los filtros de reportes cargan las opciones
- [ ] No hay errores en la consola del navegador
- [ ] Las llamadas API responden correctamente

## 🎨 Estructura del Menú de Navegación

```
Asistencias (desplegable)
├── Dashboard (/Asistencias)
├── Justificantes (/Asistencias/justificantes)
├── Reporte de Asistencias (/Asistencias/reporte-asistencias)
├── Reporte de Visitas (/Asistencias/reporte-visitas)
└── Reporte Analítico (/Asistencias/reporte-analitico)
```

## 🔧 Solución de Problemas Comunes

### "Cannot GET /api/asistencias/..."
**Solución:** Verificar que el backend esté corriendo y que las rutas estén registradas en `server.js`

### "401 Unauthorized"
**Solución:** Asegúrate de estar autenticado. Inicia sesión primero.

### "Table does not exist"
**Solución:** Ejecuta el script SQL `asistencias_schema.sql`

### "CORS error"
**Solución:** Verifica que `FRONTEND_URL` en `config.js` sea correcta

### No aparece el menú desplegable
**Solución:** Verifica que los cambios en `sidebar.vue` y `router/index.js` estén guardados y el dev server reiniciado

## 📊 Datos de Prueba

Si quieres datos de prueba, puedes insertar manualmente:

```sql
-- Insertar asistencia de prueba
INSERT INTO registro_asistencias 
  (persona_id, fecha, hora_entrada, hora_programada_entrada, estado_asistencia_id)
VALUES 
  (1, CURRENT_DATE, '09:00:00', '09:00:00', 1);

-- Insertar justificante de prueba
INSERT INTO justificantes 
  (persona_id, tipo_incidencia_id, fecha_inicio, fecha_fin, motivo, estado)
VALUES 
  (1, 2, CURRENT_DATE, CURRENT_DATE, 'Motivo de prueba', 'pendiente');

-- Insertar visita de prueba
INSERT INTO visitas 
  (nombre_visitante, cargo_rol, empresa_pertenece, area_visitada_id, fecha, hora_ingreso)
VALUES 
  ('Juan Pérez', 'Consultor', 'Empresa XYZ', 1, CURRENT_DATE, '10:00:00');
```

## 🎯 Siguiente Paso

Una vez verificado que todo funciona:

1. **Poblar datos reales** de empleados y horarios
2. **Configurar horarios** para cada empleado
3. **Probar el flujo completo** de registro de asistencia
4. **Generar reportes** con datos reales
5. **Configurar permisos** según roles de usuario

## 📞 Contacto

Si encuentras algún problema, revisa:
- Logs del servidor backend
- Consola del navegador (F12)
- README_ASISTENCIAS.md para documentación completa

---

**¡Listo para usar! 🎉**
