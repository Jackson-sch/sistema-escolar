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
      include: { 
        nivel: true, 
        grado: true, 
        institucion: true 
      }
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

    // Obtener todos los cursos disponibles considerando todos los tipos de alcance
    const cursos = await db.curso.findMany({
      where: {
        anioAcademico: data.anioAcademico,
        activo: true,
        OR: [
          // Cursos específicos para esta sección
          { 
            alcance: "SECCION_ESPECIFICA",
            nivelAcademicoId: data.nivelAcademicoId 
          },
          // Cursos para todo el grado
          { 
            alcance: "TODO_EL_GRADO",
            gradoId: nivelAcademico.gradoId 
          },
          // Cursos para todo el nivel
          { 
            alcance: "TODO_EL_NIVEL",
            nivelId: nivelAcademico.nivelId 
          },
          // Cursos para toda la institución
          { 
            alcance: "TODO_LA_INSTITUCION",
            institucionId: nivelAcademico.institucionId 
          }
        ]
      },
    });

    if (cursos.length === 0) {
      return {
        success: false,
        errors: [
          {
            field: "general",
            message: `No hay cursos disponibles para la sección seleccionada en el año académico ${data.anioAcademico}`,
          },
        ],
      };
    }

    // Generar un número de matrícula único
    const currentYear = new Date().getFullYear();
    const randomPart = Math.floor(10000 + Math.random() * 90000); // Número aleatorio de 5 dígitos
    const numeroMatricula = `MAT-${currentYear}-${randomPart}`;
    
    // Crear la matrícula con todos los cursos asociados
    const matricula = await db.matricula.create({
      data: {
        numeroMatricula,
        estudianteId: data.estudianteId,
        nivelAcademicoId: data.nivelAcademicoId,
        anioAcademico: data.anioAcademico,
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
    // Obtener el nivel académico anterior para comparar
    const nivelAcademicoAnterior = await db.nivelAcademico.findUnique({
      where: {
        id: existingMatricula.nivelAcademicoId,
      },
    });
    
    // Comparar los niveles usando los objetos nivelAcademico
    const nivelCambio = nivelAcademico.id !== existingMatricula.nivelAcademicoId;
    const anioCambio = data.anioAcademico !== existingMatricula.anioAcademico;

    // Si cambió el nivel o año, actualizar los cursos
    if (nivelCambio || anioCambio) {
      // Eliminar todos los cursos asociados actuales
      await db.matriculaCurso.deleteMany({
        where: {
          matriculaId: id,
        },
      });

      // Obtener el nivel académico completo con sus relaciones
      const nivelAcademicoCompleto = await db.nivelAcademico.findUnique({
        where: {
          id: data.nivelAcademicoId,
        },
        include: { 
          nivel: true, 
          grado: true, 
          institucion: true 
        }
      });

      if (!nivelAcademicoCompleto) {
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

      // Obtener los nuevos cursos considerando todos los tipos de alcance
      const nuevoCursos = await db.curso.findMany({
        where: {
          anioAcademico: data.anioAcademico,
          activo: true,
          OR: [
            // Cursos específicos para esta sección
            { 
              alcance: "SECCION_ESPECIFICA",
              nivelAcademicoId: data.nivelAcademicoId 
            },
            // Cursos para todo el grado
            { 
              alcance: "TODO_EL_GRADO",
              gradoId: nivelAcademicoCompleto.gradoId 
            },
            // Cursos para todo el nivel
            { 
              alcance: "TODO_EL_NIVEL",
              nivelId: nivelAcademicoCompleto.nivelId 
            },
            // Cursos para toda la institución
            { 
              alcance: "TODO_LA_INSTITUCION",
              institucionId: nivelAcademicoCompleto.institucionId 
            }
          ]
        },
      });

      if (nuevoCursos.length === 0) {
        return {
          success: false,
          errors: [
            {
              field: "general",
              message: `No hay cursos disponibles para la sección seleccionada en el año académico ${data.anioAcademico}`,
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
        nivelAcademicoId: data.nivelAcademicoId,
        anioAcademico: data.anioAcademico,
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
        // Incluir el nivel académico con sus relaciones
        nivelAcademico: {
          include: {
            nivel: true,
            grado: true,
          },
        },
        // Incluir información del estudiante
        estudiante: { 
          select: { 
            id: true, 
            name: true, 
            padresTutores: {
              where: { contactoPrimario: true },
              include: { padreTutor: { select: { id: true, name: true } } },
            },
          }
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
      // Agregar información formateada del nivel académico
      nivelEducativo: m.nivelAcademico?.nivel?.nombre || "",
      gradoNombre: m.nivelAcademico?.grado?.nombre || "",
      seccion: m.nivelAcademico?.seccion || "",
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
