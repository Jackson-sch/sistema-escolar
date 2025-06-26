"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getPermisosRol, asignarPermisoRol, revocarPermisoRol, getPermisos } from "@/action/config/permisos-action";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Shield, RefreshCw } from "lucide-react";

// Roles disponibles en el sistema
const ROLES = [
  { value: "director", label: "Director" },
  { value: "administrativo", label: "Administrativo" },
  { value: "profesor", label: "Profesor" },
  { value: "estudiante", label: "Estudiante" },
  { value: "padre", label: "Padre/Tutor" }
];

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

export function PermisosRol() {
  const [selectedRole, setSelectedRole] = useState("director");
  const [allPermisos, setAllPermisos] = useState([]);
  const [rolePermisos, setRolePermisos] = useState([]);
  const [filteredPermisos, setFilteredPermisos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState({});

  // Cargar todos los permisos
  const loadAllPermisos = async () => {
    try {
      const response = await getPermisos();
      if (response.success) {
        setAllPermisos(response.data);
      } else {
        toast.error("Error", {
          description: response.error || "No se pudieron cargar los permisos",
        });
      }
    } catch (error) {
      console.error("Error al cargar permisos:", error);
      toast.error("Error", {
        description: "Ha ocurrido un error al cargar los permisos",
      });
    }
  };

  // Cargar permisos del rol seleccionado
  const loadRolePermisos = async () => {
    if (!selectedRole) return;
    
    setIsLoading(true);
    try {
      const response = await getPermisosRol(selectedRole);
      if (response.success) {
        setRolePermisos(response.data);
      } else {
        toast.error("Error", {
          description: response.error || "No se pudieron cargar los permisos del rol",
        });
      }
    } catch (error) {
      console.error("Error al cargar permisos del rol:", error);
      toast.error("Error", {
        description: "Ha ocurrido un error al cargar los permisos del rol",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadAllPermisos();
  }, []);

  // Cargar permisos del rol cuando cambia el rol seleccionado
  useEffect(() => {
    loadRolePermisos();
  }, [selectedRole]);

  // Filtrar permisos según la búsqueda
  useEffect(() => {
    if (!allPermisos.length) return;

    let filtered = allPermisos;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (permiso) =>
          permiso.nombre.toLowerCase().includes(term) ||
          permiso.codigo.toLowerCase().includes(term) ||
          permiso.descripcion?.toLowerCase().includes(term) ||
          permiso.modulo.toLowerCase().includes(term)
      );
    }

    setFilteredPermisos(filtered);
  }, [allPermisos, searchTerm]);

  // Verificar si un permiso está asignado al rol
  const isPermisoAssigned = (permisoId) => {
    return rolePermisos.some(p => p.id === permisoId);
  };

  // Manejar cambio en la asignación de permisos
  const handleTogglePermiso = async (permiso) => {
    setIsProcessing(prev => ({ ...prev, [permiso.id]: true }));
    
    try {
      const isAssigned = isPermisoAssigned(permiso.id);
      let response;
      
      if (isAssigned) {
        // Revocar permiso
        response = await revocarPermisoRol(selectedRole, permiso.id);
      } else {
        // Asignar permiso
        response = await asignarPermisoRol(selectedRole, permiso.id);
      }
      
      if (response.success) {
        toast.success(isAssigned ? "Permiso revocado" : "Permiso asignado", {
          description: isAssigned 
            ? `El permiso "${permiso.nombre}" ha sido revocado del rol ${selectedRole}`
            : `El permiso "${permiso.nombre}" ha sido asignado al rol ${selectedRole}`,
        });
        
        // Actualizar la lista de permisos del rol
        loadRolePermisos();
      } else {
        toast.error("Error", {
          description: response.error || "Ha ocurrido un error",
        });
      }
    } catch (error) {
      console.error("Error al modificar permisos:", error);
      toast.error("Error", {
        description: "Ha ocurrido un error inesperado",
      });
    } finally {
      setIsProcessing(prev => ({ ...prev, [permiso.id]: false }));
    }
  };

  // Agrupar permisos por módulo
  const permisosByModule = filteredPermisos.reduce((acc, permiso) => {
    if (!acc[permiso.modulo]) {
      acc[permiso.modulo] = [];
    }
    acc[permiso.modulo].push(permiso);
    return acc;
  }, {});

  // Ordenar módulos
  const sortedModules = Object.keys(permisosByModule).sort();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Permisos por Rol</CardTitle>
        </div>
        <CardDescription>
          Asigna o revoca permisos para cada rol del sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="w-full md:w-1/3">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar permisos..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={loadRolePermisos}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                <span className="sr-only">Actualizar</span>
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              {sortedModules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay permisos disponibles
                </div>
              ) : (
                sortedModules.map((modulo) => (
                  <div key={modulo} className="space-y-2">
                    <h3 className="font-medium text-sm">
                      <Badge className={getModuloBadgeColor(modulo)}>
                        {modulo}
                      </Badge>
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Asignar</TableHead>
                          <TableHead>Código</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Descripción</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {permisosByModule[modulo].map((permiso) => (
                          <TableRow key={permiso.id}>
                            <TableCell>
                              <Checkbox
                                checked={isPermisoAssigned(permiso.id)}
                                onCheckedChange={() => handleTogglePermiso(permiso)}
                                disabled={isProcessing[permiso.id]}
                              />
                            </TableCell>
                            <TableCell className="font-mono text-sm">{permiso.codigo}</TableCell>
                            <TableCell className="font-medium">{permiso.nombre}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {permiso.descripcion || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
