import { Suspense } from 'react';
import PagosClient from '@/components/pagos/PagosClient';

export default function PagosPage() {
  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={<div>Cargando...</div>}>
        <PagosClient />
      </Suspense>
    </div>
  );
}