import { z } from "zod";

export const administrativoSchema = z.object({
  // Información Personal Básica (Obligatoria)
  name: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" })
    .max(100, { message: "El nombre debe tener máximo 100 caracteres" }),
  apellidoPaterno: z
    .string()
    .min(2, { message: "El apellido paterno es obligatorio" }),
  apellidoMaterno: z
    .string()
    .min(2, { message: "El apellido materno es obligatorio" }),
  dni: z
    .string()
    .min(8, { message: "El DNI debe tener 8 caracteres" })
    .max(8, { message: "El DNI debe tener 8 caracteres" }),
  email: z
    .string()
    .email({ message: "Ingrese un correo electrónico válido" })
    .min(5, { message: "El correo debe tener al menos 5 caracteres" }),
  telefono: z
    .string()
    .min(9, { message: "El teléfono debe tener 9 caracteres" })
    .max(9, { message: "El teléfono debe tener 9 caracteres" }),

  // Información Laboral (Obligatoria)
  cargo: z.string().min(1, { message: "El cargo es obligatorio" }),
  area: z.string().min(1, { message: "El área es obligatoria" }),
  fechaIngreso: z.date({ message: "La fecha de ingreso es obligatoria" }),
  estado: z.string().min(1, { message: "El estado es obligatorio" }),

  // Acceso al Sistema (solo para nuevos registros)
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }).optional(),
  /* confirmPassword: z.string().optional(), */

  // Información Personal Adicional (Opcional)
  fechaNacimiento: z.date().nullable().optional(),
  sexo: z.string().optional().nullable(),
  estadoCivil: z.string().optional().nullable(),
  nacionalidad: z.string().optional().nullable().default("PERUANA"),

  // Información de Contacto (Opcional)
  telefonoEmergencia: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  distrito: z.string().optional().nullable(),
  provincia: z.string().optional().nullable(),
  departamento: z.string().optional().nullable(),
  ubigeo: z.string().optional().nullable(),

  // Información Profesional (Opcional)
  titulo: z.string().optional().nullable(),
  numeroContrato: z.string().optional().nullable(),
  fechaContratacion: z.date().nullable().optional(),
  fechaSalida: z.date().nullable().optional(),

  // Campos automáticos
  role: z.enum(["administrativo", "director"]).default("administrativo"),
  institucionId: z.string({
    required_error: "La institución es requerida",
  }),
});

// Se eliminó la validación de confirmPassword ya que este campo ya no existe en el formulario

export default administrativoSchema;
