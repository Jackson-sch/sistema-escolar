import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { auth } from '@/auth';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Función para manejar la subida de archivos
export async function POST(request) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Procesar el formulario multipart
    const formData = await request.formData();
    const file = formData.get('file');
    const tipo = formData.get('tipo') || 'expediente';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se ha proporcionado ningún archivo' },
        { status: 400 }
      );
    }

    // Obtener los bytes del archivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Crear un nombre de archivo único
    const originalName = file.name;
    const extension = path.extname(originalName);
    const fileName = `${uuidv4()}${extension}`;
    
    // Determinar la carpeta según el tipo de documento
    let uploadDir;
    switch (tipo.toLowerCase()) {
      case 'expediente':
        uploadDir = 'expedientes';
        break;
      case 'certificado':
        uploadDir = 'certificados';
        break;
      default:
        uploadDir = 'documentos';
    }

    // Asegurarse de que el directorio existe
    const publicDir = join(process.cwd(), 'public');
    const uploadPath = join(publicDir, uploadDir);
    
    try {
      // Intentar crear el directorio si no existe
      await writeFile(join(uploadPath, '.keep'), '');
    } catch (error) {
      console.log('El directorio ya existe o no se pudo crear');
    }

    // Guardar el archivo
    const filePath = join(uploadPath, fileName);
    await writeFile(filePath, buffer);

    // Devolver la URL del archivo
    const fileUrl = `/${uploadDir}/${fileName}`;
    
    return NextResponse.json({
      success: true,
      fileUrl,
      fileName,
      originalName
    });
    
  } catch (error) {
    console.error('Error al subir el archivo:', error);
    return NextResponse.json(
      { error: 'Error al procesar el archivo' },
      { status: 500 }
    );
  }
}
