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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import FormDatePicker from "@/components/reutilizables/Datepicker";
import AlertError from "@/components/reutilizables/Alerts";
import { handleOnlyNumbers } from "@/lib/utils";
import { EstadoAdministrativo } from "@/components/EstadoUsuarios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Cargo } from "@prisma/client";
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
} from "lucide-react";

export default function AdministrativoFormulario({
  administrativoData,
  institucionId,
  onSuccess,
}) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(administrativoSchema),
    defaultValues: administrativoData || {
      name: "",
      email: "",
      dni: "",
      fechaNacimiento: undefined,
      direccion: "",
      telefono: "",
      fechaIngreso: undefined,
      cargo: "",
      estado: "activo",
      role: "administrativo",
      institucionId: institucionId || "",
    },
  });

  async function onSubmit(data) {
    setIsLoading(true);
    setError("");
    try {
      // Formatear fechas para envío
      const formattedData = {
        ...data,
        fechaNacimiento: data.fechaNacimiento?.toISOString(),
        fechaIngreso: data.fechaIngreso?.toISOString(),
        fechaSalida: data.fechaSalida?.toISOString(),
      };
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
            ? "El personal administrativo ha sido actualizado correctamente"
            : "El personal administrativo ha sido creado correctamente",
        });
        form.reset();
        router.refresh();
        onSuccess && onSuccess();
      } else {
        // Manejar errores de campo específicos
        if (response.errors && response.errors.length > 0) {
          const newFieldErrors = {};
          response.errors.forEach((error) => {
            newFieldErrors[error.field] = error.message;
            form.setError(error.field, { message: error.message });
          });
          setFieldErrors(newFieldErrors);
        } else {
          setError(response.errors || "Hubo un error al procesar la solicitud");
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
      router.push("/administrativo");
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
          <input
            type="hidden"
            {...form.register("role")}
            value="administrativo"
          />

          <div className="space-y-6 bg-muted/50 p-4 rounded-md">
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
                      Correo electrónico
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
                        maxLength={8}
                        {...field}
                        onInput={(e) => handleOnlyNumbers(e, 8)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

          <div className="pt-6 space-y-4">
            <h3 className="text-lg font-semibold">Información Laboral</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        {Object.values(Cargo).map((cargo) => (
                          <SelectItem key={cargo} value={cargo}>
                            {cargo.charAt(0).toUpperCase() + cargo.slice(1)}
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
                      <MapPin className="h-4 w-4" />
                      Área
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
                    Fecha de ingreso
                  </div>
                }
              />
              <FormDatePicker
                form={form}
                name="fechaSalida"
                label={
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha de salida
                  </div>
                }
                description="(Terminar el cargo)"
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
              {isLoading ? "Guardando..." : "Guardar datos"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
