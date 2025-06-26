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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { createCurso, updateCurso } from "@/action/config/estructura-academica-action";

// Esquema de validación con alcances
const cursoSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  codigo: z.string().min(1, { message: "El código es requerido" }),
  descripcion: z.string().optional(),
  alcance: z.enum(["SECCION_ESPECIFICA", "TODO_EL_GRADO", "TODO_EL_NIVEL", "TODO_LA_INSTITUCION"]),
  
  // Campos condicionales según el alcance
  nivelId: z.string().optional(),
  gradoId: z.string().optional(),
  nivelAcademicoId: z.string().optional(),
  
  areaCurricularId: z.string().min(1, { message: "El área curricular es requerida" }),
  profesorId: z.string().min(1, { message: "El profesor es requerido" }),
  anioAcademico: z.coerce.number().int().min(new Date().getFullYear()),
  creditos: z.coerce.number().int().min(0).optional(),
  horasSemanales: z.coerce.number().int().min(0).optional(),
  activo: z.boolean().default(true),
}).refine((data) => {
  // Validaciones condicionales según el alcance
  switch (data.alcance) {
    case "SECCION_ESPECIFICA":
      return data.nivelAcademicoId && data.nivelAcademicoId.length > 0;
    case "TODO_EL_GRADO":
      return data.gradoId && data.gradoId.length > 0;
    case "TODO_EL_NIVEL":
      return data.nivelId && data.nivelId.length > 0;
    case "TODO_LA_INSTITUCION":
      return true; // No requiere campos adicionales
    default:
      return false;
  }
}, {
  message: "Debe seleccionar el elemento correspondiente al alcance elegido",
  path: ["alcance"]
});

export function CursoForm({ 
  institucion, 
  curso, 
  profesores = [], 
  isEditing, 
  niveles = [], 
  areasCurriculares = [], 
  nivelesAcademicos = [], 
  onSuccess 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [gradosDisponibles, setGradosDisponibles] = useState([]);
  const [nivelesAcademicosDisponibles, setNivelesAcademicosDisponibles] = useState([]);
  const [groupedNivelesAcademicos, setGroupedNivelesAcademicos] = useState({});

  const form = useForm({
    resolver: zodResolver(cursoSchema),
    defaultValues: {
      nombre: curso?.nombre || "",
      codigo: curso?.codigo || "",
      descripcion: curso?.descripcion || "",
      alcance: curso?.alcance || "SECCION_ESPECIFICA",
      nivelId: curso?.nivelId || "",
      gradoId: curso?.gradoId || "",
      nivelAcademicoId: curso?.nivelAcademicoId || "",
      areaCurricularId: curso?.areaCurricularId || "",
      profesorId: curso?.profesorId || "",
      anioAcademico: curso?.anioAcademico || new Date().getFullYear(),
      creditos: curso?.creditos || 0,
      horasSemanales: curso?.horasSemanales || 0,
      activo: curso?.activo ?? true,
    },
  });

  const alcanceActual = form.watch("alcance");
  const nivelSeleccionado = form.watch("nivelId");
  const gradoSeleccionado = form.watch("gradoId");

  // Agrupar niveles académicos por nivel y grado
  useEffect(() => {
    const grouped = nivelesAcademicos.reduce((acc, na) => {
      const nivelNombre = na.nivel?.nombre || "Sin Nivel";
      const gradoNombre = na.grado?.nombre || "Sin Grado";
      const key = `${nivelNombre} - ${gradoNombre}`;
      
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(na);
      return acc;
    }, {});
    setGroupedNivelesAcademicos(grouped);
  }, [nivelesAcademicos]);

  // Cargar grados cuando cambia el nivel
  useEffect(() => {
    if (!nivelSeleccionado) {
      setGradosDisponibles([]);
      return;
    }
    
    const nivel = niveles.find(n => n.id === nivelSeleccionado);
    if (nivel && nivel.grados) {
      setGradosDisponibles(nivel.grados);
    } else {
      setGradosDisponibles([]);
    }
  }, [nivelSeleccionado, niveles]);

  // Cargar niveles académicos cuando cambia nivel o grado
  useEffect(() => {
    if (!nivelSeleccionado || !gradoSeleccionado) {
      setNivelesAcademicosDisponibles([]);
      return;
    }

    const filtrados = nivelesAcademicos.filter(na => 
      na.nivelId === nivelSeleccionado && na.gradoId === gradoSeleccionado
    );
    setNivelesAcademicosDisponibles(filtrados);
  }, [nivelSeleccionado, gradoSeleccionado, nivelesAcademicos]);

  // Filtrar áreas curriculares según el alcance y selección
  useEffect(() => {
    let areasFiltradas = areasCurriculares.filter(area => area.activa);
    
    switch (alcanceActual) {
      case "SECCION_ESPECIFICA":
      case "TODO_EL_GRADO":
      case "TODO_EL_NIVEL":
        if (nivelSeleccionado) {
          areasFiltradas = areasCurriculares.filter(
            area => area.activa && (area.nivelId === nivelSeleccionado || area.nivelId === null)
          );
        }
        break;
      case "TODA_LA_INSTITUCION":
        // Todas las áreas disponibles
        break;
    }
    
    setFilteredAreas(areasFiltradas);
  }, [alcanceActual, nivelSeleccionado, areasCurriculares]);

  // Limpiar campos cuando cambia el alcance
  useEffect(() => {
    switch (alcanceActual) {
      case "SECCION_ESPECIFICA":
        // Mantener todos los campos
        break;
      case "TODO_EL_GRADO":
        form.setValue("nivelAcademicoId", "");
        break;
      case "TODO_EL_NIVEL":
        form.setValue("gradoId", "");
        form.setValue("nivelAcademicoId", "");
        break;
      case "TODA_LA_INSTITUCION":
        form.setValue("nivelId", "");
        form.setValue("gradoId", "");
        form.setValue("nivelAcademicoId", "");
        break;
    }
  }, [alcanceActual]);

  const onSubmit = async (data) => {
    if (!institucion?.id) {
      toast.error("No se ha seleccionado una institución");
      return;
    }

    // Preparar datos según el alcance
    const dataToSubmit = {
      nombre: data.nombre,
      codigo: data.codigo.toUpperCase(),
      descripcion: data.descripcion,
      alcance: data.alcance,
      areaCurricularId: data.areaCurricularId,
      profesorId: data.profesorId,
      anioAcademico: Number(data.anioAcademico),
      creditos: Number(data.creditos || 0),
      horasSemanales: Number(data.horasSemanales || 0),
      activo: data.activo,
      institucionId: institucion.id,
    };

    // Agregar campos específicos según el alcance
    switch (data.alcance) {
      case "SECCION_ESPECIFICA":
        dataToSubmit.nivelAcademicoId = data.nivelAcademicoId;
        // También obtener nivel y grado del nivel académico
        const nivelAcademico = nivelesAcademicos.find(na => na.id === data.nivelAcademicoId);
        if (nivelAcademico) {
          dataToSubmit.gradoId = nivelAcademico.gradoId;
          dataToSubmit.nivelId = nivelAcademico.nivelId;
        }
        break;
      case "TODO_EL_GRADO":
        dataToSubmit.gradoId = data.gradoId;
        dataToSubmit.nivelId = data.nivelId;
        break;
      case "TODO_EL_NIVEL":
        dataToSubmit.nivelId = data.nivelId;
        break;
      case "TODO_LA_INSTITUCION":
        // Solo institucionId ya incluido
        break;
    }

    console.log("Datos a enviar:", dataToSubmit);

    setIsSubmitting(true);
    try {
      let response;
      if (isEditing && curso?.id) {
        response = await updateCurso(curso.id, dataToSubmit);
      } else {
        response = await createCurso(dataToSubmit);
      }

      if (response.success) {
        toast.success(isEditing ? "Curso actualizado correctamente" : "Curso creado correctamente");
        if (onSuccess) onSuccess();
      } else {
        toast.error(response.error || "Error al procesar el curso");
      }
    } catch (error) {
      console.error("Error al procesar el curso:", error);
      toast.error("Error al procesar el curso");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAlcanceDescription = (alcance) => {
    switch (alcance) {
      case "SECCION_ESPECIFICA":
        return "El curso se dicta solo en una sección específica (ej: Matemática para 1°A)";
      case "TODO_EL_GRADO":
        return "El curso se dicta en todas las secciones de un grado (ej: Matemática para todo 1°)";
      case "TODO_EL_NIVEL":
        return "El curso se dicta en todo un nivel educativo (ej: Ed. Física para toda Primaria)";
      case "TODO_LA_INSTITUCION":
        return "El curso se dicta en toda la institución (ej: Religión para todo el colegio)";
      default:
        return "";
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        {/* Información básica */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Curso</FormLabel>
                <FormControl>
                  <Input placeholder="Matemática Básica" {...field} />
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
                    placeholder="MAT101"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Selección del alcance */}
        <FormField
          control={form.control}
          name="alcance"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Alcance del Curso</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-1 gap-4"
                >
                  {[
                    { value: "SECCION_ESPECIFICA", label: "Sección Específica" },
                    { value: "TODO_EL_GRADO", label: "Todo el Grado" },
                    { value: "TODO_EL_NIVEL", label: "Todo el Nivel" },
                    { value: "TODO_LA_INSTITUCION", label: "Toda la Institución" }
                  ].map((option) => (
                    <div key={option.value} className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                      <RadioGroupItem value={option.value} />
                      <div className="space-y-1 leading-none">
                        <Label className="font-medium">{option.label}</Label>
                        <p className="text-sm text-muted-foreground">
                          {renderAlcanceDescription(option.value)}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campos condicionales según el alcance */}
        {(alcanceActual === "TODO_EL_NIVEL" || alcanceActual === "TODO_EL_GRADO" || alcanceActual === "SECCION_ESPECIFICA") && (
          <FormField
            control={form.control}
            name="nivelId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nivel Educativo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un nivel" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {niveles.map(nivel => (
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
        )}

        {(alcanceActual === "TODO_EL_GRADO" || alcanceActual === "SECCION_ESPECIFICA") && nivelSeleccionado && (
          <FormField
            control={form.control}
            name="gradoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grado</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un grado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {gradosDisponibles.map(grado => (
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
        )}

        {alcanceActual === "SECCION_ESPECIFICA" && gradoSeleccionado && (
          <FormField
            control={form.control}
            name="nivelAcademicoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sección</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una sección" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {nivelesAcademicosDisponibles.map(nivel => (
                      <SelectItem key={nivel.id} value={nivel.id}>
                        Sección {nivel.seccion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Área curricular */}
        <FormField
          control={form.control}
          name="areaCurricularId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Área Curricular</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un área curricular" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredAreas.map(area => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.nombre} ({area.codigo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Profesor */}
        <FormField
          control={form.control}
          name="profesorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profesor</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un profesor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {profesores.map(profesor => (
                    <SelectItem key={profesor.id} value={profesor.id}>
                      {`${profesor.apellidoPaterno || ''} ${profesor.apellidoMaterno || ''} ${profesor.name || ''}`.trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descripción */}
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descripción del curso"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campos numéricos */}
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="anioAcademico"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Año Académico</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="creditos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Créditos</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="horasSemanales"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horas Semanales</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Estado activo */}
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
                <FormLabel>Curso Activo</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Indica si este curso está activo en el sistema
                </p>
              </div>
            </FormItem>
          )}
        />

        {/* Botones */}
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