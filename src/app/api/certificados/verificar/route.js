'use server';

import { NextResponse } from 'next/server';
import { verificarCertificado } from '@/action/documentos/certificadoActions';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const codigo = searchParams.get('codigo');

    if (!codigo) {
      return NextResponse.json(
        { error: 'Código de verificación requerido' },
        { status: 400 }
      );
    }

    const result = await verificarCertificado(codigo);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      certificado: result.certificado
    });

  } catch (error) {
    console.error('Error en API de verificación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { codigo } = await request.json();

    if (!codigo) {
      return NextResponse.json(
        { error: 'Código de verificación requerido' },
        { status: 400 }
      );
    }

    const result = await verificarCertificado(codigo);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      certificado: result.certificado
    });

  } catch (error) {
    console.error('Error en API de verificación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
