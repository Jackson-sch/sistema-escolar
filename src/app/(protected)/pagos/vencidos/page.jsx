import { Suspense } from 'react';
import PagosVencidosClient from '@/components/pagos/PagosVencidosClient';
import { getStudents } from '@/action/estudiante/estudiante';

async function getEstudiantes() {
  try {
    const response = await getStudents();
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    return [];
  }
}

export default async function PagosVencidosPage() {
  const estudiantes = await getEstudiantes();

  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={<div>Cargando...</div>}>
        <PagosVencidosClient estudiantes={estudiantes} />
      </Suspense>
    </div>
  );
}