"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { crearPermiso, actualizarPermiso } from "@/action/config/permisos-action";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

// Definir esquema de validación con Zod
const permisoSchema = z.object({
  codigo: z.string().min(3, "El código debe tener al menos 3 caracteres"),
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  descripcion: z.string().optional(),
  modulo: z.string().min(1, "El módulo es requerido"),
  activo: z.boolean().default(true)
});

// Módulos disponibles en el sistema
const MODULOS = [
  "ESTUDIANTES",
  "PROFESORES",
  "ACADEMICO",
  "ADMINISTRATIVO",
  "REPORTES",
  "CONFIGURACION",
  "SISTEMA"
];

export function PermisoForm({ permiso = null, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configurar el formulario con React Hook Form
  const form = useForm({
    resolver: zodResolver(permisoSchema),
    defaultValues: permiso ? {
      codigo: permiso.codigo || "",
      nombre: permiso.nombre || "",
      descripcion: permiso.descripcion || "",
      modulo: permiso.modulo || "",
      activo: permiso.activo !== undefined ? permiso.activo : true
    } : {
      codigo: "",
      nombre: "",
      descripcion: "",
      modulo: "",
      activo: true
    }
  });

  // Manejar envío del formulario
  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Crear o actualizar el permiso
      const response = permiso
        ? await actualizarPermiso(permiso.id, data)
        : await crearPermiso(data);

      if (response.success) {
        toast.success(permiso ? "Permiso actualizado" : "Permiso creado", {
          description: permiso
            ? "El permiso ha sido actualizado correctamente"
            : "El permiso ha sido creado correctamente",
        });

        // Resetear el formulario si es una creación
        if (!permiso) {
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
      console.error("Error al procesar el permiso:", error);
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
          {/* Código */}
          <FormField
            control={form.control}
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input placeholder="CREAR_USUARIO" {...field} />
                </FormControl>
                <FormDescription>
                  Código único para identificar el permiso
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Módulo */}
          <FormField
            control={form.control}
            name="modulo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Módulo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un módulo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MODULOS.map((modulo) => (
                      <SelectItem key={modulo} value={modulo}>
                        {modulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Área del sistema a la que pertenece el permiso
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nombre */}
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Crear Usuario" {...field} />
                </FormControl>
                <FormDescription>
                  Nombre descriptivo del permiso
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Activo */}
          <FormField
            control={form.control}
            name="activo"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Activo</FormLabel>
                  <FormDescription>
                    Determina si el permiso está disponible para asignación
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

        {/* Descripción */}
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descripción detallada del permiso y su propósito"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {permiso ? "Actualizar permiso" : "Crear permiso"}
        </Button>
      </form>
    </Form>
  );
}
