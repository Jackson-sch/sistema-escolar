"use client";

import React from "react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Save,
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
} from "@/components/ui/form";
import ResponsableSection from "./components/ResponsableSection";
import ConfiguracionSection from "./components/ConfiguracionSection";
import NivelAcademicoSection from "./components/NivelAcademicoSection";
import EstudianteSection from "./components/EstudianteSection";

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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-7xl mx-auto p-6">
        <ErrorDisplay fieldErrors={fieldErrors} error={error} />


        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 mb-8">

          {/* Estudiante Card - Large */}
          <div className="lg:col-span-8">

            <EstudianteSection
              form={form}
              estudiantes={estudiantes}
              loading={loadingEstudiantes}
              onEstudianteChange={(value) => {
                form.setValue("estudianteId", value, { shouldValidate: true });
                loadResponsable(value);
              }}
            />
          </div>

          {/* Quick Info Card - Small */}
          <div className="lg:col-span-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/50">
            <div className="p-6">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
                Estado del Proceso
              </h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                {matriculaData ? "Modo edición activo" : "Nuevo registro en proceso"}
              </p>
            </div>
          </div>

          {/* Nivel Académico Card - Large */}
          <div className="lg:col-span-12">
            <NivelAcademicoSection
              form={form}
              niveles={niveles}
              gradosUnicos={gradosUnicos}
              seccionesFiltradas={seccionesFiltradas}
              nivelSeleccionado={nivelSeleccionado}
              gradoSeleccionado={gradoSeleccionado}
              loading={loadingNiveles}
              onNivelChange={(nivel) => {
                setNivelSeleccionado(nivel);
                setGradoSeleccionado("");
                form.setValue("gradoId", "");
                form.setValue("nivelAcademicoId", "");
              }}
              onGradoChange={(grado) => {
                setGradoSeleccionado(grado);
                form.setValue("gradoId", grado, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                form.setValue("nivelAcademicoId", "");
              }}
            />
          </div>

          {/* Configuración Card - Medium */}
          <div className="lg:col-span-5">
            <ConfiguracionSection
              form={form}
              matriculaData={matriculaData}
            />
          </div>

          {/* Responsable Card - Large */}
          <div className="lg:col-span-7">
            <ResponsableSection
              form={form}
              responsables={filteredResponsables.length > 0 ? filteredResponsables : responsables}
              loading={loadingPadres}
            />
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-muted/20  rounded-t-2xl">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">


              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-medium border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-medium bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 gap-2"
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
                      {matriculaData ? "Actualizar Matrícula" : "Guardar Matrícula"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}