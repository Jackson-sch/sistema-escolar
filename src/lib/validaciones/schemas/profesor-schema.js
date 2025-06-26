import { EstadoProfesor } from "@/components/EstadoUsuarios";
import { z } from "zod";

// Definición del esquema de validación para User
export const profesorSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "El nombre debe tener al menos 2 caracteres.",
    }),

  email: z
    .string()
    .email({
      message: "Por favor ingrese un correo electrónico válido.",
    })
    .toLowerCase(),

  dni: z
    .string()
    .length(8, {
      message: "El DNI debe tener 8 dígitos.",
    })
    .regex(/^\d+$/, {
      message: "El DNI solo debe contener números.",
    }),

  fechaNacimiento: z.date({
    message: "La fecha de nacimiento es requerida.",
  }),

  direccion: z
    .string()
    .min(5, {
      message: "La dirección debe tener al menos 5 caracteres.",
    }),

  telefono: z
    .string()
    .min(9, {
      message: "El teléfono debe tener al menos 9 dígitos.",
    })
    .regex(/^\d+$/, {
      message: "El teléfono solo debe contener números.",
    }),
  role: z.literal("profesor"),
  especialidad: z.string({
    message: "La especialidad es requerida.",
  }),
  titulo: z.string({
    message: "El título es requerido.",
  }),
  fechaContratacion: z.date({
    message: "La fecha de contratación es requerida.",
  }).optional(),
  fechaIngreso: z.date({
    message: "La fecha de ingreso es requerida.",
  }),
  estado: z.enum(EstadoProfesor).default("activo"),
  institucionId: z.string({
    required_error: "La institución es requerida",
  }),
});
