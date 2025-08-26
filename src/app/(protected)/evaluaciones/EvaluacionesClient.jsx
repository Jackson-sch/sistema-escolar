"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CrearEvaluacion from "./components/CrearEvaluacion";
import ListaEvaluaciones from "./components/ListaEvaluaciones";
import CalificarEvaluaciones from "./components/CalificarEvaluaciones";
import ResultadosEvaluaciones from "./components/ResultadosEvaluaciones";
import PendientesEvaluaciones from "./components/PendientesEvaluaciones";

export default function EvaluacionesClient({ user, cursos, periodos }) {
  const [activeTab, setActiveTab] = useState("lista");
  const [selectedEvaluacion, setSelectedEvaluacion] = useState(null);

  // Determinar qué pestañas mostrar según el rol del usuario
  const showCrearTab = user.role === "PROFESOR" || user.role === "profesor" || user.role === "ADMIN" || user.role === "admin";
  const showCalificarTab = user.role === "PROFESOR" || user.role === "profesor" || user.role === "ADMIN" || user.role === "admin";

  const handleSelectEvaluacion = (evaluacion) => {
    setSelectedEvaluacion(evaluacion);
    if (showCalificarTab) {
      setActiveTab("calificar");
    }
  };

  const handleCreatedEvaluacion = () => {
    setActiveTab("lista");
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader className="bg-green-50">
          <CardTitle className="text-2xl font-bold text-green-800">
            Gestión de Evaluaciones
          </CardTitle>
          <CardDescription>
            Administre las evaluaciones, calificaciones y resultados de los estudiantes
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full justify-start border-b bg-transparent h-auto p-0">
              <TabsTrigger
                value="lista"
                className="data-[state=active]:bg-green-50 data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none px-4 py-2"
              >
                Lista de Evaluaciones
              </TabsTrigger>
              {showCrearTab && (
                <TabsTrigger
                  value="crear"
                  className="data-[state=active]:bg-green-50 data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none px-4 py-2"
                >
                  Crear Evaluación
                </TabsTrigger>
              )}
              {showCalificarTab && (
                <TabsTrigger
                  value="calificar"
                  className="data-[state=active]:bg-green-50 data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none px-4 py-2"
                >
                  Calificar
                </TabsTrigger>
              )}
              <TabsTrigger
                value="pendientes"
                className="data-[state=active]:bg-green-50 data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none px-4 py-2"
              >
                Pendientes
              </TabsTrigger>
              <TabsTrigger
                value="resultados"
                className="data-[state=active]:bg-green-50 data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none px-4 py-2"
              >
                Resultados
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lista" className="p-4">
              <ListaEvaluaciones 
                user={user} 
                cursos={cursos} 
                onSelectEvaluacion={handleSelectEvaluacion}
              />
            </TabsContent>

            {showCrearTab && (
              <TabsContent value="crear" className="p-4">
                <CrearEvaluacion 
                  user={user} 
                  cursos={cursos} 
                  periodos={periodos} 
                  onCreated={handleCreatedEvaluacion}
                />
              </TabsContent>
            )}

            {showCalificarTab && (
              <TabsContent value="calificar" className="p-4">
                <CalificarEvaluaciones 
                  user={user} 
                  cursos={cursos}
                />
              </TabsContent>
            )}

            <TabsContent value="pendientes" className="p-4">
              <PendientesEvaluaciones 
                user={user}
              />
            </TabsContent>

            <TabsContent value="resultados" className="p-4">
              <ResultadosEvaluaciones 
                user={user} 
                cursos={cursos}
                role={user.role}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
