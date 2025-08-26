"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Save, X, BookOpen, Users, ClipboardList, Star, GraduationCap } from 'lucide-react';
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
    if (num >= 18) return { label: "Excelente", color: "bg-green-500 text-white" };
    if (num >= 14) return { label: "Muy bueno", color: "bg-blue-500 text-white" };
    if (num >= 11) return { label: "Aprobado", color: "bg-yellow-500 text-white" };
    return { label: "Desaprobado", color: "bg-red-500 text-white" };
  };

  const currentValue = form.watch("valor");
  const estadoNota = currentValue ? getEstadoNota(currentValue) : null;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-lg">
              {notaId ? "Editar Calificación" : "Registrar Nueva Calificación"}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {notaId ? "Modifica los datos de la calificación" : "Ingresa los datos para una nueva calificación"}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Información del Curso */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Información del Curso</h3>
              </div>
              
              <FormField
                control={form.control}
                name="cursoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Curso</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleCursoChange(value);
                      }}
                      value={field.value || "no_seleccionado"}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Seleccionar curso" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cursos.map((curso) => (
                          <SelectItem key={curso.id} value={curso.id}>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {curso.areaCurricular?.nombre || curso.nombre}
                              </span>
                              <span className="text-xs text-muted-foreground">
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
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                  {(() => {
                    const cursoSeleccionado = cursos.find(c => c.id === form.watch("cursoId"));
                    if (!cursoSeleccionado) return null;
                    return (
                      <>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-sm font-medium">
                              {cursoSeleccionado.areaCurricular?.nombre || cursoSeleccionado.nombre}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {cursoSeleccionado.nivelAcademico?.nivel?.nombre} - {' '}
                              {cursoSeleccionado.nivelAcademico?.grado?.nombre} "{cursoSeleccionado.nivelAcademico?.seccion}"
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {estudiantes.length} estudiante{estudiantes.length !== 1 ? 's' : ''}
                        </Badge>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Estudiante y Evaluación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Estudiante</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="estudianteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">
                        Seleccionar Estudiante
                        {estudiantes.length > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">
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
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder={
                              loadingEstudiantes
                                ? "Cargando..."
                                : "Seleccionar estudiante"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingEstudiantes ? (
                            <SelectItem value="loading" disabled>
                              <div className="flex items-center">
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                <span className="text-xs">Cargando estudiantes...</span>
                              </div>
                            </SelectItem>
                          ) : estudiantes.length === 0 ? (
                            <SelectItem value="no_seleccionado" disabled>
                              <span className="text-xs">No hay estudiantes matriculados</span>
                            </SelectItem>
                          ) : (
                            estudiantes.map((estudiante) => (
                              <SelectItem key={estudiante.id} value={estudiante.id}>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{estudiante.nombreCompleto}</span>
                                  {estudiante.nivelAcademico && (
                                    <span className="text-xs text-muted-foreground">
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

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Evaluación</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="evaluacionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Tipo de Evaluación</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || "no_seleccionado"}
                        disabled={loading || loadingEvaluaciones || evaluaciones.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Seleccionar evaluación" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {evaluaciones.length === 0 ? (
                            <SelectItem value="no_seleccionado" disabled>
                              <span className="text-xs">No hay evaluaciones disponibles</span>
                            </SelectItem>
                          ) : (
                            evaluaciones.map((evaluacion) => (
                              <SelectItem key={evaluacion.id} value={evaluacion.id}>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{evaluacion.nombre}</span>
                                  <span className="text-xs text-muted-foreground">
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

            {/* Calificación */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Calificación</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="valor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Nota (0-20)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            step="0.1"
                            {...field}
                            disabled={loading}
                            className="h-9 pr-16"
                            placeholder="0.0"
                          />
                          {estadoNota && (
                            <div className="absolute right-1 top-1/2 -translate-y-1/2">
                              <Badge className={`${estadoNota.color} text-xs px-2 py-0.5`}>
                                {estadoNota.label}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comentario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Comentario (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ingrese observaciones sobre el desempeño del estudiante..."
                          className="resize-none h-9 min-h-[36px]"
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
            <div className="flex justify-end gap-2 pt-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  disabled={loading}
                >
                  <X className="mr-1 h-3 w-3" />
                  Cancelar
                </Button>
              )}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => resetForm()}
                disabled={loading}
              >
                <X className="mr-1 h-3 w-3" />
                Limpiar
              </Button>
              <Button 
                type="submit" 
                size="sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    {notaId ? "Actualizando..." : "Guardando..."}
                  </>
                ) : (
                  <>
                    <Save className="mr-1 h-3 w-3" />
                    {notaId ? "Actualizar" : "Guardar Nota"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
