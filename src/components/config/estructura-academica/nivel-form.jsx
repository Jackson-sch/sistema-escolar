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
import { createNivel, updateNivel } from "@/action/config/niveles-grados-action";

// Esquema de validación para el formulario de nivel
const nivelSchema = z.object({
  nombre: z.string()
    .min(1, "El nombre es obligatorio")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  descripcion: z.string().max(500, "La descripción no puede tener más de 500 caracteres").optional(),
});

export function NivelForm({ institucion, nivel, open, onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!nivel;

  // Configurar el formulario con React Hook Form
  const form = useForm({
    resolver: zodResolver(nivelSchema),
    defaultValues: {
      nombre: nivel?.nombre || "",
      descripcion: nivel?.descripcion || "",
    },
  });

  // Manejar el envío del formulario
  const onSubmit = async (data) => {
    if (!institucion?.id) {
      toast.error("No se ha seleccionado una institución");
      return;
    }

    setIsSubmitting(true);
    try {
      // Añadir el ID de la institución a los datos
      const nivelData = {
        ...data,
        institucionId: institucion.id,
      };

      let result;
      if (isEditing) {
        result = await updateNivel(nivel.id, nivelData);
      } else {
        result = await createNivel(nivelData);
      }

      if (result.success) {
        toast.success(isEditing ? "Nivel actualizado correctamente" : "Nivel creado correctamente");
        if (onSuccess) onSuccess(result.data);
      } else {
        toast.error(result.error || "Error al guardar el nivel");
      }
    } catch (error) {
      console.error("Error al guardar nivel:", error);
      toast.error("Error al guardar el nivel");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Nivel" : "Nuevo Nivel"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Modifica los datos del nivel educativo seleccionado" 
              : "Completa los datos para crear un nuevo nivel educativo"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Nivel</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Primaria, Secundaria, etc." {...field} />
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
                      placeholder="Breve descripción del nivel educativo" 
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
                  isEditing ? "Actualizar Nivel" : "Crear Nivel"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
