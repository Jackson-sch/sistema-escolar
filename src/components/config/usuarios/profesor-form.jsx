"use client";

import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

export function ProfesorForm({ form }) {
  return (
    <>
      {/* Campos específicos para profesores */}
      <FormField
        control={form.control}
        name="especialidad"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Especialidad</FormLabel>
            <FormControl>
              <Input placeholder="Ej: Matemáticas, Ciencias, etc." {...field} />
            </FormControl>
            <FormDescription>
              Área de especialización del profesor
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
            <FormLabel>Fecha de contratación</FormLabel>
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
        name="tipoContrato"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de contrato</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione tipo de contrato" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="nombrado">Nombrado</SelectItem>
                <SelectItem value="contratado">Contratado</SelectItem>
                <SelectItem value="practicante">Practicante</SelectItem>
                <SelectItem value="suplente">Suplente</SelectItem>
              </SelectContent>
            </Select>
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
                <SelectItem value="I">Escala I</SelectItem>
                <SelectItem value="II">Escala II</SelectItem>
                <SelectItem value="III">Escala III</SelectItem>
                <SelectItem value="IV">Escala IV</SelectItem>
                <SelectItem value="V">Escala V</SelectItem>
                <SelectItem value="VI">Escala VI</SelectItem>
                <SelectItem value="VII">Escala VII</SelectItem>
                <SelectItem value="VIII">Escala VIII</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Escala magisterial para profesores del sector público
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
