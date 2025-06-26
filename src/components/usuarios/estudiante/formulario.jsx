"use client";

// Paquetes externos
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  User,
  Mail,
  Calendar,
  Phone,
  MapPin,
  IdCard,
  GraduationCap,
} from "lucide-react";

// Alias de módulos
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import FormDatePicker from "@/components/reutilizables/Datepicker";
import { EstadoEstudiante } from "@/components/EstadoUsuarios";
import { registerStudent, updateStudent } from "@/action/estudiante/estudiante";
import estudianteSchema from "@/lib/validaciones/schemas/students-schema";
import { handleOnlyNumbers } from "@/lib/utils";
import ComboboxPadres from "@/components/usuarios/estudiante/ComboBoxPadres";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import InformacionPersonal from "./components/InformacionPersonal";

// Constantes para los niveles
const NIVELES = [
  { value: "INICIAL", label: "INICIAL" },
  { value: "PRIMARIA", label: "PRIMARIA" },
  { value: "SECUNDARIA", label: "SECUNDARIA" },
];

// Constantes para los grados por nivel
const GRADOS_POR_NIVEL = {
  "INICIAL": [
    { value: "3_ANIOS", label: "3 Años" },
    { value: "4_ANIOS", label: "4 Años" },
    { value: "5_ANIOS", label: "5 Años" },
  ],
  "PRIMARIA": [
    { value: "PRIMERO_PRIMARIA", label: "Primero" },
    { value: "SEGUNDO_PRIMARIA", label: "Segundo" },
    { value: "TERCERO_PRIMARIA", label: "Tercero" },
    { value: "CUARTO_PRIMARIA", label: "Cuarto" },
    { value: "QUINTO_PRIMARIA", label: "Quinto" },
    { value: "SEXTO_PRIMARIA", label: "Sexto" },
  ],
  "SECUNDARIA": [
    { value: "PRIMERO_SECUNDARIA", label: "Primero" },
    { value: "SEGUNDO_SECUNDARIA", label: "Segundo" },
    { value: "TERCERO_SECUNDARIA", label: "Tercero" },
    { value: "CUARTO_SECUNDARIA", label: "Cuarto" },
    { value: "QUINTO_SECUNDARIA", label: "Quinto" },
  ],
};

export function StudentRegistrationForm({ userData, institucionId, onSuccess }) {
  console.log("Datos del estudiante a Actualizar", userData)

  console.log("grado", userData?.nivelAcademico?.grado)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
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

        // Campos académicos - importante para la edición
        // Para el nivel, determinamos el tipo de nivel (INICIAL, PRIMARIA, SECUNDARIA)
        nivel: userData.nivelAcademico?.nivel || "",
        // Para el grado, usamos el valor del grado del nivel académico
        grado: userData.nivelAcademico?.grado || "",
        // Guardamos el ID del nivel académico para referencia
        nivelAcademicoId: userData.nivelAcademico?.id || userData.nivelAcademicoId || "",
        turno: userData.turno || "",

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
      nivelAcademicoId: "",
      estado: "activo",
      padreId: "",
      institucionId: institucionId || "",
      // Campos académicos
      nivel: "",
      grado: "",
      turno: "",
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

  // Obtener el nivel seleccionado actualmente en el formulario
  const nivelValue = form.watch("nivel");
  console.log("Valor actual del campo nivel:", nivelValue);
  const selectedNivel = NIVELES?.find((nivel) => nivel.value === nivelValue);
  console.log("Nivel seleccionado:", selectedNivel);
  // Obtener el grado seleccionado actualmente en el formulario
  const gradoValue = form.watch("grado");
  console.log("Valor actual del campo grado:", gradoValue);
  const selectedGrado = selectedNivel?.grados?.find((grado) => grado.value === gradoValue);
  console.log("Grado seleccionado:", selectedGrado);

  // Función para normalizar el valor del grado según el formato esperado en el selector
  const normalizarGrado = (gradoOriginal) => {
    if (!gradoOriginal) return "";

    // Convertir a mayúsculas para comparación
    const gradoUpper = gradoOriginal.toUpperCase();

    // Mapeo de posibles valores del backend a valores del selector
    const mapeoGrados = {
      // Para inicial
      "3": "3_ANIOS",
      "3 AÑOS": "3_ANIOS",
      "3_AÑOS": "3_ANIOS",
      "3AÑOS": "3_ANIOS",
      "4": "4_ANIOS",
      "4 AÑOS": "4_ANIOS",
      "4_AÑOS": "4_ANIOS",
      "4AÑOS": "4_ANIOS",
      "5": "5_ANIOS",
      "5 AÑOS": "5_ANIOS",
      "5_AÑOS": "5_ANIOS",
      "5AÑOS": "5_ANIOS",

      // Para primaria y secundaria
      "1": "PRIMERO",
      "1RO": "PRIMERO",
      "PRIMERO": "PRIMERO",
      "2": "SEGUNDO",
      "2DO": "SEGUNDO",
      "SEGUNDO": "SEGUNDO",
      "3": "TERCERO",
      "3RO": "TERCERO",
      "TERCERO": "TERCERO",
      "4": "CUARTO",
      "4TO": "CUARTO",
      "CUARTO": "CUARTO",
      "5": "QUINTO",
      "5TO": "QUINTO",
      "QUINTO": "QUINTO",
      "6": "SEXTO",
      "6TO": "SEXTO",
      "SEXTO": "SEXTO",
    };

    // Buscar en el mapeo o devolver el valor original
    return mapeoGrados[gradoUpper] || gradoOriginal;
  };

  // Determinar el tipo de nivel (INICIAL, PRIMARIA, SECUNDARIA) para acceder a los grados
  // Usamos directamente el valor del nivel seleccionado
  let nivelTipo = "";
  if (selectedNivel) {
    nivelTipo = selectedNivel.value || "";
    console.log("Tipo de nivel seleccionado:", nivelTipo);
  }

  const isBecario = form.watch("becario");

  useEffect(() => {
    // Obtener los valores por defecto basados en userData
    const defaultValues = getDefaultValues();
    console.log("Valores por defecto para el formulario:", defaultValues);
    console.log("Nivel académico ID:", userData?.nivelAcademicoId);
    console.log("Nivel académico objeto:", userData?.nivelAcademico);

    // Resetear el formulario con los valores por defecto
    form.reset(defaultValues);
  }, [userData]);

  async function onSubmit(data) {
    console.log("datos del formulario", data)
    setIsLoading(true);
    setError("");
    setFieldErrors({});
    try {
      // Asegurar que institucionId esté presente en los datos
      if (!data.institucionId && institucionId) {
        data.institucionId = institucionId;
      }

      // Asegurar que nivelAcademicoId esté presente
      if (!data.nivelAcademicoId && data.nivel) {
        data.nivelAcademicoId = data.nivel;
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
        nivelAcademicoId: data.nivelAcademicoId,
        estado: data.estado || "activo",
        padreId: data.padreId,
        institucionId: data.institucionId,
        role: "estudiante",

        // Campos académicos
        turno: data.turno,

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
      if (data.grado) camposAdicionales.grado = data.grado;
      if (data.nivel) camposAdicionales.nivel = data.nivel;

      // Solo agregar camposAdicionales si hay datos
      if (Object.keys(camposAdicionales).length > 0) {
        // Aquí podríamos usar un campo JSON en el futuro si es necesario
        console.log("Campos adicionales que no están en el modelo:", camposAdicionales);
      }

      console.log("Datos formateados a enviar:", formattedData);

      if (!formattedData.fechaNacimiento) {
        setError("La fecha de nacimiento es obligatoria");
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
          } else if (response.error) {
            setError(response.error);
          }
        } else if (response.error) {
          setError(response.error);
        }
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      setError(
        `Hubo un error al procesar el formulario: ${error.message}`
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
    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/estudiantes");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Campo oculto para institucionId */}
        <input
          type="hidden"
          name="institucionId"
          value={institucionId || ""}
          {...form.register("institucionId")}
        />

        {/* Sección de información personal */}
        <InformacionPersonal form={form} />

        {/* Información Académica */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Información Académica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <FormField
              control={form.control}
              name="nivel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nivel *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar nivel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {NIVELES.map((nivel) => (
                        <SelectItem key={nivel.value} value={nivel.value}>
                          {nivel.label}
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
                  <FormLabel>Grado *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    disabled={!selectedNivel}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar grado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectedNivel ? (
                        // Intentamos determinar el tipo de nivel y mostrar los grados correspondientes
                        GRADOS_POR_NIVEL[nivelTipo.toUpperCase()] ? (
                          <>
                            {GRADOS_POR_NIVEL[nivelTipo.toUpperCase()].map((grado) => {
                              // Verificamos si este grado es el que debe estar seleccionado
                              const isSelected = userData?.nivelAcademico?.grado &&
                                normalizarGrado(userData.nivelAcademico.grado) === grado.value;

                              console.log(`Comparando grado ${grado.value} con ${normalizarGrado(userData?.nivelAcademico?.grado || '')}: ${isSelected}`);

                              return (
                                <SelectItem
                                  key={grado.value}
                                  value={grado.value}
                                >
                                  {grado.label}
                                </SelectItem>
                              );
                            })}
                          </>
                        ) : (
                          <SelectItem value="seleecione" disabled>No hay grados disponibles para este nivel</SelectItem>
                        )
                      ) : (
                        <SelectItem value="seleecione" disabled>Seleccione un nivel primero</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
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
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar turno" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MANANA">Mañana</SelectItem>
                      <SelectItem value="TARDE">Tarde</SelectItem>
                      <SelectItem value="NOCHE">Noche</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Sección de información médica */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Información Médica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <FormField
              control={form.control}
              name="tipoSangre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Sangre</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alergias"
              render={({ field }) => (
                <FormItem className="col-span-full md:col-span-2">
                  <FormLabel>Alergias</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describir alergias conocidas (medicamentos, alimentos, etc.)"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condicionesMedicas"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormLabel>Condiciones Médicas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describir condiciones médicas relevantes (asma, diabetes, etc.)"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          </div>
        </div>

        {/* Contacto de Emergencia */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Contacto de Emergencia</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <FormField
              control={form.control}
              name="contactoEmergencia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Contacto *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefonoEmergencia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono de Emergencia *</FormLabel>
                  <FormControl>
                    <Input placeholder="987654321" maxLength={9} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          </div>
        </div>

        {/* Información Socioeconómica */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Información Socioeconómica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <FormField
              control={form.control}
              name="tipoVivienda"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Vivienda</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PROPIA">Propia</SelectItem>
                      <SelectItem value="ALQUILADA">Alquilada</SelectItem>
                      <SelectItem value="FAMILIAR">Familiar</SelectItem>
                      <SelectItem value="OTRO">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="programaSocial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Programa Social</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="QALI_WARMA">Qali Warma</SelectItem>
                      <SelectItem value="JUNTOS">Juntos</SelectItem>
                      <SelectItem value="PENSION_65">Pensión 65</SelectItem>
                      <SelectItem value="CONTIGO">Contigo</SelectItem>
                      <SelectItem value="NINGUNO">Ninguno</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="col-span-full flex flex-wrap gap-6">
              <FormField
                control={form.control}
                name="viveConPadres"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Vive con ambos padres</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transporteEscolar"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Utiliza transporte escolar</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="becario"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Becario</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {isBecario && (
              <FormField
                control={form.control}
                name="tipoBeca"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Tipo de Beca</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo de beca" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EXCELENCIA_ACADEMICA">Excelencia Académica</SelectItem>
                        <SelectItem value="DEPORTIVA">Deportiva</SelectItem>
                        <SelectItem value="ARTISTICA">Artística</SelectItem>
                        <SelectItem value="SOCIOECONOMICA">Socioeconómica</SelectItem>
                        <SelectItem value="HERMANOS">Descuento por Hermanos</SelectItem>
                        <SelectItem value="HIJO_TRABAJADOR">Hijo de Trabajador</SelectItem>
                        <SelectItem value="OTRA">Otra</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

          </div>
        </div>

        {/* Códigos Oficiales */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Códigos Oficiales (Opcional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <FormField
              control={form.control}
              name="codigoEstudiante"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Estudiante</FormLabel>
                  <FormControl>
                    <Input placeholder="Código interno de la institución" {...field} />
                  </FormControl>
                  <FormDescription>
                    Código único asignado por la institución
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="codigoSiagie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código SIAGIE</FormLabel>
                  <FormControl>
                    <Input placeholder="Código del sistema SIAGIE" {...field} />
                  </FormControl>
                  <FormDescription>
                    Código oficial del MINEDU
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

          </div>
        </div>

        {/* Botones de acción */}
        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-end">
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
            className="w-full sm:w-auto px-8 py-2.5 rounded-lg text-sm font-medium bg-primary hover:bg-primary/90"
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
      </form>
    </Form>
  );
}
