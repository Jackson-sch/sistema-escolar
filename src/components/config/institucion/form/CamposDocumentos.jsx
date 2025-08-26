"use client"
import { FormField, FormItem, FormLabel, FormMessage, FormControl, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FileText, Calendar, ImageIcon, Info, Shield, Stamp, Upload } from "lucide-react"

export default function CamposDocumentos({ form }) {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Documentos de Creación */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-400/10">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              Documentos de Creación
            </CardTitle>
            <CardDescription>Resoluciones y documentos oficiales de constitución</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="resolucionCreacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Stamp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      Resolución de Creación
                      <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                        Requerido
                      </Badge>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Documento oficial que autoriza el funcionamiento de la institución educativa
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej. R.D. N° 001-2020-UGEL07"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="flex items-center gap-1 text-xs">
                      <Info className="h-3 w-3" />
                      Número completo de la resolución directoral
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fechaCreacion"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-3">
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      Fecha de Creación
                      <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                        Requerido
                      </Badge>
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                        placeholder="Seleccionar fecha de creación"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </FormControl>
                    <FormDescription className="flex items-center gap-1 text-xs">
                      <Info className="h-3 w-3" />
                      Fecha oficial de constitución de la institución
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Documentos Vigentes */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10 dark:bg-green-400/10">
                <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              Documentos Vigentes
            </CardTitle>
            <CardDescription>Resoluciones y autorizaciones actuales</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="resolucionActual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                    Resolución Actual
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      Opcional
                    </Badge>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Resolución más reciente que modifica o ratifica el funcionamiento</p>
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej. R.D. N° 045-2024-UGEL07"
                      className="transition-all duration-200 focus:ring-2 focus:ring-green-500/20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="flex items-center gap-1 text-xs">
                    <Info className="h-3 w-3" />
                    Resolución vigente más reciente (si aplica)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Identidad Visual */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50/50 to-violet-50/30 dark:from-purple-950/20 dark:to-violet-950/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 dark:bg-purple-400/10">
                <ImageIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              Identidad Visual
            </CardTitle>
            <CardDescription>Logo y elementos gráficos institucionales</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    URL del Logo Institucional
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      Opcional
                    </Badge>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          URL pública de la imagen del logo. Formatos recomendados: PNG, JPG, SVG
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://ejemplo.com/logo-institucion.png"
                      className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="flex items-center gap-1 text-xs">
                    <Info className="h-3 w-3" />
                    URL completa de la imagen del logo institucional
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Información adicional sobre el logo */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border/50">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 dark:bg-purple-400/10 mt-0.5">
                  <Info className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground mb-1">Recomendaciones para el logo</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Formato: PNG con fondo transparente (recomendado)</li>
                    <li>• Tamaño: Mínimo 200x200 píxeles, máximo 1000x1000 píxeles</li>
                    <li>• Peso: Menor a 2MB para mejor rendimiento</li>
                    <li>• La URL debe ser accesible públicamente</li>
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
