"use client";

import React, { useState, cloneElement, Fragment, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationTable } from "@/components/DataTable/pagination";
import CardGeneral from "@/components/reutilizables/CardGeneral";
import { EmptyTableState } from "./EmptyTableState";

export function GenericDataTable({
  data,
  columns,
  title,
  description,
  TableHeaderComponent,
  ActionComponent,
  renderSubComponent,
  getRowCanExpand,
  initialVisibleColumns = [], // New prop to control initial visible columns
  paginationOptions = { pageSize: 10 },
  cardOptions = { padding: "p-6" },
}) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState(() => {
    // Si se proporciona initialVisibleColumns y no está vacía
    if (initialVisibleColumns && initialVisibleColumns.length > 0) {
      // Crear un objeto donde todas las columnas estén inicialmente ocultas
      const initialState = columns.reduce((acc, column) => {
        acc[column.id || column.accessorKey] = false;
        return acc;
      }, {});
      
      // Luego establezca las columnas especificadas en visible
      initialVisibleColumns.forEach(columnId => {
        initialState[columnId] = true;
      });
      
      return initialState;
    }
    
    // Si no se proporciona inicialVisibleColumns, muestre todas las columnas de forma predeterminada
    return {};
  });
  
  const [rowSelection, setRowSelection] = useState({});

  // Actualizar la visibilidad de la columna si cambia inicialVisiblEcolumns
  useEffect(() => {
    if (initialVisibleColumns && initialVisibleColumns.length > 0) {
      const newVisibility = columns.reduce((acc, column) => {
        const columnId = column.id || column.accessorKey;
        acc[columnId] = initialVisibleColumns.includes(columnId);
        return acc;
      }, {});
      
      setColumnVisibility(newVisibility);
    }
  }, [initialVisibleColumns, columns]);

  // Necesitamos asegurarnos de que renderSubComponent no use hooks directamente
  // en un contexto condicional (dentro de row.getIsExpanded())
  const renderExpandedContent = (row) => {
    if (!renderSubComponent) return null;
    return renderSubComponent({ row });
  };

  const table = useReactTable({
    data,
    columns,
    getRowCanExpand,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: {
      pagination: {
        pageSize: paginationOptions.pageSize,
      },
      columnVisibility: columnVisibility,
    },
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  return (
    <CardGeneral
      title={title}
      description={description}
      className={cardOptions.padding}
    >
      {ActionComponent && (
        <div className="flex items-center justify-end space-x-2 mt-4">
          {typeof ActionComponent === "function" ? (
            <ActionComponent />
          ) : (
            ActionComponent
          )}
        </div>
      )}

      {TableHeaderComponent && (
        <div className="mb-4">
          {typeof TableHeaderComponent === "function" ? (
            <TableHeaderComponent table={table} />
          ) : (
            cloneElement(TableHeaderComponent, { table })
          )}
        </div>
      )}

      {/* Contenedor principal que mantiene la tabla y la paginación juntas */}
      <div className="flex flex-col min-h-[400px]">
        {/* Contenedor de la tabla con flex-grow para expandirse y ocupar el espacio disponible */}
        <div className="flex-grow rounded-md border overflow-hidden bg-background shadow-sm">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <Fragment key={row.id}>
                    <TableRow data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    {row.getIsExpanded() && (
                      <TableRow>
                        <TableCell colSpan={columns.length}>
                          {renderExpandedContent(row)}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <EmptyTableState />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer con información de paginación siempre al final */}
        <div className="flex items-center justify-between space-x-2 py-4 mt-auto">
          <div className="flex-1 text-sm text-muted-foreground">
            Total de {table.getFilteredRowModel().rows.length} registros.
          </div>
          <div className="space-x-2">
            <PaginationTable table={table} />
          </div>
        </div>
      </div>
    </CardGeneral>
  );
}