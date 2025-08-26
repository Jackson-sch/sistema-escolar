import { Suspense } from 'react';
import RegistrarPagosClient from '@/components/pagos/RegistrarPagosClient';
import { getStudents } from '@/action/estudiante/estudiante';


export default async function RegistrarPagosPage() {
  const { data: estudiantes } = await getStudents();
  console.log(estudiantes);

  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={<div>Cargando...</div>}>
        <RegistrarPagosClient estudiantes={estudiantes} />
      </Suspense>
    </div>
  );
}