"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Edit, Trash2, Eye, FileText, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { obtenerEvaluacionesPorCurso, obtenerEvaluacionesPorProfesor, eliminarEvaluacion } from "@/action/evaluaciones/evaluacion";
import CrearEvaluacion from "./CrearEvaluacion";

export default function ListaEvaluaciones({ user, cursos, onSelectEvaluacion }) {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [selectedCurso, setSelectedCurso] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingEvaluacion, setEditingEvaluacion] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroPeriodo, setFiltroPeriodo] = useState("todos");
  const [periodos, setPeriodos] = useState([]);
  const [viewMode, setViewMode] = useState("lista");

  // Cargar evaluaciones
  const loadEvaluaciones = async () => {
    setIsLoading(true);
    try {
      let data;
      if (selectedCurso) {
        data = await obtenerEvaluacionesPorCurso(selectedCurso);
      } else {
        data = await obtenerEvaluacionesPorProfesor(user.id);
      }
      setEvaluaciones(data);
      
      // Extraer periodos únicos
      const uniquePeriodos = Array.from(
        new Set(data.map(evaluacion => evaluacion.periodo?.id))
      ).map(id => {
        const periodo = data.find(evaluacion => evaluacion.periodo?.id === id)?.periodo;
        return periodo;
      }).filter(Boolean);
      
      setPeriodos(uniquePeriodos);
    } catch (error) {
      console.error("Error al cargar evaluaciones:", error);
      toast.error("Error al cargar las evaluaciones");
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar evaluaciones al inicio o al cambiar el curso seleccionado
  useEffect(() => {
    loadEvaluaciones();
  }, [selectedCurso, user.id]);

  // Manejar la eliminación de una evaluación
  const handleDelete = async (id) => {
    try {
      const result = await eliminarEvaluacion(id);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        loadEvaluaciones();
      }
    } catch (error) {
      console.error("Error al eliminar evaluación:", error);
      toast.error("Error al eliminar la evaluación");
    }
  };

  // Manejar la edición de una evaluación
  const handleEdit = (evaluacion) => {
    setEditingEvaluacion(evaluacion);
    setIsDialogOpen(true);
  };

  // Manejar la actualización de una evaluación
  const handleUpdated = () => {
    setIsDialogOpen(false);
    setEditingEvaluacion(null);
    loadEvaluaciones();
  };

  // Filtrar evaluaciones
  const filteredEvaluaciones = evaluaciones.filter(evaluacion => {
    const matchesSearch = 
      evaluacion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluacion.curso?.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = filtroTipo === "todos" || evaluacion.tipo === filtroTipo;
    const matchesPeriodo = filtroPeriodo === "todos" || evaluacion.periodoId === filtroPeriodo;
    
    return matchesSearch && matchesTipo && matchesPeriodo;
  });

  // Obtener tipos de evaluación únicos para el filtro
  const tiposEvaluacion = Array.from(
    new Set(evaluaciones.map(evaluacion => evaluacion.tipo))
  );

  // Función para obtener el color de la badge según el tipo de evaluación
  const getBadgeColor = (tipo) => {
    switch (tipo) {
      case "DIAGNOSTICA": return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "FORMATIVA": return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "SUMATIVA": return "bg-green-100 text-green-800 hover:bg-green-200";
      case "RECUPERACION": return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      case "EXAMEN_FINAL": return "bg-red-100 text-red-800 hover:bg-red-200";
      case "TRABAJO_PRACTICO": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "PROYECTO": return "bg-indigo-100 text-indigo-800 hover:bg-indigo-200";
      case "EXPOSICION": return "bg-pink-100 text-pink-800 hover:bg-pink-200";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  // Función para formatear el tipo de evaluación
  const formatTipoEvaluacion = (tipo) => {
    const formatMap = {
      "DIAGNOSTICA": "Diagnóstica",
      "FORMATIVA": "Formativa",
      "SUMATIVA": "Sumativa",
      "RECUPERACION": "Recuperación",
      "EXAMEN_FINAL": "Examen Final",
      "TRABAJO_PRACTICO": "Trabajo Práctico",
      "PROYECTO": "Proyecto",
      "EXPOSICION": "Exposición"
    };
    
    return formatMap[tipo] || tipo;
  };

  // Función para obtener el estado de la evaluación
  const getEstadoEvaluacion = (evaluacion) => {
    const hoy = new Date();
    const fecha = new Date(evaluacion.fecha);
    const fechaLimite = evaluacion.fechaLimite ? new Date(evaluacion.fechaLimite) : null;
    
    if (!evaluacion.activa) {
      return { estado: "inactiva", label: "Inactiva", icon: <AlertCircle className="h-4 w-4 text-gray-500" /> };
    }
    
    if (fechaLimite && hoy > fechaLimite) {
      return { estado: "cerrada", label: "Cerrada", icon: <CheckCircle2 className="h-4 w-4 text-green-500" /> };
    }
    
    if (hoy < fecha) {
      return { estado: "pendiente", label: "Pendiente", icon: <Clock className="h-4 w-4 text-blue-500" /> };
    }
    
    if (fechaLimite && hoy <= fechaLimite) {
      return { estado: "en_curso", label: "En curso", icon: <FileText className="h-4 w-4 text-yellow-500" /> };
    }
    
    return { estado: "realizada", label: "Realizada", icon: <CheckCircle2 className="h-4 w-4 text-green-500" /> };
  };

  // Agrupar evaluaciones por curso para la vista de tarjetas
  const evaluacionesPorCurso = filteredEvaluaciones.reduce((acc, evaluacion) => {
    const cursoId = evaluacion.cursoId;
    if (!acc[cursoId]) {
      acc[cursoId] = {
        curso: evaluacion.curso,
        evaluaciones: []
      };
    }
    acc[cursoId].evaluaciones.push(evaluacion);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Select 
            value={selectedCurso || "todos"} 
            onValueChange={setSelectedCurso}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los cursos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los cursos</SelectItem>
              {cursos.map((curso) => (
                <SelectItem key={curso.id} value={curso.id}>
                  {curso.nombre} - {curso.nivelAcademico?.nivel?.nombre} {curso.nivelAcademico?.grado?.nombre} {curso.nivelAcademico?.seccion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select 
            value={filtroTipo} 
            onValueChange={setFiltroTipo}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              {tiposEvaluacion.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {formatTipoEvaluacion(tipo)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select 
            value={filtroPeriodo} 
            onValueChange={setFiltroPeriodo}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los periodos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los periodos</SelectItem>
              {periodos.map((periodo) => (
                <SelectItem key={periodo.id} value={periodo.id}>
                  {periodo.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Input 
            placeholder="Buscar evaluación..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Selector de vista */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Vista:</span>
          <Tabs value={viewMode} onValueChange={setViewMode} className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="lista">Lista</TabsTrigger>
              <TabsTrigger value="tarjetas">Tarjetas</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="text-sm text-gray-500">
          {filteredEvaluaciones.length} evaluaciones encontradas
        </div>
      </div>
      
      {/* Vista de lista */}
      {viewMode === "lista" && (
        <Card>
          <CardHeader className="bg-green-50 py-4">
            <CardTitle className="text-lg text-green-800">
              Lista de Evaluaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Periodo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Cargando evaluaciones...
                      </TableCell>
                    </TableRow>
                  ) : filteredEvaluaciones.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No se encontraron evaluaciones
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEvaluaciones.map((evaluacion) => {
                      const estado = getEstadoEvaluacion(evaluacion);
                      
                      return (
                        <TableRow key={evaluacion.id}>
                          <TableCell className="font-medium">{evaluacion.nombre}</TableCell>
                          <TableCell>{evaluacion.curso?.nombre}</TableCell>
                          <TableCell>
                            <Badge className={getBadgeColor(evaluacion.tipo)} variant="outline">
                              {formatTipoEvaluacion(evaluacion.tipo)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(evaluacion.fecha), "dd/MM/yyyy")}
                            {evaluacion.fechaLimite && (
                              <div className="text-xs text-gray-500">
                                Límite: {format(new Date(evaluacion.fechaLimite), "dd/MM/yyyy")}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{evaluacion.periodo?.nombre}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {estado.icon}
                              <span>{estado.label}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => onSelectEvaluacion(evaluacion)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleEdit(evaluacion)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer. Se eliminará permanentemente la evaluación "{evaluacion.nombre}".
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDelete(evaluacion.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Vista de tarjetas */}
      {viewMode === "tarjetas" && (
        <div className="space-y-6">
          {Object.entries(evaluacionesPorCurso).map(([cursoId, { curso, evaluaciones }]) => (
            <Card key={cursoId}>
              <CardHeader className="bg-green-50 py-4">
                <CardTitle className="text-lg text-green-800">
                  {curso.nombre} - {curso.nivelAcademico?.nivel?.nombre} {curso.nivelAcademico?.grado?.nombre} {curso.nivelAcademico?.seccion}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {evaluaciones.map((evaluacion) => {
                    const estado = getEstadoEvaluacion(evaluacion);
                    
                    return (
                      <Card key={evaluacion.id} className="overflow-hidden">
                        <CardHeader className={`py-3 ${!evaluacion.activa ? 'bg-gray-100' : 'bg-green-50'}`}>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base">{evaluacion.nombre}</CardTitle>
                            <Badge className={getBadgeColor(evaluacion.tipo)} variant="outline">
                              {formatTipoEvaluacion(evaluacion.tipo)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4 text-gray-500" />
                              <span>{format(new Date(evaluacion.fecha), "dd/MM/yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {estado.icon}
                              <span>{estado.label}</span>
                            </div>
                          </div>
                          
                          {evaluacion.fechaLimite && (
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Límite: {format(new Date(evaluacion.fechaLimite), "dd/MM/yyyy")}</span>
                            </div>
                          )}
                          
                          <div className="text-sm">
                            <span className="font-medium">Periodo:</span> {evaluacion.periodo?.nombre}
                          </div>
                          
                          {evaluacion.descripcion && (
                            <div className="text-sm text-gray-600 line-clamp-2">
                              {evaluacion.descripcion}
                            </div>
                          )}
                          
                          <div className="pt-2 flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => onSelectEvaluacion(evaluacion)}
                            >
                              <Eye className="h-4 w-4 mr-1" /> Ver
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEdit(evaluacion)}
                            >
                              <Edit className="h-4 w-4 mr-1" /> Editar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {Object.keys(evaluacionesPorCurso).length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No se encontraron evaluaciones con los filtros aplicados
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {/* Modal de edición */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Editar Evaluación</DialogTitle>
          </DialogHeader>
          {editingEvaluacion && (
            <CrearEvaluacion 
              user={user} 
              cursos={cursos} 
              periodos={periodos} 
              evaluacion={editingEvaluacion} 
              onCreated={handleUpdated}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
