import { getInstituciones } from "@/action/config/institucion-action";
import { getPeriodos } from "@/action/config/periodo-action";
import { PeriodosCalendarioClient } from "./periodos-calendario-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Períodos Académicos y Calendario",
  description: "Gestión de períodos académicos y calendario escolar",
};

export default async function PeriodosCalendarioPage() {
  // Obtener datos de la institución
  const { success: successInstitucion, data: instituciones, error: errorInstitucion } = await getInstituciones();
  
  // Por ahora trabajamos con la primera institución
  const institucion = instituciones?.[0] || null;
  
  // Si hay institución, obtener los períodos académicos
  let periodos = [];
  let successPeriodos = false;
  let errorPeriodos = null;
  
  if (institucion) {
    const periodoResponse = await getPeriodos(institucion.id);
    periodos = periodoResponse.data;
    successPeriodos = periodoResponse.success;
    errorPeriodos = periodoResponse.error;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Períodos Académicos y Calendario</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los períodos académicos y el calendario escolar
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      {!successInstitucion && (
        <Card className="mb-6 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Error al cargar datos
            </CardTitle>
            <CardDescription>{errorInstitucion || "No se pudieron cargar los datos de la institución"}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {successInstitucion && !institucion && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración requerida</CardTitle>
            <CardDescription>
              Antes de configurar períodos académicos, debes completar la información básica de tu institución.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Por favor, dirígete a la sección de <a href="/config/institucion" className="text-primary underline">Configuración Institucional</a> para completar la información necesaria.</p>
          </CardContent>
        </Card>
      )}

      {successInstitucion && institucion && (
        <PeriodosCalendarioClient 
          institucion={institucion} 
          periodos={periodos} 
          successPeriodos={successPeriodos}
          errorPeriodos={errorPeriodos}
        />
      )}
    </div>
  );
}
