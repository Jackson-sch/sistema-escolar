"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "@/components/ui/button";
import { nivelAcademicoSchema } from "@/lib/validaciones/schemas/nivelAcademico.schema";
import {
  createNivelAcademico,
  updateNivelAcademico,
} from "@/action/niveles/nivelAcademico";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { gradosPorNivel, niveles } from "@/lib/gradosPorNivel";
import AlertError from "@/components/reutilizables/Alerts";

export default function NivelAcademicoForm({ nivelAcademicoData, onSuccess }) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(nivelAcademicoSchema),
    defaultValues: nivelAcademicoData || {
      nivel: "",
      grado: "",
      seccion: "",
    },
  });

  const nivelSeleccionado = form.watch("nivel");

  async function onSubmit(data) {
    setIsLoading(true);
    setError("");
    try {
      const response = nivelAcademicoData
        ? await updateNivelAcademico({
          id: nivelAcademicoData.id,
          ...data,
        })
        : await createNivelAcademico({
          ...data,
        });

      if (response.success) {
        toast({
          title: nivelAcademicoData
            ? "¡Actualización exitosa!"
            : "¡Registro exitoso!",
          description: nivelAcademicoData
            ? "El nivel académico ha sido actualizado correctamente"
            : "El nivel académico ha sido creado correctamente",
        });
        form.reset();
        router.refresh();
        onSuccess();
      } else {
        throw new Error(
          response.error || "Hubo un error al procesar la solicitud"
        );
      }
    } catch (error) {
      console.error("Error in onSubmit:", error); // Log any errors
      setError(
        error.message ||
        "Hubo un error interno del servidor. Por favor, inténtelo nuevamente."
      );
      toast({
        title: "¡Error!",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && <AlertError error={error} />}

        {nivelAcademicoData && (
          <input
            type="hidden"
            {...form.register("id")}
            value={nivelAcademicoData.id}
          />
        )}

        <FormField
          control={form.control}
          name="nivel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nivel Académico</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un nivel" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {niveles.map((nivel) => (
                    <SelectItem key={nivel} value={nivel}>
                      {nivel.charAt(0).toUpperCase() +
                        nivel.slice(1).toLowerCase()}
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
          name="grado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grado</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un grado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {gradosPorNivel[nivelSeleccionado]?.map((grado) => (
                    <SelectItem key={grado.value} value={grado.value}>
                      {grado.label}
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
          name="seccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sección</FormLabel>
              <FormControl>
                <Input placeholder="Ej: A, B, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onSuccess} type="button">
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
