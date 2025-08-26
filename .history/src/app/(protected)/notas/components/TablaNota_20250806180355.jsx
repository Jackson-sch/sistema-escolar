"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import {
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Save,
  X,
  Check,
} from "lucide-react";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function TablaNota({ notas, onUpdate, onEdit }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notaToDelete, setNotaToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  console.log("notas", notas)
  
  // Referencias para los inputs (usando un Map para múltiples referencias)
  const inputRefs = useRef(new Map());
  
  // Inicializar los datos cuando cambian las notas
  useEffect(() => {
    setData(notas.map(nota => ({
      ...nota,
      nombreEstudiante: nota.estudiante?.name || "N/A",
      nombreCurso: nota.curso?.nombre || "N/A",
      nombreEvaluacion: nota.evaluacion?.nombre || "N/A",
      nombrePeriodo: nota.evaluacion?.periodo?.nombre || "N/A",
    })));
  }, [notas]);
  
  // Función para eliminar una nota
  const handleDeleteNota = async () => {
    if (!notaToDelete) return;
    
    try {
      setLoading(true);
      const { eliminarNota } = await import('@/action/notas/nota');
      const resultado = await eliminarNota(notaToDelete);
      
      if (resultado.error) {
        throw new Error(resultado.error);
      }
      
      toast.success("Nota eliminada correctamente");
      
      // Actualizar la lista de notas
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error al eliminar nota:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setNotaToDelete(null);
    }
  };
  
  // Función para obtener el estado de la nota según su valor
  const getEstadoNota = useCallback((valor) => {
    if (valor >= 18) return { label: "Excelente", color: "bg-green-500", icon: <CheckCircle2 className="h-4 w-4" /> };
    if (valor >= 14) return { label: "Muy bueno", color: "bg-blue-500", icon: <CheckCircle2 className="h-4 w-4" /> };
    if (valor >= 11) return { label: "Aprobado", color: "bg-yellow-500", icon: <CheckCircle2 className="h-4 w-4" /> };
    return { label: "Desaprobado", color: "bg-red-500", icon: <XCircle className="h-4 w-4" /> };
  }, []);
  
  // Formatear fecha
  const formatearFecha = useCallback((fecha) => {
    if (!fecha) return "N/A";
    try {
      return format(new Date(fecha), "PPP", { locale: es });
    } catch (error) {
      return "Fecha inválida";
    }
  }, []);
  
  // Iniciar edición de una fila
  const startEditing = useCallback((rowId) => {
    console.log('startEditing llamado con rowId:', rowId);
    const row = data.find(item => item.id === rowId);
    if (!row) {
      console.log('No se encontró la fila con id:', rowId);
      return;
    }
    
    console.log('Fila encontrada:', row);
    
    // Establecer los valores editados
    setEditedValues({
      valor: row.valor.toString(),
      comentario: row.comentario || ""
    });
    
    // Establecer la fila en edición
    setEditingRow(rowId);
    console.log('Estado de edición establecido para:', rowId);
  }, [data]);
  
  // Cancelar edición
  const cancelEditing = useCallback(() => {
    setEditingRow(null);
    setEditedValues({});
  }, []);
  
  // Guardar cambios en una nota
  const saveChanges = useCallback(async (rowId) => {
    try {
      setLoading(true);
      
      // Validar el valor de la nota
      const valorStr = editedValues.valor?.trim() || '';
      if (!valorStr) {
        toast.error("La calificación es obligatoria");
        return;
      }
      
      const valor = parseFloat(valorStr);
      if (isNaN(valor) || valor < 0 || valor > 20) {
        toast.error("La calificación debe ser un número entre 0 y 20");
        return;
      }
      
      console.log("Guardando nota:", { id: rowId, valor, comentario: editedValues.comentario });
      
      const { actualizarValorNota } = await import('@/action/notas/nota');
      const resultado = await actualizarValorNota(rowId, {
        valor,
        comentario: editedValues.comentario || ""
      });
      
      if (resultado.error) {
        throw new Error(resultado.error);
      }
      
      toast.success("Nota actualizada correctamente");
      
      // Actualizar la lista de notas
      if (onUpdate) onUpdate();
      
      // Salir del modo edición
      cancelEditing();
    } catch (error) {
      console.error("Error al actualizar nota:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [editedValues, onUpdate, cancelEditing]);
  
  // Manejar cambios en los campos editables
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Para inputs numéricos, validar que solo se ingresen números y decimales
    if (name === 'valor') {
      // Permitir solo números y un punto decimal
      const regex = /^\d*\.?\d*$/;
      if (!regex.test(value) && value !== '') {
        return;
      }
    }
    
    // Actualizar el estado con el nuevo valor
    setEditedValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);
  
  // Manejar teclas especiales (Enter para guardar, Escape para cancelar)
  const handleKeyDown = useCallback((e, rowId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveChanges(rowId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  }, [saveChanges, cancelEditing]);
  
  // Efecto para enfocar el input cuando se inicia la edición
  useEffect(() => {
    if (editingRow) {
      const timer = setTimeout(() => {
        const inputElement = inputRefs.current.get(editingRow);
        if (inputElement) {
          inputElement.focus();
          inputElement.select(); // Seleccionar todo el texto
        }
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [editingRow]);
  
  // Función para establecer la referencia del input
  const setInputRef = useCallback((element, rowId) => {
    if (element) {
      inputRefs.current.set(rowId, element);
    } else {
      inputRefs.current.delete(rowId);
    }
  }, []);
  
  // Definir columnas para TanStack Table
  const columns = useMemo(() => [
    {
      accessorKey: "nombreEstudiante",
      header: "Estudiante",
      cell: ({ row }) => <div className="font-medium">{row.original.estudiante?.name}</div>
    },
    {
      accessorKey: "nombreCurso",
      header: "Curso",
      cell: ({ row }) => row.original.curso?.nombre
    },
    {
      accessorKey: "nombreEvaluacion",
      header: "Evaluación",
      cell: ({ row }) => row.original.evaluacion?.nombre
    },
    {
      accessorKey: "nombrePeriodo",
      header: "Período",
      cell: ({ row }) => row.original.evaluacion?.periodo?.nombre
    },
    {
      accessorKey: "valor",
      header: "Calificación",
      cell: ({ row }) => {
        const isEditing = editingRow === row.original.id;
        
        if (isEditing) {
          return (
            <div className="w-20">
              <input
                type="text"
                name="valor"
                value={editedValues.valor || ''}
                onChange={handleInputChange}
                onKeyDown={(e) => handleKeyDown(e, row.original.id)}
                className="w-full text-center rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                ref={(el) => setInputRef(el, row.original.id)}
                inputMode="decimal"
                placeholder="0-20"
                autoFocus
              />
            </div>
          );
        }
        
        return (
          <div className="text-center font-bold">
            {parseFloat(row.original.valor).toFixed(1)}
          </div>
        );
      }
    },
    {
      accessorKey: "comentario",
      header: "Comentario",
      cell: ({ row }) => {
        const isEditing = editingRow === row.original.id;
        
        if (isEditing) {
          return (
            <Input
              type="text"
              name="comentario"
              value={editedValues.comentario || ""}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, row.original.id)}
              className="w-full"
              placeholder="Comentario opcional"
            />
          );
        }
        
        return (
          <div className="max-w-xs truncate" title={row.original.comentario}>
            {row.original.comentario || "-"}
          </div>
        );
      }
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const estado = getEstadoNota(row.original.valor);
        return (
          <Badge className={`${estado.color} text-white flex items-center gap-1`}>
            {estado.icon}
            {estado.label}
          </Badge>
        );
      }
    },
    {
      accessorKey: "fecha",
      header: "Fecha",
      cell: ({ row }) => formatearFecha(row.original.updatedAt || row.original.createdAt)
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const isEditing = editingRow === row.original.id;
        
        if (isEditing) {
          return (
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => saveChanges(row.original.id)}
                      disabled={loading}
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Guardar cambios (Enter)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={cancelEditing}
                      disabled={loading}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cancelar (Escape)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        }
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  console.log('Iniciando edición para:', row.original.id);
                  startEditing(row.original.id);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar en línea
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit && onEdit(row.original.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Editar en formulario
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => {
                  setNotaToDelete(row.original.id);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ], [editingRow, editedValues, loading, handleInputChange, handleKeyDown, setInputRef, saveChanges, cancelEditing, startEditing, onEdit, getEstadoNota, formatearFecha]);
  
  // Configurar la tabla con TanStack
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });
  
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle>Registro de Calificaciones</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por estudiante, curso, evaluación..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <div className="rounded-md border">
          <ScrollArea className="h-[calc(100vh-350px)]">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className={header.id.includes("acciones") ? "w-[100px]" : ""}>
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
                {loading && !editingRow ? (
                  Array(5).fill(0).map((_, index) => (
                    <TableRow key={index}>
                      {columns.map((_, colIndex) => (
                        <TableCell key={colIndex}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={editingRow === row.original.id ? "bg-muted/50" : ""}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mb-2" />
                        <p>No hay notas registradas</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between border-t p-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {table.getRowModel().rows.length} de {data.length} notas
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-sm">
            {data.length > 0 && (
              <div className="flex items-center gap-2">
                <span>Promedio:</span>
                <Badge className="bg-primary">
                  {(data.reduce((sum, nota) => sum + parseFloat(nota.valor), 0) / data.length).toFixed(1)}
                </Badge>
              </div>
            )}
          </div>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                />
              </PaginationItem>
              
              {Array.from({length: table.getPageCount()}, (_, i) => i + 1).map(page => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => table.setPageIndex(page - 1)}
                    isActive={table.getState().pagination.pageIndex === page - 1}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardFooter>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de eliminar esta nota?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La nota será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteNota}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}