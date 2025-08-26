'use server'
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Construir filtros
    let where = {};
    
    // Filtrar por rol si se especifica
    if (role) {
      where.role = role;
    }
    
    // Filtrar por término de búsqueda si se especifica
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Consultar usuarios
    const usuarios = await db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        dni: true,
        createdAt: true,
      },
      orderBy: {
        name: 'asc',
      },
      take: limit,
    });
    
    return NextResponse.json({ 
      success: true,
      usuarios 
    });
    
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
