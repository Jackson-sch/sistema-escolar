"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  User,
  Calendar,
  UserCheck,
  Save,
  School,
  Bookmark,
} from "lucide-react";
import { getStudentParent } from "@/action/relacion-familiar/relacion-familiar";
import { niveles } from "@/lib/gradosPorNivel";

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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AlertError, { AlertInfo } from "@/components/reutilizables/Alerts";
import { matriculaSchema } from "@/lib/validaciones/schemas/matricula-schema";
import {
  registerMatricula,
  updateMatricula,
} from "@/action/matricula/matricula";
import { useEstudiante, usePadre, useNivelAcademico } from "@/hooks/entidades";

export default function FormularioMatricula({ onSuccess, matriculaData }) {
  const { estudiantes, loading: loadingEstudiantes } = useEstudiante();
  const { nivelesAcademicos, loading: loadingNiveles } = useNivelAcademico();
  const { padres: responsables, loading: loadingPadres } = usePadre();
  const [filteredResponsables, setFilteredResponsables] =
    useState(responsables);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [nivelSeleccionado, setNivelSeleccionado] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);

  // Filtrar niveles académicos por nivel seleccionado
  const nivelesAcademicosFiltrados = nivelSeleccionado
    ? nivelesAcademicos.filter((n) => n.nivel === nivelSeleccionado)
    : [];

  // Para depuración - ver qué niveles están disponibles para el nivel seleccionado
  useEffect(() => {
    if (nivelSeleccionado) {
      console.log(
        `Niveles académicos filtrados para ${nivelSeleccionado}:`,
        nivelesAcademicosFiltrados
      );

      // Si estamos editando y hay un nivelAcademicoId
      if (matriculaData?.nivelAcademicoId) {
        const existe = nivelesAcademicosFiltrados.some(
          (na) => na.id === matriculaData.nivelAcademicoId
        );
        console.log(
          `¿El nivelAcademicoId ${matriculaData.nivelAcademicoId} existe en los filtrados? ${existe}`
        );
      }
    }
  }, [nivelSeleccionado, nivelesAcademicosFiltrados, matriculaData]);

  const router = useRouter();
  const { toast } = useToast();

  // Definir valores por defecto para la matrícula
  const getDefaultValues = () => {
    return (
      matriculaData || {
        estudianteId: "",
        nivelAcademicoId: "",
        anioAcademico: new Date().getFullYear(),
        responsableId: "",
        estado: "Activo",
      }
    );
  };

  const form = useForm({
    resolver: zodResolver(matriculaSchema),
    defaultValues: getDefaultValues(),
  });

  // Inicializar valores y nivel seleccionado cuando se carga un registro existente
  useEffect(() => {
    const initializeForm = async () => {
      if (matriculaData) {
        console.log("Datos de matrícula para edición:", matriculaData);

        // Establecer el nivel directamente desde matriculaData si existe
        if (matriculaData.nivel) {
          console.log(
            "Configurando nivel desde datos de matrícula:",
            matriculaData.nivel
          );
          setNivelSeleccionado(matriculaData.nivel);
        }

        // Si tenemos un nivelAcademicoId en los datos de matrícula
        if (matriculaData.nivelAcademicoId && nivelesAcademicos.length > 0) {
          console.log(
            "Buscando nivel académico con ID:",
            matriculaData.nivelAcademicoId
          );
          console.log("Niveles académicos disponibles:", nivelesAcademicos);

          // Encontrar el nivel académico correspondiente
          const nivelAcademicoSeleccionado = nivelesAcademicos.find(
            (na) => na.id === matriculaData.nivelAcademicoId
          );

          console.log(
            "Nivel académico encontrado:",
            nivelAcademicoSeleccionado
          );

          if (nivelAcademicoSeleccionado) {
            // Si no se estableció el nivel desde matriculaData.nivel, usar el del nivel académico
            if (!matriculaData.nivel) {
              setNivelSeleccionado(nivelAcademicoSeleccionado.nivel);
            }

            // Importante: Esperar a que se actualice el estado
            setTimeout(() => {
              // Configurar explícitamente el valor del nivelAcademicoId
              form.setValue("nivelAcademicoId", matriculaData.nivelAcademicoId);
            }, 100);
          }
        }

        // Restablecer otros valores del formulario después de configurar nivel y grado
        setTimeout(() => {
          form.reset({
            ...matriculaData,
            nivelAcademicoId: matriculaData.nivelAcademicoId, // Asegurar que este valor se mantenga
            estado: matriculaData.estado?.toLowerCase() || "activo", // Normalizar el estado a minúsculas
          });
        }, 150);

        // Inicializar responsables si tiene estudianteId
        if (matriculaData.estudianteId && matriculaData.responsableId) {
          // Buscar el responsable del estudiante
          const responsable = await getStudentParent(
            matriculaData.estudianteId
          );
          if (responsable) {
            setFilteredResponsables([responsable]);
          } else if (matriculaData.responsableId) {
            // Si no encontramos un responsable pero tenemos un ID, buscarlo en la lista completa
            const selectedResponsable = responsables.find(
              (r) => r.id === matriculaData.responsableId
            );
            if (selectedResponsable) {
              setFilteredResponsables([selectedResponsable]);
            }
          }
        }
      }
      setInitialLoad(false);
    };

    if (!loadingNiveles && !loadingPadres && !loadingEstudiantes) {
      initializeForm();
    }
  }, [
    matriculaData,
    nivelesAcademicos,
    loadingNiveles,
    loadingPadres,
    loadingEstudiantes,
  ]);

  const estudianteId = form.watch("estudianteId");

  // Cuando cambia el estudiante seleccionado, buscar su padre/responsable
  useEffect(() => {
    const loadResponsable = async () => {
      if (!estudianteId) {
        setFilteredResponsables(responsables);
        return;
      }

      try {
        const padre = await getStudentParent(estudianteId);
        if (padre) {
          setFilteredResponsables([padre]);
          form.setValue("responsableId", padre.id);
        } else {
          // Si no encuentra un responsable para este estudiante, mostrar todos
          setFilteredResponsables(responsables);

          // Mantener el responsable actual si estamos en modo edición
          if (!initialLoad && !matriculaData?.responsableId) {
            form.setValue("responsableId", "");
          }
        }
      } catch (error) {
        console.error("Error al cargar el responsable:", error);
        setFilteredResponsables(responsables);
      }
    };

    // Solo ejecutar si no es la carga inicial
    if (!initialLoad) {
      loadResponsable();
    }
  }, [estudianteId, responsables, initialLoad]);

  // Cuando se selecciona un nivel, actualizamos el nivelAcademicoId solo cuando es necesario
  useEffect(() => {
    console.log("Efecto nivel seleccionado:", {
      nivelSeleccionado,
      initialLoad,
    });

    if (nivelSeleccionado) {
      console.log(
        `Filtrando niveles académicos para nivel: ${nivelSeleccionado}`
      );
      console.log(
        `Niveles disponibles para ${nivelSeleccionado}:`,
        nivelesAcademicosFiltrados
      );

      const currentNivelAcademicoId = form.getValues("nivelAcademicoId");
      const currentNivelAcademico = currentNivelAcademicoId
        ? nivelesAcademicos.find((na) => na.id === currentNivelAcademicoId)
        : null;

      // Si estamos en modo edición y tenemos nivelAcademicoId, verificar si es válido para el nivel seleccionado
      if (matriculaData?.nivelAcademicoId && initialLoad) {
        const nivelAcademicoActual = nivelesAcademicos.find(
          (na) => na.id === matriculaData.nivelAcademicoId
        );

        console.log("Nivel académico actual en edición:", nivelAcademicoActual);

        // Si el nivel académico actual es válido para el nivel educativo seleccionado, mantenerlo
        if (
          nivelAcademicoActual &&
          nivelAcademicoActual.nivel === nivelSeleccionado
        ) {
          console.log(
            `Manteniendo nivel académico ${matriculaData.nivelAcademicoId} en el formulario`
          );
          form.setValue("nivelAcademicoId", matriculaData.nivelAcademicoId);
          return;
        }
      }

      // Solo reiniciar el valor en cambios de nivel explícitos y cuando el valor actual no es válido
      if (
        !initialLoad &&
        currentNivelAcademico &&
        currentNivelAcademico.nivel !== nivelSeleccionado
      ) {
        console.log(
          "Reiniciando valor de nivelAcademicoId a vacío porque cambió el nivel"
        );
        form.setValue("nivelAcademicoId", "");
      }
    }
  }, [nivelSeleccionado, nivelesAcademicos]);

  async function handleSubmit(data) {
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    try {
      // Asegurar que tenemos el nivel seleccionado
      if (!nivelSeleccionado) {
        setError("Debe seleccionar un nivel educativo");
        setIsLoading(false);
        return;
      }

      const formattedData = {
        ...data,
        nivel: nivelSeleccionado,
      };

      console.log("Datos a enviar:", formattedData);

      const response = matriculaData
        ? await updateMatricula({ id: matriculaData.id, ...formattedData })
        : await registerMatricula(formattedData);

      if (response.success) {
        toast({
          title: matriculaData
            ? "¡Actualización exitosa!"
            : "¡Registro exitoso!",
          description: matriculaData
            ? `La matrícula ha sido actualizada correctamente.`
            : `La matrícula ha sido registrada correctamente con todos los cursos asociados.`,
        });

        form.reset();
        router.refresh();
        onSuccess();
      } else {
        if (response.errors) {
          const fieldErrors = {};
          response.errors.forEach((error) => {
            fieldErrors[error.field] = error.message;
          });
          setFieldErrors(fieldErrors);
          if (response.errors.some((e) => e.field === "general")) {
            setError(
              response.errors.find((e) => e.field === "general")?.message
            );
          }
        }
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

  const handleCancel = () => {
    form.reset();
    router.push("/matriculas");
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Sección de alertas */}
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

        {/* Sección de información de la matrícula */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">Información de Matrícula</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campo de estudiante */}
            <FormField
              control={form.control}
              name="estudianteId"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel className="font-medium text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Estudiante <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loadingEstudiantes}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loadingEstudiantes
                              ? "Cargando..."
                              : "Seleccione estudiante"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(estudiantes || []).map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Selección de nivel educativo */}
            <div>
              <Label className="font-medium text-sm flex items-center gap-2">
                <School className="h-4 w-4" />
                Nivel educativo <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select
                value={nivelSeleccionado || ""}
                onValueChange={(val) => {
                  setNivelSeleccionado(val);
                  // No reiniciar nivelAcademicoId aquí - dejamos que el efecto lo maneje cuando sea necesario
                }}
              >
                <SelectTrigger className="focus:ring-2 focus:ring-primary focus:ring-offset-1">
                  <SelectValue placeholder="Seleccione nivel" />
                </SelectTrigger>
                <SelectContent>
                  {niveles.map((nivel) => (
                    <SelectItem key={nivel} value={nivel}>
                      {nivel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selección de nivel académico (grado y sección) */}
            <FormField
              control={form.control}
              name="nivelAcademicoId"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel className="font-medium text-sm flex items-center gap-2">
                    <Bookmark className="h-4 w-4" />
                    Grado y sección <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      console.log("Nivel académico seleccionado:", value);
                      // Establecer el valor directamente sin esperar a efectos secundarios
                      field.onChange(value);
                    }}
                    value={field.value || ""}
                    disabled={!nivelSeleccionado || loadingNiveles}
                    // Asegurar que el componente responda al primer clic
                    onOpenChange={(open) => {
                      if (open) {
                        console.log("Dropdown de grado y sección abierto");
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full focus:ring-2 focus:ring-primary focus:ring-offset-1">
                        <SelectValue
                          placeholder={
                            !nivelSeleccionado
                              ? "Seleccione nivel primero"
                              : loadingNiveles
                              ? "Cargando..."
                              : "Seleccione grado y sección"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(nivelesAcademicosFiltrados || []).map((na) => (
                        <SelectItem key={na.id} value={na.id}>
                          {`${na.grado.replace("_", " ")} - Sección ${
                            na.seccion || "Única"
                          }`}
                        </SelectItem>
                      ))}
                      {nivelesAcademicosFiltrados.length === 0 &&
                        nivelSeleccionado && (
                          <div className="py-2 px-2 text-sm text-gray-500">
                            No hay grados disponibles para este nivel
                          </div>
                        )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
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

            {/* Campo de responsable */}
            <FormField
              control={form.control}
              name="responsableId"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel className="font-medium text-sm flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Responsable <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loadingPadres}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loadingPadres
                              ? "Cargando..."
                              : "Seleccione responsable"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(filteredResponsables || []).map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Campo de estado */}
            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel className="font-medium text-sm flex items-center gap-2">
                    <Bookmark className="h-4 w-4" />
                    Estado <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value.toLowerCase()} // Asegurar que coincida con las opciones
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="activo">Activa</SelectItem>
                      <SelectItem value="inactivo">Inactiva</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Información sobre los cursos */}
        <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
          <p className="text-sm text-blue-700 flex items-center gap-2">
            <InfoIcon className="h-10 w-10" />
            Al registrar la matrícula, el estudiante será automáticamente
            inscrito en todos los cursos correspondientes a su nivel y grado
            seleccionado.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-end border-t border-slate-200 dark:border-slate-800 mt-6">
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
                <span>
                  {matriculaData ? "Actualizando..." : "Registrando..."}
                </span>
              </div>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {matriculaData ? "Actualizar" : "Guardar"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Icono de información
const InfoIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
