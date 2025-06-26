"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getPermisos } from "@/action/config/permisos-action";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PermisoForm } from "./permiso-form";
import { PermisoList } from "./permiso-list";
import { PermisosRol } from "./permisos-rol";
import { PermisosUsuario } from "./permisos-usuario";
import { Plus, Search, RefreshCw, Settings } from "lucide-react";

export function PermisosClient({ usuarios, selectedUsuario = null, permisosIniciales = [] }) {
  const [permisos, setPermisos] = useState(permisosIniciales);
  const [filteredPermisos, setFilteredPermisos] = useState(permisosIniciales);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPermiso, setSelectedPermiso] = useState(null);
  const [activeTab, setActiveTab] = useState("permisos");
  const [selectedUser, setSelectedUser] = useState(selectedUsuario);

  // Cargar permisos
  const loadPermisos = async () => {
    setIsLoading(true);
    try {
      const response = await getPermisos();
      if (response.success) {
        setPermisos(response.data);
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
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos iniciales si no hay permisos iniciales
  useEffect(() => {
    if (permisosIniciales.length === 0) {
      loadPermisos();
    }
  }, [permisosIniciales.length]);

  // Filtrar permisos según la búsqueda
  useEffect(() => {
    if (!permisos.length) return;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = permisos.filter(
        (permiso) =>
          permiso.nombre.toLowerCase().includes(term) ||
          permiso.codigo.toLowerCase().includes(term) ||
          permiso.descripcion?.toLowerCase().includes(term) ||
          permiso.modulo.toLowerCase().includes(term)
      );
      setFilteredPermisos(filtered);
    } else {
      setFilteredPermisos(permisos);
    }
  }, [permisos, searchTerm]);

  // Manejar edición de permiso
  const handleEditPermiso = (permiso) => {
    setSelectedPermiso(permiso);
    setIsDialogOpen(true);
  };

  // Manejar cierre del diálogo
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedPermiso(null);
  };

  // Manejar éxito en creación/edición de permiso
  const handlePermisoSuccess = () => {
    loadPermisos();
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="permisos" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Permisos</span>
            </TabsTrigger>
            <TabsTrigger value="roles">
              Roles
            </TabsTrigger>
            <TabsTrigger value="usuarios">
              Usuarios
            </TabsTrigger>
          </TabsList>
          
          {activeTab === "permisos" && (
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={loadPermisos}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  <span className="sr-only">Actualizar</span>
                </Button>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Permiso
                </Button>
              </div>
            </div>
          )}
        </div>

        <TabsContent value="permisos" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Gestión de Permisos</CardTitle>
              <CardDescription>
                Crea y administra los permisos disponibles en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <PermisoList
                  permisos={filteredPermisos}
                  onEdit={handleEditPermiso}
                  onRefresh={loadPermisos}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <PermisosRol />
        </TabsContent>

        <TabsContent value="usuarios" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Usuarios</CardTitle>
                  <CardDescription>
                    Selecciona un usuario para gestionar sus permisos específicos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Buscar usuarios..."
                        className="pl-8"
                      />
                    </div>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {usuarios.map((usuario) => (
                        <Button
                          key={usuario.id}
                          variant={selectedUser?.id === usuario.id ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => setSelectedUser(usuario)}
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                              {usuario.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-left">
                              <div className="font-medium">{usuario.name}</div>
                              <div className="text-xs text-muted-foreground">{usuario.email}</div>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <PermisosUsuario usuario={selectedUser} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Diálogo para crear/editar permiso */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedPermiso ? "Editar Permiso" : "Nuevo Permiso"}
            </DialogTitle>
            <DialogDescription>
              {selectedPermiso
                ? "Modifica los detalles del permiso existente"
                : "Crea un nuevo permiso en el sistema"}
            </DialogDescription>
          </DialogHeader>
          <PermisoForm
            permiso={selectedPermiso}
            onSuccess={() => {
              handlePermisoSuccess();
              handleDialogClose();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
