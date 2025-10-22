import { Router } from "express";
import { login, register, logout, verifyToken } from "../controllers/auth.controllers.js";
import validateSchema from "../middleware/validateSchema.js";
import { verificarToken } from '../middleware/authMiddleware.js';
import { loginSchema, signupSchema } from "../middleware/authSchemas.js";

const router = Router();

// Rutas públicas (no requieren autenticación)
router.post("/login", validateSchema(loginSchema), login);
router.post("/register", validateSchema(signupSchema), register);
router.post("/auth/login", validateSchema(loginSchema), login); // Compatibilidad
router.post("/auth/signup", validateSchema(signupSchema), register); // Compatibilidad

// Rutas protegidas (requieren autenticación)
router.post("/logout", verificarToken, logout);
router.get("/verify", verifyToken);
router.get("/me", verificarToken, verifyToken);

export default router;


