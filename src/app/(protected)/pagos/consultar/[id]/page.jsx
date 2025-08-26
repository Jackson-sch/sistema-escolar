import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import DetallePagoClient from '@/components/pagos/DetallePagoClient';
import { obtenerPagoPorId } from '@/action/pagos/pagoActions';

async function getPago(id) {
  try {
    const response = await obtenerPagoPorId(id);
    if (!response.success) {
      return null;
    }
    return response.pago;
  } catch (error) {
    console.error('Error al obtener pago:', error);
    return null;
  }
}

export default async function DetallePagoPage({ params }) {
  const { id } = params;
  const pago = await getPago(id);

  console.log("pago", pago)
  
  if (!pago) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={<div>Cargando...</div>}>
        <DetallePagoClient pago={pago} />
      </Suspense>
    </div>
  );
}
