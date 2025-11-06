import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { connectDB } from './models/db.js';
import authRoutes from './routes/auth.js';
import empleadosRoutes from './routes/empleados.js';
import incidenciasRoutes from './routes/incidencias.js';
import uploadsRoutes from './routes/uploads.js';
import config from './config/config.js';

/**
 * SERVIDOR PRINCIPAL - Sistema de Recursos Humanos
 * 
 * Este archivo configura y arranca el servidor Express
 * con todos los middlewares y rutas necesarias.
 */

const app = express();

// ========== CONEXIÓN A BASE DE DATOS ==========
await connectDB();

// ========== MIDDLEWARES ==========

// CORS - Habilitar peticiones desde el frontend
app.use(cors({
  origin: config.server.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parsear JSON en el body de las peticiones
app.use(express.json());

// Parsear cookies
app.use(cookieParser());

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// ========== RUTAS ==========

// Rutas de autenticación
app.use('/api', authRoutes);

// Rutas de empleados
app.use('/api', empleadosRoutes);

// Rutas de incidencias
app.use('/api', incidenciasRoutes);

// Rutas de uploads
app.use('/api', uploadsRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ========== INICIAR SERVIDOR ==========
app.listen(config.server.port, () => {
  console.log('\n🚀 ===== SERVIDOR INICIADO =====');
  console.log(`✅ Servidor corriendo en el puerto ${config.server.port}`);
  console.log(`🌐 Frontend: ${config.server.frontendUrl}`);
  console.log(`🔌 API: http://localhost:${config.server.port}/api`);
  console.log('================================\n');
});

