"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { obtenerAnuncios } from "@/action/anuncios/anuncioActions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  Calendar,
  Eye,
  MessageSquare,
  Pin,
  Search,
  Star,
  User,
  Clock,
  Filter,
  Grid3X3,
  List,
  TrendingUp,
  Users,
  GraduationCap,
  RefreshCw,
  Share2,
  Heart,
  Zap,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/use-debounce"

export default function ListaAnuncios({ onVerAnuncio, onEditarAnuncio, userId }) {
  const [anuncios, setAnuncios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState("grid")
  const [favoritos, setFavoritos] = useState(new Set())
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  })

  // Filtros
  const [busqueda, setBusqueda] = useState("")
  const [dirigidoA, setDirigidoA] = useState("todos")
  const [activos, setActivos] = useState(true)
  const [importantes, setImportantes] = useState(null)
  const [sortBy, setSortBy] = useState("fecha")
  const [activeTab, setActiveTab] = useState("todos")

  // Debounce para búsqueda
  const debouncedBusqueda = useDebounce(busqueda, 300)

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const total = anuncios.length
    const activos = anuncios.filter((a) => a.activo).length
    const importantes = anuncios.filter((a) => a.importante).length
    const urgentes = anuncios.filter((a) => a.urgente).length

    return { total, activos, importantes, urgentes }
  }, [anuncios])

  // Cargar anuncios
  const cargarAnuncios = useCallback(async () => {
    setLoading(true)
    try {
      const resultado = await obtenerAnuncios({
        page: pagination.page,
        limit: pagination.limit,
        dirigidoA: dirigidoA || null,
        activos: activeTab === "activos" ? true : activeTab === "inactivos" ? false : activos,
        importantes: activeTab === "importantes" ? true : importantes,
        busqueda: debouncedBusqueda || "",
      })

      if (resultado.success) {
        setAnuncios(resultado.anuncios)
        setPagination(resultado.pagination)
      } else {
        setError(resultado.error)
      }
    } catch (error) {
      setError("Error al cargar anuncios")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, dirigidoA, activos, importantes, debouncedBusqueda, activeTab])

  useEffect(() => {
    cargarAnuncios()
  }, [cargarAnuncios])

  // Filtrar y ordenar anuncios localmente
  const anunciosFiltrados = useMemo(() => {
    const filtered = [...anuncios]

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "fecha":
          return new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion)
        case "titulo":
          return a.titulo.localeCompare(b.titulo)
        case "vistas":
          return (b.vistas || 0) - (a.vistas || 0)
        case "autor":
          return (a.autor?.name || "").localeCompare(b.autor?.name || "")
        default:
          return 0
      }
    })

    return filtered
  }, [anuncios, sortBy])

  const handleChangePage = (page) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleToggleFavorito = (anuncioId) => {
    setFavoritos((prev) => {
      const newFavoritos = new Set(prev)
      if (newFavoritos.has(anuncioId)) {
        newFavoritos.delete(anuncioId)
        toast.success("Eliminado de favoritos")
      } else {
        newFavoritos.add(anuncioId)
        toast.success("Agregado a favoritos")
      }
      return newFavoritos
    })
  }

  const handleShare = async (anuncio) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/anuncios/${anuncio.id}`)
      toast.success("Enlace copiado al portapapeles")
    } catch (error) {
      toast.error("Error al copiar enlace")
    }
  }

  if (loading && anuncios.length === 0) {
    return <LoadingState />
  }

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header con estadísticas */}
        <HeaderSection stats={stats} />

        {/* Tabs de navegación */}
        <NavigationTabs activeTab={activeTab} onTabChange={handleTabChange} stats={stats} />

        {/* Filtros y controles */}
        <FiltersSection
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          dirigidoA={dirigidoA}
          setDirigidoA={setDirigidoA}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onRefresh={cargarAnuncios}
          loading={loading}
        />

        {/* Mensaje de error */}
        {error && <ErrorAlert error={error} />}

        {/* Lista de anuncios */}
        <AnunciosContent
          anuncios={anunciosFiltrados}
          loading={loading}
          viewMode={viewMode}
          userId={userId}
          favoritos={favoritos}
          onVerAnuncio={onVerAnuncio}
          onEditarAnuncio={onEditarAnuncio}
          onToggleFavorito={handleToggleFavorito}
          onShare={handleShare}
        />

        {/* Paginación */}
        {pagination.pages > 1 && (
          <PaginationSection pagination={pagination} onPageChange={handleChangePage} totalResults={pagination.total} />
        )}
      </div>
    </TooltipProvider>
  )
}

// Componentes auxiliares
const LoadingState = () => (
  <div className="space-y-8">
    {/* Header skeleton */}
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-8 mb-2" />
              <Skeleton className="h-6 w-16 mb-1" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>

    {/* Tabs skeleton */}
    <Skeleton className="h-12 w-full" />

    {/* Filters skeleton */}
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>

    {/* Grid skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="h-96">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)

const HeaderSection = ({ stats }) => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Anuncios</h1>
        <p className="text-muted-foreground mt-1">Mantente informado con las últimas noticias y comunicados</p>
      </div>
    </div>

    {/* Estadísticas rápidas */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        icon={<MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
        title="Total"
        value={stats.total}
        description="Anuncios disponibles"
        color="blue"
      />
      <StatsCard
        icon={<TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />}
        title="Activos"
        value={stats.activos}
        description="Anuncios publicados"
        color="green"
      />
      <StatsCard
        icon={<Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
        title="Importantes"
        value={stats.importantes}
        description="Marcados como importantes"
        color="amber"
      />
      <StatsCard
        icon={<Zap className="h-5 w-5 text-red-600 dark:text-red-400" />}
        title="Urgentes"
        value={stats.urgentes}
        description="Requieren atención"
        color="red"
      />
    </div>
  </div>
)

const StatsCard = ({ icon, title, value, description, color }) => {
  const colorClasses = {
    blue: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/10 border-blue-200/50 dark:border-blue-800/50",
    green:
      "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10 border-green-200/50 dark:border-green-800/50",
    amber:
      "from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10 border-amber-200/50 dark:border-amber-800/50",
    red: "from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/10 border-red-200/50 dark:border-red-800/50",
  }

  return (
    <Card className={`border-0 shadow-sm bg-gradient-to-br ${colorClasses[color]}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-background/60">{icon}</div>
          <div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{title}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </CardContent>
    </Card>
  )
}

const NavigationTabs = ({ activeTab, onTabChange, stats }) => (
  <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
    <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/50">
      <TabsTrigger value="todos" className="flex items-center gap-2 data-[state=active]:bg-background">
        <MessageSquare className="h-4 w-4" />
        <span className="hidden sm:inline">Todos</span>
        <Badge variant="secondary" className="ml-1 text-xs">
          {stats.total}
        </Badge>
      </TabsTrigger>
      <TabsTrigger value="activos" className="flex items-center gap-2 data-[state=active]:bg-background">
        <TrendingUp className="h-4 w-4" />
        <span className="hidden sm:inline">Activos</span>
        <Badge variant="secondary" className="ml-1 text-xs">
          {stats.activos}
        </Badge>
      </TabsTrigger>
      <TabsTrigger value="importantes" className="flex items-center gap-2 data-[state=active]:bg-background">
        <Star className="h-4 w-4" />
        <span className="hidden sm:inline">Importantes</span>
        <Badge variant="secondary" className="ml-1 text-xs">
          {stats.importantes}
        </Badge>
      </TabsTrigger>
      <TabsTrigger value="urgentes" className="flex items-center gap-2 data-[state=active]:bg-background">
        <Zap className="h-4 w-4" />
        <span className="hidden sm:inline">Urgentes</span>
        <Badge variant="secondary" className="ml-1 text-xs">
          {stats.urgentes}
        </Badge>
      </TabsTrigger>
    </TabsList>
  </Tabs>
)

const FiltersSection = ({
  busqueda,
  setBusqueda,
  dirigidoA,
  setDirigidoA,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  onRefresh,
  loading,
}) => (
  <Card className="border-0 shadow-sm bg-gradient-to-r from-muted/30 to-muted/10">
    <CardContent className="p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar anuncios por título o contenido..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={dirigidoA} onValueChange={setDirigidoA}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Audiencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las audiencias</SelectItem>
              <SelectItem value="todos">Público general</SelectItem>
              <SelectItem value="profesores">Profesores</SelectItem>
              <SelectItem value="estudiantes">Estudiantes</SelectItem>
              <SelectItem value="padres">Padres</SelectItem>
              <SelectItem value="administrativos">Administrativos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fecha">Más recientes</SelectItem>
              <SelectItem value="titulo">Por título</SelectItem>
              <SelectItem value="vistas">Más vistas</SelectItem>
              <SelectItem value="autor">Por autor</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Vista en cuadrícula</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Vista en lista</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onRefresh} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Actualizar</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)

const ErrorAlert = ({ error }) => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)

const AnunciosContent = ({
  anuncios,
  loading,
  viewMode,
  userId,
  favoritos,
  onVerAnuncio,
  onEditarAnuncio,
  onToggleFavorito,
  onShare,
}) => {
  if (anuncios.length === 0 && !loading) {
    return <EmptyState />
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {anuncios.map((anuncio) => (
          <AnuncioListItem
            key={anuncio.id}
            anuncio={anuncio}
            userId={userId}
            isFavorito={favoritos.has(anuncio.id)}
            onVer={() => onVerAnuncio(anuncio)}
            onEditar={() => onEditarAnuncio(anuncio)}
            onToggleFavorito={() => onToggleFavorito(anuncio.id)}
            onShare={() => onShare(anuncio)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {anuncios.map((anuncio) => (
        <AnuncioCard
          key={anuncio.id}
          anuncio={anuncio}
          userId={userId}
          isFavorito={favoritos.has(anuncio.id)}
          onVer={() => onVerAnuncio(anuncio)}
          onEditar={() => onEditarAnuncio(anuncio)}
          onToggleFavorito={() => onToggleFavorito(anuncio.id)}
          onShare={() => onShare(anuncio)}
        />
      ))}
    </div>
  )
}

const EmptyState = () => (
  <Card className="border-2 border-dashed border-muted-foreground/25">
    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
        <MessageSquare className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No hay anuncios disponibles</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">
        No se encontraron anuncios que coincidan con los filtros seleccionados.
      </p>
      <Button variant="outline">
        <Filter className="h-4 w-4 mr-2" />
        Limpiar filtros
      </Button>
    </CardContent>
  </Card>
)

const AnuncioCard = ({ anuncio, userId, isFavorito, onVer, onEditar, onToggleFavorito, onShare }) => {
  const formatearFecha = (fecha) => {
    return format(new Date(fecha), "dd MMM yyyy", { locale: es })
  }

  const getAudienceBadge = (dirigidoA) => {
    const configs = {
      todos: { color: "bg-blue-500 dark:bg-blue-600", label: "Público general", icon: Users },
      profesores: { color: "bg-green-500 dark:bg-green-600", label: "Profesores", icon: User },
      estudiantes: { color: "bg-purple-500 dark:bg-purple-600", label: "Estudiantes", icon: GraduationCap },
      padres: { color: "bg-orange-500 dark:bg-orange-600", label: "Padres", icon: Users },
      administrativos: { color: "bg-gray-500 dark:bg-gray-600", label: "Administrativos", icon: User },
    }
    return configs[dirigidoA] || configs.todos
  }

  const audienceConfig = getAudienceBadge(anuncio.dirigidoA)
  const IconComponent = audienceConfig.icon

  return (
    <Card
      className={`group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 ${
        anuncio.fijado ? "ring-2 ring-blue-500/50 dark:ring-blue-400/50" : ""
      } ${!anuncio.activo ? "opacity-75" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {anuncio.titulo}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatearFecha(anuncio.fechaPublicacion)}
              </div>
              {anuncio.fechaExpiracion && (
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">Expira {formatearFecha(anuncio.fechaExpiracion)}</span>
                </div>
              )}
            </CardDescription>
          </div>

          <div className="flex items-center gap-1">
            {anuncio.fijado && (
              <Tooltip>
                <TooltipTrigger>
                  <Pin className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                </TooltipTrigger>
                <TooltipContent>Anuncio fijado</TooltipContent>
              </Tooltip>
            )}
            {anuncio.importante && (
              <Tooltip>
                <TooltipTrigger>
                  <Star className="h-4 w-4 text-amber-500 dark:text-amber-400 fill-current" />
                </TooltipTrigger>
                <TooltipContent>Importante</TooltipContent>
              </Tooltip>
            )}
            {anuncio.urgente && (
              <Tooltip>
                <TooltipTrigger>
                  <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
                </TooltipTrigger>
                <TooltipContent>Urgente</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className={`${audienceConfig.color} text-white border-0 text-xs flex items-center gap-1`}>
              <IconComponent className="h-3 w-3" />
              {audienceConfig.label}
            </Badge>
            {!anuncio.activo && (
              <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">
                Inactivo
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {anuncio.resumen || anuncio.contenido}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={anuncio.autor?.image || "/placeholder.svg"} alt={anuncio.autor?.name} />
                  <AvatarFallback className="text-xs">
                    {anuncio.autor?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{anuncio.autor?.name || "Usuario"}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              <span>{anuncio.vistas || 0}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex items-center gap-2">
        <Button onClick={onVer} className="flex-1">
          Ver anuncio
        </Button>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onToggleFavorito}
                className={isFavorito ? "text-red-500 hover:text-red-600" : ""}
              >
                <Heart className={`h-4 w-4 ${isFavorito ? "fill-current" : ""}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Compartir</TooltipContent>
          </Tooltip>

          {anuncio.autorId === userId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onEditar}>
                  <User className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Editar anuncio</TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

const AnuncioListItem = ({ anuncio, userId, isFavorito, onVer, onEditar, onToggleFavorito, onShare }) => {
  const formatearFecha = (fecha) => {
    return format(new Date(fecha), "dd MMM yyyy", { locale: es })
  }

  const getAudienceBadge = (dirigidoA) => {
    const configs = {
      todos: { color: "bg-blue-500 dark:bg-blue-600", label: "Público general" },
      profesores: { color: "bg-green-500 dark:bg-green-600", label: "Profesores" },
      estudiantes: { color: "bg-purple-500 dark:bg-purple-600", label: "Estudiantes" },
      padres: { color: "bg-orange-500 dark:bg-orange-600", label: "Padres" },
      administrativos: { color: "bg-gray-500 dark:bg-gray-600", label: "Administrativos" },
    }
    return configs[dirigidoA] || configs.todos
  }

  const audienceConfig = getAudienceBadge(anuncio.dirigidoA)

  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {anuncio.titulo}
                </h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Avatar className="w-4 h-4">
                      <AvatarImage src={anuncio.autor?.image || "/placeholder.svg"} alt={anuncio.autor?.name} />
                      <AvatarFallback className="text-xs">
                        {anuncio.autor?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span>{anuncio.autor?.name || "Usuario"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatearFecha(anuncio.fechaPublicacion)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {anuncio.vistas || 0} vistas
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {anuncio.fijado && <Pin className="h-4 w-4 text-blue-500 dark:text-blue-400" />}
                {anuncio.importante && <Star className="h-4 w-4 text-amber-500 dark:text-amber-400 fill-current" />}
                {anuncio.urgente && <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400" />}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={`${audienceConfig.color} text-white border-0 text-xs`}>{audienceConfig.label}</Badge>
              {!anuncio.activo && (
                <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">
                  Inactivo
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {anuncio.resumen || anuncio.contenido}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={onVer} size="sm">
              Ver
            </Button>
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-transparent"
                    onClick={onToggleFavorito}
                    style={{ color: isFavorito ? "#ef4444" : undefined }}
                  >
                    <Heart className={`h-3 w-3 ${isFavorito ? "fill-current" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={onShare}>
                    <Share2 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Compartir</TooltipContent>
              </Tooltip>

              {anuncio.autorId === userId && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={onEditar}>
                      <User className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Editar</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const PaginationSection = ({ pagination, onPageChange, totalResults }) => (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
    <p className="text-sm text-muted-foreground">
      Mostrando {(pagination.page - 1) * pagination.limit + 1} -{" "}
      {Math.min(pagination.page * pagination.limit, totalResults)} de {totalResults} resultados
    </p>

    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (pagination.page > 1) onPageChange(pagination.page - 1)
            }}
            className={pagination.page <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {[...Array(pagination.pages)].map((_, i) => {
          const page = i + 1
          if (page === 1 || page === pagination.pages || (page >= pagination.page - 1 && page <= pagination.page + 1)) {
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    onPageChange(page)
                  }}
                  isActive={page === pagination.page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          } else if (
            (page === pagination.page - 2 && pagination.page > 3) ||
            (page === pagination.page + 2 && pagination.page < pagination.pages - 2)
          ) {
            return <PaginationItem key={page}>...</PaginationItem>
          }
          return null
        })}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (pagination.page < pagination.pages) onPageChange(pagination.page + 1)
            }}
            className={pagination.page >= pagination.pages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>
)
