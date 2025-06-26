// lib/validaciones/schemas/matricula-schema.js
import { z } from "zod";

export const matriculaSchema = z.object({
  estudianteId: z.string({
    required_error: "El estudiante es obligatorio",
  }),
  nivelAcademicoId: z.string({
    required_error: "El nivel académico (grado y sección) es obligatorio",
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
});