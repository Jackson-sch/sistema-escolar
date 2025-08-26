"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Printer, Download, Loader2 } from "lucide-react"

// Función para formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(amount)
}

export default function ComprobantePago({ pago }) {
  const [isGenerating, setIsGenerating] = useState(false)

  // Función para simular la generación del PDF
  const handleGeneratePDF = () => {
    setIsGenerating(true)
    
    // Simular tiempo de procesamiento
    setTimeout(() => {
      setIsGenerating(false)
      toast.success("Comprobante generado correctamente")
    }, 2000)
  }

  // Función para simular la impresión
  const handlePrint = () => {
    window.print()
  }

  // Obtener el estado del pago con color
  const getEstadoBadge = (estado) => {
    const estados = {
      PENDIENTE: { label: "Pendiente", variant: "outline" },
      PAGADO: { label: "Pagado", variant: "success" },
      VENCIDO: { label: "Vencido", variant: "destructive" },
      ANULADO: { label: "Anulado", variant: "secondary" },
    }

    const estadoInfo = estados[estado] || { label: estado, variant: "outline" }

    return (
      <Badge variant={estadoInfo.variant} className="ml-2">
        {estadoInfo.label}
      </Badge>
    )
  }

  return (
    <div className="print:bg-white print:w-full">
      <Card className="border-2 print:border-0 print:shadow-none">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:flex-row">
            <div>
              <CardTitle className="text-2xl">Comprobante de Pago</CardTitle>
              <p className="text-muted-foreground mt-1">
                Boleta N° {pago.numeroBoleta}
              </p>
            </div>
            <div className="print:hidden flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button size="sm" onClick={handleGeneratePDF} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Información del colegio */}
          <div className="text-center mb-6">
            <h2 className="font-bold text-xl">Colegio San Agustín</h2>
            <p className="text-muted-foreground">Av. Principal 123, Lima, Perú</p>
            <p className="text-muted-foreground">RUC: 20123456789</p>
          </div>

          <Separator />

          {/* Información del estudiante y pago */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Información del Estudiante</h3>
              <div className="space-y-1">
                <p>
                  <span className="text-muted-foreground">Nombre:</span>{" "}
                  {pago.estudiante?.name || "--"}
                </p>
                <p>
                  <span className="text-muted-foreground">Grado:</span>{" "}
                  {pago.estudiante?.grado || "--"}
                </p>
                <p>
                  <span className="text-muted-foreground">Sección:</span>{" "}
                  {pago.estudiante?.seccion || "--"}
                </p>
                <p>
                  <span className="text-muted-foreground">ID Estudiante:</span>{" "}
                  {pago.estudiante?.id || "--"}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Información del Pago</h3>
              <div className="space-y-1">
                <p>
                  <span className="text-muted-foreground">Fecha de Emisión:</span>{" "}
                  {pago.fechaEmision
                    ? format(new Date(pago.fechaEmision), "PPP", { locale: es })
                    : "--"}
                </p>
                <p>
                  <span className="text-muted-foreground">Fecha de Vencimiento:</span>{" "}
                  {pago.fechaVencimiento
                    ? format(new Date(pago.fechaVencimiento), "PPP", { locale: es })
                    : "--"}
                </p>
                <p>
                  <span className="text-muted-foreground">Estado:</span>{" "}
                  {getEstadoBadge(pago.estado)}
                </p>
                {pago.fechaPago && (
                  <p>
                    <span className="text-muted-foreground">Fecha de Pago:</span>{" "}
                    {format(new Date(pago.fechaPago), "PPP", { locale: es })}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Detalle del pago */}
          <div>
            <h3 className="font-semibold mb-4">Detalle del Pago</h3>
            <div className="border rounded-md">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Concepto</th>
                    <th className="text-right p-3 font-medium">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{pago.concepto}</p>
                        <p className="text-sm text-muted-foreground">{pago.descripcion}</p>
                      </div>
                    </td>
                    <td className="p-3 text-right">{formatCurrency(pago.monto)}</td>
                  </tr>
                  {pago.descuento > 0 && (
                    <tr className="border-t">
                      <td className="p-3 text-muted-foreground">Descuento</td>
                      <td className="p-3 text-right text-green-600">
                        -{formatCurrency(pago.descuento)}
                      </td>
                    </tr>
                  )}
                  {pago.mora > 0 && (
                    <tr className="border-t">
                      <td className="p-3 text-muted-foreground">Mora</td>
                      <td className="p-3 text-right text-red-600">
                        +{formatCurrency(pago.mora)}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t bg-muted/30">
                    <td className="p-3 font-medium">Total</td>
                    <td className="p-3 text-right font-bold">
                      {formatCurrency(pago.montoTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Método de pago */}
          {pago.estado === "PAGADO" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Método de Pago</h3>
                <div className="space-y-1">
                  <p>
                    <span className="text-muted-foreground">Método:</span>{" "}
                    {pago.metodoPago || "--"}
                  </p>
                  {pago.referenciaPago && (
                    <p>
                      <span className="text-muted-foreground">Referencia:</span>{" "}
                      {pago.referenciaPago}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Observaciones */}
          {pago.observaciones && (
            <div>
              <h3 className="font-semibold mb-2">Observaciones</h3>
              <p className="text-muted-foreground">{pago.observaciones}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex-col items-start pt-0">
          <Separator className="mb-4" />
          <div className="text-sm text-muted-foreground">
            <p>Este documento es un comprobante de pago válido.</p>
            <p className="mt-1">Para cualquier consulta, comuníquese con el departamento de finanzas.</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
