'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

import { obtenerPagos, registrarPagoRealizado, eliminarPago } from '@/action/pagos/pagoActions';
import FiltrosPagos from './FiltrosPagos';
import TablaPagos from './TablaPagos';

export default function ConsultarPagosClient({ estudiantes = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [pagos, setPagos] = useState([]);
  console.log("pagos", pagos)
  const [isLoading, setIsLoading] = useState(true);
  const [paginacion, setPaginacion] = useState({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0
  });
  const [filtros, setFiltros] = useState({
    estudianteId: searchParams.get('estudianteId') || '',
    estado: searchParams.get('estado') || '',
    fechaDesde: searchParams.get('fechaDesde') ? new Date(searchParams.get('fechaDesde')) : null,
    fechaHasta: searchParams.get('fechaHasta') ? new Date(searchParams.get('fechaHasta')) : null,
    concepto: searchParams.get('concepto') || '',
    page: parseInt(searchParams.get('page') || '1'),
  });
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [pagoIdEliminar, setPagoIdEliminar] = useState(null);

  // Cargar pagos con filtros
  const cargarPagos = async (filtrosActuales = filtros) => {
    setIsLoading(true);
    try {
      const response = await obtenerPagos({
        ...filtrosActuales,
        page: filtrosActuales.page || 1,
        pageSize: 10
      });
      
      if (response.success) {
        setPagos(response.pagos);
        setPaginacion(response.pagination);
      } else {
        console.error('Error al cargar pagos:', response.error);
        toast.error('Error al cargar los pagos');
      }
    } catch (error) {
      console.error('Error al cargar pagos:', error);
      toast.error('Error al cargar los pagos');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar pagos al montar el componente o cuando cambian los filtros
  useEffect(() => {
    cargarPagos();
  }, [filtros.page]);

  // Manejar cambio de página
  const cambiarPagina = (nuevaPagina) => {
    setFiltros(prev => ({
      ...prev,
      page: nuevaPagina
    }));
  };

  // Aplicar filtros
  const aplicarFiltros = (nuevosFiltros) => {
    setFiltros({
      ...nuevosFiltros,
      page: 1 // Resetear a la primera página al aplicar filtros
    });
    cargarPagos({
      ...nuevosFiltros,
      page: 1
    });
  };

  // Registrar pago realizado
  const handleRegistrarPago = async (id, datosPago) => {
    try {
      const response = await registrarPagoRealizado(id, datosPago);
      
      if (response.success) {
        toast.success('Pago registrado exitosamente');
        cargarPagos(); // Recargar la lista de pagos
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
    setPagoSeleccionado(pago);
    // Aquí podríamos implementar un modal para ver detalles o redirigir a una página de detalle
    router.push(`/pagos/consultar/${pago.id}`);
  };

  // Eliminar pago
  const handleEliminar = (id) => {
    setPagoIdEliminar(id);
    setConfirmarEliminar(true);
  };

  // Confirmar eliminación de pago
  const confirmarEliminarPago = async () => {
    try {
      const response = await eliminarPago(pagoIdEliminar);
      
      if (response.success) {
        toast.success('Pago eliminado exitosamente');
        cargarPagos(); // Recargar la lista de pagos
      } else {
        console.error('Error al eliminar pago:', response.error);
        toast.error(response.error || 'Error al eliminar el pago');
      }
    } catch (error) {
      console.error('Error al eliminar pago:', error);
      toast.error('Error al eliminar el pago');
    } finally {
      setConfirmarEliminar(false);
      setPagoIdEliminar(null);
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
        <h1 className="text-2xl font-bold">Consultar Pagos</h1>
      </div>

      <p className="text-muted-foreground">
        Utilice los filtros para buscar pagos específicos en el sistema.
      </p>

      {/* Filtros */}
      <FiltrosPagos 
        estudiantes={estudiantes} 
        onFiltrar={aplicarFiltros} 
        filtrosIniciales={filtros}
        isLoading={isLoading}
      />

      {/* Tabla de pagos */}
      <TablaPagos 
        pagos={pagos} 
        onRegistrarPago={handleRegistrarPago} 
        onVerDetalle={handleVerDetalle} 
        onEliminar={handleEliminar}
        isLoading={isLoading}
      />

      {/* Paginación */}
      {paginacion.totalPages > 0 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (paginacion.page > 1) {
                    cambiarPagina(paginacion.page - 1);
                  }
                }}
                className={paginacion.page <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            
            {Array.from({ length: paginacion.totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    cambiarPagina(page);
                  }}
                  isActive={page === paginacion.page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (paginacion.page < paginacion.totalPages) {
                    cambiarPagina(paginacion.page + 1);
                  }
                }}
                className={paginacion.page >= paginacion.totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={confirmarEliminar} onOpenChange={setConfirmarEliminar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el pago seleccionado y no se puede deshacer.
              Solo se pueden eliminar pagos en estado pendiente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarEliminarPago} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
