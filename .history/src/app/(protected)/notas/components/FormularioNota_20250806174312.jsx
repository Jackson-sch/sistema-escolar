"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Save, X } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCursosProfesor, getEstudiantesPorCurso, getEvaluacionesPorCurso } from "@/action/notas/nota";
import { useUser } from "@/context/UserContext";

// Esquema de validación para notas
const notaSchema = z.object({
  estudianteId: z.string().min(1, "El estudiante es obligatorio"),
  cursoId: z.string().min(1, "El curso es obligatorio"),
  evaluacionId: z.string().min(1, "La evaluación es obligatoria"),
  valor: z.coerce.number()
    .min(0, "La nota no puede ser menor a 0")
    .max(20, "La nota no puede ser mayor a 20"),
  comentario: z.string().optional(),
});

export default function FormularioNota({ notaId = null, onSuccess, onCancel }) {
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [cursos, setCursos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
  const [loadingEvaluaciones, setLoadingEvaluaciones] = useState(false);
  const [notaActual, setNotaActual] = useState(null);

  // Inicializar el formulario con React Hook Form
  const form = useForm({
    resolver: zodResolver(notaSchema),
    defaultValues: {
      estudianteId: "no_seleccionado",
      cursoId: "no_seleccionado",
      evaluacionId: "no_seleccionado",
      valor: "",
      comentario: "",
    },
    mode: "onChange", // Validar al cambiar los campos
  });

  // Cargar cursos al iniciar
  useEffect(() => {
    const cargarCursos = async () => {
      try {
        setLoading(true);
        const cursosData = await getCursosProfesor();
        if (cursosData) {
          setCursos(cursosData);
        }
      } catch (error) {
        console.error("Error al cargar cursos:", error);
        toast.error("No se pudieron cargar los cursos");
      } finally {
        setLoading(false);
      }
    };

    cargarCursos();
  }, []);

  // Si hay un ID de nota, cargar los datos de la nota
  useEffect(() => {
    if (notaId) {
      const cargarNota = async () => {
        try {
          setLoading(true);

          // Importar la función para obtener la nota por ID
          const { getNotaPorId } = await import('@/action/notas/nota');

          // Obtener la nota desde el servidor
          const notaData = await getNotaPorId(notaId);

          if (!notaData) {
            toast.error("No se encontró la nota solicitada");
            return;
          }

          // Guardar la nota actual en el estado
          setNotaActual(notaData);

          // Cargar los datos del curso primero
          const { getEstudiantesPorCurso, getEvaluacionesPorCurso } = await import('@/action/notas/nota');

          // Cargar estudiantes y evaluaciones directamente aquí
          const [estudiantesData, evaluacionesData] = await Promise.all([
            getEstudiantesPorCurso(notaData.cursoId),
            getEvaluacionesPorCurso(notaData.cursoId)
          ]);

          // Actualizar los estados con los datos cargados
          setEstudiantes(estudiantesData || []);
          setEvaluaciones(evaluacionesData || []);

          // Establecer todos los valores del formulario de una vez
          form.reset({
            cursoId: notaData.cursoId,
            estudianteId: notaData.estudianteId,
            evaluacionId: notaData.evaluacionId,
            valor: notaData.valor,
            comentario: notaData.comentario || ""
          });
        } catch (error) {
          console.error("Error al cargar nota:", error);
          toast.error("No se pudo cargar la nota para editar");
        } finally {
          setLoading(false);
        }
      };

      cargarNota();
    }
  }, [notaId, form]);

  // Mejorar el handleCursoChange para mostrar mejor feedback
  const handleCursoChange = async (cursoId, isEditing = false) => {
    if (!cursoId || cursoId === "no_seleccionado") {
      setEstudiantes([]);
      setEvaluaciones([]);
      return;
    }

    // Solo resetear los valores si no estamos en modo edición
    if (!isEditing) {
      form.setValue("estudianteId", "no_seleccionado");
      form.setValue("evaluacionId", "no_seleccionado");
    }

    try {
      setLoadingEstudiantes(true);
      setLoadingEvaluaciones(true);

      // Cargar en paralelo para mejor rendimiento
      const [estudiantesData, evaluacionesData] = await Promise.all([
        getEstudiantesPorCurso(cursoId),
        getEvaluacionesPorCurso(cursoId)
      ]);

      if (estudiantesData) {
        console.log(`Estudiantes cargados para curso ${cursoId}:`, estudiantesData.length);
        setEstudiantes(estudiantesData);
      }

      if (evaluacionesData) {
        console.log(`Evaluaciones cargadas para curso ${cursoId}:`, evaluacionesData.length);
        setEvaluaciones(evaluacionesData);
      }

    } catch (error) {
      console.error("Error al cargar datos del curso:", error);
      toast.error("No se pudieron cargar los datos del curso");
      setEstudiantes([]);
      setEvaluaciones([]);
    } finally {
      setLoadingEstudiantes(false);
      setLoadingEvaluaciones(false);
    }
  };

  // Enviar el formulario
  // Función para resetear completamente el formulario
  const resetForm = () => {
    // Crear un nuevo formulario desde cero (solución más radical)
    const defaultValues = {
      estudianteId: "no_seleccionado",
      cursoId: "no_seleccionado",
      evaluacionId: "no_seleccionado",
      valor: "",
      comentario: ""
    };

    // Resetear completamente el formulario
    form.reset(defaultValues);

    // Limpiar todos los errores explícitamente
    form.clearErrors();

    // Limpiar las listas dependientes si es un nuevo registro
    if (!notaId) {
      setEstudiantes([]);
      setEvaluaciones([]);
    }

    // Forzar una actualización del DOM para eliminar los mensajes de error
    setTimeout(() => {
      // Esto fuerza una re-renderización completa del formulario
      document.querySelectorAll('.form-message').forEach(el => {
        el.innerHTML = '';
      });

      // También podemos ocultar los mensajes de error con CSS
      document.querySelectorAll('[data-state="error"]').forEach(el => {
        el.removeAttribute('data-state');
      });
    }, 100);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Verificar que todos los campos requeridos tengan valores válidos
      if (!data.estudianteId || data.estudianteId === "no_seleccionado" ||
        !data.cursoId || data.cursoId === "no_seleccionado" ||
        !data.evaluacionId || data.evaluacionId === "no_seleccionado") {
        toast.error("Todos los campos son obligatorios");
        setLoading(false);
        return;
      }

      // Verificar que el valor de la nota sea un número válido
      if (isNaN(Number(data.valor))) {
        toast.error("La calificación debe ser un número válido");
        setLoading(false);
        return;
      }

      // Asegurarse de que los valores sean strings válidos
      const formData = {
        ...data,
        estudianteId: String(data.estudianteId),
        cursoId: String(data.cursoId),
        evaluacionId: String(data.evaluacionId),
        valor: Number(data.valor),
        comentario: data.comentario || "",
        valorLiteral: "",
        valorDescriptivo: ""
      };

      console.log("Enviando datos:", formData);

      // Importar la función para registrar o actualizar nota
      const { registrarNota, actualizarNota } = await import('@/action/notas/nota');

      let resultado;
      if (notaId) {
        // Actualizar nota existente
        resultado = await actualizarNota({
          ...formData,
          id: notaId,
        });
      } else {
        // Registrar nueva nota
        resultado = await registrarNota(formData);
      }

      if (resultado?.error) {
        toast.error(resultado.error);
        setLoading(false);
        return;
      }

      toast.success(notaId ? "Nota actualizada correctamente" : "Nota registrada correctamente");

      // Resetear completamente el formulario
      resetForm();

      // Si hay una función de éxito, ejecutarla
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error al guardar nota:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener el estado de la nota según su valor
  const getEstadoNota = (valor) => {
    if (valor >= 18) return { label: "Excelente", color: "bg-green-500" };
    if (valor >= 14) return { label: "Muy bueno", color: "bg-blue-500" };
    if (valor >= 11) return { label: "Aprobado", color: "bg-yellow-500" };
    return { label: "Desaprobado", color: "bg-red-500" };
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
        <CardHeader className="pb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              {notaId ? (
                <Edit className="h-6 w-6" />
              ) : (
                <Plus className="h-6 w-6" />
              )}
            </div>
            <div>
              <CardTitle className="text-xl font-bold">
                {notaId ? "Editar Calificación" : "Registrar Nueva Calificación"}
              </CardTitle>
              <p className="text-blue-100 text-sm mt-1">
                {notaId ? "Modifica los datos de la calificación existente" : "Completa el formulario para registrar una nueva calificación"}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Sección 1: Selección de Curso */}
              <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Información del Curso</h3>
                </div>

                <FormField
                  control={form.control}
                  name="cursoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        Curso
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleCursoChange(value);
                        }}
                        value={field.value || "no_seleccionado"}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20">
                            <SelectValue placeholder="Seleccionar curso" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cursos.map((curso) => (
                            <SelectItem key={curso.id} value={curso.id}>
                              <div className="flex items-center gap-3 py-1">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-md">
                                  <BookOpen className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {curso.areaCurricular?.nombre || curso.nombre}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {curso.nivelAcademico?.nivel?.nombre} - {curso.nivelAcademico?.grado?.nombre} "{curso.nivelAcademico?.seccion}"
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Información del curso seleccionado */}
                {form.watch("cursoId") && form.watch("cursoId") !== "no_seleccionado" && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    {(() => {
                      const cursoSeleccionado = cursos.find(c => c.id === form.watch("cursoId"));
                      if (!cursoSeleccionado) return null;

                      return (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-500 p-2 rounded-lg">
                              <BookOpen className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-blue-900 dark:text-blue-100">
                                {cursoSeleccionado.areaCurricular?.nombre || cursoSeleccionado.nombre}
                              </p>
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                {cursoSeleccionado.nivelAcademico?.nivel?.nombre} - {' '}
                                {cursoSeleccionado.nivelAcademico?.grado?.nombre} "{cursoSeleccionado.nivelAcademico?.seccion}"
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                              <Users className="h-3 w-3 mr-1" />
                              {estudiantes.length} estudiante{estudiantes.length !== 1 ? 's' : ''}
                            </Badge>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                              <FileText className="h-3 w-3 mr-1" />
                              {evaluaciones.length} evaluación{evaluaciones.length !== 1 ? 'es' : ''}
                            </Badge>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Sección 2: Selección de Estudiante y Evaluación */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                      <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Estudiante</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="estudianteId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <User className="h-4 w-4 text-green-600" />
                          Estudiante
                          <span className="text-red-500">*</span>
                          {estudiantes.length > 0 && (
                            <Badge variant="outline" className="ml-auto text-xs">
                              {estudiantes.length} disponible{estudiantes.length !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </FormLabel>
                        <Select
                          disabled={loadingEstudiantes || !form.watch("cursoId")}
                          onValueChange={field.onChange}
                          value={field.value || "no_seleccionado"}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 transition-all duration-200 focus:ring-2 focus:ring-green-500/20">
                              <SelectValue placeholder={
                                loadingEstudiantes
                                  ? "Cargando estudiantes..."
                                  : !form.watch("cursoId") || form.watch("cursoId") === "no_seleccionado"
                                  ? "Primero selecciona un curso"
                                  : "Seleccionar estudiante"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loadingEstudiantes ? (
                              <SelectItem value="loading" disabled>
                                <div className="flex items-center">
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Cargando estudiantes...
                                </div>
                              </SelectItem>
                            ) : estudiantes.length === 0 ? (
                              <SelectItem value="no_seleccionado" disabled>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <AlertCircle className="h-4 w-4" />
                                  No hay estudiantes matriculados en este curso
                                </div>
                              </SelectItem>
                            ) : (
                              estudiantes.map((estudiante) => (
                                <SelectItem key={estudiante.id} value={estudiante.id}>
                                  <div className="flex items-center gap-3 py-1">
                                    <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-md">
                                      <User className="h-3 w-3 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{estudiante.nombreCompleto}</span>
                                      {estudiante.nivelAcademico && (
                                        <span className="text-xs text-muted-foreground">
                                          {estudiante.nivelAcademico.grado?.nombre} - {estudiante.nivelAcademico.seccion}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Evaluación</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="evaluacionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4 text-purple-600" />
                          Evaluación
                          <span className="text-red-500">*</span>
                          {evaluaciones.length > 0 && (
                            <Badge variant="outline" className="ml-auto text-xs">
                              {evaluaciones.length} disponible{evaluaciones.length !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || "no_seleccionado"}
                          disabled={loading || loadingEvaluaciones || evaluaciones.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 transition-all duration-200 focus:ring-2 focus:ring-purple-500/20">
                              <SelectValue placeholder={
                                loadingEvaluaciones
                                  ? "Cargando evaluaciones..."
                                  : !form.watch("cursoId") || form.watch("cursoId") === "no_seleccionado"
                                  ? "Primero selecciona un curso"
                                  : "Seleccionar evaluación"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loadingEvaluaciones ? (
                              <SelectItem value="loading" disabled>
                                <div className="flex items-center">
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Cargando evaluaciones...
                                </div>
                              </SelectItem>
                            ) : evaluaciones.length === 0 ? (
                              <SelectItem value="no_seleccionado" disabled>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <AlertCircle className="h-4 w-4" />
                                  No hay evaluaciones disponibles
                                </div>
                              </SelectItem>
                            ) : (
                              evaluaciones.map((evaluacion) => (
                                <SelectItem key={evaluacion.id} value={evaluacion.id}>
                                  <div className="flex items-center gap-3 py-1">
                                    <div className="bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-md">
                                      <FileText className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{evaluacion.nombre}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {evaluacion.periodo?.nombre || 'Sin período'}
                                      </span>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Sección 3: Calificación */}
              <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                    <Star className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Calificación</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="valor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <Star className="h-4 w-4 text-orange-600" />
                          Calificación (0-20)
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              min="0"
                              max="20"
                              step="0.1"
                              {...field}
                              disabled={loading}
                              className="h-12 text-lg font-semibold pr-24 transition-all duration-200 focus:ring-2 focus:ring-orange-500/20"
                              placeholder="0.0"
                            />
                            {field.value && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Badge className={`${getEstadoNota(parseFloat(field.value)).color} text-white font-medium`}>
                                  {getEstadoNota(parseFloat(field.value)).label}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                        
                        {/* Escala de calificación */}
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Escala de calificación:</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span>18-20: Excelente</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span>14-17: Muy bueno</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                              <span>11-13: Aprobado</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span>0-10: Desaprobado</span>
                            </div>
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comentario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-600" />
                          Comentario (opcional)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ingrese un comentario sobre el desempeño del estudiante..."
                            className="resize-none h-24 transition-all duration-200 focus:ring-2 focus:ring-gray-500/20"
                            {...field}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                    className="h-11 px-6 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => resetForm()}
                  disabled={loading}
                  className="h-11 px-6 transition-all duration-200"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Limpiar Formulario
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="h-11 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {notaId ? "Actualizando..." : "Guardando..."}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {notaId ? "Actualizar Calificación" : "Guardar Calificación"}
                    </>
                  )}
                </Button
}
