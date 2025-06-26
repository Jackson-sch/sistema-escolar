"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, RefreshCw, MoreHorizontal, Pencil, Trash2, Info } from "lucide-react";
import { getAreasCurriculares, deleteAreaCurricular } from "@/action/config/estructura-academica-action";
import { AreaCurricularForm } from "./area-curricular-form";

export function AreasCurriculares({ institucion, areasCurricularesIniciales = [], niveles = [] }) {
  const [areasCurriculares, setAreasCurriculares] = useState(areasCurricularesIniciales);
  const [filteredAreas, setFilteredAreas] = useState(areasCurricularesIniciales);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Cargar áreas curriculares
  const loadAreasCurriculares = async () => {
    if (!institucion?.id) return;
    
    setIsLoading(true);
    try {
      const response = await getAreasCurriculares(institucion.id);
      if (response.success) {
        // Ahora las áreas curriculares incluyen sus cursos relacionados
        console.log("Áreas curriculares con cursos:", response.data);
        setAreasCurriculares(response.data);
        setFilteredAreas(response.data);
      } else {
        toast.error(response.error || "Error al cargar las áreas curriculares");
      }
    } catch (error) {
      console.error("Error al cargar áreas curriculares:", error);
      toast.error("Error al cargar las áreas curriculares");
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos iniciales si no hay áreas iniciales
  useEffect(() => {
    if (areasCurricularesIniciales.length === 0) {
      loadAreasCurriculares();
    }
  }, [institucion?.id, areasCurricularesIniciales.length]);

  // Filtrar áreas según la búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAreas(areasCurriculares);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = areasCurriculares.filter(area => 
        area.nombre.toLowerCase().includes(term) || 
        area.codigo.toLowerCase().includes(term) || 
        (area.descripcion && area.descripcion.toLowerCase().includes(term))
      );
      setFilteredAreas(filtered);
    }
  }, [searchTerm, areasCurriculares]);

  // Manejar la eliminación de un área curricular
  const handleDelete = async () => {
    if (!selectedArea) return;
    
    try {
      const response = await deleteAreaCurricular(selectedArea.id);
      if (response.success) {
        toast.success("Área curricular eliminada correctamente");
        loadAreasCurriculares();
      } else {
        toast.error(response.error || "Error al eliminar el área curricular");
      }
    } catch (error) {
      console.error("Error al eliminar área curricular:", error);
      toast.error("Error al eliminar el área curricular");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedArea(null);
    }
  };

  // Formatear nivel para mostrar
  const formatNivel = (nivel) => {
    const nivelMap = {
      INICIAL: "Inicial",
      PRIMARIA: "Primaria",
      SECUNDARIA: "Secundaria",
      SUPERIOR_TECNOLOGICA: "Superior Tecnológica",
      SUPERIOR_PEDAGOGICA: "Superior Pedagógica"
    };
    
    return nivelMap[nivel] || nivel;
  };

  // Generar color de badge para el área
  const getAreaColor = (area) => {
    if (area.color) return area.color;
    
    // Colores por defecto según el área
    const defaultColors = {
      MAT: "bg-blue-500",
      COM: "bg-green-500",
      CYT: "bg-purple-500",
      SOC: "bg-orange-500",
      ART: "bg-pink-500",
      EFI: "bg-red-500",
      ING: "bg-yellow-500",
      REL: "bg-indigo-500"
    };
    
    // Extraer las primeras 3 letras del código
    const prefix = area.codigo.substring(0, 3).toUpperCase();
    return defaultColors[prefix] || "bg-gray-500";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar áreas curriculares..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80 pl-8"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAreasCurriculares}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button size="sm" onClick={() => {
            setSelectedArea(null);
            setIsEditing(false);
            setIsDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-1" />
            Nueva Área
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Nivel</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Cursos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAreas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {isLoading ? "Cargando áreas curriculares..." : "No se encontraron áreas curriculares"}
                </TableCell>
              </TableRow>
            ) : (
              filteredAreas.map((area) => (
                <TableRow key={area.id}>
                  <TableCell>
                    <Badge 
                      className={area.color || getAreaColor(area)}
                      variant="secondary"
                    >
                      {area.codigo}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{area.nombre}</TableCell>
                  <TableCell>{formatNivel(area.nivel)}</TableCell>
                  <TableCell className="max-w-xs truncate">{area.descripcion || "-"}</TableCell>
                  <TableCell>
                    {area.cursos?.length || 0}
                    {area.cursos?.length > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="ml-2">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="space-y-1">
                            <p className="font-semibold">Cursos:</p>
                            <ul className="list-disc pl-4">
                              {area.cursos.map(curso => (
                                <li key={curso.id}>
                                  {curso.nombre} ({curso.codigo}) - {curso.profesor?.name} {curso.profesor?.apellidoPaterno}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={area.activa ? "default" : "outline"}>
                      {area.activa ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedArea(area);
                          setIsEditing(true);
                          setIsDialogOpen(true);
                        }}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedArea(area);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
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

      {/* Diálogo para crear/editar área curricular */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Área Curricular" : "Nueva Área Curricular"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Modifique los datos del área curricular" 
                : "Complete los datos para crear una nueva área curricular"}
            </DialogDescription>
          </DialogHeader>
          <AreaCurricularForm 
            institucion={institucion}
            areaCurricular={selectedArea}
            niveles={niveles}
            isEditing={isEditing}
            onSuccess={() => {
              setIsDialogOpen(false);
              loadAreasCurriculares();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedArea && selectedArea._count?.cursos > 0 
                ? "Esta área curricular tiene cursos asociados. Se desactivará en lugar de eliminarla."
                : "Esta acción eliminará el área curricular seleccionada. Esta acción no se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {selectedArea && selectedArea._count?.cursos > 0 ? "Desactivar" : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
