"use client"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Droplets, AlertTriangle, Shield, Info } from "lucide-react"

export default function InformacionMedica({ form }) {
  const tipoSangre = form.watch("tipoSangre")
  const alergias = form.watch("alergias")
  const condicionesMedicas = form.watch("condicionesMedicas")

  return (
    <div className="space-y-3">
      {/* Header compacto */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
        <div className="flex items-center gap-2">
          <Info className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          <span className="text-xs text-blue-700 dark:text-blue-300">
            Información confidencial para emergencias médicas
          </span>
        </div>
      </div>

      {/* Grid Bento compacto */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Tipo de Sangre - Card compacta */}
        <div className="lg:col-span-4 bg-card p-3 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-red-500 p-1.5 rounded-lg">
              <Droplets className="h-3 w-3 text-white" />
            </div>
            <h3 className="text-sm font-medium">Tipo Sanguíneo</h3>
          </div>

          <FormField
            control={form.control}
            name="tipoSangre"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-xs font-medium text-muted-foreground">Tipo de Sangre</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-red-600">{tipo}</span>
                          </div>
                          <span className="text-sm">{tipo}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />

                {tipoSangre && (
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200/50">
                    <div className="flex items-center gap-1 text-xs text-red-700 dark:text-red-300">
                      <Shield className="h-3 w-3" />
                      <span>
                        Registrado: <strong>{tipoSangre}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </FormItem>
            )}
          />
        </div>

        {/* Alergias - Card ancha */}
        <div className="lg:col-span-8 bg-card p-3 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-orange-500 p-1.5 rounded-lg">
              <AlertTriangle className="h-3 w-3 text-white" />
            </div>
            <h3 className="text-sm font-medium">Alergias</h3>
          </div>

          <FormField
            control={form.control}
            name="alergias"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-xs font-medium text-muted-foreground">Alergias Conocidas</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Medicamentos, alimentos, sustancias que causen reacciones alérgicas..."
                    className="resize-none h-16 text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />

                {alergias && alergias.trim() && (
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-md border border-orange-200/50">
                    <div className="flex items-start gap-1">
                      <AlertTriangle className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-orange-700 dark:text-orange-300">
                        <div className="font-medium mb-1">Alergias registradas:</div>
                        <div className="bg-white/50 dark:bg-black/20 p-1 rounded text-xs">
                          {alergias.length > 50 ? `${alergias.substring(0, 50)}...` : alergias}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </FormItem>
            )}
          />
        </div>

        {/* Condiciones Médicas - Card completa */}
        <div className="lg:col-span-12 bg-card p-3 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-purple-500 p-1.5 rounded-lg">
              <Heart className="h-3 w-3 text-white" />
            </div>
            <h3 className="text-sm font-medium">Condiciones Médicas</h3>
          </div>

          <FormField
            control={form.control}
            name="condicionesMedicas"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-xs font-medium text-muted-foreground">
                  Condiciones Médicas Relevantes
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Asma, diabetes, epilepsia, medicamentos regulares, tratamientos actuales..."
                    className="resize-none h-18 text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />

                {condicionesMedicas && condicionesMedicas.trim() && (
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-200/50">
                    <div className="flex items-start gap-1">
                      <Heart className="h-3 w-3 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-purple-700 dark:text-purple-300">
                        <div className="font-medium mb-1">Condiciones registradas:</div>
                        <div className="bg-white/50 dark:bg-black/20 p-1 rounded text-xs">
                          {condicionesMedicas.length > 80
                            ? `${condicionesMedicas.substring(0, 80)}...`
                            : condicionesMedicas}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Resumen compacto */}
      {(tipoSangre || alergias?.trim() || condicionesMedicas?.trim()) && (
        <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg border border-green-200/50">
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3 text-green-600 dark:text-green-400" />
            <span className="text-xs text-green-700 dark:text-green-300">
              Información médica registrada y disponible para emergencias
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
