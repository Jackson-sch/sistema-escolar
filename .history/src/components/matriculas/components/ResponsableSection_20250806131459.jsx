"use client"

import { UserCheck, Users } from "lucide-react"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ResponsableSection({ form, responsables, loading }) {
  const responsableId = form.watch("responsableId")

  return (
    <div className="bg-card p-4 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-xl shadow-md">
          <UserCheck className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">Responsable</h2>
          <span className="text-xs text-red-500 font-medium">Obligatorio</span>
        </div>
        {responsableId && (
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        )}
      </div>

      <FormField
        control={form.control}
        name="responsableId"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-sm font-medium flex items-center gap-2">
              <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-md">
                <UserCheck className="h-3 w-3 text-green-600 dark:text-green-400" />
              </div>
              Padre/Tutor
              <span className="text-red-500">*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
              <FormControl>
                <SelectTrigger className="h-10  transition-all duration-200 focus:ring-2 focus:ring-green-500/20">
                  <SelectValue placeholder={loading ? "Cargando responsables..." : "Seleccione responsable"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {responsables?.map((responsable) => (
                  <SelectItem key={responsable.id} value={responsable.id}>
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <span>{responsable.name}</span>
                    </div>
                  </SelectItem>
                ))}
                {(!responsables || responsables.length === 0) && !loading && (
                  <SelectItem value="no-responsables" disabled>
                    No hay responsables disponibles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <FormMessage className="text-xs" />

            {responsableId && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200/50">
                <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-300">
                  <Users className="h-3 w-3" />
                  <span>Responsable asignado correctamente</span>
                </div>
              </div>
            )}
          </FormItem>
        )}
      />
    </div>
  )
}
