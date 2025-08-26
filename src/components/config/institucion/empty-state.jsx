import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InstitucionForm } from "@/components/config/institucion/form/institucion-form"
import { Building, Plus } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
        <Building className="h-8 w-8 text-muted-foreground" />
      </div>

      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Plus className="h-5 w-5" />
            Configuración inicial
          </CardTitle>
          <CardDescription>
            No hay ninguna institución configurada. Por favor, completa el siguiente formulario para comenzar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InstitucionForm />
        </CardContent>
      </Card>
    </div>
  )
}
