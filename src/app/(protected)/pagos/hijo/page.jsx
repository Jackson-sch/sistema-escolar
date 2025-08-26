import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getHijosDePadre } from '@/action/relacion-familiar/relacion-familiar';

import { auth } from '@/auth';
import PagosHijoClient from '@/components/pagos/PagosHijoClient';


async function getHijos() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return [];
    }
    
    const response = await getHijosDePadre(session.user.id);
    console.log(response);
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error al obtener hijos del usuario:', error);
    return [];
  }
}

export default async function PagosHijoPage() {
  const hijos = await getHijos();
  
  // Si no hay hijos, redirigir a la página principal
  if (hijos.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No se encontraron estudiantes asociados a su cuenta. Por favor, contacte a la administración.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={<div>Cargando...</div>}>
        <PagosHijoClient hijos={hijos} />
      </Suspense>
    </div>
  );
}