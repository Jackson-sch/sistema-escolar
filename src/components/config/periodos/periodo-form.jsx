"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { crearPeriodo, actualizarPeriodo } from "@/action/config/periodo-action";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/utils/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";

// Definir esquema de validación con Zod
const periodoSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  tipo: z.enum(["BIMESTRE", "TRIMESTRE", "SEMESTRE", "ANUAL"]),
  numero: z.coerce.number().int().min(1, "El número debe ser mayor a 0"),
  fechaInicio: z.date({ required_error: "La fecha de inicio es requerida" }),
  fechaFin: z.date({ required_error: "La fecha de fin es requerida" }),
  anioEscolar: z.coerce.number().int().min(2000, "Año inválido").max(2100, "Año inválido"),
  activo: z.boolean().default(true)
}).refine(data => data.fechaInicio < data.fechaFin, {
  message: "La fecha de inicio debe ser anterior a la fecha de fin",
  path: ["fechaFin"]
});

export function PeriodoForm({ periodo = null, institucion, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configurar el formulario con React Hook Form
  const form = useForm({
    resolver: zodResolver(periodoSchema),
    defaultValues: periodo ? {
      nombre: periodo.nombre,
      tipo: periodo.tipo,
      numero: periodo.numero,
      fechaInicio: new Date(periodo.fechaInicio),
      fechaFin: new Date(periodo.fechaFin),
      anioEscolar: periodo.anioEscolar,
      activo: periodo.activo
    } : {
      nombre: "",
      tipo: "BIMESTRE",
      numero: 1,
      fechaInicio: new Date(),
      fechaFin: new Date(new Date().setMonth(new Date().getMonth() + 2)),
      anioEscolar: new Date().getFullYear(),
      activo: true
    }
  });

  // Manejar envío del formulario
  const onSubmit = async (data) => {
    console.log("Datos desde el formulario", data)
    if (!institucion?.id) {
      toast.error("Error", {
        description: "No se ha seleccionado una institución",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Agregar el ID de la institución a los datos
      const periodoData = {
        ...data,
        institucionId: institucion.id
      };

      // Crear o actualizar el período
      const response = periodo
        ? await actualizarPeriodo(periodo.id, periodoData)
        : await crearPeriodo(periodoData);

      if (response.success) {
        toast.success(periodo ? "Período actualizado" : "Período creado", {
          description: periodo
            ? "El período académico ha sido actualizado correctamente"
            : "El período académico ha sido creado correctamente",
        });

        // Resetear el formulario si es una creación
        if (!periodo) {
          form.reset();
        }

        // Llamar al callback de éxito si existe
        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        toast.error("Error", {
          description: response.error || "Ha ocurrido un error",
        });
      }
    } catch (error) {
      console.error("Error al procesar el período:", error);
      toast.error("Error", {
        description: "Ha ocurrido un error inesperado",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre del período */}
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del período</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: I Bimestre 2025" {...field} />
                </FormControl>
                <FormDescription>
                  Nombre descriptivo del período académico
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tipo de período */}
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de período</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="BIMESTRE">Bimestre</SelectItem>
                    <SelectItem value="TRIMESTRE">Trimestre</SelectItem>
                    <SelectItem value="SEMESTRE">Semestre</SelectItem>
                    <SelectItem value="ANUAL">Anual</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Tipo de división del año escolar
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Número de período */}
          <FormField
            control={form.control}
            name="numero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormDescription>
                  Número secuencial del período (1, 2, 3, etc.)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Año escolar */}
          <FormField
            control={form.control}
            name="anioEscolar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Año escolar</FormLabel>
                <FormControl>
                  <Input type="number" min="2000" max="2100" {...field} />
                </FormControl>
                <FormDescription>
                  Año al que pertenece este período
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fecha de inicio */}
          <FormField
            control={form.control}
            name="fechaInicio"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de inicio</FormLabel>
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
                          <span>Selecciona una fecha</span>
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
                      disabled={(date) =>
                        date < new Date("2000-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Fecha en que inicia el período académico
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fecha de fin */}
          <FormField
            control={form.control}
            name="fechaFin"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de fin</FormLabel>
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
                          <span>Selecciona una fecha</span>
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
                      disabled={(date) =>
                        date < new Date("2000-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Fecha en que finaliza el período académico
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Estado activo */}
          <FormField
            control={form.control}
            name="activo"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Estado activo</FormLabel>
                  <FormDescription>
                    Determina si este período está actualmente en curso
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {periodo ? "Actualizar período" : "Crear período"}
        </Button>
      </form>
    </Form>
  );
}
