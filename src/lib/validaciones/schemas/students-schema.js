import * as z from "zod";
import { EstadoEstudiante } from "@/components/EstadoUsuarios";

const estudianteSchema = z.object({
  // Campos básicos del estudiante
  name: z
    .string()
    .min(2, {
      message: "El nombre debe tener al menos 2 caracteres.",
    })
    .trim(),

  email: z
    .string()
    .email({
      message: "Por favor ingrese un correo electrónico válido.",
    })
    .toLowerCase()
    .trim()
    .or(z.literal("")) // Permite string vacío
    .optional(),

  dni: z
    .string()
    .length(8, {
      message: "El DNI debe tener 8 dígitos.",
    })
    .regex(/^\d+$/, {
      message: "El DNI solo debe contener números.",
    }),
  
  sexo: z.enum(["M", "F"]),

  fechaNacimiento: z.date({
    required_error: "La fecha de nacimiento es requerida.",
  }),

  direccion: z
    .string()
    .min(5, {
      message: "La dirección debe tener al menos 5 caracteres.",
    })
    .trim(),

  telefono: z
    .string()
    .min(9, {
      message: "El teléfono debe tener al menos 9 dígitos.",
    })
    .regex(/^\d+$/, {
      message: "El teléfono solo debe contener números.",
    }).optional(),

  padreId: z.string({
    required_error: "Debe seleccionar un padre/tutor.",
  }),

  role: z.literal("estudiante"),

  estado: z.enum(EstadoEstudiante).default("activo"),

  institucionId: z.string({
    required_error: "La institución es requerida",
  }).optional(),

  // Nuevos campos para información académica
  procedencia: z.string().optional(),
  esPrimeraVez: z.boolean().optional().default(false),
  esRepitente: z.boolean().optional().default(false),

  // Nuevos campos para información médica
  tipoSangre: z.string().optional(),
  alergias: z.string().optional(),
  condicionesMedicas: z.string().optional(),

  // Nuevos campos para contacto de emergencia
  contactoEmergencia: z.string().optional(),
  telefonoEmergencia: z.string()
    .regex(/^\d+$/, {
      message: "El teléfono solo debe contener números.",
    })
    .optional(),

  // Nuevos campos para información socioeconómica
  viveConPadres: z.boolean().optional(),
  tipoVivienda: z.string().optional(),
  serviciosBasicos: z.string().optional(),
  transporteEscolar: z.boolean().default(false),
  becario: z.boolean().default(false),
  tipoBeca: z.string().optional(),
  programaSocial: z.string().optional(),

  // Códigos adicionales del estudiante
  codigoEstudiante: z.string().optional(),
  codigoSiagie: z.string().optional(),
});

export default estudianteSchema;
