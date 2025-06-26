"use client";

import { useState } from "react";
import { toast } from "sonner";
import { eliminarPermiso } from "@/action/config/permisos-action";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Check, X } from "lucide-react";

// Función para obtener el color de la badge según el módulo
const getModuloBadgeColor = (modulo) => {
  switch (modulo) {
    case "ESTUDIANTES":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "PROFESORES":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "ACADEMICO":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200";
    case "ADMINISTRATIVO":
      return "bg-amber-100 text-amber-800 hover:bg-amber-200";
    case "REPORTES":
      return "bg-cyan-100 text-cyan-800 hover:bg-cyan-200";
    case "CONFIGURACION":
      return "bg-orange-100 text-orange-800 hover:bg-orange-200";
    case "SISTEMA":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

export function PermisoList({ permisos, onEdit, onRefresh }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPermiso, setSelectedPermiso] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Manejar eliminación de permiso
  const handleDelete = async () => {
    if (!selectedPermiso) return;

    setIsProcessing(true);
    try {
      const response = await eliminarPermiso(selectedPermiso.id);
      if (response.success) {
        toast.success("Permiso eliminado", {
          description: "El permiso ha sido eliminado correctamente",
        });
        if (onRefresh) onRefresh();
      } else {
        toast.error("Error", {
          description: response.error || "No se pudo eliminar el permiso",
        });
      }
    } catch (error) {
      console.error("Error al eliminar permiso:", error);
      toast.error("Error", {
        description: "Ha ocurrido un error inesperado",
      });
    } finally {
      setIsProcessing(false);
      setDeleteDialogOpen(false);
      setSelectedPermiso(null);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Módulo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[80px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permisos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                  No hay permisos registrados
                </TableCell>
              </TableRow>
            ) : (
              permisos.map((permiso) => (
                <TableRow key={permiso.id}>
                  <TableCell className="font-mono text-sm">{permiso.codigo}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{permiso.nombre}</div>
                      {permiso.descripcion && (
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {permiso.descripcion}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getModuloBadgeColor(permiso.modulo)}>
                      {permiso.modulo}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {permiso.activo ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <Check className="mr-1 h-3 w-3" /> Activo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        <X className="mr-1 h-3 w-3" /> Inactivo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(permiso)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedPermiso(permiso);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo de confirmación para eliminar permiso */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el permiso{" "}
              <span className="font-medium">{selectedPermiso?.nombre}</span> y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
