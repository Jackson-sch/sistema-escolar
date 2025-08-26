"use client"

import { GraduationCap, BookOpen, Users, School } from "lucide-react"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function NivelAcademicoSection({
  form,
  niveles,
  gradosUnicos,
  seccionesFiltradas,
  nivelSeleccionado,
  gradoSeleccionado,
  loading,
  onNivelChange,
  onGradoChange,
}) {
  return (
    <div className="bg-card p-4 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-xl shadow-md">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">Información Académica</h2>
          <span className="text-xs text-red-500 font-medium">Obligatorio</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Nivel */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-1 rounded-md">
              <School className="h-3 w-3 text-purple-600 dark:text-purple-400" />
            </div>
            Nivel educativo
            <span className="text-red-500">*</span>
          </Label>
          <Select value={nivelSeleccionado || ""} onValueChange={onNivelChange} disabled={loading}>
            <SelectTrigger className="h-10 w-full transition-all duration-200 focus:ring-2 focus:ring-purple-500/20">
              <SelectValue placeholder="Seleccione nivel" />
            </SelectTrigger>
            <SelectContent>
              {niveles.map((nivel) => (
                <SelectItem key={nivel} value={nivel}>
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4 text-purple-600" />
                    <span>{nivel}</span>
                  </div>
                </SelectItem>
              ))}
              {niveles.length === 0 && (
                <SelectItem value="no-levels" disabled>
                  {loading ? "Cargando niveles..." : "No hay niveles disponibles"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Grado */}
        <FormField
          control={form.control}
          name="gradoId"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-sm font-medium flex items-center gap-2">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1 rounded-md">
                  <BookOpen className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                </div>
                Grado
                <span className="text-red-500">*</span>
              </FormLabel>
              <Select
                onValueChange={(value) => {
                  onGradoChange(value)
                  field.onChange(value)
                  form.setValue("gradoId", value, { shouldValidate: true })
                  form.setValue("nivelAcademicoId", "")
                }}
                value={gradoSeleccionado || field.value || ""}
                disabled={!nivelSeleccionado || loading}
              >
                <FormControl>
                  <SelectTrigger className="h-10 w-full transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20">
                    <SelectValue placeholder="Seleccione grado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {gradosUnicos.map((grado) => (
                    <SelectItem key={grado.id} value={grado.id}>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-indigo-600" />
                        <span>{grado.nombre}</span>
                      </div>
                    </SelectItem>
                  ))}
                  {gradosUnicos.length === 0 && nivelSeleccionado && (
                    <SelectItem value="no-grades" disabled>
                      No hay grados disponibles para este nivel
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Sección */}
        <FormField
          control={form.control}
          name="nivelAcademicoId"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-sm font-medium flex items-center gap-2">
                <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-md">
                  <Users className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                Sección
                <span className="text-red-500">*</span>
              </FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value)
                  form.setValue("nivelAcademicoId", value, { shouldValidate: true })
                }}
                value={field.value || ""}
                disabled={!gradoSeleccionado || seccionesFiltradas.length === 0}
              >
                <FormControl>
                  <SelectTrigger className="h-10 w-f transition-all duration-200 focus:ring-2 focus:ring-green-500/20">
                    <SelectValue placeholder="Seleccione sección" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {seccionesFiltradas.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <span>Sección {item.seccion}</span>
                      </div>
                    </SelectItem>
                  ))}
                  {seccionesFiltradas.length === 0 && gradoSeleccionado && (
                    <SelectItem value="no-sections" disabled>
                      No hay secciones disponibles para este grado
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>

      {/* Resumen de selección */}
      {nivelSeleccionado && gradoSeleccionado && form.watch("nivelAcademicoId") && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200/50">
          <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-300">
            <GraduationCap className="h-3 w-3" />
            <span>
              Configuración académica completa: <strong>{nivelSeleccionado}</strong> -{" "}
              <strong>{gradosUnicos.find((g) => g.id === gradoSeleccionado)?.nombre}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
