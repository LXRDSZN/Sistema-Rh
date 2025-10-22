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
- **Express** - Framework web
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación mediante tokens
- **bcrypt** - Encriptación de contraseñas

## 🔧 Configuración

### Variables de Entorno

El sistema usa variables de entorno para configuración. Puedes crear un archivo `.env` con:

```env
# Servidor
PORT=5000
FRONTEND_URL=http://localhost:5173

# JWT
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=8h

# Base de datos AWS RDS
DB_USER=general_user
DB_HOST=basededatosrds1762.co1e4mase4yn.us-east-1.rds.amazonaws.com
DB_NAME=recursos_humanos_db
DB_PASSWORD=conBeto156079
DB_PORT=5432
```

### Conexión a Base de Datos

El sistema está configurado para conectarse a **AWS RDS PostgreSQL** en producción.

- **Host**: `basededatosrds1762.co1e4mase4yn.us-east-1.rds.amazonaws.com`
- **Base de datos**: `recursos_humanos_db`
- **Puerto**: 5432
- **SSL**: Habilitado

## 📝 Características

### Autenticación
- Login con email y contraseña
- Registro de nuevos usuarios
- Tokens JWT con expiración configurable
- Cookies HTTP-only para seguridad

### Autorización
- Sistema de roles (ADMIN, JEFE_RH, JEFE_AREA, EMPLEADO)
- Sistema de permisos granular
- Middlewares de protección de rutas

### Seguridad
- Contraseñas hasheadas con bcrypt
- Tokens JWT seguros
- CORS configurado
- Cookies HTTP-only
- Validación de esquemas

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

## 🧹 Limpieza y Organización

Este backend ha sido limpiado y organizado para:

✅ Eliminar archivos duplicados
✅ Centralizar configuraciones
✅ Mejorar la documentación
✅ Separar responsabilidades
✅ Facilitar el mantenimiento

## 📚 Próximos Pasos

- [ ] Agregar variables de entorno con dotenv
- [ ] Implementar logging con Winston o Morgan
- [ ] Agregar tests unitarios
- [ ] Implementar rate limiting
- [ ] Agregar documentación de API (Swagger)
