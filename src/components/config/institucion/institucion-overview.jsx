"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Building,
  MapPin,
  Calendar,
  User,
  School,
  MapIcon,
  Building2,
  Clock,
  GraduationCap,
  Mail,
  Briefcase,
  CheckCircle,
  AlertTriangle,
  Info,
  Copy,
  ExternalLink,
  Phone,
} from "lucide-react"
import { formatDate } from "@/lib/formatDate"
import { useState } from "react"
import { toast } from "sonner"

export function InstitutionOverview({ institucion, director }) {
  const directorNombre = director
    ? `${director.name || ""} ${director.apellidoPaterno || ""} ${director.apellidoMaterno || ""}`.trim()
    : "No asignado"

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <GeneralInfoCard institucion={institucion} />
        <LocationCard institucion={institucion} />
        <AcademicYearCard institucion={institucion} />
        <DirectorCard director={director} directorNombre={directorNombre} />
      </div>
    </TooltipProvider>
  )
}

function GeneralInfoCard({ institucion }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success("Código copiado al portapapeles")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Error al copiar")
    }
  }

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-blue-400/20 bg-gradient-to-br from-blue-50/50 via-background to-indigo-50/30 dark:from-blue-950/20 dark:via-background dark:to-indigo-950/10 border-blue-200/50 dark:border-blue-800/50">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-400/5 dark:to-indigo-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardHeader className="pb-4 relative">
        <CardTitle className="text-lg flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 group-hover:bg-blue-500/20 dark:group-hover:bg-blue-400/20 transition-colors duration-300">
            <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <span className="text-foreground">Información General</span>
            <div className="text-xs text-muted-foreground font-normal mt-0.5">Datos básicos institucionales</div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5 relative">
        <div className="space-y-2">
          <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Institución Educativa</dt>
          <dd className="text-base font-semibold text-foreground leading-tight capitalize">{institucion.nombreInstitucion}</dd>
        </div>

        <Separator className="opacity-50" />

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/60 rounded-lg border border-border/50">
            <div className="flex items-center gap-2">
              <School className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Código Modular</dt>
                <dd className="text-sm font-mono font-semibold text-foreground">{institucion.codigoModular}</dd>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                  onClick={() => copyToClipboard(institucion.codigoModular)}
                >
                  <Copy
                    className={`h-3 w-3 transition-colors ${copied ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? "Copiado!" : "Copiar código"}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <InfoBadge
              label="Tipo de Gestión"
              value={institucion.tipoGestion}
              variant="secondary"
              icon={<Building2 className="h-3 w-3" />}
            />
            <InfoBadge
              label="Modalidad"
              value={institucion.modalidad}
              variant="outline"
              icon={<GraduationCap className="h-3 w-3" />}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LocationCard({ institucion }) {
  const openInMaps = () => {
    const address = `${institucion.direccion}, ${institucion.distrito}, ${institucion.provincia}, ${institucion.departamento}`
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    window.open(url, "_blank")
  }

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 dark:hover:shadow-green-400/20 bg-gradient-to-br from-green-50/50 via-background to-emerald-50/30 dark:from-green-950/20 dark:via-background dark:to-emerald-950/10 border-green-200/50 dark:border-green-800/50">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 dark:from-green-400/5 dark:to-emerald-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardHeader className="pb-4 relative">
        <CardTitle className="text-lg flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-500/10 dark:bg-green-400/10 group-hover:bg-green-500/20 dark:group-hover:bg-green-400/20 transition-colors duration-300">
            <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <span className="text-foreground">Ubicación</span>
            <div className="text-xs text-muted-foreground font-normal mt-0.5">Dirección y localización</div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/50"
                onClick={openInMaps}
              >
                <ExternalLink className="h-4 w-4 text-green-600 dark:text-green-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ver en Google Maps</p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5 relative">
        <div className="space-y-2">
          <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dirección</dt>
          <dd className="text-base font-medium text-foreground leading-tight">{institucion.direccion}</dd>
        </div>

        <Separator className="opacity-50" />

        <div className="space-y-4">
          <LocationItem
            icon={<MapIcon className="h-4 w-4 text-green-600 dark:text-green-400" />}
            label="Distrito / Provincia"
            value={`${institucion.distrito} / ${institucion.provincia}`}
          />

          <LocationItem
            icon={<Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />}
            label="Departamento"
            value={institucion.departamento}
            highlight
          />

          <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30 p-4 rounded-xl border border-green-200/50 dark:border-green-800/50">
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Entidades Administrativas
            </dt>
            <dd className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">UGEL</span>
                <span className="text-sm font-semibold text-foreground">{institucion.ugel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">DRE</span>
                <span className="text-sm font-semibold text-foreground">{institucion.dre}</span>
              </div>
            </dd>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AcademicYearCard({ institucion }) {
  const startDate = new Date(institucion.fechaInicioClases)
  const endDate = new Date(institucion.fechaFinClases)
  const today = new Date()
  const isActive = today >= startDate && today <= endDate

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 dark:hover:shadow-purple-400/20 bg-gradient-to-br from-purple-50/50 via-background to-violet-50/30 dark:from-purple-950/20 dark:via-background dark:to-violet-950/10 border-purple-200/50 dark:border-purple-800/50">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 dark:from-purple-400/5 dark:to-violet-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardHeader className="pb-4 relative">
        <CardTitle className="text-lg flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-400/10 group-hover:bg-purple-500/20 dark:group-hover:bg-purple-400/20 transition-colors duration-300">
            <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-foreground">Año Escolar</span>
              {isActive && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs px-2 py-0.5"
                >
                  Activo
                </Badge>
              )}
            </div>
            <div className="text-sm font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
              {institucion.cicloEscolarActual}
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5 relative">
        <div className="grid grid-cols-1 gap-3">
          <DateCard
            icon={<Clock className="h-4 w-4 text-green-600 dark:text-green-400" />}
            label="Inicio de Clases"
            date={institucion.fechaInicioClases}
            color="green"
          />

          <DateCard
            icon={<Clock className="h-4 w-4 text-red-600 dark:text-red-400" />}
            label="Fin de Clases"
            date={institucion.fechaFinClases}
            color="red"
          />
        </div>

        <Separator className="opacity-50" />

        <div>
          <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            Niveles Educativos
          </dt>
          <dd className="flex flex-wrap gap-2">
            {institucion.niveles?.length > 0 ? (
              institucion.niveles.map((nivel) => (
                <Badge
                  key={nivel.id}
                  variant="secondary"
                  className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/70 transition-colors text-xs px-3 py-1"
                >
                  {nivel.nombre.charAt(0).toUpperCase() + nivel.nombre.slice(1)}
                </Badge>
              ))
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                <Info className="h-4 w-4" />
                No hay niveles asignados
              </div>
            )}
          </dd>
        </div>
      </CardContent>
    </Card>
  )
}

function DirectorCard({ director, directorNombre }) {
  const isAssigned = !!director

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 dark:hover:shadow-amber-400/20 bg-gradient-to-br from-amber-50/50 via-background to-orange-50/30 dark:from-amber-950/20 dark:via-background dark:to-orange-950/10 border-amber-200/50 dark:border-amber-800/50">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-400/5 dark:to-orange-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardHeader className="pb-4 relative">
        <CardTitle className="text-lg flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 group-hover:bg-amber-500/20 dark:group-hover:bg-amber-400/20 transition-colors duration-300">
            <User className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <span className="text-foreground">Director(a)</span>
            <div className="text-xs text-muted-foreground font-normal mt-0.5">Autoridad institucional</div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5 relative">
        <div className="space-y-2">
          <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nombre Completo</dt>
          <dd className="text-base font-semibold text-foreground capitalize leading-tight">{directorNombre}</dd>
        </div>

        <Separator className="opacity-50" />

        <div className="space-y-4">
          <ContactItem
            icon={<Briefcase className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
            label="Cargo"
            value={director?.cargo || "No asignado"}
            className="capitalize"
          />

          <ContactItem
            icon={<Mail className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
            label="Correo electrónico"
            value={director?.email || "No asignado"}
            copyable={!!director?.email}
          />

          {director?.telefono && (
            <ContactItem
              icon={<Phone className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
              label="Teléfono"
              value={director.telefono}
              copyable
            />
          )}

          <div className="pt-2">
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Estado</dt>
            <dd>
              <StatusBadge isAssigned={isAssigned} />
            </dd>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper Components
function InfoBadge({
  label,
  value,
  variant,
  icon,
}) {
  return (
    <div className="flex items-center justify-between p-2 bg-muted/40 rounded-lg">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <Badge variant={variant} className="text-xs">
        {value}
      </Badge>
    </div>
  )
}

function LocationItem({
  icon,
  label,
  value,
  highlight = false,
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg ${highlight ? "bg-muted/60 border border-border" : "bg-muted/40"}`}
    >
      {icon}
      <div className="flex-1">
        <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
        <dd className={`text-sm ${highlight ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
          {value}
        </dd>
      </div>
    </div>
  )
}

function DateCard({
  icon,
  label,
  date,
  color,
}) {
  const bgColor =
    color === "green"
      ? "bg-green-50/80 dark:bg-green-950/30 border-green-200/50 dark:border-green-800/50"
      : "bg-red-50/80 dark:bg-red-950/30 border-red-200/50 dark:border-red-800/50"

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${bgColor}`}>
      {icon}
      <div className="flex-1">
        <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
        <dd className="text-sm font-semibold text-foreground">{formatDate(date)}</dd>
      </div>
    </div>
  )
}

function ContactItem({
  icon,
  label,
  value,
  className = "",
  copyable = false,
}) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    if (!copyable || !value || value === "No asignado") return

    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success("Copiado al portapapeles")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Error al copiar")
    }
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
      {icon}
      <div className="flex-1">
        <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
        <dd className={`text-sm font-medium text-foreground ${className}`}>{value}</dd>
      </div>
      {copyable && value !== "No asignado" && (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted" onClick={copyToClipboard}>
          <Copy
            className={`h-3 w-3 transition-colors ${copied ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
          />
        </Button>
      )}
    </div>
  )
}

function StatusBadge({ isAssigned }) {
  return (
    <Badge
      variant="outline"
      className={`transition-all duration-200 ${
        isAssigned
          ? "bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/70"
          : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-950/70"
      }`}
    >
      {isAssigned ? <CheckCircle className="h-3.5 w-3.5 mr-2" /> : <AlertTriangle className="h-3.5 w-3.5 mr-2" />}
      {isAssigned ? "Asignado" : "No asignado"}
    </Badge>
  )
}
