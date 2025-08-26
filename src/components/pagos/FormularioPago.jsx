"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  CalendarIcon,
  Loader2,
  User,
  FileText,
  DollarSign,
  CalendarDays,
  CreditCard,
  Receipt,
  TrendingDown,
  TrendingUp,
  Calculator,
  MessageSquare,
  StickyNote,
} from "lucide-react"

// Esquema de validación
const pagoSchema = z.object({
  numeroBoleta: z.string().optional().nullable(),
  concepto: z.string().min(3, { message: "El concepto es obligatorio y debe tener al menos 3 caracteres" }),
  descripcion: z.string().optional().nullable(),
  monto: z.coerce.number().positive({ message: "El monto debe ser mayor a 0" }),
  moneda: z.string().default("PEN"),
  fechaVencimiento: z.date({ message: "La fecha de vencimiento es obligatoria" }),
  estudianteId: z.string({ message: "El estudiante es obligatorio" }),
  descuento: z.coerce.number().min(0).default(0).optional().nullable(),
  mora: z.coerce.number().min(0).default(0).optional().nullable(),
  observaciones: z.string().optional().nullable(),
})

export default function FormularioPago({ estudiantes = [], onSubmit, pagoInicial = null, isSubmitting = false }) {
  const [montoFinal, setMontoFinal] = useState(0)

  // Configurar el formulario
  const form = useForm({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      numeroBoleta: "",
      concepto: "",
      descripcion: "",
      monto: "",
      moneda: "PEN",
      fechaVencimiento: new Date(),
      estudianteId: "",
      descuento: 0,
      mora: 0,
      observaciones: "",
    },
  })

  // Cargar datos iniciales si estamos editando
  useEffect(() => {
    if (pagoInicial) {
      const defaultValues = {
        ...pagoInicial,
        fechaVencimiento: pagoInicial.fechaVencimiento ? new Date(pagoInicial.fechaVencimiento) : new Date(),
        monto: pagoInicial.monto.toString(),
        descuento: pagoInicial.descuento?.toString() || "0",
        mora: pagoInicial.mora?.toString() || "0",
      }

      form.reset(defaultValues)
    }
  }, [pagoInicial, form])

  // Calcular monto final cuando cambian los valores
  useEffect(() => {
    const monto = Number.parseFloat(form.watch("monto")) || 0
    const descuento = Number.parseFloat(form.watch("descuento")) || 0
    const mora = Number.parseFloat(form.watch("mora")) || 0

    setMontoFinal(monto - descuento + mora)
  }, [form.watch("monto"), form.watch("descuento"), form.watch("mora")])

  // Manejar envío del formulario
  const handleSubmit = form.handleSubmit(async (data) => {
    // Convertir strings a números
    data.monto = Number.parseFloat(data.monto)
    data.descuento = Number.parseFloat(data.descuento || "0")
    data.mora = Number.parseFloat(data.mora || "0")

    // Llamar a la función onSubmit proporcionada por el componente padre
    onSubmit(data)
  })

  const montoBase = Number.parseFloat(form.watch("monto")) || 0
  const descuento = Number.parseFloat(form.watch("descuento")) || 0
  const mora = Number.parseFloat(form.watch("mora")) || 0
  const moneda = form.watch("moneda")

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Bento Grid Layout - Más compacto */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Información Principal */}
          <Card className="lg:col-span-8 border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-primary text-base">
                <User className="h-4 w-4" />
                Información Principal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Estudiante */}
                <FormField
                  control={form.control}
                  name="estudianteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1 text-sm">
                        <User className="h-3 w-3" />
                        Estudiante *
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Seleccionar estudiante" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {estudiantes.map((estudiante) => (
                            <SelectItem key={estudiante.id} value={estudiante.id}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{estudiante.name}</span>
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  {estudiante.dni}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Número de Boleta */}
                <FormField
                  control={form.control}
                  name="numeroBoleta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1 text-sm">
                        <Receipt className="h-3 w-3" />
                        N° Boleta
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="B-00123" {...field} value={field.value || ""} className="h-9" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Concepto */}
                <FormField
                  control={form.control}
                  name="concepto"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-1 text-sm">
                        <FileText className="h-3 w-3" />
                        Concepto *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Matrícula 2025" {...field} className="h-9" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Fecha de Vencimiento - Más compacto */}
          <Card className="lg:col-span-4 bg-secondary">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-secondary-foreground text-base">
                <CalendarDays className="h-4 w-4" />
                Vencimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="fechaVencimiento"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="h-auto p-3 justify-start text-left font-normal bg-transparent"
                          >
                            {field.value ? (
                              <div className="flex flex-col">
                                <span className="font-medium text-sm">
                                  {format(field.value, "PPP", { locale: es })}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(field.value, "EEEE", { locale: es })}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm">Seleccionar fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Información Financiera */}
          <Card className="lg:col-span-7 bg-accent">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-accent-foreground text-base">
                <DollarSign className="h-4 w-4" />
                Información Financiera
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Monto */}
                <FormField
                  control={form.control}
                  name="monto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1 text-sm">
                        <CreditCard className="h-3 w-3" />
                        Monto *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          className="h-9 font-medium"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Moneda */}
                <FormField
                  control={form.control}
                  name="moneda"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Moneda</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PEN">🇵🇪 PEN</SelectItem>
                          <SelectItem value="USD">🇺🇸 USD</SelectItem>
                          <SelectItem value="EUR">🇪🇺 EUR</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Descuento */}
                <FormField
                  control={form.control}
                  name="descuento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1 text-sm">
                        <TrendingDown className="h-3 w-3 text-green-600 dark:text-green-400" />
                        Descuento
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          value={field.value || "0"}
                          className="h-9"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mora */}
                <FormField
                  control={form.control}
                  name="mora"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1 text-sm">
                        <TrendingUp className="h-3 w-3 text-red-600 dark:text-red-400" />
                        Mora
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          value={field.value || "0"}
                          className="h-9"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Resumen Financiero - Más compacto */}
          <Card className="lg:col-span-5 border-primary/20 bg-muted">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-foreground text-base">
                <Calculator className="h-4 w-4" />
                Resumen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Base:</span>
                  <span className="font-medium">
                    {montoBase.toFixed(2)} {moneda}
                  </span>
                </div>

                {descuento > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-green-600 dark:text-green-400">Descuento:</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      -{descuento.toFixed(2)} {moneda}
                    </span>
                  </div>
                )}

                {mora > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-red-600 dark:text-red-400">Mora:</span>
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      +{mora.toFixed(2)} {moneda}
                    </span>
                  </div>
                )}

                <Separator className="my-2" />

                <div className="flex justify-between items-center p-2 bg-primary/10 rounded border border-primary/20">
                  <span className="font-bold text-primary text-sm">Total:</span>
                  <span className="font-bold text-lg text-primary">
                    {montoFinal.toFixed(2)} {moneda}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Descripción y Observaciones - En una sola fila */}
          <Card className="lg:col-span-7 bg-secondary/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-foreground text-base">
                <MessageSquare className="h-4 w-4" />
                Descripción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Detalles adicionales del pago..."
                        className="min-h-[60px] resize-none text-sm"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-5 bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-muted-foreground text-base">
                <StickyNote className="h-4 w-4" />
                Observaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="observaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Observaciones internas..."
                        className="min-h-[60px] resize-none text-sm"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Botón de envío - Más compacto */}
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting} className="min-w-[160px]">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <DollarSign className="mr-2 h-4 w-4" />
                {pagoInicial ? "Actualizar" : "Registrar"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
