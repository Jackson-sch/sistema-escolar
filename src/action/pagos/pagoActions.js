'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Esquema de validación para pagos
const pagoSchema = z.object({
  numeroBoleta: z.string().optional().nullable(),
  concepto: z.string().min(3, { message: 'El concepto es obligatorio y debe tener al menos 3 caracteres' }),
  descripcion: z.string().optional().nullable(),
  monto: z.number().positive({ message: 'El monto debe ser mayor a 0' }),
  moneda: z.string().default('PEN'),
  fechaVencimiento: z.date({ message: 'La fecha de vencimiento es obligatoria' }),
  fechaPago: z.date().optional().nullable(),
  estado: z.string().default('pendiente'),
  metodoPago: z.string().optional().nullable(),
  referenciaPago: z.string().optional().nullable(),
  numeroOperacion: z.string().optional().nullable(),
  entidadBancaria: z.string().optional().nullable(),
  comprobante: z.string().optional().nullable(),
  recibo: z.string().optional().nullable(),
  estudianteId: z.string({ message: 'El estudiante es obligatorio' }),
  observaciones: z.string().optional().nullable(),
  descuento: z.number().default(0).optional().nullable(),
  mora: z.number().default(0).optional().nullable(),
});

// Registrar un nuevo pago
export async function registrarPago(data) {
  try {
    // Validar datos
    const validatedData = pagoSchema.parse(data);
    
    // Crear pago en la base de datos
    const pago = await db.pago.create({
      data: validatedData
    });

    revalidatePath('/pagos');
    revalidatePath('/pagos/registrar');
    
    return { success: true, pago };
  } catch (error) {
    console.error('Error al registrar pago:', error);
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    
    return { success: false, error: 'Error al registrar el pago' };
  }
}

// Actualizar un pago existente
export async function actualizarPago(id, data) {
  try {
    // Validar datos
    const validatedData = pagoSchema.parse(data);
    
    // Actualizar pago en la base de datos
    const pago = await db.pago.update({
      where: { id },
      data: validatedData
    });

    revalidatePath('/pagos');
    revalidatePath('/pagos/consultar');
    
    return { success: true, pago };
  } catch (error) {
    console.error('Error al actualizar pago:', error);
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    
    return { success: false, error: 'Error al actualizar el pago' };
  }
}

// Eliminar un pago
export async function eliminarPago(id) {
  try {
    // Verificar si el pago existe
    const pagoExistente = await db.pago.findUnique({
      where: { id }
    });

    if (!pagoExistente) {
      return { success: false, error: 'El pago no existe' };
    }

    // No permitir eliminar pagos ya procesados
    if (pagoExistente.estado === 'pagado') {
      return { success: false, error: 'No se puede eliminar un pago ya procesado' };
    }

    // Eliminar pago
    await db.pago.delete({
      where: { id }
    });

    revalidatePath('/pagos');
    revalidatePath('/pagos/consultar');
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar pago:', error);
    return { success: false, error: 'Error al eliminar el pago' };
  }
}

// Obtener todos los pagos con filtros opcionales
export async function obtenerPagos({
  estudianteId,
  estado,
  fechaDesde,
  fechaHasta,
  concepto,
  page = 1,
  pageSize = 10
} = {}) {
  try {
    // Construir filtros
    const where = {};
    
    if (estudianteId) {
      where.estudianteId = estudianteId;
    }
    
    if (estado) {
      where.estado = estado;
    }
    
    if (fechaDesde || fechaHasta) {
      where.fechaVencimiento = {};
      
      if (fechaDesde) {
        where.fechaVencimiento.gte = new Date(fechaDesde);
      }
      
      if (fechaHasta) {
        where.fechaVencimiento.lte = new Date(fechaHasta);
      }
    }
    
    if (concepto) {
      where.concepto = {
        contains: concepto,
        mode: 'insensitive'
      };
    }

    // Calcular paginación
    const skip = (page - 1) * pageSize;
    
    // Obtener pagos con paginación
    const [pagos, total] = await Promise.all([
      db.pago.findMany({
        where,
        include: {
          estudiante: {
            select: {
              id: true,
              name: true,
              email: true,
              dni: true
            }
          }
        },
        orderBy: {
          fechaVencimiento: 'desc'
        },
        skip,
        take: pageSize
      }),
      db.pago.count({ where })
    ]);

    // Calcular información de paginación
    const totalPages = Math.ceil(total / pageSize);
    console.log("pagos", pagos)
    return { 
      success: true, 
      pagos, 
      pagination: {
        total,
        page,
        pageSize,
        totalPages
      }
    };
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    return { success: false, error: 'Error al obtener los pagos' };
  }
}

// Obtener un pago por ID
export async function obtenerPagoPorId(id) {
  try {
    const pago = await db.pago.findUnique({
      where: { id },
      include: {
        estudiante: {
          select: {
            id: true,
            name: true,
            email: true,
            dni: true
          }
        }
      }
    });

    if (!pago) {
      return { success: false, error: 'Pago no encontrado' };
    }

    return { success: true, pago };
  } catch (error) {
    console.error('Error al obtener pago:', error);
    return { success: false, error: 'Error al obtener el pago' };
  }
}

// Obtener pagos por estudiante
export async function obtenerPagosPorEstudiante(estudianteId) {
  try {
    const pagos = await db.pago.findMany({
      where: { estudianteId },
      orderBy: {
        fechaVencimiento: 'desc'
      }
    });

    return { success: true, pagos };
  } catch (error) {
    console.error('Error al obtener pagos del estudiante:', error);
    return { success: false, error: 'Error al obtener los pagos del estudiante' };
  }
}

// Registrar pago realizado
export async function registrarPagoRealizado(id, datosPago) {
  try {
    // Validar datos mínimos necesarios
    if (!datosPago.fechaPago || !datosPago.metodoPago) {
      return { success: false, error: 'Faltan datos obligatorios para registrar el pago' };
    }

    // Actualizar pago a estado "pagado"
    const pago = await db.pago.update({
      where: { id },
      data: {
        estado: 'pagado',
        fechaPago: datosPago.fechaPago,
        metodoPago: datosPago.metodoPago,
        referenciaPago: datosPago.referenciaPago,
        numeroOperacion: datosPago.numeroOperacion,
        entidadBancaria: datosPago.entidadBancaria,
        comprobante: datosPago.comprobante,
        observaciones: datosPago.observaciones
      }
    });

    revalidatePath('/pagos');
    revalidatePath('/pagos/consultar');
    
    return { success: true, pago };
  } catch (error) {
    console.error('Error al registrar pago realizado:', error);
    return { success: false, error: 'Error al registrar el pago realizado' };
  }
}

// Obtener estadísticas de pagos
export async function obtenerEstadisticasPagos() {
  try {
    // Obtener total de pagos por estado
    const estadosPagos = await db.pago.groupBy({
      by: ['estado'],
      _count: {
        id: true
      },
      _sum: {
        monto: true
      }
    });

    // Calcular pagos vencidos (estado pendiente y fecha vencimiento pasada)
    const fechaActual = new Date();
    const pagosVencidos = await db.pago.count({
      where: {
        estado: 'pendiente',
        fechaVencimiento: {
          lt: fechaActual
        }
      }
    });

    // Calcular total de monto pendiente
    const montoPendiente = await db.pago.aggregate({
      where: {
        estado: 'pendiente'
      },
      _sum: {
        monto: true
      }
    });

    // Calcular total de monto pagado
    const montoPagado = await db.pago.aggregate({
      where: {
        estado: 'pagado'
      },
      _sum: {
        monto: true
      }
    });

    // Obtener pagos próximos a vencer (pendientes y vencen en los próximos 7 días)
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + 7);
    
    const proximosVencer = await db.pago.count({
      where: {
        estado: 'pendiente',
        fechaVencimiento: {
          gte: fechaActual,
          lte: fechaLimite
        }
      }
    });

    return { 
      success: true, 
      estadisticas: {
        estadosPagos,
        pagosVencidos,
        proximosVencer,
        montoPendiente: montoPendiente._sum.monto || 0,
        montoPagado: montoPagado._sum.monto || 0
      }
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de pagos:', error);
    return { success: false, error: 'Error al obtener las estadísticas de pagos' };
  }
}
