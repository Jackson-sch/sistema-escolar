"use client"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Building, School, Hash, Settings, GraduationCap, Info, Building2, BookOpen } from "lucide-react"

export default function CamposGeneral({ form }) {
  return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información Básica */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-400/10">
                <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              Información Básica
            </CardTitle>
            <CardDescription>Datos fundamentales de identificación de la institución educativa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nombreInstitucion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <School className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      Nombre de la Institución
                      <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                        Requerido
                      </Badge>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej. Institución Educativa San Agustín"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nombreComercial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      Nombre Comercial
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                        Opcional
                      </Badge>
                      <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                        Nombre por el cual es conocida comúnmente la institución
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nombre comercial o abreviado"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="codigoModular"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-green-600 dark:text-green-400" />
                    Código Modular
                    <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                      Requerido
                    </Badge>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Código único de 6 o 7 dígitos asignado por el MINEDU para identificar cada local educativo
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej. 1234567"
                      className="font-mono transition-all duration-200 focus:ring-2 focus:ring-green-500/20"
                      maxLength={7}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="flex items-center gap-1 text-xs">
                    <Info className="h-3 w-3" />
                    Código único asignado por el Ministerio de Educación
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Configuración Institucional */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50/50 to-violet-50/30 dark:from-purple-950/20 dark:to-violet-950/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 dark:bg-purple-400/10">
                <Settings className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              Configuración Institucional
            </CardTitle>
            <CardDescription>Tipo de gestión, modalidad y características operativas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="tipoGestion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      Tipo de Gestión
                      <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                        Requerido
                      </Badge>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20 w-full">
                          <SelectValue placeholder="Seleccione el tipo de gestión" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tiposGestion.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value} className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              {tipo.icon}
                              <span>{tipo.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="modalidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      Modalidad
                      <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                        Requerido
                      </Badge>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20 w-full">
                          <SelectValue placeholder="Seleccione la modalidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {modalidades.map((modalidad) => (
                          <SelectItem key={modalidad.value} value={modalidad.value}>
                            <div className="flex items-center gap-2">
                              {modalidad.icon}
                              <span>{modalidad.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Niveles Educativos */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10 dark:bg-green-400/10">
                <GraduationCap className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              Niveles Educativos
            </CardTitle>
            <CardDescription>Selecciona todos los niveles que ofrece tu institución</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="niveles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-green-600 dark:text-green-400" />
                    Niveles que ofrece la institución
                    <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                      Requerido
                    </Badge>
                  </FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={nivelesEducativos}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder="Seleccione los niveles educativos"
                      className="transition-all duration-200"
                    />
                  </FormControl>
                  <FormDescription className="flex items-center gap-1 text-xs">
                    <Info className="h-3 w-3" />
                    Puede seleccionar múltiples niveles según la oferta educativa
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>
  )
}

// Opciones mejoradas con iconos
const tiposGestion = [
  {
    value: "PUBLICA",
    label: "Pública",
    icon: <Building className="h-4 w-4 text-blue-600" />,
  },
  {
    value: "PRIVADA",
    label: "Privada",
    icon: <Building2 className="h-4 w-4 text-green-600" />,
  },
  {
    value: "CONVENIO",
    label: "Convenio",
    icon: <Settings className="h-4 w-4 text-purple-600" />,
  },
]

const modalidades = [
  {
    value: "PRESENCIAL",
    label: "Presencial",
    icon: <School className="h-4 w-4 text-blue-600" />,
  },
  {
    value: "SEMIPRESENCIAL",
    label: "Semipresencial",
    icon: <BookOpen className="h-4 w-4 text-orange-600" />,
  },
  {
    value: "DISTANCIA",
    label: "A distancia",
    icon: <GraduationCap className="h-4 w-4 text-purple-600" />,
  },
]

const nivelesEducativos = [
  { value: "INICIAL", label: "Inicial (3-5 años)" },
  { value: "PRIMARIA", label: "Primaria (6-11 años)" },
  { value: "SECUNDARIA", label: "Secundaria (12-16 años)" },
]
