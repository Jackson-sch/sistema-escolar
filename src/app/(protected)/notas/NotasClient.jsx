"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Importar componentes del módulo de notas
import FormularioNota from "./components/FormularioNota";
import TablaNota from "./components/TablaNota";
import RegistroMasivoNotas from "./components/RegistroMasivoNotas";
import ConsultaNotas from "./components/ConsultaNotas";
import ResumenNotas from "./components/ResumenNotas";
import BoletasNotas from "./components/BoletasNotas";

export default function NotasClient({ initialNotas = [] }) {
  const [activeTab, setActiveTab] = useState("registro");
  const [notas, setNotas] = useState(initialNotas);
  const [loading, setLoading] = useState(false);
  const [notaEditando, setNotaEditando] = useState(null);

  // Función para actualizar la lista de notas después de operaciones
  const refreshNotas = async () => {
    try {
      setLoading(true);
      
      // Importar la función de manera dinámica para evitar errores de servidor
      const { getNotasPorProfesor } = await import('@/action/notas/nota');
      
      // Obtener las notas actualizadas
      const notasActualizadas = await getNotasPorProfesor();
      if (notasActualizadas) {
        setNotas(notasActualizadas);
      }
      
      toast.success("Notas actualizadas correctamente");
    } catch (error) {
      console.error("Error al cargar notas:", error);
      toast.error("No se pudieron cargar las notas. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar notas al iniciar o cambiar de pestaña
  useEffect(() => {
    if (activeTab === "registro") {
      refreshNotas();
    }
  }, [activeTab]);

  return (
    <Card className="p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="registro">Registro Individual</TabsTrigger>
          <TabsTrigger value="masivo">Registro Masivo</TabsTrigger>
          <TabsTrigger value="consulta">Consulta de Notas</TabsTrigger>
          <TabsTrigger value="resumen">Resumen por Curso</TabsTrigger>
          <TabsTrigger value="boletas">Boletas y Actas</TabsTrigger>
        </TabsList>

        <TabsContent value="registro" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Registro Individual de Notas</h2>
              <p className="text-sm text-muted-foreground">Gestione las calificaciones de los estudiantes por curso y evaluación</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panel izquierdo - Formulario de registro */}
            <div className="lg:col-span-1">
              <FormularioNota 
                notaId={notaEditando} 
                onSuccess={() => {
                  refreshNotas();
                  setNotaEditando(null);
                }}
                onCancel={() => setNotaEditando(null)}
              />
            </div>
            
            {/* Panel derecho - Tabla de notas */}
            <div className="lg:col-span-2">
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <TablaNota 
                  notas={notas} 
                  onUpdate={refreshNotas} 
                  onEdit={(id) => setNotaEditando(id)} 
                />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="masivo">
          <RegistroMasivoNotas onSuccess={refreshNotas} />
        </TabsContent>

        <TabsContent value="consulta">
          <ConsultaNotas />
        </TabsContent>

        <TabsContent value="resumen">
          <ResumenNotas />
        </TabsContent>

        <TabsContent value="boletas">
          <BoletasNotas />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
