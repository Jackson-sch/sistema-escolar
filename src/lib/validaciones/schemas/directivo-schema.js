import { z } from "zod";

export const directivoSchema = z.object({
  // Información personal básica
  name: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" })
    .max(100, { message: "El nombre debe tener máximo 100 caracteres" }),
  apellidoPaterno: z.string().optional().nullable(),
  apellidoMaterno: z.string().optional().nullable(),
  email: z
    .string()
    .email({ message: "Ingrese un correo electrónico válido" })
    .min(5, { message: "El correo debe tener al menos 5 caracteres" })
    .max(100, { message: "El correo debe tener máximo 100 caracteres" }),
  dni: z
    .string()
    .min(8, { message: "El DNI debe tener 8 caracteres" })
    .max(8, { message: "El DNI debe tener 8 caracteres" }),
  fechaNacimiento: z.date().nullable().optional(),
  sexo: z.string().default("M"),
  estadoCivil: z.string().optional().nullable(),
  nacionalidad: z.string().optional().nullable().default("PERUANA"),
  
  // Información de contacto
  direccion: z.string().optional().nullable(),
  ubigeo: z.string().optional().nullable(),
  distrito: z.string().optional().nullable(),
  provincia: z.string().optional().nullable(),
  departamento: z.string().optional().nullable(),
  telefono: z
    .string()
    .min(9, { message: "El teléfono debe tener 9 caracteres" })
    .max(9, { message: "El teléfono debe tener 9 caracteres" })
    .optional()
    .nullable(),
  telefonoEmergencia: z.string().optional().nullable(),
  
  // Información profesional
  titulo: z.string().optional().nullable(),
  fechaContratacion: z.date().nullable().optional(),
  numeroContrato: z.string().optional().nullable(),
  area: z.string().optional().nullable(),
  fechaIngreso: z.date().nullable().optional(),
  fechaSalida: z.date().nullable().optional(),
  
  // Campos de estado y rol
  estado: z.string().default("activo"),
  cargo: z.enum(["director", "subdirector", "coordinador_academico", "coordinador_tutoria"]),
  role: z.string().default("director"),
  institucionId: z.string().min(1, { message: "La institución es requerida" }),
  
  // Campos para acceso al sistema
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }).optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // Si se proporciona password, confirmPassword debe coincidir
  if (data.password && data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  // Si no se proporciona password, no validar confirmPassword
  return true;
}, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});
