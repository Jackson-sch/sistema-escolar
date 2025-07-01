"use client";

import * as z from "zod";

// Esquema base para todos los usuarios
const baseSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  confirmPassword: z.string().optional(),
  apellidoPaterno: z.string().min(2, "El apellido paterno debe tener al menos 2 caracteres"),
  apellidoMaterno: z.string().min(2, "El apellido materno debe tener al menos 2 caracteres"),
  dni: z.string().min(8, "El DNI debe tener 8 dígitos").max(8, "El DNI debe tener 8 dígitos").optional().or(z.literal('')),
  fechaNacimiento: z.date().optional().nullable(),
  sexo: z.enum(["M", "F"]).optional().nullable(),
  direccion: z.string().optional().nullable(),
  telefono: z.string().optional().nullable(),
  estado: z.enum([
    "activo", "inactivo", "suspendido", "eliminado", "retirado", 
    "egresado", "licencia", "vacaciones", "trasladado", "graduado", 
    "condicional", "practicante", "jubilado", "expulsado"
  ]).default("activo"),
  role: z.enum(["profesor", "administrativo", "director"]),
});

// Aplicar la refinación para la validación de contraseñas
export const usuarioBaseSchema = baseSchema.refine(data => {
  // Si se proporciona password, confirmPassword debe coincidir
  if (data.password && data.confirmPassword !== data.password) {
    return false;
  }
  return true;
}, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

// Esquema específico para profesores
export const profesorSchema = baseSchema.extend({
  especialidad: z.string().optional().nullable(),
  titulo: z.string().optional().nullable(),
  colegioProfesor: z.string().optional().nullable(),
  fechaContratacion: z.date().optional().nullable(),
  tipoContrato: z.enum(["nombrado", "contratado", "practicante", "suplente"]).optional().nullable(),
  escalaMagisterial: z.enum(["I", "II", "III", "IV", "V", "VI", "VII", "VIII"]).optional().nullable(),
}).refine(data => {
  // Si se proporciona password, confirmPassword debe coincidir
  if (data.password && data.confirmPassword !== data.password) {
    return false;
  }
  return true;
}, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

// Esquema específico para administrativos
export const administrativoSchema = baseSchema.extend({
  cargo: z.enum([
    "administrador", "asistente", "auxiliar", "secretaria",
    "contador", "coordinador", "mantenimiento", "psicologia", "enfermeria"
  ]).optional().nullable(),
  area: z.string().optional().nullable(),
  fechaIngreso: z.date().optional().nullable(),
  numeroContrato: z.string().optional().nullable(),
}).refine(data => {
  // Si se proporciona password, confirmPassword debe coincidir
  if (data.password && data.confirmPassword !== data.password) {
    return false;
  }
  return true;
}, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

// Esquema específico para directores
export const directorSchema = baseSchema.extend({
  cargo: z.enum([
    "director", "subdirector", "coordinador_academico", "coordinador_tutoria"
  ]).optional().nullable(),
  titulo: z.string().optional().nullable(),
  colegioProfesor: z.string().optional().nullable(),
  fechaContratacion: z.date().optional().nullable(),
  numeroResolucion: z.string().optional().nullable(),
  escalaMagisterial: z.enum(["IV", "V", "VI", "VII", "VIII"]).optional().nullable(),
}).refine(data => {
  // Si se proporciona password, confirmPassword debe coincidir
  if (data.password && data.confirmPassword !== data.password) {
    return false;
  }
  return true;
}, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

// Función para obtener el esquema según el rol
export function getSchemaByRole(role) {
  switch (role) {
    case "profesor":
      return profesorSchema;
    case "administrativo":
      return administrativoSchema;
    case "director":
      return directorSchema;
    default:
      return usuarioBaseSchema;
  }
}
