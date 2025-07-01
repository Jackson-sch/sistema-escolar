"use client"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, Clock, BookOpen, Users, School } from "lucide-react"

export default function InformacionAcademica({ form, niveles }) {
  // Obtener información del nivel seleccionado para mostrar detalles adicionales
  const selectedNivelId = form.watch("nivelAcademicoId")
  const selectedNivel = niveles.find((nivel) => nivel.value === selectedNivelId)
  const field = form.watch("turno") // Declare the field variable

  return (
    <div className="space-y-6">
      {/* Nivel Académico */}
      <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
            <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Asignación Académica</h3>
        </div>

        <FormField
          control={form.control}
          name="nivelAcademicoId"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-sm font-medium flex items-center gap-2">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-md">
                  <School className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                Nivel Académico
                <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20">
                    <SelectValue placeholder="Selecciona el nivel, grado y sección" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {niveles.length > 0 ? (
                    niveles.map((nivelAcademico) => (
                      <SelectItem key={nivelAcademico.id} value={nivelAcademico.value}>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <BookOpen className="h-3 w-3" />
                            {nivelAcademico.nivelNombre}
                          </div>
                          <span className="font-medium">{nivelAcademico.label}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="seleccione" disabled>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <School className="h-3 w-3" />
                        No hay niveles disponibles
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage className="text-xs" />

              {/* Información adicional del nivel seleccionado */}
              {selectedNivel && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3 text-blue-600" />
                      <span className="text-muted-foreground">Nivel:</span>
                      <span className="font-medium">{selectedNivel.nivelNombre}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3 text-green-600" />
                      <span className="text-muted-foreground">Grado:</span>
                      <span className="font-medium">{selectedNivel.gradoNombre}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-purple-600" />
                      <span className="text-muted-foreground">Sección:</span>
                      <span className="font-medium">{selectedNivel.seccion}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-orange-600" />
                      <span className="text-muted-foreground">Año:</span>
                      <span className="font-medium">{selectedNivel.anioAcademico}</span>
                    </div>
                  </div>
                </div>
              )}
            </FormItem>
          )}
        />
      </div>

      {/* Turno */}
      <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
            <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Horario Académico</h3>
        </div>

        <FormField
          control={form.control}
          name="turno"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-sm font-medium flex items-center gap-2">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-1 rounded-md">
                  <Clock className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                </div>
                Turno de Clases
                <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger className="h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-500/20">
                    <SelectValue placeholder="Seleccionar horario de clases" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MANANA">
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-100 dark:bg-yellow-900/30 p-1 rounded">
                        <Clock className="h-3 w-3 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-medium">Mañana</div>
                        <div className="text-xs text-muted-foreground">7:00 AM - 12:00 PM</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="TARDE">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 dark:bg-orange-900/30 p-1 rounded">
                        <Clock className="h-3 w-3 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium">Tarde</div>
                        <div className="text-xs text-muted-foreground">1:00 PM - 6:00 PM</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="NOCHE">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1 rounded">
                        <Clock className="h-3 w-3 text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-medium">Noche</div>
                        <div className="text-xs text-muted-foreground">6:30 PM - 10:00 PM</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-xs" />

              {/* Información adicional del turno */}
              {field.value && (
                <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200/50 dark:border-orange-800/50">
                  <div className="flex items-center gap-2 text-xs text-orange-800 dark:text-orange-200">
                    <Clock className="h-3 w-3" />
                    <span>
                      {field.value === "MANANA" && "Horario matutino - Ideal para estudiantes de educación básica"}
                      {field.value === "TARDE" && "Horario vespertino - Perfecto para actividades complementarias"}
                      {field.value === "NOCHE" && "Horario nocturno - Diseñado para estudiantes que trabajan"}
                    </span>
                  </div>
                </div>
              )}
            </FormItem>
          )}
        />
      </div>

      {/* Resumen de selección */}
      {selectedNivel && field && (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200/50 dark:border-green-800/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded">
              <GraduationCap className="h-3 w-3 text-green-600" />
            </div>
            <h4 className="text-sm font-medium text-green-800 dark:text-green-200">Resumen de Asignación</h4>
          </div>
          <div className="text-sm text-green-700 dark:text-green-300">
            El estudiante será asignado a <span className="font-semibold">{selectedNivel.label}</span> en el turno de{" "}
            <span className="font-semibold">
              {field === "MANANA" && "Mañana"}
              {field === "TARDE" && "Tarde"}
              {field === "NOCHE" && "Noche"}
            </span>
            {selectedNivel.anioAcademico && (
              <span>
                {" "}
                para el año académico <span className="font-semibold">{selectedNivel.anioAcademico}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
