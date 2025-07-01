// lib/validaciones/schemas/matricula-schema.js
import { z } from "zod";

export const matriculaSchema = z.object({
  estudianteId: z.string({
    required_error: "El estudiante es obligatorio",
  }),
  // Campo para el grado (usado solo en el frontend)
  gradoId: z.string({
    required_error: "El grado es obligatorio",
  }),
  nivelAcademicoId: z.string({
    required_error: "La sección es obligatoria",
  }),
  anioAcademico: z.number({
    required_error: "El año académico es obligatorio",
  }).int().min(2023, {
    message: "El año académico debe ser mayor o igual a 2023",
  }).max(2030, {
    message: "El año académico debe ser menor o igual a 2030",
  }),
  responsableId: z.string({
    required_error: "El responsable es obligatorio",
  }),
  estado: z.string({
    required_error: "El estado es obligatorio",
  }),
}).transform((data) => {
  // Eliminar gradoId antes de enviar al servidor
  // ya que este campo es solo para el frontend
  const { gradoId, ...rest } = data;
  return rest;
});