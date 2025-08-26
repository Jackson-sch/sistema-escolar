"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { obtenerCursosPorEstudiante, obtenerCursosPorProfesor } from "@/action/cursos/curso";
import { registrarNotasMasivas, obtenerNotasPorEvaluacion } from "@/action/evaluaciones/nota";

export default function CalificarEvaluaciones({ user, cursos }) {
  const [selectedCurso, setSelectedCurso] = useState("");
  const [selectedEvaluacion, setSelectedEvaluacion] = useState("");
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [notas, setNotas] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notasExistentes, setNotasExistentes] = useState([]);
  const [escalaCalificacion, setEscalaCalificacion] = useState("VIGESIMAL");
  
  // Cargar evaluaciones cuando cambia el curso seleccionado
  useEffect(() => {
    const cargarEvaluaciones = async () => {
      if (!selectedCurso) {
        setEvaluaciones([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const evaluacionesProfesor = await obtenerEvaluacionesPorProfesor(user.id);
        // Filtrar evaluaciones por curso seleccionado
        const evaluacionesCurso = evaluacionesProfesor.filter(
          (evaluacion) => evaluacion.cursoId === selectedCurso
        );
        setEvaluaciones(evaluacionesCurso);
      } catch (error) {
        console.error('Error al cargar evaluaciones:', error);
        toast.error('Error al cargar las evaluaciones');
      } finally {
        setIsLoading(false);
      }
    };
    
    cargarEvaluaciones();
  }, [selectedCurso, user.id]);
  
  // Cargar estudiantes y notas existentes cuando cambia la evaluación seleccionada
  useEffect(() => {
    const cargarEstudiantesYNotas = async () => {
      if (!selectedCurso || !selectedEvaluacion) {
        setEstudiantes([]);
        setNotasExistentes([]);
        return;
      }
      
      setIsLoading(true);
      try {
        // Obtener estudiantes del curso
        const estudiantesCurso = await obtenerEstudiantesPorCurso(selectedCurso);
        setEstudiantes(estudiantesCurso);
        
        // Obtener notas existentes para la evaluación
        const notasEvaluacion = await obtenerNotasPorEvaluacion(selectedEvaluacion);
        setNotasExistentes(notasEvaluacion);
        
        // Establecer la escala de calificación según la evaluación seleccionada
        const evaluacionSeleccionada = evaluaciones.find(e => e.id === selectedEvaluacion);
        if (evaluacionSeleccionada) {
          setEscalaCalificacion(evaluacionSeleccionada.escalaCalificacion);
        }
        
        // Inicializar el estado de notas con las notas existentes
        const notasIniciales = {};
        estudiantesCurso.forEach(estudiante => {
          const notaExistente = notasEvaluacion.find(n => n.estudianteId === estudiante.id);
          if (notaExistente) {
            notasIniciales[estudiante.id] = notaExistente.valor.toString();
          } else {
            notasIniciales[estudiante.id] = '';
          }
        });
        
        setNotas(notasIniciales);
      } catch (error) {
        console.error('Error al cargar estudiantes y notas:', error);
        toast.error('Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };
    
    cargarEstudiantesYNotas();
  }, [selectedCurso, selectedEvaluacion, evaluaciones]);
  
  // Manejar cambio de nota para un estudiante
  const handleNotaChange = (estudianteId, valor) => {
    setNotas(prev => ({
      ...prev,
      [estudianteId]: valor
    }));
  };
  
  // Guardar todas las notas
  const handleGuardarNotas = async () => {
    setIsSaving(true);
    
    try {
      // Preparar datos para enviar
      const notasParaEnviar = Object.entries(notas)
        .filter(([_, valor]) => valor.trim() !== '') // Solo enviar notas con valor
        .map(([estudianteId, valor]) => ({
          estudianteId,
          evaluacionId: selectedEvaluacion,
          cursoId: selectedCurso,
          valor: parseFloat(valor)
        }));
      
      if (notasParaEnviar.length === 0) {
        toast.warning('No hay notas para guardar');
        setIsSaving(false);
        return;
      }
      
      const resultado = await registrarNotasMasivas(notasParaEnviar);
      
      if (resultado.error) {
        toast.error(resultado.error);
      } else {
        toast.success(resultado.success || 'Notas guardadas correctamente');
        
        // Recargar notas
        const notasActualizadas = await obtenerNotasPorEvaluacion(selectedEvaluacion);
        setNotasExistentes(notasActualizadas);
      }
    } catch (error) {
      console.error('Error al guardar notas:', error);
      toast.error('Error al guardar las notas');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Validar si una nota está dentro del rango permitido según la escala
  const validarNota = (valor) => {
    if (valor === '') return true;
    
    const num = parseFloat(valor);
    if (isNaN(num)) return false;
    
    switch (escalaCalificacion) {
      case 'VIGESIMAL':
        return num >= 0 && num <= 20;
      case 'LITERAL':
        // Para escala literal, se espera un valor numérico que luego se convertirá
        return num >= 0 && num <= 4;
      case 'DESCRIPTIVA':
        // Para escala descriptiva, se espera un valor numérico que luego se convertirá
        return num >= 0 && num <= 3;
      default:
        return true;
    }
  };
  
  // Obtener el texto descriptivo según el valor y la escala
  const getDescriptivoNota = (valor) => {
    if (valor === '' || isNaN(parseFloat(valor))) return '';
    
    const num = parseFloat(valor);
    
    switch (escalaCalificacion) {
      case 'VIGESIMAL':
        if (num >= 18) return 'Excelente';
        if (num >= 14) return 'Bueno';
        if (num >= 11) return 'Regular';
        return 'Deficiente';
      case 'LITERAL':
        if (num >= 4) return 'AD - Logro destacado';
        if (num >= 3) return 'A - Logro esperado';
        if (num >= 2) return 'B - En proceso';
        return 'C - En inicio';
      case 'DESCRIPTIVA':
        if (num >= 3) return 'Logro destacado';
        if (num >= 2) return 'Logro esperado';
        if (num >= 1) return 'En proceso';
        return 'En inicio';
      default:
        return '';
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="bg-green-50">
          <CardTitle className="text-xl text-green-800">Calificar Evaluaciones</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Selección de curso y evaluación */}
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
                <label className="text-sm font-medium mb-1 block">Evaluación</label>
                <Select 
                  value={selectedEvaluacion} 
                  onValueChange={setSelectedEvaluacion}
                  disabled={isLoading || evaluaciones.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una evaluación" />
                  </SelectTrigger>
                  <SelectContent>
                    {evaluaciones.map((evaluacion) => (
                      <SelectItem key={evaluacion.id} value={evaluacion.id}>
                        {evaluacion.nombre} ({format(new Date(evaluacion.fecha), 'dd/MM/yyyy')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Información de la evaluación seleccionada */}
            {selectedEvaluacion && evaluaciones.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-md">
                {(() => {
                  const evaluacion = evaluaciones.find(e => e.id === selectedEvaluacion);
                  if (!evaluacion) return null;
                  
                  return (
                    <div className="text-sm">
                      <p className="font-medium">{evaluacion.nombre}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                        <div>
                          <span className="font-medium">Fecha:</span> {format(new Date(evaluacion.fecha), 'dd/MM/yyyy')}
                        </div>
                        <div>
                          <span className="font-medium">Escala:</span> {
                            evaluacion.escalaCalificacion === 'VIGESIMAL' ? 'Vigesimal (0-20)' :
                            evaluacion.escalaCalificacion === 'LITERAL' ? 'Literal (AD, A, B, C)' :
                            'Descriptiva'
                          }
                        </div>
                        <div>
                          <span className="font-medium">Peso:</span> {evaluacion.peso}%
                        </div>
                      </div>
                      {evaluacion.descripcion && (
                        <p className="mt-2">{evaluacion.descripcion}</p>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
            
            {/* Tabla de calificaciones */}
            {selectedCurso && selectedEvaluacion && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Registro de Calificaciones</h3>
                  <Button 
                    onClick={handleGuardarNotas} 
                    disabled={isLoading || isSaving || estudiantes.length === 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-1">
                        <span className="animate-spin">⏳</span> Guardando...
                      </span>
                    ) : (
                      'Guardar Notas'
                    )}
                  </Button>
                </div>
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <p>Cargando datos...</p>
                  </div>
                ) : estudiantes.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-md">
                    <p>No hay estudiantes registrados en este curso</p>
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Estudiante</TableHead>
                          <TableHead className="w-32">Calificación</TableHead>
                          <TableHead>Descriptivo</TableHead>
                          <TableHead className="w-32">Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {estudiantes.map((estudiante, index) => {
                          const notaActual = notas[estudiante.id] || '';
                          const notaExistente = notasExistentes.find(
                            n => n.estudianteId === estudiante.id
                          );
                          const esValida = validarNota(notaActual);
                          
                          return (
                            <TableRow key={estudiante.id}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{estudiante.nombre} {estudiante.apellido}</p>
                                  <p className="text-xs text-gray-500">{estudiante.email}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Input 
                                  type="text"
                                  value={notaActual}
                                  onChange={(e) => handleNotaChange(estudiante.id, e.target.value)}
                                  className={`w-24 ${!esValida ? 'border-red-500' : ''}`}
                                  placeholder="Nota"
                                />
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {getDescriptivoNota(notaActual)}
                                </div>
                              </TableCell>
                              <TableCell>
                                {notaExistente ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Registrada
                                  </span>
                                ) : notaActual ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Pendiente
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Sin calificar
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
            
            {/* Mensaje cuando no hay curso o evaluación seleccionada */}
            {(!selectedCurso || !selectedEvaluacion) && (
              <div className="text-center py-8 bg-gray-50 rounded-md">
                <p>Seleccione un curso y una evaluación para comenzar a calificar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
