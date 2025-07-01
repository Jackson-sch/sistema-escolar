"use client";

import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

export function AdministrativoForm({ form }) {
  return (
    <>
      {/* Campos específicos para administrativos */}
      <FormField
        control={form.control}
        name="cargo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cargo</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cargo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="administrador">Administrador</SelectItem>
                <SelectItem value="secretaria">Secretaria</SelectItem>
                <SelectItem value="contador">Contador</SelectItem>
                <SelectItem value="asistente">Asistente</SelectItem>
                <SelectItem value="auxiliar">Auxiliar</SelectItem>
                <SelectItem value="psicologia">Psicología</SelectItem>
                <SelectItem value="enfermeria">Enfermería</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="coordinador">Coordinador General</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Cargo específico dentro de la institución
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="area"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Área</FormLabel>
            <FormControl>
              <Input placeholder="Ej: Administración, Secretaría, etc." {...field} />
            </FormControl>
            <FormDescription>
              Área o departamento donde trabaja
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fechaIngreso"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Fecha de ingreso</FormLabel>
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
        name="numeroContrato"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de contrato</FormLabel>
            <FormControl>
              <Input placeholder="Ej: CONT-2025-001" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
