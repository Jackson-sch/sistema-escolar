"use client"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { handleOnlyNumbers } from "@/utils/utils"
import { FileText, Hash, Building2, GraduationCap, Info, Shield } from "lucide-react"

export default function CodigosOficiales({ form }) {
  const codigoEstudiante = form.watch("codigoEstudiante")
  const codigoSiagie = form.watch("codigoSiagie")

  return (
    <div className="space-y-3">
      {/* Header informativo */}
      <div className="bg-slate-50 dark:bg-slate-900/20 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-2">
          <Info className="h-3 w-3 text-slate-600 dark:text-slate-400" />
          <span className="text-xs text-slate-700 dark:text-slate-300">
            Códigos oficiales para identificación y registro académico
          </span>
        </div>
      </div>

      {/* Grid Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Código Estudiante - Card mediana */}
        <div className="lg:col-span-6 bg-card p-3 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-500 p-1.5 rounded-lg">
              <Hash className="h-3 w-3 text-white" />
            </div>
            <h3 className="text-sm font-medium">Código Interno</h3>
          </div>

          <FormField
            control={form.control}
            name="codigoEstudiante"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-xs font-medium flex items-center gap-2">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-md">
                    <Hash className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  Código Estudiante
                  <span className="text-xs text-muted-foreground font-normal">(Opcional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="EST-2024-001"
                    className="h-9 text-sm font-mono transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
                <div className="text-xs text-muted-foreground">Código asignado por la institución</div>
              </FormItem>
            )}
          />

          {codigoEstudiante && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200/50">
              <div className="flex items-center gap-1 text-xs text-blue-700 dark:text-blue-300">
                <Shield className="h-3 w-3" />
                <span>
                  Código registrado: <strong className="font-mono">{codigoEstudiante}</strong>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Código SIAGIE - Card mediana */}
        <div className="lg:col-span-6 bg-card p-3 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-green-500 p-1.5 rounded-lg">
              <Building2 className="h-3 w-3 text-white" />
            </div>
            <h3 className="text-sm font-medium">SIAGIE</h3>
          </div>

          <FormField
            control={form.control}
            name="codigoSiagie"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-xs font-medium flex items-center gap-2">
                  <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-md">
                    <Building2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  Código SIAGIE
                  <span className="text-xs text-muted-foreground font-normal">(Opcional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="1234567890123456"
                    maxLength={16}
                    className="h-9 text-sm font-mono transition-all duration-200 focus:ring-2 focus:ring-green-500/20"
                    onInput={(e) => handleOnlyNumbers(e, 16)}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
                <div className="text-xs text-muted-foreground">Código del Ministerio de Educación</div>
              </FormItem>
            )}
          />

          {codigoSiagie && (
            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200/50">
              <div className="flex items-center gap-1 text-xs text-green-700 dark:text-green-300">
                <Shield className="h-3 w-3" />
                <span>
                  SIAGIE: <strong className="font-mono">{codigoSiagie}</strong>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Información adicional - Card completa */}
        <div className="lg:col-span-12 bg-muted/30 p-3 rounded-xl border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-1 rounded">
              <FileText className="h-3 w-3 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="text-xs font-medium text-muted-foreground">Información sobre los Códigos</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div className="bg-white/50 dark:bg-black/20 p-2 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Hash className="h-3 w-3 text-blue-600" />
                <span className="font-medium text-blue-700 dark:text-blue-300">Código Estudiante</span>
              </div>
              <ul className="space-y-1 text-xs">
                <li className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                  <span>Identificación interna de la institución</span>
                </li>
                <li className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                  <span>Usado para reportes y seguimiento</span>
                </li>
                <li className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                  <span>Formato libre definido por la IE</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/50 dark:bg-black/20 p-2 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-3 w-3 text-green-600" />
                <span className="font-medium text-green-700 dark:text-green-300">Código SIAGIE</span>
              </div>
              <ul className="space-y-1 text-xs">
                <li className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  <span>Sistema oficial del MINEDU</span>
                </li>
                <li className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  <span>Máximo 16 dígitos numéricos</span>
                </li>
                <li className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  <span>Requerido para certificados oficiales</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Resumen de códigos registrados */}
        {(codigoEstudiante || codigoSiagie) && (
          <div className="lg:col-span-12 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1 rounded">
                <GraduationCap className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h4 className="text-xs font-medium text-emerald-800 dark:text-emerald-200">Códigos Registrados</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {codigoEstudiante && (
                <div className="bg-white/50 dark:bg-black/20 p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Hash className="h-3 w-3 text-blue-600" />
                    <div>
                      <div className="text-xs text-muted-foreground">Código Interno</div>
                      <div className="text-sm font-mono font-semibold text-emerald-700 dark:text-emerald-300">
                        {codigoEstudiante}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {codigoSiagie && (
                <div className="bg-white/50 dark:bg-black/20 p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3 w-3 text-green-600" />
                    <div>
                      <div className="text-xs text-muted-foreground">SIAGIE</div>
                      <div className="text-sm font-mono font-semibold text-emerald-700 dark:text-emerald-300">
                        {codigoSiagie}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
