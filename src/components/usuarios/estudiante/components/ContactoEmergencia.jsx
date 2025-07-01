"use client"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Phone, User, AlertCircle, Shield, Clock } from "lucide-react"

export default function ContactoEmergencia({ form }) {
  const contactoEmergencia = form.watch("contactoEmergencia")
  const telefonoEmergencia = form.watch("telefonoEmergencia")

  return (
    <div className="space-y-3">
      {/* Header informativo compacto */}
      <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-200/50 dark:border-red-800/50">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
          <span className="text-xs text-red-700 dark:text-red-300">
            Contacto para situaciones de emergencia médica o escolar
          </span>
        </div>
      </div>

      {/* Grid bento compacto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Nombre del contacto */}
        <div className="bg-card p-3 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-500 p-1.5 rounded-lg">
              <User className="h-3 w-3 text-white" />
            </div>
            <h3 className="text-sm font-medium">Persona de Contacto</h3>
          </div>

          <FormField
            control={form.control}
            name="contactoEmergencia"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-xs font-medium flex items-center gap-2">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-md">
                    <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  Nombre Completo
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: María García López"
                    className="h-9 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
                <div className="text-xs text-muted-foreground">Preferiblemente familiar directo o tutor legal</div>
              </FormItem>
            )}
          />
        </div>

        {/* Teléfono de emergencia */}
        <div className="bg-card p-3 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-green-500 p-1.5 rounded-lg">
              <Phone className="h-3 w-3 text-white" />
            </div>
            <h3 className="text-sm font-medium">Teléfono</h3>
          </div>

          <FormField
            control={form.control}
            name="telefonoEmergencia"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-xs font-medium flex items-center gap-2">
                  <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-md">
                    <Phone className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  Número de Teléfono
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="987 654 321"
                    maxLength={9}
                    className="h-9 text-sm font-mono transition-all duration-200 focus:ring-2 focus:ring-green-500/20"
                    {...field}
                    onInput={(e) => {
                      // Solo permitir números
                      e.target.value = e.target.value.replace(/[^0-9]/g, "")
                    }}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
                <div className="text-xs text-muted-foreground">Número celular preferiblemente</div>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Información adicional compacta */}
      <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-1 rounded">
            <Clock className="h-3 w-3 text-orange-600 dark:text-orange-400" />
          </div>
          <h4 className="text-xs font-medium text-muted-foreground">Información Importante</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
            <span>Disponible 24/7 preferiblemente</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
            <span>Autorizado para tomar decisiones</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
            <span>Conoce el historial médico</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
            <span>Puede llegar rápidamente</span>
          </div>
        </div>
      </div>

      {/* Confirmación visual cuando ambos campos están completos */}
      {contactoEmergencia && telefonoEmergencia && (
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-200/50 dark:border-green-800/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded">
              <Shield className="h-3 w-3 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="text-xs font-medium text-green-800 dark:text-green-200">
              Contacto de Emergencia Registrado
            </h4>
          </div>
          <div className="bg-white/50 dark:bg-black/20 p-2 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-green-600" />
                <span className="text-green-700 dark:text-green-300">
                  <strong>{contactoEmergencia}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-green-600" />
                <span className="text-green-700 dark:text-green-300 font-mono">
                  <strong>{telefonoEmergencia}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
