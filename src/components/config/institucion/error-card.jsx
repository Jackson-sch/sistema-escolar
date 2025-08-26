"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

export function ErrorCard() {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Error al cargar datos
        </CardTitle>
        <CardDescription>{error || "No se pudieron cargar los datos de la institución"}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={() => window.location.reload()} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </Button>
      </CardContent>
    </Card>
  )
}
