"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, Shield, RefreshCw } from "lucide-react";

// Cargos disponibles en el sistema
const CARGOS = [
  { value: "director", label: "Director" },
  { value: "subdirector", label: "Subdirector" },
  { value: "coordinador_academico", label: "Coordinador Académico" },
  { value: "secretaria", label: "Secretaria" },
  { value: "administrador", label: "Administrador" },
  { value: "auxiliar", label: "Auxiliar" },
  { value: "psicologo", label: "Psicólogo" },
  { value: "bibliotecario", label: "Bibliotecario" },
  { value: "contador", label: "Contador" },
  { value: "otro", label: "Otro" }
];

// Función para agrupar permisos por módulo
const agruparPermisosPorModulo = (permisos) => {
  return permisos.reduce((acc, permiso) => {
    const modulo = permiso.modulo || "General";
    if (!acc[modulo]) {
      acc[modulo] = [];
    }
    acc[modulo].push(permiso);
    return acc;
  }, {});
};

export function PermisosCargo() {
  const [selectedCargo, setSelectedCargo] = useState("director");
  const [allPermisos, setAllPermisos] = useState([]);
  const [cargoPermisos, setCargoPermisos] = useState([]);
  const [filteredPermisos, setFilteredPermisos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Agrupar permisos por módulo
  const permisosPorModulo = agruparPermisosPorModulo(filteredPermisos);
  
  // Obtener todos los permisos y los permisos del cargo seleccionado
  const fetchPermisos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Importar dinámicamente las acciones del servidor
      const { getPermisos } = await import("@/action/config/permisos-action");
      const { getPermisosCargo } = await import("@/action/config/permisos-cargo-action");
      
      // Obtener todos los permisos
      const allPermisosResult = await getPermisos();
      
      if (!allPermisosResult.success) {
        throw new Error(allPermisosResult.error || "Error al obtener permisos");
      }
      
      setAllPermisos(allPermisosResult.data);
      
      // Obtener permisos del cargo seleccionado
      const cargoPermisosResult = await getPermisosCargo(selectedCargo);
      
      if (!cargoPermisosResult.success) {
        throw new Error(cargoPermisosResult.error || "Error al obtener permisos del cargo");
      }
      
      setCargoPermisos(cargoPermisosResult.data);
    } catch (error) {
      console.error("Error al cargar permisos:", error);
      setError(error.message || "Error al cargar permisos");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar permisos según el término de búsqueda
  const filterPermisos = () => {
    if (!searchTerm.trim()) {
      setFilteredPermisos(allPermisos);
      return;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = allPermisos.filter(permiso => 
      permiso.nombre.toLowerCase().includes(lowerSearchTerm) || 
      permiso.codigo.toLowerCase().includes(lowerSearchTerm) ||
      (permiso.modulo && permiso.modulo.toLowerCase().includes(lowerSearchTerm)) ||
      (permiso.descripcion && permiso.descripcion.toLowerCase().includes(lowerSearchTerm))
    );
    
    setFilteredPermisos(filtered);
  };

  // Verificar si un permiso está asignado al cargo
  const isPermisoAsignado = (permisoId) => {
    return cargoPermisos.some(p => p.id === permisoId);
  };

  // Asignar o revocar un permiso al cargo
  const togglePermiso = async (permisoId) => {
    setActionLoading(true);
    
    try {
      // Importar dinámicamente las acciones del servidor
      const { asignarPermisoCargo, revocarPermisoCargo } = await import("@/action/config/permisos-cargo-action");
      
      const isAsignado = isPermisoAsignado(permisoId);
      
      let result;
      if (isAsignado) {
        // Revocar permiso
        result = await revocarPermisoCargo(selectedCargo, permisoId);
      } else {
        // Asignar permiso
        result = await asignarPermisoCargo(selectedCargo, permisoId);
      }
      
      if (!result.success) {
        throw new Error(result.error || `Error al ${isAsignado ? 'revocar' : 'asignar'} permiso`);
      }
      
      // Actualizar la lista de permisos del cargo
      await fetchPermisos();
    } catch (error) {
      console.error("Error al modificar permiso:", error);
      setError(error.message || "Error al modificar permiso");
    } finally {
      setActionLoading(false);
    }
  };

  // Cargar permisos al montar el componente o cambiar el cargo seleccionado
  useEffect(() => {
    fetchPermisos();
  }, [selectedCargo]);

  // Filtrar permisos cuando cambia el término de búsqueda o la lista de permisos
  useEffect(() => {
    filterPermisos();
  }, [searchTerm, allPermisos]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Permisos por Cargo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Selector de cargo */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="cargo-select">Seleccionar Cargo</Label>
            <Select
              value={selectedCargo}
              onValueChange={setSelectedCargo}
            >
              <SelectTrigger id="cargo-select">
                <SelectValue placeholder="Seleccionar cargo" />
              </SelectTrigger>
              <SelectContent position="popper">
                {CARGOS.map((cargo) => (
                  <SelectItem key={cargo.value} value={cargo.value}>
                    {cargo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Buscador de permisos */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar permisos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Botón para recargar permisos */}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPermisos}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Actualizar permisos
          </Button>
          
          {/* Mensaje de error */}
          {error && (
            <div className="bg-destructive/10 text-destructive p-2 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {/* Lista de permisos agrupados por módulo */}
          <div className="space-y-6">
            {Object.entries(permisosPorModulo).map(([modulo, permisos]) => (
              <div key={modulo} className="space-y-2">
                <h3 className="font-medium text-sm">{modulo}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {permisos.map((permiso) => {
                    const isAsignado = isPermisoAsignado(permiso.id);
                    return (
                      <div
                        key={permiso.id}
                        className={`flex items-center justify-between p-2 rounded-md border ${
                          isAsignado ? "border-primary/50 bg-primary/5" : "border-border"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{permiso.nombre}</span>
                            <Badge variant="outline" className="text-xs">
                              {permiso.codigo}
                            </Badge>
                          </div>
                          {permiso.descripcion && (
                            <p className="text-xs text-muted-foreground">
                              {permiso.descripcion}
                            </p>
                          )}
                        </div>
                        <Switch
                          checked={isAsignado}
                          onCheckedChange={() => togglePermiso(permiso.id)}
                          disabled={actionLoading}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
