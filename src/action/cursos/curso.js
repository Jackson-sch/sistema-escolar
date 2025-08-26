"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cursoSchema } from "@/lib/validaciones/schemas/curso-schema";

export async function registerCurso(data) {
  try {
    // Validar datos con el esquema Zod
    const validationResult = cursoSchema.safeParse(data);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((error) => ({
        field: error.path[0],
        message: error.message,
      }));
      return { success: false, errors };
    }

    // Verificar si ya existe un curso con el mismo código en la misma área curricular
    const areaCurricular = await db.areaCurricular.findUnique({
      where: { id: data.areaCurricularId },
      select: { institucionId: true }
    });

    if (!areaCurricular) {
      return {
        success: false,
        errors: [
          {
            field: "areaCurricularId",
            message: "El área curricular seleccionada no existe",
          },
        ],
      };
    }

    // Verificar si ya existe un curso con el mismo código en el mismo año académico y nivel académico
    const existingCurso = await db.curso.findFirst({
      where: {
        codigo: data.codigo.toUpperCase(),
        anioAcademico: data.anioAcademico,
        nivelAcademicoId: data.nivelAcademicoId,
      },
    });

    if (existingCurso) {
      return {
        success: false,
        errors: [
          {
            field: "codigo",
            message: "Ya existe un curso con este código en el mismo nivel académico y año",
          },
        ],
      };
    }

    const newCurso = await db.curso.create({
      data: {
        nombre: data.nombre,
        codigo: data.codigo.toUpperCase(),
        descripcion: data.descripcion,
        nivel: data.nivel,
        grado: data.grado,
        anioAcademico: data.anioAcademico,
        horasSemanales: data.horasSemanales,
        creditos: data.creditos,
        areaCurricularId: data.areaCurricularId,
        nivelAcademicoId: data.nivelAcademicoId,
        profesorId: data.profesorId,
        activo: data.activo ?? true,
      },
    });
    
    // Revalidar rutas relevantes
    revalidatePath("/academico/cursos");
    revalidatePath("/config/estructura-academica");
    
    return { success: true, data: newCurso };
  } catch (error) {
    console.error("Error al crear curso:", error);
    return { 
      success: false, 
      errors: [{ field: "general", message: error.message || "Hubo un error al crear el curso" }]
    };
  }
}

export async function getCursos({ institucionId = null, profesorId = null } = {}) {
  try {
    const cursos = await db.curso.findMany({
      where: {
        // Si se proporciona institucionId, filtramos por cursos cuya área curricular pertenece a esa institución
        ...(institucionId ? { 
          areaCurricular: {
            institucionId: institucionId
          } 
        } : {}),
        // Si se proporciona profesorId, filtramos por cursos asignados a ese profesor
        ...(profesorId ? { profesorId: profesorId } : {}),
      },
      orderBy: [{ nombre: "asc" }],
      include: {
        profesor: {
          select: {
            id: true,
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            titulo: true,
            especialidad: true,
          },
        },
        areaCurricular: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            color: true,
            institucion: {
              select: {
                id: true,
                nombreInstitucion: true,
              },
            },
          },
        },
        nivelAcademico: {
          select: {
            id: true,
            nivel: true,
            grado: true,
          },
        },
      },
    });

    const formattedCursos = cursos.map((curso) => ({
      ...curso,
      profesorNombre: curso.profesor
        ? `${curso.profesor.name} ${curso.profesor.apellidoPaterno ?? ""} ${curso.profesor.apellidoMaterno ?? ""}`.trim()
        : "Sin asignar",
      areaCurricularNombre: curso.areaCurricular?.nombre || "Sin área",
      nivelAcademicoNombre: curso.nivelAcademico?.nivel || "Sin nivel específico",
      institucionNombre: curso.areaCurricular?.institucion?.nombreInstitucion || "Sin institución",
      institucionId: curso.areaCurricular?.institucion?.id || null,
      createdAt: curso.createdAt?.toISOString() ?? null,
      updatedAt: curso.updatedAt?.toISOString() ?? null,
    }));
    
    return { success: true, data: formattedCursos };
  } catch (error) {
    console.error("Error al obtener cursos:", error);
    return { success: false, error: "Error al obtener los cursos", data: [] };
  }
}

export async function deleteCurso(id) {
  try {
    // Verificar si el curso existe y tiene relaciones
    const curso = await db.curso.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            estudiantes: true,
            evaluaciones: true,
            notas: true,
            asistencias: true,
            horarios: true
          }
        }
      }
    });

    if (!curso) {
      return { success: false, errors: [{ field: "general", message: "El curso no existe" }] };
    }

    // Verificar si tiene relaciones que impidan eliminarlo
    const relacionesCount = 
      curso._count.estudiantes + 
      curso._count.evaluaciones + 
      curso._count.notas + 
      curso._count.asistencias;

    if (relacionesCount > 0) {
      return { 
        success: false, 
        errors: [{ 
          field: "general", 
          message: "No se puede eliminar el curso porque tiene estudiantes, evaluaciones, notas o asistencias asociadas" 
        }] 
      };
    }

    // Eliminar primero los horarios asociados
    if (curso._count.horarios > 0) {
      await db.horario.deleteMany({
        where: { cursoId: id }
      });
    }

    // Eliminar el curso
    await db.curso.delete({
      where: { id }
    });

    // Revalidar rutas relevantes
    revalidatePath("/academico/cursos");
    revalidatePath("/config/estructura-academica");
    
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar curso:", error);
    return { 
      success: false, 
      errors: [{ field: "general", message: error.message || "Hubo un error al eliminar el curso" }]
    };
  }
}

export async function updateCurso(data) {
  try {
    const { id, ...updateData } = data;
    
    // Validar datos con el esquema Zod
    const validationResult = cursoSchema.safeParse(updateData);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((error) => ({
        field: error.path[0],
        message: error.message,
      }));
      return { success: false, errors };
    }

    // Verificar si ya existe otro curso con el mismo código en el mismo nivel académico y año
    const existingCurso = await db.curso.findFirst({
      where: {
        codigo: updateData.codigo.toUpperCase(),
        anioAcademico: updateData.anioAcademico,
        nivelAcademicoId: updateData.nivelAcademicoId,
        id: { not: id },
      },
    });

    if (existingCurso) {
      return {
        success: false,
        errors: [
          {
            field: "codigo",
            message: "Ya existe otro curso con este código en el mismo nivel académico y año",
          },
        ],
      };
    }

    const updatedCurso = await db.curso.update({
      where: {
        id: id,
      },
      data: {
        nombre: updateData.nombre,
        codigo: updateData.codigo.toUpperCase(),
        descripcion: updateData.descripcion,
        nivel: updateData.nivel,
        grado: updateData.grado,
        anioAcademico: updateData.anioAcademico,
        horasSemanales: updateData.horasSemanales,
        creditos: updateData.creditos,
        areaCurricularId: updateData.areaCurricularId,
        nivelAcademicoId: updateData.nivelAcademicoId,
        profesorId: updateData.profesorId,
        activo: updateData.activo ?? true,
      },
    });
    
    // Revalidar rutas relevantes
    revalidatePath("/academico/cursos");
    revalidatePath("/config/estructura-academica");
    
    return { success: true, data: updatedCurso };
  } catch (error) {
    console.error("Error al actualizar curso:", error);
    return { 
      success: false, 
      errors: [{ field: "general", message: error.message || "Hubo un error al actualizar el curso" }]
    };
  }
}

/**
 * Obtiene los cursos asignados a un profesor específico
 * @param {string} profesorId - ID del profesor
 * @returns {Promise<Array>} - Array con los cursos del profesor
 */
export async function obtenerCursosPorProfesor(profesorId) {
  try {
    if (!profesorId) {
      return [];
    }

    const result = await getCursos({ profesorId });
    
    if (result.success) {
      return result.data;
    } else {
      console.error("Error al obtener cursos del profesor:", result.error);
      return [];
    }
  } catch (error) {
    console.error("Error al obtener cursos del profesor:", error);
    return [];
  }
}

/**
 * Obtiene los cursos en los que está matriculado un estudiante
 * @param {string} estudianteId - ID del estudiante
 * @returns {Promise<Array>} - Array con los cursos del estudiante
 */
export async function obtenerCursosPorEstudiante(estudianteId) {
  try {
    if (!estudianteId) {
      return [];
    }

    // Obtener las matrículas del estudiante
    const matriculas = await db.matricula.findMany({
      where: {
        estudianteId: estudianteId,
        activo: true
      },
      include: {
        curso: {
          include: {
            profesor: {
              select: {
                id: true,
                name: true,
                apellidoPaterno: true,
                apellidoMaterno: true,
                titulo: true,
                especialidad: true,
              },
            },
            areaCurricular: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
                color: true,
                institucion: {
                  select: {
                    id: true,
                    nombreInstitucion: true,
                  },
                },
              },
            },
            nivelAcademico: {
              select: {
                id: true,
                nivel: true,
                grado: true,
              },
            },
          },
        },
      },
    });

    // Extraer y formatear los cursos de las matrículas
    const cursos = matriculas.map(matricula => {
      const curso = matricula.curso;
      return {
        ...curso,
        profesorNombre: curso.profesor
          ? `${curso.profesor.name} ${curso.profesor.apellidoPaterno ?? ""} ${curso.profesor.apellidoMaterno ?? ""}`.trim()
          : "Sin asignar",
        areaCurricularNombre: curso.areaCurricular?.nombre || "Sin área",
        nivelAcademicoNombre: curso.nivelAcademico?.nivel || "Sin nivel específico",
        institucionNombre: curso.areaCurricular?.institucion?.nombreInstitucion || "Sin institución",
        institucionId: curso.areaCurricular?.institucion?.id || null,
        createdAt: curso.createdAt?.toISOString() ?? null,
        updatedAt: curso.updatedAt?.toISOString() ?? null,
      };
    });

    return cursos;
  } catch (error) {
    console.error("Error al obtener cursos del estudiante:", error);
    return [];
  }
}
