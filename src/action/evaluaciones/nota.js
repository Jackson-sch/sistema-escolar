"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Esquema de validación para la creación y actualización de notas
const notaSchema = z.object({
  valor: z.number().min(0).max(20, { message: "La nota debe estar entre 0 y 20" }),
  valorLiteral: z.string().optional(),
  valorDescriptivo: z.string().optional(),
  comentario: z.string().optional(),
  estudianteId: z.string().min(1, { message: "Debe seleccionar un estudiante" }),
  cursoId: z.string().min(1, { message: "Debe seleccionar un curso" }),
  evaluacionId: z.string().min(1, { message: "Debe seleccionar una evaluación" })
});

// Esquema para notas masivas
const notasMasivasSchema = z.array(
  z.object({
    valor: z.number().min(0).max(20, { message: "La nota debe estar entre 0 y 20" }),
    valorLiteral: z.string().optional(),
    valorDescriptivo: z.string().optional(),
    comentario: z.string().optional(),
    estudianteId: z.string().min(1, { message: "Debe seleccionar un estudiante" })
  })
);

/**
 * Registra una nota para un estudiante en una evaluación
 * @param {Object} data - Datos de la nota
 * @returns {Promise<Object>} - Nota registrada o error
 */
export async function registrarNota(data) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return { error: "No autorizado" };
    }
    
    // Verificar si el usuario es profesor
    if (session.user.role !== "profesor") {
      return { error: "Solo los profesores pueden registrar notas" };
    }
    
    // Validar datos
    const validatedData = notaSchema.safeParse(data);
    
    if (!validatedData.success) {
      return { 
        error: "Datos inválidos", 
        fieldErrors: validatedData.error.flatten().fieldErrors 
      };
    }
    
    // Verificar que la evaluación pertenezca a un curso del profesor
    const evaluacion = await db.evaluacion.findFirst({
      where: {
        id: validatedData.data.evaluacionId,
        curso: {
          profesorId: session.user.id
        }
      },
      include: {
        curso: true
      }
    });
    
    if (!evaluacion) {
      return { error: "No tiene permiso para registrar notas en esta evaluación" };
    }
    
    // Verificar que el estudiante esté matriculado en el curso
    const matricula = await db.matriculaCurso.findFirst({
      where: {
        matricula: {
          estudianteId: validatedData.data.estudianteId
        },
        cursoId: validatedData.data.cursoId,
        estado: "activo"
      }
    });
    
    if (!matricula) {
      return { error: "El estudiante no está matriculado en este curso" };
    }
    
    // Verificar si ya existe una nota para este estudiante en esta evaluación
    const notaExistente = await db.nota.findFirst({
      where: {
        estudianteId: validatedData.data.estudianteId,
        evaluacionId: validatedData.data.evaluacionId
      }
    });
    
    let nota;
    
    if (notaExistente) {
      // Actualizar nota existente
      nota = await db.nota.update({
        where: { id: notaExistente.id },
        data: {
          ...validatedData.data,
          modificadoPor: session.user.id,
          updatedAt: new Date()
        }
      });
    } else {
      // Crear nueva nota
      nota = await db.nota.create({
        data: {
          ...validatedData.data,
          registradoPor: session.user.id
        }
      });
    }
    
    revalidatePath("/evaluaciones");
    
    return { 
      success: notaExistente ? "Nota actualizada exitosamente" : "Nota registrada exitosamente", 
      nota 
    };
  } catch (error) {
    console.error("Error al registrar nota:", error);
    return { error: "Error al registrar la nota" };
  }
}

/**
 * Registra notas masivamente para una evaluación
 * @param {string} evaluacionId - ID de la evaluación
 * @param {string} cursoId - ID del curso
 * @param {Array} notas - Array de notas a registrar
 * @returns {Promise<Object>} - Resultado de la operación
 */
export async function registrarNotasMasivas(evaluacionId, cursoId, notas) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return { error: "No autorizado" };
    }
    
    // Verificar si el usuario es profesor
    if (session.user.role !== "profesor") {
      return { error: "Solo los profesores pueden registrar notas" };
    }
    
    // Validar datos
    const validatedData = notasMasivasSchema.safeParse(notas);
    
    if (!validatedData.success) {
      return { 
        error: "Datos inválidos", 
        fieldErrors: validatedData.error.flatten().fieldErrors 
      };
    }
    
    // Verificar que la evaluación pertenezca a un curso del profesor
    const evaluacion = await db.evaluacion.findFirst({
      where: {
        id: evaluacionId,
        cursoId,
        curso: {
          profesorId: session.user.id
        }
      }
    });
    
    if (!evaluacion) {
      return { error: "No tiene permiso para registrar notas en esta evaluación" };
    }
    
    // Obtener la escala de calificación de la evaluación
    const escalaCalificacion = evaluacion.escalaCalificacion;
    
    // Procesar cada nota
    const resultados = [];
    
    for (const notaData of validatedData.data) {
      // Verificar que el estudiante esté matriculado en el curso
      const matricula = await db.matriculaCurso.findFirst({
        where: {
          matricula: {
            estudianteId: notaData.estudianteId
          },
          cursoId,
          estado: "activo"
        }
      });
      
      if (!matricula) {
        resultados.push({
          estudianteId: notaData.estudianteId,
          error: "El estudiante no está matriculado en este curso"
        });
        continue;
      }
      
      // Preparar datos de la nota según la escala de calificación
      const notaCompleta = {
        ...notaData,
        cursoId,
        evaluacionId,
        registradoPor: session.user.id
      };
      
      // Añadir valor literal según la escala
      if (escalaCalificacion === "LITERAL" && !notaData.valorLiteral) {
        notaCompleta.valorLiteral = convertirNotaALiteral(notaData.valor);
      }
      
      // Añadir valor descriptivo según la escala
      if (escalaCalificacion === "DESCRIPTIVA" && !notaData.valorDescriptivo) {
        notaCompleta.valorDescriptivo = convertirNotaADescriptivo(notaData.valor);
      }
      
      try {
        // Verificar si ya existe una nota para este estudiante en esta evaluación
        const notaExistente = await db.nota.findFirst({
          where: {
            estudianteId: notaData.estudianteId,
            evaluacionId
          }
        });
        
        let nota;
        
        if (notaExistente) {
          // Actualizar nota existente
          nota = await db.nota.update({
            where: { id: notaExistente.id },
            data: {
              ...notaCompleta,
              modificadoPor: session.user.id,
              updatedAt: new Date()
            }
          });
        } else {
          // Crear nueva nota
          nota = await db.nota.create({
            data: notaCompleta
          });
        }
        
        resultados.push({
          estudianteId: notaData.estudianteId,
          success: notaExistente ? "Nota actualizada" : "Nota registrada",
          nota
        });
      } catch (error) {
        console.error(`Error al procesar nota para estudiante ${notaData.estudianteId}:`, error);
        resultados.push({
          estudianteId: notaData.estudianteId,
          error: "Error al procesar la nota"
        });
      }
    }
    
    revalidatePath("/evaluaciones");
    
    return { 
      success: "Proceso de registro de notas completado", 
      resultados,
      estadisticas: {
        total: resultados.length,
        exitosos: resultados.filter(r => r.success).length,
        fallidos: resultados.filter(r => r.error).length
      }
    };
  } catch (error) {
    console.error("Error al registrar notas masivas:", error);
    return { error: "Error al registrar las notas" };
  }
}

/**
 * Elimina una nota
 * @param {string} id - ID de la nota
 * @returns {Promise<Object>} - Resultado de la operación
 */
export async function eliminarNota(id) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return { error: "No autorizado" };
    }
    
    // Verificar si el usuario es profesor
    if (session.user.role !== "profesor") {
      return { error: "Solo los profesores pueden eliminar notas" };
    }
    
    // Verificar que la nota pertenezca a una evaluación de un curso del profesor
    const nota = await db.nota.findFirst({
      where: {
        id,
        evaluacion: {
          curso: {
            profesorId: session.user.id
          }
        }
      },
      include: {
        evaluacion: true
      }
    });
    
    if (!nota) {
      return { error: "No tiene permiso para eliminar esta nota" };
    }
    
    // Eliminar nota
    await db.nota.delete({
      where: { id }
    });
    
    revalidatePath("/evaluaciones");
    
    return { success: "Nota eliminada exitosamente" };
  } catch (error) {
    console.error("Error al eliminar nota:", error);
    return { error: "Error al eliminar la nota" };
  }
}

/**
 * Obtiene todas las notas de un estudiante
 * @param {string} estudianteId - ID del estudiante
 * @returns {Promise<Array>} - Lista de notas
 */
export async function obtenerNotasPorEstudiante(estudianteId) {
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
    
    const notas = await db.nota.findMany({
      where: {
        estudianteId
      },
      include: {
        evaluacion: {
          include: {
            periodo: true
          }
        },
        curso: {
          select: {
            nombre: true,
            codigo: true,
            areaCurricular: {
              select: {
                nombre: true,
                codigo: true
              }
            }
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
          evaluacion: {
            fecha: 'asc'
          }
        }
      ]
    });
    
    return notas;
  } catch (error) {
    console.error("Error al obtener notas del estudiante:", error);
    return [];
  }
}

/**
 * Obtiene todas las notas de un curso
 * @param {string} cursoId - ID del curso
 * @returns {Promise<Array>} - Lista de notas
 */
export async function obtenerNotasPorCurso(cursoId) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return [];
    }
    
    // Si es profesor, verificar que el curso le pertenezca
    if (session.user.role === "profesor") {
      const curso = await db.curso.findFirst({
        where: {
          id: cursoId,
          profesorId: session.user.id
        }
      });
      
      if (!curso) {
        return [];
      }
    }
    
    const notas = await db.nota.findMany({
      where: {
        cursoId
      },
      include: {
        estudiante: {
          select: {
            id: true,
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            codigoEstudiante: true
          }
        },
        evaluacion: {
          include: {
            periodo: true
          }
        }
      },
      orderBy: [
        {
          estudiante: {
            apellidoPaterno: 'asc'
          }
        },
        {
          evaluacion: {
            fecha: 'asc'
          }
        }
      ]
    });
    
    return notas;
  } catch (error) {
    console.error("Error al obtener notas del curso:", error);
    return [];
  }
}

/**
 * Obtiene todas las notas de una evaluación
 * @param {string} evaluacionId - ID de la evaluación
 * @returns {Promise<Array>} - Lista de notas
 */
export async function obtenerNotasPorEvaluacion(evaluacionId) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return [];
    }
    
    // Si es profesor, verificar que la evaluación pertenezca a un curso suyo
    if (session.user.role === "profesor") {
      const evaluacion = await db.evaluacion.findFirst({
        where: {
          id: evaluacionId,
          curso: {
            profesorId: session.user.id
          }
        }
      });
      
      if (!evaluacion) {
        return [];
      }
    }
    
    const notas = await db.nota.findMany({
      where: {
        evaluacionId
      },
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
      },
      orderBy: {
        estudiante: {
          apellidoPaterno: 'asc'
        }
      }
    });
    
    return notas;
  } catch (error) {
    console.error("Error al obtener notas de la evaluación:", error);
    return [];
  }
}

/**
 * Obtiene el promedio de notas de un estudiante por curso
 * @param {string} estudianteId - ID del estudiante
 * @param {string} cursoId - ID del curso
 * @returns {Promise<Object>} - Promedio de notas
 */
export async function obtenerPromedioNotasEstudiante(estudianteId, cursoId) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return null;
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
          return null;
        }
      } else {
        return null;
      }
    }
    
    // Obtener todas las notas del estudiante en el curso
    const notas = await db.nota.findMany({
      where: {
        estudianteId,
        cursoId
      },
      include: {
        evaluacion: true
      }
    });
    
    if (notas.length === 0) {
      return {
        promedio: 0,
        promedioLiteral: "Sin notas",
        promedioDescriptivo: "Sin notas registradas",
        totalEvaluaciones: 0,
        evaluacionesCalificadas: 0
      };
    }
    
    // Calcular promedio ponderado
    let sumaPonderada = 0;
    let sumaPesos = 0;
    
    for (const nota of notas) {
      sumaPonderada += nota.valor * nota.evaluacion.peso;
      sumaPesos += nota.evaluacion.peso;
    }
    
    const promedio = sumaPesos > 0 ? sumaPonderada / sumaPesos : 0;
    
    // Obtener total de evaluaciones del curso
    const totalEvaluaciones = await db.evaluacion.count({
      where: {
        cursoId,
        activa: true
      }
    });
    
    return {
      promedio: Math.round(promedio * 10) / 10, // Redondear a 1 decimal
      promedioLiteral: convertirNotaALiteral(promedio),
      promedioDescriptivo: convertirNotaADescriptivo(promedio),
      totalEvaluaciones,
      evaluacionesCalificadas: notas.length
    };
  } catch (error) {
    console.error("Error al obtener promedio de notas:", error);
    return null;
  }
}

/**
 * Convierte una nota numérica a su equivalente literal (AD, A, B, C)
 * @param {number} nota - Nota numérica
 * @returns {string} - Nota literal
 */
function convertirNotaALiteral(nota) {
  if (nota >= 18) return "AD"; // Logro destacado
  if (nota >= 14) return "A";  // Logro esperado
  if (nota >= 11) return "B";  // En proceso
  return "C";                  // En inicio
}

/**
 * Convierte una nota numérica a su equivalente descriptivo
 * @param {number} nota - Nota numérica
 * @returns {string} - Descripción de la nota
 */
function convertirNotaADescriptivo(nota) {
  if (nota >= 18) return "Logro destacado";
  if (nota >= 14) return "Logro esperado";
  if (nota >= 11) return "En proceso";
  return "En inicio";
}
