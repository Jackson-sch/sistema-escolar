"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { registrarAnuncio, actualizarAnuncio, obtenerAnuncioPorId } from "@/action/anuncios/anuncioActions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TooltipProvider } from "@/components/ui/tooltip"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  CalendarIcon,
  ArrowLeft,
  Loader2,
  FileText,
  Users,
  Settings,
  Star,
  Eye,
  CalendarIcon as CalendarIconLucide,
  ImageIcon,
  Target,
  Pin,
  Zap,
  Info,
  Save,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { useInstitucion } from "@/hooks/useInstitucion"

// Esquema de validación
const anuncioSchema = z.object({
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  contenido: z.string().min(10, "El contenido debe tener al menos 10 caracteres"),
  resumen: z.string().optional().nullable(),
  imagen: z.string().optional().nullable(),
  fechaPublicacion: z.date(),
  fechaExpiracion: z.date().optional().nullable(),
  activo: z.boolean().default(true),
  dirigidoA: z.string(),
  niveles: z.array(z.string()).optional(),
  grados: z.array(z.string()).optional(),
  importante: z.union([z.boolean(), z.string().transform((val) => val === "true")]).default(false),
  urgente: z.union([z.boolean(), z.string().transform((val) => val === "true")]).default(false),
  fijado: z.union([z.boolean(), z.string().transform((val) => val === "true")]).default(false),
})

export default function FormularioAnuncio({ anuncio, isEditing, onVolver, userId }) {
  const [loading, setLoading] = useState(false)
  const [loadingAnuncio, setLoadingAnuncio] = useState(isEditing)
  const [niveles, setNiveles] = useState([])
  const [grados, setGrados] = useState([])
  const [selectedNiveles, setSelectedNiveles] = useState([])
  const [currentStep, setCurrentStep] = useState(1)
  const [previewMode, setPreviewMode] = useState(false)
  const { institucion } = useInstitucion()

  // Configurar formulario
  const form = useForm({
    resolver: zodResolver(anuncioSchema),
    defaultValues: {
      titulo: "",
      contenido: "",
      resumen: "",
      imagen: "",
      fechaPublicacion: new Date(),
      fechaExpiracion: null,
      activo: true,
      dirigidoA: "todos",
      niveles: [],
      grados: [],
      importante: false,
      urgente: false,
      fijado: false,
    },
  })

  // Calcular progreso del formulario
  const watchedFields = form.watch()
  const progress = calculateProgress(watchedFields)

  // Cargar datos de la institución
  useEffect(() => {
    if (institucion) {
      const nivelesData = institucion.niveles || []
      setNiveles(nivelesData)

      const gradosData = []
      nivelesData.forEach((nivel) => {
        if (nivel.grados && nivel.grados.length > 0) {
          gradosData.push(...nivel.grados)
        }
      })
      setGrados(gradosData)
    }
  }, [institucion])

  // Cargar datos del anuncio si estamos editando
  useEffect(() => {
    const cargarAnuncio = async () => {
      if (isEditing && anuncio?.id) {
        setLoadingAnuncio(true)
        try {
          const resultado = await obtenerAnuncioPorId(anuncio.id)
          if (resultado.success) {
            const anuncioData = resultado.anuncio

            const nivelesIds = anuncioData.niveles?.map((n) => n.id) || []
            const gradosIds = anuncioData.grados?.map((g) => g.id) || []

            setSelectedNiveles(nivelesIds)

            form.reset({
              titulo: anuncioData.titulo,
              contenido: anuncioData.contenido,
              resumen: anuncioData.resumen || "",
              imagen: anuncioData.imagen || "",
              fechaPublicacion: new Date(anuncioData.fechaPublicacion),
              fechaExpiracion: anuncioData.fechaExpiracion ? new Date(anuncioData.fechaExpiracion) : null,
              activo: anuncioData.activo,
              dirigidoA: anuncioData.dirigidoA,
              niveles: nivelesIds,
              grados: gradosIds,
              importante: anuncioData.importante,
              urgente: anuncioData.urgente,
              fijado: anuncioData.fijado,
            })
          } else {
            toast.error("Error al cargar el anuncio")
          }
        } catch (error) {
          console.error("Error al cargar anuncio:", error)
          toast.error("Error al cargar el anuncio")
        } finally {
          setLoadingAnuncio(false)
        }
      }
    }

    cargarAnuncio()
  }, [anuncio, isEditing, form])

  const handleNivelesChange = (nivelesIds) => {
    setSelectedNiveles(nivelesIds)

    const gradosActuales = form.getValues("grados") || []
    const gradosFiltrados = gradosActuales.filter((gradoId) => {
      const grado = grados.find((g) => g.id === gradoId)
      return grado && nivelesIds.includes(grado.nivelId)
    })

    form.setValue("grados", gradosFiltrados)
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (!userId) {
        toast.error("No se pudo identificar al usuario. Por favor, inicie sesión nuevamente.")
        setLoading(false)
        return
      }

      const anuncioData = {
        ...data,
        importante: Boolean(data.importante),
        urgente: Boolean(data.urgente),
        fijado: Boolean(data.fijado),
        activo: Boolean(data.activo),
        autorId: userId,
      }

      let resultado
      if (isEditing) {
        resultado = await actualizarAnuncio(anuncio.id, anuncioData)
      } else {
        resultado = await registrarAnuncio(anuncioData)
      }

      if (resultado.success) {
        toast.success(isEditing ? "Anuncio actualizado correctamente" : "Anuncio creado correctamente")
        onVolver()
      } else {
        toast.error(resultado.error || "Error al guardar el anuncio")
      }
    } catch (error) {
      console.error("Error al guardar anuncio:", error)
      toast.error("Error al guardar el anuncio")
    } finally {
      setLoading(false)
    }
  }

  if (loadingAnuncio) {
    return <LoadingState />
  }

  return (
    <TooltipProvider>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <HeaderSection
          isEditing={isEditing}
          onVolver={onVolver}
          progress={progress}
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
        />

        {/* Preview Mode */}
        {previewMode && <PreviewSection watchedFields={watchedFields} />}

        {/* Form Content */}
        {!previewMode && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Bento Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Información Básica - Card Grande */}
                <div className="lg:col-span-8">
                  <BasicInfoSection form={form} />
                </div>

                {/* Estado y Configuración - Card Vertical */}
                <div className="lg:col-span-4 space-y-6">
                  <StatusSection form={form} />
                  <ImportanceSection form={form} />
                </div>

                {/* Fechas - Card Mediano */}
                <div className="lg:col-span-6">
                  <DatesSection form={form} />
                </div>

                {/* Imagen - Card Mediano */}
                <div className="lg:col-span-6">
                  <ImageSection form={form} watchedFields={watchedFields} />
                </div>

                {/* Audiencia - Card Grande */}
                <div className="lg:col-span-12">
                  <AudienceSection
                    form={form}
                    niveles={niveles}
                    grados={grados}
                    selectedNiveles={selectedNiveles}
                    handleNivelesChange={handleNivelesChange}
                  />
                </div>
              </div>

              {/* Actions */}
              <ActionsSection loading={loading} onVolver={onVolver} isEditing={isEditing} />
            </form>
          </Form>
        )}
      </div>
    </TooltipProvider>
  )
}

// Componentes auxiliares
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-64 space-y-4">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <FileText className="h-6 w-6 text-primary" />
      </div>
    </div>
    <div className="text-center space-y-2">
      <h3 className="text-lg font-semibold text-foreground">Cargando anuncio...</h3>
      <p className="text-sm text-muted-foreground">Obteniendo información del anuncio</p>
    </div>
  </div>
)

const HeaderSection = ({ isEditing, onVolver, progress, previewMode, setPreviewMode }) => (
  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 p-8 border border-blue-200/50 dark:border-blue-800/50">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-400/5 dark:to-purple-400/5" />
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onVolver} className="hover:bg-white/50 dark:hover:bg-gray-800/50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditing ? "Editar Anuncio" : "Crear Nuevo Anuncio"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditing
                ? "Actualiza la información del anuncio seleccionado"
                : "Completa el formulario para crear un nuevo anuncio"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant={previewMode ? "default" : "outline"}
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? "Editar" : "Vista previa"}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progreso del formulario</span>
          <span className="font-medium text-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  </div>
)

const BasicInfoSection = ({ form }) => (
  <Card className="border-0 shadow-sm bg-gradient-to-br from-background via-background to-muted/20 h-full">
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center gap-2 text-xl">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-400/10">
          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        Información Básica
      </CardTitle>
      <CardDescription>Título, contenido y resumen del anuncio</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <FormField
        control={form.control}
        name="titulo"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">Título del anuncio</FormLabel>
            <FormControl>
              <Input
                placeholder="Ej. Reunión de padres de familia"
                className="text-lg h-12 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="resumen"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">Resumen</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Breve descripción que aparecerá en las listas..."
                className="min-h-[80px] transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormDescription className="flex items-center gap-1">
              <Info className="h-3 w-3" />
              Resumen corto para mostrar en listados (opcional)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="contenido"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">Contenido detallado</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe aquí el contenido completo del anuncio..."
                className=" transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </CardContent>
  </Card>
)

const StatusSection = ({ form }) => (
  <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10">
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10 dark:bg-green-400/10">
          <Settings className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
        Estado
      </CardTitle>
    </CardHeader>
    <CardContent>
      <FormField
        control={form.control}
        name="activo"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-green-200/50 dark:border-green-800/50 p-4 bg-green-50/30 dark:bg-green-950/10">
            <div className="space-y-0.5">
              <FormLabel className="text-base font-medium">Publicar anuncio</FormLabel>
              <FormDescription className="text-sm">El anuncio será visible para los usuarios</FormDescription>
            </div>
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </CardContent>
  </Card>
)

const ImportanceSection = ({ form }) => (
  <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10">
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-400/10">
          <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        Prioridad
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <FormField
        control={form.control}
        name="importante"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-amber-200/50 dark:border-amber-800/50 p-3 bg-amber-50/30 dark:bg-amber-950/10">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <div>
                <FormLabel className="text-sm font-medium">Importante</FormLabel>
              </div>
            </div>
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="urgente"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-red-200/50 dark:border-red-800/50 p-3 bg-red-50/30 dark:bg-red-950/10">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-red-600 dark:text-red-400" />
              <div>
                <FormLabel className="text-sm font-medium">Urgente</FormLabel>
              </div>
            </div>
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fijado"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-blue-200/50 dark:border-blue-800/50 p-3 bg-blue-50/30 dark:bg-blue-950/10">
            <div className="flex items-center gap-2">
              <Pin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <div>
                <FormLabel className="text-sm font-medium">Fijar</FormLabel>
              </div>
            </div>
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </CardContent>
  </Card>
)

const DatesSection = ({ form }) => (
  <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50/50 to-violet-50/30 dark:from-purple-950/20 dark:to-violet-950/10 h-full">
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 dark:bg-purple-400/10">
          <CalendarIconLucide className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>
        Fechas
      </CardTitle>
      <CardDescription>Configuración de publicación y expiración</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <FormField
        control={form.control}
        name="fechaPublicacion"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Fecha de publicación</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                  >
                    {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date("1900-01-01")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fechaExpiracion"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Fecha de expiración</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                  >
                    {field.value ? format(field.value, "PPP", { locale: es }) : <span>Sin fecha de expiración</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value || undefined}
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormDescription className="flex items-center gap-1">
              <Info className="h-3 w-3" />
              Opcional: fecha en que el anuncio dejará de mostrarse
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </CardContent>
  </Card>
)

const ImageSection = ({ form, watchedFields }) => (
  <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50/50 to-blue-50/30 dark:from-indigo-950/20 dark:to-blue-950/10 h-full">
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-400/10">
          <ImageIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        Imagen
      </CardTitle>
      <CardDescription>Imagen ilustrativa para el anuncio</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <FormField
        control={form.control}
        name="imagen"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL de la imagen</FormLabel>
            <FormControl>
              <Input
                placeholder="https://ejemplo.com/imagen.jpg"
                className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormDescription className="flex items-center gap-1">
              <Info className="h-3 w-3" />
              URL de una imagen para ilustrar el anuncio
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Preview de imagen */}
      {watchedFields.imagen && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Vista previa:</p>
          <div className="relative rounded-lg overflow-hidden bg-muted/50 border border-border">
            <img
              src={watchedFields.imagen || "/placeholder.svg"}
              alt="Vista previa"
              className="w-full h-32 object-cover"
              onError={(e) => {
                e.target.style.display = "none"
                e.target.nextSibling.style.display = "flex"
              }}
            />
            <div className="hidden items-center justify-center h-32 text-muted-foreground">
              <div className="text-center">
                <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No se pudo cargar la imagen</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
)

const AudienceSection = ({ form, niveles, grados, selectedNiveles, handleNivelesChange }) => (
  <Card className="border-0 shadow-sm bg-gradient-to-br from-teal-50/50 to-cyan-50/30 dark:from-teal-950/20 dark:to-cyan-950/10">
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-500/10 dark:bg-teal-400/10">
          <Target className="h-4 w-4 text-teal-600 dark:text-teal-400" />
        </div>
        Audiencia
      </CardTitle>
      <CardDescription>Define a quién va dirigido este anuncio</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <FormField
        control={form.control}
        name="dirigidoA"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">Dirigido a</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="h-12 transition-all duration-200 focus:ring-2 focus:ring-teal-500/20">
                  <SelectValue placeholder="Seleccionar audiencia" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="todos">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Público general
                  </div>
                </SelectItem>
                <SelectItem value="profesores">Profesores</SelectItem>
                <SelectItem value="estudiantes">Estudiantes</SelectItem>
                <SelectItem value="padres">Padres</SelectItem>
                <SelectItem value="administrativos">Administrativos</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="niveles"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Niveles específicos</FormLabel>
              <div className="grid grid-cols-1 gap-3">
                {niveles.map((nivel) => (
                  <div
                    key={nivel.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-teal-200/50 dark:border-teal-800/50 bg-teal-50/30 dark:bg-teal-950/10"
                  >
                    <Checkbox
                      id={`nivel-${nivel.id}`}
                      checked={field.value?.includes(nivel.id)}
                      onCheckedChange={(checked) => {
                        const updatedNiveles = checked
                          ? [...(field.value || []), nivel.id]
                          : (field.value || []).filter((id) => id !== nivel.id)
                        field.onChange(updatedNiveles)
                        handleNivelesChange(updatedNiveles)
                      }}
                    />
                    <label
                      htmlFor={`nivel-${nivel.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {nivel.nombre}
                    </label>
                  </div>
                ))}
              </div>
              <FormDescription className="flex items-center gap-1">
                <Info className="h-3 w-3" />
                Selecciona niveles específicos (opcional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="grados"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Grados específicos</FormLabel>
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {grados
                  .filter((grado) => selectedNiveles.length === 0 || selectedNiveles.includes(grado.nivelId))
                  .map((grado) => (
                    <div
                      key={grado.id}
                      className="flex items-center space-x-3 p-2 rounded-lg border border-teal-200/50 dark:border-teal-800/50 bg-teal-50/20 dark:bg-teal-950/5"
                    >
                      <Checkbox
                        id={`grado-${grado.id}`}
                        checked={field.value?.includes(grado.id)}
                        onCheckedChange={(checked) => {
                          const updatedGrados = checked
                            ? [...(field.value || []), grado.id]
                            : (field.value || []).filter((id) => id !== grado.id)
                          field.onChange(updatedGrados)
                        }}
                      />
                      <label
                        htmlFor={`grado-${grado.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {grado.nombre}
                      </label>
                    </div>
                  ))}
              </div>
              <FormDescription className="flex items-center gap-1">
                <Info className="h-3 w-3" />
                Selecciona grados específicos (opcional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </CardContent>
  </Card>
)

const PreviewSection = ({ watchedFields }) => (
  <Card className="border-0 shadow-lg bg-gradient-to-br from-background via-background to-muted/20">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Eye className="h-5 w-5" />
        Vista Previa del Anuncio
      </CardTitle>
      <CardDescription>Así se verá tu anuncio para los usuarios</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {watchedFields.importante && (
            <Badge className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Importante
            </Badge>
          )}
          {watchedFields.urgente && (
            <Badge variant="destructive">
              <Zap className="h-3 w-3 mr-1" />
              Urgente
            </Badge>
          )}
          {watchedFields.fijado && (
            <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
              <Pin className="h-3 w-3 mr-1" />
              Fijado
            </Badge>
          )}
        </div>

        <h2 className="text-2xl font-bold text-foreground">{watchedFields.titulo || "Título del anuncio"}</h2>

        {watchedFields.resumen && <p className="text-muted-foreground italic">{watchedFields.resumen}</p>}

        {watchedFields.imagen && (
          <div className="rounded-lg overflow-hidden">
            <img
              src={watchedFields.imagen || "/placeholder.svg"}
              alt="Imagen del anuncio"
              className="w-full max-h-64 object-cover"
            />
          </div>
        )}

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap">{watchedFields.contenido || "Contenido del anuncio..."}</p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Dirigido a: {getAudienceLabel(watchedFields.dirigidoA)}</span>
          {watchedFields.fechaPublicacion && (
            <span>Publicación: {format(watchedFields.fechaPublicacion, "dd/MM/yyyy", { locale: es })}</span>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
)

const ActionsSection = ({ loading, onVolver, isEditing }) => (
  <Card className="border-0 shadow-sm bg-gradient-to-r from-muted/30 to-muted/10">
    <CardContent className="p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>Revisa toda la información antes de guardar</span>
        </div>

        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={onVolver} className="min-w-[100px] bg-transparent">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="min-w-[140px]">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Actualizar" : "Crear anuncio"}
              </>
            )}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
)

// Funciones auxiliares
function calculateProgress(fields) {
  const requiredFields = ["titulo", "contenido", "dirigidoA"]
  const optionalFields = ["resumen", "imagen", "fechaExpiracion"]
  const booleanFields = ["importante", "urgente", "fijado"]

  let completed = 0
  const total = requiredFields.length + optionalFields.length

  // Campos requeridos
  requiredFields.forEach((field) => {
    if (fields[field] && fields[field].toString().trim()) {
      completed += 1
    }
  })

  // Campos opcionales (peso menor)
  optionalFields.forEach((field) => {
    if (fields[field] && fields[field].toString().trim()) {
      completed += 0.5
    }
  })

  // Campos booleanos (peso menor)
  booleanFields.forEach((field) => {
    if (fields[field]) {
      completed += 0.3
    }
  })

  return Math.min((completed / total) * 100, 100)
}

function getAudienceLabel(dirigidoA) {
  const labels = {
    todos: "Público general",
    profesores: "Profesores",
    estudiantes: "Estudiantes",
    padres: "Padres",
    administrativos: "Administrativos",
  }
  return labels[dirigidoA] || "No especificado"
}
