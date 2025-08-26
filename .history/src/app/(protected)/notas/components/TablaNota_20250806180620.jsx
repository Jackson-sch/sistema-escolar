"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function TablaNota({ notas, onUpdate, onEdit }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notaToDelete, setNotaToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  console.log("notas", notas);

  // Referencias para los inputs (usando un Map para múltiples referencias)
  const inputRefs = useRef(new Map());

  // Inicializar los datos cuando cambian las notas
  useEffect(() => {
    setData(
      notas.map((nota) => ({
        ...nota,
        nombreEstudiante: nota.estudiante?.name || "N/A",
        nombreCurso: nota.curso?.nombre || "N/A",
        nombreEvaluacion: nota.evaluacion?.nombre || "N/A",
        nombrePeriodo: nota.evaluacion?.periodo?.nombre || "N/A",
      }))
    );
  }, [notas]);

  // Función para eliminar una nota
  const handleDeleteNota = async () => {
    if (!notaToDelete) return;

    try {
      setLoading(true);
      const { eliminarNota } = await import("@/action/notas/nota");
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
    if (valor >= 18)
      return {
        label: "Excelente",
        color: "bg-green-500",
        icon: <CheckCircle2 className="h-4 w-4" />,
      };
    if (valor >= 14)
      return {
        label: "Muy bueno",
        color: "bg-blue-500",
        icon: <CheckCircle2 className="h-4 w-4" />,
      };
    if (valor >= 11)
      return {
        label: "Aprobado",
        color: "bg-yellow-500",
        icon: <CheckCircle2 className="h-4 w-4" />,
      };
    return {
      label: "Desaprobado",
      color: "bg-red-500",
      icon: <XCircle className="h-4 w-4" />,
    };
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
  const startEditing = useCallback(
    (rowId) => {
      console.log("startEditing llamado con rowId:", rowId);
      const row = data.find((item) => item.id === rowId);
      if (!row) {
        console.log("No se encontró la fila con id:", rowId);
        return;
      }

      console.log("Fila encontrada:", row);

      // Establecer los valores editados
      setEditedValues({
        valor: row.valor.toString(),
        comentario: row.comentario || "",
      });

      // Establecer la fila en edición
      setEditingRow(rowId);
      console.log("Estado de edición establecido para:", rowId);
    },
    [data]
  );

  // Cancelar edición
  const cancelEditing = useCallback(() => {
    setEditingRow(null);
    setEditedValues({});
  }, []);

  // Guardar cambios en una nota
  const saveChanges = useCallback(
    async (rowId) => {
      try {
        setLoading(true);

        // Validar el valor de la nota
        const valorStr = editedValues.valor?.trim() || "";
        if (!valorStr) {
          toast.error("La calificación es obligatoria");
          return;
        }

        const valor = parseFloat(valorStr);
        if (isNaN(valor) || valor < 0 || valor > 20) {
          toast.error("La calificación debe ser un número entre 0 y 20");
          return;
        }

        console.log("Guardando nota:", {
          id: rowId,
          valor,
          comentario: editedValues.comentario,
        });

        const { actualizarValorNota } = await import("@/action/notas/nota");
        const resultado = await actualizarValorNota(rowId, {
          valor,
          comentario: editedValues.comentario || "",
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
    },
    [editedValues, onUpdate, cancelEditing]
  );

  // Manejar cambios en los campos editables
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;

    // Para inputs numéricos, validar que solo se ingresen números y decimales
    if (name === "valor") {
      // Permitir solo números y un punto decimal
      const regex = /^\d*\.?\d*$/;
      if (!regex.test(value) && value !== "") {
        return;
      }
    }

    // Actualizar el estado con el nuevo valor
    setEditedValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Manejar teclas especiales (Enter para guardar, Escape para cancelar)
  const handleKeyDown = useCallback(
    (e, rowId) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveChanges(rowId);
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelEditing();
      }
    },
    [saveChanges, cancelEditing]
  );

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
  const columns = useMemo(
    () => [
      {
        accessorKey: "nombreEstudiante",
        header: "Estudiante",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.estudiante?.name}</div>
        ),
      },
      {
        accessorKey: "nombreCurso",
        header: "Curso",
        cell: ({ row }) => row.original.curso?.nombre,
      },
      {
        accessorKey: "nombreEvaluacion",
        header: "Evaluación",
        cell: ({ row }) => row.original.evaluacion?.nombre,
      },
      {
        accessorKey: "nombrePeriodo",
        header: "Período",
        cell: ({ row }) => row.original.evaluacion?.periodo?.nombre,
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
                  value={editedValues.valor || ""}
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
        },
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
        },
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => {
          const estado = getEstadoNota(row.original.valor);
          return (
            <Badge
              className={`${estado.color} text-white flex items-center gap-1`}
            >
              {estado.icon}
              {estado.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "fecha",
        header: "Fecha",
        cell: ({ row }) =>
          formatearFecha(row.original.updatedAt || row.original.createdAt),
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
                    console.log("Iniciando edición para:", row.original.id);
                    startEditing(row.original.id);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar en línea
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onEdit && onEdit(row.original.id)}
                >
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
        },
      },
    ],
    [
      editingRow,
      editedValues,
      loading,
      handleInputChange,
      handleKeyDown,
      setInputRef,
      saveChanges,
      cancelEditing,
      startEditing,
      onEdit,
      getEstadoNota,
      formatearFecha,
    ]
  );

  // Configurar la tabla con TanStack
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Calcular estadísticas
  const estadisticas = useMemo(() => {
    if (data.length === 0) return null;

    const valores = data.map((nota) => parseFloat(nota.valor));
    const promedio =
      valores.reduce((sum, val) => sum + val, 0) / valores.length;
    const aprobados = valores.filter((val) => val >= 11).length;
    const desaprobados = valores.filter((val) => val < 11).length;
    const excelentes = valores.filter((val) => val >= 18).length;

    return {
      promedio: promedio.toFixed(1),
      aprobados,
      desaprobados,
      excelentes,
      total: data.length,
      porcentajeAprobados: ((aprobados / data.length) * 100).toFixed(1),
    };
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-3 rounded-xl shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-blue-900 dark:text-blue-100">
                  Registro de Calificaciones
                </CardTitle>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Gestiona y visualiza las calificaciones de los estudiantes
                </p>
              </div>
            </div>

            {estadisticas && (
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {estadisticas.promedio}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    Promedio
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {estadisticas.porcentajeAprobados}%
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    Aprobados
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {estadisticas.total}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    Total
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Estadísticas detalladas */}
      {estadisticas && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-2 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-green-900 dark:text-green-100">
                    {estadisticas.excelentes}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">
                    Excelentes (18-20)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {estadisticas.aprobados}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    Aprobados (11-20)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-500 p-2 rounded-lg">
                  <XCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-red-900 dark:text-red-100">
                    {estadisticas.desaprobados}
                  </div>
                  <div className="text-xs text-red-700 dark:text-red-300">
                    Desaprobados (0-10)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    {estadisticas.promedio}
                  </div>
                  <div className="text-xs text-purple-700 dark:text-purple-300">
                    Promedio General
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabla principal */}
      <Card className="shadow-lg border-0 bg-white dark:bg-gray-900">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gray-600 p-2 rounded-lg">
                <Table2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Lista de Calificaciones
                </h3>
                <p className="text-sm text-muted-foreground">
                  {data.length} registro{data.length !== 1 ? "s" : ""}{" "}
                  encontrado{data.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Barra de búsqueda mejorada */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por estudiante, curso, evaluación..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 h-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500/20"
              />
              {globalFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setGlobalFilter("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-hidden">
            <ScrollArea className="h-[calc(100vh-400px)]">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className={`
                            font-semibold text-gray-700 dark:text-gray-300 py-4
                            ${header.id.includes("acciones") ? "w-[120px]" : ""}
                            ${header.id === "valor" ? "text-center" : ""}
                          `}
                        >
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
                    Array(5)
                      .fill(0)
                      .map((_, index) => (
                        <TableRow key={index}>
                          {columns.map((_, colIndex) => (
                            <TableCell key={colIndex} className="py-4">
                              <Skeleton className="h-6 w-full rounded" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                  ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row, index) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className={`
                          transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50
                          ${
                            editingRow === row.original.id
                              ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                              : ""
                          }
                          ${
                            index % 2 === 0
                              ? "bg-white dark:bg-gray-900"
                              : "bg-gray-50/50 dark:bg-gray-800/30"
                          }
                        `}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-4">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-32 text-center"
                      >
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                            <AlertCircle className="h-8 w-8" />
                          </div>
                          <p className="text-lg font-medium mb-1">
                            No hay calificaciones registradas
                          </p>
                          <p className="text-sm">
                            Comienza registrando la primera calificación
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </CardContent>

        {/* Footer mejorado */}
        <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>
                  Mostrando {table.getRowModel().rows.length} de {data.length}{" "}
                  registros
                </span>
              </div>

              {globalFilter && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filtrado por: "{globalFilter}"</span>
                </div>
              )}
            </div>

            {/* Paginación mejorada */}
            {table.getPageCount() > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="h-9"
                    />
                  </PaginationItem>

                  {Array.from(
                    { length: Math.min(table.getPageCount(), 5) },
                    (_, i) => {
                      const pageIndex = table.getState().pagination.pageIndex;
                      const totalPages = table.getPageCount();
                      let page;

                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (pageIndex < 3) {
                        page = i + 1;
                      } else if (pageIndex > totalPages - 4) {
                        page = totalPages - 4 + i;
                      } else {
                        page = pageIndex - 1 + i;
                      }

                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => table.setPageIndex(page - 1)}
                            isActive={
                              table.getState().pagination.pageIndex === page - 1
                            }
                            className="h-9 w-9"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="h-9"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Diálogo de eliminación mejorado */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <AlertDialogTitle className="text-lg">
                  Confirmar Eliminación
                </AlertDialogTitle>
                <AlertDialogDescription className="mt-1">
                  ¿Está seguro de que desea eliminar esta calificación?
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Esta acción no se puede deshacer
              </span>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              La calificación será eliminada permanentemente del sistema.
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading} className="h-10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNota}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 h-10"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar Calificación
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
