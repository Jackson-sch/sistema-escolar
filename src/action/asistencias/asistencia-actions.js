"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Esquemas de validación
const AsistenciaSchema = z.object({
  estudianteId: z.string().min(1, "El estudiante es requerido"),
  cursoId: z.string().min(1, "El curso es requerido"),
  fecha: z.date(),
  estado: z.enum(["presente", "ausente", "tardanza", "justificado"], {
    errorMap: () => ({ message: "Estado de asistencia inválido" })
  }),
  horaLlegada: z.string().optional(),
  horaSalida: z.string().optional(),
  observaciones: z.string().optional(),
  justificacion: z.string().optional(),
  periodoAcademico: z.string().optional(),
});

const AsistenciasMasivasSchema = z.object({
  cursoId: z.string().min(1, "El curso es requerido"),
  fecha: z.date(),
  asistencias: z.array(z.object({
    estudianteId: z.string(),
    estado: z.enum(["presente", "ausente", "tardanza", "justificado"]),
    horaLlegada: z.string().optional(),
    observaciones: z.string().optional(),
  })),
});

// Registrar asistencia individual
export async function registrarAsistencia(data, registradoPorId) {
  try {
    const validatedData = AsistenciaSchema.parse({
      ...data,
      fecha: new Date(data.fecha),
    });

    // Verificar si ya existe una asistencia para este estudiante, curso y fecha
    const asistenciaExistente = await prisma.asistencia.findUnique({
      where: {
        estudianteId_cursoId_fecha: {
          estudianteId: validatedData.estudianteId,
          cursoId: validatedData.cursoId,
          fecha: validatedData.fecha,
        },
      },
    });

    if (asistenciaExistente) {
      return {
        success: false,
        error: "Ya existe un registro de asistencia para este estudiante en esta fecha y curso",
      };
    }

    // Calcular número de semana
    const fecha = validatedData.fecha;
    const inicioAño = new Date(fecha.getFullYear(), 0, 1);
    const semana = Math.ceil(((fecha - inicioAño) / 86400000 + inicioAño.getDay() + 1) / 7);

    const asistencia = await prisma.asistencia.create({
      data: {
        ...validatedData,
        registradoPorId,
        semana,
      },
      include: {
        estudiante: {
          select: {
            id: true,
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            codigoEstudiante: true,
          },
        },
        curso: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
          },
        },
      },
    });

    revalidatePath("/asistencias");
    return { success: true, data: asistencia };
  } catch (error) {
    console.error("Error al registrar asistencia:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Datos inválidos",
        details: error.errors,
      };
    }
    return {
      success: false,
      error: "Error interno del servidor",
    };
  }
}

// Registrar asistencias masivas (por curso/clase)
export async function registrarAsistenciasMasivas(data, registradoPorId) {
  try {
    const validatedData = AsistenciasMasivasSchema.parse({
      ...data,
      fecha: new Date(data.fecha),
    });

    console.log("Datos validados:", validatedData);

    // Preparar datos para inserción masiva según la estructura del modelo Asistencia
    const asistenciasData = validatedData.asistencias.map(asistencia => {
      // Convertir el estado (string) a los campos booleanos del modelo
      const presente = asistencia.estado === "presente";
      const tardanza = asistencia.estado === "tardanza";
      const justificada = asistencia.estado === "justificado";

      return {
        estudianteId: asistencia.estudianteId,
        cursoId: validatedData.cursoId,
        fecha: validatedData.fecha,
        presente: presente,
        tardanza: tardanza,
        justificada: justificada,
        horaLlegada: asistencia.horaLlegada || "",
        justificacion: asistencia.observaciones || "", // Usar observaciones como justificación
        registradoPorId: registradoPorId,
      };
    });

    console.log("Datos preparados para inserción:", asistenciasData[0]); // Log del primer elemento para debug

    // Usar transacción para insertar todas las asistencias
    const resultado = await prisma.$transaction(async (tx) => {
      // Eliminar asistencias existentes para esta fecha y curso
      await tx.asistencia.deleteMany({
        where: {
          cursoId: validatedData.cursoId,
          fecha: validatedData.fecha,
        },
      });

      // Insertar nuevas asistencias
      const asistenciasCreadas = await tx.asistencia.createMany({
        data: asistenciasData,
      });

      return asistenciasCreadas;
    });

    revalidatePath("/asistencias");
    return { success: true, data: resultado };
  } catch (error) {
    console.error("Error al registrar asistencias masivas:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Datos inválidos",
        details: error.errors,
      };
    }
    return {
      success: false,
      error: "Error interno del servidor",
    };
  }
}

// Obtener asistencias con filtros
export async function obtenerAsistencias(filtros = {}) {
  try {
    const {
      estudianteId,
      cursoId,
      fechaInicio,
      fechaFin,
      estado,
      institucionId,
      page = 1,
      limit = 50,
    } = filtros;

    const where = {};

    if (estudianteId) where.estudianteId = estudianteId;
    if (cursoId) where.cursoId = cursoId;

    // Convertir el filtro de estado a los campos booleanos del modelo
    if (estado) {
      switch (estado) {
        case "presente":
          where.presente = true;
          where.tardanza = false;
          break;
        case "ausente":
          where.presente = false;
          where.justificada = false;
          break;
        case "tardanza":
          where.tardanza = true;
          break;
        case "justificado":
          where.justificada = true;
          break;
      }
    }

    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) where.fecha.gte = new Date(fechaInicio);
      if (fechaFin) where.fecha.lte = new Date(fechaFin);
    }

    // Filtrar por institución a través del curso
    if (institucionId) {
      where.cursoId = {
        in: await prisma.curso.findMany({
          where: {
            OR: [
              // Caso 1: Curso relacionado directamente con institución
              {
                institucionId: institucionId
              },
              // Caso 2: Curso relacionado a través del área curricular
              {
                areaCurricular: {
                  institucionId: institucionId
                }
              }
            ]
          },
          select: {
            id: true
          }
        }).then(cursos => cursos.map(c => c.id))
      };
    }

    console.log("Filtros aplicados:", where);

    const [asistencias, total] = await Promise.all([
      prisma.asistencia.findMany({
        where,
        include: {
          estudiante: {
            select: {
              id: true,
              name: true,
              apellidoPaterno: true,
              apellidoMaterno: true,
              codigoEstudiante: true,
              image: true, // Agregar imagen del estudiante
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
                  seccion: true,
                },
              },
            },
          },
          curso: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
            },
          },
          registradoPor: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: [
          { fecha: "desc" },
          { estudiante: { apellidoPaterno: "asc" } },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.asistencia.count({ where }),
    ]);

    // Transformar los datos para que incluyan un campo "estado" para la interfaz
    const asistenciasConEstado = asistencias.map(a => {
      let estado = "ausente";
      if (a.presente && !a.tardanza) estado = "presente";
      else if (a.tardanza) estado = "tardanza";
      else if (a.justificada) estado = "justificado";
      
      // Procesar el campo registradoPor para evitar problemas de renderizado
      let registradoPorProcesado;
      
      if (!a.registradoPor) {
        registradoPorProcesado = null;
      } else {
        // Crear un objeto plano con solo las propiedades necesarias
        registradoPorProcesado = {
          id: a.registradoPor.id || '',
          name: a.registradoPor.name || '',
          email: a.registradoPor.email || '',
          apellidoPaterno: a.registradoPor.apellidoPaterno || '',
          apellidoMaterno: a.registradoPor.apellidoMaterno || '',
          image: a.registradoPor.image || null
        };
      }

      return {
        ...a,
        estado,
        observaciones: a.justificacion || "", // Mapear justificacion a observaciones para la interfaz
        registradoPor: registradoPorProcesado, // Usar la versión procesada
      };
    });

    return {
      success: true,
      data: {
        asistencias: asistenciasConEstado,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Error al obtener asistencias:", error);
    return {
      success: false,
      error: "Error interno del servidor",
    };
  }
}

// Obtener estudiantes de un curso para tomar asistencia
export async function obtenerEstudiantesCurso(cursoId) {
  try {
    const matriculaciones = await prisma.matriculaCurso.findMany({
      where: {
        cursoId,
        estado: "activo",
      },
      include: {
        matricula: {
          include: {
            estudiante: {
              select: {
                id: true,
                name: true,
                apellidoPaterno: true,
                apellidoMaterno: true,
                codigoEstudiante: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        matricula: {
          estudiante: {
            apellidoPaterno: "asc",
          },
        },
      },
    });

    // Extraer los datos de estudiantes de las matrículas
    const estudiantes = matriculaciones
      .map(m => m.matricula?.estudiante)
      .filter(Boolean); // Filtrar posibles valores nulos

    return {
      success: true,
      data: estudiantes,
    };
  } catch (error) {
    console.error("Error al obtener estudiantes del curso:", error);
    return {
      success: false,
      error: "Error interno del servidor",
    };
  }
}

// Obtener estadísticas de asistencia
export async function obtenerEstadisticasAsistencia(filtros = {}) {
  try {
    const {
      estudianteId,
      cursoId,
      fechaInicio,
      fechaFin,
      institucionId,
    } = filtros;

    const where = {};

    if (estudianteId) where.estudianteId = estudianteId;
    if (cursoId) where.cursoId = cursoId;

    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) where.fecha.gte = new Date(fechaInicio);
      if (fechaFin) where.fecha.lte = new Date(fechaFin);
    }

    if (institucionId) {
      where.curso = {
        areaCurricular: {
          institucionId: institucionId,
        },
      };
    }

    console.log("Filtros para estadísticas:", where);

    // Obtener todas las asistencias que cumplen con los filtros
    const asistencias = await prisma.asistencia.findMany({
      where,
      select: {
        id: true,
        presente: true,
        tardanza: true,
        justificada: true,
      },
    });

    console.log(`Total de registros encontrados: ${asistencias.length}`);

    // Calcular estadísticas manualmente
    let presente = 0;
    let ausente = 0;
    let tardanza = 0;
    let justificado = 0;

    asistencias.forEach(a => {
      if (a.presente && !a.tardanza) presente++;
      else if (a.tardanza) tardanza++;
      else if (a.justificada) justificado++;
      else ausente++;
    });

    const total = asistencias.length;

    const estadisticasFormateadas = {
      total,
      presente,
      ausente,
      tardanza,
      justificado,
    };

    // Calcular porcentajes
    estadisticasFormateadas.porcentajes = {
      presente: total > 0 ? ((presente / total) * 100).toFixed(1) : 0,
      ausente: total > 0 ? ((ausente / total) * 100).toFixed(1) : 0,
      tardanza: total > 0 ? ((tardanza / total) * 100).toFixed(1) : 0,
      justificado: total > 0 ? ((justificado / total) * 100).toFixed(1) : 0,
    };

    return {
      success: true,
      data: estadisticasFormateadas,
    };
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return {
      success: false,
      error: "Error interno del servidor",
    };
  }
}

// Actualizar asistencia
export async function actualizarAsistencia(id, data, registradoPorId) {
  try {
    const validatedData = AsistenciaSchema.partial().parse(data);

    const asistencia = await prisma.asistencia.update({
      where: { id },
      data: {
        ...validatedData,
        registradoPorId, // Actualizar quien modificó
      },
      include: {
        estudiante: {
          select: {
            id: true,
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            codigoEstudiante: true,
          },
        },
        curso: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
          },
        },
      },
    });

    revalidatePath("/asistencias");
    return { success: true, data: asistencia };
  } catch (error) {
    console.error("Error al actualizar asistencia:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Datos inválidos",
        details: error.errors,
      };
    }
    return {
      success: false,
      error: "Error interno del servidor",
    };
  }
}

// Eliminar asistencia
export async function eliminarAsistencia(id) {
  try {
    await prisma.asistencia.delete({
      where: { id },
    });

    revalidatePath("/asistencias");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar asistencia:", error);
    return {
      success: false,
      error: "Error interno del servidor",
    };
  }
}
