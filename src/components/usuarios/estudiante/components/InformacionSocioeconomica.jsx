"use client"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Home, Users, GraduationCap, Award, HandHeart, Info } from "lucide-react"

export default function InformacionSocioeconomica({ form, isBecario }) {
  const tipoVivienda = form.watch("tipoVivienda")
  const programaSocial = form.watch("programaSocial")
  const viveConPadres = form.watch("viveConPadres")
  const transporteEscolar = form.watch("transporteEscolar")
  const becario = form.watch("becario")
  const tipoBeca = form.watch("tipoBeca")

  return (
    <div className="space-y-3">
      {/* Header informativo */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
        <div className="flex items-center gap-2">
          <Info className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          <span className="text-xs text-blue-700 dark:text-blue-300">
            Información para programas de apoyo y servicios estudiantiles
          </span>
        </div>
      </div>

      {/* Grid Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Vivienda - Card mediana */}
        <div className="lg:col-span-4 bg-card p-3 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-green-500 p-1.5 rounded-lg">
              <Home className="h-3 w-3 text-white" />
            </div>
            <h3 className="text-sm font-medium">Vivienda</h3>
          </div>

          <FormField
            control={form.control}
            name="tipoVivienda"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-xs font-medium text-muted-foreground">Tipo de Vivienda</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PROPIA">
                      <div className="flex items-center gap-2">
                        <Home className="h-3 w-3 text-green-600" />
                        <span>Propia</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ALQUILADA">
                      <div className="flex items-center gap-2">
                        <Home className="h-3 w-3 text-orange-600" />
                        <span>Alquilada</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="FAMILIAR">
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-blue-600" />
                        <span>Familiar</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="OTRO">
                      <div className="flex items-center gap-2">
                        <Home className="h-3 w-3 text-gray-600" />
                        <span>Otro</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Programa Social - Card mediana */}
        <div className="lg:col-span-4 bg-card p-3 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-purple-500 p-1.5 rounded-lg">
              <HandHeart className="h-3 w-3 text-white" />
            </div>
            <h3 className="text-sm font-medium">Programa Social</h3>
          </div>

          <FormField
            control={form.control}
            name="programaSocial"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-xs font-medium text-muted-foreground">Programa de Apoyo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="QALI_WARMA">
                      <div className="flex items-center gap-2">
                        <HandHeart className="h-3 w-3 text-green-600" />
                        <span>Qali Warma</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="JUNTOS">
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-blue-600" />
                        <span>Juntos</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="PENSION_65">
                      <div className="flex items-center gap-2">
                        <HandHeart className="h-3 w-3 text-purple-600" />
                        <span>Pensión 65</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="CONTIGO">
                      <div className="flex items-center gap-2">
                        <HandHeart className="h-3 w-3 text-orange-600" />
                        <span>Contigo</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="NINGUNO">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3"></span>
                        <span>Ninguno</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Situación Familiar - Card pequeña */}
        <div className="lg:col-span-4 bg-card p-3 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-500 p-1.5 rounded-lg">
              <Users className="h-3 w-3 text-white" />
            </div>
            <h3 className="text-sm font-medium">Situación</h3>
          </div>

          <div className="space-y-2">
            <FormField
              control={form.control}
              name="viveConPadres"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0 bg-muted/50 p-2 rounded-lg">
                  <FormControl>
                    <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="text-xs font-medium">Vive con padres</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transporteEscolar"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0 bg-muted/50 p-2 rounded-lg">
                  <FormControl>
                    <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="text-xs font-medium">Transporte escolar</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Becas - Card ancha */}
        <div className="lg:col-span-8 bg-card p-3 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-yellow-500 p-1.5 rounded-lg">
              <Award className="h-3 w-3 text-white" />
            </div>
            <h3 className="text-sm font-medium">Becas y Beneficios</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="becario"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0 bg-muted/50 p-2 rounded-lg">
                  <FormControl>
                    <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="text-xs font-medium">Es becario</FormLabel>
                </FormItem>
              )}
            />

            {isBecario && (
              <FormField
                control={form.control}
                name="tipoBeca"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-medium text-muted-foreground">Tipo de Beca</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Seleccionar beca" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EXCELENCIA_ACADEMICA">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-3 w-3 text-blue-600" />
                            <span>Excelencia Académica</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="DEPORTIVA">
                          <div className="flex items-center gap-2">
                            <Award className="h-3 w-3 text-green-600" />
                            <span>Deportiva</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ARTISTICA">
                          <div className="flex items-center gap-2">
                            <Award className="h-3 w-3 text-purple-600" />
                            <span>Artística</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="SOCIOECONOMICA">
                          <div className="flex items-center gap-2">
                            <HandHeart className="h-3 w-3 text-orange-600" />
                            <span>Socioeconómica</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="HERMANOS">
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-cyan-600" />
                            <span>Descuento por Hermanos</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="HIJO_TRABAJADOR">
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-indigo-600" />
                            <span>Hijo de Trabajador</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="OTRA">
                          <div className="flex items-center gap-2">
                            <Award className="h-3 w-3 text-gray-600" />
                            <span>Otra</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* Resumen - Card pequeña */}
        <div className="lg:col-span-4 bg-card p-3 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-indigo-500 p-1.5 rounded-lg">
              <Info className="h-3 w-3 text-white" />
            </div>
            <h3 className="text-sm font-medium">Resumen</h3>
          </div>

          <div className="space-y-2 text-xs">
            {tipoVivienda && (
              <div className="flex items-center gap-2 p-1 bg-green-50 dark:bg-green-900/20 rounded">
                <Home className="h-3 w-3 text-green-600" />
                <span>Vivienda: {tipoVivienda.toLowerCase()}</span>
              </div>
            )}
            {programaSocial && programaSocial !== "NINGUNO" && (
              <div className="flex items-center gap-2 p-1 bg-purple-50 dark:bg-purple-900/20 rounded">
                <HandHeart className="h-3 w-3 text-purple-600" />
                <span>Programa: {programaSocial.replace("_", " ")}</span>
              </div>
            )}
            {becario && (
              <div className="flex items-center gap-2 p-1 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <Award className="h-3 w-3 text-yellow-600" />
                <span>Becario: {tipoBeca ? tipoBeca.replace("_", " ") : "Sí"}</span>
              </div>
            )}
            {(viveConPadres || transporteEscolar) && (
              <div className="flex items-center gap-2 p-1 bg-blue-50 dark:bg-blue-900/20 rounded">
                <Users className="h-3 w-3 text-blue-600" />
                <span>
                  {viveConPadres && "Con padres"}
                  {viveConPadres && transporteEscolar && " • "}
                  {transporteEscolar && "Transporte"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
