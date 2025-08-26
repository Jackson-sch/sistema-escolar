"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  getNotasPorCurso,
  getNotasPorEstudiante,
  getCursosProfesor,
  getPeriodosActivos,
  getEstudiantesPorCurso // Asegúrate de importar esta función
} from "@/action/notas/nota";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Search, FileDown, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Esquema de validación para el formulario de filtros
const filtrosSchema = z.object({
  cursoId: z.string().optional(),
  estudianteId: z.string().optional(),
  periodoId: z.string().optional(),
  valorMinimo: z.string().optional(),
  valorMaximo: z.string().optional(),
});

export default function ConsultaNotas() {
  const [cursos, setCursos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
  const [filtroActivo, setFiltroActivo] = useState(false);

  // Formulario para filtros
  const filtrosForm = useForm({
    resolver: zodResolver(filtrosSchema),
    defaultValues: {
      cursoId: "",
      estudianteId: "",
      periodoId: "",
      valorMinimo: "",
      valorMaximo: "",
    },
  });
  
  // Monitorear cambios en el formulario para depuración
  useEffect(() => {
    const subscription = filtrosForm.watch((value) => {
      console.log('Valores del formulario actualizados:', value);
    });
    return () => subscription.unsubscribe();
  }, [filtrosForm]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [cursosData, periodosData] = await Promise.all([
          getCursosProfesor(),
          getPeriodosActivos(),
        ]);
        
        setCursos(cursosData);
        setPeriodos(periodosData);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        toast.error("Error", {
          description: "No se pudieron cargar los datos iniciales. Intente nuevamente.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Función para buscar notas según filtros
  const handleBuscarNotas = async (data) => {
    try {
      setLoadingData(true);
      setFiltroActivo(true);
      
      console.log('Buscando notas con filtros:', data);
      let notasData = [];
      
      // Si se seleccionó un estudiante específico
      if (data.estudianteId && data.estudianteId !== "" && data.estudianteId !== "todos") {
        console.log('Buscando por estudiante:', data.estudianteId);
        const periodoParam = data.periodoId && data.periodoId !== "" && data.periodoId !== "todos" ? data.periodoId : null;
        console.log('Periodo seleccionado:', periodoParam);
        
        notasData = await getNotasPorEstudiante(data.estudianteId, periodoParam);
        console.log('Notas encontradas por estudiante:', notasData.length);
      } 
      // Si se seleccionó un curso específico
      else if (data.cursoId && data.cursoId !== "" && data.cursoId !== "todos") {
        console.log('Buscando por curso:', data.cursoId);
        const periodoParam = data.periodoId && data.periodoId !== "" && data.periodoId !== "todos" ? data.periodoId : null;
        console.log('Periodo seleccionado:', periodoParam);
        
        notasData = await getNotasPorCurso(data.cursoId, periodoParam);
        console.log('Notas encontradas por curso:', notasData.length);
      } 
      // Si se seleccionó "todos los cursos"
      else if (data.cursoId === "todos") {
        // Aquí necesitas una función que obtenga todas las notas del profesor
        console.log('Opción "todos los cursos" seleccionada');
        toast.info("Información", {
          description: "Para ver todas las notas, seleccione un curso específico o un estudiante.",
        });
        setFiltroActivo(false);
        return;
      }
      // Si no se seleccionó ni curso ni estudiante, mostrar mensaje
      else {
        console.log('No se seleccionó ningún filtro específico');
        toast.warning("Filtros insuficientes", {
          description: "Seleccione al menos un curso o un estudiante para filtrar las notas.",
        });
        setFiltroActivo(false);
        return;
      }
      
      // Aplicar filtros adicionales (valor mínimo y máximo) en el cliente
      if (data.valorMinimo || data.valorMaximo) {
        const min = data.valorMinimo ? parseFloat(data.valorMinimo) : 0;
        const max = data.valorMaximo ? parseFloat(data.valorMaximo) : 20;
        
        console.log('Aplicando filtros de valor min/max:', min, max);
        const notasAntesDelFiltro = notasData.length;
        
        notasData = notasData.filter(nota => {
          const valor = parseFloat(nota.valor);
          return !isNaN(valor) && valor >= min && valor <= max;
        });
        
        console.log(`Filtrado por valor: ${notasAntesDelFiltro} -> ${notasData.length} notas`);
      }
      
      console.log('Notas finales a mostrar:', notasData);
      
      // Verificar estructura de datos para depuración
      if (notasData.length > 0) {
        console.log('Ejemplo de nota:', notasData[0]);
        console.log('Curso en nota:', notasData[0].curso);
        console.log('Estudiante en nota:', notasData[0].estudiante);
      }
      
      setNotas(notasData);
      
      // Mostrar mensaje si no hay resultados
      if (notasData.length === 0) {
        toast.info("Sin resultados", {
          description: "No se encontraron notas con los filtros seleccionados.",
        });
      } else {
        toast.success(`${notasData.length} notas encontradas`, {
          description: "Se han cargado las notas según los filtros seleccionados."
        });
      }
      
    } catch (error) {
      console.error("Error al buscar notas:", error);
      toast.error("Error", {
        description: "No se pudieron cargar las notas. Intente nuevamente.",
      });
    } finally {
      setLoadingData(false);
    }
  };

  // Función para cargar estudiantes cuando se selecciona un curso
  const handleCursoChange = async (cursoId) => {
    console.log('Curso seleccionado:', cursoId);
    
    if (!cursoId || cursoId === "todos" || cursoId === "") {
      console.log('Limpiando lista de estudiantes');
      setEstudiantes([]);
      filtrosForm.setValue("estudianteId", "");
      return;
    }
    
    try {
      setLoadingEstudiantes(true);
      console.log('Cargando estudiantes para curso:', cursoId);
      
      const estudiantesData = await getEstudiantesPorCurso(cursoId);
      console.log("Estudiantes cargados:", estudiantesData);
      
      if (estudiantesData.length === 0) {
        toast.warning("Sin estudiantes", {
          description: "No se encontraron estudiantes matriculados en este curso."
        });
      }
      
      setEstudiantes(estudiantesData);
      filtrosForm.setValue("estudianteId", "");
    } catch (error) {
      console.error("Error al cargar estudiantes:", error);
      toast.error("Error", {
        description: "No se pudieron cargar los estudiantes para este curso.",
      });
    } finally {
      setLoadingEstudiantes(false);
    }
  };

  // Función para limpiar filtros
  const handleLimpiarFiltros = () => {
    filtrosForm.reset();
    setNotas([]);
    setEstudiantes([]);
    setFiltroActivo(false);
  };

  // Función para exportar notas a Excel (placeholder)
  const handleExportarExcel = () => {
    toast.info("Exportación", {
      description: "Función de exportación a Excel en desarrollo.",
    });
  };

  // Función para exportar notas a PDF (placeholder)
  const handleExportarPDF = () => {
    toast.info("Exportación", {
      description: "Función de exportación a PDF en desarrollo.",
    });
  };

  // Función para obtener el nombre del curso cuando no viene incluido en la nota
  const obtenerNombreCurso = (cursoId) => {
    if (!cursoId) return "N/A";
    const curso = cursos.find(c => c.id === cursoId);
    if (!curso) return `Curso ID: ${cursoId}`;
    
    return (
      <>
        <span>{curso.nombre || "N/A"}</span>
        <span className="text-xs text-muted-foreground">
          {curso.nivelAcademico?.nivel?.nombre} {curso.nivelAcademico?.grado?.nombre} {curso.nivelAcademico?.seccion}
        </span>
      </>
    );
  };
  
  // Función para formatear la fecha
  const formatearFecha = (fechaString) => {
    if (!fechaString) return "N/A";
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Consulta de Notas</h2>
        
        {filtroActivo && notas.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportarExcel}>
                Exportar a Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportarPDF}>
                Exportar a PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
          <CardDescription>
            Seleccione los criterios para filtrar las notas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...filtrosForm}>
            <form onSubmit={filtrosForm.handleSubmit(handleBuscarNotas)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={filtrosForm.control}
                  name="cursoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Curso</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleCursoChange(value);
                        }}
                        value={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un curso" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="todos">Todos los cursos</SelectItem>
                          {cursos.map((curso) => (
                            <SelectItem key={curso.id} value={curso.id}>
                              {curso.nombre} - {curso.nivelAcademico?.nivel?.nombre} {curso.nivelAcademico?.grado?.nombre} {curso.nivelAcademico?.seccion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={filtrosForm.control}
                  name="estudianteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estudiante</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loading || loadingEstudiantes}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              loadingEstudiantes ? "Cargando estudiantes..." : 
                              estudiantes.length === 0 ? "Seleccione un curso primero" : 
                              "Seleccione un estudiante"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {estudiantes.length > 0 && (
                            <SelectItem value="todos">Todos los estudiantes</SelectItem>
                          )}
                          {estudiantes.map((estudiante) => (
                            <SelectItem key={estudiante.id} value={estudiante.id}>
                              {estudiante.nombreCompleto || estudiante.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={filtrosForm.control}
                  name="periodoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Período Académico</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un período" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="todos">Todos los períodos</SelectItem>
                          {periodos.map((periodo) => (
                            <SelectItem key={periodo.id} value={periodo.id}>
                              {periodo.nombre} {periodo.anioEscolar}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={filtrosForm.control}
                  name="valorMinimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nota Mínima</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          step="0.1"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={filtrosForm.control}
                  name="valorMaximo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nota Máxima</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          step="0.1"
                          placeholder="20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleLimpiarFiltros}
                  disabled={loading || loadingData}
                >
                  Limpiar Filtros
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || loadingData}
                >
                  {loadingData ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Buscar Notas
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {filtroActivo && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados de la Búsqueda</CardTitle>
            <CardDescription>
              {notas.length} notas encontradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : notas.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Evaluación</TableHead>
                      <TableHead>Nota</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Comentario</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notas.map((nota) => (
                      <TableRow key={nota.id}>
                        <TableCell>
                          {nota.estudiante ? (
                            <div className="flex flex-col">
                              <span>
                                {nota.estudiante.name || ""} 
                                {nota.estudiante.apellidoPaterno || ""} 
                                {nota.estudiante.apellidoMaterno || ""}
                              </span>
                              {nota.estudiante.nivelAcademico && (
                                <span className="text-xs text-muted-foreground">
                                  {nota.estudiante.nivelAcademico.grado?.nombre} {nota.estudiante.nivelAcademico.seccion}
                                </span>
                              )}
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>
                          {nota.curso ? (
                            <div className="flex flex-col">
                              <span>{nota.curso.nombre || "N/A"}</span>
                              <span className="text-xs text-muted-foreground">
                                {nota.curso.nivelAcademico?.nivel?.nombre} {nota.curso.nivelAcademico?.grado?.nombre} {nota.curso.nivelAcademico?.seccion}
                              </span>
                            </div>
                          ) : (
                            // Si no viene el curso en la nota, lo buscamos por cursoId
                            <div className="flex flex-col">
                              {obtenerNombreCurso(nota.cursoId)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{nota.evaluacion?.nombre || "N/A"}</span>
                            <span className="text-xs text-muted-foreground">
                              {nota.evaluacion?.periodo?.nombre || ""} 
                              {nota.evaluacion?.periodo?.numero ? `(${nota.evaluacion.periodo.numero})` : ""}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Peso: {nota.evaluacion?.peso || 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              parseFloat(nota.valor) >= 14 ? "default" :
                              parseFloat(nota.valor) >= 11 ? "secondary" : "destructive"
                            }
                          >
                            {nota.valor}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatearFecha(nota.evaluacion?.fecha || nota.fechaRegistro)}</TableCell>
                        <TableCell>
                          {nota.comentario ? (
                            <span className="text-sm italic">{nota.comentario}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Sin comentarios</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Filter className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-lg font-medium">No se encontraron notas</p>
                <p className="text-sm text-muted-foreground">
                  Intente con diferentes filtros de búsqueda
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}