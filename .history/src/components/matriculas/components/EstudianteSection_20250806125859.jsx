"use client";

import { User, Users } from "lucide-react";
import {
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import ComboBox from "@/components/reutilizables/ComboBox";

export default function EstudianteSection({
  form,
  estudiantes,
  loading,
  onEstudianteChange,
}) {
  const estudianteId = form.watch("estudianteId");

  return (
    <div className="bg-card p-4 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-xl shadow-md">
          <User className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">
            Selección de Estudiante
          </h2>
          <span className="text-xs text-red-500 font-medium">Obligatorio</span>
        </div>
        {estudianteId && (
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        )}
      </div>

      <FormField
        control={form.control}
        name="estudianteId"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-sm font-medium flex items-center gap-2">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-md">
                <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
              Estudiante
              <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <ComboBox
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  onEstudianteChange(value);
                }}
                disabled={loading}
                fetchData={() => Promise.resolve(estudiantes || [])}
                displayField="name"
                valueField="id"
                icon={<User className="h-4 w-4 text-blue-600" />}
                placeholder={
                  loading
                    ? "Cargando estudiantes..."
                    : "Seleccione un estudiante"
                }
                searchPlaceholder="Buscar estudiante..."
                searchFields={["name"]}
                emptyMessage="No se encontraron estudiantes"
                noDataMessage="No hay estudiantes disponibles"
                loadingMessage="Cargando estudiantes..."
                allowClear={true}
                className="h-11"
                width="100%"
              />
            </FormControl>
            <FormMessage className="text-xs" />

            {estudianteId && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50">
                <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                  <Users className="h-3 w-3" />
                  <span>Estudiante seleccionado correctamente</span>
                </div>
              </div>
            )}
          </FormItem>
        )}
      />
    </div>
  );
}
