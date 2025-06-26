import { z } from "zod";

export const administrativoSchema = z.object({
  name: z.string().min(3, "El nombre es obligatorio"),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  dni: z
    .string()
    .regex(/^\d{8}$/, { message: "El DNI debe tener 8 dígitos numéricos" })
    .optional()
    .or(z.literal("")),
  fechaNacimiento: z
    .date({ required_error: "La fecha de nacimiento es obligatoria" })
    .optional(),
  direccion: z.string().optional().or(z.literal("")),
  telefono: z
    .string()
    .regex(/^\d{9}$/, { message: "El teléfono debe tener 9 dígitos numéricos" })
    .optional()
    .or(z.literal("")),
  cargo: z.string().min(1, "El cargo es obligatorio"),
  area: z.string().optional().or(z.literal("")),
  fechaIngreso: z
    .date({ required_error: "La fecha de ingreso es obligatoria" })
    .optional(),
  fechaSalida: z.date().optional().nullable(),
  estado: z.string().min(1, "El estado es obligatorio"),
  role: z.literal("administrativo"),
  institucionId: z.string({
    required_error: "La institución es requerida",
  }),
});

export default administrativoSchema;
