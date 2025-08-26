"use server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Esquema de validación para notas
const notaSchema = z.object({
  estudianteId: z.string().min(1, "El estudiante es obligatorio"),
  cursoId: z.string().min(1, "El curso es obligatorio"),
  evaluacionId: z.string().min(1, "La evaluación es obligatoria"),
  valor: z.coerce.number()
    .min(0, "La nota no puede ser menor a 0")
    .max(20, "La nota no puede ser mayor a 20"),
  valorLiteral: z.string().optional(),
  valorDescriptivo: z.string().optional(),
  comentario: z.string().optional(),
});

// Obtiene todas las notas según el rol del usuario
export async function getNotasPorProfesor() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = session.user.id;
  const userRole = session.user.role;

  // Si es administrador o director, ve todas las notas
  if (userRole === "administrativo") {
    return await db.nota.findMany({
      include: {
        estudiante: {
          select: { name: true },
        },
        curso: { select: { nombre: true, codigo: true } },
        evaluacion: { select: { nombre: true, tipo: true } },
      },
      orderBy: { fechaRegistro: "desc" },
    });
  }

  // Si es profesor, solo las de sus cursos
  const cursos = await db.curso.findMany({
    where: { profesorId: userId },
    select: { id: true },
  });
  const cursosIds = cursos.map((c) => c.id);
  if (cursosIds.length === 0) return [];

  return await db.nota.findMany({
    where: { cursoId: { in: cursosIds } },
    include: {
      estudiante: {
        select: { name: true },
      },
      curso: { select: { nombre: true, codigo: true } },
      evaluacion: { select: { nombre: true, tipo: true } },
    },
    orderBy: { fechaRegistro: "desc" },
  });
}

// Obtiene las notas de un estudiante específico
export async function getNotasPorEstudiante(estudianteId, periodoId = null) {
  if (!estudianteId) return [];

  // Construir la condición where base
  const whereCondition = { estudianteId };
  
  // Si se proporciona un periodoId, agregar filtro por periodo
  if (periodoId) {
    whereCondition.evaluacion = {
      periodoId: periodoId
    };
  }

  console.log('Buscando notas para estudiante:', estudianteId, 'periodo:', periodoId);
  console.log('Condición where:', whereCondition);

  return await db.nota.findMany({
    where: whereCondition,
    include: {
      estudiante: {
        select: {
          id: true,
          name: true,
          apellidoPaterno: true,
          apellidoMaterno: true
        }
      },
      curso: { 
        select: { 
          id: true,
          nombre: true, 
          codigo: true,
          nivelAcademico: {
            select: {
              seccion: true,
              grado: { select: { nombre: true } },
              nivel: { select: { nombre: true } }
            }
          } 
        } 
      },
      evaluacion: {
        select: {
          id: true,
          nombre: true,
          tipo: true,
          fecha: true,
          peso: true,
          periodo: {
            select: { id: true, nombre: true, tipo: true, numero: true }
          }
        }
      },
    },
    orderBy: [
      { curso: { nombre: "asc" } },
      { evaluacion: { fecha: "asc" } }
    ],
  });
}

// Obtiene una nota específica por su ID
export async function getNotaPorId(notaId) {
  if (!notaId) return null;

  try {
    const nota = await db.nota.findUnique({
      where: { id: notaId },
      include: {
        estudiante: {
          select: {
            id: true,
            name: true,
          }
        },
        curso: {
          select: {
            id: true,
            nombre: true
          }
        },
        evaluacion: {
          select: {
            id: true,
            nombre: true,
            tipo: true
          }
        }
      }
    });

    return nota;
  } catch (error) {
    console.error("Error al obtener nota por ID:", error);
    return null;
  }
}

// Obtiene las notas de un curso específico
export async function getNotasPorCurso(cursoId, periodoId = null) {
  if (!cursoId) return [];

  // Construir la condición where base
  const whereCondition = { cursoId };
  
  // Si se proporciona un periodoId, agregar filtro por periodo
  if (periodoId) {
    whereCondition.evaluacion = {
      periodoId: periodoId
    };
  }

  console.log('Buscando notas para curso:', cursoId, 'periodo:', periodoId);
  console.log('Condición where:', whereCondition);

  return await db.nota.findMany({
    where: whereCondition,
    include: {
      estudiante: {
        select: {
          id: true,
          name: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
          nivelAcademico: {
            select: {
              seccion: true,
              grado: { select: { nombre: true } }
            }
          }
        },
      },
      curso: { 
        select: { 
          id: true,
          nombre: true, 
          codigo: true,
          nivelAcademico: {
            select: {
              seccion: true,
              grado: { select: { nombre: true } },
              nivel: { select: { nombre: true } }
            }
          } 
        } 
      },
      evaluacion: {
        select: {
          id: true,
          nombre: true,
          tipo: true,
          fecha: true,
          peso: true,
          periodo: {
            select: { id: true, nombre: true, tipo: true, numero: true }
          }
        }
      },
    },
    orderBy: [
      { estudiante: { apellidoPaterno: "asc" } },
      { evaluacion: { fecha: "asc" } }
    ],
  });
}

// Obtiene las evaluaciones disponibles para un curso
export async function getEvaluacionesPorCurso(cursoId) {
  if (!cursoId) return [];

  return await db.evaluacion.findMany({
    where: {
      cursoId,
      activa: true
    },
    include: {
      periodo: {
        select: { nombre: true }
      }
    },
    orderBy: { fecha: "asc" },
  });
}

// Obtiene los estudiantes matriculados en un curso
export async function getEstudiantesPorCurso(cursoId) {
  if (!cursoId) return [];
  
  try {
    // Primero obtener la información del curso para conocer su nivelAcademicoId
    const curso = await db.curso.findUnique({
      where: { id: cursoId },
      select: {
        nivelAcademicoId: true,
        nivelAcademico: {
          select: {
            seccion: true,
            grado: { select: { nombre: true } },
            nivel: { select: { nombre: true } }
          }
        }
      }
    });

    if (!curso) {
      console.log('Curso no encontrado:', cursoId);
      return [];
    }

    // Obtener solo los estudiantes matriculados en este curso específico
    const matriculados = await db.matriculaCurso.findMany({
      where: {
        cursoId,
        estado: "activo"
      },
      include: {
        matricula: {
          include: {
            estudiante: {
              include: {
                nivelAcademico: {
                  include: {
                    grado: { select: { nombre: true } },
                    nivel: { select: { nombre: true } }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        matricula: {
          estudiante: {
            name: 'asc'
          }
        }
      }
    });

    console.log("Matriculados encontrados:", matriculados.length);
    console.log("Nivel académico del curso:", curso.nivelAcademico);

    // Transformar y filtrar los datos para obtener solo los estudiantes del nivel académico correcto
    const estudiantes = matriculados
      .filter(m => {
        // Verificar que la matrícula y estudiante existan
        if (!m.matricula || !m.matricula.estudiante) {
          return false;
        }
        
        // Filtrar por nivelAcademicoId del curso
        const estudianteNivelId = m.matricula.estudiante.nivelAcademicoId;
        const cursoNivelId = curso.nivelAcademicoId;
        
        console.log(`Estudiante ${m.matricula.estudiante.name}: nivelId=${estudianteNivelId}, cursoNivelId=${cursoNivelId}`);
        
        return estudianteNivelId === cursoNivelId;
      })
      .map(m => {
        const estudiante = m.matricula.estudiante;
        return {
          id: estudiante.id,
          name: estudiante.name || '',
          apellidoPaterno: estudiante.apellidoPaterno || '',
          apellidoMaterno: estudiante.apellidoMaterno || '',
          nombreCompleto: `${estudiante.name || ''} ${estudiante.apellidoPaterno || ''} ${estudiante.apellidoMaterno || ''}`.trim(),
          nivelAcademico: estudiante.nivelAcademico,
          codigoSiagie: estudiante.codigoSiagie
        };
      });

    console.log(`Estudiantes filtrados para curso ${cursoId}:`, estudiantes.length);
    return estudiantes;
    
  } catch (error) {
    console.error('Error al obtener estudiantes por curso:', error);
    return [];
  }
}

// Registra una nueva nota
export async function registrarNota(formData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "No autorizado" };
  }

  try {
    // Verificar que los datos requeridos estén presentes
    if (!formData.estudianteId || !formData.cursoId || !formData.evaluacionId) {
      return { error: "Faltan campos requeridos" };
    }

    // Preparar los datos para validación y asegurar que los campos opcionales sean strings vacíos en lugar de null
    const dataToValidate = {
      estudianteId: String(formData.estudianteId),
      cursoId: String(formData.cursoId),
      evaluacionId: String(formData.evaluacionId),
      valor: Number(formData.valor),
      valorLiteral: formData.valorLiteral === null ? "" : (formData.valorLiteral || ""),
      valorDescriptivo: formData.valorDescriptivo === null ? "" : (formData.valorDescriptivo || ""),
      comentario: formData.comentario === null ? "" : (formData.comentario || ""),
    };

    console.log("Datos a validar:", dataToValidate);

    // Validar los datos
    const validatedData = notaSchema.parse(dataToValidate);

    // Verificar si ya existe una nota para este estudiante y evaluación
    const notaExistente = await db.nota.findFirst({
      where: {
        estudianteId: validatedData.estudianteId,
        evaluacionId: validatedData.evaluacionId,
      },
    });

    if (notaExistente) {
      return { error: "Ya existe una nota registrada para este estudiante en esta evaluación" };
    }

    // Registrar la nota
    const nuevaNota = await db.nota.create({
      data: {
        ...validatedData,
        registradoPor: session.user.id,
      },
    });

    revalidatePath("/notas");
    return { success: "Nota registrada correctamente", data: nuevaNota };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: "Error al registrar la nota" };
  }
}

// Actualiza una nota existente (todos los campos)
export async function actualizarNota(id, formData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "No autorizado" };
  }

  try {
    // Validar los datos
    const validatedData = notaSchema.parse({
      estudianteId: formData.estudianteId,
      cursoId: formData.cursoId,
      evaluacionId: formData.evaluacionId,
      valor: formData.valor,
      valorLiteral: formData.valorLiteral || null,
      valorDescriptivo: formData.valorDescriptivo || null,
      comentario: formData.comentario || null,
    });

    // Verificar si existe la nota
    const notaExistente = await db.nota.findUnique({
      where: { id },
      include: { curso: true },
    });

    if (!notaExistente) {
      return { error: "La nota no existe" };
    }

    // Verificar permisos (solo el profesor del curso o un administrativo puede modificar)
    if (
      session.user.role !== "administrativo" &&
      notaExistente.curso.profesorId !== session.user.id
    ) {
      return { error: "No tienes permisos para modificar esta nota" };
    }

    // Actualizar la nota
    const notaActualizada = await db.nota.update({
      where: { id },
      data: {
        ...validatedData,
        modificadoPor: session.user.id,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/notas");
    return { success: "Nota actualizada correctamente", data: notaActualizada };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: "Error al actualizar la nota" };
  }
}

// Actualiza solo el valor y comentario de una nota (para edición rápida)
export async function actualizarValorNota(id, { valor, comentario }) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "No autorizado" };
  }

  try {
    // Validar los datos básicos
    if (valor === undefined || valor === null || isNaN(parseFloat(valor))) {
      return { error: "El valor de la nota es requerido y debe ser un número" };
    }

    // Verificar si existe la nota
    const notaExistente = await db.nota.findUnique({
      where: { id },
      include: { curso: true },
    });

    if (!notaExistente) {
      return { error: "La nota no existe" };
    }

    // Verificar permisos (solo el profesor del curso o un administrativo puede modificar)
    if (
      session.user.role !== "administrativo" &&
      notaExistente.curso.profesorId !== session.user.id
    ) {
      return { error: "No tienes permisos para modificar esta nota" };
    }

    // Actualizar solo el valor y comentario
    const notaActualizada = await db.nota.update({
      where: { id },
      data: {
        valor: parseFloat(valor),
        comentario: comentario || null,
        modificadoPor: session.user.id,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/notas");
    return { success: "Nota actualizada correctamente", data: notaActualizada };
  } catch (error) {
    console.error("Error al actualizar valor de nota:", error);
    return { error: "Error al actualizar la nota" };
  }
}

// Elimina una nota
export async function eliminarNota(id) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "No autorizado" };
  }

  try {
    // Verificar si existe la nota
    const notaExistente = await db.nota.findUnique({
      where: { id },
      include: { curso: true },
    });

    if (!notaExistente) {
      return { error: "La nota no existe" };
    }

    // Verificar permisos (solo el profesor del curso o un administrativo puede eliminar)
    if (
      session.user.role !== "administrativo" &&
      notaExistente.curso.profesorId !== session.user.id
    ) {
      return { error: "No tienes permisos para eliminar esta nota" };
    }

    // Eliminar la nota
    await db.nota.delete({
      where: { id },
    });

    revalidatePath("/notas");
    return { success: "Nota eliminada correctamente" };
  } catch (error) {
    return { error: "Error al eliminar la nota" };
  }
}

// Registra notas de forma masiva
export async function registrarNotasMasivas(formData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "No autorizado" };
  }

  try {
    const { cursoId, evaluacionId, periodoId, notas } = formData;

    console.log("Datos recibidos:", { cursoId, evaluacionId, periodoId, notas: notas?.length });

    if (!cursoId || !evaluacionId || !periodoId || !notas || !Array.isArray(notas)) {
      return { error: "Datos incompletos" };
    }

    // Verificar permisos (solo el profesor del curso o un administrativo puede registrar)
    const curso = await db.curso.findUnique({
      where: { id: cursoId },
    });

    if (!curso) {
      return { error: "El curso no existe" };
    }

    if (
      session.user.role !== "administrativo" &&
      curso.profesorId !== session.user.id
    ) {
      return { error: "No tienes permisos para registrar notas en este curso" };
    }

    // Verificar que la evaluación pertenezca al curso
    const evaluacion = await db.evaluacion.findFirst({
      where: {
        id: evaluacionId,
        cursoId
      },
    });

    if (!evaluacion) {
      return { error: "La evaluación no existe o no pertenece a este curso" };
    }

    // Registrar las notas
    const resultados = [];
    const errores = [];

    for (const notaData of notas) {
      try {
        console.log("Procesando nota para estudiante:", notaData.estudianteId, "valor:", notaData.valor);
        
        // Validar que el valor sea numérico
        const valorNumerico = parseFloat(notaData.valor);
        if (isNaN(valorNumerico) || valorNumerico < 0 || valorNumerico > 20) {
          errores.push({
            estudianteId: notaData.estudianteId,
            error: "El valor debe ser un número entre 0 y 20",
          });
          continue;
        }

        // Preparar datos para la nota
        const datosNota = {
          estudianteId: notaData.estudianteId,
          cursoId,
          evaluacionId,
          valor: valorNumerico,
          valorLiteral: notaData.valorLiteral || null,
          valorDescriptivo: notaData.valorDescriptivo || null,
          comentario: notaData.comentario || null,
        };

        // Verificar si ya existe una nota para este estudiante y evaluación
        const notaExistente = await db.nota.findFirst({
          where: {
            estudianteId: notaData.estudianteId,
            evaluacionId,
            cursoId,
          },
        });

        if (notaExistente) {
          // Actualizar la nota existente
          const notaActualizada = await db.nota.update({
            where: { id: notaExistente.id },
            data: {
              ...datosNota,
              modificadoPor: session.user.id,
              updatedAt: new Date(),
            },
          });

          console.log("Nota actualizada:", notaActualizada.id);
          
          resultados.push({
            estudianteId: notaData.estudianteId,
            accion: "actualizada",
            nota: notaActualizada,
          });
        } else {
          // Crear nueva nota
          const nuevaNota = await db.nota.create({
            data: {
              ...datosNota,
              registradoPor: session.user.id,
            },
          });

          console.log("Nota creada:", nuevaNota.id);

          resultados.push({
            estudianteId: notaData.estudianteId,
            accion: "creada",
            nota: nuevaNota,
          });
        }
      } catch (error) {
        console.error("Error procesando nota:", error);
        errores.push({
          estudianteId: notaData.estudianteId,
          error: error.message || "Error al procesar la nota",
        });
      }
    }

    console.log("Resultados finales:", { resultados: resultados.length, errores: errores.length });

    revalidatePath("/notas");
    return {
      success: true,
      message: `${resultados.length} notas registradas correctamente`,
      resultados,
      errores: errores.length > 0 ? errores : null,
    };
  } catch (error) {
    console.error("Error general en registrarNotasMasivas:", error);
    return { error: "Error al registrar las notas: " + error.message };
  }
}

// Obtiene el resumen de notas por curso y periodo
export async function getResumenNotasPorCurso(cursoId, periodoId) {
  if (!cursoId) return { estudiantes: {}, promedioGeneral: 0 };

  // Obtener información del curso
  const curso = await db.curso.findUnique({
    where: { id: cursoId },
    include: {
      nivelAcademico: {
        include: {
          nivel: true,
          grado: true
        }
      },
      areaCurricular: true,
      profesor: {
        select: {
          id: true,
          name: true,
          apellidoPaterno: true,
          apellidoMaterno: true
        }
      }
    }
  });

  // Formatear nombre del profesor
  if (curso?.profesor) {
    curso.profesor.nombre = `${curso.profesor.name} ${curso.profesor.apellidoPaterno} ${curso.profesor.apellidoMaterno || ''}`;
  }

  // Obtener información del periodo
  const periodo = periodoId ? await db.periodoAcademico.findUnique({
    where: { id: periodoId }
  }) : null;

  const evaluaciones = await db.evaluacion.findMany({
    where: {
      cursoId,
      ...(periodoId ? { periodoId } : {})
    },
    include: {
      notas: {
        include: {
          estudiante: {
            select: {
              id: true,
              name: true,
              apellidoPaterno: true,
              apellidoMaterno: true,
            }
          }
        }
      },
      periodo: {
        select: { nombre: true, anioEscolar: true }
      }
    },
    orderBy: { fecha: "asc" },
  });

  // Procesar los datos para obtener un resumen por estudiante
  const estudiantes = {};

  evaluaciones.forEach(evaluacion => {
    evaluacion.notas.forEach(nota => {
      const estudianteId = nota.estudiante.id;

      if (!estudiantes[estudianteId]) {
        estudiantes[estudianteId] = {
          id: estudianteId,
          nombre: nota.estudiante.name,
          notas: [],
          promedio: 0,
          promedioPonderado: 0
        };
      }

      estudiantes[estudianteId].notas.push({
        evaluacionId: evaluacion.id,
        evaluacionNombre: evaluacion.nombre,
        evaluacionTipo: evaluacion.tipo,
        periodoNombre: evaluacion.periodo.nombre,
        valor: nota.valor,
        peso: evaluacion.peso,
        comentario: nota.comentario
      });
    });
  });

  // Calcular promedios
  let sumaPromedios = 0;
  let cantidadEstudiantes = 0;
  
  Object.values(estudiantes).forEach(estudiante => {
    if (estudiante.notas.length > 0) {
      const sumaPonderada = estudiante.notas.reduce((sum, nota) => sum + (nota.valor * nota.peso), 0);
      const sumaPesos = estudiante.notas.reduce((sum, nota) => sum + nota.peso, 0);
      estudiante.promedioPonderado = sumaPesos > 0 ? +(sumaPonderada / sumaPesos).toFixed(2) : 0;
      estudiante.promedio = estudiante.promedioPonderado; // Para mantener compatibilidad
      
      sumaPromedios += estudiante.promedioPonderado;
      cantidadEstudiantes++;
    }
  });

  // Calcular promedio general
  const promedioGeneral = cantidadEstudiantes > 0 ? +(sumaPromedios / cantidadEstudiantes).toFixed(2) : 0;

  console.log("estudiantes", estudiantes);
  
  // Devolver estructura completa esperada por el componente
  return {
    curso,
    periodo,
    estudiantes,
    promedioGeneral
  };
}

export async function getCursosProfesor() {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await db.curso.findMany({
      where: {
        profesorId: session.user.id,
        activo: true
      },
      include: {
        nivelAcademico: {
          select: {
            seccion: true,
            grado: { select: { nombre: true } },
            nivel: { select: { nombre: true } }
          }
        },
        areaCurricular: { select: { nombre: true } }
      },
      orderBy: { nombre: "asc" },
    });
  } catch (error) {
    console.error('Error al obtener cursos del profesor:', error);
    return [];
  }
}

// Obtiene los periodos académicos activos
export async function getPeriodosActivos() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await db.periodoAcademico.findMany({
    where: { activo: true },
    orderBy: [
      { anioEscolar: "desc" },
      { numero: "asc" }
    ],
  });
}
