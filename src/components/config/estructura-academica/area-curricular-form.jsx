"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { createAreaCurricular, updateAreaCurricular } from "@/action/config/estructura-academica-action";

// Esquema de validación
const areaCurricularSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres",
  }),
  codigo: z.string().min(2, {
    message: "El código debe tener al menos 2 caracteres",
  }).max(10, {
    message: "El código no debe exceder los 10 caracteres",
  }).toUpperCase(),
  descripcion: z.string().optional(),
  nivelId: z.string().optional(),
  orden: z.coerce.number().int().optional(),
  color: z.string().optional(),
  activa: z.boolean().default(true),
  competencias: z.string().optional(),
  institucionId: z.string({
    required_error: "La institución es requerida",
  }),
});

export function AreaCurricularForm({ institucion, areaCurricular, isEditing, onSuccess, niveles = [] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  console.log("Datos del formulaio a editar:", areaCurricular);

  // Configurar el formulario
  const form = useForm({
    resolver: zodResolver(areaCurricularSchema),
    defaultValues: {
      nombre: areaCurricular?.nombre || "",
      codigo: areaCurricular?.codigo || "",
      descripcion: areaCurricular?.descripcion || "",
      nivelId: areaCurricular?.nivelId || "",
      orden: areaCurricular?.orden || "",
      color: areaCurricular?.color || "",
      activa: areaCurricular?.activa ?? true,
      competencias: areaCurricular?.competencias || "",
      institucionId: institucion?.id || "",
    },
  });

  // Enviar el formulario
  const onSubmit = async (data) => {
    console.log("Datos del formulario AreaCurricularForm:", data);
    if (!institucion?.id) {
      toast.error("No se ha seleccionado una institución");
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      if (isEditing && areaCurricular?.id) {
        response = await updateAreaCurricular(areaCurricular.id, data);
      } else {
        response = await createAreaCurricular(data);
      }

      if (response.success) {
        toast.success(isEditing ? "Área curricular actualizada correctamente" : "Área curricular creada correctamente");
        if (onSuccess) onSuccess(response.data);
        form.reset();
      } else {
        toast.error(response.error || "Error al guardar el área curricular");
      }
    } catch (error) {
      console.error("Error al guardar área curricular:", error);
      toast.error("Error al guardar el área curricular");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lista de colores predefinidos
  const colorOptions = [
    { value: "bg-blue-500 hover:bg-blue-600", label: "Azul" },
    { value: "bg-green-500 hover:bg-green-600", label: "Verde" },
    { value: "bg-red-500 hover:bg-red-600", label: "Rojo" },
    { value: "bg-yellow-500 hover:bg-yellow-600", label: "Amarillo" },
    { value: "bg-purple-500 hover:bg-purple-600", label: "Morado" },
    { value: "bg-pink-500 hover:bg-pink-600", label: "Rosa" },
    { value: "bg-indigo-500 hover:bg-indigo-600", label: "Índigo" },
    { value: "bg-orange-500 hover:bg-orange-600", label: "Naranja" },
    { value: "bg-teal-500 hover:bg-teal-600", label: "Turquesa" },
    { value: "bg-cyan-500 hover:bg-cyan-600", label: "Cian" },
    { value: "bg-gray-500 hover:bg-gray-600", label: "Gris" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Matemática" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="MAT" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="nivelId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nivel</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un nivel" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {niveles.map((nivel) => (
                    <SelectItem key={nivel.id} value={nivel.id}>
                      {nivel.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descripción del área curricular" 
                  className="resize-none"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="orden"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orden</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un color" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full mr-2 ${color.value.split(' ')[0]}`}></div>
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="competencias"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Competencias</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Competencias del área curricular (formato JSON)" 
                  className="resize-none"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                <FormLabel>Activa</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Indica si esta área curricular está activa en el sistema
                </p>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess && onSuccess()}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
