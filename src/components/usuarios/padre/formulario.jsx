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
  Phone,
  MapPin,
  IdCard,
  Briefcase,
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
import AlertError, { AlertInfo } from "@/components/reutilizables/Alerts";

import padreSchema from "@/lib/validaciones/schemas/padre-schema";
import { handleOnlyNumbers } from "@/lib/utils";
import { registerPadre, updatePadre } from "@/action/padre/padre";

export function PadreRegistrationForm({ padreData, institucionId, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(padreSchema),
    defaultValues: padreData || {
      name: "",
      email: padreData?.email || "",
      dni: "",
      direccion: "",
      telefono: "",
      institucionId: institucionId || "",
      ocupacion: "",
      lugarTrabajo: "",
      role: "padre",
      estado: "activo",
    },
  });

  async function onSubmit(data) {
    setIsLoading(true);
    setError("");

    try {
      const formattedData = {
        ...data,
      };
      const response = padreData
        ? await updatePadre({ id: padreData.id, ...formattedData })
        : await registerPadre(formattedData);

      if (response.success) {
        toast({
          title: padreData ? "¡Actualización exitosa!" : "¡Registro exitoso!",
          description: padreData
            ? `Los datos del padre/madre han sido actualizados correctamente.`
            : `El padre/madre ha sido registrado correctamente.`,
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
    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/padre");
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

        {/* Sección de información personal */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">Información Personal</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
            <input type="hidden" {...form.register("role")} value="padre" />

            {/* Campo de nombre */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel className="font-medium text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nombres y Apellidos{" "}
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="María Rodríguez"
                      className="w-full focus:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Campo de DNI */}
            <FormField
              control={form.control}
              name="dni"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel className="font-medium text-sm flex items-center gap-2">
                    <IdCard className="h-4 w-4" />
                    DNI <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="12345678"
                      className="w-full focus:ring-primary"
                      maxLength={8}
                      onInput={(e) => handleOnlyNumbers(e, 8)}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Campo de email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel className="font-medium text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Correo electrónico
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="usuario@ejemplo.com"
                      className="w-full focus:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Teléfono */}
            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel className="font-medium text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Teléfono <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="987654321"
                      className="w-full focus:ring-primary"
                      maxLength={9}
                      onInput={(e) => handleOnlyNumbers(e, 9)}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Dirección */}
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5 sm:col-span-1 lg:col-span-1">
                  <FormLabel className="font-medium text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Dirección <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Av. Principal 123, Lima"
                      className="w-full focus:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Sección para información laboral */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold ">Información Laboral</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
            {/* Campos específicos para padres */}
            <FormField
              control={form.control}
              name="ocupacion"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel className="font-medium text-sm flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Ocupación
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingeniero, Médico, etc."
                      className="w-full focus:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lugarTrabajo"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel className="font-medium text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Lugar de Trabajo
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Empresa ABC"
                      className="w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
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
                <span>{padreData ? "Actualizando..." : "Registrando..."}</span>
              </div>
            ) : padreData ? (
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
