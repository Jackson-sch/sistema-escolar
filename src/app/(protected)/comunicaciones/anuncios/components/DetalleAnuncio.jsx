"use client"

import { useState, useEffect } from "react"
import { obtenerAnuncioPorId, incrementarVistas } from "@/action/anuncios/anuncioActions"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  ArrowLeft,
  Calendar,
  Edit,
  Eye,
  Pin,
  AlertCircle,
  Star,
  User,
  Clock,
  Share2,
  Bookmark,
  MessageCircle,
  ThumbsUp,
  Users,
  GraduationCap,
  School,
  ImageIcon,
} from "lucide-react"
import { toast } from "sonner"

export default function DetalleAnuncio({ anuncioId, onVolver, onEditar, userId }) {
  const [anuncio, setAnuncio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    const cargarAnuncio = async () => {
      setLoading(true)
      try {
        const resultado = await obtenerAnuncioPorId(anuncioId)
        if (resultado.success) {
          setAnuncio(resultado.anuncio)
          await incrementarVistas(anuncioId)
        } else {
          setError(resultado.error || "Error al cargar el anuncio")
          toast.error("Error al cargar el anuncio")
        }
      } catch (error) {
        console.error("Error al cargar anuncio:", error)
        setError("Error al cargar el anuncio")
        toast.error("Error al cargar el anuncio")
      } finally {
        setLoading(false)
      }
    }

    if (anuncioId) {
      cargarAnuncio()
    }
  }, [anuncioId])

  const formatearFecha = (fecha) => {
    if (!fecha) return ""
    return format(new Date(fecha), "dd 'de' MMMM, yyyy", { locale: es })
  }

  const formatearFechaRelativa = (fecha) => {
    if (!fecha) return ""
    const ahora = new Date()
    const fechaAnuncio = new Date(fecha)
    const diffTime = Math.abs(ahora - fechaAnuncio)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Hace 1 día"
    if (diffDays < 7) return `Hace ${diffDays} días`
    if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`
    return formatearFecha(fecha)
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Enlace copiado al portapapeles")
    } catch (error) {
      toast.error("Error al copiar enlace")
    }
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    toast.success(isBookmarked ? "Eliminado de guardados" : "Guardado en favoritos")
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    toast.success(isLiked ? "Me gusta eliminado" : "¡Te gusta este anuncio!")
  }

  if (loading) {
    return <LoadingSkeleton onVolver={onVolver} />
  }

  if (error || !anuncio) {
    return <ErrorState error={error} onVolver={onVolver} />
  }

  return (
    <TooltipProvider>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header con navegación y acciones */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onVolver} className="flex items-center gap-2 hover:bg-muted/80">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver a anuncios</span>
          </Button>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Compartir anuncio</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBookmark}
                  className={isBookmarked ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400" : ""}
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isBookmarked ? "Quitar de guardados" : "Guardar anuncio"}</TooltipContent>
            </Tooltip>

            {anuncio.autorId === userId && (
              <Button variant="default" onClick={onEditar} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
            )}
          </div>
        </div>

        {/* Card principal del anuncio */}
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background via-background to-muted/20">
          {/* Header del anuncio */}
          <CardHeader className="bg-gradient-to-r from-muted/30 to-muted/10 border-b">
            <div className="space-y-4">
              {/* Título y badges de estado */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-start gap-2">
                  <StatusBadges anuncio={anuncio} />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">{anuncio.titulo}</h1>
              </div>

              {/* Información del autor y metadatos */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <AuthorInfo anuncio={anuncio} formatearFechaRelativa={formatearFechaRelativa} />
                <MetadataInfo anuncio={anuncio} formatearFecha={formatearFecha} />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-8">
            {/* Audiencia y alcance */}
            <AudienceSection anuncio={anuncio} />

            {/* Imagen del anuncio */}
            {anuncio.imagen && (
              <ImageSection
                imagen={anuncio.imagen}
                titulo={anuncio.titulo}
                imageLoading={imageLoading}
                setImageLoading={setImageLoading}
                imageError={imageError}
                setImageError={setImageError}
              />
            )}

            {/* Contenido principal */}
            <ContentSection contenido={anuncio.contenido} />

            {/* Información adicional */}
            {anuncio.fechaExpiracion && <ExpirationAlert fechaExpiracion={anuncio.fechaExpiracion} />}
          </CardContent>

          {/* Footer con acciones */}
          <CardFooter className="bg-muted/30 border-t p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={onVolver} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={`flex items-center gap-2 ${
                      isLiked ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                    }`}
                  >
                    <ThumbsUp className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                    <span className="text-sm">Me gusta</span>
                  </Button>

                  <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">Comentar</span>
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{anuncio.vistas} visualizaciones</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </TooltipProvider>
  )
}

// Componentes auxiliares
const LoadingSkeleton = ({ onVolver }) => (
  <div className="max-w-4xl mx-auto space-y-6">
    <div className="flex items-center justify-between">
      <Button variant="ghost" onClick={onVolver} className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Button>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>

    <Card className="overflow-hidden">
      <CardHeader className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-8 w-3/4" />
        <div className="flex justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-32" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  </div>
)

const ErrorState = ({ error, onVolver }) => (
  <div className="max-w-4xl mx-auto space-y-6">
    <Button variant="ghost" onClick={onVolver} className="flex items-center gap-2">
      <ArrowLeft className="h-4 w-4" />
      Volver
    </Button>

    <Card>
      <CardContent className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-base">{error || "No se pudo cargar el anuncio"}</AlertDescription>
        </Alert>
        <div className="mt-6 text-center">
          <Button onClick={onVolver}>Volver a anuncios</Button>
        </div>
      </CardContent>
    </Card>
  </div>
)

const StatusBadges = ({ anuncio }) => {
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
    <>
      <Badge className={`${audienceConfig.color} text-white border-0 flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {audienceConfig.label}
      </Badge>

      {!anuncio.activo && (
        <Badge variant="outline" className="bg-muted text-muted-foreground">
          Inactivo
        </Badge>
      )}

      {anuncio.importante && (
        <Badge className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800">
          <Star className="mr-1 h-3 w-3 fill-current" />
          Importante
        </Badge>
      )}

      {anuncio.urgente && (
        <Badge variant="destructive" className="animate-pulse">
          <AlertCircle className="mr-1 h-3 w-3" />
          Urgente
        </Badge>
      )}

      {anuncio.fijado && (
        <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800">
          <Pin className="mr-1 h-3 w-3" />
          Fijado
        </Badge>
      )}
    </>
  )
}

const AuthorInfo = ({ anuncio, formatearFechaRelativa }) => (
  <div className="flex items-center gap-3">
    <Avatar className="w-10 h-10 border-2 border-border">
      <AvatarImage src={anuncio.autor?.image || "/placeholder.svg"} alt={anuncio.autor?.name} />
      <AvatarFallback className="bg-muted text-muted-foreground">
        {anuncio.autor?.name?.charAt(0).toUpperCase() || "U"}
      </AvatarFallback>
    </Avatar>
    <div>
      <p className="font-medium text-foreground">{anuncio.autor?.name || "Usuario"}</p>
      <p className="text-sm text-muted-foreground">{formatearFechaRelativa(anuncio.fechaPublicacion)}</p>
    </div>
  </div>
)

const MetadataInfo = ({ anuncio, formatearFecha }) => (
  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
    <div className="flex items-center gap-1">
      <Calendar className="h-4 w-4" />
      <span>{formatearFecha(anuncio.fechaPublicacion)}</span>
    </div>

    {anuncio.fechaExpiracion && (
      <div className="flex items-center gap-1">
        <Clock className="h-4 w-4" />
        <span>Expira: {formatearFecha(anuncio.fechaExpiracion)}</span>
      </div>
    )}

    <div className="flex items-center gap-1">
      <Eye className="h-4 w-4" />
      <span>{anuncio.vistas} vistas</span>
    </div>
  </div>
)

const AudienceSection = ({ anuncio }) => {
  if (!anuncio.niveles?.length && !anuncio.grados?.length) return null

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <School className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        Dirigido a
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {anuncio.niveles?.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Niveles Educativos</h4>
            <div className="flex flex-wrap gap-2">
              {anuncio.niveles.map((nivel) => (
                <Badge
                  key={nivel.id}
                  variant="secondary"
                  className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                >
                  {nivel.nombre}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {anuncio.grados?.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Grados</h4>
            <div className="flex flex-wrap gap-2">
              {anuncio.grados.map((grado) => (
                <Badge
                  key={grado.id}
                  variant="secondary"
                  className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300"
                >
                  {grado.nombre}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const ImageSection = ({ imagen, titulo, imageLoading, setImageLoading, imageError, setImageError }) => (
  <div className="space-y-3">
    {/* <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
      <ImageIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
      Imagen
    </h3> */}

    <div className="relative rounded-xl overflow-hidden bg-muted/50 border border-border">
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {!imageError ? (
        <img
          src={imagen || "/placeholder.svg"}
          alt={titulo}
          className="w-full max-h-96 object-contain transition-opacity duration-300"
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true)
            setImageLoading(false)
          }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mb-2" />
          <p>No se pudo cargar la imagen</p>
        </div>
      )}
    </div>
  </div>
)

const ContentSection = ({ contenido }) => (
  <div className="space-y-3">
    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
      <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      Contenido
    </h3>

    <div className="prose prose-gray dark:prose-invert max-w-none">
      <div className="whitespace-pre-wrap text-foreground leading-relaxed bg-muted/20 p-6 rounded-xl border border-border/50">
        {contenido}
      </div>
    </div>
  </div>
)

const ExpirationAlert = ({ fechaExpiracion }) => {
  const fechaExp = new Date(fechaExpiracion)
  const ahora = new Date()
  const diasRestantes = Math.ceil((fechaExp - ahora) / (1000 * 60 * 60 * 24))

  if (diasRestantes < 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Este anuncio ha expirado el {format(fechaExp, "dd/MM/yyyy", { locale: es })}
        </AlertDescription>
      </Alert>
    )
  }

  if (diasRestantes <= 7) {
    return (
      <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
        <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          Este anuncio expirará en {diasRestantes} día{diasRestantes !== 1 ? "s" : ""} (
          {format(fechaExp, "dd/MM/yyyy", { locale: es })})
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
