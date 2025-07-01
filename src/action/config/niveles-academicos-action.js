"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Obtiene todos los niveles académicos de una institución
 * @param {string} institucionId - ID de la institución
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function getNivelesAcademicos(institucionId) {
  try {
    const nivelesAcademicos = await db.nivelAcademico.findMany({
      where: {
        institucionId,
        activo: true
      },
      orderBy: [
        { nivelId: 'asc' },
        { gradoId: 'asc' },
        { seccion: 'asc' }
      ],
      include: {
        nivel: true,
        grado: true,
        tutor: {
          select: {
            id: true,
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true
          }
        }
      }
    });

    return { success: true, data: nivelesAcademicos };
  } catch (error) {
    console.error("Error al obtener niveles académicos:", error);
    return { success: false, error: "Error al cargar los niveles académicos" };
  }
}

/**
 * Obtiene un nivel académico específico
 * @param {string} id - ID del nivel académico
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function getNivelAcademico(id) {
  try {
    const nivelAcademico = await db.nivelAcademico.findUnique({
      where: { id },
      include: {
        nivel: true,
        grado: true,
        tutor: {
          select: {
            id: true,
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true
          }
        }
      }
    });

    if (!nivelAcademico) {
      return { success: false, error: "Nivel académico no encontrado" };
    }

    return { success: true, data: nivelAcademico };
  } catch (error) {
    console.error("Error al obtener nivel académico:", error);
    return { success: false, error: "Error al cargar el nivel académico" };
  }
}
