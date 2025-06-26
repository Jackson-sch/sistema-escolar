"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NivelesAcademicos } from "@/components/config/estructura-academica/niveles-academicos";
import { AreasCurriculares } from "@/components/config/estructura-academica/areas-curriculares";
import { Cursos } from "@/components/config/estructura-academica/cursos";
import { NivelesGrados } from "@/components/config/estructura-academica/niveles-grados";

export function EstructuraAcademicaClient({ 
  institucion, 
  profesoresIniciales = [],
  areasCurricularesIniciales = [],
  niveles = [],
  nivelesAcademicosIniciales,
}) {
  const [activeTab, setActiveTab] = useState("niveles-grados");
  
  // Usar la institución del contexto si está disponible, de lo contrario usar la prop
  const institucionData = institucion;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Estructura Académica</h2>
        <p className="text-muted-foreground">
          Gestión de niveles, áreas curriculares y cursos de la institución educativa.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de la Estructura Académica</CardTitle>
          <CardDescription>
            Administre la estructura académica de {institucionData?.nombreInstitucion || "la institución"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="niveles-grados">Niveles y Grados</TabsTrigger>
              <TabsTrigger value="niveles">Niveles Académicos</TabsTrigger>
              <TabsTrigger value="areas">Áreas Curriculares</TabsTrigger>
              <TabsTrigger value="cursos">Cursos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="niveles-grados" className="space-y-4">
              <NivelesGrados 
                institucion={institucionData} 
                niveles={niveles}
              />
            </TabsContent>
            
            <TabsContent value="niveles" className="space-y-4">
              <NivelesAcademicos 
                institucion={institucionData} 
                niveles={niveles} 
                nivelesAcademicosIniciales={nivelesAcademicosIniciales}
              />
            </TabsContent>
            
            <TabsContent value="areas" className="space-y-4">
              <AreasCurriculares 
                institucion={institucionData} 
                areasCurricularesIniciales={areasCurricularesIniciales}
                niveles={niveles}
              />
            </TabsContent>
            
            <TabsContent value="cursos" className="space-y-4">
              <Cursos 
                institucion={institucionData}
                niveles={niveles}
                areasCurricularesIniciales={areasCurricularesIniciales}
                profesoresIniciales={profesoresIniciales}
                nivelesAcademicosIniciales={nivelesAcademicosIniciales}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
