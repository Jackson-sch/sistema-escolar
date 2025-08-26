"use server";

import { db } from "@/lib/db";

export async function getRelacionFamiliar(id) {
  if (!id) return null;

  const relacion = await db.relacionFamiliar.findFirst({
    where: { hijoId: id, contactoPrimario: true },
    include: {
      padreTutor: true,
    },
  });

  return relacion?.padreTutor || null;
}

export async function getNumeroHijos(padreId) {
  if (!padreId) return 0;
  return await db.relacionFamiliar.count({ where: { padreTutorId: padreId } });
}

/**
 * Obtiene los hijos asociados a un padre/tutor
 * @param {Object} params - Parámetros de la consulta o ID del padre
 * @param {string} params.padreId - ID del padre/tutor
 * @param {string} params.institucionId - ID de la institución (opcional)
 * @param {boolean} params.formatoLegacy - Si es true, devuelve un array simple (para compatibilidad)
 * @returns {Promise<Object|Array>} - Resultado de la consulta
 */
export async function getHijosDePadre(params = {}) {
  // Compatibilidad con versiones anteriores que solo pasaban el padreId como string
  const padreId = typeof params === "string" ? params : params.padreId;
  const { institucionId, formatoLegacy = false } =
    typeof params === "object" ? params : {};

  if (!padreId) {
    return formatoLegacy
      ? []
      : {
          success: false,
          error: "ID del padre/tutor es requerido",
        };
  }

  try {
    // Consultar las relaciones familiares donde el usuario es padre/tutor
    const relacionesFamiliares = await db.relacionFamiliar.findMany({
      where: {
        padreTutorId: padreId,
        // Si se proporciona institucionId, filtrar por institución
        ...(institucionId
          ? {
              hijo: {
                institucionId,
              },
            }
          : {}),
      },
      include: {
        hijo: {
          select: {
            id: true,
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            codigoEstudiante: true,
            dni:
            image: true,
            nivelAcademicoId: true,
            nivelAcademico: {
              select: {
                id: true,
                seccion: true,
                nivel: {
                  select: {
                    id: true,
                    nombre: true,
                  },
                },
                grado: {
                  select: {
                    id: true,
                    nombre: true,
                  },
                },
              },
            },
            institucion: {
              select: {
                id: true,
                nombreInstitucion: true,
              },
            },
          },
        },
      },
    });

    // Formatear los datos para devolver solo la información de los hijos
    const hijos = relacionesFamiliares.map((relacion) => ({
      ...relacion.hijo,
      parentesco: relacion.parentesco,
      contactoPrimario: relacion.contactoPrimario,
    }));

    // Devolver en formato legacy o nuevo formato
    return formatoLegacy
      ? hijos
      : {
          success: true,
          data: hijos,
        };
  } catch (error) {
    console.error("Error al obtener hijos del padre:", error);
    return formatoLegacy
      ? []
      : {
          success: false,
          error: "Error al obtener la lista de hijos",
        };
  }
}

export async function getStudentParent(estudianteId) {
  if (!estudianteId) return null;
  // Busca la relación familiar donde el hijo es el estudiante y el contacto primario es true
  const relacion = await db.relacionFamiliar.findFirst({
    where: { hijoId: estudianteId, contactoPrimario: true },
    include: { padreTutor: true },
  });
  if (relacion && relacion.padreTutor) {
    return { id: relacion.padreTutor.id, name: relacion.padreTutor.name };
  }
  return null;
}
