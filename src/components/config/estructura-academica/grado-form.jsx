"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createGrado, updateGrado } from "@/action/config/niveles-grados-action";

// Esquema de validación para el formulario de grado
const gradoSchema = z.object({
  nombre: z.string()
    .min(1, "El nombre es obligatorio")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  codigo: z.string()
    .min(1, "El código es obligatorio")
    .max(20, "El código no puede tener más de 20 caracteres"),
  descripcion: z.string().max(500, "La descripción no puede tener más de 500 caracteres").optional(),
  orden: z.coerce.number()
    .int("El orden debe ser un número entero")
    .min(1, "El orden debe ser mayor a 0")
    .default(1),
});

export function GradoForm({ nivel, grado, open, onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!grado;

  // Configurar el formulario con React Hook Form
  const form = useForm({
    resolver: zodResolver(gradoSchema),
    defaultValues: {
      nombre: grado?.nombre || "",
      codigo: grado?.codigo || "",
      descripcion: grado?.descripcion || "",
      orden: grado?.orden || 1,
    },
  });

  // Manejar el envío del formulario
  const onSubmit = async (data) => {
    if (!nivel?.id) {
      toast.error("No se ha seleccionado un nivel");
      return;
    }

    setIsSubmitting(true);
    try {
      // Añadir el ID del nivel a los datos
      const gradoData = {
        ...data,
        nivelId: nivel.id,
      };

      let result;
      if (isEditing) {
        result = await updateGrado(grado.id, gradoData);
      } else {
        result = await createGrado(gradoData);
      }

      if (result.success) {
        toast.success(isEditing ? "Grado actualizado correctamente" : "Grado creado correctamente");
        if (onSuccess) onSuccess(result.data);
      } else {
        toast.error(result.error || "Error al guardar el grado");
      }
    } catch (error) {
      console.error("Error al guardar grado:", error);
      toast.error("Error al guardar el grado");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Grado" : "Nuevo Grado"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? `Modifica los datos del grado seleccionado del nivel "${nivel?.nombre}"` 
              : `Completa los datos para crear un nuevo grado en el nivel "${nivel?.nombre}"`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Grado</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Primero, Segundo, etc." {...field} />
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
                    <Input placeholder="Ej: 1°, 2°, I, II, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orden"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orden</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1"
                      placeholder="Orden de visualización" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Breve descripción del grado" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    {isEditing ? "Actualizando..." : "Guardando..."}
                  </>
                ) : (
                  isEditing ? "Actualizar Grado" : "Crear Grado"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
