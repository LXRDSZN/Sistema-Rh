import { z } from 'zod';

export const signupSchema = z.object({
  usuario: z.string().min(3, 'Usuario muy corto'),
  email: z.string().email('Email inválido'),
  contrasena: z.string().min(6, 'Contraseña muy corta'),
});

// Schema flexible para registro desde Dashboard o SignUp
export const registerSchema = z.object({
  // Campos opcionales (formato SignUp simple)
  usuario: z.string().optional(),
  contrasena: z.string().optional(),
  
  // Campos opcionales (formato Dashboard completo)
  nombre: z.string().optional(),
  apellidoPaterno: z.string().optional(),
  apellidoMaterno: z.string().optional(),
  password: z.string().optional(),
  sexo: z.string().optional(),
  fechaNacimiento: z.string().optional(),
  rol: z.string().optional(),
  
  // Campo requerido en ambos formatos
  email: z.string().email('Email inválido'),
}).refine(
  (data) => {
    // Debe tener al menos uno de los formatos
    const tieneFormatoSimple = data.usuario && data.contrasena;
    const tieneFormatoCompleto = data.nombre && data.password;
    return tieneFormatoSimple || tieneFormatoCompleto;
  },
  {
    message: 'Debe proporcionar los datos de registro completos'
  }
);

export const loginSchema = z.object({
  usuario: z.string(),
  contrasena: z.string().min(6, 'Contraseña muy corta'),
});

