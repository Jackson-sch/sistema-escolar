"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Registra una nueva matrícula y asigna automáticamente todos los cursos del nivel académico
 */
export async function registerMatricula(data) {
  try {
    // Obtener el nivel académico para saber el nivel y grado
    const nivelAcademico = await db.nivelAcademico.findUnique({
      where: {
        id: data.nivelAcademicoId,
      },
    });

    if (!nivelAcademico) {
      return {
        success: false,
        errors: [
          {
            field: "nivelAcademicoId",
            message: "El nivel académico seleccionado no existe",
          },
        ],
      };
    }

    // Verificar si ya existe una matrícula para este estudiante en este año académico
    const existingMatricula = await db.matricula.findFirst({
      where: {
        estudianteId: data.estudianteId,
        anioAcademico: data.anioAcademico,
      },
    });

    if (existingMatricula) {
      return {
        success: false,
        errors: [
          {
            field: "general",
            message:
              "Ya existe una matrícula para este estudiante en este año académico",
          },
        ],
      };
    }

    // Obtener todos los cursos disponibles para este nivel y grado en este año académico
    const cursos = await db.curso.findMany({
      where: {
        nivel: nivelAcademico.nivel,
        grado: nivelAcademico.grado,
        anioAcademico: data.anioAcademico,
        activo: true,
      },
    });

    if (cursos.length === 0) {
      return {
        success: false,
        errors: [
          {
            field: "general",
            message: `No hay cursos disponibles para el nivel ${nivelAcademico.nivel} y grado ${nivelAcademico.grado} en el año académico ${data.anioAcademico}`,
          },
        ],
      };
    }

    // Crear la matrícula con todos los cursos asociados
    const matricula = await db.matricula.create({
      data: {
        estudianteId: data.estudianteId,
        anioAcademico: data.anioAcademico,
        nivel: nivelAcademico.nivel,
        estado: data.estado,
        // Crear las relaciones con los cursos
        cursos: {
          create: cursos.map((curso) => ({
            cursoId: curso.id,
            userId: data.estudianteId,
          })),
        },
      },
      include: {
        cursos: true,
      },
    });

    // Actualizar el nivel académico del estudiante
    await db.user.update({
      where: {
        id: data.estudianteId,
      },
      data: {
        nivelAcademicoId: data.nivelAcademicoId,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/matriculas");

    return {
      success: true,
      data: matricula,
    };
  } catch (error) {
    console.error("Error al registrar matrícula:", error);
    return {
      success: false,
      errors: [
        {
          field: "general",
          message: "Hubo un error al registrar la matrícula",
        },
      ],
    };
  }
}

/**
 * Actualiza una matrícula existente
 */
export async function updateMatricula({ id, ...data }) {
  try {
    // Obtener la matrícula existente
    const existingMatricula = await db.matricula.findUnique({
      where: {
        id,
      },
      include: {
        cursos: true,
      },
    });

    if (!existingMatricula) {
      return {
        success: false,
        errors: [
          {
            field: "general",
            message: "La matrícula no existe",
          },
        ],
      };
    }

    // Obtener el nivel académico
    const nivelAcademico = await db.nivelAcademico.findUnique({
      where: {
        id: data.nivelAcademicoId,
      },
    });

    if (!nivelAcademico) {
      return {
        success: false,
        errors: [
          {
            field: "nivelAcademicoId",
            message: "El nivel académico seleccionado no existe",
          },
        ],
      };
    }

    // Verificar si cambiaron el nivel académico o año académico
    const nivelCambio = nivelAcademico.nivel !== existingMatricula.nivel;
    const anioCambio = data.anioAcademico !== existingMatricula.anioAcademico;

    // Si cambió el nivel o año, actualizar los cursos
    if (nivelCambio || anioCambio) {
      // Eliminar todos los cursos asociados actuales
      await db.matriculaCurso.deleteMany({
        where: {
          matriculaId: id,
        },
      });

      // Obtener los nuevos cursos
      const nuevoCursos = await db.curso.findMany({
        where: {
          nivel: nivelAcademico.nivel,
          grado: nivelAcademico.grado,
          anioAcademico: data.anioAcademico,
          activo: true,
        },
      });

      if (nuevoCursos.length === 0) {
        return {
          success: false,
          errors: [
            {
              field: "general",
              message: `No hay cursos disponibles para el nivel ${nivelAcademico.nivel} y grado ${nivelAcademico.grado} en el año académico ${data.anioAcademico}`,
            },
          ],
        };
      }

      // Crear las nuevas relaciones de cursos
      for (const curso of nuevoCursos) {
        await db.matriculaCurso.create({
          data: {
            matriculaId: id,
            cursoId: curso.id,
            userId: data.estudianteId,
          },
        });
      }
    }

    // Actualizar la matrícula
    const matricula = await db.matricula.update({
      where: {
        id,
      },
      data: {
        estudianteId: data.estudianteId,
        anioAcademico: data.anioAcademico,
        nivel: nivelAcademico.nivel,
        estado: data.estado,
      },
    });

    // Actualizar el nivel académico del estudiante
    await db.user.update({
      where: {
        id: data.estudianteId,
      },
      data: {
        nivelAcademicoId: data.nivelAcademicoId,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/matriculas");

    return {
      success: true,
      data: matricula,
    };
  } catch (error) {
    console.error("Error al actualizar matrícula:", error);
    return {
      success: false,
      errors: [
        {
          field: "general",
          message: "Hubo un error al actualizar la matrícula",
        },
      ],
    };
  }
}

export async function getMatriculas() {
  try {
    const matriculas = await db.matricula.findMany({
      orderBy: [{ fechaMatricula: "desc" }],
      include: {
        estudiante: { select: { id: true, name: true, apellido: true } },
        // Incluye el responsable (padre/tutor) principal de la matrícula
        estudiante: {
          include: {
            padresTutores: {
              where: { contactoPrimario: true },
              include: { padreTutor: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });
    return matriculas.map((m) => ({
      ...m,
      estudianteNombre: m.estudiante
        ? `${m.estudiante.name} ${m.estudiante.apellido ?? ""}`.trim()
        : "",
      responsableNombre: m.estudiante.padresTutores[0]?.padreTutor?.name || "",
      fechaMatricula: m.fechaMatricula
        ? m.fechaMatricula.toISOString().slice(0, 10)
        : "",
    }));
  } catch (error) {
    console.error("Error al obtener matrículas:", error.message);
    return [];
  }
}


export async function deleteMatricula(id) {
  try {
    await db.matricula.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar matrícula:", error.message);
    return { success: false, errors: error.message };
  }
}
