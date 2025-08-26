import { NextResponse } from 'next/server';
import { verificarConstancia } from '@/action/documentos/constanciaActions';

export async function POST(request) {
  try {
    const { codigo } = await request.json();
    
    if (!codigo) {
      return NextResponse.json(
        { error: 'El código de verificación es requerido' },
        { status: 400 }
      );
    }

    const { constancia, error } = await verificarConstancia(codigo);

    if (error) {
      return NextResponse.json({ error }, { status: 404 });
    }

    return NextResponse.json({ constancia });
  } catch (error) {
    console.error('Error al verificar constancia:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
