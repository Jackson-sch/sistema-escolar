import { gradosPorNivel } from "@/lib/gradosPorNivel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, Clock, User, BookOpen, GraduationCap } from "lucide-react"

// Función para obtener el color del badge según el nivel
const getLevelColor = (nivel) => {
  switch (nivel) {
    case "PRIMARIA":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "SECUNDARIA":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "PREESCOLAR":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}

export const columns = [
  {
    accessorKey: "nombre",
    header: ({ column }) => (
      <div className="flex items-center gap-2 font-semibold">
        <BookOpen className="h-4 w-4" />
        Curso
      </div>
    ),
    cell: (info) => {
      const nombre = info.getValue()
      const codigo = info.row.original.codigo
      return (
        <div className="space-y-1">
          <div className="font-medium text-foreground">{nombre}</div>
          <div className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded w-fit">{codigo}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: (info) => {
      const descripcion = info.getValue()
      return (
        <div className="max-w-xs">
          <div className="text-sm text-muted-foreground line-clamp-2 leading-relaxed" title={descripcion}>
            {descripcion}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "nivel",
    header: ({ column }) => (
      <div className="flex items-center gap-2 font-semibold">
        <GraduationCap className="h-4 w-4" />
        Nivel/Grado
      </div>
    ),
    cell: (info) => {
      const nivel = info.getValue()
      const grado = info.row.original.grado
      const gradoObj = gradosPorNivel[nivel]?.find((g) => g.value === grado)
      const gradoLabel = gradoObj ? gradoObj.label : grado

      return (
        <div className="space-y-2">
          <Badge className={getLevelColor(nivel)} variant="secondary">
            {nivel}
          </Badge>
          <div className="text-sm text-muted-foreground font-medium">{gradoLabel}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "anioAcademico",
    header: "Año Académico",
    cell: (info) => {
      const anio = info.getValue()
      return (
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 text-sm font-medium">
            {anio}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "horasSemanales",
    header: ({ column }) => (
      <div className="flex items-center gap-2 font-semibold">
        <Clock className="h-4 w-4" />
        Horas/Semana
      </div>
    ),
    cell: (info) => {
      const horas = info.getValue()
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 rounded-md text-sm font-medium">
            <Clock className="h-3 w-3" />
            {horas}h
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "profesorNombre",
    header: ({ column }) => (
      <div className="flex items-center gap-2 font-semibold">
        <User className="h-4 w-4" />
        Profesor
      </div>
    ),
    cell: (info) => {
      const profesor = info.getValue()
      return (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
            {profesor
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="text-sm font-medium text-foreground truncate" title={profesor}>
            {profesor}
          </div>
        </div>
      )
    },
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: (info) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <Eye className="h-4 w-4" />
              Ver detalles
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <Edit className="h-4 w-4" />
              Editar curso
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 text-red-600 cursor-pointer">
              <Trash2 className="h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
