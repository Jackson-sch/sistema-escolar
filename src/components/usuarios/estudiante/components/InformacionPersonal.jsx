"use client"

import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ComboBoxPadres from "@/components/usuarios/estudiante/ComboBoxPadres"
import FormDatePicker from "@/components/reutilizables/Datepicker"
import { EstadoEstudiante } from "@/components/EstadoUsuarios"
import { handleOnlyNumbers } from "@/lib/utils"
import { User, User2, BadgeIcon as IdCard, Mail, Phone, Calendar, MapPin, GraduationCap, Users } from "lucide-react"

export default function InformacionPersonal({ form }) {
  return (
    <div className="space-y-6">
      <input type="hidden" {...form.register("role")} value="estudiante" />

      {/* Información Básica */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Nombre Completo */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium flex items-center gap-2">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-md">
                    <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  Nombres y Apellidos
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Juan Carlos Pérez García"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Padre/Tutor */}
          <FormField
            control={form.control}
            name="padreId"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium flex items-center gap-2">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-1 rounded-md">
                    <Users className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  Padre/Tutor
                  <span className="text-red-500">*</span>
                </FormLabel>
                <ComboBoxPadres value={field.value} onChange={field.onChange} />
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Documentos e Identificación */}
        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <IdCard className="h-4 w-4" />
            Documentos e Identificación
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* DNI */}
            <FormField
              control={form.control}
              name="dni"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-md">
                      <IdCard className="h-3 w-3 text-green-600 dark:text-green-400" />
                    </div>
                    DNI
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="12345678"
                      className="font-mono transition-all duration-200 focus:ring-2 focus:ring-green-500/20"
                      maxLength={8}
                      onInput={(e) => handleOnlyNumbers(e, 8)}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Sexo */}
            <FormField
              control={form.control}
              name="sexo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1 rounded-md">
                      <User2 className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    Sexo
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Fecha de Nacimiento */}
            <FormField
              control={form.control}
              name="fechaNacimiento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-1 rounded-md">
                      <Calendar className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                    </div>
                    Fecha de Nacimiento
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormDatePicker form={form} name="fechaNacimiento" />
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Información de Contacto
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    <div className="bg-cyan-100 dark:bg-cyan-900/30 p-1 rounded-md">
                      <Mail className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    Correo Electrónico
                    <span className="text-xs text-muted-foreground font-normal">(Opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="estudiante@ejemplo.com"
                      className="transition-all duration-200 focus:ring-2 focus:ring-cyan-500/20"
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
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1 rounded-md">
                      <Phone className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Teléfono
                    <span className="text-xs text-muted-foreground font-normal">(Opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="987 654 321"
                      className="font-mono transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20"
                      maxLength={9}
                      onInput={(e) => handleOnlyNumbers(e, 9)}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Dirección - Span completo */}
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    <div className="bg-rose-100 dark:bg-rose-900/30 p-1 rounded-md">
                      <MapPin className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                    </div>
                    Dirección
                    <span className="text-xs text-muted-foreground font-normal">(Opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Av. Principal 123, Distrito, Provincia, Región"
                      className="transition-all duration-200 focus:ring-2 focus:ring-rose-500/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Estado Académico */}
        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Estado Académico
          </h3>
          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium flex items-center gap-2">
                  <div className="bg-violet-100 dark:bg-violet-900/30 p-1 rounded-md">
                    <GraduationCap className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                  </div>
                  Estado del Estudiante
                  <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EstadoEstudiante.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        <span className="capitalize">{estado.charAt(0).toUpperCase() + estado.slice(1)}</span>
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
      </div>
    </div>
  )
}
