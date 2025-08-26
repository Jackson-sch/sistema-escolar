"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, isAfter, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { obtenerEvaluacionesPendientes } from "@/action/evaluaciones/evaluacion";

export default function PendientesEvaluaciones({ user }) {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar evaluaciones pendientes
  useEffect(() => {
    const cargarEvaluacionesPendientes = async () => {
      setIsLoading(true);
      try {
        const data = await obtenerEvaluacionesPendientes(user.id);
        setEvaluaciones(data);
      } catch (error) {
        console.error("Error al cargar evaluaciones pendientes:", error);
        toast.error("Error al cargar las evaluaciones pendientes");
      } finally {
        setIsLoading(false);
      }
    };
    
    cargarEvaluacionesPendientes();
  }, [user.id]);

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

  // Función para calcular el estado de la evaluación pendiente
  const getEstadoPendiente = (evaluacion) => {
    const hoy = new Date();
    const fecha = new Date(evaluacion.fecha);
    const fechaLimite = evaluacion.fechaLimite ? new Date(evaluacion.fechaLimite) : null;
    
    // Si la fecha límite existe y ya pasó
    if (fechaLimite && isAfter(hoy, fechaLimite)) {
      return {
        estado: "vencida",
        label: "Vencida",
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
        color: "bg-red-100 text-red-800"
      };
    }
    
    // Si la fecha límite existe y está próxima (menos de 3 días)
    if (fechaLimite) {
      const diasRestantes = Math.ceil((fechaLimite - hoy) / (1000 * 60 * 60 * 24));
      
      if (diasRestantes <= 3) {
        return {
          estado: "proxima",
          label: `${diasRestantes} día${diasRestantes !== 1 ? 's' : ''} restante${diasRestantes !== 1 ? 's' : ''}`,
          icon: <Clock className="h-4 w-4 text-orange-500" />,
          color: "bg-orange-100 text-orange-800"
        };
      }
    }
    
    // Si la fecha de evaluación es futura
    if (isBefore(hoy, fecha)) {
      return {
        estado: "programada",
        label: "Programada",
        icon: <CalendarIcon className="h-4 w-4 text-blue-500" />,
        color: "bg-blue-100 text-blue-800"
      };
    }
    
    // Si la fecha de evaluación ya pasó pero hay fecha límite futura
    if (isAfter(hoy, fecha) && fechaLimite && isBefore(hoy, fechaLimite)) {
      return {
        estado: "en_curso",
        label: "En curso",
        icon: <Clock className="h-4 w-4 text-yellow-500" />,
        color: "bg-yellow-100 text-yellow-800"
      };
    }
    
    // Por defecto
    return {
      estado: "pendiente",
      label: "Pendiente",
      icon: <Clock className="h-4 w-4 text-gray-500" />,
      color: "bg-gray-100 text-gray-800"
    };
  };

  // Agrupar evaluaciones por curso
  const evaluacionesPorCurso = evaluaciones.reduce((acc, evaluacion) => {
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
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-green-50">
          <CardTitle className="text-xl text-green-800">Evaluaciones Pendientes</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">
              <p>Cargando evaluaciones pendientes...</p>
            </div>
          ) : evaluaciones.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-md">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-lg font-medium">¡No tienes evaluaciones pendientes!</p>
              <p className="text-gray-500">Todas tus evaluaciones están al día</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(evaluacionesPorCurso).map(([cursoId, { curso, evaluaciones }]) => (
                <Card key={cursoId} className="overflow-hidden border-t-4 border-t-blue-500">
                  <CardHeader className="bg-blue-50 py-3">
                    <CardTitle className="text-lg text-blue-800">
                      {curso.nombre} - {curso.nivelAcademico?.nivel?.nombre} {curso.nivelAcademico?.grado?.nombre} {curso.nivelAcademico?.seccion}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Evaluación</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Fecha Límite</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {evaluaciones.map((evaluacion) => {
                          const estado = getEstadoPendiente(evaluacion);
                          
                          return (
                            <TableRow key={evaluacion.id}>
                              <TableCell className="font-medium">{evaluacion.nombre}</TableCell>
                              <TableCell>
                                <Badge className={getBadgeColor(evaluacion.tipo)} variant="outline">
                                  {formatTipoEvaluacion(evaluacion.tipo)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {format(new Date(evaluacion.fecha), "dd/MM/yyyy")}
                              </TableCell>
                              <TableCell>
                                {evaluacion.fechaLimite ? (
                                  format(new Date(evaluacion.fechaLimite), "dd/MM/yyyy")
                                ) : (
                                  <span className="text-gray-400">No definida</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${estado.color}`}>
                                    {estado.icon}
                                    <span className="ml-1">{estado.label}</span>
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="bg-blue-50 hover:bg-blue-100 text-blue-700"
                                >
                                  Ver detalles
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
