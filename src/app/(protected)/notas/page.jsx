import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getNotasPorProfesor } from "@/action/notas/nota";
import NotasClient from "./NotasClient";

export default async function NotasPage() {
  // Obtener datos iniciales para el módulo de notas
  const notas = await getNotasPorProfesor();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Sistema de Calificaciones</h1>
      </div>
      
      <NotasClient initialNotas={notas} />
    </div>
  );
}
