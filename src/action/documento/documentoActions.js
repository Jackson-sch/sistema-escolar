'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/auth';
import crypto from 'crypto';


// Esquema de validación para documentos
const documentoSchema = z.object({
  titulo: z.string().min(3, { message: 'El título debe tener al menos 3 caracteres' }),
  descripcion: z.string().optional().nullable(),
  contenido: z.string().min(1, { message: 'El contenido es obligatorio' }),
  tipo: z.enum(['CERTIFICADO_ESTUDIOS', 'CONSTANCIA_MATRICULA', 'CONSTANCIA_VACANTE', 'TRASLADO', 
                'BOLETA_NOTAS', 'ACTA_NOTAS', 'FICHA_MATRICULA', 'RECORD_ACADEMICO', 'CONSTANCIA_EGRESADO', 
                'DIPLOMA_TITULO', 'PARTIDA_NACIMIENTO', 'DNI_COPIA', 'FOTO', 'FICHA_SOCIOECONOMICA', 'EXPEDIENTE']),
  formato: z.string().default('PDF'),
  plantilla: z.string().optional().nullable(),
  codigo: z.string().optional(),
  fechaEmision: z.date().default(() => new Date()),
  fechaExpiracion: z.date().optional().nullable(),
  estado: z.string().default('activo'),
  estudianteId: z.string().optional().nullable(),
  emisorId: z.string(),
  archivoUrl: z.string().optional().nullable(),
  datosAdicionales: z.any().optional().nullable(),
});

/**
 * Registra un nuevo documento en el sistema
 * @param {Object} datos - Datos del documento a registrar
 */
export async function registrarDocumento(datos) {
  try {
    // Validar sesión
    const session = await auth();
    if (!session) {
      return { success: false, error: 'No autorizado' };
    }

    // Si no se proporciona un código, generar uno
    if (!datos.codigo) {
      const fechaActual = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const codigoAleatorio = Math.floor(1000 + Math.random() * 9000);
      datos.codigo = `DOC-${fechaActual}-${codigoAleatorio}`;
    }

    // Generar código de verificación si es necesario
    if (['CERTIFICADO_ESTUDIOS', 'CONSTANCIA_MATRICULA', 'CONSTANCIA_EGRESADO', 'DIPLOMA_TITULO', 'EXPEDIENTE'].includes(datos.tipo)) {
      datos.codigoVerificacion = crypto.randomBytes(16).toString('hex');
    }

    // Validar que el emisorId sea válido
    if (!datos.emisorId) {
      datos.emisorId = session.user.id;
    }

    // Verificar que el emisor exista
    const emisorExiste = await db.user.findUnique({
      where: { id: datos.emisorId },
      select: { id: true }
    });

    if (!emisorExiste) {
      return { 
        success: false, 
        error: 'El emisor especificado no existe', 
        campo: 'emisorId',
        valor: datos.emisorId
      };
    }

    // Verificar que el estudiante exista si se proporciona un estudianteId
    if (datos.estudianteId) {
      const estudianteExiste = await db.user.findUnique({
        where: { id: datos.estudianteId },
        select: { id: true }
      });

      if (!estudianteExiste) {
        return { 
          success: false, 
          error: 'El estudiante especificado no existe', 
          campo: 'estudianteId',
          valor: datos.estudianteId
        };
      }
    }

    // Validar datos con Zod
    const validatedData = documentoSchema.parse({
      ...datos,
      emisorId: datos.emisorId
    });

    console.log('Datos validados para crear documento:', validatedData);

    // Crear documento
    const documento = await db.documento.create({
      data: validatedData,
    });

    revalidatePath('/documentos');
    return { success: true, documento };
  } catch (error) {
    console.error('Error al registrar documento:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Datos inválidos', 
        detalles: error.errors 
      };
    }
    
    // Manejar errores de Prisma
    if (error.code) {
      switch (error.code) {
        case 'P2003': // Foreign key constraint failed
          return { 
            success: false, 
            error: 'Error de clave foránea: La referencia a otro registro no existe',
            campo: error.meta?.field_name,
            detalles: error.message
          };
        case 'P2002': // Unique constraint failed
          return { 
            success: false, 
            error: 'Ya existe un documento con ese código o identificador único',
            campo: error.meta?.target,
            detalles: error.message
          };
        default:
          return { 
            success: false, 
            error: `Error de base de datos: ${error.code}`, 
            detalles: error.message 
          };
      }
    }
    
    return { 
      success: false, 
      error: 'Error al registrar documento', 
      detalles: error.message 
    };
  }
}

/**
 * Actualiza un documento existente
 * @param {string} id - ID del documento a actualizar
 * @param {Object} datos - Nuevos datos del documento
 */
export async function actualizarDocumento(id, datos) {
  try {
    // Validar sesión
    const session = await auth();
    if (!session) {
      return { error: 'No autorizado' };
    }

    // Verificar que el documento existe
    const documentoExistente = await db.documento.findUnique({
      where: { id },
    });

    if (!documentoExistente) {
      return { error: 'Documento no encontrado' };
    }

    // Validar datos
    const validatedData = documentoSchema.partial().parse(datos);

    // Actualizar documento
    const documentoActualizado = await db.documento.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath('/documentos');
    return { success: true, documento: documentoActualizado };
  } catch (error) {
    console.error('Error al actualizar documento:', error);
    if (error instanceof z.ZodError) {
      return { error: 'Datos inválidos', detalles: error.errors };
    }
    return { error: 'Error al actualizar documento' };
  }
}

/**
 * Elimina un documento
 * @param {string} id - ID del documento a eliminar
 */
export async function eliminarDocumento(id) {
  try {
    // Validar sesión
    const session = await auth();
    if (!session) {
      return { error: 'No autorizado' };
    }

    // Verificar que el documento existe
    const documentoExistente = await db.documento.findUnique({
      where: { id },
    });

    if (!documentoExistente) {
      return { error: 'Documento no encontrado' };
    }

    // Eliminar documento
    await db.documento.delete({
      where: { id },
    });

    revalidatePath('/documentos');
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    return { error: 'Error al eliminar documento' };
  }
}

/**
 * Obtiene documentos según filtros
 * @param {Object} filtros - Filtros para la consulta
 */
export async function obtenerDocumentos(filtros = {}) {
  try {
    // Validar sesión
    const session = await auth();
    if (!session) {
      return { error: 'No autorizado' };
    }

    // Construir consulta
    const where = {};
    
    // Filtrar por tipo de documento
    if (filtros.tipo) {
      where.tipo = filtros.tipo;
    }
    
    // Filtrar por estudiante
    if (filtros.estudianteId) {
      where.estudianteId = filtros.estudianteId;
    }
    
    // Filtrar por estado
    if (filtros.estado) {
      where.estado = filtros.estado;
    }
    
    // Filtrar por código
    if (filtros.codigo) {
      where.codigo = {
        contains: filtros.codigo,
        mode: 'insensitive',
      };
    }
    
    // Filtrar por título
    if (filtros.titulo) {
      where.titulo = {
        contains: filtros.titulo,
        mode: 'insensitive',
      };
    }

    // Ejecutar consulta
    const documentos = await db.documento.findMany({
      where,
      include: {
        estudiante: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        emisor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        fechaEmision: 'desc',
      },
    });

    return { success: true, documentos };
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    return { error: 'Error al obtener documentos' };
  }
}

/**
 * Obtiene un documento específico por ID
 * @param {string} id - ID del documento
 */
export async function obtenerDocumentoPorId(id) {
  try {
    // Validar sesión
    const session = await getServerSession(authOptions);
    if (!session) {
      return { error: 'No autorizado' };
    }

    // Obtener documento
    const documento = await db.documento.findUnique({
      where: { id },
      include: {
        estudiante: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        emisor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!documento) {
      return { error: 'Documento no encontrado' };
    }

    return { success: true, documento };
  } catch (error) {
    console.error('Error al obtener documento:', error);
    return { error: 'Error al obtener documento' };
  }
}

/**
 * Obtiene documentos de tipo expediente
 */
export async function obtenerExpedientes(filtros = {}) {
  try {
    return await obtenerDocumentos({
      ...filtros,
      tipo: 'EXPEDIENTE',
    });
  } catch (error) {
    console.error('Error al obtener expedientes:', error);
    return { error: 'Error al obtener expedientes' };
  }
}

/**
 * Registra un nuevo expediente
 * @param {Object} datos - Datos del expediente
 */
export async function registrarExpediente(datos) {
  try {
    console.log('Registrando expediente con datos:', datos);
    const resultado = await registrarDocumento({
      ...datos,
      tipo: 'EXPEDIENTE',
    });
    return resultado;
  } catch (error) {
    console.error('Error al registrar expediente:', error);
    return { 
      success: false, 
      error: 'Error al registrar expediente',
      detalles: error.message 
    };
  }
}

/**
 * Actualiza un expediente existente
 * @param {string} id - ID del expediente
 * @param {Object} datos - Nuevos datos del expediente
 */
export async function actualizarExpediente(id, datos) {
  try {
    console.log('Actualizando expediente con ID:', id, 'y datos:', datos);
    const resultado = await actualizarDocumento(id, datos);
    return resultado;
  } catch (error) {
    console.error('Error al actualizar expediente:', error);
    return { 
      success: false, 
      error: 'Error al actualizar expediente',
      detalles: error.message 
    };
  }
}

/**
 * Elimina un expediente
 * @param {string} id - ID del expediente
 */
export async function eliminarExpediente(id) {
  try {
    return await eliminarDocumento(id);
  } catch (error) {
    console.error('Error al eliminar expediente:', error);
    return { error: 'Error al eliminar expediente' };
  }
}
