import { niveles, gradosValoresPorNivel } from "@/lib/gradosPorNivel";
import * as z from "zod";

export const cursoSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres",
  }),
  codigo: z.string().min(2, {
    message: "El código debe tener al menos 2 caracteres",
  }).max(10, {
    message: "El código no debe exceder los 10 caracteres",
  }).toUpperCase(),
  descripcion: z.string().optional(),
  nivel: z.enum(["INICIAL", "PRIMARIA", "SECUNDARIA", "SUPERIOR_TECNOLOGICA", "SUPERIOR_PEDAGOGICA"], {
    required_error: "El nivel es requerido",
  }),
  grado: z.string().optional(),
  areaCurricularId: z.string({
    required_error: "El área curricular es requerida",
  }),
  profesorId: z.string({
    required_error: "El profesor es requerido",
  }),
  nivelAcademicoId: z.string().optional(),
  anioAcademico: z.coerce.number().int().min(2000, {
    message: "El año académico debe ser válido",
  }),
  creditos: z.coerce.number().int().min(0).optional(),
  horasSemanales: z.coerce.number().int().min(0).optional(),
  activo: z.boolean().default(true),
  // Eliminamos institucionId ya que no es parte directa del modelo Curso
  // La institución se obtiene a través del área curricular
}).refine((data) => {
  if (!data.nivel || !data.grado) return true;
  return gradosValoresPorNivel[data.nivel]?.includes(data.grado);
}, {
  message: "El grado no es válido para el nivel seleccionado",
  path: ["grado"],
});
