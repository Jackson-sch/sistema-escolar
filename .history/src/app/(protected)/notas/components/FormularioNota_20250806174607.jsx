"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Save, X, BookOpen, Users, ClipboardList, Star, AlertCircle, CheckCircle2, Award, TrendingUp } from 'lucide-react';
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
import { Separator } from "@/components/ui/separator";
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
    mode: "onChange",
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
          const { getNotaPorId } = await import('@/action/notas/nota');
          const notaData = await getNotaPorId(notaId);
          if (!notaData) {
            toast.error("No se encontró la nota solicitada");
            return;
          }

          setNotaActual(notaData);
          const { getEstudiantesPorCurso, getEvaluacionesPorCurso } = await import('@/action/notas/nota');
          const [estudiantesData, evaluacionesData] = await Promise.all([
            getEstudiantesPorCurso(notaData.cursoId),
            getEvaluacionesPorCurso(notaData.cursoId)
          ]);

          setEstudiantes(estudiantesData || []);
          setEvaluaciones(evaluacionesData || []);

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

  const handleCursoChange = async (cursoId, isEditing = false) => {
    if (!cursoId || cursoId === "no_seleccionado") {
      setEstudiantes([]);
      setEvaluaciones([]);
      return;
    }

    if (!isEditing) {
      form.setValue("estudianteId", "no_seleccionado");
      form.setValue("evaluacionId", "no_seleccionado");
    }

    try {
      setLoadingEstudiantes(true);
      setLoadingEvaluaciones(true);
      const [estudiantesData, evaluacionesData] = await Promise.all([
        getEstudiantesPorCurso(cursoId),
        getEvaluacionesPorCurso(cursoId)
      ]);

      if (estudiantesData) {
        setEstudiantes(estudiantesData);
      }
      if (evaluacionesData) {
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

  const resetForm = () => {
    const defaultValues = {
      estudianteId: "no_seleccionado",
      cursoId: "no_seleccionado",
      evaluacionId: "no_seleccionado",
      valor: "",
      comentario: ""
    };

    form.reset(defaultValues);
    form.clearErrors();

    if (!notaId) {
      setEstudiantes([]);
      setEvaluaciones([]);
    }

    setTimeout(() => {
      document.querySelectorAll('.form-message').forEach(el => {
        el.innerHTML = '';
      });
      document.querySelectorAll('[data-state="error"]').forEach(el => {
        el.removeAttribute('data-state');
      });
    }, 100);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      if (!data.estudianteId || data.estudianteId === "no_seleccionado" ||
        !data.cursoId || data.cursoId === "no_seleccionado" ||
        !data.evaluacionId || data.evaluacionId === "no_seleccionado") {
        toast.error("Todos los campos son obligatorios");
        setLoading(false);
        return;
      }

      if (isNaN(Number(data.valor))) {
        toast.error("La calificación debe ser un número válido");
        setLoading(false);
        return;
      }

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

      const { registrarNota, actualizarNota } = await import('@/action/notas/nota');
      let resultado;
      if (notaId) {
        resultado = await actualizarNota({
          ...formData,
          id: notaId,
        });
      } else {
        resultado = await registrarNota(formData);
      }

      if (resultado?.error) {
        toast.error(resultado.error);
        setLoading(false);
        return;
      }

      toast.success(notaId ? "Nota actualizada correctamente" : "Nota registrada correctamente");
      resetForm();
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
    const num = parseFloat(valor);
    if (num >= 18) return { 
      label: "Excelente", 
      color: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
      icon: Award,
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20"
    };
    if (num >= 14) return { 
      label: "Muy bueno", 
      color: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
      icon: TrendingUp,
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/20"
    };
    if (num >= 11) return { 
      label: "Aprobado", 
      color: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white",
      icon: CheckCircle2,
      bgColor: "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/20"
    };
    return { 
      label: "Desaprobado", 
      color: "bg-gradient-to-r from-red-500 to-rose-500 text-white",
      icon: AlertCircle,
      bgColor: "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/20"
    };
  };

  const currentValue = form.watch("valor");
  const estadoNota = currentValue ? getEstadoNota(currentValue) : null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                {notaId ? "Editar Calificación" : "Registrar Nueva Calificación"}
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {notaId ? "Modifica los datos de la calificación existente" : "Ingresa los datos para una nueva calificación"}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Sección de Curso */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Información del Curso</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="cursoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Curso</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleCursoChange(value);
                        }}
                        value={field.value || "no_seleccionado"}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 bg-gradient-to-r from-background to-muted/30 border-border/60 hover:border-border transition-all duration-200">
                            <SelectValue placeholder="Seleccionar curso" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cursos.map((curso) => (
                            <SelectItem key={curso.id} value={curso.id}>
                              <div className="flex flex-col py-1">
                                <span className="font-medium">
                                  {curso.areaCurricular?.nombre || curso.nombre}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {curso.nivelAcademico?.nivel?.nombre} - {curso.nivelAcademico?.grado?.nombre} "{curso.nivelAcademico?.seccion}"
                                </span>
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
                  <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 border border-blue-200/40 dark:border-blue-800/30">
                    {(() => {
                      const cursoSeleccionado = cursos.find(c => c.id === form.watch("cursoId"));
                      if (!cursoSeleccionado) return null;
                      return (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                              <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-blue-900 dark:text-blue-100">
                                {cursoSeleccionado.areaCurricular?.nombre || cursoSeleccionado.nombre}
                              </p>
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                {cursoSeleccionado.nivelAcademico?.nivel?.nombre} - {' '}
                                {cursoSeleccionado.nivelAcademico?.grado?.nombre} "{cursoSeleccionado.nivelAcademico?.seccion}"
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                            {estudiantes.length} estudiante{estudiantes.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              <Separator />

              {/* Sección de Estudiante y Evaluación */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Estudiante</h3>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="estudianteId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          Seleccionar Estudiante
                          {estudiantes.length > 0 && (
                            <span className="text-sm text-muted-foreground ml-2">
                              ({estudiantes.length} disponible{estudiantes.length !== 1 ? 's' : ''})
                            </span>
                          )}
                        </FormLabel>
                        <Select
                          disabled={loadingEstudiantes || !form.watch("cursoId")}
                          onValueChange={field.onChange}
                          value={field.value || "no_seleccionado"}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 bg-gradient-to-r from-background to-muted/30 border-border/60 hover:border-border transition-all duration-200">
                              <SelectValue placeholder={
                                loadingEstudiantes
                                  ? "Cargando estudiantes..."
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
                                No hay estudiantes matriculados en este curso
                              </SelectItem>
                            ) : (
                              estudiantes.map((estudiante) => (
                                <SelectItem key={estudiante.id} value={estudiante.id}>
                                  <div className="flex flex-col py-1">
                                    <span className="font-medium">{estudiante.nombreCompleto}</span>
                                    {estudiante.nivelAcademico && (
                                      <span className="text-sm text-muted-foreground">
                                        {estudiante.nivelAcademico.grado?.nombre} - {estudiante.nivelAcademico.seccion}
                                      </span>
                                    )}
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

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Evaluación</h3>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="evaluacionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Tipo de Evaluación</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || "no_seleccionado"}
                          disabled={loading || loadingEvaluaciones || evaluaciones.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 bg-gradient-to-r from-background to-muted/30 border-border/60 hover:border-border transition-all duration-200">
                              <SelectValue placeholder="Seleccionar evaluación" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {evaluaciones.length === 0 ? (
                              <SelectItem value="no_seleccionado" disabled>
                                No hay evaluaciones disponibles
                              </SelectItem>
                            ) : (
                              evaluaciones.map((evaluacion) => (
                                <SelectItem key={evaluacion.id} value={evaluacion.id}>
                                  <div className="flex flex-col py-1">
                                    <span className="font-medium">{evaluacion.nombre}</span>
                                    <span className="text-sm text-muted-foreground">
                                      {evaluacion.periodo?.nombre || 'Sin período'}
                                    </span>
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

              <Separator />

              {/* Sección de Calificación */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Calificación</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="valor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Nota (0-20)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              min="0"
                              max="20"
                              step="0.1"
                              {...field}
                              disabled={loading}
                              className="h-12 text-lg font-semibold bg-gradient-to-r from-background to-muted/30 border-border/60 hover:border-border transition-all duration-200 pr-20"
                              placeholder="0.0"
                            />
                            {estadoNota && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <Badge className={`${estadoNota.color} shadow-sm`}>
                                  <estadoNota.icon className="h-3 w-3 mr-1" />
                                  {estadoNota.label}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                        
                        {/* Indicador visual del rendimiento */}
                        {currentValue && (
                          <div className={`mt-2 p-3 rounded-lg ${estadoNota?.bgColor} border border-border/30`}>
                            <div className="flex items-center gap-2">
                              <estadoNota.icon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                Rendimiento: {estadoNota.label}
                              </span>
                            </div>
                          </div>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comentario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Comentario (opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ingrese observaciones sobre el desempeño del estudiante..."
                            className="resize-none h-24 bg-gradient-to-r from-background to-muted/30 border-border/60 hover:border-border transition-all duration-200"
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

              <Separator />

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                    className="h-11 px-6 bg-gradient-to-r from-background to-muted/30 hover:from-muted/50 hover:to-muted/40 transition-all duration-200"
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
                  className="h-11 px-6 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/80 hover:to-secondary/60 transition-all duration-200"
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpiar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="h-11 px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {notaId ? "Actualizando..." : "Guardando..."}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {notaId ? "Actualizar Nota" : "Guardar Nota"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
