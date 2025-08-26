"use client"
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
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, Loader2, DollarSign, CreditCard, FileText, Building, Hash, LinkIcon } from "lucide-react"

// Esquema de validación mejorado
const pagoRealizadoSchema = z.object({
  fechaPago: z.date({ message: "La fecha de pago es obligatoria" }),
  metodoPago: z.string().min(1, { message: "El método de pago es obligatorio" }),
  referenciaPago: z.string().optional().nullable(),
  numeroOperacion: z.string().optional().nullable(),
  entidadBancaria: z.string().optional().nullable(),
  comprobante: z.string().url({ message: "Debe ser una URL válida" }).optional().or(z.literal("")),
  observaciones: z.string().optional().nullable(),
})

export default function FormularioPagoRealizado({ pago, onSubmit, isSubmitting = false, onCancel }) {
  // Configurar el formulario
  const form = useForm({
    resolver: zodResolver(pagoRealizadoSchema),
    defaultValues: {
      fechaPago: new Date(),
      metodoPago: "",
      referenciaPago: "",
      numeroOperacion: "",
      entidadBancaria: "",
      comprobante: "",
      observaciones: "",
    },
  })

  // Manejar envío del formulario
  const handleSubmit = form.handleSubmit(async (data) => {
    onSubmit(data)
  })

  const montoTotal = pago.monto - (pago.descuento || 0) + (pago.mora || 0)

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del pago */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-primary">Resumen del Pago</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">Concepto:</span>
                  <span className="text-foreground">{pago.concepto}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">Monto Base:</span>
                  <span className="text-foreground">
                    {pago.monto.toFixed(2)} {pago.moneda}
                  </span>
                </div>

                {pago.descuento > 0 && (
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Descuento:</span>
                    <span className="text-green-600">
                      -{pago.descuento.toFixed(2)} {pago.moneda}
                    </span>
                  </div>
                )}

                {pago.mora > 0 && (
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Mora:</span>
                    <span className="text-red-600">
                      +{pago.mora.toFixed(2)} {pago.moneda}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">Vencimiento:</span>
                  <span className="text-foreground">
                    {format(new Date(pago.fechaVencimiento), "PPP", { locale: es })}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">Estudiante:</span>
                  <span className="text-foreground">
                    {pago.estudiante?.nombre} {pago.estudiante?.apellido}
                  </span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between items-center p-2 bg-primary/10 rounded">
                  <span className="font-bold text-primary">Total a Pagar:</span>
                  <span className="font-bold text-lg text-primary">
                    {montoTotal.toFixed(2)} {pago.moneda}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fecha de Pago */}
          <FormField
            control={form.control}
            name="fechaPago"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Fecha de Pago *
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" className="w-full pl-3 text-left font-normal bg-transparent">
                        {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Método de Pago */}
          <FormField
            control={form.control}
            name="metodoPago"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Método de Pago *
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="efectivo">💵 Efectivo</SelectItem>
                    <SelectItem value="transferencia">🏦 Transferencia Bancaria</SelectItem>
                    <SelectItem value="tarjeta">💳 Tarjeta de Crédito/Débito</SelectItem>
                    <SelectItem value="cheque">📄 Cheque</SelectItem>
                    <SelectItem value="app">📱 Aplicación Móvil (Yape, Plin, etc.)</SelectItem>
                    <SelectItem value="otro">🔧 Otro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Entidad Bancaria */}
          <FormField
            control={form.control}
            name="entidadBancaria"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Entidad Bancaria
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ej: BCP, Interbank, BBVA, etc." {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Número de Operación */}
          <FormField
            control={form.control}
            name="numeroOperacion"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Número de Operación
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 123456789" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Referencia de Pago */}
          <FormField
            control={form.control}
            name="referenciaPago"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Referencia de Pago
                </FormLabel>
                <FormControl>
                  <Input placeholder="Información adicional de referencia" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Comprobante (URL) */}
          <FormField
            control={form.control}
            name="comprobante"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Comprobante (URL)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://ejemplo.com/comprobante.pdf"
                    type="url"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Observaciones */}
        <FormField
          control={form.control}
          name="observaciones"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Observaciones
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observaciones adicionales sobre el pago..."
                  className="min-h-[80px] resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="sm:order-1 bg-transparent"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="sm:order-2">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrando pago...
              </>
            ) : (
              <>
                <DollarSign className="mr-2 h-4 w-4" />
                Registrar Pago Realizado
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
