'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { z } from 'zod';
import { auth } from '@/auth';
import crypto from 'crypto';
import QRCode from 'qrcode';

// Esquema de validación para certificados
const certificadoSchema = z.object({
  titulo: z.string().min(3, { message: 'El título debe tener al menos 3 caracteres' }),
  descripcion: z.string().optional(),
  contenido: z.string().min(10, { message: 'El contenido debe tener al menos 10 caracteres' }),
  formato: z.string().default('PDF'),
  plantilla: z.string().optional(),
  codigo: z.string().min(3, { message: 'El código debe tener al menos 3 caracteres' }),
  fechaExpiracion: z.date().optional(),
  estudianteId: z.string().optional(),
  datosAdicionales: z.any().optional(),
});

// Función para generar código de verificación único
function generarCodigoVerificacion() {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(8).toString('hex');
  return `CERT-${timestamp}-${random}`.toUpperCase();
}

// Obtener un certificado por su ID
export async function obtenerCertificado(id) {
  try {
    const certificado = await db.documento.findUnique({
      where: {
        id,
        tipo: 'CERTIFICADO'
      },
      include: {
        estudiante: true,
        emisor: true
      }
    });

    if (!certificado) {
      return { error: 'Certificado no encontrado' };
    }

    return certificado;
  } catch (error) {
    console.error('Error al obtener certificado:', error);
    return { error: 'Error al obtener el certificado' };
  }
}

// Registrar un nuevo certificado
export async function registrarCertificado(formData) {
  try {
    console.log('Datos recibidos en registrarCertificado:', formData);
    const session = await auth();
    console.log('Sesión de usuario:', session?.user?.id);
    if (!session || !session.user) {
      console.log('Error: No hay sesión de usuario');
      return { error: 'No autorizado' };
    }

    // Validar datos
    const validatedData = certificadoSchema.parse({
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      contenido: formData.contenido,
      formato: formData.formato || 'PDF',
      plantilla: formData.plantilla,
      codigo: formData.codigo,
      fechaExpiracion: formData.fechaExpiracion ? new Date(formData.fechaExpiracion) : undefined,
      estudianteId: formData.estudianteId,
      datosAdicionales: formData.datosAdicionales,
    });

    // Verificar si ya existe un certificado con el mismo código
    const existingCertificado = await db.documento.findUnique({
      where: { codigo: validatedData.codigo },
    });

    if (existingCertificado) {
      return { error: 'Ya existe un certificado con este código' };
    }

    // Crear el certificado
    const { estudianteId, ...datosDocumento } = validatedData;
    const codigoVerificacion = generarCodigoVerificacion();
    
    const certificado = await db.documento.create({
      data: {
        ...datosDocumento,
        tipo: 'CERTIFICADO_ESTUDIOS',
        codigoVerificacion,
        emisor: { connect: { id: session.user.id } },
        estudiante: estudianteId 
          ? { connect: { id: estudianteId } } 
          : undefined,
      },
    });

    revalidatePath('/documentos/certificados');
    return { success: true, certificado };
  } catch (error) {
    console.error('Error al registrar certificado:', error);
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: 'Error al registrar el certificado' };
  }
}

// Actualizar un certificado existente
export async function actualizarCertificado(id, formData) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { error: 'No autorizado' };
    }

    // Validar datos
    const validatedData = certificadoSchema.parse({
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      contenido: formData.contenido,
      formato: formData.formato || 'PDF',
      plantilla: formData.plantilla,
      codigo: formData.codigo,
      fechaExpiracion: formData.fechaExpiracion ? new Date(formData.fechaExpiracion) : undefined,
      estudianteId: formData.estudianteId,
      datosAdicionales: formData.datosAdicionales,
    });

    // Verificar si ya existe otro certificado con el mismo código
    const existingCertificado = await db.documento.findFirst({
      where: {
        codigo: validatedData.codigo,
        NOT: { id },
      },
    });

    if (existingCertificado) {
      return { error: 'Ya existe otro certificado con este código' };
    }

    // Actualizar el certificado
    const { estudianteId, ...datosDocumento } = validatedData;
    const certificado = await db.documento.update({
      where: { id },
      data: {
        ...datosDocumento,
        estudiante: estudianteId 
          ? { connect: { id: estudianteId } } 
          : { disconnect: true },
      },
    });

    revalidatePath('/documentos/certificados');
    return { success: true, certificado };
  } catch (error) {
    console.error('Error al actualizar certificado:', error);
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: 'Error al actualizar el certificado' };
  }
}

// Eliminar un certificado
export async function eliminarCertificado(id) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { error: 'No autorizado' };
    }

    await db.documento.delete({
      where: { id },
    });

    revalidatePath('/documentos/certificados');
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar certificado:', error);
    return { error: 'Error al eliminar el certificado' };
  }
}

// Obtener todos los certificados con filtros opcionales
export async function obtenerCertificados({ 
  page = 1, 
  limit = 10, 
  search = '', 
  estado = '', 
  estudianteId = '' 
}) {
  try {
    const skip = (page - 1) * limit;
    
    // Construir filtros
    const where = {
      tipo: "CERTIFICADO_ESTUDIOS", // Usando el valor correcto del enum TipoDocumento
      ...(search && {
        OR: [
          { titulo: { contains: search, mode: 'insensitive' } },
          { codigo: { contains: search, mode: 'insensitive' } },
          { descripcion: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(estado && { estado }),
      ...(estudianteId && { estudianteId }),
    };

    // Obtener certificados con paginación
    const [certificados, total] = await Promise.all([
      db.documento.findMany({
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
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.documento.count({ where }),
    ]);

    return {
      certificados,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  } catch (error) {
    console.error('Error al obtener certificados:', error);
    throw new Error('Error al obtener los certificados');
  }
}

// Generar PDF del certificado
export async function generarPDFCertificado(id) {
  try {
    // Obtener el certificado con datos del estudiante
    const certificado = await db.documento.findUnique({
      where: { id },
      include: {
        estudiante: {
          select: {
            id: true,
            name: true,
            email: true,
            dni: true,
          }
        },
        emisor: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });
    
    if (!certificado) {
      return { error: 'Certificado no encontrado' };
    }

    // Generar contenido HTML del certificado
    const htmlContent = await generarHTMLCertificado(certificado);
    
    // En un entorno real, aquí usarías puppeteer o similar para generar el PDF
    // Por ahora, simulamos la generación y guardamos la referencia
    const archivoUrl = `/api/certificados/${id}/pdf`;
    
    // Actualizar el certificado con la URL del archivo generado
    await db.documento.update({
      where: { id },
      data: {
        archivoUrl,
        firmado: true,
      },
    });
    
    return { 
      success: true, 
      archivoUrl,
      htmlContent, // Para preview
      mensaje: 'PDF generado correctamente' 
    };
  } catch (error) {
    console.error('Error al generar PDF:', error);
    return { error: 'Error al generar el PDF' };
  }
}

// Obtener un certificado por ID con relaciones
export async function obtenerCertificadoPorId(id) {
  try {
    const certificado = await db.documento.findUnique({
      where: { id, tipo: 'CERTIFICADO_ESTUDIOS' },
      include: {
        estudiante: {
          select: {
            id: true,
            name: true,
            email: true,
            dni: true,
          }
        },
        emisor: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });
    
    if (!certificado) {
      return { error: 'Certificado no encontrado' };
    }
    
    return { success: true, certificado };
  } catch (error) {
    console.error('Error al obtener certificado:', error);
    return { error: 'Error al obtener el certificado' };
  }
}

// Función auxiliar para generar HTML del certificado
async function generarHTMLCertificado(certificado) {
  // Manejo seguro de fechas
  let fechaEmision = 'No especificada';
  try {
    if (certificado.fechaEmision) {
      fechaEmision = new Date(certificado.fechaEmision).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  } catch (error) {
    console.error('Error al formatear fecha de emisión:', error);
  }
  
  let fechaExpiracion = 'Sin vencimiento';
  try {
    if (certificado.fechaExpiracion) {
      fechaExpiracion = new Date(certificado.fechaExpiracion).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  } catch (error) {
    console.error('Error al formatear fecha de expiración:', error);
  }

  // Generar QR code para verificación
  const codigoVerificacion = certificado.codigoVerificacion || certificado.id || 'sin-codigo';
  const urlVerificacion = `${process.env.NEXTAUTH_URL || 'https://sistema-escolar.com'}/verificar-certificado?codigo=${codigoVerificacion}`;
  let qrCodeDataURL = '';
  try {
    qrCodeDataURL = await QRCode.toDataURL(urlVerificacion, {
      width: 120,
      margin: 1,
      color: {
        dark: '#2c5aa0',
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    console.error('Error al generar QR code:', error);
    qrCodeDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; // Imagen vacía de 1x1 píxel
  }

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificado de Estudios</title>
        <style>
            @page {
                size: A4;
                margin: 2cm;
            }
            body {
                font-family: 'Times New Roman', serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
            }
            .certificado {
                max-width: 800px;
                margin: 0 auto;
                padding: 40px;
                border: 3px solid #2c5aa0;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            }
            .header {
                text-align: center;
                margin-bottom: 40px;
                border-bottom: 2px solid #2c5aa0;
                padding-bottom: 20px;
            }
            .logo {
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
                background: #2c5aa0;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
                font-weight: bold;
            }
            .institucion {
                font-size: 24px;
                font-weight: bold;
                color: #2c5aa0;
                margin-bottom: 10px;
            }
            .subtitulo {
                font-size: 16px;
                color: #666;
                margin-bottom: 20px;
            }
            .titulo-certificado {
                font-size: 32px;
                font-weight: bold;
                color: #2c5aa0;
                text-align: center;
                margin: 40px 0;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            .contenido {
                font-size: 18px;
                text-align: justify;
                margin: 30px 0;
                line-height: 2;
            }
            .estudiante {
                font-weight: bold;
                color: #2c5aa0;
                text-transform: uppercase;
                font-size: 20px;
            }
            .detalles {
                margin: 40px 0;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            .detalle-item {
                padding: 10px;
                background: white;
                border-left: 4px solid #2c5aa0;
            }
            .detalle-label {
                font-weight: bold;
                color: #2c5aa0;
                font-size: 14px;
            }
            .detalle-valor {
                font-size: 16px;
                margin-top: 5px;
            }
            .firma {
                margin-top: 60px;
                display: flex;
                justify-content: space-between;
                align-items: end;
            }
            .firma-item {
                text-align: center;
                width: 200px;
            }
            .firma-linea {
                border-top: 2px solid #333;
                margin-bottom: 10px;
            }
            .codigo-verificacion {
                text-align: center;
                margin-top: 40px;
                padding: 20px;
                background: #f8f9fa;
                border: 1px dashed #2c5aa0;
            }
            .codigo {
                font-family: 'Courier New', monospace;
                font-weight: bold;
                font-size: 16px;
                color: #2c5aa0;
            }
        </style>
    </head>
    <body>
        <div class="certificado">
            <div class="header">
                <div class="logo">IE</div>
                <div class="institucion">INSTITUCIÓN EDUCATIVA</div>
                <div class="subtitulo">Sistema de Gestión Académica</div>
            </div>
            
            <div class="titulo-certificado">
                CERTIFICADO DE ESTUDIOS
            </div>
            
            <div class="contenido">
                La Institución Educativa <strong>certifica</strong> que el/la estudiante 
                <span class="estudiante">${certificado.estudiante?.name || 'N/A'}</span>
                identificado(a) con DNI N° <strong>${certificado.estudiante?.dni || 'N/A'}</strong>,
                ${certificado.contenido || 'ha completado satisfactoriamente sus estudios según los registros académicos de esta institución.'}
            </div>
            
            <div class="detalles">
                <div class="detalle-item">
                    <div class="detalle-label">CÓDIGO DEL CERTIFICADO</div>
                    <div class="detalle-valor">${certificado.codigo || 'Sin código'}</div>
                </div>
                <div class="detalle-item">
                    <div class="detalle-label">FECHA DE EMISIÓN</div>
                    <div class="detalle-valor">${fechaEmision}</div>
                </div>
                <div class="detalle-item">
                    <div class="detalle-label">VÁLIDO HASTA</div>
                    <div class="detalle-valor">${fechaExpiracion}</div>
                </div>
                <div class="detalle-item">
                    <div class="detalle-label">ESTADO</div>
                    <div class="detalle-valor">${certificado.estado ? certificado.estado.toUpperCase() : 'ACTIVO'}</div>
                </div>
            </div>
            
            <div class="firma">
                <div class="firma-item">
                    <div class="firma-linea"></div>
                    <div><strong>Director(a)</strong></div>
                    <div>Institución Educativa</div>
                </div>
                <div class="firma-item">
                    <div class="firma-linea"></div>
                    <div><strong>Secretario(a) Académico(a)</strong></div>
                    <div>${certificado.emisor?.name || ''}</div>
                </div>
            </div>
            
            <div class="codigo-verificacion">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                        <div><strong>Código de Verificación:</strong></div>
                        <div class="codigo">${certificado.codigoVerificacion || certificado.id}</div>
                        <div style="font-size: 12px; margin-top: 10px; color: #666;">
                            Verifique la autenticidad de este documento en:
                        </div>
                        <div style="font-size: 12px; margin-top: 5px; color: #2c5aa0; font-weight: bold;">
                            ${process.env.NEXTAUTH_URL || 'https://sistema-escolar.com'}/verificar-certificado
                        </div>
                        <div style="font-size: 10px; margin-top: 5px; color: #999;">
                            Escanee el código QR o ingrese el código manualmente
                        </div>
                    </div>
                    <div style="margin-left: 20px;">
                        <img src="${qrCodeDataURL}" alt="QR Code para verificación" style="width: 100px; height: 100px; border: 1px solid #ddd;" />
                        <div style="text-align: center; font-size: 10px; margin-top: 5px; color: #666;">Escanear para verificar</div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Generar vista previa HTML del certificado
export async function generarVistaPreviaCertificado(id) {
  try {
    const certificado = await db.documento.findUnique({
      where: { id },
      include: {
        estudiante: {
          select: {
            name: true,
            dni: true,
          }
        },
        emisor: {
          select: {
            name: true,
          }
        }
      }
    });
    
    if (!certificado) {
      return { error: 'Certificado no encontrado' };
    }

    const htmlContent = await generarHTMLCertificado(certificado);
    
    return { 
      success: true, 
      htmlContent,
      certificado 
    };
  } catch (error) {
    console.error('Error al generar vista previa:', error);
    return { error: 'Error al generar la vista previa' };
  }
}

// Verificar un certificado por código de verificación
export async function verificarCertificado(codigoVerificacion) {
  try {
    const certificado = await db.documento.findUnique({
      where: {
        codigoVerificacion,
        tipo: 'CERTIFICADO_ESTUDIOS',
      },
      include: {
        estudiante: {
          select: {
            id: true,
            name: true,
            email: true,
            dni: true,
          },
        },
        emisor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    console.log("certificado",certificado)

    if (!certificado) {
      return { error: 'Certificado no encontrado o código inválido' };
    }

    // Marcar como verificado
    await db.documento.update({
      where: { id: certificado.id },
      data: { verificado: true },
    });

    return { 
      success: true, 
      certificado,
      mensaje: 'Certificado verificado correctamente' 
    };
  } catch (error) {
    console.error('Error al verificar certificado:', error);
    return { error: 'Error al verificar el certificado' };
  }
}
