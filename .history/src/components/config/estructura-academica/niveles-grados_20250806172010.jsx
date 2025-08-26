"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Pencil, 
  Trash2, 
  AlertCircle,
  School,
  GraduationCap
} from "lucide-react";

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

  return (
    <>
      <div className="space-y-4">
        {/* Cabecera y acciones */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Niveles y Grados</h3>
            <p className="text-sm text-muted-foreground">
              Gestiona los niveles educativos y sus grados correspondientes
            </p>
          </div>
          <Button onClick={() => handleNivelModal()} className="flex items-center gap-1">
            <Plus className="h-4 w-4" /> Nuevo Nivel
          </Button>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative">
          <Input
            placeholder="Buscar niveles o grados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
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
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredNiveles.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <School className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "No se encontraron niveles o grados que coincidan con la búsqueda" 
                  : "No hay niveles educativos configurados"}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => handleNivelModal()} 
                  variant="outline" 
                  className="mt-4"
                >
                  Crear primer nivel
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-3">
              {filteredNiveles.map((nivel) => (
                <Card key={nivel.id} className="overflow-hidden">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer bg-muted/30"
                    onClick={() => toggleNivelExpanded(nivel.id)}
                  >
                    <div className="flex items-center gap-2">
                      {expandedNiveles[nivel.id] ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                      <h4 className="font-medium">{nivel.nombre}</h4>
                      <Badge variant="outline" className="ml-2">
                        {nivel.grados.length} grado{nivel.grados.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
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
                    <CardContent className="pt-4">
                      {nivel.descripcion && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {nivel.descripcion}
                        </p>
                      )}
                      
                      <Separator className="my-3" />
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-medium flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" /> Grados
                          </h5>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleGradoModal(nivel)}
                            className="h-8"
                          >
                            <Plus className="h-3 w-3 mr-1" /> Añadir Grado
                          </Button>
                        </div>
                        
                        {nivel.grados.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-2">
                            No hay grados configurados para este nivel
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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
                                  className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                                >
                                  <div>
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">{grado.nombre}</span>
                                      <Badge variant="outline" size="sm" className="ml-1 text-xs">
                                        {grado.codigo}
                                      </Badge>
                                    </div>
                                    {grado.descripcion && (
                                      <p className="text-xs text-muted-foreground">
                                        {grado.descripcion}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => handleGradoModal(nivel, grado)}
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => handleDeleteGrado(grado)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
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
      </div>

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
    </>
  );
}
