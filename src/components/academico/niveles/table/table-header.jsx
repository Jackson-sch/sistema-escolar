import React from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, X } from "lucide-react";

export default function TableHeaderActions({ table }) {
  // Función para limpiar todos los filtros
  const limpiarFiltros = () => {
    // Obtener todas las columnas que tienen filtros aplicados
    const columnasConFiltro = table
      .getAllColumns()
      .filter(
        (column) =>
          column.getFilterValue() !== undefined &&
          column.getFilterValue() !== null
      );

    // Eliminar cada filtro individualmente
    columnasConFiltro.forEach((column) => {
      column.setFilterValue(null);
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between py-4 gap-2">
      <div className="flex items-center gap-2">
        {/* Input ocupa el mayor espacio disponible */}
        <Input
          placeholder="Filtrar niveles..."
          value={table.getColumn("nivel")?.getFilterValue() || ""}
          onChange={(event) =>
            table.getColumn("nivel")?.setFilterValue(event.target.value)
          }
          className="w-full sm:max-w-xs"
        />
        <Button
          variant="outline"
          onClick={limpiarFiltros}
          className="flex items-center gap-1"
        >
          <X size={16} />
          <span>Limpiar filtros</span>
        </Button>
      </div>

      {/* Contenedor de botones con distribución flexible */}
      <div className="flex items-center gap-2">
        {/* Botón para limpiar filtros */}

        {/* Menú de columnas */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Columnas <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
