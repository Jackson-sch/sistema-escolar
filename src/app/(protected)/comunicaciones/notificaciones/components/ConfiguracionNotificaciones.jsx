"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Mail,
  Bell,
  Info,
  Calendar,
  MessageSquare,
  GraduationCap,
  UserCheck,
  Smartphone,
  Volume2,
  Moon,
  Save,
  RotateCcw,
} from "lucide-react"

export const ConfiguracionNotificaciones = () => {
  const { toast } = useToast()
  const [configuracionNotificaciones, setConfiguracionNotificaciones] = useState({
    // Canales
    email: true,
    sistema: true,
    push: false,
    sonido: true,
    // Tipos
    anuncios: true,
    eventos: true,
    mensajes: true,
    calificaciones: true,
    asistencias: true,
    // Horarios
    noMolestar: false,
    horaInicio: "22:00",
    horaFin: "07:00",
  })

  const [hasChanges, setHasChanges] = useState(false)

  const handleConfigChange = (key, value) => {
    setConfiguracionNotificaciones((prev) => ({
      ...prev,
      [key]: value,
    }))
    setHasChanges(true)
  }

  const handleGuardarConfiguracion = () => {
    setTimeout(() => {
      toast({
        title: "✅ Configuración guardada exitosamente",
        description: "Tus preferencias de notificaciones han sido actualizadas correctamente",
      })
      setHasChanges(false)
    }, 500)
  }

  const handleRestaurarDefecto = () => {
    setConfiguracionNotificaciones({
      email: true,
      sistema: true,
      push: false,
      sonido: true,
      anuncios: true,
      eventos: true,
      mensajes: true,
      calificaciones: true,
      asistencias: true,
      noMolestar: false,
      horaInicio: "22:00",
      horaFin: "07:00",
    })
    setHasChanges(true)
    toast({
      title: "🔄 Configuración restaurada",
      description: "Se han restaurado los valores por defecto",
    })
  }

  const canales = [
    {
      key: "email",
      title: "Correo electrónico",
      description: "Recibe notificaciones importantes por email",
      icon: Mail,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      key: "sistema",
      title: "Notificaciones del sistema",
      description: "Alertas dentro de la plataforma educativa",
      icon: Bell,
      color: "text-primary",
    },
    {
      key: "push",
      title: "Notificaciones push",
      description: "Alertas instantáneas en tu dispositivo móvil",
      icon: Smartphone,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      key: "sonido",
      title: "Alertas sonoras",
      description: "Reproducir sonidos para notificaciones importantes",
      icon: Volume2,
      color: "text-amber-600 dark:text-amber-400",
    },
  ]

  const tipos = [
    {
      key: "anuncios",
      title: "Anuncios institucionales",
      description: "Comunicados oficiales y avisos importantes",
      icon: Info,
      color: "text-blue-600 dark:text-blue-400",
      badge: "Importante",
    },
    {
      key: "eventos",
      title: "Eventos y actividades",
      description: "Recordatorios de eventos, reuniones y actividades",
      icon: Calendar,
      color: "text-amber-600 dark:text-amber-400",
      badge: "Recordatorios",
    },
    {
      key: "mensajes",
      title: "Mensajes directos",
      description: "Comunicación entre profesores, estudiantes y padres",
      icon: MessageSquare,
      color: "text-emerald-600 dark:text-emerald-400",
      badge: "Comunicación",
    },
    {
      key: "calificaciones",
      title: "Calificaciones y notas",
      description: "Alertas sobre nuevas calificaciones y evaluaciones",
      icon: GraduationCap,
      color: "text-purple-600 dark:text-purple-400",
      badge: "Académico",
    },
    {
      key: "asistencias",
      title: "Control de asistencia",
      description: "Notificaciones sobre asistencias e inasistencias",
      icon: UserCheck,
      color: "text-red-600 dark:text-red-400",
      badge: "Control",
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            Configuración de Notificaciones
          </CardTitle>
          <CardDescription className="text-base">
            Personaliza cómo y cuándo quieres recibir notificaciones del sistema educativo
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Canales de notificación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-primary" />Canales de Notificación
          </CardTitle>
          <CardDescription>Selecciona cómo quieres recibir las notificaciones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {canales.map((canal) => {
              const IconComponent = canal.icon
              return (
                <div
                  key={canal.key}
                  className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-background to-muted/20 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted/50 ${canal.color}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={canal.key} className="font-medium cursor-pointer">
                        {canal.title}
                      </Label>
                      <p className="text-xs text-muted-foreground">{canal.description}</p>
                    </div>
                  </div>
                  <Switch
                    id={canal.key}
                    checked={configuracionNotificaciones[canal.key]}
                    onCheckedChange={(checked) => handleConfigChange(canal.key, checked)}
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Tipos de notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5 text-primary" />Tipos de Notificaciones
          </CardTitle>
          <CardDescription>Controla qué tipos de notificaciones quieres recibir</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tipos.map((tipo) => {
              const IconComponent = tipo.icon
              return (
                <div
                  key={tipo.key}
                  className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-background to-muted/20 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg bg-muted/50 ${tipo.color}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={tipo.key} className="font-medium cursor-pointer truncate">
                          {tipo.title}
                        </Label>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {tipo.badge}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{tipo.description}</p>
                    </div>
                  </div>
                  <Switch
                    id={tipo.key}
                    checked={configuracionNotificaciones[tipo.key]}
                    onCheckedChange={(checked) => handleConfigChange(tipo.key, checked)}
                    className="shrink-0 ml-3"
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Horarios y modo no molestar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Moon className="h-5 w-5 text-primary" />Horarios y Preferencias
          </CardTitle>
          <CardDescription>Configura horarios para recibir notificaciones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-background to-muted/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted/50 text-purple-600 dark:text-purple-400">
                <Moon className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="no-molestar" className="font-medium cursor-pointer">
                  Modo "No molestar"
                </Label>
                <p className="text-xs text-muted-foreground">Silenciar notificaciones durante horas específicas</p>
              </div>
            </div>
            <Switch
              id="no-molestar"
              checked={configuracionNotificaciones.noMolestar}
              onCheckedChange={(checked) => handleConfigChange("noMolestar", checked)}
            />
          </div>

          {configuracionNotificaciones.noMolestar && (
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted/20 border border-dashed">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Desde las</Label>
                <input
                  type="time"
                  value={configuracionNotificaciones.horaInicio}
                  onChange={(e) => handleConfigChange("horaInicio", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Hasta las</Label>
                <input
                  type="time"
                  value={configuracionNotificaciones.horaFin}
                  onChange={(e) => handleConfigChange("horaFin", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones */}
      <Card>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
          <Button variant="outline" onClick={handleRestaurarDefecto} className="w-full sm:w-auto bg-transparent">
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar valores por defecto
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={handleGuardarConfiguracion}
              disabled={!hasChanges}
              className="flex-1 sm:flex-none transition-all duration-200 hover:scale-105"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar configuración
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
