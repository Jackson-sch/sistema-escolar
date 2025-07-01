"use client";

import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

export function CamposComunesForm({ form, esNuevoUsuario = true }) {
  return (
    <>
      {/* Campos comunes para todos los usuarios */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre</FormLabel>
            <FormControl>
              <Input placeholder="Nombre completo" {...field} />
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
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="correo@ejemplo.com" {...field} />
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
            <FormLabel>Apellido Paterno</FormLabel>
            <FormControl>
              <Input placeholder="Apellido paterno" {...field} />
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
            <FormLabel>Apellido Materno</FormLabel>
            <FormControl>
              <Input placeholder="Apellido materno" {...field} />
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
            <FormLabel>DNI</FormLabel>
            <FormControl>
              <Input placeholder="12345678" maxLength={8} {...field} />
            </FormControl>
            <FormDescription>
              Documento Nacional de Identidad (8 dígitos)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fechaNacimiento"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Fecha de nacimiento</FormLabel>
            <DatePicker
              date={field.value ? new Date(field.value) : undefined}
              setDate={(date) => field.onChange(date)}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="sexo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sexo</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="F">Femenino</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="telefono"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Teléfono</FormLabel>
            <FormControl>
              <Input placeholder="999999999" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="direccion"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dirección</FormLabel>
            <FormControl>
              <Input placeholder="Av. Principal 123" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="estado"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estado</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
                <SelectItem value="suspendido">Suspendido</SelectItem>
                <SelectItem value="licencia">En licencia</SelectItem>
                <SelectItem value="vacaciones">En vacaciones</SelectItem>
                <SelectItem value="retirado">Retirado</SelectItem>
                <SelectItem value="jubilado">Jubilado</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Estado actual del usuario en el sistema
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{!esNuevoUsuario ? "Nueva Contraseña (opcional)" : "Contraseña"}</FormLabel>
            <FormControl>
              <Input type="password" placeholder="********" {...field} />
            </FormControl>
            <FormDescription>
              {!esNuevoUsuario ? "Dejar en blanco para mantener la actual" : "Mínimo 6 caracteres"}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Confirmar Contraseña</FormLabel>
            <FormControl>
              <Input type="password" placeholder="********" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
