'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { z } from 'zod';
import { formatDate } from '@/lib/formatDate';
import { getInstituciones } from '@/action/config/institucion-action';

/**
 * Genera un código QR a partir de una URL
 * @param {string} url - URL para codificar en el QR
 * @returns {Promise<string>} - URL de datos del código QR
 */
async function generarQRCode(url) {
  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    return qrDataUrl;
  } catch (error) {
    console.error('Error al generar código QR:', error);
    return '';
  }
}

/**
 * Genera un código de verificación único para constancias
 * @returns {string} - Código de verificación
 */
function generarCodigoVerificacion() {
  const timestamp = Date.now().toString();
  const randomBytes = crypto.randomBytes(4).toString('hex');
  return `CONST-${timestamp.substring(timestamp.length - 6)}-${randomBytes}`;
}

// Esquema de validación para constancias
const constanciaSchema = z.object({
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

// La función generarCodigoVerificacion ya está definida arriba

/**
 * Obtiene todas las constancias
 * @returns {Promise<{constancias: Array, error: string}>}
 */
export async function obtenerConstancias() {
  try {
    const constancias = await db.documento.findMany({
      where: {
        tipo: {
          in: ['CONSTANCIA_MATRICULA', 'CONSTANCIA_VACANTE', 'CONSTANCIA_EGRESADO']
        }
      },
      include: {
        estudiante: {
          select: {
            id: true,
            name: true,
            email: true,
            matriculas: true,
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
    console.log("constancias", constancias)
    return { constancias };
  } catch (error) {
    console.error('Error al obtener constancias:', error);
    return { error: 'Error al obtener las constancias' };
  }
}

/**
 * Obtiene una constancia por su ID
 * @param {string} id - ID de la constancia
 * @returns {Promise<{constancia: Object, error: string}>}
 */
export async function obtenerConstanciaPorId(id) {
  try {
    const constancia = await db.documento.findFirst({
      where: {
        id,
        tipo: {
          in: ['CONSTANCIA_MATRICULA', 'CONSTANCIA_VACANTE', 'CONSTANCIA_EGRESADO']
        }
      },
      include: {
        estudiante: {
          select: {
            id: true,
            name: true,
            email: true,
            matriculas: true,
            nivelAcademico: {
              select: {
                id: true,
                nivel: true,
                grado: true,
                seccion: true
              }
            },
          },
        },
        emisor: {
          select: {
            id: true,
            name: true,
            email: true,
            cargo: true,
          },
        },
      },
    });

    if (!constancia) {
      return { error: 'Constancia no encontrada' };
    }

    return { constancia };
  } catch (error) {
    console.error('Error al obtener constancia:', error);
    return { error: 'Error al obtener la constancia' };
  }
}

/**
 * Registra una nueva constancia
 * @param {Object} data - Datos de la constancia
 * @returns {Promise<{constancia: Object, error: string}>}
 */
export async function registrarConstancia(data) {
  try {
    // Verificar sesión de usuario
    const session = await auth();
    if (!session || !session.user) {
      return { error: 'No autorizado' };
    }

    // Validar datos
    const validatedData = constanciaSchema.parse({
      titulo: data.titulo,
      descripcion: data.observaciones || '',
      contenido: data.contenido,
      formato: data.formato || 'PDF',
      plantilla: data.plantilla,
      codigo: data.codigo || generarCodigoVerificacion().substring(6),
      fechaExpiracion: data.fechaExpiracion ? new Date(data.fechaExpiracion) : undefined,
      estudianteId: data.estudianteId,
      datosAdicionales: data.datosAdicionales || {},
    });

    // Verificar si ya existe una constancia con el mismo código
    const existingConstancia = await db.documento.findUnique({
      where: { codigo: validatedData.codigo },
    });

    if (existingConstancia) {
      return { error: 'Ya existe una constancia con este código' };
    }

    // Generar código de verificación único
    const codigoVerificacion = generarCodigoVerificacion();

    // Crear la constancia en la base de datos
    const constancia = await db.documento.create({
      data: {
        titulo: validatedData.titulo,
        descripcion: validatedData.descripcion,
        contenido: validatedData.contenido,
        codigo: validatedData.codigo,
        codigoVerificacion,
        fechaEmision: data.fechaEmision || new Date(),
        fechaExpiracion: validatedData.fechaExpiracion,
        tipo: data.tipo || 'CONSTANCIA_MATRICULA',
        formato: validatedData.formato,
        plantilla: validatedData.plantilla,
        estado: 'activo',
        datosAdicionales: validatedData.datosAdicionales,
        estudiante: data.estudianteId
          ? { connect: { id: data.estudianteId } }
          : undefined,
        emisor: {
          connect: { id: data.emisorId || session.user.id },
        },
      },
    });

    revalidatePath('/documentos/constancias');
    return { constancia };
  } catch (error) {
    console.error('Error al registrar constancia:', error);
    return { error: 'Error al registrar la constancia' };
  }
}

/**
 * Actualiza una constancia existente
 * @param {string} id - ID de la constancia
 * @param {Object} data - Datos actualizados
 * @returns {Promise<{constancia: Object, error: string}>}
 */
export async function actualizarConstancia(id, data) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { error: 'No autorizado' };
    }

    // Validar datos
    const validatedData = constanciaSchema.parse({
      titulo: data.titulo,
      descripcion: data.observaciones || '',
      contenido: data.contenido,
      formato: data.formato || 'PDF',
      plantilla: data.plantilla,
      codigo: data.codigo,
      fechaExpiracion: data.fechaExpiracion ? new Date(data.fechaExpiracion) : undefined,
      estudianteId: data.estudianteId,
      datosAdicionales: data.datosAdicionales || {},
    });

    // Verificar que la constancia existe
    const existingConstancia = await db.documento.findUnique({
      where: { id },
    });

    if (!existingConstancia) {
      return { error: 'Constancia no encontrada' };
    }

    // Actualizar la constancia
    const constancia = await db.documento.update({
      where: { id },
      data: {
        titulo: validatedData.titulo,
        descripcion: validatedData.descripcion,
        contenido: validatedData.contenido,
        fechaEmision: data.fechaEmision ? new Date(data.fechaEmision) : undefined,
        fechaExpiracion: validatedData.fechaExpiracion,
        formato: validatedData.formato,
        plantilla: validatedData.plantilla,
        estado: data.estado || 'activo',
        datosAdicionales: validatedData.datosAdicionales,
        estudiante: data.estudianteId
          ? { connect: { id: data.estudianteId } }
          : undefined,
        emisor: data.emisorId
          ? { connect: { id: data.emisorId } }
          : undefined,
      },
    });

    revalidatePath('/documentos/constancias');
    return { constancia };
  } catch (error) {
    console.error('Error al actualizar constancia:', error);
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: 'Error al actualizar la constancia' };
  }
}

/**
 * Elimina una constancia
 * @param {string} id - ID de la constancia
 * @returns {Promise<{success: boolean, error: string}>}
 */
export async function eliminarConstancia(id) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { error: 'No autorizado' };
    }

    // Verificar que la constancia existe
    const constancia = await db.documento.findUnique({
      where: {
        id,
        tipo: {
          in: ['CONSTANCIA_MATRICULA', 'CONSTANCIA_VACANTE', 'CONSTANCIA_EGRESADO']
        }
      },
    });

    if (!constancia) {
      return { error: 'Constancia no encontrada' };
    }

    // Eliminar la constancia
    await db.documento.delete({
      where: { id },
    });

    revalidatePath('/documentos/constancias');
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar constancia:', error);
    return { error: 'Error al eliminar la constancia' };
  }
}

/**
 * Verifica la autenticidad de una constancia por su código
 * @param {string} codigo - Código de verificación
 * @returns {Promise<{constancia: Object, error: string}>}
 */
export async function verificarConstancia(codigo) {
  try {
    // Buscar por código o por codigoVerificacion
    const constancia = await db.documento.findFirst({
      where: {
        OR: [
          { codigo },
          { codigoVerificacion: codigo },
          { id: codigo },
        ],
        tipo: {
          in: ['CONSTANCIA_MATRICULA', 'CONSTANCIA_VACANTE', 'CONSTANCIA_EGRESADO']
        }
      },
      include: {
        estudiante: {
          select: {
            id: true,
            name: true,
            email: true,
            matriculas: true,
            nivelAcademico: {
              select: {
                id: true,
                nivel: true,
                grado: true,
                seccion: true
              }
            },
          },
        },
        emisor: {
          select: {
            id: true,
            name: true,
            cargo: true,
          },
        },
      },
    });

    console.log('Resultado verificación constancia:', constancia);

    if (!constancia) {
      return { error: 'Constancia no encontrada o código inválido' };
    }

    return { constancia };
  } catch (error) {
    console.error('Error al verificar constancia:', error);
    return { error: 'Error al verificar la constancia' };
  }
}

/**
 * Genera la vista previa HTML de una constancia
 * @param {string} id - ID de la constancia
 * @returns {Promise<{htmlContent: string, error: string}>}
 */
export async function generarVistaPreviaConstancia(id) {
  try {
    // Obtener la constancia con todos los datos necesarios
    const { constancia, error } = await obtenerConstanciaPorId(id);

    if (error) {
      return { error };
    }

    // Obtener datos adicionales de la institución
    const institucion = await getInstituciones();

    // Generar el código QR para verificación
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificacionUrl = `${baseUrl}/verificar-constancia?codigo=${constancia.codigoVerificacion}`;
    const qrCodeDataURL = await generarQRCode(verificacionUrl);

    // Generar el HTML para la constancia
    const htmlContent = generarHTMLConstancia(constancia, institucion, qrCodeDataURL);

    return { htmlContent };
  } catch (error) {
    console.error('Error al generar vista previa:', error);
    return { error: 'Error al generar la vista previa de la constancia' };
  }
}

/**
 * Genera el PDF de una constancia
 * @param {string} id - ID de la constancia
 * @returns {Promise<{htmlContent: string, success: boolean, error: string}>}
 */
export async function generarPDFConstancia(id) {
  try {
    // Obtener la constancia
    const { constancia, error } = await obtenerConstanciaPorId(id);

    if (error) {
      return { error };
    }

    // Obtener datos adicionales de la institución
    const respuestaInstitucion = await getInstituciones();

    if (!respuestaInstitucion.success || !respuestaInstitucion.data || respuestaInstitucion.data.length === 0) {
      return { error: 'No se pudo obtener información de la institución' };
    }

    const institucion = respuestaInstitucion.data[0];

    // Generar el código QR para verificación
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificacionUrl = `${baseUrl}/verificar-constancia?codigo=${constancia.codigoVerificacion}`;
    const qrCodeDataURL = await generarQRCode(verificacionUrl);

    // Generar el HTML para la constancia
    const htmlContent = generarHTMLConstancia(constancia, institucion, qrCodeDataURL);

    // Actualizar la URL del archivo en la base de datos
    const pdfUrl = `${baseUrl}/api/constancias/${id}/pdf`;

    await db.documento.update({
      where: { id },
      data: {
        archivoUrl: pdfUrl,
        updatedAt: new Date(),
        verificado: true
      },
    });

    return { htmlContent, success: true };
  } catch (error) {
    console.error('Error al generar PDF:', error);
    return { error: 'Error al generar el PDF de la constancia' };
  }
}

/**
 * Genera el HTML para una constancia
 * @param {Object} constancia - Datos de la constancia
 * @param {Object} institucion - Datos de la institución
 * @param {string} qrCodeDataURL - URL de datos del código QR para verificación
 * @returns {string} HTML de la constancia
 */
function generarHTMLConstancia(constancia, institucion, qrCodeDataURL) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const logoUrl = institucion?.logo ? `${baseUrl}${institucion.logo}` : `${baseUrl}/next.svg`;
  const fechaEmision = formatDate(constancia.fechaEmision, 'PPP');
  const fechaExpiracion = constancia.fechaExpiracion ? formatDate(constancia.fechaExpiracion, 'PPP') : null;
  const verificacionUrl = `${baseUrl}/verificar-constancia?codigo=${constancia.codigoVerificacion || constancia.codigo || constancia.id}`;

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${constancia.titulo || "Constancia"}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      
      @page {
        size: A4;
        margin: 0;
      }
      
      * {
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #1a202c;
        margin: 0;
        padding: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        width: 210mm;
        height: 297mm;
        position: relative;
      }
      
      .background-pattern {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0.03;
        background-image: 
          radial-gradient(circle at 25% 25%, #667eea 2px, transparent 2px),
          radial-gradient(circle at 75% 75%, #764ba2 2px, transparent 2px);
        background-size: 50px 50px;
        background-position: 0 0, 25px 25px;
      }
      
      .container {
        width: 190mm;
        min-height: 277mm;
        margin: 10mm auto;
        padding: 25mm;
        background: #ffffff;
        position: relative;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        overflow: hidden;
      }
      
      .container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 6px;
        background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
      }
      
      .header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        position: relative;
      }
      
      .header::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 80px;
        height: 3px;
        background: linear-gradient(90deg, #667eea, #764ba2);
        border-radius: 2px;
      }
      
      .logo {
        max-height: 70px;
        margin-bottom: 15px;
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
      }
      
      .institucion {
        font-size: 22px;
        font-weight: 600;
        margin: 0;
        color: #2d3748;
        letter-spacing: -0.025em;
      }
      
      .titulo {
        font-size: 28px;
        font-weight: 700;
        text-align: center;
        margin: 25px 0;
        color: #667eea;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        position: relative;
      }
      
      .titulo::before,
      .titulo::after {
        content: '';
        position: absolute;
        top: 50%;
        width: 60px;
        height: 2px;
        background: linear-gradient(90deg, transparent, #667eea, transparent);
      }
      
      .titulo::before {
        left: -80px;
      }
      
      .titulo::after {
        right: -80px;
      }
      
      .tipo-constancia {
        font-size: 16px;
        color: #718096;
        text-align: center;
        margin-bottom: 25px;
        font-weight: 500;
        padding: 8px 20px;
        background: linear-gradient(135deg, #f7fafc, #edf2f7);
        border-radius: 20px;
        display: inline-block;
        margin-left: 50%;
        transform: translateX(-50%);
      }
      
      .contenido {
        font-size: 15px;
        text-align: justify;
        margin: 25px 0;
        line-height: 1.8;
        color: #2d3748;
        padding: 20px;
        background: #f8fafc;
        border-radius: 8px;
        border-left: 4px solid #667eea;
        position: relative;
      }
      
      .contenido::before {
        content: '"';
        position: absolute;
        top: -10px;
        left: 15px;
        font-size: 60px;
        color: #667eea;
        opacity: 0.3;
        font-family: Georgia, serif;
      }
      
      .detalles-estudiante {
        margin: 25px 0;
        padding: 20px;
        background: linear-gradient(135deg, #ffffff, #f8fafc);
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
      
      .detalles-estudiante h3 {
        color: #667eea;
        margin-top: 0;
        margin-bottom: 15px;
        font-weight: 600;
        font-size: 18px;
        display: flex;
        align-items: center;
      }
      
      .detalles-estudiante h3::before {
        content: '👤';
        margin-right: 8px;
        font-size: 20px;
      }
      
      .detalles-estudiante p {
        margin: 8px 0;
        color: #2d3748;
        display: flex;
        align-items: center;
      }
      
      .detalles-estudiante strong {
        color: #4a5568;
        min-width: 80px;
        font-weight: 600;
      }
      
      .firma-section {
        margin-top: 50px;
        display: flex;
        justify-content: space-between;
        align-items: end;
      }
      
      .firma {
        text-align: center;
        flex: 1;
      }
      
      .linea-firma {
        width: 200px;
        height: 2px;
        background: linear-gradient(90deg, transparent, #2d3748, transparent);
        margin: 15px auto;
      }
      
      .nombre-emisor {
        font-weight: 600;
        margin: 0;
        color: #2d3748;
        font-size: 15px;
      }
      
      .cargo-emisor {
        margin: 5px 0 0;
        color: #718096;
        font-size: 13px;
        font-weight: 500;
      }
      
      .sello {
        position: absolute;
        bottom: 120px;
        right: 80px;
        opacity: 0.15;
        transform: rotate(-15deg);
        font-size: 16px;
        font-weight: 700;
        border: 3px solid #667eea;
        color: #667eea;
        padding: 15px;
        border-radius: 50%;
        width: 100px;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        background: radial-gradient(circle, rgba(102, 126, 234, 0.1), transparent);
      }
      
      .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 2px solid #e2e8f0;
      }
      
      .fecha-emision {
        text-align: center;
        font-weight: 600;
        color: #667eea;
        font-size: 14px;
        margin-bottom: 20px;
        padding: 10px;
        background: linear-gradient(135deg, #f7fafc, #edf2f7);
        border-radius: 8px;
      }
      
      .verificacion {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px;
        background: linear-gradient(135deg, #ffffff, #f8fafc);
        border: 2px dashed #667eea;
        border-radius: 12px;
        margin-top: 15px;
      }
      
      .qr-container {
        text-align: center;
      }
      
      .qr-container img {
        width: 80px;
        height: 80px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        padding: 4px;
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      .verificacion-info {
        flex: 1;
        margin-left: 20px;
      }
      
      .verificacion-info p {
        margin: 4px 0;
        font-size: 11px;
        color: #4a5568;
      }
      
      .codigo {
        font-family: 'Monaco', 'Menlo', monospace;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 6px 12px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 11px;
        display: inline-block;
        margin: 2px 0;
        letter-spacing: 0.5px;
      }
      
      .security-features {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        background: linear-gradient(45deg, #667eea, #764ba2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 18px;
        opacity: 0.8;
      }
      
      .watermark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 120px;
        color: #667eea;
        opacity: 0.02;
        font-weight: 900;
        z-index: 0;
        pointer-events: none;
      }
      
      @media print {
        body {
          background: white;
        }
        
        .container {
          box-shadow: none;
          margin: 0;
          width: 210mm;
          padding: 20mm;
        }
        
        .background-pattern {
          display: none;
        }
      }
    </style>
  </head>
  <body>
    <div class="background-pattern"></div>
    <div class="container">
      <div class="watermark">OFICIAL</div>
      <div class="security-features">🔒</div>
      
      <div class="header">
        <img src="${logoUrl}" alt="Logo Institución" class="logo">
        <h1 class="institucion">${institucion?.nombre || "Institución Educativa"}</h1>
      </div>
      
      <h2 class="titulo">${constancia.titulo}</h2>
      
      <div class="tipo-constancia">
        ${
          constancia.tipo === "CONSTANCIA_MATRICULA"
            ? "Constancia de Matrícula"
            : constancia.tipo === "CONSTANCIA_ESTUDIOS"
              ? "Constancia de Estudios"
              : "Constancia Académica"
        }
      </div>
      
      <div class="contenido">
        ${constancia.contenido}
      </div>
      
      ${
        constancia.estudiante
          ? `
      <div class="detalles-estudiante">
        <h3>Información del Estudiante</h3>
        <p><strong>Nombre:</strong> ${constancia.estudiante.name}</p>
        <p><strong>Código:</strong> ${constancia.codigo}</p>
        ${constancia.estudiante.email ? `<p><strong>Email:</strong> ${constancia.estudiante.email}</p>` : ""}
      </div>
      `
          : ""
      }
      
      <div class="firma-section">
        <div class="firma">
          <div class="linea-firma"></div>
          <p class="nombre-emisor">${constancia.emisor?.name || "Nombre del Emisor"}</p>
          <p class="cargo-emisor">${constancia.emisor?.cargo || "Administrador del Sistema"}</p>
        </div>
      </div>
      
      <div class="sello">OFICIAL</div>
      
      <div class="footer">
        <div class="fecha-emision">
          📅 Emitido el ${fechaEmision}
          ${fechaExpiracion ? ` • Válido hasta ${fechaExpiracion}` : ""}
        </div>
        
        <div class="verificacion">
          <div class="qr-container">
            <img src="${qrCodeDataURL}" alt="Código QR de verificación">
          </div>
          <div class="verificacion-info">
            <p><strong>🔍 Verificación Digital</strong></p>
            <p>Escanee el código QR o visite el enlace:</p>
            <div class="codigo">${verificacionUrl}</div>
            <p>Código de verificación:</p>
            <div class="codigo">${constancia.codigoVerificacion || constancia.codigo || constancia.id}</div>
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>
`
}

/**
 * Obtiene constancias por tipo específico
 * @param {string} tipo - Tipo de constancia (CONSTANCIA_MATRICULA, CONSTANCIA_VACANTE, etc.)
 * @returns {Promise<{constancias: Object[], error: string}>}
 */
export async function obtenerConstanciasPorTipo(tipo) {
  try {
    const constancias = await db.documento.findMany({
      where: {
        tipo
      },
      include: {
        estudiante: {
          select: {
            id: true,
            name: true,
            email: true,
            matriculas: true,
            nivelAcademico: {
              select: {
                id: true,
                nivel: true,
                grado: true,
                seccion: true
              }
            },
          },
        },
        emisor: {
          select: {
            id: true,
            name: true,
            email: true,
            cargo: true,
          },
        },
      },
      orderBy: {
        fechaEmision: 'desc',
      },
    });

    return { constancias };
  } catch (error) {
    console.error(`Error al obtener constancias de tipo ${tipo}:`, error);
    return { error: `Error al obtener las constancias de tipo ${tipo}` };
  }
}

/**
 * Obtiene estadísticas de constancias (conteo por estado)
 * @returns {Promise<{stats: Object, error: string}>}
 */
export async function obtenerEstadisticasConstancias() {
  try {
    // Obtener conteo de constancias por estado
    const totalConstancias = await db.documento.count({
      where: {
        tipo: {
          in: ['CONSTANCIA_MATRICULA', 'CONSTANCIA_VACANTE', 'CONSTANCIA_EGRESADO']
        }
      }
    });

    const constanciasActivas = await db.documento.count({
      where: {
        tipo: {
          in: ['CONSTANCIA_MATRICULA', 'CONSTANCIA_VACANTE', 'CONSTANCIA_EGRESADO']
        },
        estado: 'activo'
      }
    });

    const constanciasInactivas = await db.documento.count({
      where: {
        tipo: {
          in: ['CONSTANCIA_MATRICULA', 'CONSTANCIA_VACANTE', 'CONSTANCIA_EGRESADO']
        },
        estado: 'inactivo'
      }
    });

    // Conteo por tipo de constancia
    const constanciasMatricula = await db.documento.count({
      where: {
        tipo: 'CONSTANCIA_MATRICULA'
      }
    });

    const constanciasVacante = await db.documento.count({
      where: {
        tipo: 'CONSTANCIA_VACANTE'
      }
    });

    const constanciasEgresado = await db.documento.count({
      where: {
        tipo: 'CONSTANCIA_EGRESADO'
      }
    });

    // Constancias emitidas este mes
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const constanciasEmitidasEsteMes = await db.documento.count({
      where: {
        tipo: {
          in: ['CONSTANCIA_MATRICULA', 'CONSTANCIA_VACANTE', 'CONSTANCIA_EGRESADO']
        },
        fechaEmision: {
          gte: inicioMes
        }
      }
    });

    return {
      stats: {
        total: totalConstancias,
        activas: constanciasActivas,
        inactivas: constanciasInactivas,
        porTipo: {
          matricula: constanciasMatricula,
          vacante: constanciasVacante,
          egresado: constanciasEgresado,
        },
        emitidasEsteMes: constanciasEmitidasEsteMes
      }
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de constancias:', error);
    return { error: 'Error al obtener estadísticas de constancias' };
  }
}
