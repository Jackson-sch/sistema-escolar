import { gradosValoresPorNivel, niveles } from "@/lib/gradosPorNivel";
import { z } from "zod";

export const nivelAcademicoSchema = z
  .object({
    id: z.string().optional(), // El ID es opcional porque no está presente al crear
    nivel: z.enum(niveles, {
      errorMap: () => ({ message: "Nivel académico no válido" }),
    }),
    grado: z.string(),
    seccion: z.string().optional(),
  })
  .refine((data) => gradosValoresPorNivel[data.nivel].includes(data.grado), {
    message: "Grado académico no válido para el nivel seleccionado",
    path: ["grado"],
  });
