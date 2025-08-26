import { NextResponse } from 'next/server';
import { obtenerConstanciaPorId, generarVistaPreviaConstancia } from '@/action/documentos/constanciaActions';

/**
 * Endpoint para generar el PDF de una constancia
 * @param {Request} request - Solicitud HTTP
 * @param {Object} params - Parámetros de la ruta
 * @returns {Promise<NextResponse>} Respuesta HTTP con el HTML para generar el PDF
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de constancia no proporcionado' },
        { status: 400 }
      );
    }

    // Obtener la constancia
    const resultado = await obtenerConstanciaPorId(id);
    
    if (resultado.error) {
      return NextResponse.json(
        { error: resultado.error },
        { status: 404 }
      );
    }

    // Generar vista previa HTML
    const htmlResult = await generarVistaPreviaConstancia(id);
    
    if (htmlResult.error) {
      return NextResponse.json(
        { error: htmlResult.error },
        { status: 500 }
      );
    }

    // Devolver el HTML con cabeceras adecuadas
    return new NextResponse(htmlResult.htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="constancia-${resultado.constancia.codigo || id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error al generar PDF de constancia:', error);
    return NextResponse.json(
      { error: 'Error al generar el PDF de la constancia' },
      { status: 500 }
    );
  }
}
