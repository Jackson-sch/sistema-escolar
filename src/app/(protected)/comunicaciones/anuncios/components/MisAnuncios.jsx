"use client"

import { useState, useEffect, useMemo } from "react"
import { obtenerAnuncios, eliminarAnuncio } from "@/action/anuncios/anuncioActions"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertCircle,
  Calendar,
  Edit,
  Eye,
  Pin,
  Star,
  Trash2,
  Search,
  Plus,
  Clock,
  TrendingUp,
  FileText,
  MoreVertical,
  RefreshCw,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"

export default function MisAnuncios({ userId, onVerAnuncio, onEditarAnuncio, onCrearAnuncio }) {
  const [anuncios, setAnuncios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("fecha")
  const [filterStatus, setFilterStatus] = useState("todos")
  const [filterAudience, setFilterAudience] = useState("todos")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    pages: 0,
  })

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const total = anuncios.length
    const activos = anuncios.filter((a) => a.activo).length
    const importantes = anuncios.filter((a) => a.importante).length
    const totalVistas = anuncios.reduce((sum, a) => sum + (a.vistas || 0), 0)

    return { total, activos, importantes, totalVistas }
  }, [anuncios])

  // Cargar anuncios
  const cargarAnuncios = async () => {
    if (!userId) return

    setLoading(true)
    try {
      const resultado = await obtenerAnuncios({
        page: pagination.page,
        limit: pagination.limit,
        autorId: userId,
      })

      if (resultado.success) {
        const anunciosFiltrados = resultado.anuncios.filter((a) => a.autorId === userId)
        setAnuncios(anunciosFiltrados)
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
  }

  useEffect(() => {
    if (userId) {
      cargarAnuncios()
    }
  }, [userId, pagination.page])

  // Filtrar y ordenar anuncios
  const anunciosFiltrados = useMemo(() => {
    const filtered = anuncios.filter((anuncio) => {
      const matchesSearch =
        anuncio.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        anuncio.contenido.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        filterStatus === "todos" ||
        (filterStatus === "activos" && anuncio.activo) ||
        (filterStatus === "inactivos" && !anuncio.activo)

      const matchesAudience = filterAudience === "todos" || anuncio.dirigidoA === filterAudience

      return matchesSearch && matchesStatus && matchesAudience
    })

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "fecha":
          return new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion)
        case "titulo":
          return a.titulo.localeCompare(b.titulo)
        case "vistas":
          return (b.vistas || 0) - (a.vistas || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [anuncios, searchTerm, filterStatus, filterAudience, sortBy])

  const handleEliminarAnuncio = async (id) => {
    try {
      const resultado = await eliminarAnuncio(id)
      if (resultado.success) {
        toast.success("Anuncio eliminado correctamente")
        cargarAnuncios()
      } else {
        toast.error(resultado.error || "Error al eliminar el anuncio")
      }
    } catch (error) {
      console.error("Error al eliminar anuncio:", error)
      toast.error("Error al eliminar el anuncio")
    }
  }

  const handleDuplicarAnuncio = (anuncio) => {
    // Lógica para duplicar anuncio
    toast.success("Anuncio duplicado (funcionalidad pendiente)")
  }

  const handleArchivarAnuncio = (anuncio) => {
    // Lógica para archivar anuncio
    toast.success("Anuncio archivado (funcionalidad pendiente)")
  }

  if (loading && anuncios.length === 0) {
    return <LoadingState />
  }

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header con estadísticas */}
        <HeaderSection stats={stats} onCrearAnuncio={onCrearAnuncio} />

        {/* Filtros y búsqueda */}
        <FiltersSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterAudience={filterAudience}
          setFilterAudience={setFilterAudience}
          onRefresh={cargarAnuncios}
          loading={loading}
        />

        {/* Mensaje de error */}
        {error && <ErrorAlert error={error} />}

        {/* Lista de anuncios */}
        <AnunciosGrid
          anuncios={anunciosFiltrados}
          loading={loading}
          onVerAnuncio={onVerAnuncio}
          onEditarAnuncio={onEditarAnuncio}
          onEliminarAnuncio={handleEliminarAnuncio}
          onDuplicarAnuncio={handleDuplicarAnuncio}
          onArchivarAnuncio={handleArchivarAnuncio}
        />

        {/* Paginación */}
        {pagination.pages > 1 && (
          <PaginationSection
            pagination={pagination}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          />
        )}
      </div>
    </TooltipProvider>
  )
}

// Componentes auxiliares
const LoadingState = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="h-80">
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

const HeaderSection = ({ stats, onCrearAnuncio }) => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mis Anuncios</h1>
        <p className="text-muted-foreground mt-1">Gestiona todos tus anuncios desde aquí</p>
      </div>
      {onCrearAnuncio && (
        <Button onClick={onCrearAnuncio} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Crear Anuncio
        </Button>
      )}
    </div>

    {/* Estadísticas */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        icon={<FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
        title="Total"
        value={stats.total}
        description="Anuncios creados"
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
        icon={<Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
        title="Vistas"
        value={stats.totalVistas}
        description="Visualizaciones totales"
        color="purple"
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
    purple:
      "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/10 border-purple-200/50 dark:border-purple-800/50",
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

const FiltersSection = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  filterStatus,
  setFilterStatus,
  filterAudience,
  setFilterAudience,
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
            placeholder="Buscar anuncios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fecha">Más recientes</SelectItem>
              <SelectItem value="titulo">Por título</SelectItem>
              <SelectItem value="vistas">Más vistas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="activos">Activos</SelectItem>
              <SelectItem value="inactivos">Inactivos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterAudience} onValueChange={setFilterAudience}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las audiencias</SelectItem>
              <SelectItem value="profesores">Profesores</SelectItem>
              <SelectItem value="estudiantes">Estudiantes</SelectItem>
              <SelectItem value="padres">Padres</SelectItem>
              <SelectItem value="administrativos">Administrativos</SelectItem>
            </SelectContent>
          </Select>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onRefresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Actualizar lista</TooltipContent>
          </Tooltip>
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

const AnunciosGrid = ({
  anuncios,
  loading,
  onVerAnuncio,
  onEditarAnuncio,
  onEliminarAnuncio,
  onDuplicarAnuncio,
  onArchivarAnuncio,
}) => {
  if (anuncios.length === 0 && !loading) {
    return <EmptyState />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {anuncios.map((anuncio) => (
        <AnuncioCard
          key={anuncio.id}
          anuncio={anuncio}
          onVer={() => onVerAnuncio(anuncio)}
          onEditar={() => onEditarAnuncio(anuncio)}
          onEliminar={() => onEliminarAnuncio(anuncio.id)}
          onDuplicar={() => onDuplicarAnuncio(anuncio)}
          onArchivar={() => onArchivarAnuncio(anuncio)}
        />
      ))}
    </div>
  )
}

const EmptyState = () => (
  <Card className="border-2 border-dashed border-muted-foreground/25">
    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No hay anuncios</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">
        No se encontraron anuncios que coincidan con los filtros seleccionados.
      </p>
      <Button variant="outline">
        <Plus className="h-4 w-4 mr-2" />
        Crear primer anuncio
      </Button>
    </CardContent>
  </Card>
)

const AnuncioCard = ({ anuncio, onVer, onEditar, onEliminar, onDuplicar, onArchivar }) => {
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
            <CardDescription className="flex items-center gap-1 mt-1">
              <Calendar className="h-3 w-3" />
              {formatearFecha(anuncio.fechaPublicacion)}
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
            <Badge className={`${audienceConfig.color} text-white border-0 text-xs`}>{audienceConfig.label}</Badge>
            {!anuncio.activo && (
              <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">
                Inactivo
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {anuncio.resumen || anuncio.contenido}
          </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{anuncio.vistas || 0} vistas</span>
            </div>
            {anuncio.fechaExpiracion && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Expira {formatearFecha(anuncio.fechaExpiracion)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex items-center gap-2">
        <Button onClick={onVer} className="flex-1">
          Ver detalles
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={onEditar}>
              <Edit className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Editar</TooltipContent>
        </Tooltip>

        <ActionMenu onDuplicar={onDuplicar} onArchivar={onArchivar} onEliminar={onEliminar} titulo={anuncio.titulo} />
      </CardFooter>
    </Card>
  )
}

const ActionMenu = ({ onDuplicar, onArchivar, onEliminar, titulo }) => (
  <AlertDialog>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Más acciones</TooltipContent>
    </Tooltip>

    {/* Aquí iría un dropdown menu con las acciones adicionales */}
    <AlertDialogTrigger asChild>
      <Button variant="outline" size="icon" className="text-destructive hover:text-destructive bg-transparent">
        <Trash2 className="h-4 w-4" />
      </Button>
    </AlertDialogTrigger>

    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>¿Eliminar anuncio?</AlertDialogTitle>
        <AlertDialogDescription>
          Esta acción eliminará permanentemente el anuncio "{titulo}" y no se puede deshacer.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction
          onClick={onEliminar}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          Eliminar
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)

const PaginationSection = ({ pagination, onPageChange }) => (
  <Pagination className="mt-8">
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
)
