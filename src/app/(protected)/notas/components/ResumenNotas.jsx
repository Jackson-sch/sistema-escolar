"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";


// UI Components
import { Button } from "@/components/ui/button";
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
import { Loader2, BarChart3, FileDown, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { getCursosProfesor, getPeriodosActivos, getResumenNotasPorCurso } from "@/action/notas/nota";

// Esquema de validación para el formulario de selección
const seleccionSchema = z.object({
  cursoId: z.string().min(1, "Seleccione un curso"),
  periodoId: z.string().min(1, "Seleccione un período académico"),
});

export default function ResumenNotas() {
  const [cursos, setCursos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  console.log("resumen", resumen);
  console.log("cursos", cursos);
  console.log("periodos", periodos);

  // Formulario para selección de curso y período
  const seleccionForm = useForm({
    resolver: zodResolver(seleccionSchema),
    defaultValues: {
      cursoId: "",
      periodoId: "",
    },
  });

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
        toast("Error",{
          variant: "destructive",
          description: "No se pudieron cargar los datos iniciales. Intente nuevamente.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [toast]);

  // Función para obtener resumen de notas
  const handleObtenerResumen = async (data) => {
    try {
      setLoadingData(true);
      
      const resumenData = await getResumenNotasPorCurso(data.cursoId, data.periodoId);
      setResumen(resumenData);
      
      if (!resumenData || !resumenData.estudiantes || Object.keys(resumenData.estudiantes).length === 0) {
        toast("Sin datos",{
          variant: "default",
          description: "No hay notas registradas para este curso y período.",
        });
      }
      
    } catch (error) {
      console.error("Error al obtener resumen:", error);
      toast("Error",{
        variant: "destructive",
        description: "No se pudo obtener el resumen de notas. Intente nuevamente.",
      });
    } finally {
      setLoadingData(false);
    }
  };

  // Función para exportar resumen a Excel (placeholder)
  const handleExportarExcel = () => {
    toast("Exportación",{
      variant: "default",
      description: "Función de exportación a Excel en desarrollo.",
    });
  };

  // Función para exportar resumen a PDF (placeholder)
  const handleExportarPDF = () => {
    toast("Exportación",{
      variant: "default",
      description: "Función de exportación a PDF en desarrollo.",
    });
  };

  // Función para obtener color según nota
  const getColorByNota = (nota) => {
    const value = parseFloat(nota);
    if (value >= 18) return "bg-green-500";
    if (value >= 14) return "bg-green-400";
    if (value >= 11) return "bg-yellow-400";
    return "bg-red-500";
  };

  // Función para obtener estado según nota
  const getEstadoNota = (nota) => {
    const value = parseFloat(nota);
    if (value >= 18) return "Excelente";
    if (value >= 14) return "Bueno";
    if (value >= 11) return "Aprobado";
    return "Desaprobado";
  };

  // Función para calcular distribución de notas
  const calcularDistribucion = (estudiantes) => {
    if (!estudiantes) return { excelente: 0, bueno: 0, aprobado: 0, desaprobado: 0, total: 0 };
    
    const total = Object.keys(estudiantes).length;
    let excelente = 0, bueno = 0, aprobado = 0, desaprobado = 0;
    
    Object.values(estudiantes).forEach(est => {
      const promedio = parseFloat(est.promedioPonderado);
      if (promedio >= 18) excelente++;
      else if (promedio >= 14) bueno++;
      else if (promedio >= 11) aprobado++;
      else desaprobado++;
    });
    
    return {
      excelente,
      bueno,
      aprobado,
      desaprobado,
      total
    };
  };

  // Función para calcular porcentaje
  const calcularPorcentaje = (valor, total) => {
    if (!total) return 0;
    return (valor / total) * 100;
  };

  // Distribución de notas si hay resumen
  const distribucion = resumen ? calcularDistribucion(resumen.estudiantes) : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Resumen de Notas por Curso</h2>
        
        {resumen && (
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
          <CardTitle>Selección de Curso y Período</CardTitle>
          <CardDescription>
            Seleccione el curso y período académico para ver el resumen de notas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...seleccionForm}>
            <form onSubmit={seleccionForm.handleSubmit(handleObtenerResumen)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={seleccionForm.control}
                  name="cursoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Curso</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un curso" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                  control={seleccionForm.control}
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
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={loading || loadingData}
                >
                  {loadingData ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Ver Resumen
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {loadingData && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {resumen && !loadingData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Información del Curso</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="font-medium">Curso:</dt>
                    <dd>{resumen.curso?.nombre}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Nivel y Grado:</dt>
                    <dd>
                      {resumen.curso?.nivelAcademico?.nivel?.nombre} {resumen.curso?.nivelAcademico?.grado?.nombre} {resumen.curso?.nivelAcademico?.seccion}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Área Curricular:</dt>
                    <dd>{resumen.curso?.areaCurricular?.nombre}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Profesor:</dt>
                    <dd>{resumen.curso?.profesor?.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Período:</dt>
                    <dd>{resumen.periodo?.nombre} {resumen.periodo?.anioEscolar}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Total Estudiantes:</dt>
                    <dd>{Object.keys(resumen.estudiantes || {}).length}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estadísticas Generales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Promedio General:</span>
                    <Badge className="text-lg" variant={parseFloat(resumen.promedioGeneral) >= 11 ? "default" : "destructive"}>
                      {parseFloat(resumen.promedioGeneral).toFixed(2)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Excelente (18-20)</span>
                      <span>{distribucion?.excelente} estudiantes ({calcularPorcentaje(distribucion?.excelente, distribucion?.total).toFixed(1)}%)</span>
                    </div>
                    <Progress value={calcularPorcentaje(distribucion?.excelente, distribucion?.total)} className="h-2 bg-slate-200" style={{"--progress-foreground": "rgb(34 197 94)"}} />
                    
                    <div className="flex justify-between text-sm">
                      <span>Bueno (14-17.9)</span>
                      <span>{distribucion?.bueno} estudiantes ({calcularPorcentaje(distribucion?.bueno, distribucion?.total).toFixed(1)}%)</span>
                    </div>
                    <Progress value={calcularPorcentaje(distribucion?.bueno, distribucion?.total)} className="h-2 bg-slate-200" style={{"--progress-foreground": "rgb(74 222 128)"}} />
                    
                    <div className="flex justify-between text-sm">
                      <span>Aprobado (11-13.9)</span>
                      <span>{distribucion?.aprobado} estudiantes ({calcularPorcentaje(distribucion?.aprobado, distribucion?.total).toFixed(1)}%)</span>
                    </div>
                    <Progress value={calcularPorcentaje(distribucion?.aprobado, distribucion?.total)} className="h-2 bg-slate-200" style={{"--progress-foreground": "rgb(250 204 21)"}} />
                    
                    <div className="flex justify-between text-sm">
                      <span>Desaprobado (0-10.9)</span>
                      <span>{distribucion?.desaprobado} estudiantes ({calcularPorcentaje(distribucion?.desaprobado, distribucion?.total).toFixed(1)}%)</span>
                    </div>
                    <Progress value={calcularPorcentaje(distribucion?.desaprobado, distribucion?.total)} className="h-2 bg-slate-200" style={{"--progress-foreground": "rgb(239 68 68)"}} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumen de Notas por Estudiante</CardTitle>
              <CardDescription>
                Promedio ponderado de cada estudiante en el curso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">N°</TableHead>
                      <TableHead>Estudiante</TableHead>
                      <TableHead className="text-center">Promedio</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead>Evaluaciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resumen.estudiantes && Object.values(resumen.estudiantes).sort((a, b) => 
                      parseFloat(b.promedioPonderado) - parseFloat(a.promedioPonderado)
                    ).map((estudiante, index) => (
                      <TableRow key={estudiante.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{estudiante.nombre}</TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            className={getColorByNota(estudiante.promedioPonderado)}
                          >
                            {parseFloat(estudiante.promedioPonderado).toFixed(2)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={parseFloat(estudiante.promedioPonderado) >= 11 ? "outline" : "destructive"}>
                            {getEstadoNota(estudiante.promedioPonderado)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {estudiante.evaluaciones && Object.entries(estudiante.evaluaciones).map(([evalId, evalData]) => (
                              <TooltipProvider key={evalId}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge 
                                      variant="outline" 
                                      className={`cursor-help ${getColorByNota(evalData.valor)}`}
                                    >
                                      {parseFloat(evalData.valor).toFixed(1)}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="font-medium">{evalData.nombre}</p>
                                    <p className="text-xs">Peso: {evalData.peso}%</p>
                                    {evalData.comentario && (
                                      <p className="text-xs italic mt-1">{evalData.comentario}</p>
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
