"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/utils/utils";

export function PaginationTable({ table }) {
  const currentPage = table.getState().pagination.pageIndex;
  const totalPages = table.getPageCount();

  // Función para generar el rango de páginas a mostrar
  const getPageRange = () => {
    const range = [];
    const maxVisiblePages = 5; // Número máximo de páginas visibles

    if (totalPages <= maxVisiblePages) {
      // Si hay menos páginas que el máximo, mostrar todas
      for (let i = 0; i < totalPages; i++) {
        range.push(i);
      }
    } else {
      // Siempre mostrar la primera página
      range.push(0);

      // Calcular el rango central
      let start = Math.max(currentPage - 1, 1);
      let end = Math.min(currentPage + 1, totalPages - 2);

      // Ajustar si estamos cerca del inicio o final
      if (currentPage <= 2) {
        end = 3;
      }
      if (currentPage >= totalPages - 3) {
        start = totalPages - 4;
      }

      // Agregar ellipsis si es necesario
      if (start > 1) {
        range.push("ellipsis1");
      }

      // Agregar páginas del rango central
      for (let i = start; i <= end; i++) {
        range.push(i);
      }

      // Agregar ellipsis si es necesario
      if (end < totalPages - 2) {
        range.push("ellipsis2");
      }

      // Siempre mostrar la última página
      range.push(totalPages - 1);
    }

    return range;
  };

  // Evitar renderizar si no hay páginas
  if (totalPages <= 1) return null;

  return (
    <Pagination>
      <PaginationContent className="flex flex-wrap justify-center gap-2">
        <PaginationItem>
          <PaginationPrevious
            label="Anterior"
            className={
              !table.getCanPreviousPage()
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          />
        </PaginationItem>

        {getPageRange().map((pageIndex, idx) => {
          if (pageIndex === "ellipsis1" || pageIndex === "ellipsis2") {
            return (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={pageIndex}>
              <PaginationLink
                className={cn(
                  "min-w-[2rem] text-center",
                  currentPage === pageIndex
                    ? "bg-primary text-primary-foreground hover:bg-primary rounded-full cursor-pointer transition-all hover:text-primary-foreground font-semibold"
                    : "hover:bg-muted rounded-full cursor-pointer"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  table.setPageIndex(pageIndex);
                }}
              >
                {pageIndex + 1}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            label="Siguiente"
            className={
              !table.getCanNextPage()
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
