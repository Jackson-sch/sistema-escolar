"use client"

import { useState, useEffect } from "react"
import { obtenerEventos } from "@/action/eventos/eventoActions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  CalendarIcon,
  Eye,
  Pencil,
  CalendarPlus2Icon as CalendarIcon2,
  MapPin,
  Clock,
  Users,
  Filter,
  Search,
  X,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Square,
} from "lucide-react"
import { useInstitucion } from "@/hooks/useInstitucion"

export default function ListaEventos({ onVerEvento, onEditarEvento, userId }) {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtros, setFiltros] = useState({
    tipo: "",
    estado: "",
    fechaInicio: null,
    fechaFin: null,
    page: 1,
    limit: 10,
  })
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })

  const { institucion } = useInstitucion()

  // Cargar eventos
  useEffect(() => {
    const cargarEventos = async () => {
      setLoading(true)
      try {
        const resultado = await obtenerEventos({ ...filtros, search: searchTerm })
        if (resultado.success) {
          setEventos(resultado.eventos)
          setPagination(resultado.pagination)
        } else {
          setError(resultado.error)
        }
      } catch (error) {
        console.error("Error al cargar eventos:", error)
        setError("Error al cargar los eventos")
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(cargarEventos, 300)
    return () => clearTimeout(timeoutId)
  }, [filtros, searchTerm])

  // Manejar cambio de filtros
  const handleFiltroChange = (key, value) => {
    setFiltros((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }))
  }

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      tipo: "",
      estado: "",
      fechaInicio: null,
      fechaFin: null,
      page: 1,
      limit: 10,
    })
    setSearchTerm("")
  }

  // Manejar cambio de página
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return
    setFiltros((prev) => ({
      ...prev,
      page: newPage,
    }))
  }

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
  const EventosSkeleton = () => (
    <div className="space-y-4">
      {Array(3)
        .fill(0)
        .map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="flex md:flex-col gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  )

  // Estado vacío
  const EstadoVacio = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="relative mb-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20 flex items-center justify-center">
          <CalendarIcon2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Sparkles className="h-3 w-3 text-white" />
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2">No hay eventos disponibles</h3>
      <p className="text-muted-foreground max-w-sm">
        {searchTerm || Object.values(filtros).some((v) => v && v !== "")
          ? "No se encontraron eventos que coincidan con los filtros aplicados"
          : "Aún no se han creado eventos en el sistema"}
      </p>
      {(searchTerm || Object.values(filtros).some((v) => v && v !== "")) && (
        <Button variant="outline" onClick={limpiarFiltros} className="mt-4 bg-transparent">
          <X className="h-4 w-4 mr-2" />
          Limpiar filtros
        </Button>
      )}
    </div>
  )

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header con estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">📅 Total Eventos</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">{pagination.total}</p>
              </div>
              <CalendarIcon2 className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">🎯 En Curso</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">
                  {eventos.filter((e) => e.estado === "en_curso").length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-600 dark:text-emerald-400 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">⏰ Programados</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-300">
                  {eventos.filter((e) => e.estado === "programado").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-400">🎨 Culturales</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                  {eventos.filter((e) => e.tipo === "cultural").length}
                </p>
              </div>
              <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros mejorados */}
      <Card className="bg-gradient-to-r from-background to-muted/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />🔍 Filtros de búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos por título, descripción o organizador..."
              className="pl-10 bg-background/50 backdrop-blur-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtros en grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 flex items-center">
                <Square className="mr-2 h-4 w-4" /> Tipo
              </label>
              <Select
                value={filtros.tipo || "todos"}
                onValueChange={(value) => handleFiltroChange("tipo", value === "todos" ? "" : value)}
              >
                <SelectTrigger className="bg-background/50 backdrop-blur-sm w-full">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">🌟 Todos los tipos</SelectItem>
                  <SelectItem value="academico">📚 Académico</SelectItem>
                  <SelectItem value="deportivo">⚽ Deportivo</SelectItem>
                  <SelectItem value="cultural">🎨 Cultural</SelectItem>
                  <SelectItem value="administrativo">📋 Administrativo</SelectItem>
                  <SelectItem value="social">👥 Social</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4" /> Estado
              </label>
              <Select
                value={filtros.estado || "todos"}
                onValueChange={(value) => handleFiltroChange("estado", value === "todos" ? "" : value)}
              >
                <SelectTrigger className="bg-background/50 backdrop-blur-sm w-full">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">🌟 Todos los estados</SelectItem>
                  <SelectItem value="programado">⏰ Programado</SelectItem>
                  <SelectItem value="en_curso">🎯 En curso</SelectItem>
                  <SelectItem value="finalizado">✅ Finalizado</SelectItem>
                  <SelectItem value="cancelado">❌ Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" /> Fecha inicio
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-background/50 backdrop-blur-sm"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filtros.fechaInicio ? (
                      format(filtros.fechaInicio, "PPP", { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filtros.fechaInicio}
                    onSelect={(date) => handleFiltroChange("fechaInicio", date)}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" /> Fecha fin
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-background/50 backdrop-blur-sm"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filtros.fechaFin ? (
                      format(filtros.fechaFin, "PPP", { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filtros.fechaFin}
                    onSelect={(date) => handleFiltroChange("fechaFin", date)}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-between items-center pt-2">
            <div className="text-sm text-muted-foreground">
              {eventos.length > 0 && `Mostrando ${eventos.length} de ${pagination.total} eventos`}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={limpiarFiltros} size="sm">
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de eventos */}
      {loading ? (
        <EventosSkeleton />
      ) : error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-950/20">
          <CardContent className="p-6 text-center">
            <div className="text-red-600 dark:text-red-400 text-lg mb-2">Error al cargar eventos</div>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </CardContent>
        </Card>
      ) : eventos.length === 0 ? (
        <EstadoVacio />
      ) : (
        <div className="space-y-4">
          {eventos.map((evento) => {
            const estadoBadge = getEstadoBadge(evento.estado)
            const tipoBadge = getTipoBadge(evento.tipo)

            return (
              <Card
                key={evento.id}
                className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.01] bg-gradient-to-r from-background to-muted/10"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                          {evento.titulo}
                        </h3>
                        <Badge className={`${tipoBadge} border`}>
                          {evento.tipo.charAt(0).toUpperCase() + evento.tipo.slice(1)}
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
                      </div>

                      <div className="flex items-center text-muted-foreground">
                        <CalendarIcon2 className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                          {format(new Date(evento.fechaInicio), "PPP", { locale: es })}
                          {evento.horaInicio && ` - ${evento.horaInicio}`}
                        </span>
                      </div>

                      {evento.ubicacion && (
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="text-sm">{evento.ubicacion}</span>
                        </div>
                      )}

                      <div className="flex items-center text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                          {evento.dirigidoA ? `Para: ${evento.dirigidoA}` : evento.publico ? "Público" : "Privado"}
                        </span>
                      </div>

                      {evento.descripcion && (
                        <p className="text-muted-foreground text-sm line-clamp-2">{evento.descripcion}</p>
                      )}
                    </div>

                    <div className="flex md:flex-col justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onVerEvento(evento)}
                        className="flex items-center hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 dark:hover:bg-blue-950/20 dark:hover:text-blue-400"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>

                      {evento.organizadorId === userId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditarEvento(evento)}
                          className="flex items-center hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 dark:hover:bg-amber-950/20 dark:hover:text-amber-400"
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Paginación mejorada */}
      {!loading && eventos.length > 0 && pagination.totalPages > 1 && (
        <Card className="bg-gradient-to-r from-background to-muted/20">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} eventos
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="hover:bg-primary/10"
                >
                  ← Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={pagination.page === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="hover:bg-primary/10"
                >
                  Siguiente →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
