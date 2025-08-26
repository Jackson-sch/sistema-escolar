"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, AlertCircle, School, GraduationCap, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { NivelForm } from "./nivel-form";
import { GradoForm } from "./grado-form";
import { getNiveles, deleteNivel, deleteGrado } from "@/action/config/niveles-grados-action";

export function NivelesGrados({ institucion }) {
  const router = useRouter();
  const [niveles, setNiveles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedNiveles, setExpandedNiveles] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
      
  // Estados para modales
  const [showNivelModal, setShowNivelModal] = useState(false);
  const [showGradoModal, setShowGradoModal] = useState(false);
  const [currentNivel, setCurrentNivel] = useState(null);
  const [currentGrado, setCurrentGrado] = useState(null);
  const [currentNivelForGrado, setCurrentNivelForGrado] = useState(null);

  // Cargar niveles y grados
  const loadNiveles = async () => {
    if (!institucion?.id) return;
        
    setIsLoading(true);
    try {
      const result = await getNiveles(institucion.id);
      if (result.success) {
        setNiveles(result.data);
                
        // Expandir todos los niveles por defecto
        const expanded = {};
        result.data.forEach(nivel => {
          expanded[nivel.id] = true;
        });
        setExpandedNiveles(expanded);
      } else {
        setError(result.error);
        toast.error("Error al cargar los niveles");
      }
    } catch (error) {
      console.error("Error al cargar niveles:", error);
      setError("Error al cargar los niveles");
      toast.error("Error al cargar los niveles");
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar niveles al inicio
  useEffect(() => {
    loadNiveles();
  }, [institucion?.id]);

  // Filtrar niveles y grados según el término de búsqueda
  const filteredNiveles = niveles.filter(nivel => {
    const nivelMatches = nivel.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        
    // Si el nivel coincide, mostrarlo
    if (nivelMatches) return true;
        
    // Si algún grado coincide, mostrar el nivel
    const gradosMatch = nivel.grados.some(grado => 
      grado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grado.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );
        
    return gradosMatch;
  });

  // Manejar la expansión/contracción de un nivel
  const toggleNivelExpanded = (nivelId) => {
    setExpandedNiveles(prev => ({
      ...prev,
      [nivelId]: !prev[nivelId]
    }));
  };

  // Abrir modal para crear/editar nivel
  const handleNivelModal = (nivel = null) => {
    setCurrentNivel(nivel);
    setShowNivelModal(true);
  };

  // Abrir modal para crear/editar grado
  const handleGradoModal = (nivel, grado = null) => {
    setCurrentNivelForGrado(nivel);
    setCurrentGrado(grado);
    setShowGradoModal(true);
  };

  // Manejar eliminación de nivel
  const handleDeleteNivel = async (nivel) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el nivel "${nivel.nombre}"?`)) {
      return;
    }
        
    try {
      const result = await deleteNivel(nivel.id);
            
      if (result.success) {
        toast.success(result.message || "Nivel eliminado correctamente");
        loadNiveles();
      } else {
        toast.error(result.error || "Error al eliminar el nivel");
      }
    } catch (error) {
      console.error("Error al eliminar nivel:", error);
      toast.error("Error al eliminar el nivel");
    }
  };

  // Manejar eliminación de grado
  const handleDeleteGrado = async (grado) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el grado "${grado.nombre}"?`)) {
      return;
    }
        
    try {
      const result = await deleteGrado(grado.id);
            
      if (result.success) {
        toast.success(result.message || "Grado eliminado correctamente");
        loadNiveles();
      } else {
        toast.error(result.error || "Error al eliminar el grado");
      }
    } catch (error) {
      console.error("Error al eliminar grado:", error);
      toast.error("Error al eliminar el grado");
    }
  };

  // Función para obtener el color del nivel según su nombre
  const getNivelColor = (nombreNivel) => {
    const nombre = nombreNivel.toLowerCase();
    if (nombre.includes('inicial') || nombre.includes('preescolar')) {
      return 'border-blue-500/50 bg-blue-50 dark:bg-blue-950/30';
    } else if (nombre.includes('primaria') || nombre.includes('básica')) {
      return 'border-green-500/50 bg-green-50 dark:bg-green-950/30';
    } else if (nombre.includes('secundaria') || nombre.includes('media')) {
      return 'border-purple-500/50 bg-purple-50 dark:bg-purple-950/30';
    }
    return 'border-orange-500/50 bg-orange-50 dark:bg-orange-950/30';
  };

  const getNivelBadgeColor = (nombreNivel) => {
    const nombre = nombreNivel.toLowerCase();
    if (nombre.includes('inicial') || nombre.includes('preescolar')) {
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800';
    } else if (nombre.includes('primaria') || nombre.includes('básica')) {
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800';
    } else if (nombre.includes('secundaria') || nombre.includes('media')) {
      return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800';
    }
    return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800';
  };

  const getNivelIconColor = (nombreNivel) => {
    const nombre = nombreNivel.toLowerCase();
    if (nombre.includes('inicial') || nombre.includes('preescolar')) {
      return 'text-blue-600 dark:text-blue-400';
    } else if (nombre.includes('primaria') || nombre.includes('básica')) {
      return 'text-green-600 dark:text-green-400';
    } else if (nombre.includes('secundaria') || nombre.includes('media')) {
      return 'text-purple-600 dark:text-purple-400';
    }
    return 'text-orange-600 dark:text-orange-400';
  };

  return (
    <div className="space-y-6">
      {/* Cabecera y acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <School className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold">Niveles Educativos</h3>
          </div>
          <p className="text-muted-foreground">
            Gestiona los niveles educativos y sus grados correspondientes
          </p>
        </div>
        <Button 
          onClick={() => handleNivelModal()} 
          className="shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" /> 
          Nuevo Nivel
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar niveles o grados..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Mensaje de error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Lista de niveles y grados */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : filteredNiveles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <School className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
            <h4 className="text-xl font-semibold mb-2">
              {searchTerm 
                ? "No se encontraron resultados" 
                : "No hay niveles configurados"}
            </h4>
            <p className="text-muted-foreground mb-6">
              {searchTerm
                ? "No se encontraron niveles o grados que coincidan con la búsqueda"
                : "Comienza creando tu primer nivel educativo"}
            </p>
            {!searchTerm && (
              <Button onClick={() => handleNivelModal()}>
                <Plus className="h-4 w-4 mr-2" />
                Crear primer nivel
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-4">
            {filteredNiveles.map((nivel) => (
              <Card 
                key={nivel.id} 
                className={`overflow-hidden border-2 transition-all duration-200 hover:shadow-lg ${getNivelColor(nivel.nombre)}`}
              >
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleNivelExpanded(nivel.id)}
                >
                  <div className="flex items-center gap-3">
                    {expandedNiveles[nivel.id] ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div className="flex items-center gap-3">
                      <GraduationCap className={`h-5 w-5 ${getNivelIconColor(nivel.nombre)}`} />
                      <h4 className="font-semibold text-lg">{nivel.nombre}</h4>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`ml-2 ${getNivelBadgeColor(nivel.nombre)}`}
                    >
                      {nivel.grados.length} grado{nivel.grados.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                                      
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-950 dark:hover:text-green-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGradoModal(nivel);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNivelModal(nivel);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNivel(nivel);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                                  
                {expandedNiveles[nivel.id] && (
                  <CardContent className="pt-0 pb-6 px-6">
                    {nivel.descripcion && (
                      <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
                        <p className="text-sm text-muted-foreground">
                          {nivel.descripcion}
                        </p>
                      </div>
                    )}
                                          
                    <Separator className="my-4" />
                                          
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="text-base font-semibold flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-primary" /> 
                          Grados del Nivel
                        </h5>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGradoModal(nivel)}
                          className="h-8 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-950"
                        >
                          <Plus className="h-3 w-3 mr-1" /> 
                          Añadir Grado
                        </Button>
                      </div>
                                              
                      {nivel.grados.length === 0 ? (
                        <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
                          <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-muted-foreground mb-4">
                            No hay grados configurados para este nivel
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGradoModal(nivel)}
                            className="border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-950"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Crear primer grado
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {nivel.grados
                            .filter(grado =>
                              searchTerm === "" ||
                              grado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              grado.codigo.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .sort((a, b) => a.orden - b.orden)
                            .map((grado) => (
                              <div
                                key={grado.id}
                                className="group p-4 bg-card rounded-lg border hover:border-border/60 transition-all duration-200 hover:shadow-sm"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium truncate">
                                        {grado.nombre}
                                      </span>
                                      <Badge 
                                        variant="secondary" 
                                        className="text-xs"
                                      >
                                        {grado.codigo}
                                      </Badge>
                                    </div>
                                    {grado.descripcion && (
                                      <p className="text-xs text-muted-foreground line-clamp-2">
                                        {grado.descripcion}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                                      onClick={() => handleGradoModal(nivel, grado)}
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-300"
                                      onClick={() => handleDeleteGrado(grado)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Modal de Nivel */}
      {showNivelModal && (
        <NivelForm
          institucion={institucion}
          nivel={currentNivel}
          open={showNivelModal}
          onClose={() => {
            setShowNivelModal(false);
            setCurrentNivel(null);
          }}
          onSuccess={() => {
            setShowNivelModal(false);
            setCurrentNivel(null);
            loadNiveles();
          }}
        />
      )}

      {/* Modal de Grado */}
      {showGradoModal && (
        <GradoForm
          nivel={currentNivelForGrado}
          grado={currentGrado}
          open={showGradoModal}
          onClose={() => {
            setShowGradoModal(false);
            setCurrentGrado(null);
            setCurrentNivelForGrado(null);
          }}
          onSuccess={() => {
            setShowGradoModal(false);
            setCurrentGrado(null);
            setCurrentNivelForGrado(null);
            loadNiveles();
          }}
        />
      )}
    </div>
  );
}
