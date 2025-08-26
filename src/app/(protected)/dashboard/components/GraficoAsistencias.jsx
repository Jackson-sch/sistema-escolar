"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Datos de ejemplo basados en el modelo real de asistencias
const datosEjemplo = [
  { mes: "Ene", presente: 92, ausente: 5, tardanza: 3, justificada: 2 },
  { mes: "Feb", presente: 88, ausente: 8, tardanza: 4, justificada: 3 },
  { mes: "Mar", presente: 90, ausente: 6, tardanza: 4, justificada: 2 },
  { mes: "Abr", presente: 85, ausente: 10, tardanza: 5, justificada: 4 },
  { mes: "May", presente: 91, ausente: 4, tardanza: 5, justificada: 2 },
  { mes: "Jun", presente: 87, ausente: 8, tardanza: 5, justificada: 3 },
  { mes: "Jul", presente: 89, ausente: 7, tardanza: 4, justificada: 2 },
];

// Función para cargar datos reales de asistencias (para implementar con API)
const cargarDatosAsistencias = async (userId, rol) => {
  try {
    // En una implementación real, esta función haría una llamada a la API
    // Ejemplo: const response = await fetch(`/api/asistencias/estadisticas?userId=${userId}&rol=${rol}`);
    // return await response.json();
    
    // Por ahora devolvemos datos simulados
    return new Promise(resolve => {
      setTimeout(() => {
        // Simulamos diferentes datos según el rol
        if (rol === "admin" || rol === "profesor") {
          resolve(datosEjemplo);
        } else {
          // Para estudiantes o padres, mostramos solo datos recientes
          resolve(datosEjemplo.slice(3));
        }
      }, 800);
    });
  } catch (error) {
    console.error("Error al cargar datos de asistencias:", error);
    return [];
  }
};

export default function GraficoAsistencias({ userId, rol }) {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Cargar datos de asistencias
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const datos = await cargarDatosAsistencias(userId, rol);
        setChartData(datos);
      } catch (error) {
        console.error("Error al cargar datos de asistencias:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [userId, rol]);

  return (
    <Card className="col-span-full xl:col-span-2 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle>Estadísticas de Asistencia</CardTitle>
        <CardDescription>Porcentaje de asistencia por mes</CardDescription>
      </CardHeader>
      <CardContent className="h-[280px] pt-0">
        {isLoading ? (
          <div className="flex flex-col gap-2 h-full justify-center items-center">
            <Skeleton className="h-[250px] w-full" />
            <div className="text-sm text-muted-foreground">Cargando datos de asistencias...</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full justify-center items-center">
            <p className="text-muted-foreground">No hay datos de asistencia disponibles</p>
          </div>
        ) : (
          <ChartContainer
            config={{
              presente: {
                label: "Presente",
                theme: {
                  light: "#4ade80",
                  dark: "#4ade80",
                },
              },
              ausente: {
                label: "Ausente",
                theme: {
                  light: "#f87171",
                  dark: "#f87171",
                },
              },
              tardanza: {
                label: "Tardanza",
                theme: {
                  light: "#facc15",
                  dark: "#facc15",
                },
              },
              justificada: {
                label: "Justificada",
                theme: {
                  light: "#60a5fa",
                  dark: "#60a5fa",
                },
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 5,
                  left: -20,
                  bottom: 5,
                }}
                barSize={20}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" />
                <YAxis />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      formatter={(value, name) => [`${value}%`, name]}
                    />
                  }
                />
                <Bar dataKey="presente" stackId="a" fill="var(--color-presente)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ausente" stackId="a" fill="var(--color-ausente)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tardanza" stackId="a" fill="var(--color-tardanza)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="justificada" stackId="a" fill="var(--color-justificada)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
