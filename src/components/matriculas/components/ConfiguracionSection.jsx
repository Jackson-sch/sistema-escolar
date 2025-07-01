"use client"

import { Calendar, Settings, CheckCircle } from "lucide-react"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export default function ConfiguracionSection({ form, matriculaData }) {
  const anioAcademico = form.watch("anioAcademico")
  const estado = form.watch("estado")

  return (
    <div className="bg-card p-4 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-xl shadow-md">
          <Settings className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">Configuración</h2>
          <span className="text-xs text-muted-foreground">Datos adicionales</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Año Académico */}
        <FormField
          control={form.control}
          name="anioAcademico"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-sm font-medium flex items-center gap-2">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-md">
                  <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                Año académico
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="2025"
                  className="h-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                  {...field}
                  onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Estado */}
        <FormField
          control={form.control}
          name="estado"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-sm font-medium flex items-center gap-2">
                <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-md">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                Estado
                <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value?.toLowerCase()}>
                <FormControl>
                  <SelectTrigger className="h-10 transition-all duration-200 focus:ring-2 focus:ring-green-500/20">
                    <SelectValue placeholder="Seleccione estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="activo">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Activa</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="inactivo">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span>Inactiva</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Resumen de configuración */}
        {anioAcademico && estado && (
          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200/50">
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <Calendar className="h-3 w-3" />
                <span>
                  Año: <strong>{anioAcademico}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <div className={`w-2 h-2 rounded-full ${estado === "activo" ? "bg-green-500" : "bg-red-500"}`} />
                <span>
                  Estado: <strong className="capitalize">{estado}</strong>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
