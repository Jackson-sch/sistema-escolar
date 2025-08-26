"use client"
import { FormField, FormItem, FormLabel, FormMessage, FormControl, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar, Clock, GraduationCap, Info, CalendarDays } from "lucide-react"

export default function CamposAcademicos({ form }) {
  const currentYear = new Date().getFullYear()

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Año Escolar */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50/50 to-violet-50/30 dark:from-purple-950/20 dark:to-violet-950/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 dark:bg-purple-400/10">
                <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              Año Escolar
            </CardTitle>
            <CardDescription>Configuración del período académico actual</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="cicloEscolarActual"
              render={({ field }) => (
                <FormItem className="max-w-xs">
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    Año Escolar Actual
                    <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                      Requerido
                    </Badge>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Año académico en curso o próximo a iniciar</p>
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={2020}
                      max={2050}
                      placeholder={`Ej. ${currentYear}`}
                      className="font-mono transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                      {...field}
                      onChange={(e) => field.onChange(Number.parseInt(e.target.value, 10))}
                    />
                  </FormControl>
                  <FormDescription className="flex items-center gap-1 text-xs">
                    <Info className="h-3 w-3" />
                    Año académico vigente ({currentYear - 0} - {currentYear + 1})
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Calendario Académico */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-400/10">
                <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              Calendario Académico
            </CardTitle>
            <CardDescription>Fechas importantes del período escolar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="fechaInicioClases"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-3">
                    <FormLabel className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50">
                        <Clock className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      Fecha de Inicio de Clases
                      <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                        Requerido
                      </Badge>
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                        placeholder="Seleccionar fecha de inicio"
                        className="transition-all duration-200 focus:ring-2 focus:ring-green-500/20"
                      />
                    </FormControl>
                    <FormDescription className="flex items-center gap-1 text-xs">
                      <Info className="h-3 w-3" />
                      Primer día oficial de clases del año escolar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fechaFinClases"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-3">
                    <FormLabel className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/50">
                        <Clock className="h-3 w-3 text-red-600 dark:text-red-400" />
                      </div>
                      Fecha de Fin de Clases
                      <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                        Requerido
                      </Badge>
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                        placeholder="Seleccionar fecha de fin"
                        className="transition-all duration-200 focus:ring-2 focus:ring-red-500/20"
                      />
                    </FormControl>
                    <FormDescription className="flex items-center gap-1 text-xs">
                      <Info className="h-3 w-3" />
                      Último día oficial de clases del año escolar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Información adicional del calendario */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border/50">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-400/10 mt-0.5">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground mb-1">Información importante</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Las fechas deben corresponder al año escolar configurado</li>
                    <li>• La fecha de fin debe ser posterior a la fecha de inicio</li>
                    <li>• Considere los días feriados y vacaciones en su planificación</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
