"use client"

import { useState, useEffect } from "react"
import { obtenerEventoPorId } from "@/action/eventos/eventoActions"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  User,
  School,
  Tag,
  Globe,
  Link,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  X,
  Video,
  Building,
  Mail,
  Phone,
  Edit,
  Info,
} from "lucide-react"
import { formatDate } from "@/lib/formatDate"

export default function DetalleEvento({ eventoId, onBack, userId }) {
  const [evento, setEvento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar datos del evento
  useEffect(() => {
    const cargarEvento = async () => {
      setLoading(true)
      try {
        const resultado = await obtenerEventoPorId(eventoId)
        if (resultado.success) {
          setEvento(resultado.evento)
        } else {
          setError(resultado.error)
        }
      } catch (error) {
        console.error("Error al cargar evento:", error)
        setError("Error al cargar los detalles del evento")
      } finally {
        setLoading(false)
      }
    }

    cargarEvento()
  }, [eventoId])

  // Obtener configuración de badges
  const getEstadoBadge = (estado) => {
    const configs = {
      programado: {
        color:
          "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800/50",
        icon: <Clock className="h-3 w-3" />,
      },
      en_curso: {
        color:
          "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/50",
        icon: <TrendingUp className="h-3 w-3" />,
      },
      finalizado: {
        color:
          "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800/50",
        icon: <Sparkles className="h-3 w-3" />,
      },
      cancelado: {
        color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/50",
        icon: <X className="h-3 w-3" />,
      },
    }
    return configs[estado] || configs.programado
  }

  const getTipoBadge = (tipo) => {
    const configs = {
      academico:
        "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-800/50",
      deportivo:
        "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-800/50",
      cultural:
        "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-800/50",
      administrativo:
        "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-800/50",
      social: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/20 dark:text-pink-400 dark:border-pink-800/50",
    }
    return configs[tipo] || configs.academico
  }

  // Componente de skeleton
  const DetalleSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  )

  // Estado de error
  const EstadoError = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 flex items-center justify-center mb-4">
        <X className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Error al cargar evento</h3>
      <p className="text-muted-foreground mb-4">{error}</p>
      <Button onClick={onBack} variant="outline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>
    </div>
  )

  // Renderizar contenido del evento
  const renderEvento = () => {
    if (!evento) return null

    const estadoBadge = getEstadoBadge(evento.estado)
    const tipoBadge = getTipoBadge(evento.tipo)

    return (
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        {/* Header */}
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-primary/10">
            <ArrowLeft className="h-4 w-4 mr-2" />Volver
          </Button>

          <div>
            <h1 className="text-3xl font-bold mb-3">{evento.titulo}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge className={`${tipoBadge} border`}>
                📚 {evento.tipo.charAt(0).toUpperCase() + evento.tipo.slice(1)}
              </Badge>
              <Badge className={`${estadoBadge.color} border flex items-center gap-1`}>
                {estadoBadge.icon}
                {evento.estado === "programado"
                  ? "Programado"
                  : evento.estado === "en_curso"
                    ? "En curso"
                    : evento.estado === "finalizado"
                      ? "Finalizado"
                      : "Cancelado"}
              </Badge>
              {evento.categoria && (
                <Badge variant="outline" className="border-dashed">
                  🏷️ {evento.categoria}
                </Badge>
              )}
              {evento.publico && (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800/50"
                >
                  🌍 Público
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Imagen del evento */}
        {evento.imagen && (
          <Card className="overflow-hidden">
            <div className="relative w-full h-64">
              <img
                src={evento.imagen || "/placeholder.svg"}
                alt={evento.titulo}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </Card>
        )}

        {/* Pestañas de información */}
        <Tabs defaultValue="detalles" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="detalles" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Detalles
            </TabsTrigger>
            <TabsTrigger value="ubicacion" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Ubicación
            </TabsTrigger>
            <TabsTrigger value="organizador" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Organizador
            </TabsTrigger>
          </TabsList>

          {/* Pestaña de detalles */}
          <TabsContent value="detalles" className="space-y-4">
            {evento.descripcion && (
              <Card className="bg-gradient-to-r from-background to-muted/20">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">
                    <p className="flex items-center gap-2">
                      <Edit className="h-4 w-4 mr-2" /> Descripción
                    </p>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{evento.descripcion}</p>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gradient-to-r from-background to-muted/20">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  <p className="flex items-center gap-2">
                    <Info className="h-4 w-4 mr-2" /> Información del evento
                  </p>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium"> Audiencia</p>
                      <p className="text-muted-foreground">
                        {evento.dirigidoA ? evento.dirigidoA : evento.publico ? "Público general" : "Privado"}
                      </p>
                    </div>
                  </div>

                  {evento.niveles && evento.niveles.length > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center">
                        <School className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-medium">🎓 Niveles académicos</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {evento.niveles.map((nivel) => (
                            <Badge key={nivel.id} variant="outline" className="text-xs">
                              {nivel.nombre}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {evento.grados && evento.grados.length > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center">
                        <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium">📚 Grados</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {evento.grados.map((grado) => (
                            <Badge key={grado.id} variant="outline" className="text-xs">
                              {grado.nombre}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {evento.requiereInscripcion && (
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="font-medium">📝 Inscripción</p>
                        <p className="text-muted-foreground">
                          Requiere inscripción previa
                          {evento.capacidadMaxima && ` (Máx: ${evento.capacidadMaxima} personas)`}
                        </p>
                        {evento.fechaLimiteInscripcion && (
                          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                            📅 Límite: {format(new Date(evento.fechaLimiteInscripcion), "PPP", { locale: es })}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de ubicación y horario */}
          <TabsContent value="ubicacion" className="space-y-4">
            <Card className="bg-gradient-to-r from-background to-muted/20">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 mr-2" /> Fecha y horario
                  </p>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium"> Fecha de inicio</p>
                      <p className="text-muted-foreground">
                        {formatDate(evento.fechaInicio)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium"> Fecha de fin</p>
                      <p className="text-muted-foreground">
                        {formatDate(evento.fechaFin)}
                      </p>
                    </div>
                  </div>

                  {evento.horaInicio && (
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium">Hora de inicio</p>
                        <p className="text-muted-foreground">{evento.horaInicio}</p>
                      </div>
                    </div>
                  )}

                  {evento.horaFin && (
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium">Hora de fin</p>
                        <p className="text-muted-foreground">{evento.horaFin}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-background to-muted/20">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 mr-2" /> Ubicación
                  </p>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium">Modalidad</p>
                      <p className="text-muted-foreground">
                        {evento.modalidad === "presencial"
                          ? "Presencial"
                          : evento.modalidad === "virtual"
                            ? "Virtual"
                            : evento.modalidad === "hibrido"
                              ? "Híbrido"
                              : "Presencial"}
                      </p>
                    </div>
                  </div>

                  {(evento.modalidad === "presencial" || evento.modalidad === "hibrido") && (
                    <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800/50">
                      <h4 className="font-medium flex items-center gap-2">
                        <Building className="h-4 w-4" /> Información presencial
                      </h4>

                      {evento.ubicacion && (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div>
                            <p className="font-medium">
                              Ubicación
                            </p>
                            <p className="text-muted-foreground">{evento.ubicacion}</p>
                          </div>
                        </div>
                      )}

                      {evento.aula && (
                        <div className="flex items-start gap-3">
                          <Building className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div>
                            <p className="font-medium">Aula/Salón</p>
                            <p className="text-muted-foreground">{evento.aula}</p>
                          </div>
                        </div>
                      )}

                      {evento.direccion && (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div>
                            <p className="font-medium">Dirección</p>
                            <p className="text-muted-foreground">{evento.direccion}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {(evento.modalidad === "virtual" || evento.modalidad === "hibrido") && evento.enlaceVirtual && (
                    <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800/50">
                      <h4 className="font-medium flex items-center gap-2">
                        <Video className="h-4 w-4" />💻 Información virtual
                      </h4>

                      <div className="flex items-start gap-3">
                        <Link className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                        <div>
                          <p className="font-medium">🔗 Enlace virtual</p>
                          <a
                            href={evento.enlaceVirtual}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 dark:text-purple-400 hover:underline break-all"
                          >
                            {evento.enlaceVirtual}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de organizador */}
          <TabsContent value="organizador">
            <Card className="bg-gradient-to-r from-background to-muted/20">
              <CardHeader>
                <CardTitle className="text-lg font-medium">👤 Información del organizador</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  {evento.organizador?.image ? (
                    <div className="relative h-16 w-16 rounded-full overflow-hidden">
                      <img
                        src={evento.organizador.image || "/placeholder.svg"}
                        alt={evento.organizador.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <p className="text-xl font-semibold">{evento.organizador?.name || "Usuario no disponible"}</p>
                      {evento.organizador?.role && (
                        <Badge variant="outline" className="mt-1">
                          {evento.organizador.role}
                        </Badge>
                      )}
                    </div>

                    {evento.organizador?.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${evento.organizador.email}`} className="hover:text-primary transition-colors">
                          {evento.organizador.email}
                        </a>
                      </div>
                    )}

                    {evento.organizador?.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${evento.organizador.phone}`} className="hover:text-primary transition-colors">
                          {evento.organizador.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return <div>{loading ? <DetalleSkeleton /> : error ? <EstadoError /> : renderEvento()}</div>
}
