"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  AlertTriangle,
  Check,
  Clock,
  X,
  FileText,
  DollarSign,
  Calendar,
  CreditCard,
  Users,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { obtenerPagosPorEstudiante } from "@/action/pagos/pagoActions"

// Componente para métricas
const MetricCard = ({ title, value, icon: Icon, color = "primary", trend, subtitle }) => (
  <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-background to-muted/20 hover:shadow-lg transition-all duration-300 group">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center text-xs ${trend > 0 ? "text-emerald-600" : "text-red-600"}`}>
              {trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(trend)}% vs anterior
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${getColorClasses(color).bg} group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className={`h-6 w-6 ${getColorClasses(color).text}`} />
        </div>
      </div>
    </CardContent>
  </Card>
)

// Componente para cards de pago
const PagoCard = ({ pago }) => {
  const { color, icon } = getEstadoBadge(pago.estado)
  const fechaVencimiento = new Date(pago.fechaVencimiento)
  const estaVencido = pago.estado === "pendiente" && fechaVencimiento < new Date()
  const montoTotal = pago.monto - (pago.descuento || 0) + (pago.mora || 0)

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg ${estaVencido
          ? "border-red-200 bg-gradient-to-br from-red-50 to-red-50/50 dark:border-red-800/50 dark:from-red-950/20 dark:to-red-950/10"
          : "border-border bg-gradient-to-br from-background to-muted/20 hover:shadow-lg"
        }`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{pago.concepto}</h3>
            {pago.descripcion && <p className="text-sm text-muted-foreground">{pago.descripcion}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${color} flex items-center shadow-sm`}>
              {icon}
              {pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1)}
            </Badge>
            {pago.descuento > 0 && (
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/50"
              >
                -S/ {pago.descuento.toFixed(2)}
              </Badge>
            )}
            {pago.mora > 0 && (
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/50"
              >
                +S/ {pago.mora.toFixed(2)}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Monto:</span>
            <span className="font-semibold">S/ {montoTotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Vencimiento:</span>
            <span className="font-medium">{format(fechaVencimiento, "dd/MM/yyyy", { locale: es })}</span>
          </div>
          {pago.fechaPago && (
            <div className="flex items-center gap-2 col-span-2">
              <Check className="h-4 w-4 text-emerald-600" />
              <span className="text-muted-foreground">Pagado:</span>
              <span className="font-medium text-emerald-600">
                {format(new Date(pago.fechaPago), "dd/MM/yyyy", { locale: es })}
              </span>
            </div>
          )}
          {pago.metodoPago && (
            <div className="flex items-center gap-2 col-span-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Método:</span>
              <span className="font-medium">{pago.metodoPago}</span>
            </div>
          )}
        </div>

        {estaVencido && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800/50">
            <div className="flex items-center text-sm text-red-700 dark:text-red-400">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="font-medium">Pago vencido.</span>
              <span className="ml-1">Contacte a la administración para regularizar.</span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Descargar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Skeleton para carga
const PagosSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <Card key={i} className="animate-pulse">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)

// Estado vacío
const EstadoVacio = ({ icon: Icon, title, subtitle }) => (
  <div className="text-center py-12">
    <div className="p-4 rounded-full bg-muted/50 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
      <Icon className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="font-medium text-lg mb-2">{title}</h3>
    <p className="text-muted-foreground">{subtitle}</p>
  </div>
)

// Función para obtener el color y el icono según el estado
const getEstadoBadge = (estado) => {
  switch (estado) {
    case "pendiente":
      return {
        color:
          "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800/50",
        icon: <Clock className="h-3 w-3 mr-1" />,
      }
    case "pagado":
      return {
        color:
          "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/50",
        icon: <Check className="h-3 w-3 mr-1" />,
      }
    case "vencido":
      return {
        color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/50",
        icon: <AlertTriangle className="h-3 w-3 mr-1" />,
      }
    case "anulado":
      return {
        color:
          "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800/50",
        icon: <X className="h-3 w-3 mr-1" />,
      }
    default:
      return {
        color:
          "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800/50",
        icon: <FileText className="h-3 w-3 mr-1" />,
      }
  }
}

// Función para obtener clases de color
const getColorClasses = (color) => {
  const colors = {
    primary: {
      bg: "from-primary/10 to-primary/20",
      text: "text-primary",
    },
    success: {
      bg: "from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20",
      text: "text-emerald-600 dark:text-emerald-400",
    },
    warning: {
      bg: "from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20",
      text: "text-amber-600 dark:text-amber-400",
    },
    danger: {
      bg: "from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20",
      text: "text-red-600 dark:text-red-400",
    },
  }
  return colors[color] || colors.primary
}

export default function PagosHijoClient({ estudiante, hijos = [] }) {
  const [pagos, setPagos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(estudiante?.id || "")
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pagados: 0,
    pendientes: 0,
    vencidos: 0,
    porcentajePagado: 0,
  })

  // Cargar pagos del estudiante
  const cargarPagosEstudiante = async (id) => {
    if (!id) return
    setIsLoading(true)
    try {
      const response = await obtenerPagosPorEstudiante(id)
      if (response.success) {
        setPagos(response.pagos)
        // Calcular estadísticas
        const total = response.pagos.length
        const pagados = response.pagos.filter((p) => p.estado === "pagado").length
        const pendientes = response.pagos.filter((p) => p.estado === "pendiente").length
        // Calcular vencidos (pendientes con fecha vencida)
        const fechaActual = new Date()
        const vencidos = response.pagos.filter(
          (p) => p.estado === "pendiente" && new Date(p.fechaVencimiento) < fechaActual,
        ).length
        const porcentajePagado = total > 0 ? (pagados / total) * 100 : 0

        setEstadisticas({
          total,
          pagados,
          pendientes,
          vencidos,
          porcentajePagado,
        })
      } else {
        console.error("Error al cargar pagos:", response.error)
      }
    } catch (error) {
      console.error("Error al cargar pagos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar pagos cuando cambia el estudiante seleccionado
  useEffect(() => {
    if (estudianteSeleccionado) {
      cargarPagosEstudiante(estudianteSeleccionado)
    }
  }, [estudianteSeleccionado])

  // Cambiar estudiante seleccionado
  const cambiarEstudiante = (id) => {
    setEstudianteSeleccionado(id)
  }

  // Obtener estudiante actual
  const estudianteActual = estudiante || hijos.find((h) => h.id === estudianteSeleccionado) || {}

  // Función para renderizar la lista de pagos
  const renderListaPagos = (pagosFiltrados) => {
    if (isLoading) {
      return <PagosSkeleton />
    }

    if (pagosFiltrados.length === 0) {
      return (
        <EstadoVacio
          icon={FileText}
          title="No hay pagos en esta categoría"
          subtitle="Los pagos aparecerán aquí cuando estén disponibles"
        />
      )
    }

    return (
      <div className="space-y-4">
        {pagosFiltrados.map((pago) => (
          <PagoCard key={pago.id} pago={pago} />
        ))}
      </div>
    )
  }

  // Calcular pagos vencidos
  const pagosVencidos = pagos.filter((p) => p.estado === "pendiente" && new Date(p.fechaVencimiento) < new Date())

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* Header mejorado */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="hover:bg-muted">
          <Link href="/pagos">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Pagos de <span className="capitalize">{estudianteActual.name}</span></h1>
          </div>
          <p className="text-muted-foreground">Historial completo de pagos, estados y transacciones del estudiante</p>
        </div>
      </div>

      {/* Selector de hijo (si hay múltiples) */}
      {hijos.length > 1 && (
        <Card className="border-0 bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Seleccionar Estudiante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {hijos.map((hijo) => (
                <Button
                  key={hijo.id}
                  variant={hijo.id === estudianteSeleccionado ? "default" : "outline"}
                  onClick={() => cambiarEstudiante(hijo.id)}
                  className="transition-all duration-200"
                >
                  <span className="capitalize">{hijo.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Total de Pagos"
          value={estadisticas.total}
          icon={FileText}
          color="primary"
          subtitle="Pagos registrados"
        />
        <MetricCard
          title="Pagos Completados"
          value={estadisticas.pagados}
          icon={Check}
          color="success"
          subtitle={`${((estadisticas.pagados / estadisticas.total) * 100 || 0).toFixed(0)}% del total`}
        />
        <MetricCard
          title="Pagos Pendientes"
          value={estadisticas.pendientes}
          icon={Clock}
          color="warning"
          subtitle="Por procesar"
        />
        <MetricCard
          title="Pagos Vencidos"
          value={estadisticas.vencidos}
          icon={AlertTriangle}
          color="danger"
          subtitle="Requieren atención"
        />
      </div>

      {/* Progreso de pagos */}
      <Card className="border-0 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" /> Progreso de Pagos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {estadisticas.pagados} de {estadisticas.total} pagos completados
              </span>
              <span className="text-sm font-bold text-primary">{estadisticas.porcentajePagado.toFixed(0)}%</span>
            </div>
            <Progress
              value={estadisticas.porcentajePagado}
              className="h-3 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-emerald-600"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Inicio del período</span>
              <span>Meta: 100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de pagos con tabs mejorados */}
      <Card className="border-0 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="h-5 w-5 text-primary" /> Detalle de Pagos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="todos">
            <TabsList className="grid w-full grid-cols-4 bg-muted/50">
              <TabsTrigger value="todos" className="data-[state=active]:bg-background">
                Todos ({estadisticas.total})
              </TabsTrigger>
              <TabsTrigger value="pendientes" className="data-[state=active]:bg-background">
                Pendientes ({estadisticas.pendientes})
              </TabsTrigger>
              <TabsTrigger value="pagados" className="data-[state=active]:bg-background">
                Pagados ({estadisticas.pagados})
              </TabsTrigger>
              <TabsTrigger value="vencidos" className="data-[state=active]:bg-background">
                Vencidos ({estadisticas.vencidos})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="todos" className="mt-6">
              {renderListaPagos(pagos)}
            </TabsContent>
            <TabsContent value="pendientes" className="mt-6">
              {renderListaPagos(pagos.filter((p) => p.estado === "pendiente"))}
            </TabsContent>
            <TabsContent value="pagados" className="mt-6">
              {renderListaPagos(pagos.filter((p) => p.estado === "pagado"))}
            </TabsContent>
            <TabsContent value="vencidos" className="mt-6">
              {renderListaPagos(pagosVencidos)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
