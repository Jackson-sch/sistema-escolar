"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  CalendarIcon,
  Filter,
  BarChart3,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  FileSpreadsheet,
  File,
  PieChart,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Eye,
  Share2,
} from "lucide-react"

// Esquema de validación optimizado
const filtrosSchema = z.object({
  tipoReporte: z.string().default("general"),
  periodoTiempo: z.string().default("mesActual"),
  fechaInicio: z.date().optional(),
  fechaFin: z.date().optional(),
  conceptoPago: z.string().optional(),
  estudianteId: z.string().optional(),
  cursoId: z.string().optional(),
})

export default function ReportesFinancieros({ estudiantes = [] }) {
  const [isLoading, setIsLoading] = useState(false)
  const [reporteData, setReporteData] = useState(null)
  const [isExporting, setIsExporting] = useState(false)

  // Datos de ejemplo mejorados
  const datosEjemplo = {
    resumen: {
      totalRecaudado: 45250.75,
      totalPendiente: 12500.0,
      totalVencido: 3750.25,
      totalDescuentos: 2500.5,
      totalMoras: 750.25,
      porcentajeRecaudacion: 78,
      moneda: "PEN",
      variacionMensual: 5.2,
      estudiantesActivos: 156,
      pagosProcesados: 342,
    },
    porEstado: { pagado: 78, pendiente: 15, vencido: 7 },
    porConcepto: [
      { concepto: "Matrícula", monto: 15000, porcentaje: 35, color: "bg-blue-500" },
      { concepto: "Pensión", monto: 25000, porcentaje: 55, color: "bg-green-500" },
      { concepto: "Materiales", monto: 3000, porcentaje: 7, color: "bg-purple-500" },
      { concepto: "Actividades", monto: 1500, porcentaje: 3, color: "bg-orange-500" },
    ],
    tendencia: [
      { mes: "Ene", recaudado: 8500, pendiente: 1500, variacion: 2.1 },
      { mes: "Feb", recaudado: 9200, pendiente: 1300, variacion: 8.2 },
      { mes: "Mar", recaudado: 8900, pendiente: 1700, variacion: -3.3 },
      { mes: "Abr", recaudado: 9500, pendiente: 1200, variacion: 6.7 },
      { mes: "May", recaudado: 9150, pendiente: 1350, variacion: -3.7 },
    ],
  }

  const form = useForm({
    resolver: zodResolver(filtrosSchema),
    defaultValues: {
      tipoReporte: "general",
      periodoTiempo: "mesActual",
      fechaInicio: startOfMonth(new Date()),
      fechaFin: endOfMonth(new Date()),
    },
  })

  const periodoTiempo = form.watch("periodoTiempo")
  const tipoReporte = form.watch("tipoReporte")

  const actualizarFechasPorPeriodo = (periodo) => {
    const hoy = new Date()
    let inicio, fin

    switch (periodo) {
      case "mesActual":
        inicio = startOfMonth(hoy)
        fin = endOfMonth(hoy)
        break
      case "mesAnterior":
        const mesAnterior = subMonths(hoy, 1)
        inicio = startOfMonth(mesAnterior)
        fin = endOfMonth(mesAnterior)
        break
      case "trimestre":
        inicio = subMonths(hoy, 3)
        fin = hoy
        break
      case "anual":
        inicio = subMonths(hoy, 12)
        fin = hoy
        break
      case "personalizado":
        return
      default:
        inicio = startOfMonth(hoy)
        fin = endOfMonth(hoy)
    }

    form.setValue("fechaInicio", inicio)
    form.setValue("fechaFin", fin)
  }

  const generarReporte = async (data) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200))
      setReporteData(datosEjemplo)
      toast.success("Reporte generado correctamente", {
        description: "Los datos han sido procesados exitosamente",
      })
    } catch (error) {
      toast.error("Error al generar el reporte")
    } finally {
      setIsLoading(false)
    }
  }

  const exportarReporte = async (formato) => {
    setIsExporting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      toast.success(`Reporte exportado en ${formato.toUpperCase()}`, {
        description: "El archivo se ha descargado correctamente",
      })
    } catch (error) {
      toast.error("Error al exportar el reporte")
    } finally {
      setIsExporting(false)
    }
  }

  const compartirReporte = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Enlace copiado al portapapeles")
    } catch (error) {
      toast.error("Error al copiar enlace")
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header mejorado */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 p-8 border border-blue-200/50 dark:border-blue-800/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-400/5 dark:to-purple-400/5" />
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-blue-400/10">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Reportes Financieros</h1>
                  <p className="text-muted-foreground mt-1">Análisis completo de pagos y recaudación</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={compartirReporte} className="bg-transparent">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Compartir reporte</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="bg-transparent">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Vista previa</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de configuración compacto */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(generarReporte)}>
            <Card className="border-0 shadow-sm bg-gradient-to-r from-muted/30 to-muted/10">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                    <Filter className="h-4 w-4 text-primary" />
                  </div>
                  Configuración del Reporte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <FormField
                    control={form.control}
                    name="tipoReporte"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Tipo de Reporte</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="general">📊 General</SelectItem>
                            <SelectItem value="porConcepto">🏷️ Por Concepto</SelectItem>
                            <SelectItem value="porEstudiante">👥 Por Estudiante</SelectItem>
                            <SelectItem value="comparativo">📈 Comparativo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="periodoTiempo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Periodo</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value)
                            actualizarFechasPorPeriodo(value)
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mesActual">📅 Mes Actual</SelectItem>
                            <SelectItem value="mesAnterior">⏮️ Mes Anterior</SelectItem>
                            <SelectItem value="trimestre">📆 Último Trimestre</SelectItem>
                            <SelectItem value="anual">🗓️ Último Año</SelectItem>
                            <SelectItem value="personalizado">⚙️ Personalizado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {tipoReporte === "porEstudiante" && (
                    <FormField
                      control={form.control}
                      name="estudianteId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Estudiante</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Todos" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all">Todos los estudiantes</SelectItem>
                              {estudiantes.map((estudiante) => (
                                <SelectItem key={estudiante.id} value={estudiante.id}>
                                  {estudiante.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {periodoTiempo === "personalizado" && (
                    <>
                      <FormField
                        control={form.control}
                        name="fechaInicio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Fecha Inicio</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className="h-10 w-full justify-start text-left font-normal bg-transparent"
                                  >
                                    {field.value ? (
                                      format(field.value, "dd/MM/yyyy", { locale: es })
                                    ) : (
                                      <span className="text-muted-foreground">Seleccionar</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fechaFin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Fecha Fin</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className="h-10 w-full justify-start text-left font-normal bg-transparent"
                                  >
                                    {field.value ? (
                                      format(field.value, "dd/MM/yyyy", { locale: es })
                                    ) : (
                                      <span className="text-muted-foreground">Seleccionar</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? (
                      <>
                        <BarChart3 className="mr-2 h-4 w-4 animate-pulse" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generar Reporte
                      </>
                    )}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={!reporteData || isExporting}
                          onClick={() => exportarReporte("excel")}
                          className="bg-transparent"
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Exportar a Excel</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={!reporteData || isExporting}
                          onClick={() => exportarReporte("pdf")}
                          className="bg-transparent"
                        >
                          <File className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Exportar a PDF</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>

        {/* Resultados del reporte */}
        {isLoading ? (
          <ReportesSkeleton />
        ) : reporteData ? (
          <div className="space-y-8 animate-in fade-in-0 duration-500">
            {/* Métricas principales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Recaudado"
                value={reporteData.resumen.totalRecaudado}
                currency={reporteData.resumen.moneda}
                percentage={reporteData.resumen.porcentajeRecaudacion}
                trend={reporteData.resumen.variacionMensual}
                icon={<DollarSign className="h-5 w-5" />}
                color="green"
              />

              <MetricCard
                title="Pendiente de Cobro"
                value={reporteData.resumen.totalPendiente}
                currency={reporteData.resumen.moneda}
                percentage={reporteData.porEstado.pendiente}
                icon={<Clock className="h-5 w-5" />}
                color="amber"
              />

              <MetricCard
                title="Pagos Vencidos"
                value={reporteData.resumen.totalVencido}
                currency={reporteData.resumen.moneda}
                percentage={reporteData.porEstado.vencido}
                icon={<AlertCircle className="h-5 w-5" />}
                color="red"
              />

              <MetricCard
                title="Estudiantes Activos"
                value={reporteData.resumen.estudiantesActivos}
                subtitle={`${reporteData.resumen.pagosProcesados} pagos procesados`}
                icon={<Users className="h-5 w-5" />}
                color="blue"
                isCount={true}
              />
            </div>

            {/* Grid de análisis */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Distribución por concepto */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50/50 to-violet-50/30 dark:from-purple-950/20 dark:to-violet-950/10">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 dark:bg-purple-400/10">
                      <PieChart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    Distribución por Concepto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reporteData.porConcepto.map((item, index) => (
                    <div key={item.concepto} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          <span className="font-medium">{item.concepto}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {item.monto.toLocaleString("es-PE", {
                              style: "currency",
                              currency: reporteData.resumen.moneda,
                            })}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {item.porcentaje}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={item.porcentaje} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tendencia mensual */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10 dark:bg-green-400/10">
                      <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    Tendencia Mensual
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reporteData.tendencia.map((item) => (
                    <div key={item.mes} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium w-8">{item.mes}</span>
                          <div className="flex items-center gap-1">
                            {item.variacion > 0 ? (
                              <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 text-red-600 dark:text-red-400" />
                            )}
                            <span
                              className={`text-xs font-medium ${
                                item.variacion > 0
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {Math.abs(item.variacion)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 text-xs"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {item.recaudado.toLocaleString("es-PE", {
                              style: "currency",
                              currency: reporteData.resumen.moneda,
                            })}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-xs"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {item.pendiente.toLocaleString("es-PE", {
                              style: "currency",
                              currency: reporteData.resumen.moneda,
                            })}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="bg-green-500 transition-all duration-500"
                          style={{
                            width: `${(item.recaudado / (item.recaudado + item.pendiente)) * 100}%`,
                          }}
                        />
                        <div
                          className="bg-amber-500 transition-all duration-500"
                          style={{
                            width: `${(item.pendiente / (item.recaudado + item.pendiente)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Alertas y recomendaciones */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-400/10">
                    <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  Insights y Recomendaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-400/10">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">Pagos Vencidos</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                        7% del total facturado está vencido. Envía recordatorios automáticos.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50/50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-800/50">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10 dark:bg-green-400/10">
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">Tendencia Positiva</h4>
                      <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
                        Recaudación aumentó 5.2% respecto al mes anterior. ¡Excelente trabajo!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </TooltipProvider>
  )
}

// Componente de métrica optimizado
const MetricCard = ({ title, value, currency, percentage, trend, icon, color, subtitle, isCount = false }) => {
  const colorClasses = {
    green:
      "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10 border-green-200/50 dark:border-green-800/50",
    amber:
      "from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10 border-amber-200/50 dark:border-amber-800/50",
    red: "from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/10 border-red-200/50 dark:border-red-800/50",
    blue: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/10 border-blue-200/50 dark:border-blue-800/50",
  }

  const iconColors = {
    green: "text-green-600 dark:text-green-400",
    amber: "text-amber-600 dark:text-amber-400",
    red: "text-red-600 dark:text-red-400",
    blue: "text-blue-600 dark:text-blue-400",
  }

  return (
    <Card
      className={`border-0 shadow-sm bg-gradient-to-br ${colorClasses[color]} group hover:shadow-md transition-all duration-200`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`${iconColors[color]} group-hover:scale-110 transition-transform duration-200`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-foreground">
            {isCount
              ? value.toLocaleString()
              : value.toLocaleString("es-PE", {
                  style: "currency",
                  currency: currency,
                })}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {percentage !== undefined && (
            <>
              <p className="text-xs text-muted-foreground">{percentage}% del total</p>
              <Progress value={percentage} className="h-1" />
            </>
          )}
          {trend !== undefined && (
            <div className="flex items-center gap-1">
              {trend > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-600 dark:text-red-400" />
              )}
              <span
                className={`text-xs font-medium ${
                  trend > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                {Math.abs(trend)}% vs mes anterior
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Skeleton optimizado
function ReportesSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5 rounded" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-28 mb-2" />
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-1 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-5 w-40" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-5 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl border">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
