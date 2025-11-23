import { Router } from "express";
import { login, register, logout, verifyToken, changePassword } from "../controllers/auth.controllers.js";
import validateSchema from "../middleware/validateSchema.js";
import { verificarToken } from '../middleware/authMiddleware.js';
import { loginSchema, signupSchema, registerSchema } from "../middleware/authSchemas.js";

const router = Router();

// Rutas públicas (no requieren autenticación)
router.post("/login", validateSchema(loginSchema), login);
router.post("/register", validateSchema(registerSchema), register); // Schema flexible
router.post("/auth/login", validateSchema(loginSchema), login); // Compatibilidad
router.post("/auth/signup", validateSchema(signupSchema), register); // Schema simple

// Rutas protegidas (requieren autenticación)
router.post("/logout", verificarToken, logout);
router.get("/verify", verifyToken);
router.get("/me", verificarToken, verifyToken);
router.post("/change-password", verificarToken, changePassword);
// Ruta protegida para registro desde Dashboard (con área automática)
router.post("/register-dashboard", verificarToken, validateSchema(registerSchema), register);

export default router;


