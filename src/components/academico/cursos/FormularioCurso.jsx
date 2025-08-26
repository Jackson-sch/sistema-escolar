"use client";

// Paquetes externos
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  BookOpen,
  Hash,
  FileText,
  Layers,
  Calendar,
  Clock,
  User,
  Save,
  GraduationCap,
  BookMarked,
  CheckCircle2,
} from "lucide-react";

// Alias de módulos
import { useToast } from "@/hooks/use-toast";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import AlertError, { AlertInfo } from "@/components/reutilizables/Alerts";
import { registerCurso, updateCurso } from "@/action/cursos/curso";
import { cursoSchema } from "@/lib/validaciones/schemas/curso-schema";
import { useProfesoresActivos } from "@/hooks";

export function FormularioCurso({ cursoData, onSuccess, areasCurriculares = [], nivelesAcademicos = [], institucionId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const router = useRouter();
  const { toast } = useToast();
  const { profesores, loading: loadingProfesores, error: errorProfesores } = useProfesoresActivos();
  
  // Manejar error de carga de profesores
  useEffect(() => {
    if (errorProfesores) {
      console.warn("Error al cargar profesores:", errorProfesores);
      // No mostramos el error directamente al usuario para no interrumpir el flujo
      // Solo lo registramos en consola para depuración
    }
  }, [errorProfesores]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [filteredNiveles, setFilteredNiveles] = useState([]);

  // Definir valores por defecto para el curso
  const getDefaultValues = () => {
    return (
      cursoData || {
        nombre: "",
        codigo: "",
        descripcion: "",
        nivel: "",
        grado: "",
        areaCurricularId: "",
        nivelAcademicoId: "",
        anioAcademico: new Date().getFullYear(),
        creditos: 0,
        horasSemanales: 0,
        profesorId: "",
        activo: true,
      }
    );
  };

  const form = useForm({
    resolver: zodResolver(cursoSchema),
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    form.reset(getDefaultValues());
  }, [cursoData]);

  // Usar un estado para almacenar el nivel seleccionado
  const nivel = form.watch("nivel");
  
  // Filtrar áreas curriculares por nivel e institución
  useEffect(() => {
    if (areasCurriculares.length > 0) {
      let filtered = areasCurriculares.filter(area => area.activa);
      
      // Filtrar por institución si se proporciona un ID
      if (institucionId) {
        filtered = filtered.filter(area => area.institucionId === institucionId);
      }
      
      // Filtrar por nivel si se selecciona uno
      if (nivel) {
        filtered = filtered.filter(area => area.nivel === nivel);
      }
      
      setFilteredAreas(filtered);
      
      // Si el área seleccionada no está en las filtradas, resetear
      const currentAreaId = form.getValues("areaCurricularId");
      if (currentAreaId && !filtered.some(area => area.id === currentAreaId)) {
        form.setValue("areaCurricularId", "");
      }
    } else {
      setFilteredAreas([]);
    }
  }, [nivel, areasCurriculares, institucionId]);

  // Observar el grado seleccionado
  const grado = form.watch("grado");
  
  // Filtrar niveles académicos por nivel y grado
  useEffect(() => {
    if (nivel && nivelesAcademicos.length > 0) {
      // Primero filtrar por nivel y estado activo
      let filtered = nivelesAcademicos.filter(nivelAcad => 
        nivelAcad.nivel === nivel && nivelAcad.activo
      );
      
      // Si hay un grado seleccionado y no es "TODOS", filtrar por grado
      if (grado && grado !== "TODOS") {
        filtered = filtered.filter(nivelAcad => nivelAcad.grado === grado);
      }
      // Si es "TODOS", mostramos todos los niveles académicos del nivel seleccionado
      // (ya están filtrados por nivel arriba)
      
      setFilteredNiveles(filtered);
      
      // Si el nivel académico seleccionado no está en los filtrados, resetear
      const currentNivelId = form.getValues("nivelAcademicoId");
      if (currentNivelId && !filtered.some(nivelAcad => nivelAcad.id === currentNivelId)) {
        form.setValue("nivelAcademicoId", "");
      }
    } else {
      setFilteredNiveles(nivelesAcademicos.filter(nivelAcad => nivelAcad.activo));
    }
  }, [nivel, grado, nivelesAcademicos]);

  async function onSubmit(data) {
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    try {
      // Crear una copia de los datos para no modificar el objeto original
      const dataToSubmit = { ...data };
      
      // Eliminar explícitamente institucionId si existe
      // Ya que la relación con la institución se maneja a través del área curricular
      if ('institucionId' in dataToSubmit) {
        delete dataToSubmit.institucionId;
      }

      // Convertir valores numéricos
      dataToSubmit.creditos = dataToSubmit.creditos ? parseInt(dataToSubmit.creditos) : 0;
      dataToSubmit.horasSemanales = dataToSubmit.horasSemanales ? parseInt(dataToSubmit.horasSemanales) : 0;
      dataToSubmit.anioAcademico = parseInt(dataToSubmit.anioAcademico);

      // Asegurarse de que el código esté en mayúsculas
      dataToSubmit.codigo = dataToSubmit.codigo.toUpperCase();

      // Determinar si estamos editando un curso existente
      const isEditing = !!cursoData;
      
      // Si estamos editando, incluir el ID del curso original
      if (isEditing && cursoData?.id) {
        dataToSubmit.id = cursoData.id;
      }

      // Seleccionar la acción adecuada basada en si estamos editando o creando
      const action = isEditing ? updateCurso : registerCurso;
      const result = await action(dataToSubmit);

      if (!result.success) {
        if (result.errors) {
          const errors = {};
          result.errors.forEach((err) => {
            errors[err.field] = err.message;
          });
          setFieldErrors(errors);
        } else {
          setError(result.message || "Hubo un error al guardar el curso");
        }
        return;
      }
      
      toast({
        title: cursoData
          ? "Curso actualizado correctamente"
          : "Curso registrado correctamente",
        description: `El curso ${data.nombre} ha sido ${cursoData ? "actualizado" : "registrado"} exitosamente.`,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/academico/cursos");
      }
    } catch (error) {
      setError(
        "Hubo un error interno del servidor. Por favor, inténtelo nuevamente."
      );
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Obtener opciones de grado según el nivel
  const getGradoOptions = () => {
    const nivel = form.watch("nivel");
    
    // Opción común para todos los niveles
    const opcionTodos = { value: "TODOS", label: "Todos los grados" };
    
    switch (nivel) {
      case "INICIAL":
        return [
          opcionTodos,
          { value: "CUNA_0_2", label: "Cuna (0-2 años)" },
          { value: "JARDIN_3", label: "Jardín 3 años" },
          { value: "JARDIN_4", label: "Jardín 4 años" },
          { value: "JARDIN_5", label: "Jardín 5 años" },
        ];
      case "PRIMARIA":
        return [
          opcionTodos,
          { value: "PRIMERO_PRIMARIA", label: "1° Primaria" },
          { value: "SEGUNDO_PRIMARIA", label: "2° Primaria" },
          { value: "TERCERO_PRIMARIA", label: "3° Primaria" },
          { value: "CUARTO_PRIMARIA", label: "4° Primaria" },
          { value: "QUINTO_PRIMARIA", label: "5° Primaria" },
          { value: "SEXTO_PRIMARIA", label: "6° Primaria" },
        ];
      case "SECUNDARIA":
        return [
          opcionTodos,
          { value: "PRIMERO_SECUNDARIA", label: "1° Secundaria" },
          { value: "SEGUNDO_SECUNDARIA", label: "2° Secundaria" },
          { value: "TERCERO_SECUNDARIA", label: "3° Secundaria" },
          { value: "CUARTO_SECUNDARIA", label: "4° Secundaria" },
          { value: "QUINTO_SECUNDARIA", label: "5° Secundaria" },
        ];
      case "SUPERIOR_TECNOLOGICA":
      case "SUPERIOR_PEDAGOGICA":
        return [
          opcionTodos,
          { value: "PRIMER_CICLO", label: "1° Ciclo" },
          { value: "SEGUNDO_CICLO", label: "2° Ciclo" },
          { value: "TERCER_CICLO", label: "3° Ciclo" },
          { value: "CUARTO_CICLO", label: "4° Ciclo" },
          { value: "QUINTO_CICLO", label: "5° Ciclo" },
          { value: "SEXTO_CICLO", label: "6° Ciclo" },
        ];
      default:
        return [];
    }
  };

  const handleCancel = () => {
    form.reset();
    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/academico/cursos");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Sección de alertas mejorada */}
        <div className="space-y-3">
          <AlertInfo />
          {error && <AlertError error={error} />}
          {Object.keys(fieldErrors).length > 0 && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm font-medium text-red-600 mb-1">
                Por favor corrige los siguientes errores:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                {Object.keys(fieldErrors).map((field) => (
                  <li key={field} className="text-xs text-red-500">
                    {fieldErrors[field]}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sección de información del curso */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">Información del Curso</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campo de nombre */}
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel className="font-medium text-sm flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Nombre del curso{" "}
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Matemáticas"
                      className="w-full focus:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Campo de código */}
            <FormField
              control={form.control}
              name="codigo"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel className="font-medium text-sm flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Código <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: MAT2025"
                      className="w-full focus:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Campo de descripción */}
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5 sm:col-span-1 md:col-span-2">
                  <FormLabel className="font-medium text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Descripción
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción detallada del curso"
                      className="w-full focus:ring-primary min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Sección para información académica */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">Información Académica</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campo de nivel académico */}
            <FormField
              control={form.control}
              name="nivel"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel className="font-medium text-sm flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Nivel académico <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione nivel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INICIAL">Inicial</SelectItem>
                      <SelectItem value="PRIMARIA">Primaria</SelectItem>
                      <SelectItem value="SECUNDARIA">Secundaria</SelectItem>
                      <SelectItem value="SUPERIOR_TECNOLOGICA">Superior Tecnológica</SelectItem>
                      <SelectItem value="SUPERIOR_PEDAGOGICA">Superior Pedagógica</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Campo de grado */}
            <FormField
              control={form.control}
              name="grado"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel className="font-medium text-sm flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Grado
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!form.watch("nivel")}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione grado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getGradoOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Campo de área curricular */}
            <FormField
              control={form.control}
              name="areaCurricularId"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel className="font-medium text-sm flex items-center gap-2">
                    <BookMarked className="h-4 w-4" />
                    Área curricular <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!form.watch("nivel") || filteredAreas.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione área curricular" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredAreas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                  {form.watch("nivel") && filteredAreas.length === 0 && (
                    <p className="text-xs text-amber-500">
                      No hay áreas curriculares disponibles para este nivel.
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Campo de nivel académico específico */}
            <FormField
              control={form.control}
              name="nivelAcademicoId"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel className="font-medium text-sm flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Nivel académico específico
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!form.watch("nivel") || filteredNiveles.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione nivel académico" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredNiveles.map((nivel) => (
                        <SelectItem key={nivel.id} value={nivel.id}>
                          {nivel.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                  {form.watch("nivel") && filteredNiveles.length === 0 && (
                    <p className="text-xs text-amber-500">
                      No hay niveles académicos disponibles para este nivel y grado.
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Campo de año académico */}
            <FormField
              control={form.control}
              name="anioAcademico"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel className="font-medium text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Año académico <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="2025"
                      className="w-full focus:ring-primary"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Campo de créditos */}
            <FormField
              control={form.control}
              name="creditos"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel className="font-medium text-sm flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Créditos
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ej: 3"
                      className="w-full focus:ring-primary"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Campo de horas semanales */}
            <FormField
              control={form.control}
              name="horasSemanales"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel className="font-medium text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horas semanales
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ej: 5"
                      className="w-full focus:ring-primary"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Campo de profesor asignado */}
            <FormField
              control={form.control}
              name="profesorId"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5 ">
                  <FormLabel className="font-medium text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profesor asignado
                    {loadingProfesores && (
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground ml-2" />
                    )}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loadingProfesores || errorProfesores}
                  >
                    <FormControl>
                      <SelectTrigger className=" capitalize">
                        <SelectValue placeholder={
                          loadingProfesores ? "Cargando profesores..." : 
                          errorProfesores ? "Error al cargar profesores" : 
                          "Seleccione profesor"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="capitalize">
                      {profesores && profesores.length > 0 ? (
                        profesores.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{p.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {p.especialidad}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {p.titulo}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="NO_DISPONIBLE" disabled>
                          {errorProfesores ? "Error al cargar profesores" : "No hay profesores disponibles"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                  {errorProfesores && (
                    <p className="text-xs text-red-500">
                      Error al cargar profesores. Intente recargar la página.
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Campo de estado (activo/inactivo) */}
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
                    <FormLabel className="font-medium text-sm flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Curso activo
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Marque esta casilla si el curso está activo y disponible para asignación.
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-end border-t mt-6">
          <Button
            className="w-full sm:w-auto px-8 py-2.5 rounded-lg text-sm font-medium"
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto px-8 py-2.5 rounded-lg text-sm font-medium bg-primary hover:bg-primary/90 gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>{cursoData ? "Actualizando..." : "Registrando..."}</span>
              </div>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {cursoData ? "Actualizar" : "Registrar"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
