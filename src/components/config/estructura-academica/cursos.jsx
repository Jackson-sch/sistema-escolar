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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, RefreshCw, MoreHorizontal, Pencil, Trash2, Clock, Users } from "lucide-react";
import { getCursos, deleteCurso } from "@/action/config/estructura-academica-action";
import { CursoForm } from "./curso-form";
import { HorariosCurso } from "./horarios-curso";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Cursos({ institucion, niveles = [], areasCurricularesIniciales = [], profesoresIniciales = [], nivelesAcademicosIniciales = [] }) {
  const [cursos, setCursos] = useState([]);
  const [filteredCursos, setFilteredCursos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHorariosDialogOpen, setIsHorariosDialogOpen] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [nivelFilter, setNivelFilter] = useState("ALL");
  const [anioFilter, setAnioFilter] = useState("ALL");

  console.log("cursos", cursos)
  console.log("cursos filtrados por búsqueda", filteredCursos)

  // Usar la institución del contexto si está disponible, de lo contrario usar la prop
  const institucionData = institucion;

  // Cargar cursos
  const loadCursos = async () => {
    if (!institucionData?.id) return;

    setIsLoading(true);
    try {
      // Construir filtros
      const filters = {};
      if (nivelFilter && nivelFilter !== "ALL") filters.nivel = nivelFilter;
      if (anioFilter && anioFilter !== "ALL") filters.anioAcademico = parseInt(anioFilter);

      const response = await getCursos(institucionData.id, filters);
      if (response.success) {
        setCursos(response.data);
        setFilteredCursos(response.data);
      } else {
        toast.error(response.error || "Error al cargar los cursos");
      }
    } catch (error) {
      console.error("Error al cargar cursos:", error);
      toast.error("Error al cargar los cursos");
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadCursos();
  }, [institucionData?.id, nivelFilter, anioFilter]);

  // Filtrar cursos según la búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCursos(cursos);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = cursos.filter(curso =>
        curso.nombre.toLowerCase().includes(term) ||
        curso.codigo.toLowerCase().includes(term) ||
        (curso.descripcion && curso.descripcion.toLowerCase().includes(term)) ||
        (curso.profesor.name && curso.profesor.name.toLowerCase().includes(term)) ||
        (curso.profesor.apellidoPaterno && curso.profesor.apellidoPaterno.toLowerCase().includes(term))
      );
      setFilteredCursos(filtered);
    }
  }, [searchTerm, cursos]);

  // Manejar la eliminación de un curso
  const handleDelete = async () => {
    if (!selectedCurso) return;

    try {
      const response = await deleteCurso(selectedCurso.id);
      if (response.success) {
        toast.success("Curso eliminado correctamente");
        loadCursos();
      } else {
        toast.error(response.error || "Error al eliminar el curso");
      }
    } catch (error) {
      console.error("Error al eliminar curso:", error);
      toast.error("Error al eliminar el curso");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedCurso(null);
    }
  };

  // Formatear nivel para mostrar
  const formatNivel = (nivel) => {
    if (!nivel) return ""
    if (typeof nivel === 'string') return nivel
    if (typeof nivel === 'object') {
      return nivel.nombre || nivel.codigo || "Sin nivel"
    }
    return String(nivel)
  };

  // Formatear grado para mostrar
  const formatGrado = (grado) => {
    if (!grado) return ""
    if (typeof grado === 'string') return grado
    if (typeof grado === 'object') {
      return grado.nombre || grado.codigo || "Sin grado"
    }
    return String(grado)
  };

  // Obtener años académicos únicos para el filtro
  const getUniqueYears = () => {
    const years = [...new Set(cursos.map(curso => curso.anioAcademico))];
    return years.sort((a, b) => b - a); // Ordenar descendente
  };

  // Formatear nombre del profesor
  const formatProfesorName = (profesor) => {
    if (!profesor) return "No asignado";

    try {
      const name = profesor.name ? String(profesor.name) : "";
      const apellidoPaterno = profesor.apellidoPaterno ? String(profesor.apellidoPaterno) : "";
      const apellidoMaterno = profesor.apellidoMaterno ? String(profesor.apellidoMaterno) : "";
      const email = profesor.email ? String(profesor.email) : "";

      const nombreCompleto = `${name} ${apellidoPaterno} ${apellidoMaterno}`.trim();

      return nombreCompleto || email || "No asignado";
    } catch (error) {
      console.error("Error al formatear el nombre del profesor:", error);
      return "No asignado";
    }
  };

  // Función para renderizar el nivel/grado según el alcance
  const renderNivelGrado = (curso) => {
    const { alcance, nivelAcademico, grado, nivel } = curso;

    switch (alcance) {
      case 'SECCION_ESPECIFICA':
        if (nivelAcademico) {
          return (
            <div className="flex flex-col gap-1">
              <span>
                {nivelAcademico.nivel && formatNivel(nivelAcademico.nivel)}
                {nivelAcademico.grado && ` / ${formatGrado(nivelAcademico.grado)}`}
              </span>
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md border">
                Sección {nivelAcademico.seccion || ""}
              </span>
            </div>
          );
        }
        break;

      case 'TODO_EL_GRADO':
        if (grado) {
          return (
            <div className="flex flex-col gap-1">
              <span>
                {grado.nivel && formatNivel(grado.nivel)}
                {` / ${formatGrado(grado)}`}
              </span>
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md border">
                Todo el grado
              </span>
            </div>
          );
        }
        break;

      case 'TODO_EL_NIVEL':
        if (nivel) {
          return (
            <div className="flex flex-col gap-1">
              <span>{formatNivel(nivel)}</span>
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md border">
                Todo el nivel
              </span>
            </div>
          );
        }
        break;

      case 'TODO_LA_INSTITUCION':
        return (
          <div className="flex flex-col gap-1">
            <span>Toda la institución</span>
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-md border">
              Global
            </span>
          </div>
        );

      default:
        return 'Sin definir';
    }

    return 'Sin información';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-60 pl-8"
            />
          </div>

          <Select value={nivelFilter} onValueChange={setNivelFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Nivel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los niveles</SelectItem>
              {niveles.map((nivel) => (
                <SelectItem key={nivel.id} value={nivel.id}>
                  {nivel.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={anioFilter} onValueChange={setAnioFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Año académico" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los años</SelectItem>
              {getUniqueYears().map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center ml-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCursos}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />

          </Button>
          <Button size="sm" onClick={() => {
            setSelectedCurso(null);
            setIsEditing(false);
            setIsDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-1" />
            Nuevo Curso
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Nivel/Grado</TableHead>
              <TableHead>Profesor</TableHead>
              <TableHead>Año</TableHead>
              <TableHead>Horarios</TableHead>
              <TableHead>Estudiantes</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCursos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {isLoading ? "Cargando cursos..." : "No se encontraron cursos"}
                </TableCell>
              </TableRow>
            ) : (
              filteredCursos.map((curso) => (
                <TableRow key={curso.id} className={!curso.activo ? "opacity-60" : ""}>
                  <TableCell>
                    <Badge
                      className={curso.areaCurricular.color || "bg-gray-500"}
                      variant="secondary"
                    >
                      {curso.codigo}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{curso.nombre}</TableCell>
                  <TableCell>{curso.areaCurricular?.nombre ? String(curso.areaCurricular.nombre) : ""}</TableCell>
                  <TableCell>
                    {renderNivelGrado(curso)}
                  </TableCell>
                  <TableCell className="capitalize">{formatProfesorName(curso.profesor)}</TableCell>
                  <TableCell>{curso.anioAcademico}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCurso(curso);
                        setIsHorariosDialogOpen(true);
                      }}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      {curso._count?.horarios || 0}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {curso._count?.estudiantes || 0}
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
                          setSelectedCurso(curso);
                          setIsEditing(true);
                          setIsDialogOpen(true);
                        }}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedCurso(curso);
                            setIsHorariosDialogOpen(true);
                          }}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Horarios
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedCurso(curso);
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

      {/* Diálogo para crear/editar curso */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Curso" : "Nuevo Curso"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifique los datos del curso"
                : "Complete los datos para crear un nuevo curso"}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <CursoForm
              institucion={institucionData}
              profesores={profesoresIniciales}
              curso={selectedCurso}
              isEditing={isEditing}
              niveles={niveles}
              areasCurriculares={areasCurricularesIniciales}
              nivelesAcademicos={nivelesAcademicosIniciales}
              onSuccess={() => {
                setIsDialogOpen(false);
                loadCursos();
              }}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Diálogo para gestionar horarios */}
      <Dialog open={isHorariosDialogOpen} onOpenChange={setIsHorariosDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Horarios del Curso</DialogTitle>
            <DialogDescription>
              {selectedCurso ? `${selectedCurso.nombre} (${selectedCurso.codigo})` : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedCurso && (
            <HorariosCurso
              curso={selectedCurso}
              onSuccess={() => {
                loadCursos();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCurso && (selectedCurso._count?.estudiantes > 0 ||
                selectedCurso._count?.evaluaciones > 0 ||
                selectedCurso._count?.notas > 0 ||
                selectedCurso._count?.asistencias > 0)
                ? "Este curso tiene datos asociados. Se desactivará en lugar de eliminarlo."
                : "Esta acción eliminará el curso seleccionado. Esta acción no se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {selectedCurso && (selectedCurso._count?.estudiantes > 0 ||
                selectedCurso._count?.evaluaciones > 0 ||
                selectedCurso._count?.notas > 0 ||
                selectedCurso._count?.asistencias > 0)
                ? "Desactivar"
                : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
