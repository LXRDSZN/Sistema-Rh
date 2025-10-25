# 🚀 Guía de Colaboración - Sistema RH

## 📌 Estado del Repositorio

### Ramas Activas por Módulo:

- **`produccion`** - Rama principal con código estable
- **`asistencias`** - Módulo de Asistencias ✅ **ACTUALIZADO**
- **`areas`** - Módulo de Áreas
- **`contratos`** - Módulo de Contratos
- **`incidencias`** - Módulo de Incidencias
- **`vacaciones`** - Módulo de Vacaciones

---

## 🔄 Últimas Actualizaciones

### ✨ Módulo de Asistencias (25 Oct 2025)

Se ha completado la implementación del módulo de Asistencias:

**Backend:**
- ✅ 9 endpoints REST API funcionales
- ✅ Controladores completos (asistencias.controllers.js)
- ✅ Rutas configuradas (asistencias.js)
- ✅ Integración con base de datos

**Frontend:**
- ✅ 5 vistas completas (Dashboard, Justificantes, 3 Reportes)
- ✅ Menú desplegable en sidebar
- ✅ Servicio API (asistenciasService.js)
- ✅ Composable Vue (useAsistencias.js)

**Base de Datos:**
- ✅ Scripts SQL listos
- ⏳ Pendiente: Ejecución por equipo de BD

**Documentación:**
- 📚 README_ASISTENCIAS.md
- 📋 GUIA_RAPIDA_ASISTENCIAS.md
- 📧 SOLICITUD_EQUIPO_BD.md

---

## 👥 Cómo Trabajar con tu Módulo

### Si trabajas en ASISTENCIAS:

```bash
# Ya está todo actualizado en GitHub
git checkout asistencias
git pull origin asistencias

# Tu rama ya tiene todos los cambios
```

### Si trabajas en OTRO MÓDULO (áreas, contratos, etc.):

```bash
# Cambiar a tu rama
git checkout <tu-rama>  # Ejemplo: git checkout areas

# Asegurarte de tener lo último
git pull origin <tu-rama>

# Trabajar normalmente en tu módulo
# NO tocar archivos del módulo de asistencias

# Cuando termines:
git add .
git commit -m "feat: Tu descripción"
git push origin <tu-rama>
```

---

## 🔀 Integrar Cambios de Asistencias en tu Módulo

Si necesitas los cambios del módulo de asistencias en tu rama:

```bash
# Estar en tu rama
git checkout <tu-rama>

# Traer los cambios de asistencias
git merge asistencias

# Si hay conflictos, resolverlos
# Luego:
git add .
git commit -m "merge: Integración módulo asistencias"
git push origin <tu-rama>
```

---

## ⚠️ IMPORTANTE: Archivos Compartidos

### Archivos que TODOS modificamos:

Estos archivos pueden tener conflictos al hacer merge:

1. **`src/backend/server.js`** - Todos agregamos nuestras rutas aquí
2. **`src/router/index.js`** - Todos agregamos nuestras rutas de frontend
3. **`src/components/Barra-Navegacion/sidebar.vue`** - Menú de navegación

### Cómo Evitar Conflictos:

#### En `server.js`:
Cada módulo agrega sus imports y rutas en su sección:

```javascript
// Asistencias
import asistenciasRoutes from './routes/asistencias.js';
app.use('/api', asistenciasRoutes);

// Tu módulo aquí
import tuModuloRoutes from './routes/tu-modulo.js';
app.use('/api', tuModuloRoutes);
```

#### En `router/index.js`:
Cada módulo agrega sus rutas:

```javascript
{
  path: '/TuModulo',
  name: 'TuModulo',
  component: () => import('../views/TuModulo/TuModuloView.vue')
}
```

#### En `sidebar.vue`:
Cada módulo puede agregar su menú desplegable siguiendo el patrón de Asistencias o Contratos.

---

## 🎯 Proceso de Integración a Producción

Cuando tu módulo esté listo:

1. **Asegúrate de que funcione en tu rama:**
   ```bash
   git checkout <tu-rama>
   npm run dev
   # Probar que todo funcione
   ```

2. **Avisa al equipo** que tu módulo está listo

3. **El líder del proyecto** hará el merge a `produccion`:
   ```bash
   git checkout produccion
   git merge <tu-rama>
   git push origin produccion
   ```

---

## 📊 Estado de Módulos

| Módulo | Rama | Estado | Backend | Frontend | BD |
|--------|------|--------|---------|----------|-----|
| Asistencias | `asistencias` | ✅ Completo | ✅ | ✅ | ⏳ |
| Áreas | `areas` | 🔨 En desarrollo | - | - | - |
| Contratos | `contratos` | 🔨 En desarrollo | - | - | - |
| Incidencias | `incidencias` | 🔨 En desarrollo | - | - | - |
| Vacaciones | `vacaciones` | 🔨 En desarrollo | - | - | - |

**Leyenda:**
- ✅ Completo
- 🔨 En desarrollo
- ⏳ Pendiente
- ❌ Bloqueado

---

## 🆘 Resolución de Conflictos

Si Git te muestra conflictos al hacer merge:

1. **Abre el archivo con conflicto**
2. **Busca las marcas:**
   ```
   <<<<<<< HEAD
   // Tu código
   =======
   // Código de la otra rama
   >>>>>>> asistencias
   ```
3. **Decide qué código mantener**
4. **Elimina las marcas**
5. **Guarda el archivo**
6. **Continúa el merge:**
   ```bash
   git add <archivo-resuelto>
   git commit
   ```

---

## 📞 Comunicación entre Equipos

### Antes de hacer cambios importantes:

1. **Avisar en el grupo** qué archivos vas a modificar
2. **Revisar** si otro equipo está trabajando en lo mismo
3. **Coordinar** cambios en archivos compartidos

### Archivos exclusivos por módulo:

Puedes trabajar libremente en:
- `src/backend/controllers/<tu-modulo>.controllers.js`
- `src/backend/routes/<tu-modulo>.js`
- `src/components/<TuModulo>/`
- `src/views/<TuModulo>/`
- `src/services/<tu-modulo>Service.js`
- `src/composables/use<TuModulo>.js`

---

## 🛠️ Comandos Útiles

```bash
# Ver en qué rama estás
git branch

# Ver todas las ramas
git branch -a

# Ver últimos commits
git log --oneline -5

# Ver cambios sin commit
git status

# Ver diferencias
git diff

# Descartar cambios locales
git restore <archivo>

# Traer últimos cambios sin merge
git fetch origin

# Ver qué cambió en otra rama
git diff <tu-rama> asistencias
```

---

## 📚 Recursos

- **Repositorio:** https://github.com/LXRDSZN/Sistema-Rh.git
- **Documentación Asistencias:** Ver `/src/backend/README_ASISTENCIAS.md`
- **Guía Rápida:** Ver `/GUIA_RAPIDA_ASISTENCIAS.md`

---

## ✅ Checklist para cada Módulo

- [ ] Backend implementado
- [ ] Frontend implementado
- [ ] Rutas agregadas a `server.js`
- [ ] Rutas agregadas a `router/index.js`
- [ ] Menú agregado a `sidebar.vue`
- [ ] Servicio API creado
- [ ] Composable creado (opcional)
- [ ] Scripts SQL para BD
- [ ] Documentación
- [ ] Probado localmente
- [ ] Push a tu rama
- [ ] Merge con otras ramas (si necesario)

---

**¡Éxito en tu desarrollo! 🚀**

Si tienes dudas, pregunta en el grupo antes de hacer cambios grandes.
