"use client";

import { useState } from "react";
import { toast } from "sonner";
import { eliminarUsuario, cambiarEstadoUsuario } from "@/action/config/usuarios-action";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Pencil, Trash2, UserCheck, UserX, Shield } from "lucide-react";

// Función para obtener las iniciales de un nombre
const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

// Función para formatear la fecha
const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Función para obtener el color de la badge según el rol
const getRoleBadgeColor = (role) => {
  switch (role) {
    case "director":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200";
    case "administrativo":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "profesor":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "estudiante":
      return "bg-amber-100 text-amber-800 hover:bg-amber-200";
    case "padre":
      return "bg-orange-100 text-orange-800 hover:bg-orange-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

// Función para obtener el color de la badge según el estado
const getEstadoBadgeColor = (estado) => {
  switch (estado) {
    case "activo":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "inactivo":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    case "suspendido":
      return "bg-amber-100 text-amber-800 hover:bg-amber-200";
    case "eliminado":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "retirado":
      return "bg-orange-100 text-orange-800 hover:bg-orange-200";
    case "egresado":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "licencia":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200";
    case "vacaciones":
      return "bg-cyan-100 text-cyan-800 hover:bg-cyan-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

export function UsuarioList({ usuarios, onEdit, onRefresh }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Manejar eliminación de usuario
  const handleDelete = async () => {
    if (!selectedUsuario) return;

    setIsProcessing(true);
    try {
      const response = await eliminarUsuario(selectedUsuario.id);
      if (response.success) {
        toast.success("Usuario eliminado", {
          description: "El usuario ha sido eliminado correctamente",
        });
        if (onRefresh) onRefresh();
      } else {
        toast.error("Error", {
          description: response.error || "No se pudo eliminar el usuario",
        });
      }
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      toast.error("Error", {
        description: "Ha ocurrido un error inesperado",
      });
    } finally {
      setIsProcessing(false);
      setDeleteDialogOpen(false);
      setSelectedUsuario(null);
    }
  };

  // Manejar cambio de estado del usuario
  const handleChangeStatus = async (usuario, nuevoEstado) => {
    try {
      const response = await cambiarEstadoUsuario(usuario.id, nuevoEstado);
      if (response.success) {
        toast.success("Estado actualizado", {
          description: `El usuario ahora está ${nuevoEstado}`,
        });
        if (onRefresh) onRefresh();
      } else {
        toast.error("Error", {
          description: response.error || "No se pudo actualizar el estado",
        });
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      toast.error("Error", {
        description: "Ha ocurrido un error inesperado",
      });
    }
  };

  // Traducir roles a español
  const translateRole = (role) => {
    const roles = {
      director: "Director",
      administrativo: "Administrativo",
      profesor: "Profesor",
      estudiante: "Estudiante",
      padre: "Padre/Tutor"
    };
    return roles[role] || role;
  };

  // Traducir estados a español y capitalizar
  const translateEstado = (estado) => {
    const estados = {
      activo: "Activo",
      inactivo: "Inactivo",
      suspendido: "Suspendido",
      eliminado: "Eliminado",
      retirado: "Retirado",
      egresado: "Egresado",
      licencia: "En licencia",
      vacaciones: "En vacaciones",
      trasladado: "Trasladado",
      graduado: "Graduado",
      condicional: "Condicional",
      practicante: "Practicante",
      jubilado: "Jubilado",
      expulsado: "Expulsado"
    };
    return estados[estado] || estado.charAt(0).toUpperCase() + estado.slice(1);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Registro</TableHead>
              <TableHead className="w-[80px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                  No hay usuarios registrados
                </TableCell>
              </TableRow>
            ) : (
              usuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={usuario.image || ""} alt={usuario.name} />
                        <AvatarFallback>{getInitials(usuario.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{usuario.name}</div>
                        <div className="text-sm text-gray-500">{usuario.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(usuario.role)}>
                      {translateRole(usuario.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>{usuario.dni || "-"}</TableCell>
                  <TableCell>
                    <Badge className={getEstadoBadgeColor(usuario.estado)}>
                      {translateEstado(usuario.estado)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(usuario.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(usuario)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => handleChangeStatus(usuario, usuario.estado === "activo" ? "inactivo" : "activo")}>
                          {usuario.estado === "activo" ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activar
                            </>
                          )}
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedUsuario(usuario);
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

      {/* Diálogo de confirmación para eliminar usuario */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al usuario{" "}
              <span className="font-medium">{selectedUsuario?.name}</span> y no se puede deshacer.
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
