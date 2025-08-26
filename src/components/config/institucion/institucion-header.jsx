import { Building } from "lucide-react"

export function InstitutionHeader() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
        <Building className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración Institucional</h1>
        <p className="text-muted-foreground">Gestiona la información general de tu institución educativa</p>
      </div>
    </div>
  )
}
