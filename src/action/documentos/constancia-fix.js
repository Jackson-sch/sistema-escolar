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
        verificado: true
      }
    });
    
    return { htmlContent, success: true };
  } catch (error) {
    console.error('Error al generar PDF:', error);
    return { error: 'Error al generar el PDF de la constancia' };
  }
}
