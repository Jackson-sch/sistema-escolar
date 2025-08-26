"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Search, BarChart3, Users } from "lucide-react";
import TomarAsistencia from "./TomarAsistencia";
import ConsultarAsistencias from "./ConsultarAsistencias";
import ReportesAsistencias from "./ReportesAsistencias";
import AsistenciasHijos from "./AsistenciasHijos";
import { useSession } from "next-auth/react";

export default function AsistenciasClient() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("tomar");

  // Determinar qué pestañas mostrar según el rol del usuario
  const mostrarTomarAsistencia = session?.user?.role === "profesor" || session?.user?.role === "administrativo";
  const mostrarConsultar = session?.user?.role !== "padre";
  const mostrarReportes = session?.user?.role === "profesor" || session?.user?.role === "administrativo";
  const mostrarHijos = session?.user?.role === "padre";

  // Si es padre, mostrar directamente las asistencias de sus hijos
  if (session?.user?.role === "padre") {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Asistencias de mis Hijos</h1>
          <p className="text-muted-foreground">
            Consulta la asistencia de tus hijos a clases
          </p>
        </div>
        <AsistenciasHijos />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestión de Asistencias</h1>
        <p className="text-muted-foreground">
          Sistema integral para el registro y seguimiento de asistencias estudiantiles
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4">
          {mostrarTomarAsistencia && (
            <TabsTrigger value="tomar" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Tomar Asistencia</span>
              <span className="sm:hidden">Tomar</span>
            </TabsTrigger>
          )}
          {mostrarConsultar && (
            <TabsTrigger value="consultar" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Consultar</span>
              <span className="sm:hidden">Ver</span>
            </TabsTrigger>
          )}
          {mostrarReportes && (
            <TabsTrigger value="reportes" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Reportes</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
          )}
        </TabsList>

        {mostrarTomarAsistencia && (
          <TabsContent value="tomar" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Tomar Asistencia
                </CardTitle>
                <CardDescription>
                  Registra la asistencia diaria de los estudiantes por curso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TomarAsistencia />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {mostrarConsultar && (
          <TabsContent value="consultar" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Consultar Asistencias
                </CardTitle>
                <CardDescription>
                  Busca y filtra registros de asistencia por diferentes criterios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConsultarAsistencias />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {mostrarReportes && (
          <TabsContent value="reportes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Reportes y Estadísticas
                </CardTitle>
                <CardDescription>
                  Analiza patrones de asistencia y genera reportes detallados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReportesAsistencias />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
