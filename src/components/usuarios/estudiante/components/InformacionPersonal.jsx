import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ComboBoxPadres from "@/components/usuarios/estudiante/ComboBoxPadres";
import { User } from "lucide-react";
import { handleOnlyNumbers } from "@/lib/utils";
import FormDatePicker from "@/components/reutilizables/Datepicker";
import { EstadoEstudiante } from "@/components/EstadoUsuarios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IdCard, Mail, Phone, Calendar, MapPin, GraduationCap } from "lucide-react";

export default function InformacionPersonal({ form }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <h2 className="text-lg font-semibold">Información Personal</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
        <input
          type="hidden"
          {...form.register("role")}
          value="estudiante"
        />

        {/* Campo de selección de padre/tutor */}
        <FormField
          control={form.control}
          name="padreId"
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-1.5">
              <FormLabel className="font-medium text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Padre/Tutor <span className="text-red-500 ml-1">*</span>
              </FormLabel>
              <ComboBoxPadres
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

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
                  placeholder="Juan Pérez"
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
                <span className="text-muted-foreground/60 text-xs font-mono">
                  (Opcional)
                </span>
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

        {/* Fecha de nacimiento */}
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

        {/* Teléfono */}
        <FormField
          control={form.control}
          name="telefono"
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-1.5">
              <FormLabel className="font-medium text-sm flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Teléfono
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

        {/* Campo de estado */}
        <FormField
          control={form.control}
          name="estado"
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-1.5">
              <FormLabel className="font-medium text-sm flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Estado <span className="text-red-500 ml-1">*</span>
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
                  {EstadoEstudiante.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado.charAt(0).toUpperCase() + estado.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                Dirección
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
  )
}
