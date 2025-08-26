'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

import { registrarPago } from '@/action/pagos/pagoActions';
import FormularioPago from './FormularioPago';

export default function RegistrarPagosClient({ estudiantes = [] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manejar envío del formulario
  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await registrarPago(data);
      
      if (response.success) {
        toast.success('Pago registrado exitosamente');
        router.push('/pagos');
      } else {
        console.error('Error al registrar pago:', response.error);
        toast.error(Array.isArray(response.error) 
          ? response.error.map(err => err.message).join(', ')
          : response.error || 'Error al registrar el pago');
      }
    } catch (error) {
      console.error('Error al registrar pago:', error);
      toast.error('Error al registrar el pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/pagos">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Registrar Nuevo Pago</h1>
      </div>

      <p className="text-muted-foreground">
        Complete el formulario para registrar un nuevo pago en el sistema.
      </p>

      <Card>
        <CardContent className="pt-6">
          <FormularioPago 
            estudiantes={estudiantes} 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
