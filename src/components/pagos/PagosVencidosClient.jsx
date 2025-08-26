'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, AlertTriangle, Send, Check } from 'lucide-react';

import { obtenerPagos, registrarPagoRealizado } from '@/action/pagos/pagoActions';
import TablaPagos from './TablaPagos';

export default function PagosVencidosClient({ estudiantes = [] }) {
  const router = useRouter();
  const [pagosVencidos, setPagosVencidos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar pagos vencidos
  const cargarPagosVencidos = async () => {
    setIsLoading(true);
    try {
      // Obtener fecha actual
      const fechaActual = new Date();
      fechaActual.setHours(0, 0, 0, 0); // Inicio del día
      
      // Obtener pagos pendientes con fecha de vencimiento anterior a hoy
      const response = await obtenerPagos({
        estado: 'pendiente',
        fechaHasta: fechaActual,
        pageSize: 100 // Obtener más pagos para mostrar todos los vencidos
      });
      
      if (response.success) {
        setPagosVencidos(response.pagos);
      } else {
        console.error('Error al cargar pagos vencidos:', response.error);
        toast.error('Error al cargar los pagos vencidos');
      }
    } catch (error) {
      console.error('Error al cargar pagos vencidos:', error);
      toast.error('Error al cargar los pagos vencidos');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar pagos vencidos al montar el componente
  useEffect(() => {
    cargarPagosVencidos();
  }, []);

  // Registrar pago realizado
  const handleRegistrarPago = async (id, datosPago) => {
    try {
      const response = await registrarPagoRealizado(id, datosPago);
      
      if (response.success) {
        toast.success('Pago registrado exitosamente');
        cargarPagosVencidos(); // Recargar la lista de pagos vencidos
      } else {
        console.error('Error al registrar pago:', response.error);
        toast.error(response.error || 'Error al registrar el pago');
      }
    } catch (error) {
      console.error('Error al registrar pago:', error);
      toast.error('Error al registrar el pago');
    }
  };

  // Ver detalle de pago
  const handleVerDetalle = (pago) => {
    router.push(`/pagos/consultar/${pago.id}`);
  };

  // Enviar recordatorio (función placeholder)
  const enviarRecordatorio = (estudianteId) => {
    toast.info('Funcionalidad de envío de recordatorios en desarrollo');
    // Aquí se implementaría la lógica para enviar recordatorios
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/pagos">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Pagos Vencidos</h1>
      </div>

      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
        <AlertTriangle className="h-5 w-5" />
        <p>
          Esta sección muestra los pagos que han superado su fecha de vencimiento y aún no han sido cancelados.
        </p>
      </div>

      {pagosVencidos.length > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => enviarRecordatorio()}>
            <Send className="h-4 w-4 mr-2" />
            Enviar recordatorios masivos
          </Button>
        </div>
      )}

      {/* Tabla de pagos vencidos */}
      <TablaPagos 
        pagos={pagosVencidos} 
        onRegistrarPago={handleRegistrarPago} 
        onVerDetalle={handleVerDetalle} 
        onEliminar={() => {}} // No permitimos eliminar desde esta vista
        isLoading={isLoading}
      />

      {!isLoading && pagosVencidos.length === 0 && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">No hay pagos vencidos</h3>
            <p className="text-muted-foreground">
              Todos los pagos están al día o han sido cancelados correctamente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
