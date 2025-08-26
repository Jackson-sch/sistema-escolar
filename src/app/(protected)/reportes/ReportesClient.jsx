"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BarChart2, Users, BookOpen, Download } from "lucide-react";
import ReporteAcademico from "./components/ReporteAcademico";
import ReporteAsistencia from "./components/ReporteAsistencia";
import ReporteAdministrativo from "./components/ReporteAdministrativo";
import ReporteEstadistico from "./components/ReporteEstadistico";

export default function ReportesClient({ user }) {
  const [activeTab, setActiveTab] = useState("academico");
  
  if (!user?.id) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No se pudo identificar al usuario. Por favor, inicie sesión nuevamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reportes</h1>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar datos
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Centro de reportes</CardTitle>
          <CardDescription>
            Genere y visualice diferentes tipos de reportes para la gestión escolar.
            Seleccione el tipo de reporte que desea consultar.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="academico" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Académicos
          </TabsTrigger>
          <TabsTrigger value="asistencia" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Asistencias
          </TabsTrigger>
          <TabsTrigger value="administrativo" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Administrativos
          </TabsTrigger>
          <TabsTrigger value="estadistico" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Estadísticos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="academico">
          <ReporteAcademico userId={user.id} />
        </TabsContent>
        
        <TabsContent value="asistencia">
          <ReporteAsistencia userId={user.id} />
        </TabsContent>
        
        <TabsContent value="administrativo">
          <ReporteAdministrativo userId={user.id} />
        </TabsContent>
        
        <TabsContent value="estadistico">
          <ReporteEstadistico userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
