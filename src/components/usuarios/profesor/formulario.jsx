"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { profesorSchema } from "@/lib/validaciones/schemas/profesor-schema";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { registerProfesor, updateProfesor } from "@/action/profesor/profesor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormDatePicker from "@/components/reutilizables/Datepicker";
import {
  Mail,
  Calendar,
  Phone,
  MapPin,
  School,
  Award,
  CalendarClock,
  Loader2,
  IdCard,
  User,
  Briefcase,
  User2,
  Info,
} from "lucide-react";
import AlertError from "@/components/reutilizables/Alerts";
import { handleOnlyNumbers } from "@/utils/utils";
import { EstadoProfesor } from "@/components/EstadoUsuarios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProfesorFormulario({ profesorData, institucionId, onSuccess }) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(profesorSchema),
    defaultValues: profesorData || {
      name: "",
      email: "",
      dni: "",
      fechaNacimiento: undefined,
      direccion: "",
      telefono: "",
      especialidad: "",
      titulo: "",
      fechaContratacion: undefined,
      estado: "activo",
      sexo: "M",
      tipoContrato: "NOMBRADO",
      role: "profesor",
      institucionId: institucionId || "",
    },
  });

  async function onSubmit(data) {
    setIsLoading(true);
    setError("");
    setFieldErrors({});
    try {
      // Formatear fechas para envío (verificando que existan)
      const formattedData = {
        ...data,
        fechaNacimiento: data.fechaNacimiento ? data.fechaNacimiento.toISOString() : null,
        fechaContratacion: data.fechaContratacion ? data.fechaContratacion.toISOString() : null,
      };

      const response = profesorData
        ? await updateProfesor({ id: profesorData.id, ...formattedData })
        : await registerProfesor({ ...formattedData });

      if (response.success) {
        toast({
          title: profesorData
            ? "¡Actualización exitosa!"
            : "¡Registro exitoso!",
          description: profesorData
            ? "El profesor ha sido actualizado correctamente"
            : "El profesor ha sido creado correctamente",
        });
        form.reset();
        router.refresh();
        onSuccess();
      } else {
        // Manejar errores de campo específicos
        if (response.errors) {
          const newFieldErrors = {};
          // Verificar si errors es un array
          if (Array.isArray(response.errors)) {
            response.errors.forEach((error) => {
              newFieldErrors[error.field] = error.message;
              form.setError(error.field, { message: error.message });
            });
          } else if (typeof response.errors === 'object') {
            // Si es un objeto, iterar sobre sus propiedades
            Object.entries(response.errors).forEach(([field, message]) => {
              newFieldErrors[field] = message;
              form.setError(field, { message });
            });
          }
          setFieldErrors(newFieldErrors);
        } else {
          throw new Error(
            response.error || "Hubo un error al procesar la solicitud"
          );
        }
      }
    } catch (error) {
      console.error("Error in onSubmit:", error);
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
      router.push("/profesor");
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {error && <AlertError error={error} />}
          {Object.keys(fieldErrors).map((field) => (
            <p key={field} className="text-xs text-red-500">
              {fieldErrors[field]}
            </p>
          ))}
          {profesorData && (
            <>
              <input
                type="hidden"
                {...form.register("id")}
                value={profesorData.id}
              />
            </>
          )}
          <input type="hidden" {...form.register("role")} value="profesor" />

          {/* Información personal */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nombres y Apellidos{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Pérez" {...field} />
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
                        {...field}
                        maxLength={8}
                        onInput={(e) => handleOnlyNumbers(e, 8)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
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
              </div>

              <FormField
                control={form.control}
                name="sexo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User2 className="h-4 w-4" />
                      Sexo
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar sexo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculino</SelectItem>
                          <SelectItem value="F">Femenino</SelectItem>
                        </SelectContent>
                      </Select>
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
                      Teléfono
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="987654321"
                        {...field}
                        maxLength={9}
                        onInput={(e) => handleOnlyNumbers(e, 9)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
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
            </div>
          </div>

          {/* Información profesional */}
          <div className="pt-6 space-y-4">
            <h3 className="text-lg font-semibold">Información Profesional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="especialidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <School className="h-4 w-4" />
                      Especialidad
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Matemáticas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Título profesional
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Licenciado en Educación" {...field} />
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
                    <CalendarClock className="h-4 w-4" />
                    Fecha de contratación
                  </div>
                }
              />

              <FormField
                control={form.control}
                name="tipoContrato"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Tipo de contrato
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione tipo de contrato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NOMBRADO">Nombrado</SelectItem>
                        <SelectItem value="CONTRATADO">Contratado</SelectItem>
                        <SelectItem value="PRATICANTE">Practicante</SelectItem>
                        <SelectItem value="SUPLENTE">Suplente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
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
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione el estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EstadoProfesor.map((estado) => (
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

          {/* Información para acceso al sistema - Solo mostrar cuando se crea un nuevo registro */}
          {!profesorData && (
            <div className="pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Información Para Acceso al Sistema</h3>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormDescription>
                        Mínimo 6 caracteres
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <Button variant="outline" className="mr-2" onClick={handleCancel}>
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
