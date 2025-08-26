// Generar vista previa HTML del certificado
export async function generarVistaPreviaCertificado(id) {
  try {
    const certificado = await db.documento.findUnique({
      where: { id, tipo: 'CERTIFICADO_ESTUDIOS' },
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
