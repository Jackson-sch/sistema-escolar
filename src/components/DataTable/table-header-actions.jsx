import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search, X } from "lucide-react";

export default function TableHeaderActions({ table, camposBusqueda }) {
  const [valorBusqueda, setValorBusqueda] = useState("");
  const [globalFilterActive, setGlobalFilterActive] = useState(false);


  // Función para aplicar el filtro global
  const aplicarFiltroGlobal = (valor) => {
    setValorBusqueda(valor);
    
    if (!valor) {
      // Al limpiar, aseguramos que se muestren todos los datos
      table.setGlobalFilter(undefined);
      setGlobalFilterActive(false);
    } else {
      table.setGlobalFilter(valor);
      setGlobalFilterActive(true);
    }
  };

  // Función para limpiar todos los filtros
  const limpiarFiltros = () => {
    setValorBusqueda("");
    table.setGlobalFilter(undefined);
    setGlobalFilterActive(false);
  };

  // Configurar el filtro global cuando el componente se monta
  useEffect(() => {
    // Definimos nuestra función de filtro personalizada
    const customFilterFn = (row, columnId, filterValue) => {
      // Si no hay valor de filtro, mostrar todas las filas
      if (!filterValue || filterValue === '') return true;
      
      // Buscar en todas las columnas definidas
      return camposBusqueda.some(campo => {
        const value = row.getValue(campo.id);
        if (value == null) return false;
        
        return String(value)
          .toLowerCase()
          .includes(String(filterValue).toLowerCase());
      });
    };

    // Establecemos nuestra función personalizada como la función de filtro global
    table.setGlobalFilter(undefined);
    
    // Nos aseguramos que la tabla use nuestra función de filtro
    const originalFilterFn = table.getState().globalFilterFn;
    if (!originalFilterFn || originalFilterFn !== customFilterFn) {
      table.options.globalFilterFn = customFilterFn;
    }
    
    // Forzar un re-renderizado para mostrar todos los datos inicialmente
    table.setPageIndex(0);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-between py-2 sm:py-4 gap-2">
      <div className="flex flex-col sm:flex-row w-full sm:w-auto items-start sm:items-center gap-2">
        {/* Contenedor de búsqueda simplificado */}
        <div className="relative flex items-center w-full sm:max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar en todos los campos..."
              value={valorBusqueda}
              onChange={(event) => aplicarFiltroGlobal(event.target.value)}
              className="pl-8 pr-10 w-full"
            />
            {valorBusqueda && (
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={() => aplicarFiltroGlobal("")}
              >
                <X className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>

        {/* Badge de filtros activos y botón para limpiar (visible solo cuando hay filtros) */}
        {/* {globalFilterActive && (
          <Button
            variant="outline"
            size="sm"
            onClick={limpiarFiltros}
            className="flex items-center gap-1 h-8"
          >
            <Badge variant="secondary" className="mr-1">
              1
            </Badge>
            <X className="h-3.5 w-3.5" />
            <span className="text-xs sm:text-sm">Limpiar filtros</span>
          </Button>
        )} */}
      </div>

      {/* Contenedor de botones con distribución flexible */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Menú de columnas */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              Columnas <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Ver/ocultar columnas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}