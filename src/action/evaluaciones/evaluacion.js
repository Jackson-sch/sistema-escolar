"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Esquema de validación para la creación de evaluaciones
const evaluacionSchema = z.object({
  nombre: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  descripcion: z.string().optional(),
  tipo: z.enum(["DIAGNOSTICA", "FORMATIVA", "SUMATIVA", "RECUPERACION", "EXAMEN_FINAL", "TRABAJO_PRACTICO", "PROYECTO", "EXPOSICION"], {
    message: "Tipo de evaluación no válido"
  }),
  fecha: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Fecha no válida"
  }),
  fechaLimite: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Fecha límite no válida"
  }).optional(),
  peso: z.number().min(0).max(100, { message: "El peso debe estar entre 0 y 100" }),
  notaMinima: z.number().min(0).max(20, { message: "La nota mínima debe estar entre 0 y 20" }).optional(),
  escalaCalificacion: z.enum(["VIGESIMAL", "LITERAL", "DESCRIPTIVA"], {
    message: "Escala de calificación no válida"
  }),
  cursoId: z.string().min(1, { message: "Debe seleccionar un curso" }),
  periodoId: z.string().min(1, { message: "Debe seleccionar un periodo académico" }),
  activa: z.boolean().default(true),
  recuperable: z.boolean().default(false)
});

/**
 * Crea una nueva evaluación
 * @param {Object} data - Datos de la evaluación
 * @returns {Promise<Object>} - Evaluación creada o error
 */
export async function crearEvaluacion(data) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return { error: "No autorizado" };
    }
    
    // Verificar si el usuario es profesor
    if (session.user.role !== "profesor") {
      return { error: "Solo los profesores pueden crear evaluaciones" };
    }
    
    // Validar datos
    const validatedData = evaluacionSchema.safeParse(data);
    
    if (!validatedData.success) {
      return { 
        error: "Datos inválidos", 
        fieldErrors: validatedData.error.flatten().fieldErrors 
      };
    }
    
    // Verificar que el curso pertenezca al profesor
    const curso = await db.curso.findUnique({
      where: {
        id: validatedData.data.cursoId,
        profesorId: session.user.id
      }
    });
    
    if (!curso) {
      return { error: "No tiene permiso para crear evaluaciones en este curso" };
    }
    
    // Crear evaluación
    const evaluacion = await db.evaluacion.create({
      data: {
        ...validatedData.data,
        fecha: new Date(validatedData.data.fecha),
        fechaLimite: validatedData.data.fechaLimite ? new Date(validatedData.data.fechaLimite) : null
      }
    });
    
    revalidatePath("/evaluaciones");
    
    return { success: "Evaluación creada exitosamente", evaluacion };
  } catch (error) {
    console.error("Error al crear evaluación:", error);
    return { error: "Error al crear la evaluación" };
  }
}

/**
 * Actualiza una evaluación existente
 * @param {string} id - ID de la evaluación
 * @param {Object} data - Datos actualizados de la evaluación
 * @returns {Promise<Object>} - Evaluación actualizada o error
 */
export async function actualizarEvaluacion(id, data) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return { error: "No autorizado" };
    }
    
    // Validar datos
    const validatedData = evaluacionSchema.safeParse(data);
    
    if (!validatedData.success) {
      return { 
        error: "Datos inválidos", 
        fieldErrors: validatedData.error.flatten().fieldErrors 
      };
    }
    
    // Verificar que la evaluación exista y pertenezca a un curso del profesor
    const evaluacionExistente = await db.evaluacion.findFirst({
      where: {
        id,
        curso: {
          profesorId: session.user.id
        }
      },
      include: {
        curso: true
      }
    });
    
    if (!evaluacionExistente) {
      return { error: "No tiene permiso para modificar esta evaluación" };
    }
    
    // Verificar si ya hay notas registradas
    const notasExistentes = await db.nota.count({
      where: {
        evaluacionId: id
      }
    });
    
    // Si hay notas registradas, no permitir cambios en ciertos campos
    if (notasExistentes > 0) {
      const { tipo, escalaCalificacion, peso, notaMinima } = validatedData.data;
      
      // Verificar si se están cambiando campos críticos
      if (
        tipo !== evaluacionExistente.tipo ||
        escalaCalificacion !== evaluacionExistente.escalaCalificacion ||
        peso !== evaluacionExistente.peso ||
        notaMinima !== evaluacionExistente.notaMinima
      ) {
        return { 
          error: "No se pueden modificar el tipo, escala, peso o nota mínima porque ya hay calificaciones registradas" 
        };
      }
    }
    
    // Actualizar evaluación
    const evaluacion = await db.evaluacion.update({
      where: { id },
      data: {
        ...validatedData.data,
        fecha: new Date(validatedData.data.fecha),
        fechaLimite: validatedData.data.fechaLimite ? new Date(validatedData.data.fechaLimite) : null
      }
    });
    
    revalidatePath("/evaluaciones");
    
    return { success: "Evaluación actualizada exitosamente", evaluacion };
  } catch (error) {
    console.error("Error al actualizar evaluación:", error);
    return { error: "Error al actualizar la evaluación" };
  }
}

/**
 * Elimina una evaluación
 * @param {string} id - ID de la evaluación
 * @returns {Promise<Object>} - Resultado de la operación
 */
export async function eliminarEvaluacion(id) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return { error: "No autorizado" };
    }
    
    // Verificar que la evaluación exista y pertenezca a un curso del profesor
    const evaluacion = await db.evaluacion.findFirst({
      where: {
        id,
        curso: {
          profesorId: session.user.id
        }
      }
    });
    
    if (!evaluacion) {
      return { error: "No tiene permiso para eliminar esta evaluación" };
    }
    
    // Verificar si ya hay notas registradas
    const notasCount = await db.nota.count({
      where: {
        evaluacionId: id
      }
    });
    
    if (notasCount > 0) {
      return { error: "No se puede eliminar esta evaluación porque ya tiene calificaciones registradas" };
    }
    
    // Eliminar evaluación
    await db.evaluacion.delete({
      where: { id }
    });
    
    revalidatePath("/evaluaciones");
    
    return { success: "Evaluación eliminada exitosamente" };
  } catch (error) {
    console.error("Error al eliminar evaluación:", error);
    return { error: "Error al eliminar la evaluación" };
  }
}

/**
 * Obtiene todas las evaluaciones de un curso
 * @param {string} cursoId - ID del curso
 * @returns {Promise<Array>} - Lista de evaluaciones
 */
export async function obtenerEvaluacionesPorCurso(cursoId) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return [];
    }
    
    // Si es profesor, verificar que el curso le pertenezca
    let whereClause = { cursoId };
    
    if (session.user.role === "profesor") {
      whereClause = {
        cursoId,
        curso: {
          profesorId: session.user.id
        }
      };
    }
    
    const evaluaciones = await db.evaluacion.findMany({
      where: whereClause,
      include: {
        curso: {
          select: {
            nombre: true,
            codigo: true,
            profesor: {
              select: {
                name: true,
                apellidoPaterno: true,
                apellidoMaterno: true
              }
            }
          }
        },
        periodo: true
      },
      orderBy: {
        fecha: 'asc'
      }
    });
    
    return evaluaciones;
  } catch (error) {
    console.error("Error al obtener evaluaciones:", error);
    return [];
  }
}

/**
 * Obtiene todas las evaluaciones de un profesor
 * @param {string} profesorId - ID del profesor
 * @returns {Promise<Array>} - Lista de evaluaciones
 */
export async function obtenerEvaluacionesPorProfesor(profesorId) {
  try {
    const evaluaciones = await db.evaluacion.findMany({
      where: {
        curso: {
          profesorId
        }
      },
      include: {
        curso: {
          select: {
            nombre: true,
            codigo: true,
            nivelAcademico: {
              select: {
                nivel: {
                  select: {
                    nombre: true
                  }
                },
                grado: {
                  select: {
                    nombre: true
                  }
                },
                seccion: true
              }
            }
          }
        },
        periodo: true
      },
      orderBy: [
        {
          curso: {
            nombre: 'asc'
          }
        },
        {
          fecha: 'asc'
        }
      ]
    });
    
    return evaluaciones;
  } catch (error) {
    console.error("Error al obtener evaluaciones del profesor:", error);
    return [];
  }
}

/**
 * Obtiene todas las evaluaciones pendientes de un profesor
 * @returns {Promise<Array>} - Lista de evaluaciones pendientes
 */
export async function obtenerEvaluacionesPendientes() {
  try {
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== "profesor") {
      return [];
    }
    
    const hoy = new Date();
    const profesorId = session.user.id;
    
    // Obtener todas las evaluaciones del profesor que ya pasaron su fecha
    const evaluaciones = await db.evaluacion.findMany({
      where: {
        curso: {
          profesorId
        },
        fecha: {
          lt: hoy
        },
        activa: true
      },
      include: {
        curso: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            nivelAcademico: {
              select: {
                nivel: {
                  select: {
                    nombre: true
                  }
                },
                grado: {
                  select: {
                    nombre: true
                  }
                },
                seccion: true
              }
            },
            estudiantes: {
              select: {
                matricula: {
                  select: {
                    estudiante: {
                      select: {
                        id: true,
                        name: true,
                        apellidoPaterno: true,
                        apellidoMaterno: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        periodo: true,
        notas: true
      },
      orderBy: {
        fecha: 'asc'
      }
    });
    
    // Filtrar evaluaciones que tengan estudiantes sin calificar
    const evaluacionesPendientes = evaluaciones.filter(evaluacion => {
      const estudiantesTotal = evaluacion.curso.estudiantes.length;
      const estudiantesCalificados = evaluacion.notas.length;
      
      return estudiantesTotal > estudiantesCalificados;
    });
    
    return evaluacionesPendientes;
  } catch (error) {
    console.error("Error al obtener evaluaciones pendientes:", error);
    return [];
  }
}

/**
 * Obtiene una evaluación por su ID
 * @param {string} id - ID de la evaluación
 * @returns {Promise<Object|null>} - Evaluación o null
 */
export async function obtenerEvaluacionPorId(id) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return null;
    }
    
    const evaluacion = await db.evaluacion.findUnique({
      where: { id },
      include: {
        curso: {
          select: {
            nombre: true,
            codigo: true,
            profesor: {
              select: {
                name: true,
                apellidoPaterno: true,
                apellidoMaterno: true
              }
            },
            estudiantes: {
              select: {
                matricula: {
                  select: {
                    estudiante: {
                      select: {
                        id: true,
                        name: true,
                        apellidoPaterno: true,
                        apellidoMaterno: true,
                        codigoEstudiante: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        periodo: true,
        notas: {
          include: {
            estudiante: {
              select: {
                id: true,
                name: true,
                apellidoPaterno: true,
                apellidoMaterno: true,
                codigoEstudiante: true
              }
            }
          }
        }
      }
    });
    
    // Verificar permisos según el rol
    if (session.user.role === "profesor" && evaluacion?.curso?.profesor?.id !== session.user.id) {
      return null;
    }
    
    return evaluacion;
  } catch (error) {
    console.error("Error al obtener evaluación:", error);
    return null;
  }
}

/**
 * Obtiene todas las evaluaciones de un estudiante
 * @param {string} estudianteId - ID del estudiante
 * @returns {Promise<Array>} - Lista de evaluaciones
 */
export async function obtenerEvaluacionesPorEstudiante(estudianteId) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return [];
    }
    
    // Verificar permisos
    if (
      session.user.role !== "administrativo" && 
      session.user.role !== "profesor" && 
      session.user.id !== estudianteId
    ) {
      // Si es padre, verificar que el estudiante sea su hijo
      if (session.user.role === "padre") {
        const esHijo = await db.relacionFamiliar.findFirst({
          where: {
            padreTutorId: session.user.id,
            hijoId: estudianteId
          }
        });
        
        if (!esHijo) {
          return [];
        }
      } else {
        return [];
      }
    }
    
    // Obtener los cursos en los que está matriculado el estudiante
    const matriculas = await db.matriculaCurso.findMany({
      where: {
        matricula: {
          estudianteId
        },
        estado: "activo"
      },
      select: {
        cursoId: true
      }
    });
    
    const cursoIds = matriculas.map(m => m.cursoId);
    
    if (cursoIds.length === 0) {
      return [];
    }
    
    // Obtener las evaluaciones de esos cursos
    const evaluaciones = await db.evaluacion.findMany({
      where: {
        cursoId: {
          in: cursoIds
        }
      },
      include: {
        curso: {
          select: {
            nombre: true,
            codigo: true,
            profesor: {
              select: {
                name: true,
                apellidoPaterno: true,
                apellidoMaterno: true
              }
            }
          }
        },
        periodo: true,
        notas: {
          where: {
            estudianteId
          }
        }
      },
      orderBy: [
        {
          curso: {
            nombre: 'asc'
          }
        },
        {
          fecha: 'asc'
        }
      ]
    });
    
    return evaluaciones;
  } catch (error) {
    console.error("Error al obtener evaluaciones del estudiante:", error);
    return [];
  }
}

/**
 * Obtiene los periodos académicos activos
 * @returns {Promise<Array>} - Lista de periodos
 */
export async function obtenerPeriodosActivos() {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return [];
    }
    
    // Obtener el año académico actual
    const anioActual = new Date().getFullYear();
    
    const periodos = await db.periodoAcademico.findMany({
      where: {
        anioEscolar: anioActual,
        activo: true
      },
      orderBy: {
        numero: 'asc'
      }
    });
    
    return periodos;
  } catch (error) {
    console.error("Error al obtener periodos activos:", error);
    return [];
  }
}
