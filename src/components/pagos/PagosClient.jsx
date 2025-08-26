"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  AlertCircle,
  CreditCard,
  FileText,
  Plus,
  Search,
  Download,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  ArrowRight,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Filter,
  Settings,
  Bell,
} from "lucide-react"
import { obtenerEstadisticasPagos } from "@/action/pagos/pagoActions"
import EstadisticasPagos from "./EstadisticasPagos"

// Componente para las cards de acción rápida
const ActionCard = ({ href, icon: Icon, title, description, color = "primary", badge, onClick }) => (
  <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-background to-muted/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <CardContent className="p-0">
      {href ? (
        <Link href={href} className="block p-6 h-full">
          <ActionCardContent Icon={Icon} title={title} description={description} color={color} badge={badge} />
        </Link>
      ) : (
        <button onClick={onClick} className="w-full p-6 h-full text-left">
          <ActionCardContent Icon={Icon} title={title} description={description} color={color} badge={badge} />
        </button>
      )}
    </CardContent>
  </Card>
)

const ActionCardContent = ({ Icon, title, description, color, badge }) => (
  <div className="flex flex-col h-full">
    <div className="flex items-start justify-between mb-4">
      <div
        className={`p-3 rounded-xl bg-gradient-to-br ${getColorClasses(color).bg} group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className={`h-6 w-6 ${getColorClasses(color).text}`} />
      </div>
      {badge && (
        <Badge variant="secondary" className="text-xs">
          {badge}
        </Badge>
      )}
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
    <div className="flex items-center text-primary mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1">
      <span className="text-sm font-medium mr-1">Ver más</span>
      <ArrowRight className="h-4 w-4" />
    </div>
  </div>
)

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
    info: {
      bg: "from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20",
      text: "text-blue-600 dark:text-blue-400",
    },
    purple: {
      bg: "from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20",
      text: "text-purple-600 dark:text-purple-400",
    },
  }
  return colors[color] || colors.primary
}

// Componente para estadísticas rápidas
const QuickStats = ({ estadisticas, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-muted rounded-lg" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-6 bg-muted rounded w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!estadisticas) return null

  const stats = [
    {
      title: "Total Recaudado",
      value: `S/ ${estadisticas.totalRecaudado?.toLocaleString() || "0"}`,
      icon: DollarSign,
      color: "success",
      trend: "+12%",
    },
    {
      title: "Pagos Pendientes",
      value: estadisticas.pagosPendientes || "0",
      icon: Clock,
      color: "warning",
      trend: "-5%",
    },
    {
      title: "Pagos Completados",
      value: estadisticas.pagosCompletados || "0",
      icon: CheckCircle2,
      color: "success",
      trend: "+8%",
    },
    {
      title: "Pagos Vencidos",
      value: estadisticas.pagosVencidos || "0",
      icon: AlertTriangle,
      color: "danger",
      trend: "+3%",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden border-0 bg-gradient-to-br from-background to-muted/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                {stat.trend && (
                  <div
                    className={`flex items-center text-xs ${
                      stat.trend.startsWith("+") ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.trend} vs mes anterior
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${getColorClasses(stat.color).bg}`}>
                <stat.icon className={`h-6 w-6 ${getColorClasses(stat.color).text}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function PagosClient() {
  const router = useRouter()
  const [estadisticas, setEstadisticas] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    const cargarEstadisticas = async () => {
      setIsLoading(true)
      try {
        const response = await obtenerEstadisticasPagos()
        if (response.success) {
          setEstadisticas(response.estadisticas)
        } else {
          console.error("Error al cargar estadísticas:", response.error)
        }
      } catch (error) {
        console.error("Error al cargar estadísticas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    cargarEstadisticas()
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* Header mejorado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight"> Gestión de Pagos</h1>
          </div>
          <p className="text-muted-foreground">
            Centro de control para administrar pagos, transacciones y reportes financieros
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notificaciones
          </Button>
          <Button onClick={() => router.push("/pagos/registrar")} className="shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Pago
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <QuickStats estadisticas={estadisticas} isLoading={isLoading} />

      {/* Estadísticas detalladas */}
      <EstadisticasPagos estadisticas={estadisticas} isLoading={isLoading} />

      {/* Accesos rápidos mejorados */}
      <Card className="border-0 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5 text-primary" /> Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="acciones" className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md bg-muted/50">
              <TabsTrigger value="acciones" className="data-[state=active]:bg-background">
                ⚡ Acciones
              </TabsTrigger>
              <TabsTrigger value="consultas" className="data-[state=active]:bg-background">
                🔍 Consultas
              </TabsTrigger>
              <TabsTrigger value="reportes" className="data-[state=active]:bg-background">
                📊 Reportes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="acciones" className="mt-6">
              <div className="grid gap-6 md:grid-cols-3">
                <ActionCard
                  href="/pagos/registrar"
                  icon={Plus}
                  title="Registrar Pago"
                  description="Crear y procesar nuevos pagos para estudiantes con validación automática"
                  color="success"
                  badge="Nuevo"
                />
                <ActionCard
                  href="/pagos/consultar"
                  icon={Search}
                  title="Consultar Pagos"
                  description="Buscar, filtrar y gestionar pagos existentes con herramientas avanzadas"
                  color="info"
                />
                <ActionCard
                  href="/pagos/vencidos"
                  icon={AlertCircle}
                  title="Pagos Vencidos"
                  description="Gestionar pagos con fecha vencida y enviar recordatorios automáticos"
                  color="danger"
                  badge={estadisticas?.pagosVencidos || "0"}
                />
              </div>
            </TabsContent>

            <TabsContent value="consultas" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <ActionCard
                  href="/pagos/consultar?tipo=estudiante"
                  icon={Users}
                  title="Consulta por Estudiante"
                  description="Ver historial completo de pagos, estados y transacciones por estudiante específico"
                  color="info"
                />
                <ActionCard
                  href="/pagos/consultar?tipo=concepto"
                  icon={FileText}
                  title="Consulta por Concepto"
                  description="Analizar pagos agrupados por tipo de concepto, matrícula, pensiones y otros"
                  color="purple"
                />
              </div>
            </TabsContent>

            <TabsContent value="reportes" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <ActionCard
                  href="/pagos/reportes"
                  icon={BarChart3}
                  title="Reportes Financieros"
                  description="Generar informes detallados de ingresos, morosidad, tendencias y análisis financiero"
                  color="purple"
                />
                <ActionCard
                  href="/pagos/exportar"
                  icon={Download}
                  title="Exportar Datos"
                  description="Exportar información de pagos en múltiples formatos: Excel, PDF, CSV y JSON"
                  color="info"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Acciones adicionales */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-colors">
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium mb-2">Programar Recordatorios</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Configurar recordatorios automáticos para pagos próximos a vencer
            </p>
            <Button variant="outline" size="sm">
              Configurar
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-colors">
          <CardContent className="p-6 text-center">
            <Filter className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium mb-2">Filtros Avanzados</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crear y guardar filtros personalizados para consultas frecuentes
            </p>
            <Button variant="outline" size="sm">
              Crear Filtro
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-colors">
          <CardContent className="p-6 text-center">
            <FileSpreadsheet className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium mb-2">Importar Datos</h3>
            <p className="text-sm text-muted-foreground mb-4">Importar pagos masivos desde archivos Excel o CSV</p>
            <Button variant="outline" size="sm">
              Importar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
