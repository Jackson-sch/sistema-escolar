"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Search, RefreshCw, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { getNivelesAcademicos, deleteNivelAcademico } from "@/action/config/estructura-academica-action";
import { NivelAcademicoForm } from "./nivel-academico-form";
import { ScrollArea } from "@/components/ui/scroll-area";

export function NivelesAcademicos({ institucion, nivelesAcademicosIniciales, niveles = [] }) {
  console.log("Niveles académicos 🐓", nivelesAcademicosIniciales);
  const [nivelesAcademicos, setNivelesAcademicos] = useState(nivelesAcademicosIniciales); 
  const [filteredNiveles, setFilteredNiveles] = useState(nivelesAcademicosIniciales);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNivel, setSelectedNivel] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  console.log("Niveles académicos 🤑", nivelesAcademicos);

  // Cargar niveles académicos
  const loadNivelesAcademicos = async () => {
    if (!institucion?.id) return;
    
    setIsLoading(true);
    try {
      const response = await getNivelesAcademicos(institucion.id);
      if (response.success) {
        setNivelesAcademicos  (response.data);
        setFilteredNiveles(response.data);
      } else {
        toast.error(response.error || "Error al cargar los niveles académicos");
      }
    } catch (error) {
      console.error("Error al cargar niveles académicos:", error);
      toast.error("Error al cargar los niveles académicos");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar niveles según la búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredNiveles(nivelesAcademicos);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = nivelesAcademicos.filter(nivel => {
        // Extraer valores seguros para la búsqueda
        const nivelNombre = nivel.nivelNombre || '';
        const gradoNombre = nivel.gradoNombre || '';
        const seccion = nivel.seccion || '';
        const aula = nivel.aulaAsignada || '';
        
        // Buscar en todos los campos relevantes
        return nivelNombre.toLowerCase().includes(term) || 
               gradoNombre.toLowerCase().includes(term) || 
               seccion.toLowerCase().includes(term) ||
               aula.toLowerCase().includes(term);
      });
      setFilteredNiveles(filtered);
    }
  }, [searchTerm, nivelesAcademicos]);

  // Manejar la eliminación de un nivel académico
  const handleDelete = async () => {
    if (!selectedNivel) return;
    
    try {
      const response = await deleteNivelAcademico(selectedNivel.id);
      if (response.success) {
        toast.success("Nivel académico eliminado correctamente");
        loadNivelesAcademicos();
      } else {
        toast.error(response.error || "Error al eliminar el nivel académico");
      }
    } catch (error) {
      console.error("Error al eliminar nivel académico:", error);
      toast.error("Error al eliminar el nivel académico");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedNivel(null);
    }
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar niveles académicos..."
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
            onClick={loadNivelesAcademicos}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button size="sm" onClick={() => {
            setSelectedNivel(null);
            setIsEditing(false);
            setIsDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-1" />
            Nuevo Nivel
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nivel</TableHead>
              <TableHead>Grado</TableHead>
              <TableHead>Sección</TableHead>
              <TableHead>Turno</TableHead>
              <TableHead>Aula</TableHead>
              <TableHead>Capacidad</TableHead>
              <TableHead>Estudiantes</TableHead>
              <TableHead>Cursos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nivelesAcademicos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {isLoading ? "Cargando niveles académicos..." : "No se encontraron niveles académicos"}
                </TableCell>
              </TableRow>
            ) : (
              nivelesAcademicos.map((nivel) => {
                const turno = nivel.turno;
                const turnoText = turno === "MANANA" ? "Mañana" : turno === "TARDE" ? "Tarde" : turno === "NOCHE" ? "Noche" : "Continuo";

                return (
                  <TableRow key={nivel.id}>
                    <TableCell>{nivel.nivel}</TableCell>
                    <TableCell>{nivel.grado}</TableCell>
                    <TableCell>{nivel.seccion}</TableCell>
                    <TableCell>{turnoText}</TableCell>
                    <TableCell>{nivel.aulaAsignada}</TableCell>
                    <TableCell>{nivel.capacidadMaxima}</TableCell>
                    <TableCell>{nivel.estudiantesCount}</TableCell>
                    <TableCell>{nivel.cursosCount}</TableCell>
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
                            setSelectedNivel(nivel);
                            setIsEditing(true);
                            setIsDialogOpen(true);
                          }}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedNivel(nivel);
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
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo para crear/editar nivel académico */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Nivel Académico" : "Nuevo Nivel Académico"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Modifique los datos del nivel académico" 
                : "Complete los datos para crear un nuevo nivel académico"}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="p-4 h-[calc(100vh-20rem)]">
          <NivelAcademicoForm 
            institucion={institucion}
            nivelAcademico={selectedNivel}
            isEditing={isEditing}
            onSuccess={() => {
              setIsDialogOpen(false);
              loadNivelesAcademicos();
            }}
          />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el nivel académico seleccionado.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
