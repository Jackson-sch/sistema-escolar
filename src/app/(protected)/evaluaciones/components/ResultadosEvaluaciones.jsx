"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Download, FileText, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { obtenerNotasPorCurso, obtenerNotasPorEstudiante } from "@/action/evaluaciones/nota";
import { obtenerEvaluacionesPorCurso } from "@/action/evaluaciones/evaluacion";

export default function ResultadosEvaluaciones({ user, cursos, role }) {
  const [selectedCurso, setSelectedCurso] = useState("");
  const [selectedPeriodo, setSelectedPeriodo] = useState("");
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [notas, setNotas] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("tabla");
  const [estadisticas, setEstadisticas] = useState({
    promedioGeneral: 0,
    distribucionNotas: [],
    aprobados: 0,
    desaprobados: 0,
    mejorNota: 0,
    peorNota: 20
  });

  // Cargar evaluaciones y periodos cuando cambia el curso seleccionado
  useEffect(() => {
    const cargarEvaluacionesYPeriodos = async () => {
      if (!selectedCurso) {
        setEvaluaciones([]);
        setPeriodos([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const evaluacionesCurso = await obtenerEvaluacionesPorCurso(selectedCurso);
        setEvaluaciones(evaluacionesCurso);
        
        // Extraer periodos únicos
        const uniquePeriodos = Array.from(
          new Set(evaluacionesCurso.map(evaluacion => evaluacion.periodo?.id))
        ).map(id => {
          const periodo = evaluacionesCurso.find(evaluacion => evaluacion.periodo?.id === id)?.periodo;
          return periodo;
        }).filter(Boolean);
        
        setPeriodos(uniquePeriodos);
        
        // Seleccionar el primer periodo por defecto si no hay uno seleccionado
        if (uniquePeriodos.length > 0 && !selectedPeriodo) {
          setSelectedPeriodo(uniquePeriodos[0].id);
        }
      } catch (error) {
        console.error("Error al cargar evaluaciones:", error);
        toast.error("Error al cargar las evaluaciones");
      } finally {
        setIsLoading(false);
      }
    };
    
    cargarEvaluacionesYPeriodos();
  }, [selectedCurso]);

  // Cargar notas cuando cambia el curso o periodo seleccionado
  useEffect(() => {
    const cargarNotas = async () => {
      if (!selectedCurso || !selectedPeriodo) {
        setNotas([]);
        return;
      }
      
      setIsLoading(true);
      try {
        let notasCargadas = [];
        
        if (role === "ESTUDIANTE" || role === "PADRE") {
          // Si es estudiante o padre, solo cargar sus propias notas
          notasCargadas = await obtenerNotasPorEstudiante(user.id, selectedCurso, selectedPeriodo);
        } else {
          // Si es profesor o administrador, cargar todas las notas del curso
          notasCargadas = await obtenerNotasPorCurso(selectedCurso, selectedPeriodo);
        }
        
        setNotas(notasCargadas);
        
        // Calcular estadísticas
        calcularEstadisticas(notasCargadas);
      } catch (error) {
        console.error("Error al cargar notas:", error);
        toast.error("Error al cargar las notas");
      } finally {
        setIsLoading(false);
      }
    };
    
    cargarNotas();
  }, [selectedCurso, selectedPeriodo, user.id, role]);

  // Calcular estadísticas de las notas
  const calcularEstadisticas = (notasCargadas) => {
    if (notasCargadas.length === 0) {
      setEstadisticas({
        promedioGeneral: 0,
        distribucionNotas: [],
        aprobados: 0,
        desaprobados: 0,
        mejorNota: 0,
        peorNota: 20
      });
      return;
    }
    
    // Agrupar notas por estudiante y calcular promedio
    const notasPorEstudiante = notasCargadas.reduce((acc, nota) => {
      if (!acc[nota.estudianteId]) {
        acc[nota.estudianteId] = {
          estudiante: nota.estudiante,
          notas: [],
          promedio: 0
        };
      }
      
      acc[nota.estudianteId].notas.push({
        valor: nota.valor,
        peso: nota.evaluacion.peso
      });
      
      return acc;
    }, {});
    
    // Calcular promedio ponderado para cada estudiante
    Object.values(notasPorEstudiante).forEach(estudiante => {
      const sumaPonderada = estudiante.notas.reduce((sum, nota) => sum + (nota.valor * nota.peso), 0);
      const sumaPesos = estudiante.notas.reduce((sum, nota) => sum + nota.peso, 0);
      estudiante.promedio = sumaPesos > 0 ? sumaPonderada / sumaPesos : 0;
    });
    
    // Calcular promedio general
    const promedios = Object.values(notasPorEstudiante).map(e => e.promedio);
    const promedioGeneral = promedios.reduce((sum, p) => sum + p, 0) / promedios.length;
    
    // Calcular distribución de notas (para gráfico)
    const distribucionNotas = [
      { rango: '0-5', cantidad: 0, color: '#ef4444' },
      { rango: '6-10', cantidad: 0, color: '#f97316' },
      { rango: '11-13', cantidad: 0, color: '#eab308' },
      { rango: '14-16', cantidad: 0, color: '#84cc16' },
      { rango: '17-20', cantidad: 0, color: '#22c55e' }
    ];
    
    promedios.forEach(promedio => {
      if (promedio >= 0 && promedio <= 5) distribucionNotas[0].cantidad++;
      else if (promedio > 5 && promedio <= 10) distribucionNotas[1].cantidad++;
      else if (promedio > 10 && promedio <= 13) distribucionNotas[2].cantidad++;
      else if (promedio > 13 && promedio <= 16) distribucionNotas[3].cantidad++;
      else if (promedio > 16 && promedio <= 20) distribucionNotas[4].cantidad++;
    });
    
    // Calcular aprobados y desaprobados (considerando 11 como nota mínima aprobatoria)
    const aprobados = promedios.filter(p => p >= 11).length;
    const desaprobados = promedios.filter(p => p < 11).length;
    
    // Encontrar mejor y peor nota
    const mejorNota = Math.max(...promedios);
    const peorNota = Math.min(...promedios);
    
    setEstadisticas({
      promedioGeneral,
      distribucionNotas,
      aprobados,
      desaprobados,
      mejorNota,
      peorNota
    });
  };

  // Agrupar notas por estudiante
  const notasPorEstudiante = notas.reduce((acc, nota) => {
    if (!acc[nota.estudianteId]) {
      acc[nota.estudianteId] = {
        estudiante: nota.estudiante,
        notas: {}
      };
    }
    
    acc[nota.estudianteId].notas[nota.evaluacionId] = nota;
    
    return acc;
  }, {});

  // Filtrar evaluaciones por periodo seleccionado
  const evaluacionesPeriodo = evaluaciones.filter(
    evaluacion => evaluacion.periodoId === selectedPeriodo
  );

  // Función para obtener el color según la nota
  const getColorNota = (valor) => {
    if (valor >= 18) return "text-green-600 font-bold";
    if (valor >= 14) return "text-green-500";
    if (valor >= 11) return "text-yellow-500";
    if (valor >= 6) return "text-orange-500";
    return "text-red-500";
  };

  // Función para calcular el promedio ponderado de un estudiante
  const calcularPromedioPonderado = (notasEstudiante) => {
    if (!notasEstudiante || Object.keys(notasEstudiante).length === 0) return 0;
    
    let sumaPonderada = 0;
    let sumaPesos = 0;
    
    evaluacionesPeriodo.forEach(evaluacion => {
      const nota = notasEstudiante[evaluacion.id];
      if (nota) {
        sumaPonderada += nota.valor * evaluacion.peso;
        sumaPesos += evaluacion.peso;
      }
    });
    
    return sumaPesos > 0 ? sumaPonderada / sumaPesos : 0;
  };

  // Función para exportar resultados a Excel (simulada)
  const exportarResultados = () => {
    toast.success("Exportando resultados...");
    // Aquí iría la lógica para exportar a Excel
    setTimeout(() => {
      toast.success("Resultados exportados correctamente");
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="bg-green-50">
          <CardTitle className="text-xl text-green-800">Resultados de Evaluaciones</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Curso</label>
                <Select 
                  value={selectedCurso} 
                  onValueChange={setSelectedCurso}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {cursos.map((curso) => (
                      <SelectItem key={curso.id} value={curso.id}>
                        {curso.nombre} - {curso.nivelAcademico?.nivel?.nombre} {curso.nivelAcademico?.grado?.nombre} {curso.nivelAcademico?.seccion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Periodo Académico</label>
                <Select 
                  value={selectedPeriodo} 
                  onValueChange={setSelectedPeriodo}
                  disabled={isLoading || periodos.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    {periodos.map((periodo) => (
                      <SelectItem key={periodo.id} value={periodo.id}>
                        {periodo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Selector de vista */}
            {selectedCurso && selectedPeriodo && (
              <div className="flex justify-between items-center">
                <Tabs value={viewMode} onValueChange={setViewMode} className="w-[300px]">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="tabla">Tabla de Notas</TabsTrigger>
                    <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <Button 
                  variant="outline" 
                  className="flex items-center gap-1"
                  onClick={exportarResultados}
                >
                  <Download className="h-4 w-4" />
                  <span>Exportar</span>
                </Button>
              </div>
            )}
            
            {/* Vista de tabla */}
            {viewMode === "tabla" && selectedCurso && selectedPeriodo && (
              <div className="border rounded-md overflow-hidden">
                {isLoading ? (
                  <div className="text-center py-8">
                    <p>Cargando resultados...</p>
                  </div>
                ) : Object.keys(notasPorEstudiante).length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-lg font-medium">No hay resultados disponibles</p>
                    <p className="text-gray-500">No se han registrado notas para este curso y periodo</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 bg-white z-10">Estudiante</TableHead>
                        {evaluacionesPeriodo.map((evaluacion) => (
                          <TableHead key={evaluacion.id} className="text-center min-w-[100px]">
                            <div className="font-medium">{evaluacion.nombre}</div>
                            <div className="text-xs text-gray-500">({evaluacion.peso}%)</div>
                          </TableHead>
                        ))}
                        <TableHead className="text-center bg-gray-50">Promedio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.values(notasPorEstudiante).map((item) => {
                        const promedio = calcularPromedioPonderado(item.notas);
                        
                        return (
                          <TableRow key={item.estudiante.id}>
                            <TableCell className="font-medium sticky left-0 bg-white z-10">
                              {item.estudiante.nombre} {item.estudiante.apellido}
                            </TableCell>
                            
                            {evaluacionesPeriodo.map((evaluacion) => {
                              const nota = item.notas[evaluacion.id];
                              
                              return (
                                <TableCell key={evaluacion.id} className="text-center">
                                  {nota ? (
                                    <span className={getColorNota(nota.valor)}>
                                      {nota.valor.toFixed(1)}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </TableCell>
                              );
                            })}
                            
                            <TableCell className={`text-center font-bold bg-gray-50 ${getColorNota(promedio)}`}>
                              {promedio.toFixed(1)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}
            
            {/* Vista de estadísticas */}
            {viewMode === "estadisticas" && selectedCurso && selectedPeriodo && (
              <div className="space-y-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <p>Cargando estadísticas...</p>
                  </div>
                ) : Object.keys(notasPorEstudiante).length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-lg font-medium">No hay estadísticas disponibles</p>
                    <p className="text-gray-500">No se han registrado notas para este curso y periodo</p>
                  </div>
                ) : (
                  <>
                    {/* Resumen de estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Promedio General</p>
                            <p className={`text-3xl font-bold ${getColorNota(estadisticas.promedioGeneral)}`}>
                              {estadisticas.promedioGeneral.toFixed(1)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Aprobados</p>
                            <div className="flex items-center justify-center gap-2">
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                              <p className="text-3xl font-bold text-green-600">
                                {estadisticas.aprobados}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Desaprobados</p>
                            <div className="flex items-center justify-center gap-2">
                              <AlertCircle className="h-5 w-5 text-red-500" />
                              <p className="text-3xl font-bold text-red-600">
                                {estadisticas.desaprobados}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Rango de Notas</p>
                            <p className="text-xl font-bold">
                              <span className={getColorNota(estadisticas.peorNota)}>
                                {estadisticas.peorNota.toFixed(1)}
                              </span>
                              <span className="mx-1">-</span>
                              <span className={getColorNota(estadisticas.mejorNota)}>
                                {estadisticas.mejorNota.toFixed(1)}
                              </span>
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Gráfico de distribución de notas */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Distribución de Notas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={estadisticas.distribucionNotas}
                              margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="rango" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="cantidad" name="Cantidad de estudiantes">
                                {estadisticas.distribucionNotas.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            )}
            
            {/* Mensaje cuando no hay curso o periodo seleccionado */}
            {(!selectedCurso || !selectedPeriodo) && (
              <div className="text-center py-8 bg-gray-50 rounded-md">
                <p>Seleccione un curso y un periodo para ver los resultados</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
