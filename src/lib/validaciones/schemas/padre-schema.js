import { z } from "zod";

export const padreSchema = z.object({
  name: z.string().min(3, "El nombre es obligatorio"),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  dni: z
    .string()
    .regex(/^\d{8}$/, { message: "El DNI debe tener 8 dígitos numéricos" })
    .optional()
    .or(z.literal("")),
  direccion: z.string().optional().or(z.literal("")),
  telefono: z
    .string()
    .regex(/^\d{9}$/, { message: "El teléfono debe tener 9 dígitos numéricos" })
    .optional()
    .or(z.literal("")),
  ocupacion: z.string().optional().or(z.literal("")),
  lugarTrabajo: z.string().optional().or(z.literal("")),
  role: z.literal("padre"),
  institucionId: z.string({
    required_error: "La institución es requerida",
  }),
});

export default padreSchema;
