"use client";

import { useState, useEffect } from "react";
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
import { createNivelAcademico, updateNivelAcademico } from "@/action/config/estructura-academica-action";
import { getNiveles, getGrados } from "@/action/config/niveles-grados-action";

// Esquema de validación
const nivelAcademicoSchema = z.object({
  seccion: z.string().optional(),
  turno: z.enum(["MANANA", "TARDE", "NOCHE", "CONTINUO"], {
    required_error: "El turno es requerido",
  }),
  capacidadMaxima: z.coerce.number().int().positive().optional(),
  aulaAsignada: z.string().optional(),
  descripcion: z.string().optional(),
  anioAcademico: z.coerce.number().int().positive({
    message: "El año académico debe ser un número positivo",
  }),
  activo: z.boolean().default(true),
  institucionId: z.string({
    required_error: "La institución es requerida",
  }),
  nivelId: z.string({
    required_error: "El nivel es requerido",
  }),
  gradoId: z.string({
    required_error: "El grado es requerido",
  }),
});

export function NivelAcademicoForm({ institucion, nivelAcademico, isEditing, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [niveles, setNiveles] = useState([]);
  const [grados, setGrados] = useState([]);
  const [loadingNiveles, setLoadingNiveles] = useState(false);
  const [loadingGrados, setLoadingGrados] = useState(false);

  console.log("niveles desde el formulario nivel academico", niveles);
  console.log("grados desde el formulario nivel academico", grados);
  console.log("nivelAcademico recibido:", nivelAcademico);

  // Configurar el formulario
  const form = useForm({
    resolver: zodResolver(nivelAcademicoSchema),
    defaultValues: {
      seccion: nivelAcademico?.seccion || "",
      turno: nivelAcademico?.turno || "MANANA",
      capacidadMaxima: nivelAcademico?.capacidadMaxima || "",
      aulaAsignada: nivelAcademico?.aulaAsignada || "",
      descripcion: nivelAcademico?.descripcion || "",
      anioAcademico: nivelAcademico?.anioAcademico || new Date().getFullYear(),
      activo: nivelAcademico?.activo ?? true,
      institucionId: institucion?.id || "",
      nivelId: nivelAcademico?.nivelObj?.id || nivelAcademico?.nivelId || "",
      gradoId: nivelAcademico?.gradoObj?.id || nivelAcademico?.gradoId || "",
    },
  });

  // Cargar niveles cuando cambia la institución
  useEffect(() => {
    if (institucion?.id) {
      const fetchNiveles = async () => {
        setLoadingNiveles(true);
        try {
          const response = await getNiveles(institucion.id);
          if (response.success) {
            setNiveles(response.data || []);
            console.log("Niveles cargados:", response.data);
          } else {
            console.error("Error al cargar niveles:", response.error);
            toast.error("Error al cargar los niveles");
            setNiveles([]);
          }
        } catch (error) {
          console.error("Error al cargar niveles:", error);
          toast.error("Error al cargar los niveles");
          setNiveles([]);
        } finally {
          setLoadingNiveles(false);
        }
      };
      fetchNiveles();
    }
  }, [institucion?.id]);

  // Observar cambios en nivelId para cargar grados
  const nivelId = form.watch("nivelId");

  useEffect(() => {
    console.log("nivelId cambió:", nivelId);
    
    if (nivelId) {
      const fetchGrados = async () => {
        setLoadingGrados(true);
        try {
          console.log("Cargando grados para nivelId:", nivelId);
          const response = await getGrados(nivelId);
          console.log("Respuesta de getGrados:", response);
          
          if (response.success) {
            setGrados(response.data || []);
            console.log("Grados cargados:", response.data);
          } else {
            console.error("Error al cargar grados:", response.error);
            toast.error("Error al cargar los grados");
            setGrados([]);
          }
        } catch (error) {
          console.error("Error al cargar grados:", error);
          toast.error("Error al cargar los grados");
          setGrados([]);
        } finally {
          setLoadingGrados(false);
        }
      };
      fetchGrados();
    } else {
      console.log("No hay nivelId, limpiando grados");
      setGrados([]);
      // Limpiar el grado seleccionado si no hay nivel
      form.setValue("gradoId", "");
    }
  }, [nivelId, form]);

  // Limpiar grado cuando cambia el nivel
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "nivelId") {
        // Solo limpiar el grado si el nivel cambió y no estamos en modo edición inicial
        if (!isEditing || form.formState.isDirty) {
          form.setValue("gradoId", "");
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, isEditing]);

  // Enviar el formulario
  const onSubmit = async (data) => {
    console.log("Datos del formulario:", data);
    
    if (!institucion?.id) {
      toast.error("No se ha seleccionado una institución");
      return;
    }

    // Validar que se haya seleccionado nivel y grado
    if (!data.nivelId) {
      toast.error("Debe seleccionar un nivel");
      return;
    }

    if (!data.gradoId) {
      toast.error("Debe seleccionar un grado");
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      if (isEditing && nivelAcademico?.id) {
        console.log("Actualizando nivel académico:", nivelAcademico.id, data);
        response = await updateNivelAcademico(nivelAcademico.id, data);
      } else {
        console.log("Creando nuevo nivel académico:", data);
        response = await createNivelAcademico(data);
      }

      console.log("Respuesta del servidor:", response);

      if (response.success) {
        toast.success(
          isEditing 
            ? "Nivel académico actualizado correctamente" 
            : "Nivel académico creado correctamente"
        );
        if (onSuccess) onSuccess(response.data);
        if (!isEditing) form.reset(); // Solo limpiar si no es edición
      } else {
        toast.error(response.error || "Error al guardar el nivel académico");
      }
    } catch (error) {
      console.error("Error al guardar nivel académico:", error);
      toast.error("Error al guardar el nivel académico");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para resetear el formulario
  const handleReset = () => {
    form.reset();
    setGrados([]);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        
        <div className="grid grid-cols-2 gap-4">
          {/* Campo Nivel */}
          <FormField
            control={form.control}
            name="nivelId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nivel *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={loadingNiveles}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue 
                        placeholder={
                          loadingNiveles 
                            ? "Cargando niveles..." 
                            : "Seleccione un nivel"
                        } 
                      />
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

          {/* Campo Grado */}
          <FormField
            control={form.control}
            name="gradoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grado *</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                  disabled={loadingGrados || !nivelId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue 
                        placeholder={
                          !nivelId 
                            ? "Primero seleccione un nivel"
                            : loadingGrados 
                            ? "Cargando grados..." 
                            : "Seleccione un grado"
                        } 
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {grados.map((grado) => (
                      <SelectItem key={grado.id} value={grado.id}>
                        {grado.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="seccion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sección</FormLabel>
                <FormControl>
                  <Input placeholder="A, B, C, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="turno"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Turno *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un turno" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MANANA">Mañana</SelectItem>
                    <SelectItem value="TARDE">Tarde</SelectItem>
                    <SelectItem value="NOCHE">Noche</SelectItem>
                    <SelectItem value="CONTINUO">Continuo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="capacidadMaxima"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacidad Máxima</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="30" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="aulaAsignada"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aula Asignada</FormLabel>
                <FormControl>
                  <Input placeholder="A-101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="anioAcademico"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Año Académico *</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
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
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Input placeholder="Descripción opcional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="activo"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Activo</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Indica si este nivel académico está activo en el sistema
                </p>
              </div>
            </FormItem>
          )}
        />

        {/* Botones de acción */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (isEditing) {
                onSuccess && onSuccess();
              } else {
                handleReset();
              }
            }}
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