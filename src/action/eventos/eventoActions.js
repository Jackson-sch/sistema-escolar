"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Esquema de validación para eventos
const eventoSchema = z.object({
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  descripcion: z.string().optional().nullable(),
  imagen: z.string().optional().nullable(),
  fechaInicio: z.coerce.date(),
  fechaFin: z.coerce.date(),
  horaInicio: z.string().optional().nullable(),
  horaFin: z.string().optional().nullable(),
  fechaLimiteInscripcion: z.coerce.date().optional().nullable(),
  ubicacion: z.string().optional().nullable(),
  aula: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  modalidad: z.string().optional().nullable(),
  enlaceVirtual: z.string().optional().nullable(),
  tipo: z.string(),
  categoria: z.string().optional().nullable(),
  publico: z.union([z.boolean(), z.string().transform(val => val === 'true')]).default(true),
  dirigidoA: z.string().optional().nullable(),
  niveles: z.array(z.string()).optional(),
  grados: z.array(z.string()).optional(),
  capacidadMaxima: z.coerce.number().optional().nullable(),
  requiereInscripcion: z.union([z.boolean(), z.string().transform(val => val === 'true')]).default(false),
  estado: z.string().default("programado"),
});

/**
 * Registra un nuevo evento
 * @param {Object} data - Datos del evento
 * @returns {Promise<Object>} - Evento creado
 */
export async function registrarEvento(data) {
  try {
    // Validar datos
    const validatedData = eventoSchema.parse(data);
    
    // Crear evento
    const evento = await db.evento.create({
      data: {
        titulo: validatedData.titulo,
        descripcion: validatedData.descripcion,
        imagen: validatedData.imagen,
        fechaInicio: validatedData.fechaInicio,
        fechaFin: validatedData.fechaFin,
        horaInicio: validatedData.horaInicio,
        horaFin: validatedData.horaFin,
        fechaLimiteInscripcion: validatedData.fechaLimiteInscripcion,
        ubicacion: validatedData.ubicacion,
        aula: validatedData.aula,
        direccion: validatedData.direccion,
        modalidad: validatedData.modalidad,
        enlaceVirtual: validatedData.enlaceVirtual,
        tipo: validatedData.tipo,
        categoria: validatedData.categoria,
        publico: validatedData.publico,
        dirigidoA: validatedData.dirigidoA,
        capacidadMaxima: validatedData.capacidadMaxima,
        requiereInscripcion: validatedData.requiereInscripcion,
        estado: validatedData.estado,
        organizador: {
          connect: { id: data.organizadorId }
        },
        niveles: {
          connect: (validatedData.niveles || []).map(id => ({ id }))
        },
        grados: {
          connect: (validatedData.grados || []).map(id => ({ id }))
        }
      },
    });
    
    // Revalidar rutas
    revalidatePath("/comunicaciones/eventos");
    
    return { success: true, evento };
  } catch (error) {
    console.error("Error al registrar evento:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza un evento existente
 * @param {String} id - ID del evento
 * @param {Object} data - Datos actualizados
 * @returns {Promise<Object>} - Evento actualizado
 */
export async function actualizarEvento(id, data) {
  try {
    // Validar datos
    const validatedData = eventoSchema.parse(data);
    
    // Obtener evento actual para manejar relaciones
    const eventoActual = await db.evento.findUnique({
      where: { id },
      include: {
        niveles: true,
        grados: true
      }
    });
    
    if (!eventoActual) {
      return { success: false, error: "Evento no encontrado" };
    }
    
    // Desconectar relaciones actuales
    await db.evento.update({
      where: { id },
      data: {
        niveles: {
          disconnect: eventoActual.niveles.map(nivel => ({ id: nivel.id }))
        },
        grados: {
          disconnect: eventoActual.grados.map(grado => ({ id: grado.id }))
        }
      }
    });
    
    // Actualizar evento con nuevas relaciones
    const evento = await db.evento.update({
      where: { id },
      data: {
        titulo: validatedData.titulo,
        descripcion: validatedData.descripcion,
        imagen: validatedData.imagen,
        fechaInicio: validatedData.fechaInicio,
        fechaFin: validatedData.fechaFin,
        horaInicio: validatedData.horaInicio,
        horaFin: validatedData.horaFin,
        fechaLimiteInscripcion: validatedData.fechaLimiteInscripcion,
        ubicacion: validatedData.ubicacion,
        aula: validatedData.aula,
        direccion: validatedData.direccion,
        modalidad: validatedData.modalidad,
        enlaceVirtual: validatedData.enlaceVirtual,
        tipo: validatedData.tipo,
        categoria: validatedData.categoria,
        publico: validatedData.publico,
        dirigidoA: validatedData.dirigidoA,
        capacidadMaxima: validatedData.capacidadMaxima,
        requiereInscripcion: validatedData.requiereInscripcion,
        estado: validatedData.estado,
        niveles: {
          connect: (validatedData.niveles || []).map(id => ({ id }))
        },
        grados: {
          connect: (validatedData.grados || []).map(id => ({ id }))
        }
      },
    });
    
    // Revalidar rutas
    revalidatePath("/comunicaciones/eventos");
    
    return { success: true, evento };
  } catch (error) {
    console.error("Error al actualizar evento:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Elimina un evento
 * @param {String} id - ID del evento
 * @returns {Promise<Object>} - Resultado de la operación
 */
export async function eliminarEvento(id) {
  try {
    // Obtener evento actual para manejar relaciones
    const eventoActual = await db.evento.findUnique({
      where: { id },
      include: {
        niveles: true,
        grados: true
      }
    });
    
    if (!eventoActual) {
      return { success: false, error: "Evento no encontrado" };
    }
    
    // Desconectar relaciones
    await db.evento.update({
      where: { id },
      data: {
        niveles: {
          disconnect: eventoActual.niveles.map(nivel => ({ id: nivel.id }))
        },
        grados: {
          disconnect: eventoActual.grados.map(grado => ({ id: grado.id }))
        }
      }
    });
    
    // Eliminar evento
    await db.evento.delete({
      where: { id }
    });
    
    // Revalidar rutas
    revalidatePath("/comunicaciones/eventos");
    
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar evento:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Cambia el estado de un evento
 * @param {String} id - ID del evento
 * @param {String} estado - Nuevo estado
 * @returns {Promise<Object>} - Evento actualizado
 */
export async function cambiarEstadoEvento(id, estado) {
  try {
    const evento = await db.evento.update({
      where: { id },
      data: { estado }
    });
    
    // Revalidar rutas
    revalidatePath("/comunicaciones/eventos");
    
    return { success: true, evento };
  } catch (error) {
    console.error("Error al cambiar estado del evento:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene un evento por su ID
 * @param {String} id - ID del evento
 * @returns {Promise<Object>} - Evento encontrado
 */
export async function obtenerEventoPorId(id) {
  try {
    const evento = await db.evento.findUnique({
      where: { id },
      include: {
        organizador: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        },
        niveles: true,
        grados: true
      }
    });
    
    if (!evento) {
      return { success: false, error: "Evento no encontrado" };
    }
    
    return { success: true, evento };
  } catch (error) {
    console.error("Error al obtener evento:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene todos los eventos con filtros opcionales
 * @param {Object} filtros - Filtros para la búsqueda
 * @returns {Promise<Array>} - Lista de eventos
 */
export async function obtenerEventos(filtros = {}) {
  try {
    const { 
      tipo, 
      estado, 
      fechaInicio, 
      fechaFin, 
      organizadorId,
      publico,
      dirigidoA,
      nivelId,
      gradoId,
      page = 1, 
      limit = 10 
    } = filtros;
    
    // Construir condiciones de búsqueda
    const where = {};
    
    if (tipo) where.tipo = tipo;
    if (estado) where.estado = estado;
    if (organizadorId) where.organizadorId = organizadorId;
    if (publico !== undefined) where.publico = publico;
    if (dirigidoA) where.dirigidoA = dirigidoA;
    
    // Filtros de fecha
    if (fechaInicio && fechaFin) {
      where.fechaInicio = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin)
      };
    } else if (fechaInicio) {
      where.fechaInicio = {
        gte: new Date(fechaInicio)
      };
    } else if (fechaFin) {
      where.fechaInicio = {
        lte: new Date(fechaFin)
      };
    }
    
    // Filtros de nivel y grado
    if (nivelId) {
      where.niveles = {
        some: {
          id: nivelId
        }
      };
    }
    
    if (gradoId) {
      where.grados = {
        some: {
          id: gradoId
        }
      };
    }
    
    // Calcular paginación
    const skip = (page - 1) * limit;
    
    // Obtener eventos
    const [eventos, total] = await Promise.all([
      db.evento.findMany({
        where,
        include: {
          organizador: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true
            }
          },
          niveles: true,
          grados: true
        },
        orderBy: {
          fechaInicio: 'desc'
        },
        skip,
        take: limit
      }),
      db.evento.count({ where })
    ]);
    
    // Calcular páginas totales
    const totalPages = Math.ceil(total / limit);
    
    return { 
      success: true, 
      eventos, 
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    };
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene eventos próximos
 * @param {Number} limit - Límite de eventos a obtener
 * @returns {Promise<Array>} - Lista de eventos próximos
 */
export async function obtenerEventosProximos(limit = 5) {
  try {
    const hoy = new Date();
    
    const eventos = await db.evento.findMany({
      where: {
        fechaInicio: {
          gte: hoy
        },
        estado: "programado"
      },
      include: {
        organizador: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        fechaInicio: 'asc'
      },
      take: limit
    });
    
    return { success: true, eventos };
  } catch (error) {
    console.error("Error al obtener eventos próximos:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene eventos por organizador
 * @param {String} organizadorId - ID del organizador
 * @param {Object} filtros - Filtros adicionales
 * @returns {Promise<Array>} - Lista de eventos del organizador
 */
export async function obtenerEventosPorOrganizador(organizadorId, filtros = {}) {
  try {
    return obtenerEventos({
      ...filtros,
      organizadorId
    });
  } catch (error) {
    console.error("Error al obtener eventos del organizador:", error);
    return { success: false, error: error.message };
  }
}
