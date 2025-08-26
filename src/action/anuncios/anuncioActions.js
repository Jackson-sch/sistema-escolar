"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Esquema de validación para anuncios
const anuncioSchema = z.object({
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  contenido: z.string().min(10, "El contenido debe tener al menos 10 caracteres"),
  resumen: z.string().optional().nullable(),
  imagen: z.string().optional().nullable(),
  fechaPublicacion: z.coerce.date(),
  fechaExpiracion: z.coerce.date().optional().nullable(),
  activo: z.boolean().default(true),
  dirigidoA: z.string(),
  niveles: z.array(z.string()).optional(),
  grados: z.array(z.string()).optional(),
  importante: z.union([z.boolean(), z.string().transform(val => val === 'true')]).default(false),
  urgente: z.union([z.boolean(), z.string().transform(val => val === 'true')]).default(false),
  fijado: z.union([z.boolean(), z.string().transform(val => val === 'true')]).default(false),
});

/**
 * Registra un nuevo anuncio
 * @param {Object} data - Datos del anuncio
 * @returns {Promise<Object>} - Anuncio creado
 */
export async function registrarAnuncio(data) {
  try {
    // Validar datos
    const validatedData = anuncioSchema.parse(data);
    
    // Crear anuncio
    const anuncio = await db.anuncio.create({
      data: {
        titulo: validatedData.titulo,
        contenido: validatedData.contenido,
        resumen: validatedData.resumen,
        imagen: validatedData.imagen,
        fechaPublicacion: validatedData.fechaPublicacion,
        fechaExpiracion: validatedData.fechaExpiracion,
        activo: validatedData.activo,
        dirigidoA: validatedData.dirigidoA,
        importante: validatedData.importante,
        urgente: validatedData.urgente,
        fijado: validatedData.fijado,
        autor: {
          connect: { id: data.autorId }
        },
        ...(validatedData.niveles && validatedData.niveles.length > 0 && {
          niveles: {
            connect: validatedData.niveles.map(id => ({ id }))
          }
        }),
        ...(validatedData.grados && validatedData.grados.length > 0 && {
          grados: {
            connect: validatedData.grados.map(id => ({ id }))
          }
        }),
      }
    });

    revalidatePath("/comunicaciones/anuncios");
    return { success: true, anuncio };
  } catch (error) {
    console.error("Error al registrar anuncio:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    return { success: false, error: error.message || "Error al registrar anuncio" };
  }
}

/**
 * Actualiza un anuncio existente
 * @param {String} id - ID del anuncio
 * @param {Object} data - Datos actualizados
 * @returns {Promise<Object>} - Anuncio actualizado
 */
export async function actualizarAnuncio(id, data) {
  try {
    // Validar datos
    const validatedData = anuncioSchema.parse(data);
    
    // Desconectar relaciones existentes si es necesario
    if (validatedData.niveles || validatedData.grados) {
      // Obtener relaciones actuales
      const anuncioActual = await db.anuncio.findUnique({
        where: { id },
        include: {
          niveles: true,
          grados: true
        }
      });
      
      // Preparar desconexiones
      const disconnectNiveles = anuncioActual?.niveles?.map(nivel => ({ id: nivel.id })) || [];
      const disconnectGrados = anuncioActual?.grados?.map(grado => ({ id: grado.id })) || [];
      
      // Desconectar relaciones existentes
      if (disconnectNiveles.length > 0) {
        await db.anuncio.update({
          where: { id },
          data: {
            niveles: {
              disconnect: disconnectNiveles
            }
          }
        });
      }
      
      if (disconnectGrados.length > 0) {
        await db.anuncio.update({
          where: { id },
          data: {
            grados: {
              disconnect: disconnectGrados
            }
          }
        });
      }
    }
    
    // Actualizar anuncio
    const anuncio = await db.anuncio.update({
      where: { id },
      data: {
        titulo: validatedData.titulo,
        contenido: validatedData.contenido,
        resumen: validatedData.resumen,
        imagen: validatedData.imagen,
        fechaPublicacion: validatedData.fechaPublicacion,
        fechaExpiracion: validatedData.fechaExpiracion,
        activo: validatedData.activo,
        dirigidoA: validatedData.dirigidoA,
        importante: validatedData.importante,
        urgente: validatedData.urgente,
        fijado: validatedData.fijado,
        ...(validatedData.niveles && validatedData.niveles.length > 0 && {
          niveles: {
            connect: validatedData.niveles.map(id => ({ id }))
          }
        }),
        ...(validatedData.grados && validatedData.grados.length > 0 && {
          grados: {
            connect: validatedData.grados.map(id => ({ id }))
          }
        }),
      }
    });

    revalidatePath("/comunicaciones/anuncios");
    return { success: true, anuncio };
  } catch (error) {
    console.error("Error al actualizar anuncio:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    return { success: false, error: error.message || "Error al actualizar anuncio" };
  }
}

/**
 * Elimina un anuncio
 * @param {String} id - ID del anuncio
 * @returns {Promise<Object>} - Resultado de la operación
 */
export async function eliminarAnuncio(id) {
  try {
    // Desconectar relaciones antes de eliminar
    const anuncioActual = await db.anuncio.findUnique({
      where: { id },
      include: {
        niveles: true,
        grados: true
      }
    });
    
    // Preparar desconexiones
    const disconnectNiveles = anuncioActual?.niveles?.map(nivel => ({ id: nivel.id })) || [];
    const disconnectGrados = anuncioActual?.grados?.map(grado => ({ id: grado.id })) || [];
    
    // Desconectar relaciones existentes
    if (disconnectNiveles.length > 0) {
      await db.anuncio.update({
        where: { id },
        data: {
          niveles: {
            disconnect: disconnectNiveles
          }
        }
      });
    }
    
    if (disconnectGrados.length > 0) {
      await db.anuncio.update({
        where: { id },
        data: {
          grados: {
            disconnect: disconnectGrados
          }
        }
      });
    }
    
    // Eliminar anuncio
    await db.anuncio.delete({
      where: { id }
    });

    revalidatePath("/comunicaciones/anuncios");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar anuncio:", error);
    return { success: false, error: error.message || "Error al eliminar anuncio" };
  }
}

/**
 * Obtiene un anuncio por su ID
 * @param {String} id - ID del anuncio
 * @returns {Promise<Object>} - Anuncio encontrado
 */
export async function obtenerAnuncioPorId(id) {
  try {
    const anuncio = await db.anuncio.findUnique({
      where: { id },
      include: {
        autor: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        niveles: true,
        grados: true
      }
    });
    
    if (!anuncio) {
      return { success: false, error: "Anuncio no encontrado" };
    }
    
    return { success: true, anuncio };
  } catch (error) {
    console.error("Error al obtener anuncio:", error);
    return { success: false, error: error.message || "Error al obtener anuncio" };
  }
}

/**
 * Obtiene anuncios con filtros
 * @param {Object} filtros - Filtros para la consulta
 * @returns {Promise<Object>} - Anuncios encontrados
 */
export async function obtenerAnuncios({
  page = 1,
  limit = 10,
  dirigidoA = null,
  nivelId = null,
  gradoId = null,
  activos = true,
  importantes = null,
  urgentes = null,
  fijados = null,
  busqueda = ""
} = {}) {
  try {
    const skip = (page - 1) * limit;
    
    // Construir filtros
    const where = {
      ...(activos !== null && { activo: activos }),
      ...(importantes !== null && { importante: importantes }),
      ...(urgentes !== null && { urgente: urgentes }),
      ...(fijados !== null && { fijado: fijados }),
      ...(dirigidoA && { dirigidoA }),
      ...(nivelId && {
        niveles: {
          some: { id: nivelId }
        }
      }),
      ...(gradoId && {
        grados: {
          some: { id: gradoId }
        }
      }),
      ...(busqueda && {
        OR: [
          { titulo: { contains: busqueda, mode: 'insensitive' } },
          { contenido: { contains: busqueda, mode: 'insensitive' } },
          { resumen: { contains: busqueda, mode: 'insensitive' } }
        ]
      })
    };
    
    // Obtener anuncios
    const [anuncios, total] = await Promise.all([
      db.anuncio.findMany({
        where,
        include: {
          autor: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            }
          },
          niveles: true,
          grados: true
        },
        orderBy: [
          { fijado: 'desc' },
          { urgente: 'desc' },
          { importante: 'desc' },
          { fechaPublicacion: 'desc' }
        ],
        skip,
        take: limit
      }),
      db.anuncio.count({ where })
    ]);
    
    return {
      success: true,
      anuncios,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    };
  } catch (error) {
    console.error("Error al obtener anuncios:", error);
    return { success: false, error: error.message || "Error al obtener anuncios" };
  }
}

/**
 * Incrementa el contador de vistas de un anuncio
 * @param {String} id - ID del anuncio
 * @returns {Promise<Object>} - Resultado de la operación
 */
export async function incrementarVistas(id) {
  try {
    await db.anuncio.update({
      where: { id },
      data: {
        vistas: {
          increment: 1
        }
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error al incrementar vistas:", error);
    return { success: false, error: error.message || "Error al incrementar vistas" };
  }
}

/**
 * Obtiene anuncios para el dashboard
 * @param {Object} params - Parámetros para la consulta
 * @returns {Promise<Object>} - Anuncios para el dashboard
 */
export async function obtenerAnunciosDashboard({
  rol = "todos",
  nivelId = null,
  gradoId = null,
  limit = 5
} = {}) {
  try {
    // Construir filtros
    const where = {
      activo: true,
      OR: [
        { dirigidoA: "todos" },
        { dirigidoA: rol }
      ],
      ...(nivelId && {
        niveles: {
          some: { id: nivelId }
        }
      }),
      ...(gradoId && {
        grados: {
          some: { id: gradoId }
        }
      }),
      // Solo mostrar anuncios vigentes
      OR: [
        { fechaExpiracion: null },
        { fechaExpiracion: { gt: new Date() } }
      ]
    };
    
    // Obtener anuncios
    const anuncios = await db.anuncio.findMany({
      where,
      include: {
        autor: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      },
      orderBy: [
        { fijado: 'desc' },
        { urgente: 'desc' },
        { importante: 'desc' },
        { fechaPublicacion: 'desc' }
      ],
      take: limit
    });
    
    return { success: true, anuncios };
  } catch (error) {
    console.error("Error al obtener anuncios para dashboard:", error);
    return { success: false, error: error.message || "Error al obtener anuncios para dashboard" };
  }
}
