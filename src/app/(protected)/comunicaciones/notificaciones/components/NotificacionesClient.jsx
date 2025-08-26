"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Bell,
  CheckCircle2,
  Filter,
  Info,
  MessageSquare,
  Search,
  BookMarkedIcon as MarkAsUnread,
  BellRing,
  Calendar,
  GraduationCap,
  UserCheck,
  Sparkles,
  Clipboard,
  Settings,
  BellDot,
} from "lucide-react"
import { NotificacionCard } from "./NotificacionCard"
import { ConfiguracionNotificaciones } from "./ConfiguracionNotificaciones"

export const NotificacionesClient = () => {
  const { toast } = useToast()
  const [notificaciones, setNotificaciones] = useState([])
  const [filteredNotificaciones, setFilteredNotificaciones] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("todas")

  // Datos de ejemplo mejorados
  const notificacionesEjemplo = [
    {
      id: 1,
      tipo: "anuncio",
      titulo: "📢 Reunión de padres de familia",
      mensaje:
        "Se llevará a cabo una reunión de padres de familia el próximo viernes a las 18:00 horas en el auditorio principal.",
      fecha: "2025-07-05T14:30:00",
      leido: false,
      prioridad: "alta",
      remitente: {
        nombre: "Director Académico",
        avatar: "/placeholder.svg?height=40&width=40",
        rol: "Dirección",
      },
    },
    {
      id: 2,
      tipo: "mensaje",
      titulo: "💬 Consulta sobre tarea de matemáticas",
      mensaje: "Estimado profesor, tengo una duda sobre el ejercicio 5 de la tarea de ecuaciones cuadráticas.",
      fecha: "2025-07-06T09:15:00",
      leido: true,
      prioridad: "media",
      remitente: {
        nombre: "Carlos Gómez",
        avatar: "/placeholder.svg?height=40&width=40",
        rol: "Estudiante",
      },
    },
    {
      id: 3,
      tipo: "calificacion",
      titulo: "📊 Nueva calificación registrada",
      mensaje: "Se ha registrado una nueva calificación de 18/20 en la materia de Física - Examen Parcial.",
      fecha: "2025-07-06T11:45:00",
      leido: false,
      prioridad: "media",
      remitente: {
        nombre: "Sistema Académico",
        avatar: "/placeholder.svg?height=40&width=40",
        rol: "Sistema",
      },
    },
    {
      id: 4,
      tipo: "evento",
      titulo: "🔬 Feria de Ciencias 2025",
      mensaje:
        "No olvides que la Feria de Ciencias se realizará el próximo miércoles en el auditorio principal. ¡Prepara tu proyecto!",
      fecha: "2025-07-04T16:20:00",
      leido: true,
      prioridad: "alta",
      remitente: {
        nombre: "Coordinación Académica",
        avatar: "/placeholder.svg?height=40&width=40",
        rol: "Coordinación",
      },
    },
    {
      id: 5,
      tipo: "asistencia",
      titulo: "⚠️ Registro de inasistencia",
      mensaje: "Se ha registrado una inasistencia para el alumno Juan Pérez en la clase de Historia del día de hoy.",
      fecha: "2025-07-07T08:30:00",
      leido: false,
      prioridad: "alta",
      remitente: {
        nombre: "Control de Asistencia",
        avatar: "/placeholder.svg?height=40&width=40",
        rol: "Sistema",
      },
    },
  ]

  useEffect(() => {
    const fetchNotificaciones = async () => {
      setIsLoading(true)
      try {
        setTimeout(() => {
          setNotificaciones(notificacionesEjemplo)
          setFilteredNotificaciones(notificacionesEjemplo)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error al cargar notificaciones:", error)
        toast({
          title: "Error al cargar notificaciones",
          description: "No se pudieron cargar las notificaciones. Intente nuevamente.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchNotificaciones()
  }, [toast])

  useEffect(() => {
    let filtered = notificaciones

    if (filter !== "todas") {
      if (filter === "no-leidas") {
        filtered = filtered.filter((notif) => !notif.leido)
      } else {
        filtered = filtered.filter((notif) => notif.tipo === filter)
      }
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (notif) =>
          notif.titulo.toLowerCase().includes(term) ||
          notif.mensaje.toLowerCase().includes(term) ||
          notif.remitente.nombre.toLowerCase().includes(term),
      )
    }

    setFilteredNotificaciones(filtered)
  }, [notificaciones, searchTerm, filter])

  const handleMarcarLeido = (id) => {
    setNotificaciones((prev) => prev.map((notif) => (notif.id === id ? { ...notif, leido: true } : notif)))
    toast({
      title: "✅ Notificación marcada como leída",
    })
  }

  const handleMarcarTodosLeidos = () => {
    setNotificaciones((prev) => prev.map((notif) => ({ ...notif, leido: true })))
    toast({
      title: "🎉 Todas las notificaciones marcadas como leídas",
      description: "Has puesto al día todas tus notificaciones",
    })
  }

  const handleEliminarNotificacion = (id) => {
    setNotificaciones((prev) => prev.filter((notif) => notif.id !== id))
    toast({
      title: "🗑️ Notificación eliminada",
      description: "La notificación ha sido eliminada permanentemente",
    })
  }

  const getTipoConfig = (tipo) => {
    const configs = {
      anuncio: {
        icon: Info,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-950/20",
        label: "Anuncio",
      },
      mensaje: {
        icon: MessageSquare,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-950/20",
        label: "Mensaje",
      },
      calificacion: {
        icon: GraduationCap,
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-50 dark:bg-purple-950/20",
        label: "Calificación",
      },
      evento: {
        icon: Calendar,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-950/20",
        label: "Evento",
      },
      asistencia: {
        icon: UserCheck,
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-950/20",
        label: "Asistencia",
      },
    }
    return (
      configs[tipo] || {
        icon: Bell,
        color: "text-gray-600 dark:text-gray-400",
        bg: "bg-gray-50 dark:bg-gray-950/20",
        label: "General",
      }
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()

    if (date.toDateString() === now.toDateString()) {
      return `Hoy a las ${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`
    }

    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) {
      return `Ayer a las ${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`
    }

    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`
  }

  const noLeidasCount = notificaciones.filter((n) => !n.leido).length
  const tiposCounts = {
    anuncio: notificaciones.filter((n) => n.tipo === "anuncio").length,
    mensaje: notificaciones.filter((n) => n.tipo === "mensaje").length,
    calificacion: notificaciones.filter((n) => n.tipo === "calificacion").length,
    evento: notificaciones.filter((n) => n.tipo === "evento").length,
    asistencia: notificaciones.filter((n) => n.tipo === "asistencia").length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto py-8 space-y-8 animate-in fade-in-50 duration-500">
        {/* Header mejorado */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 dark:border-primary/10">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                    <BellRing className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight"> Centro de Notificaciones</h1>
                </div>
                <p className="text-muted-foreground text-lg">
                  Mantente al día con todas las comunicaciones importantes del sistema escolar
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={noLeidasCount > 0 ? "destructive" : "secondary"}
                  className="px-3 py-1 text-sm font-medium"
                >
                  {noLeidasCount > 0 ? (
                    <>
                      <Sparkles className="h-3 w-3 mr-1" />
                      {noLeidasCount} sin leer
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Todo al día
                    </>
                  )}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarcarTodosLeidos}
                  disabled={noLeidasCount === 0}
                  className="transition-all duration-200 hover:scale-105 bg-transparent"
                >
                  <MarkAsUnread className="h-4 w-4 mr-2" />
                  Marcar todo leído
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatsCard title="Total" value={notificaciones.length} icon={Bell} color="primary" />
          <StatsCard title="Sin leer" value={noLeidasCount} icon={BellRing} color="destructive" />
          <StatsCard title="Anuncios" value={tiposCounts.anuncio} icon={Info} color="blue" />
          <StatsCard title="Mensajes" value={tiposCounts.mensaje} icon={MessageSquare} color="emerald" />
          <StatsCard title="Eventos" value={tiposCounts.evento} icon={Calendar} color="amber" />
          <StatsCard title="Calificaciones" value={tiposCounts.calificacion} icon={GraduationCap} color="purple" />
        </div>

        <Tabs defaultValue="todas" className="w-full">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full lg:w-auto">
              <TabsTrigger value="todas" onClick={() => setFilter("todas")} className="text-xs lg:text-sm">
                <Clipboard className="h-4 w-4" /> Todas
              </TabsTrigger>
              <TabsTrigger value="no-leidas" onClick={() => setFilter("no-leidas")} className="text-xs lg:text-sm">
                <BellDot className="h-4 w-4" /> Sin leer
              </TabsTrigger>
              <TabsTrigger value="anuncio" onClick={() => setFilter("anuncio")} className="text-xs lg:text-sm">
                <Bell className="h-4 w-4" /> Anuncios
              </TabsTrigger>
              <TabsTrigger value="mensaje" onClick={() => setFilter("mensaje")} className="text-xs lg:text-sm">
                <MessageSquare className="h-4 w-4" /> Mensajes
              </TabsTrigger>
              <TabsTrigger value="evento" onClick={() => setFilter("evento")} className="text-xs lg:text-sm">
                <Calendar className="h-4 w-4" /> Eventos
              </TabsTrigger>
              <TabsTrigger value="configuracion" className="text-xs lg:text-sm">
                <Settings className="h-4 w-4" /> Config
              </TabsTrigger>
            </TabsList>

            <div className="flex w-full lg:w-auto gap-2">
              <div className="relative flex-1 lg:flex-none lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar notificaciones..."
                  className="pl-10 bg-background/50 border-muted-foreground/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="shrink-0 bg-transparent">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="todas" className="space-y-4">
            {isLoading ? (
              <NotificacionesSkeleton />
            ) : filteredNotificaciones.length > 0 ? (
              <div className="space-y-4">
                {filteredNotificaciones.map((notificacion) => (
                  <NotificacionCard
                    key={notificacion.id}
                    notificacion={notificacion}
                    onMarcarLeido={handleMarcarLeido}
                    onEliminar={handleEliminarNotificacion}
                    formatDate={formatDate}
                    getTipoConfig={getTipoConfig}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Bell}
                title="No hay notificaciones"
                description="No se encontraron notificaciones que coincidan con tu búsqueda"
              />
            )}
          </TabsContent>

          <TabsContent value="no-leidas" className="space-y-4">
            {isLoading ? (
              <NotificacionesSkeleton />
            ) : filteredNotificaciones.filter((n) => !n.leido).length > 0 ? (
              <div className="space-y-4">
                {filteredNotificaciones
                  .filter((n) => !n.leido)
                  .map((notificacion) => (
                    <NotificacionCard
                      key={notificacion.id}
                      notificacion={notificacion}
                      onMarcarLeido={handleMarcarLeido}
                      onEliminar={handleEliminarNotificacion}
                      formatDate={formatDate}
                      getTipoConfig={getTipoConfig}
                    />
                  ))}
              </div>
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="¡Excelente trabajo!"
                description="Has leído todas tus notificaciones. Mantente al día con las comunicaciones."
                variant="success"
              />
            )}
          </TabsContent>

          {["anuncio", "mensaje", "evento"].map((tipo) => (
            <TabsContent key={tipo} value={tipo} className="space-y-4">
              {isLoading ? (
                <NotificacionesSkeleton />
              ) : filteredNotificaciones.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotificaciones.map((notificacion) => (
                    <NotificacionCard
                      key={notificacion.id}
                      notificacion={notificacion}
                      onMarcarLeido={handleMarcarLeido}
                      onEliminar={handleEliminarNotificacion}
                      formatDate={formatDate}
                      getTipoConfig={getTipoConfig}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={getTipoConfig(tipo).icon}
                  title={`No hay ${getTipoConfig(tipo).label.toLowerCase()}s`}
                  description={`No tienes ${getTipoConfig(tipo).label.toLowerCase()}s en este momento`}
                />
              )}
            </TabsContent>
          ))}

          <TabsContent value="configuracion">
            <ConfiguracionNotificaciones />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Componente de estadísticas
const StatsCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    primary: "text-primary bg-primary/10 border-primary/20",
    destructive: "text-destructive bg-destructive/10 border-destructive/20",
    blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/50",
    emerald:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50",
    amber:
      "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50",
    purple:
      "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/50",
  }

  return (
    <Card className="transition-all duration-200 hover:scale-105 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente de estado vacío
const EmptyState = ({ icon: Icon, title, description, variant = "default" }) => {
  const variants = {
    default: "text-muted-foreground",
    success: "text-emerald-600 dark:text-emerald-400",
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <div className={`p-4 rounded-full bg-muted/50 ${variants[variant]}`}>
        <Icon className="h-12 w-12" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground max-w-md">{description}</p>
      </div>
    </div>
  )
}

// Skeleton de carga
const NotificacionesSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-64" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex justify-end gap-2 pt-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default NotificacionesClient
