# Backend - Sistema de Recursos Humanos

Este es el backend del Sistema de Recursos Humanos desarrollado con Node.js, Express y PostgreSQL.

## 📁 Estructura del Proyecto

```
backend/
├── config/              # Configuraciones centralizadas
│   └── config.js       # Variables de entorno y configuración general
├── controllers/         # Lógica de negocio
│   └── auth.controllers.js
├── database/           # Scripts de base de datos
│   └── seeds/         # Scripts de inicialización
├── middleware/         # Middlewares personalizados
│   ├── authMiddleware.js    # Autenticación y autorización
│   ├── authSchemas.js       # Esquemas de validación
│   └── validateSchema.js    # Validador de esquemas
├── models/             # Modelos y conexión a BD
│   └── db.js          # Configuración de PostgreSQL
├── routes/            # Definición de rutas
│   └── auth.js       # Rutas de autenticación
└── server.js         # Punto de entrada del servidor
```

## 🚀 Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express 5** - Framework web
- **PostgreSQL** - Base de datos relacional en AWS RDS
- **pg (node-postgres)** - Cliente PostgreSQL con pool de conexiones
- **JWT (jsonwebtoken)** - Autenticación mediante tokens
- **cookie-parser** - Manejo de cookies HTTP
- **cors** - Cross-Origin Resource Sharing
- **zod** - Validación de esquemas y datos de entrada

## 🔧 Configuración

### Configuración centralizada

El sistema usa un archivo de configuración centralizado en `config/config.js` que gestiona todas las variables.

**Archivo:** `src/backend/config/config.js`

Las configuraciones incluyen:
- Puerto del servidor (5000)
- URL del frontend para CORS
- Secreto y expiración de JWT (8 horas)
- Configuración de cookies
- Credenciales de base de datos

### Conexión a Base de Datos

El sistema está configurado para conectarse a **AWS RDS PostgreSQL** en producción usando un **usuario con permisos limitados**.

**Configuración actual:**
- **Usuario**: `app_user` (permisos limitados, no superusuario)
- **Host**: `basededatosrds1762.co1e4mase4yn.us-east-1.rds.amazonaws.com`
- **Base de datos**: `recursos_humanos_db`
- **Puerto**: 5432
- **SSL**: Habilitado (rejectUnauthorized: false)

> 🛡️ **Seguridad:** Se usa un usuario de aplicación con permisos limitados (solo CRUD en tablas específicas) en lugar del superusuario, siguiendo mejores prácticas de seguridad.

## 📝 Características

### Autenticación
- Login con email y contraseña (texto plano temporalmente)
- Registro de nuevos usuarios
- Tokens JWT con expiración de 8 horas
- Cookies HTTP-only para almacenar tokens de forma segura
- Verificación de tokens en rutas protegidas

### Autorización
- Sistema de roles (ADMIN, JEFE_RH, JEFE_AREA, EMPLEADO)
- Sistema de permisos granular basado en BD
- Middlewares de protección de rutas
- Control de acceso por rol y por permiso específico

### Gestión de Empleados
- API REST completa para empleados
- Consulta de empleados con información de área y puesto
- Actualización de asignaciones de puesto
- Listado de áreas y puestos disponibles
- Integración con base de datos real (no mock data)

### Seguridad
- Tokens JWT seguros con secret configurable
- CORS configurado para frontend específico
- Cookies HTTP-only (no accesibles desde JavaScript)
- Validación de esquemas con Zod
- Usuario de BD con permisos limitados
- Queries parametrizadas (prevención de SQL injection)

## 🔐 Middlewares de Seguridad

### verificarToken
Verifica que el usuario esté autenticado.

```javascript
router.get('/ruta-protegida', verificarToken, controller);
```

### verificarPermiso
Verifica un permiso específico.

```javascript
router.get('/empleados', verificarToken, verificarPermiso('PERS_READ_ALL'), controller);
```

### verificarRol
Verifica que el usuario tenga un rol específico.

```javascript
router.post('/admin', verificarToken, verificarRol('ADMIN'), controller);
```

## 📊 Base de Datos

El sistema utiliza PostgreSQL con las siguientes características:

- Pool de conexiones
- Soporte para SSL (AWS RDS)
- Manejo de transacciones
- Queries parametrizadas para prevenir SQL injection

## 🏗️ Arquitectura

### Separación de Responsabilidades

- **Routes**: Definen endpoints y aplican middlewares
- **Controllers**: Contienen la lógica de negocio
- **Models**: Conexión y queries a la base de datos
- **Middleware**: Validación, autenticación y autorización
- **Config**: Configuraciones centralizadas

### Flujo de Request

```
Request → Routes → Middleware → Controller → Model → Database
                                     ↓
Response ← Controller ← Model ← Database
```

## 📡 Endpoints disponibles

### Autenticación (`/api`)
```
POST   /register    - Registrar nuevo usuario
POST   /login       - Iniciar sesión (retorna JWT en cookie)
POST   /logout      - Cerrar sesión (limpia cookie)
POST   /verify      - Verificar validez del token actual
```

### Empleados (`/api/empleados`)
```
GET    /               - Listar todos los empleados con área y puesto
GET    /:id            - Obtener empleado específico por ID
PUT    /:id            - Actualizar asignación de área/puesto
GET    /areas          - Listar todas las áreas disponibles
GET    /puestos        - Listar todos los puestos disponibles
```

## 🧹 Cambios recientes

### v1.0 - Refactorización y limpieza
✅ Migración de usuario de BD a `app_user` (permisos limitados)
✅ Eliminación de dependencias no utilizadas (bcrypt, bcryptjs, dotenv, aws-sdk)
✅ Centralización de configuraciones en `config/config.js`
✅ Reestructuración de controladores (auth, empleados)
✅ Conexión real a base de datos (eliminación de mock data)
✅ Implementación de API REST completa para empleados
✅ Mejora de documentación y estructura del proyecto
✅ Limpieza de archivos obsoletos

## 📚 Notas importantes

- **Contraseñas:** Actualmente se almacenan en texto plano (decisión temporal del equipo)
- **Permisos BD:** Usuario `app_user` solo tiene acceso CRUD limitado
- **JWT:** Tokens válidos por 8 horas, almacenados en cookies HTTP-only
- **CORS:** Configurado para `http://localhost:5173` (frontend)
- **SSL:** Conexión a AWS RDS con SSL habilitado
