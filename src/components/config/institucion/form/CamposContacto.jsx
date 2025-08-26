"use client"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MapPin, Building, Phone, Mail, Globe, Info, Map, Building2, Hash } from "lucide-react"

export default function CamposContacto({ form }) {
  return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dirección Principal */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10 dark:bg-green-400/10">
                <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              Dirección Principal
            </CardTitle>
            <CardDescription>Ubicación física de la institución educativa</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-green-600 dark:text-green-400" />
                    Dirección Completa
                    <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                      Requerido
                    </Badge>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej. Av. Los Educadores 123, Urbanización San José"
                      className="transition-all duration-200 focus:ring-2 focus:ring-green-500/20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="flex items-center gap-1 text-xs">
                    <Info className="h-3 w-3" />
                    Incluya calle, número, urbanización o referencia
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Ubicación Geográfica */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-400/10">
                <Map className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              Ubicación Geográfica
            </CardTitle>
            <CardDescription>División política y administrativa del territorio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="distrito"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      Distrito
                      <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                        Requerido
                      </Badge>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej. San Isidro"
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
                name="provincia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      Provincia
                      <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                        Requerido
                      </Badge>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej. Lima"
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
                name="departamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      Departamento
                      <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                        Requerido
                      </Badge>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej. Lima"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Códigos y Entidades */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50/50 to-violet-50/30 dark:from-purple-950/20 dark:to-violet-950/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 dark:bg-purple-400/10">
                <Hash className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              Códigos y Entidades Administrativas
            </CardTitle>
            <CardDescription>Identificadores oficiales y entidades de supervisión</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="ubigeo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      Ubigeo
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Código de ubicación geográfica del INEI (6 dígitos)</p>
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej. 150101"
                        className="font-mono transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                        maxLength={6}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">Código de 6 dígitos del INEI</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ugel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      UGEL
                      <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                        Requerido
                      </Badge>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej. UGEL 07 - San Borja"
                        className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">Unidad de Gestión Educativa Local</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      DRE
                      <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                        Requerido
                      </Badge>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej. DRELM - Lima Metropolitana"
                        className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">Dirección Regional de Educación</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Información de Contacto */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-400/10">
                <Phone className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              Información de Contacto
            </CardTitle>
            <CardDescription>Medios de comunicación con la institución (opcional)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      Teléfono
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                        Opcional
                      </Badge>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej. (01) 234-5678"
                        className="transition-all duration-200 focus:ring-2 focus:ring-amber-500/20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">Número principal de contacto</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      Email
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                        Opcional
                      </Badge>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contacto@colegio.edu.pe"
                        className="transition-all duration-200 focus:ring-2 focus:ring-amber-500/20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">Correo institucional oficial</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sitioWeb"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      Sitio Web
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                        Opcional
                      </Badge>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.colegio.edu.pe"
                        className="transition-all duration-200 focus:ring-2 focus:ring-amber-500/20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">Página web institucional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
