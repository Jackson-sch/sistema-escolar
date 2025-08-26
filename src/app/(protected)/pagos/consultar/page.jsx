import { Suspense } from 'react';
import ConsultarPagosClient from '@/components/pagos/ConsultarPagosClient';
import { getStudents } from '@/action/estudiante/estudiante';

async function getEstudiantes() {
  try {
    const response = await getStudents();
    return response.success ? response.estudiantes : [];
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    return [];
  }
}

export default async function ConsultarPagosPage() {
  const estudiantes = await getEstudiantes();

  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={<div>Cargando...</div>}>
        <ConsultarPagosClient estudiantes={estudiantes} />
      </Suspense>
    </div>
  );
}