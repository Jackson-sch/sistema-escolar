import { generarVistaPreviaCertificado, obtenerCertificadoPorId } from '@/action/documentos/certificadoActions';
import { NextResponse } from 'next/server';


export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID del certificado requerido' },
        { status: 400 }
      );
    }

    // Obtenemos el certificado
    const certificado = await obtenerCertificadoPorId(id);
    if (!certificado || certificado.error) {
      return NextResponse.json(
        { error: certificado?.error || 'Certificado no encontrado' },
        { status: 404 }
      );
    }

    // Generamos la vista previa HTML
    const resultado = await generarVistaPreviaCertificado(id);

    if (!resultado.success) {
      return NextResponse.json(
        { error: resultado.error || 'Error al generar el certificado' },
        { status: 500 }
      );
    }

    // Devolvemos el HTML con cabeceras que indican al navegador que es un PDF
    return new NextResponse(resultado.htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="certificado-${certificado.success ? (certificado.certificado.codigo || certificado.certificado.id) : id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error al generar PDF:', error);
    return NextResponse.json(
      { error: 'Error al generar el PDF' },
      { status: 500 }
    );
  }
}
