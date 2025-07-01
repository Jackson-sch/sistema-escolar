"use client";

import React from "react";
import { useEffect, useState, useMemo, useCallback } from "react";
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
  LayoutGrid,
  Info,
} from "lucide-react";

// Actions and utilities
import { getStudentParent } from "@/action/relacion-familiar/relacion-familiar";
import { registerMatricula, updateMatricula } from "@/action/matricula/matricula";
import { matriculaSchema } from "@/lib/validaciones/schemas/matricula-schema";

// Hooks
import { useToast } from "@/hooks/use-toast";
import { useEstudiante, usePadre, useNivelAcademico } from "@/hooks/entidades";
import { useNiveles } from "@/hooks/entidades/use-niveles";

// Components
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

// Constants
const ESTADO_OPTIONS = [
  { value: "activo", label: "Activa" },
  { value: "inactivo", label: "Inactiva" },
];

const DEFAULT_VALUES = {
  estudianteId: "",
  nivelAcademicoId: "",
  gradoId: "",
  anioAcademico: new Date().getFullYear(),
  responsableId: "",
  estado: "activo",
};

// Helper functions
const normalizeNivelName = (nivel) => {
  if (!nivel) return "";
  if (typeof nivel === "object" && nivel.nombre) return nivel.nombre;
  return String(nivel);
};

const extractGradoId = (nivelAcademico) => {
  if (!nivelAcademico) return "";
  
  const { grado } = nivelAcademico;
  if (typeof grado === "string") return grado;
  if (grado?.id) return grado.id;
  return "";
};

const getDefaultFormValues = (matriculaData) => {
  if (!matriculaData) return DEFAULT_VALUES;

  const gradoId = extractGradoId(matriculaData.nivelAcademico);
  const estado = matriculaData.estado?.toLowerCase() || "activo";

  // Asegurarse de que el responsableId esté incluido
  return {
    ...matriculaData,
    gradoId,
    estado,
    responsableId: matriculaData.responsableId || "",
  };
};

// Custom hooks for data processing
const useProcessedData = (nivelesData, nivelesAcademicos, nivelSeleccionado, gradoSeleccionado) => {
  // Extract unique levels from nivelesData
  const niveles = useMemo(() => {
    if (!nivelesData?.data) return [];
    return [...new Set(nivelesData.data.map(nivel => nivel.nombre))];
  }, [nivelesData]);

  // Filter academic levels by selected level
  const nivelesAcademicosFiltrados = useMemo(() => {
    if (!nivelSeleccionado || !nivelesAcademicos.length) return [];
    
    const nivelSeleccionadoStr = String(nivelSeleccionado).toLowerCase();
    
    return nivelesAcademicos.filter(na => {
      const nivelAcademico = normalizeNivelName(na.nivel || na.nivelId);
      return nivelAcademico.toLowerCase() === nivelSeleccionadoStr;
    });
  }, [nivelSeleccionado, nivelesAcademicos]);

  // Extract unique grades from filtered academic levels
  const gradosUnicos = useMemo(() => {
    if (!nivelesAcademicosFiltrados.length) return [];
    
    const gradosMap = new Map();
    
    nivelesAcademicosFiltrados.forEach(na => {
      const gradoId = extractGradoId(na);
      if (!gradoId || gradosMap.has(gradoId)) return;
      
      const gradoNombre = typeof na.grado === "string" 
        ? na.grado.replace("_", " ")
        : na.grado?.nombre || na.grado?.codigo?.replace("_", " ") || "Grado sin nombre";
      
      gradosMap.set(gradoId, { id: gradoId, nombre: gradoNombre });
    });
    
    return Array.from(gradosMap.values());
  }, [nivelesAcademicosFiltrados]);

  // Filter sections by selected grade
  const seccionesFiltradas = useMemo(() => {
    if (!gradoSeleccionado || !nivelesAcademicosFiltrados.length) return [];
    
    return nivelesAcademicosFiltrados
      .filter(na => extractGradoId(na) === gradoSeleccionado)
      .map(na => ({
        id: na.id,
        seccion: na.seccion || "Única",
        nivelAcademicoId: na.id,
      }));
  }, [gradoSeleccionado, nivelesAcademicosFiltrados]);

  return {
    niveles,
    nivelesAcademicosFiltrados,
    gradosUnicos,
    seccionesFiltradas,
  };
};

// Error display component
const ErrorDisplay = ({ fieldErrors, error }) => {
  if (!Object.keys(fieldErrors).length && !error) return null;

  return (
    <div className="space-y-3">
      {Object.keys(fieldErrors).length > 0 && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm font-medium text-red-600 mb-1">
            Por favor corrige los siguientes errores:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            {Object.entries(fieldErrors).map(([field, message]) => (
              <li key={field} className="text-xs text-red-500">
                {message}
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

// Info banner component
const InfoBanner = () => (
  <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
    <p className="text-sm text-blue-700 flex items-center gap-2">
      <Info className="h-4 w-4 flex-shrink-0" />
      Al registrar la matrícula, el estudiante será automáticamente
      inscrito en todos los cursos correspondientes a su nivel y grado
      seleccionado.
    </p>
  </div>
);

// Main component
export default function FormularioMatricula({ onSuccess, matriculaData }) {
  // Hooks
  const router = useRouter();
  const { toast } = useToast();
  
  // Data hooks
  const { estudiantes, loading: loadingEstudiantes } = useEstudiante();
  const { nivelesAcademicos, loading: loadingNiveles } = useNivelAcademico();
  const { nivelesData, loading: loadingNiveles2 } = useNiveles();
  const { padres: responsables, loading: loadingPadres } = usePadre();

  // State
  const [filteredResponsables, setFilteredResponsables] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [nivelSeleccionado, setNivelSeleccionado] = useState("");
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);
  const [responsableActual, setResponsableActual] = useState(null);

  // Form setup
  const form = useForm({
    resolver: zodResolver(matriculaSchema),
    defaultValues: getDefaultFormValues(matriculaData),
  });

  // Processed data
  const { niveles, nivelesAcademicosFiltrados, gradosUnicos, seccionesFiltradas } = 
    useProcessedData(nivelesData, nivelesAcademicos, nivelSeleccionado, gradoSeleccionado);

  // Watch form values
  const estudianteId = form.watch("estudianteId");

  // Callback functions
  const loadResponsable = useCallback(async (studentId) => {
    if (!studentId) {
      if (responsables && responsables.length > 0) {
        setFilteredResponsables(responsables);
      }
      return;
    }

    try {
      const padre = await getStudentParent(studentId);
      if (padre) {
        setResponsableActual(padre);
        setFilteredResponsables([padre]);
        form.setValue("responsableId", padre.id, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      } else {
        // Si no hay padre asociado al estudiante, mostrar todos los responsables disponibles
        if (responsables && responsables.length > 0) {
          setFilteredResponsables(responsables);
          
          // Si estamos en modo edición, mantener el responsable seleccionado
          if (matriculaData?.responsableId) {
            const selectedResponsable = responsables.find(r => r.id === matriculaData.responsableId);
            if (selectedResponsable) {
              setResponsableActual(selectedResponsable);
            }
          } else if (!initialLoad) {
            form.setValue("responsableId", "", { shouldValidate: true });
          }
        }
      }
    } catch (error) {
      console.error("Error al cargar el responsable:", error);
      if (responsables && responsables.length > 0) {
        setFilteredResponsables(responsables);
      }
    }
  }, [responsables, initialLoad, form, matriculaData]);

  const validateAndSetError = (condition, message) => {
    if (condition) {
      setError(message);
      setIsLoading(false);
      return true;
    }
    return false;
  };

  const handleSubmit = async (data) => {
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    // Validation
    if (validateAndSetError(!nivelSeleccionado, "Debe seleccionar un nivel educativo")) return;
    
    // Verificar el grado usando tanto el estado local como el valor del formulario
    const gradoValue = gradoSeleccionado || data.gradoId;
    if (validateAndSetError(!gradoValue, "Debe seleccionar un grado")) return;
    
    if (validateAndSetError(!data.nivelAcademicoId, "Debe seleccionar una sección")) return;

    try {
      // Prepare data for submission
      // Usar el valor del grado desde el estado local o desde el formulario
      const gradoValue = gradoSeleccionado || data.gradoId;
      const { gradoId, ...dataToSend } = { ...data, gradoId: gradoValue };

      console.log("Datos a enviar:", dataToSend);

      const response = matriculaData
        ? await updateMatricula({ id: matriculaData.id, ...dataToSend })
        : await registerMatricula(dataToSend);

      if (response.success) {
        const action = matriculaData ? "actualizada" : "registrada";
        toast({
          title: `¡${matriculaData ? "Actualización" : "Registro"} exitoso!`,
          description: `La matrícula ha sido ${action} correctamente${!matriculaData ? " con todos los cursos asociados" : ""}.`,
        });

        form.reset();
        router.refresh();
        onSuccess();
      } else {
        handleFormErrors(response.errors);
      }
    } catch (error) {
      setError("Hubo un error interno del servidor. Por favor, inténtelo nuevamente.");
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormErrors = (errors) => {
    if (!errors) return;
    
    const fieldErrorsMap = {};
    errors.forEach((error) => {
      fieldErrorsMap[error.field] = error.message;
    });
    
    setFieldErrors(fieldErrorsMap);
    
    const generalError = errors.find((e) => e.field === "general");
    if (generalError) {
      setError(generalError.message);
    }
  };

  const handleCancel = () => {
    form.reset();
    router.push("/matriculas");
    onSuccess();
  };

  // Effects
  useEffect(() => {
    const initializeForm = async () => {
      if (!matriculaData) {
        setInitialLoad(false);
        return;
      }

      console.log("Datos de matrícula para edición:", matriculaData);
      
      // Extraer el nombre del responsable si está en los datos
      if (matriculaData.responsableNombre) {
        console.log("Nombre del responsable encontrado:", matriculaData.responsableNombre);
      } else if (matriculaData.responsable?.name) {
        matriculaData.responsableNombre = matriculaData.responsable.name;
        console.log("Nombre del responsable desde objeto responsable:", matriculaData.responsableNombre);
      }

      // Set level
      const nivel = matriculaData.nivel || normalizeNivelName(matriculaData.nivelAcademico?.nivel);
      if (nivel) {
        setNivelSeleccionado(String(nivel));
      }

      // Set grade
      const gradoId = extractGradoId(matriculaData.nivelAcademico);
      if (gradoId) {
        setGradoSeleccionado(gradoId);
        // Actualizar explícitamente el valor en el formulario
        form.setValue("gradoId", gradoId, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      }

      // Handle academic level ID
      if (matriculaData.nivelAcademicoId && nivelesAcademicos.length > 0) {
        setTimeout(() => {
          form.setValue("nivelAcademicoId", matriculaData.nivelAcademicoId);
        }, 100);
      }

      // Reset form with updated values
      setTimeout(() => {
        form.reset({
          ...matriculaData,
          gradoId: gradoId, // Añadir explícitamente el gradoId
          nivelAcademicoId: matriculaData.nivelAcademicoId,
          responsableId: matriculaData.responsableId, // Añadir explícitamente el responsableId
          estado: matriculaData.estado?.toLowerCase() || "activo",
        });
      }, 150);

      // Load responsible person
      if (matriculaData.responsableId) {
        console.log("Responsable ID en matricula:", matriculaData.responsableId);
        console.log("Nombre del responsable en matricula:", matriculaData.responsableNombre);
        
        // Crear un responsable temporal con el ID y nombre de la matrícula
        if (matriculaData.responsableNombre) {
          const tempResponsable = {
            id: matriculaData.responsableId,
            name: matriculaData.responsableNombre
          };
          setResponsableActual(tempResponsable);
          setFilteredResponsables([tempResponsable]);
          form.setValue("responsableId", matriculaData.responsableId, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
        } else {
          // Intentar obtener el responsable del estudiante
          if (matriculaData.estudianteId) {
            const responsable = await getStudentParent(matriculaData.estudianteId);
            if (responsable) {
              setResponsableActual(responsable);
              setFilteredResponsables([responsable]);
              form.setValue("responsableId", responsable.id, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
            } else {
              // Buscar en la lista de responsables
              const selectedResponsable = responsables.find(r => r.id === matriculaData.responsableId);
              if (selectedResponsable) {
                setResponsableActual(selectedResponsable);
                setFilteredResponsables([selectedResponsable]);
                form.setValue("responsableId", selectedResponsable.id, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
              } else {
                // Si no se encuentra el responsable, crear uno temporal con solo el ID
                const tempResponsable = {
                  id: matriculaData.responsableId,
                  name: `Responsable ID: ${matriculaData.responsableId}`
                };
                setResponsableActual(tempResponsable);
                setFilteredResponsables([tempResponsable]);
                form.setValue("responsableId", matriculaData.responsableId, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
              }
            }
          }
        }
      }

      setInitialLoad(false);
    };

    if (!loadingNiveles && !loadingPadres && !loadingEstudiantes) {
      initializeForm();
    }
  }, [matriculaData, nivelesAcademicos, loadingNiveles, loadingPadres, loadingEstudiantes, responsables, form]);

  // Student change effect
  useEffect(() => {
    if (!initialLoad) {
      loadResponsable(estudianteId);
    }
  }, [estudianteId, initialLoad, loadResponsable]);
  
  // Effect to preserve responsable when responsables list changes
  useEffect(() => {
    // Si tenemos un responsable actual y la lista de responsables cambia,
    // asegurarnos de que el responsable actual siga seleccionado
    if (responsableActual && form.getValues("responsableId")) {
      const currentResponsableId = form.getValues("responsableId");
      if (currentResponsableId === responsableActual.id) {
        // Asegurarse de que el responsable actual esté en la lista filtrada
        if (!filteredResponsables.some(r => r.id === responsableActual.id)) {
          setFilteredResponsables([responsableActual]);
        }
      }
    }
  }, [responsables, responsableActual, form, filteredResponsables]);

  // Level change effect
  useEffect(() => {
    if (!nivelSeleccionado || initialLoad) return;

    const currentGradoId = form.getValues("gradoId");
    const currentNivelAcademicoId = form.getValues("nivelAcademicoId");

    const gradoValido = gradosUnicos.some(g => g.id === currentGradoId);
    
    if (!gradoValido) {
      form.setValue("gradoId", "");
      form.setValue("nivelAcademicoId", "");
      setGradoSeleccionado("");
    } else {
      const seccionValida = seccionesFiltradas.some(s => s.id === currentNivelAcademicoId);
      if (!seccionValida) {
        form.setValue("nivelAcademicoId", "");
      }
    }
  }, [nivelSeleccionado, gradosUnicos, seccionesFiltradas, initialLoad, form]);

  // Render
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <ErrorDisplay fieldErrors={fieldErrors} error={error} />

        {/* Form fields */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">Información de Matrícula</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student field */}
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
                          placeholder={loadingEstudiantes ? "Cargando..." : "Seleccione estudiante"}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {estudiantes?.map((e) => (
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

            {/* Level selection */}
            <div>
              <Label className="font-medium text-sm flex items-center gap-2">
                <School className="h-4 w-4" />
                Nivel educativo <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select
                value={nivelSeleccionado || ""}
                onValueChange={setNivelSeleccionado}
              >
                <SelectTrigger className="focus:ring-2 focus:ring-primary focus:ring-offset-1">
                  <SelectValue placeholder="Seleccione nivel" />
                </SelectTrigger>
                <SelectContent>
                  {niveles.length > 0 ? (
                    niveles.map((nivel) => (
                      <SelectItem key={nivel} value={nivel}>
                        {nivel}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="sin" disabled>
                      {loadingNiveles2 ? "Cargando niveles..." : "No hay niveles disponibles"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Grade selection */}
            <FormField
              control={form.control}
              name="gradoId"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel className="font-medium text-sm flex items-center gap-2">
                    <Bookmark className="h-4 w-4" />
                    Grado <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      setGradoSeleccionado(value);
                      field.onChange(value);
                      // Asegurarse de que el valor se actualice correctamente en el formulario
                      form.setValue("gradoId", value, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                      form.setValue("nivelAcademicoId", "");
                    }}
                    value={gradoSeleccionado || field.value || ""}
                    disabled={!nivelSeleccionado || loadingNiveles}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full focus:ring-2 focus:ring-primary focus:ring-offset-1">
                        <SelectValue placeholder="Seleccione grado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {gradosUnicos.map((grado) => (
                        <SelectItem key={grado.id} value={grado.id}>
                          {grado.nombre}
                        </SelectItem>
                      ))}
                      {gradosUnicos.length === 0 && nivelSeleccionado && (
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

            {/* Section selection */}
            <FormField
              control={form.control}
              name="nivelAcademicoId"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel className="font-medium text-sm flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    Sección <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("nivelAcademicoId", value, { shouldValidate: true });
                    }}
                    value={field.value || ""}
                    disabled={!gradoSeleccionado || seccionesFiltradas.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full focus:ring-2 focus:ring-primary focus:ring-offset-1">
                        <SelectValue placeholder="Seleccione sección" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {seccionesFiltradas.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          Sección {item.seccion}
                        </SelectItem>
                      ))}
                      {seccionesFiltradas.length === 0 && gradoSeleccionado && (
                        <div className="py-2 px-2 text-sm text-gray-500">
                          No hay secciones disponibles para este grado
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Academic year field */}
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

            {/* Responsible field */}
            <FormField
              control={form.control}
              name="responsableId"
              render={({ field }) => {
                // Buscar el nombre del responsable seleccionado para mostrar
                const selectedResponsable = responsableActual || 
                  filteredResponsables?.find(r => r.id === field.value) ||
                  (matriculaData?.responsableId && matriculaData?.responsableNombre ? 
                    { id: matriculaData.responsableId, name: matriculaData.responsableNombre } : null);
                
                // Asegurarse de que el valor esté establecido en el formulario
                React.useEffect(() => {
                  if (selectedResponsable && !field.value) {
                    field.onChange(selectedResponsable.id);
                  }
                }, [selectedResponsable, field]);
                
                return (
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormLabel className="font-medium text-sm flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Responsable <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <div className="relative">
                      {/* Mostrar el nombre del responsable directamente si está seleccionado */}
                      {selectedResponsable && (
                        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center px-3 pointer-events-none">
                          {selectedResponsable.name}
                        </div>
                      )}
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("responsableId", value, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                          const newSelected = filteredResponsables.find(r => r.id === value);
                          if (newSelected) {
                            setResponsableActual(newSelected);
                          }
                        }}
                        value={field.value || ""}
                        disabled={loadingPadres}
                      >
                        <FormControl>
                          <SelectTrigger className={selectedResponsable ? "text-transparent" : ""}>
                            <SelectValue placeholder="Seleccione responsable" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredResponsables?.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage className="text-xs" />
                  </FormItem>
                );
              }}
            />

            {/* Status field */}
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
                    value={field.value?.toLowerCase()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ESTADO_OPTIONS.map((option) => (
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
          </div>
        </div>

        <InfoBanner />

        {/* Action buttons */}
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