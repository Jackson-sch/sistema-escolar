"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getPermisosUsuario, asignarPermisoUsuario, revocarPermisoUsuario, getPermisos } from "@/action/config/permisos-action";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/utils/utils";
import { Loader2, Search, Shield, RefreshCw, Plus, X, Calendar as CalendarIcon } from "lucide-react";

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

export function PermisosUsuario({ usuario }) {
  const [permisos, setPermisos] = useState([]);
  const [allPermisos, setAllPermisos] = useState([]);
  const [filteredPermisos, setFilteredPermisos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPermiso, setSelectedPermiso] = useState(null);
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(null);

  // Cargar permisos del usuario
  const loadUserPermisos = async () => {
    if (!usuario?.id) return;

    setIsLoading(true);
    try {
      const response = await getPermisosUsuario(usuario.id);
      if (response.success) {
        setPermisos(response.data);
      } else {
        toast.error("Error", {
          description: response.error || "No se pudieron cargar los permisos del usuario",
        });
      }
    } catch (error) {
      console.error("Error al cargar permisos del usuario:", error);
      toast.error("Error", {
        description: "Ha ocurrido un error al cargar los permisos del usuario",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar todos los permisos disponibles
  const loadAllPermisos = async () => {
    try {
      const response = await getPermisos();
      if (response.success) {
        setAllPermisos(response.data);
        setFilteredPermisos(response.data);
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

  // Cargar datos iniciales
  useEffect(() => {
    if (usuario?.id) {
      loadUserPermisos();
      loadAllPermisos();
    }
  }, [usuario?.id]);

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

    // Excluir permisos ya asignados al usuario
    filtered = filtered.filter(
      (permiso) => !permisos.some(p => p.id === permiso.id)
    );

    setFilteredPermisos(filtered);
  }, [allPermisos, searchTerm, permisos]);

  // Manejar asignación de permiso
  const handleAsignarPermiso = async () => {
    if (!selectedPermiso || !usuario?.id) return;

    setIsProcessing(true);
    try {
      const options = {
        fechaInicio,
        fechaFin
      };

      const response = await asignarPermisoUsuario(usuario.id, selectedPermiso.id, options);

      if (response.success) {
        toast.success("Permiso asignado", {
          description: `El permiso "${selectedPermiso.nombre}" ha sido asignado al usuario`,
        });

        // Actualizar la lista de permisos del usuario
        loadUserPermisos();
        setIsDialogOpen(false);
        setSelectedPermiso(null);
        setFechaInicio(new Date());
        setFechaFin(null);
      } else {
        toast.error("Error", {
          description: response.error || "Ha ocurrido un error",
        });
      }
    } catch (error) {
      console.error("Error al asignar permiso:", error);
      toast.error("Error", {
        description: "Ha ocurrido un error inesperado",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Manejar revocación de permiso
  const handleRevocarPermiso = async (usuarioPermisoId) => {
    if (!usuarioPermisoId) return;

    try {
      const response = await revocarPermisoUsuario(usuarioPermisoId);

      if (response.success) {
        toast.success("Permiso revocado", {
          description: "El permiso ha sido revocado del usuario",
        });

        // Actualizar la lista de permisos del usuario
        loadUserPermisos();
      } else {
        toast.error("Error", {
          description: response.error || "Ha ocurrido un error",
        });
      }
    } catch (error) {
      console.error("Error al revocar permiso:", error);
      toast.error("Error", {
        description: "Ha ocurrido un error inesperado",
      });
    }
  };

  // Formatear fecha
  const formatFecha = (date) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy", { locale: es });
  };

  // Verificar si un permiso está expirado
  const isPermisoExpirado = (fechaFin) => {
    if (!fechaFin) return false;
    return new Date(fechaFin) < new Date();
  };

  // Agrupar permisos por módulo
  const permisosByModule = {};
  permisos.forEach(permiso => {
    if (!permisosByModule[permiso.modulo]) {
      permisosByModule[permiso.modulo] = [];
    }
    permisosByModule[permiso.modulo].push(permiso);
  });

  // Ordenar módulos
  const sortedModules = Object.keys(permisosByModule).sort();

  if (!usuario) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            Selecciona un usuario para gestionar sus permisos
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Permisos Específicos</CardTitle>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Asignar Permiso
          </Button>
        </div>
        <CardDescription>
          Permisos específicos asignados a {usuario.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {sortedModules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay permisos específicos asignados a este usuario
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
                        <TableHead>Permiso</TableHead>
                        <TableHead>Desde</TableHead>
                        <TableHead>Hasta</TableHead>
                        <TableHead className="w-[80px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permisosByModule[modulo].map((permiso) => (
                        <TableRow key={permiso.id} className={isPermisoExpirado(permiso.fechaFin) ? "bg-gray-50" : ""}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{permiso.nombre}</div>
                              <div className="text-xs font-mono text-muted-foreground">{permiso.codigo}</div>
                            </div>
                          </TableCell>
                          <TableCell>{formatFecha(permiso.fechaInicio)}</TableCell>
                          <TableCell>
                            {permiso.fechaFin ? (
                              <span className={isPermisoExpirado(permiso.fechaFin) ? "text-red-500" : ""}>
                                {formatFecha(permiso.fechaFin)}
                              </span>
                            ) : (
                              <span className="text-green-600">Permanente</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRevocarPermiso(permiso.usuarioPermisoId)}
                              title="Revocar permiso"
                            >
                              <X className="h-4 w-4" />
                            </Button>
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
      </CardContent>

      {/* Diálogo para asignar nuevo permiso */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Asignar Permiso</DialogTitle>
            <DialogDescription>
              Selecciona un permiso para asignar al usuario {usuario?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar permisos..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="max-h-[200px] overflow-y-auto border rounded-md">
              {filteredPermisos.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No hay permisos disponibles para asignar
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Permiso</TableHead>
                      <TableHead>Módulo</TableHead>
                      <TableHead className="w-[80px]">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPermisos.map((permiso) => (
                      <TableRow key={permiso.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{permiso.nombre}</div>
                            <div className="text-xs font-mono text-muted-foreground">{permiso.codigo}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getModuloBadgeColor(permiso.modulo)}>
                            {permiso.modulo}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPermiso(permiso)}
                            className={cn(
                              "w-full justify-start",
                              selectedPermiso?.id === permiso.id && "bg-accent"
                            )}
                          >
                            Seleccionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {selectedPermiso && (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <Label htmlFor="fechaInicio">Fecha de inicio</Label>
                  <div className="flex mt-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !fechaInicio && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {fechaInicio ? format(fechaInicio, "PPP", { locale: es }) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={fechaInicio}
                          onSelect={setFechaInicio}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div>
                  <Label htmlFor="fechaFin">
                    Fecha de fin <span className="text-muted-foreground">(opcional)</span>
                  </Label>
                  <div className="flex mt-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !fechaFin && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {fechaFin ? format(fechaFin, "PPP", { locale: es }) : "Permiso permanente"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={fechaFin}
                          onSelect={setFechaFin}
                          initialFocus
                          disabled={(date) => date < fechaInicio}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAsignarPermiso}
              disabled={!selectedPermiso || isProcessing}
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Asignar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
