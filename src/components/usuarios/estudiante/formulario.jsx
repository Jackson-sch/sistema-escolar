"use client";

// Paquetes externos
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  FileText,
  User,
  Phone,
  Home,
  Heart,
} from "lucide-react";

// Alias de módulos
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
} from "@/components/ui/form";
import { registerStudent, updateStudent } from "@/action/estudiante/estudiante";
import estudianteSchema from "@/lib/validaciones/schemas/students-schema";
import InformacionPersonal from "./components/InformacionPersonal";
import InformacionMedica from "./components/InformacionMedica";
import ContactoEmergencia from "./components/ContactoEmergencia";
import InformacionSocioeconomica from "./components/InformacionSocioeconomica";
import CodigosOficiales from "./components/CodigosOficiales";


export function StudentRegistrationForm({ userData, institucionId, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Definir valores por defecto solo para estudiante
  const getDefaultValues = () => {
    // Si estamos en modo edición
    if (userData) {
      console.log("Preparando valores para edición:", userData);
      return {
        // Datos personales
        name: userData.name || "",
        email: userData.email || "",
        dni: userData.dni || "",
        fechaNacimiento: userData.fechaNacimiento ? new Date(userData.fechaNacimiento) : undefined,
        direccion: userData.direccion || "",
        telefono: userData.telefono || "",
        estado: userData.estado || "activo",
        padreId: userData.padresTutores?.[0]?.padreTutorId || "",
        institucionId: userData.institucion?.id || institucionId || "",

        // Campos médicos
        tipoSangre: userData.tipoSangre || "",
        alergias: userData.alergias || "",
        condicionesMedicas: userData.condicionesMedicas || "",
        contactoEmergencia: userData.contactoEmergencia || "",
        telefonoEmergencia: userData.telefonoEmergencia || "",

        // Campos socioeconómicos
        viveConPadres: userData.viveConPadres || false,
        tipoVivienda: userData.tipoVivienda || "",
        serviciosBasicos: userData.serviciosBasicos || "",
        transporteEscolar: userData.transporteEscolar || false,
        becario: userData.becario || false,
        tipoBeca: userData.tipoBeca || "",
        programaSocial: userData.programaSocial || "",

        // Códigos adicionales
        codigoEstudiante: userData.codigoEstudiante || "",
        codigoSiagie: userData.codigoSiagie || "",

        // Rol fijo
        role: "estudiante",
      };
    }

    // Si estamos en modo creación
    return {
      name: "",
      email: "",
      dni: "",
      fechaNacimiento: undefined,
      direccion: "",
      telefono: "",
      estado: "activo",
      padreId: "",
      institucionId: institucionId || "",
      // Otros campos
      procedencia: "",
      esPrimeraVez: false,
      esRepitente: false,
      tipoSangre: "",
      alergias: "",
      condicionesMedicas: "",
      contactoEmergencia: "",
      telefonoEmergencia: "",
      viveConPadres: false,
      tipoVivienda: "",
      serviciosBasicos: "",
      transporteEscolar: false,
      becario: false,
      tipoBeca: "",
      programaSocial: "",
      // Campos de códigos adicionales
      codigoEstudiante: "",
      codigoSiagie: "",
      // Rol fijo
      role: "estudiante",
    };
  };

  const form = useForm({
    resolver: zodResolver(estudianteSchema),
    defaultValues: getDefaultValues(),
  });

  const isBecario = form.watch("becario");

  useEffect(() => {
    const defaultValues = getDefaultValues();
    form.reset(defaultValues);
  }, [userData]);

  async function onSubmit(data) {
    setIsLoading(true);
    try {
      // Asegurar que institucionId esté presente en los datos
      if (!data.institucionId && institucionId) {
        data.institucionId = institucionId;
      }


      // Crear un objeto con todos los campos que el backend espera
      // Utilizando los campos existentes en el modelo User de Prisma
      const formattedData = {
        // Campos básicos
        name: data.name,
        email: data.email || "",
        dni: data.dni,
        fechaNacimiento: data.fechaNacimiento?.toISOString(),
        direccion: data.direccion,
        telefono: data.telefono,
        estado: data.estado || "activo",
        padreId: data.padreId,
        institucionId: data.institucionId,
        role: "estudiante",

        // Campos médicos
        tipoSangre: data.tipoSangre,
        alergias: data.alergias,
        condicionesMedicas: data.condicionesMedicas,
        contactoEmergencia: data.contactoEmergencia,
        telefonoEmergencia: data.telefonoEmergencia,

        // Información socioeconómica
        viveConPadres: data.viveConPadres,
        tipoVivienda: data.tipoVivienda,
        serviciosBasicos: data.serviciosBasicos,
        transporteEscolar: data.transporteEscolar,
        becario: data.becario,
        tipoBeca: data.tipoBeca,
        programaSocial: data.programaSocial,

        // Códigos adicionales
        codigoEstudiante: data.codigoEstudiante,
        codigoSiagie: data.codigoSiagie
      };

      // Para los campos que no existen en el modelo, usamos un campo JSON
      const camposAdicionales = {};

      // Agregar campos que no existen en el modelo User
      if (data.procedencia) camposAdicionales.procedencia = data.procedencia;
      if (data.esPrimeraVez !== undefined) camposAdicionales.esPrimeraVez = data.esPrimeraVez;
      if (data.esRepitente !== undefined) camposAdicionales.esRepitente = data.esRepitente;
      // Ya no necesitamos guardar el grado como campo adicional, ya que está incluido en el nivel académico

      // Solo agregar camposAdicionales si hay datos
      if (Object.keys(camposAdicionales).length > 0) {
        // Aquí podríamos usar un campo JSON en el futuro si es necesario
        console.log("Campos adicionales que no están en el modelo:", camposAdicionales);
      }


      // Validar campos obligatorios
      if (!formattedData.fechaNacimiento) {
        setIsLoading(false);
        return;
      }

      const response = userData
        ? await updateStudent({ id: userData.id, ...formattedData })
        : await registerStudent(formattedData);

      if (response.success) {
        toast({
          title: userData ? "¡Actualización exitosa!" : "¡Registro exitoso!",
          description: userData
            ? `Los datos del estudiante han sido actualizados correctamente.`
            : `El estudiante ha sido registrado correctamente.`,
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
        } else if (response.error) {
          setError(response.error);
        }
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
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
    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/estudiantes");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Campo oculto para institucionId */}
        <input type="hidden" name="institucionId" value={institucionId || ""} {...form.register("institucionId")} />

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Información Personal - Card Grande */}
          <div className="lg:col-span-12 bg-card p-4 rounded-2xl border border-border shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-500 p-2 rounded-xl">
                <User className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Información Personal <span className="text-xs text-muted-foreground">(Obligatorio)</span></h2>
            </div>
            <InformacionPersonal form={form} />
          </div>

          {/* Información Médica - Card Ancha */}
          <div className="lg:col-span-7 bg-card p-4 rounded-2xl border border-border shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-red-500 p-2 rounded-xl">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Información Médica <span className="text-xs text-muted-foreground">(Opcional)</span></h2>
            </div>
            <InformacionMedica form={form} />
          </div>

          {/* Contacto de Emergencia - Card Mediana */}
          <div className="lg:col-span-5 bg-card p-4 rounded-2xl border border-border shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-orange-500 p-2 rounded-xl">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Contacto de Emergencia <span className="text-xs text-muted-foreground">(Importante)</span></h2>
            </div>
            <ContactoEmergencia form={form} />
          </div>

          {/* Información Socioeconómica - Card Grande */}
          <div className="lg:col-span-8 bg-card p-4 rounded-2xl border border-border shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-green-500 p-2 rounded-xl">
                <Home className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Información Socioeconómica <span className="text-xs text-muted-foreground">(Opcional)</span></h2>
            </div>
            <InformacionSocioeconomica form={form} isBecario={isBecario} />
          </div>

          {/* Códigos Oficiales - Card Mediana */}
          <div className="lg:col-span-4 bg-card p-4 rounded-2xl border border-border shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-slate-500 p-2 rounded-xl">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Códigos</h2>
            </div>
            <CodigosOficiales form={form} />
          </div>
        </div>

        {/* Botones de acción - Sticky Footer */}
        <div className="sticky bottom-0 bg-card  backdrop-blur-sm border-t border-border p-4 rounded-t-2xl shadow-lg">
          <div className="flex flex-col sm:flex-row gap-3 justify-end max-w-7xl mx-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="px-6 py-2 rounded-xl bg-transparent cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              className="px-6 py-2 rounded-xl cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>{userData ? "Actualizando..." : "Registrando..."}</span>
                </div>
              ) : userData ? (
                "Actualizar"
              ) : (
                "Registrar"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
