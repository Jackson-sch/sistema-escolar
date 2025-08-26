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
      return 'border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-blue-100/20 dark:border-blue-800/30 dark:from-blue-950/20 dark:to-blue-900/10';
    } else if (nombre.includes('primaria') || nombre.includes('básica')) {
      return 'border-green-200/40 bg-gradient-to-br from-green-50/30 to-green-100/20 dark:border-green-800/30 dark:from-green-950/20 dark:to-green-900/10';
    } else if (nombre.includes('secundaria') || nombre.includes('media')) {
      return 'border-purple-200/40 bg-gradient-to-br from-purple-50/30 to-purple-100/20 dark:border-purple-800/30 dark:from-purple-950/20 dark:to-purple-900/10';
    }
    return 'border-orange-200/40 bg-gradient-to-br from-orange-50/30 to-orange-100/20 dark:border-orange-800/30 dark:from-orange-950/20 dark:to-orange-900/10';
  };

  const getNivelBadgeColor = (nombreNivel) => {
    const nombre = nombreNivel.toLowerCase();
    if (nombre.includes('inicial') || nombre.includes('preescolar')) {
      return 'bg-gradient-to-r from-blue-50 to-blue-100/80 text-blue-700 border-blue-200/60 dark:from-blue-950/40 dark:to-blue-900/30 dark:text-blue-300 dark:border-blue-700/40';
    } else if (nombre.includes('primaria') || nombre.includes('básica')) {
      return 'bg-gradient-to-r from-green-50 to-green-100/80 text-green-700 border-green-200/60 dark:from-green-950/40 dark:to-green-900/30 dark:text-green-300 dark:border-green-700/40';
    } else if (nombre.includes('secundaria') || nombre.includes('media')) {
      return 'bg-gradient-to-r from-purple-50 to-purple-100/80 text-purple-700 border-purple-200/60 dark:from-purple-950/40 dark:to-purple-900/30 dark:text-purple-300 dark:border-purple-700/40';
    }
    return 'bg-gradient-to-r from-orange-50 to-orange-100/80 text-orange-700 border-orange-200/60 dark:from-orange-950/40 dark:to-orange-900/30 dark:text-orange-300 dark:border-orange-700/40';
  };

  const getNivelIconColor = (nombreNivel) => {
    const nombre = nombreNivel.toLowerCase();
    if (nombre.includes('inicial') || nombre.includes('preescolar')) {
      return 'text-blue-500 dark:text-blue-400';
    } else if (nombre.includes('primaria') || nombre.includes('básica')) {
      return 'text-green-500 dark:text-green-400';
    } else if (nombre.includes('secundaria') || nombre.includes('media')) {
      return 'text-purple-500 dark:text-purple-400';
    }
    return 'text-orange-500 dark:text-orange-400';
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
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-gradient-to-r hover:from-background/80 hover:to-muted/30 transition-all duration-300"
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
                      className="h-9 w-9 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/80 hover:text-green-600 dark:hover:from-green-950/30 dark:hover:to-green-900/20 dark:hover:text-green-400 transition-all duration-200"
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
                      className="h-9 w-9 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/80 hover:text-blue-600 dark:hover:from-blue-950/30 dark:hover:to-blue-900/20 dark:hover:text-blue-400 transition-all duration-200"
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
                      className="h-9 w-9 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/80 hover:text-red-600 dark:hover:from-red-950/30 dark:hover:to-red-900/20 dark:hover:text-red-400 transition-all duration-200"
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
                      <div className="mb-4 p-3 bg-gradient-to-r from-muted/30 to-muted/20 rounded-lg border border-border/40 backdrop-blur-sm">
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
                          className="h-8 border-green-200/60 bg-gradient-to-r from-green-50/50 to-green-100/30 text-green-600 hover:from-green-100/70 hover:to-green-200/50 dark:border-green-700/40 dark:from-green-950/30 dark:to-green-900/20 dark:text-green-400 dark:hover:from-green-900/40 dark:hover:to-green-800/30 transition-all duration-200"
                        >
                          <Plus className="h-3 w-3 mr-1" /> 
                          Añadir Grado
                        </Button>
                      </div>
                                              
                      {nivel.grados.length === 0 ? (
                        <div className="text-center py-8 bg-gradient-to-br from-muted/20 to-muted/10 rounded-lg border border-dashed border-border/40 backdrop-blur-sm">
                          <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-muted-foreground mb-4">
                            No hay grados configurados para este nivel
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGradoModal(nivel)}
                            className="h-8 border-green-200/60 bg-gradient-to-r from-green-50/50 to-green-100/30 text-green-600 hover:from-green-100/70 hover:to-green-200/50 dark:border-green-700/40 dark:from-green-950/30 dark:to-green-900/20 dark:text-green-400 dark:hover:from-green-900/40 dark:hover:to-green-800/30 transition-all duration-200"
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
                                className="group p-4 bg-gradient-to-br from-card/80 to-card/60 rounded-lg border border-border/40 hover:border-border/60 hover:from-card hover:to-card/90 transition-all duration-300 hover:shadow-sm backdrop-blur-sm"
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
                                      className="h-7 w-7 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/80 hover:text-blue-600 dark:hover:from-blue-950/30 dark:hover:to-blue-900/20 dark:hover:text-blue-400 transition-all duration-200"
                                      onClick={() => handleGradoModal(nivel, grado)}
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/80 hover:text-red-600 dark:hover:from-red-950/30 dark:hover:to-red-900/20 dark:hover:text-red-400 transition-all duration-200"
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
