"use client";

import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

export function DirectorForm({ form }) {
  return (
    <>
      {/* Campos específicos para directores */}
      <FormField
        control={form.control}
        name="cargo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cargo directivo</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cargo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="director">Director</SelectItem>
                <SelectItem value="subdirector">Subdirector</SelectItem>
                <SelectItem value="coordinador_academico">Coordinador Académico</SelectItem>
                <SelectItem value="coordinador_tutoria">Coordinador de Tutoría</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Cargo específico dentro de la dirección
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="titulo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título profesional</FormLabel>
            <FormControl>
              <Input placeholder="Ej: Licenciado en Educación" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="colegioProfesor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Colegio de Profesores</FormLabel>
            <FormControl>
              <Input placeholder="Número de colegiatura" {...field} />
            </FormControl>
            <FormDescription>
              Número de registro en el Colegio de Profesores del Perú
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fechaContratacion"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Fecha de nombramiento</FormLabel>
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
        name="numeroResolucion"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de resolución</FormLabel>
            <FormControl>
              <Input placeholder="Ej: RD-2025-001" {...field} />
            </FormControl>
            <FormDescription>
              Número de resolución de nombramiento como director
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="escalaMagisterial"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Escala Magisterial</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione escala" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="IV">Escala IV</SelectItem>
                <SelectItem value="V">Escala V</SelectItem>
                <SelectItem value="VI">Escala VI</SelectItem>
                <SelectItem value="VII">Escala VII</SelectItem>
                <SelectItem value="VIII">Escala VIII</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Escala magisterial para directores (mínimo escala IV)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
