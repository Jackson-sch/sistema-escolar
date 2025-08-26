"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import FormDatePicker from "@/components/reutilizables/Datepicker";
import AlertError from "@/components/reutilizables/Alerts";
import { handleOnlyNumbers } from "@/utils/utils";
import { EstadoAdministrativo } from "@/components/EstadoUsuarios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Definimos los roles disponibles localmente (actualizado según schema.prisma)
const ROLES = {
  administrativo: "administrativo"
  // El rol "director" ha sido eliminado del enum Role en schema.prisma
};

// Cargos definidos exactamente como en el enum Cargo de Prisma
const CARGOS = {
  ninguno: "ninguno",
  administrador: "administrador",
  asistente: "asistente",
  auxiliar: "auxiliar",
  director: "director",
  secretaria: "secretaria",
  contador: "contador",
  coordinador: "coordinador",
  mantenimiento: "mantenimiento",
  subdirector: "subdirector",
  coordinador_academico: "coordinador_academico",
  coordinador_tutoria: "coordinador_tutoria",
  psicologia: "psicologia",
  enfermeria: "enfermeria"
};
import administrativoSchema from "@/lib/validaciones/schemas/administrativo-schema";
import {
  registerAdministrativo,
  updateAdministrativo,
} from "@/action/administrativo/administrativo";
import {
  User,
  Mail,
  Calendar,
  Phone,
  MapPin,
  IdCard,
  Briefcase,
  Building,
  GraduationCap,
  Heart,
  Home,
  Globe,
  FileText,
  User2,
  BookOpen,
  Loader2,
  ChevronDown,
  ChevronUp,
  UserCog,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


export default function PersonalFormulario({
  administrativoData, // Mantenemos el nombre para compatibilidad con código existente
  institucionId = "",
  onSuccess,
}) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [activeSection, setActiveSection] = useState("essential"); // "essential" o "optional"
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(administrativoSchema),
    defaultValues: {
      // Información Personal Básica (Obligatoria)
      name: administrativoData?.name || "",
      apellidoPaterno: administrativoData?.apellidoPaterno || "",
      apellidoMaterno: administrativoData?.apellidoMaterno || "",
      dni: administrativoData?.dni || "",
      email: administrativoData?.email || "",
      telefono: administrativoData?.telefono || "",

      // Información Laboral (Obligatoria)
      role: administrativoData?.role || "administrativo",
      cargo: administrativoData?.cargo || "",
      area: administrativoData?.area || "",
      fechaIngreso: administrativoData?.fechaIngreso ? new Date(administrativoData.fechaIngreso) : new Date(),
      estado: administrativoData?.estado || "activo",

      // Acceso al Sistema (solo para nuevos registros)
      password: "",

      // Información Personal Adicional (Opcional)
      fechaNacimiento: administrativoData?.fechaNacimiento ? new Date(administrativoData.fechaNacimiento) : null,
      sexo: administrativoData?.sexo || null,
      estadoCivil: administrativoData?.estadoCivil || null,
      nacionalidad: administrativoData?.nacionalidad || "PERUANA",

      // Información de Contacto (Opcional)
      telefonoEmergencia: administrativoData?.telefonoEmergencia || null,
      direccion: administrativoData?.direccion || null,
      distrito: administrativoData?.distrito || null,
      provincia: administrativoData?.provincia || null,
      departamento: administrativoData?.departamento || null,
      ubigeo: administrativoData?.ubigeo || null,

      // Información Profesional (Opcional)
      titulo: administrativoData?.titulo || null,
      numeroContrato: administrativoData?.numeroContrato || null,
      fechaContratacion: administrativoData?.fechaContratacion ? new Date(administrativoData.fechaContratacion) : null,
      fechaSalida: administrativoData?.fechaSalida ? new Date(administrativoData.fechaSalida) : null,

      // Campos automáticos
      role: administrativoData?.role || "administrativo",
      institucionId: administrativoData?.institucionId || institucionId || "",
    },
  });

  async function onSubmit(data) {
    console.log("data a enviar", data);
    setIsLoading(true);
    setError("");
    try {
      // Formatear fechas para envío
      const formattedData = {
        ...data,
        institucionId, // Aseguramos que se incluya el institucionId
        fechaNacimiento: data.fechaNacimiento?.toISOString(),
        fechaIngreso: data.fechaIngreso?.toISOString(),
        fechaContratacion: data.fechaContratacion?.toISOString(),
        fechaSalida: data.fechaSalida?.toISOString(),
      };

      console.log("formattedData con institucionId:", formattedData);

      const response = administrativoData
        ? await updateAdministrativo({
          id: administrativoData.id,
          ...formattedData,
        })
        : await registerAdministrativo({ ...formattedData });

      if (response.success) {
        toast({
          title: administrativoData
            ? "¡Actualización exitosa!"
            : "¡Registro exitoso!",
          description: administrativoData
            ? "El personal ha sido actualizado correctamente"
            : "El personal ha sido creado correctamente",
        });
        form.reset();
        router.refresh();
        onSuccess && onSuccess();
      } else {
        // Manejar errores de campo específicos
        if (response.errors) {
          if (Array.isArray(response.errors)) {
            // Si es un array de errores
            const newFieldErrors = {};
            response.errors.forEach((error) => {
              newFieldErrors[error.field] = error.message;
              form.setError(error.field, { message: error.message });
            });
            setFieldErrors(newFieldErrors);
          } else {
            // Si es un string o un objeto simple
            setError(typeof response.errors === 'string' ? response.errors : 'Error al procesar el formulario');
          }
        } else {
          setError("Ha ocurrido un error al procesar la solicitud");
        }
      }
    } catch (error) {
      setError(
        error.message ||
        "Hubo un error interno del servidor. Por favor, inténtelo nuevamente."
      );
      toast({
        title: "Error",
        description:
          error.message ||
          "Hubo un error interno del servidor. Por favor, inténtelo nuevamente.",
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
      router.push("/usuarios/administrativos");
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {error && <AlertError error={error} />}
          {Object.keys(fieldErrors).map((field) => (
            <p key={field} className="text-xs text-red-500">
              {fieldErrors[field]}
            </p>
          ))}
          {administrativoData && (
            <input
              type="hidden"
              {...form.register("id")}
              value={administrativoData.id}
            />
          )}
          {/* El campo de rol ahora se selecciona en el formulario */}

          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold">
                {administrativoData ? "Editar Personal" : "Registrar Personal"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Complete el formulario para {administrativoData ? "actualizar" : "registrar"} personal administrativo o directivo
              </p>
            </div>
          </div>

          {/* SECCIÓN 1: CAMPOS ESENCIALES */}
          <div className="space-y-6 bg-green-50 p-4 rounded-md border border-green-200 mb-6">
            <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
              <User2 className="h-5 w-5" />
              Información Personal Básica <span className="text-xs font-normal text-green-600">(Obligatorio)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nombres <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Juan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apellidoPaterno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Apellido Paterno <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apellidoMaterno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Apellido Materno <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="García" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dni"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <IdCard className="h-4 w-4" />
                      DNI <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="12345678"
                        maxLength={8}
                        {...field}
                        onInput={(e) => handleOnlyNumbers(e, 8)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Correo electrónico <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="usuario@ejemplo.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Teléfono <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="987654321"
                        maxLength={9}
                        {...field}
                        onInput={(e) => handleOnlyNumbers(e, 9)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* SECCIÓN 2: INFORMACIÓN LABORAL (OBLIGATORIA) */}
          <div className="space-y-6 bg-green-50 p-4 rounded-md border border-green-200 mb-6">
            <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2 mb-2">
              <Briefcase className="h-5 w-5" />
              Información Laboral
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campo de rol oculto - siempre se usa "administrativo" */}
              <input
                type="hidden"
                {...form.register("role")}
                value="administrativo"
              />
              <FormField
                control={form.control}
                name="rolDisplay"
                render={() => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <UserCog className="h-4 w-4" />
                      Rol <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        value="Administrativo"
                        disabled
                        className="bg-gray-100"
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      El rol está configurado como administrativo por defecto
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cargo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Cargo <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el cargo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(CARGOS).map(([key, value]) => (
                          <SelectItem key={key} value={value}>
                            {value
                              .split('_')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' ')}
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
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Área <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Recursos Humanos, Contabilidad, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormDatePicker
                form={form}
                name="fechaIngreso"
                label={
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha de ingreso <span className="text-red-500">*</span>
                  </div>
                }
              />
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Estado <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EstadoAdministrativo.map((estado) => (
                          <SelectItem key={estado} value={estado}>
                            {estado.charAt(0).toUpperCase() + estado.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* SECCIÓN 3: ACCESO AL SISTEMA (SOLO PARA NUEVOS REGISTROS) */}
          {!administrativoData && (
            <div className="space-y-6 bg-green-50 p-4 rounded-md border border-green-200 mb-6">
              <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                <User2 className="h-5 w-5" />
                Acceso al Sistema <span className="text-xs font-normal text-green-600">(Obligatorio para nuevos registros)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Contraseña <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormDescription>Mínimo 8 caracteres</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Confirmar Contraseña <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
              </div>
            </div>
          )}

          {/* SECCIONES OPCIONALES USANDO ACCORDION */}
          <div className="mb-6">
            <Accordion type="single" collapsible className="w-full">
              {/* SECCIÓN 4: INFORMACIÓN PERSONAL ADICIONAL */}
              <AccordionItem value="personal-adicional">
                <AccordionTrigger className="bg-blue-50 p-3 rounded-t-md border border-blue-200 hover:bg-blue-100">
                  <div className="flex items-center gap-2 text-blue-800">
                    <User2 className="h-5 w-5" />
                    <span className="text-lg font-semibold">Información Personal Adicional</span>
                    <span className="text-xs font-normal text-blue-600 ml-2">(Opcional)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="bg-blue-50/50 p-4 rounded-b-md border-x border-b border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormDatePicker
                      form={form}
                      name="fechaNacimiento"
                      label={
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Fecha de nacimiento
                        </div>
                      }
                    />
                    <FormField
                      control={form.control}
                      name="sexo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Sexo
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="masculino">Masculino</SelectItem>
                              <SelectItem value="femenino">Femenino</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="estadoCivil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Heart className="h-4 w-4" />
                            Estado Civil
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="soltero">Soltero/a</SelectItem>
                              <SelectItem value="casado">Casado/a</SelectItem>
                              <SelectItem value="viudo">Viudo/a</SelectItem>
                              <SelectItem value="divorciado">Divorciado/a</SelectItem>
                              <SelectItem value="conviviente">Conviviente</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nacionalidad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Nacionalidad
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="PERUANA" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* SECCIÓN 5: INFORMACIÓN DE CONTACTO */}
              <AccordionItem value="contacto" className="mt-2">
                <AccordionTrigger className="bg-blue-50 p-3 rounded-t-md border border-blue-200 hover:bg-blue-100">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Phone className="h-5 w-5" />
                    <span className="text-lg font-semibold">Información de Contacto</span>
                    <span className="text-xs font-normal text-blue-600 ml-2">(Opcional)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="bg-blue-50/50 p-4 rounded-b-md border-x border-b border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="direccion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Dirección
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Av. Principal 123, Lima" {...field} />
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
                          <FormLabel className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Teléfono de Emergencia
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="987654321"
                              maxLength={9}
                              {...field}
                              onInput={(e) => handleOnlyNumbers(e, 9)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="distrito"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            Distrito
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="San Isidro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="provincia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            Provincia
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Lima" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="departamento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            Departamento
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Lima" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ubigeo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Ubigeo
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="150101" maxLength={6} {...field} onInput={(e) => handleOnlyNumbers(e, 6)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* SECCIÓN 6: INFORMACIÓN PROFESIONAL */}
              <AccordionItem value="profesional" className="mt-2">
                <AccordionTrigger className="bg-blue-50 p-3 rounded-t-md border border-blue-200 hover:bg-blue-100">
                  <div className="flex items-center gap-2 text-blue-800">
                    <GraduationCap className="h-5 w-5" />
                    <span className="text-lg font-semibold">Información Profesional</span>
                    <span className="text-xs font-normal text-blue-600 ml-2">(Opcional)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="bg-blue-50/50 p-4 rounded-b-md border-x border-b border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="titulo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Título Profesional
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Licenciado en Administración" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="numeroContrato"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Número de Contrato
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="CONT-2023-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormDatePicker
                      form={form}
                      name="fechaContratacion"
                      label={
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Fecha de Contratación
                        </div>
                      }
                    />
                    <FormDatePicker
                      form={form}
                      name="fechaSalida"
                      label={
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Fecha de Salida
                        </div>
                      }
                      description="(Opcional, solo si ya no labora)"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              variant="outline"
              className="mr-2"
              onClick={handleCancel}
              type="button"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar datos"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
