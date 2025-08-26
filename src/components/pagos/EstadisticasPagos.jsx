'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Check, Clock, DollarSign, TrendingUp, X } from 'lucide-react';

export default function EstadisticasPagos({ estadisticas, isLoading = false }) {
  const [progresoPagos, setProgresoPagos] = useState(0);
  
  // Calcular el progreso de pagos (porcentaje de pagos completados)
  useEffect(() => {
    if (estadisticas) {
      const totalPagos = estadisticas.estadosPagos.reduce(
        (acc, estado) => acc + estado._count.id, 
        0
      );
      
      const pagosPagados = estadisticas.estadosPagos.find(
        estado => estado.estado === 'pagado'
      )?._count.id || 0;
      
      const porcentaje = totalPagos > 0 ? (pagosPagados / totalPagos) * 100 : 0;
      
      // Animación del progreso
      setProgresoPagos(0);
      setTimeout(() => setProgresoPagos(porcentaje), 100);
    }
  }, [estadisticas]);

  // Obtener conteo por estado
  const getConteoEstado = (estado) => {
    if (!estadisticas) return 0;
    return estadisticas.estadosPagos.find(e => e.estado === estado)?._count.id || 0;
  };

  // Obtener suma por estado
  const getSumaEstado = (estado) => {
    if (!estadisticas) return 0;
    return estadisticas.estadosPagos.find(e => e.estado === estado)?._sum.monto || 0;
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-5 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!estadisticas) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No hay datos disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Recaudado */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-green-500" />
              Total Recaudado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              S/ {estadisticas.montoPagado.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              De {getConteoEstado('pagado')} pagos completados
            </p>
          </CardContent>
        </Card>

        {/* Pendiente por Cobrar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-1 text-yellow-500" />
              Pendiente por Cobrar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              S/ {estadisticas.montoPendiente.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              De {getConteoEstado('pendiente')} pagos pendientes
            </p>
          </CardContent>
        </Card>

        {/* Pagos Vencidos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
              Pagos Vencidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estadisticas.pagosVencidos}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pendientes con fecha vencida
            </p>
          </CardContent>
        </Card>

        {/* Próximos a Vencer */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-1 text-blue-500" />
              Próximos a Vencer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estadisticas.proximosVencer}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              En los próximos 7 días
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progreso de pagos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progreso de Pagos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" /> Pagado
                </Badge>
                <span className="text-sm font-medium">
                  {getConteoEstado('pagado')}
                </span>
              </div>
              <div className="text-sm font-medium">
                {progresoPagos.toFixed(0)}%
              </div>
            </div>
            
            <Progress value={progresoPagos} className="h-2" />
            
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <div className="flex items-center justify-center gap-1 text-yellow-600">
                  <Clock className="h-3 w-3" />
                  <span>Pendientes</span>
                </div>
                <div className="font-medium mt-1">{getConteoEstado('pendiente')}</div>
              </div>
              
              <div>
                <div className="flex items-center justify-center gap-1 text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Vencidos</span>
                </div>
                <div className="font-medium mt-1">{estadisticas.pagosVencidos}</div>
              </div>
              
              <div>
                <div className="flex items-center justify-center gap-1 text-gray-600">
                  <X className="h-3 w-3" />
                  <span>Anulados</span>
                </div>
                <div className="font-medium mt-1">{getConteoEstado('anulado')}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
