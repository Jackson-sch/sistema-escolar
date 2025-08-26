'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarIcon, Search, X } from 'lucide-react';

export default function FiltrosPagos({ 
  estudiantes = [], 
  onFiltrar, 
  filtrosIniciales = {},
  isLoading = false 
}) {
  const [filtros, setFiltros] = useState({
    estudianteId: filtrosIniciales.estudianteId || '',
    estado: filtrosIniciales.estado || '',
    fechaDesde: filtrosIniciales.fechaDesde || null,
    fechaHasta: filtrosIniciales.fechaHasta || null,
    concepto: filtrosIniciales.concepto || '',
  });

  // Manejar cambios en los filtros
  const handleChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    onFiltrar(filtros);
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    const filtrosLimpios = {
      estudianteId: '',
      estado: '',
      fechaDesde: null,
      fechaHasta: null,
      concepto: '',
    };
    
    setFiltros(filtrosLimpios);
    onFiltrar(filtrosLimpios);
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Estudiante */}
          <div>
            <label className="text-sm font-medium mb-1 block">Estudiante</label>
            <Select 
              value={filtros.estudianteId || "todos"} 
              onValueChange={(value) => handleChange('estudianteId', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los estudiantes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estudiantes</SelectItem>
                {estudiantes.map((estudiante) => (
                  <SelectItem key={estudiante.id} value={estudiante.id}>
                    {estudiante.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estado */}
          <div>
            <label className="text-sm font-medium mb-1 block">Estado</label>
            <Select 
              value={filtros.estado || "todos"} 
              onValueChange={(value) => handleChange('estado', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="pagado">Pagado</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
                <SelectItem value="anulado">Anulado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fecha Desde */}
          <div>
            <label className="text-sm font-medium mb-1 block">Desde</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={"w-full justify-start text-left font-normal"}
                  disabled={isLoading}
                >
                  {filtros.fechaDesde ? (
                    format(filtros.fechaDesde, "PPP", { locale: es })
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filtros.fechaDesde}
                  onSelect={(date) => handleChange('fechaDesde', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Fecha Hasta */}
          <div>
            <label className="text-sm font-medium mb-1 block">Hasta</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={"w-full justify-start text-left font-normal"}
                  disabled={isLoading}
                >
                  {filtros.fechaHasta ? (
                    format(filtros.fechaHasta, "PPP", { locale: es })
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filtros.fechaHasta}
                  onSelect={(date) => handleChange('fechaHasta', date)}
                  disabled={(date) =>
                    filtros.fechaDesde && date < filtros.fechaDesde
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Concepto */}
          <div>
            <label className="text-sm font-medium mb-1 block">Concepto</label>
            <Input
              placeholder="Buscar por concepto"
              value={filtros.concepto}
              onChange={(e) => handleChange('concepto', e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={limpiarFiltros}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
          <Button 
            onClick={aplicarFiltros}
            disabled={isLoading}
          >
            <Search className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
