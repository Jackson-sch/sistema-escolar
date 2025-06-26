"use client";

import { useState, useEffect } from "react";
import { getUsuarios } from "@/action/config/usuarios-action";
import { toast } from "sonner";
import { UsuarioForm } from "@/components/config/usuarios/usuario-form";
import { UsuarioList } from "@/components/config/usuarios/usuario-list";
import { PermisosClient } from "@/components/config/permisos/permisos-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, RefreshCw, Users, Shield } from "lucide-react";

// Importar formularios específicos para cada tipo de usuario
import ProfesorFormulario from "@/components/usuarios/profesor/formulario";
import { StudentRegistrationForm } from "@/components/usuarios/estudiante/formulario";
import AdministrativoFormulario from "@/components/usuarios/administrativo/formulario";
import { PadreRegistrationForm } from "@/components/usuarios/padre/formulario";

export function UsuariosPermisosClient({ institucion, usuariosIniciales = [], permisosIniciales = [] }) {
  const [usuarios, setUsuarios] = useState(usuariosIniciales);
  const [filteredUsuarios, setFilteredUsuarios] = useState(usuariosIniciales);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  const [activeSectionTab, setActiveSectionTab] = useState("usuarios");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  // Filtrar usuarios según la búsqueda y la pestaña activa
  useEffect(() => {
    let filtered = usuarios;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (usuario) =>
          usuario.name?.toLowerCase().includes(term) ||
          usuario.email?.toLowerCase().includes(term) ||
          usuario.apellidoPaterno?.toLowerCase().includes(term) ||
          usuario.apellidoMaterno?.toLowerCase().includes(term) ||
          usuario.dni?.includes(term)
      );
    }

    // Filtrar por pestaña (rol)
    if (activeTab !== "todos") {
      filtered = filtered.filter((usuario) => usuario.role === activeTab);
    }

    setFilteredUsuarios(filtered);
  }, [usuarios, searchTerm, activeTab]);

  // Función para actualizar la lista de usuarios
  const refreshUsuarios = async () => {
    if (!institucion?.id) return;

    setIsLoading(true);
    try {
      const response = await getUsuarios(institucion.id);
      if (response.success) {
        setUsuarios(response.data);
      } else {
        toast.error("Error", {
          description: response.error || "No se pudieron cargar los usuarios",
        });
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      toast.error("Error", {
        description: "Ha ocurrido un error al cargar los usuarios",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar edición de usuario
  const handleEditUsuario = (usuario) => {
    setSelectedUsuario(usuario);
    setIsFormDialogOpen(true);
  };

  // Manejar creación o actualización exitosa
  const handleFormSuccess = () => {
    setIsFormDialogOpen(false);
    setSelectedUsuario(null);
    setSelectedRole("");
    refreshUsuarios();
  };

  // Calcular conteos para las pestañas
  const roleCounts = {
    todos: usuarios.length,
    estudiante: usuarios.filter((u) => u.role === "estudiante").length,
    profesor: usuarios.filter((u) => u.role === "profesor").length,
    administrativo: usuarios.filter((u) => u.role === "administrativo").length,
    director: usuarios.filter((u) => u.role === "director").length,
    padre: usuarios.filter((u) => u.role === "padre").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-2xl font-bold tracking-tight">Usuarios y Permisos</h2>
        </div>
      </div>

      <Tabs defaultValue="usuarios" value={activeSectionTab} onValueChange={setActiveSectionTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Usuarios</span>
          </TabsTrigger>
          <TabsTrigger value="permisos" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Permisos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar usuarios..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={refreshUsuarios}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                <span className="sr-only">Actualizar</span>
              </Button>
              <Button onClick={() => {
                setSelectedUsuario(null);
                setIsFormDialogOpen(true);
              }}>
                <UserPlus className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Button>
            </div>
          </div>

          <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="todos">
                Todos ({roleCounts.todos})
              </TabsTrigger>
              <TabsTrigger value="estudiante">
                Estudiantes ({roleCounts.estudiante})
              </TabsTrigger>
              <TabsTrigger value="profesor">
                Profesores ({roleCounts.profesor})
              </TabsTrigger>
              <TabsTrigger value="administrativo">
                Administrativos ({roleCounts.administrativo})
              </TabsTrigger>
              <TabsTrigger value="director">
                Directores ({roleCounts.director})
              </TabsTrigger>
              <TabsTrigger value="padre">
                Padres ({roleCounts.padre})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Gestión de Usuarios</CardTitle>
                  <CardDescription>
                    {activeTab === "todos"
                      ? "Lista de todos los usuarios del sistema"
                      : `Lista de usuarios con rol de ${activeTab}`}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <UsuarioList
                    usuarios={filteredUsuarios}
                    onEdit={handleEditUsuario}
                    onRefresh={refreshUsuarios}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <CardTitle>Permisos del Sistema</CardTitle>
                  </div>
                  <CardDescription>
                    Configuración de permisos y accesos por roles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-8 text-center text-muted-foreground">
                    <p>La gestión avanzada de permisos está disponible en la pestaña Permisos.</p>
                    <p className="text-sm mt-2">
                      Puedes gestionar permisos por rol o asignar permisos específicos a usuarios.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="permisos" className="space-y-6">
          <PermisosClient usuarios={usuarios} selectedUsuario={selectedUsuario} permisosIniciales={permisosIniciales} />
        </TabsContent>
      </Tabs>

      {/* Diálogo para crear/editar usuario */}
      <Dialog open={isFormDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setSelectedRole("");
        }
        setIsFormDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedUsuario ? "Editar Usuario" : 
                selectedRole === "profesor" ? "Nuevo Profesor" :
                selectedRole === "estudiante" ? "Nuevo Estudiante" :
                selectedRole === "administrativo" ? "Nuevo Personal Administrativo" :
                selectedRole === "padre" ? "Nuevo Padre/Tutor" :
                "Nuevo Usuario"}
            </DialogTitle>
            <DialogDescription>
              {selectedUsuario
                ? "Modifica los detalles del usuario existente"
                : selectedRole === "profesor" ? "Ingresa los datos del nuevo profesor"
                : selectedRole === "estudiante" ? "Ingresa los datos del nuevo estudiante"
                : selectedRole === "administrativo" ? "Ingresa los datos del nuevo personal administrativo"
                : selectedRole === "padre" ? "Ingresa los datos del nuevo padre/tutor"
                : "Selecciona un rol para crear un nuevo usuario"}
            </DialogDescription>
          </DialogHeader>
          
          {/* Si no hay un rol específico seleccionado o si el usuario ya existe, mostrar el formulario básico */}
          {(!selectedRole || selectedUsuario) ? (
            <UsuarioForm
              institucionId={institucion?.id}
              usuario={selectedUsuario}
              onSuccess={handleFormSuccess}
              onRoleSelect={(role) => {
                if (!selectedUsuario) {
                  setSelectedRole(role);
                }
              }}
            />
          ) : (
            /* Renderizar el formulario específico según el rol seleccionado */
            <>
              {selectedRole === "profesor" && (
                <ProfesorFormulario 
                  institucionId={institucion?.id}
                  onSuccess={handleFormSuccess}
                />
              )}
              {selectedRole === "estudiante" && (
                <StudentRegistrationForm 
                  institucionId={institucion?.id}
                  onSuccess={handleFormSuccess}
                />
              )}
              {selectedRole === "administrativo" && (
                <AdministrativoFormulario 
                  institucionId={institucion?.id}
                  onSuccess={handleFormSuccess}
                />
              )}
              {selectedRole === "padre" && (
                <PadreRegistrationForm 
                  institucionId={institucion?.id}
                  onSuccess={handleFormSuccess}
                />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
