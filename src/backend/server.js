import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './models/db.js';
import authRoutes from './routes/auth.js';    
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 5000;

// Necesario para ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conexión a la base de datos MongoDB
await connectDB();

// Middleware para habilitar CORS
app.use(cors({
  origin: 'http://localhost:5173',       // URL de tu frontend
  credentials: true,                     // Permite enviar cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsear JSON en el body de las peticiones
app.use(express.json());
app.use(cookieParser());

// Servir carpeta "uploads" como estática
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Monta las rutas de autenticación en /api
app.use('/api', authRoutes);

// Inicia el servidor
app.listen(port, () => {
  console.log(`✅ Servidor corriendo en el puerto ${port}`);
});
