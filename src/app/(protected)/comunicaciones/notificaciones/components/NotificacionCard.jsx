"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trash2, Eye, Archive, Star, Clock } from "lucide-react"

export const NotificacionCard = ({ notificacion, onMarcarLeido, onEliminar, formatDate, getTipoConfig }) => {
  const tipoConfig = getTipoConfig(notificacion.tipo)
  const IconComponent = tipoConfig.icon

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case "alta":
        return "border-l-red-500 dark:border-l-red-400"
      case "media":
        return "border-l-amber-500 dark:border-l-amber-400"
      default:
        return "border-l-blue-500 dark:border-l-blue-400"
    }
  }

  return (
    <Card
      className={`group transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${
        !notificacion.leido
          ? `border-l-4 ${getPrioridadColor(notificacion.prioridad)} bg-gradient-to-r from-primary/5 to-transparent`
          : "hover:bg-muted/30"
      }`}
    >
      <CardContent className="p-0">
        <div className="flex items-start p-6 gap-4">
          {/* Avatar con indicador de estado */}
          <div className="relative">
            <Avatar className="h-12 w-12 ring-2 ring-background shadow-sm">
              <AvatarImage
                src={notificacion.remitente.avatar || "/placeholder.svg"}
                alt={notificacion.remitente.nombre}
              />
              <AvatarFallback className={`${tipoConfig.bg} ${tipoConfig.color} font-semibold`}>
                {notificacion.remitente.nombre
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {!notificacion.leido && (
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full border-2 border-background animate-pulse" />
            )}
          </div>

          <div className="flex-1 space-y-3 min-w-0">
            {/* Header con información del remitente */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm truncate">{notificacion.remitente.nombre}</h4>
                  <p className="text-xs text-muted-foreground">{notificacion.remitente.rol}</p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs flex items-center gap-1 ${tipoConfig.bg} ${tipoConfig.color} border-current/20 shrink-0`}
                >
                  <IconComponent className="h-3 w-3" />
                  {tipoConfig.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                <Clock className="h-3 w-3" />
                {formatDate(notificacion.fecha)}
              </div>
            </div>

            {/* Contenido principal */}
            <div className="space-y-2">
              <h3
                className={`font-semibold text-base leading-tight ${!notificacion.leido ? "text-foreground" : "text-muted-foreground"}`}
              >
                {notificacion.titulo}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{notificacion.mensaje}</p>
            </div>

            {/* Indicadores adicionales */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {notificacion.prioridad === "alta" && (
                  <Badge variant="destructive" className="text-xs px-2 py-0.5">
                    <Star className="h-3 w-3 mr-1" />
                    Prioridad Alta
                  </Badge>
                )}
                {!notificacion.leido && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-primary/10 text-primary">
                    Nuevo
                  </Badge>
                )}
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {!notificacion.leido && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarcarLeido(notificacion.id)}
                    className="h-8 px-3 text-xs hover:bg-primary/10 hover:text-primary"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Marcar leído
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Archive className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEliminar(notificacion.id)}
                  className="h-8 px-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
