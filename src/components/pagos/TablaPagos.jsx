'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Check, Clock, MoreVertical, X, FileText, CreditCard } from 'lucide-react';

import FormularioPagoRealizado from './FormularioPagoRealizado';

// Función para obtener el color y el icono según el estado
const getEstadoBadge = (estado) => {
  switch (estado) {
    case 'pendiente':
      return { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3 mr-1" /> };
    case 'pagado':
      return { color: 'bg-green-100 text-green-800', icon: <Check className="h-3 w-3 mr-1" /> };
    case 'vencido':
      return { color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="h-3 w-3 mr-1" /> };
    case 'anulado':
      return { color: 'bg-gray-100 text-gray-800', icon: <X className="h-3 w-3 mr-1" /> };
    default:
      return { color: 'bg-blue-100 text-blue-800', icon: <FileText className="h-3 w-3 mr-1" /> };
  }
};

export default function TablaPagos({ 
  pagos = [], 
  onRegistrarPago, 
  onVerDetalle, 
  onEliminar,
  isLoading = false 
}) {
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null);
  const [modalPagoRealizado, setModalPagoRealizado] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manejar registro de pago realizado
  const handleRegistrarPagoRealizado = async (datosPago) => {
    if (!pagoSeleccionado) return;
    
    setIsSubmitting(true);
    try {
      await onRegistrarPago(pagoSeleccionado.id, datosPago);
      setModalPagoRealizado(false);
    } catch (error) {
      console.error('Error al registrar pago:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Abrir modal para registrar pago
  const abrirModalPagoRealizado = (pago) => {
    setPagoSeleccionado(pago);
    setModalPagoRealizado(true);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Concepto</TableHead>
              <TableHead>Estudiante</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Cargando pagos...
                </TableCell>
              </TableRow>
            ) : pagos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No se encontraron pagos.
                </TableCell>
              </TableRow>
            ) : (
              pagos.map((pago) => {
                const { color, icon } = getEstadoBadge(pago.estado);
                const montoTotal = pago.monto - (pago.descuento || 0) + (pago.mora || 0);
                
                return (
                  <TableRow key={pago.id}>
                    <TableCell className="font-medium">
                      {pago.concepto}
                      {pago.numeroBoleta && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Boleta: {pago.numeroBoleta}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className='capitalize'>{pago.estudiante?.name}</p>
                      {pago.estudiante?.dni && (
                        <div className="text-xs text-muted-foreground">
                          DNI: {pago.estudiante.dni}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {montoTotal.toFixed(2)} {pago.moneda}
                      </div>
                      {(pago.descuento > 0 || pago.mora > 0) && (
                        <div className="text-xs">
                          {pago.descuento > 0 && (
                            <span className="text-green-600 mr-1">
                              Desc: -{pago.descuento.toFixed(2)}
                            </span>
                          )}
                          {pago.mora > 0 && (
                            <span className="text-red-600">
                              Mora: +{pago.mora.toFixed(2)}
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(pago.fechaVencimiento), 'dd/MM/yyyy')}
                      {pago.fechaPago && (
                        <div className="text-xs text-muted-foreground">
                          Pagado: {format(new Date(pago.fechaPago), 'dd/MM/yyyy')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${color} flex items-center w-fit`}>
                        {icon}
                        {pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onVerDetalle(pago)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Ver detalles
                          </DropdownMenuItem>
                          
                          {pago.estado === 'pendiente' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => abrirModalPagoRealizado(pago)}
                              >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Registrar pago
                              </DropdownMenuItem>
                            </>
                          )}
                          
                          {pago.estado === 'pendiente' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600" 
                                onClick={() => onEliminar(pago.id)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal para registrar pago realizado */}
      <Dialog open={modalPagoRealizado} onOpenChange={setModalPagoRealizado}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Registrar Pago Realizado</DialogTitle>
            <DialogDescription>
              Complete los datos del pago realizado por el estudiante.
            </DialogDescription>
          </DialogHeader>
          
          {pagoSeleccionado && (
            <FormularioPagoRealizado 
              pago={pagoSeleccionado} 
              onSubmit={handleRegistrarPagoRealizado} 
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
