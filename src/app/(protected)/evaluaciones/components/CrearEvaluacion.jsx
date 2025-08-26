"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/utils/utils";
import { crearEvaluacion, actualizarEvaluacion } from "@/action/evaluaciones/evaluacion";
import { toast } from "sonner";

// Esquema de validación para el formulario
const formSchema = z.object({
  nombre: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  descripcion: z.string().optional(),
  tipo: z.enum(["DIAGNOSTICA", "FORMATIVA", "SUMATIVA", "RECUPERACION", "EXAMEN_FINAL", "TRABAJO_PRACTICO", "PROYECTO", "EXPOSICION"], {
    message: "Tipo de evaluación no válido"
  }),
  fecha: z.date({
    required_error: "La fecha es requerida",
  }),
  fechaLimite: z.date().optional(),
  peso: z.coerce.number().min(0).max(100, { message: "El peso debe estar entre 0 y 100" }),
  notaMinima: z.coerce.number().min(0).max(20, { message: "La nota mínima debe estar entre 0 y 20" }).optional(),
  escalaCalificacion: z.enum(["VIGESIMAL", "LITERAL", "DESCRIPTIVA"], {
    message: "Escala de calificación no válida"
  }),
  cursoId: z.string().min(1, { message: "Debe seleccionar un curso" }),
  periodoId: z.string().min(1, { message: "Debe seleccionar un periodo académico" }),
  activa: z.boolean().default(true),
  recuperable: z.boolean().default(false)
});

const tiposEvaluacion = [
  { value: "DIAGNOSTICA", label: "Diagnóstica" },
  { value: "FORMATIVA", label: "Formativa" },
  { value: "SUMATIVA", label: "Sumativa" },
  { value: "RECUPERACION", label: "Recuperación" },
  { value: "EXAMEN_FINAL", label: "Examen Final" },
  { value: "TRABAJO_PRACTICO", label: "Trabajo Práctico" },
  { value: "PROYECTO", label: "Proyecto" },
  { value: "EXPOSICION", label: "Exposición" }
];

const escalasCalificacion = [
  { value: "VIGESIMAL", label: "Vigesimal (0-20)" },
  { value: "LITERAL", label: "Literal (AD, A, B, C)" },
  { value: "DESCRIPTIVA", label: "Descriptiva (Logro destacado, esperado, etc.)" }
];

export default function CrearEvaluacion({ user, cursos, periodos, evaluacion, onCreated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFechaLimite, setShowFechaLimite] = useState(!!evaluacion?.fechaLimite);
  const [showNotaMinima, setShowNotaMinima] = useState(!!evaluacion?.notaMinima);

  const isEditing = !!evaluacion;

  // Configurar formulario con valores por defecto
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: evaluacion?.nombre || "",
      descripcion: evaluacion?.descripcion || "",
      tipo: evaluacion?.tipo || "SUMATIVA",
      fecha: evaluacion?.fecha ? new Date(evaluacion.fecha) : new Date(),
      fechaLimite: evaluacion?.fechaLimite ? new Date(evaluacion.fechaLimite) : undefined,
      peso: evaluacion?.peso || 10,
      notaMinima: evaluacion?.notaMinima || 11,
      escalaCalificacion: evaluacion?.escalaCalificacion || "VIGESIMAL",
      cursoId: evaluacion?.cursoId || "",
      periodoId: evaluacion?.periodoId || "",
      activa: evaluacion?.activa ?? true,
      recuperable: evaluacion?.recuperable ?? false
    }
  });

  const handleSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Si no se muestra la fecha límite, eliminarla del objeto
      if (!showFechaLimite) {
        data.fechaLimite = undefined;
      }

      // Si no se muestra la nota mínima, eliminarla del objeto
      if (!showNotaMinima) {
        data.notaMinima = undefined;
      }

      // Convertir fechas a strings para enviar al servidor
      const dataToSubmit = {
        ...data,
        fecha: format(data.fecha, "yyyy-MM-dd"),
        fechaLimite: data.fechaLimite ? format(data.fechaLimite, "yyyy-MM-dd") : undefined
      };

      let result;

      if (isEditing) {
        result = await actualizarEvaluacion(evaluacion.id, dataToSubmit);
      } else {
        result = await crearEvaluacion(dataToSubmit);
      }

      if (result.error) {
        toast.error(result.error);

        // Si hay errores de campo, mostrarlos en el formulario
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, errors]) => {
            form.setError(field, {
              type: "manual",
              message: errors[0]
            });
          });
        }
      } else {
        toast.success(result.success);
        form.reset();

        // Notificar al componente padre
        if (onCreated) {
          onCreated(result.evaluacion);
        }
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      toast.error("Error al procesar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="bg-green-50">
          <CardTitle className="text-xl text-green-800">
            {isEditing ? "Editar Evaluación" : "Crear Nueva Evaluación"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre de la evaluación */}
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la evaluación *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Examen Parcial 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tipo de evaluación */}
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de evaluación *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tiposEvaluacion.map((tipo) => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Curso */}
                <FormField
                  control={form.control}
                  name="cursoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Curso *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isEditing} // No permitir cambiar el curso al editar
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

                {/* Periodo académico */}
                <FormField
                  control={form.control}
                  name="periodoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Periodo académico *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un periodo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(periodos) ? periodos.map((periodo) => (
                            <SelectItem key={periodo.id} value={periodo.id}>
                              {periodo.nombre}
                            </SelectItem>
                          )) : <SelectItem value="">No hay periodos disponibles</SelectItem>}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fecha de evaluación */}
                <FormField
                  control={form.control}
                  name="fecha"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de evaluación *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Seleccione una fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                            locale={es}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fecha límite (opcional) */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showFechaLimite"
                      checked={showFechaLimite}
                      onCheckedChange={setShowFechaLimite}
                    />
                    <label htmlFor="showFechaLimite" className="text-sm font-medium">
                      Incluir fecha límite de entrega
                    </label>
                  </div>

                  {showFechaLimite && (
                    <FormField
                      control={form.control}
                      name="fechaLimite"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Fecha límite</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: es })
                                  ) : (
                                    <span>Seleccione una fecha límite</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date("1900-01-01")}
                                initialFocus
                                locale={es}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Escala de calificación */}
                <FormField
                  control={form.control}
                  name="escalaCalificacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Escala de calificación *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isEditing && form.getValues("notas")?.length > 0} // No permitir cambiar si ya hay notas
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una escala" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {escalasCalificacion.map((escala) => (
                            <SelectItem key={escala.value} value={escala.value}>
                              {escala.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Peso de la evaluación */}
                <FormField
                  control={form.control}
                  name="peso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso en la calificación final (%) *</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="100" {...field} />
                      </FormControl>
                      <FormDescription>
                        Porcentaje que representa esta evaluación en la nota final
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Nota mínima (opcional) */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showNotaMinima"
                      checked={showNotaMinima}
                      onCheckedChange={setShowNotaMinima}
                    />
                    <label htmlFor="showNotaMinima" className="text-sm font-medium">
                      Establecer nota mínima aprobatoria
                    </label>
                  </div>

                  {showNotaMinima && (
                    <FormField
                      control={form.control}
                      name="notaMinima"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nota mínima aprobatoria</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="20" step="0.5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              {/* Descripción */}
              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describa los detalles de la evaluación..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Opciones adicionales */}
              <div className="flex flex-col sm:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="activa"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Evaluación activa</FormLabel>
                        <FormDescription>
                          Desmarque para ocultar esta evaluación temporalmente
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recuperable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Evaluación recuperable</FormLabel>
                        <FormDescription>
                          Permite a los estudiantes recuperar esta evaluación
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-1">
                      <span className="animate-spin">⏳</span> Guardando...
                    </span>
                  ) : isEditing ? (
                    "Actualizar Evaluación"
                  ) : (
                    "Crear Evaluación"
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
