"use client";

import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
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
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Edit, MoreHorizontal, Trash2, Power, PowerOff } from "lucide-react";
import { eliminarPeriodo, cambiarEstadoPeriodo } from "@/action/config/periodo-action";

export function PeriodoList({ periodos = [], onEdit, onRefresh }) {
  const [periodoToDelete, setPeriodoToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // Función para mostrar el tipo de período de forma legible
  const formatTipoPeriodo = (tipo) => {
    const tipos = {
      BIMESTRE: "Bimestre",
      TRIMESTRE: "Trimestre",
      SEMESTRE: "Semestre",
      ANUAL: "Anual"
    };
    return tipos[tipo] || tipo;
  };

  // Función para eliminar un período
  const handleDelete = async () => {
    if (!periodoToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await eliminarPeriodo(periodoToDelete.id);
      
      if (response.success) {
        toast.success("Período eliminado", {
          description: "El período académico ha sido eliminado correctamente"
        });
        
        // Actualizar la lista
        if (onRefresh) onRefresh();
      } else {
        toast.error("Error", {
          description: response.error || "No se pudo eliminar el período académico",
        });
      }
    } catch (error) {
      console.error("Error al eliminar período:", error);
      toast.error("Error", {
        description: "Ha ocurrido un error inesperado",
      });
    } finally {
      setIsDeleting(false);
      setPeriodoToDelete(null);
    }
  };

  // Función para cambiar el estado de un período
  const handleChangeStatus = async (periodo) => {
    setIsChangingStatus(true);
    try {
      const response = await cambiarEstadoPeriodo(periodo.id, !periodo.activo);
      
      if (response.success) {
        toast.success(periodo.activo ? "Período desactivado" : "Período activado", {
          description: `El período ha sido ${periodo.activo ? "desactivado" : "activado"} correctamente`
        });
        
        // Actualizar la lista
        if (onRefresh) onRefresh();
      } else {
        toast.error("Error", {
          description: response.error || "No se pudo cambiar el estado del período",
        });
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      toast.error("Error", {
        description: "Ha ocurrido un error inesperado",
      });
    } finally {
      setIsChangingStatus(false);
    }
  };

  // Si no hay períodos, mostrar mensaje
  if (periodos.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg">
        <p className="text-muted-foreground">No hay períodos académicos configurados</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Año</TableHead>
              <TableHead>Fecha Inicio</TableHead>
              <TableHead>Fecha Fin</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[80px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {periodos.map((periodo) => (
              <TableRow key={periodo.id}>
                <TableCell className="font-medium">{periodo.nombre}</TableCell>
                <TableCell>{formatTipoPeriodo(periodo.tipo)} {periodo.numero}</TableCell>
                <TableCell>{periodo.anioEscolar}</TableCell>
                <TableCell>{format(new Date(periodo.fechaInicio), "dd/MM/yyyy", { locale: es })}</TableCell>
                <TableCell>{format(new Date(periodo.fechaFin), "dd/MM/yyyy", { locale: es })}</TableCell>
                <TableCell>
                  <Badge variant={periodo.activo ? "default" : "secondary"}>
                    {periodo.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(periodo)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleChangeStatus(periodo)}
                        disabled={isChangingStatus}
                      >
                        {periodo.activo ? (
                          <>
                            <PowerOff className="mr-2 h-4 w-4" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <Power className="mr-2 h-4 w-4" />
                            Activar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setPeriodoToDelete(periodo)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={!!periodoToDelete} onOpenChange={(open) => !open && setPeriodoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el período académico
              <span className="font-semibold block mt-2">
                {periodoToDelete?.nombre}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
