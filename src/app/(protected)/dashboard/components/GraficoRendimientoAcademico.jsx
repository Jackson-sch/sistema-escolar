"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Datos de ejemplo basados en el modelo real de notas
const datosEjemplo = [
  { periodo: "Bimestre 1", matematicas: 14, comunicacion: 16, ciencias: 15, historia: 13, arte: 17 },
  { periodo: "Bimestre 2", matematicas: 15, comunicacion: 15, ciencias: 16, historia: 14, arte: 16 },
  { periodo: "Bimestre 3", matematicas: 16, comunicacion: 17, ciencias: 14, historia: 15, arte: 18 },
  { periodo: "Bimestre 4", matematicas: 17, comunicacion: 16, ciencias: 17, historia: 16, arte: 17 },
];

// Datos específicos para estudiantes
const datosEstudiante = [
  { periodo: "Bimestre 1", matematicas: 13, comunicacion: 15, ciencias: 14, historia: 12, arte: 16 },
  { periodo: "Bimestre 2", matematicas: 14, comunicacion: 16, ciencias: 15, historia: 13, arte: 17 },
  { periodo: "Bimestre 3", matematicas: 15, comunicacion: 16, ciencias: 16, historia: 14, arte: 18 },
  { periodo: "Bimestre 4", matematicas: 16, comunicacion: 17, ciencias: 17, historia: 15, arte: 18 },
];

// Función para cargar datos reales de rendimiento académico (para implementar con API)
const cargarDatosRendimiento = async (userId, rol) => {
  try {
    // En una implementación real, esta función haría una llamada a la API
    // Ejemplo: const response = await fetch(`/api/notas/rendimiento?userId=${userId}&rol=${rol}`);
    // return await response.json();
    
    // Por ahora devolvemos datos simulados
    return new Promise(resolve => {
      setTimeout(() => {
        // Simulamos diferentes datos según el rol
        if (rol === "admin" || rol === "profesor") {
          resolve(datosEjemplo);
        } else if (rol === "estudiante") {
          resolve(datosEstudiante);
        } else if (rol === "padre") {
          // Para padres, mostramos datos de sus hijos (simulado)
          resolve(datosEstudiante);
        } else {
          resolve([]);
        }
      }, 800);
    });
  } catch (error) {
    console.error("Error al cargar datos de rendimiento académico:", error);
    return [];
  }
};

export default function GraficoRendimientoAcademico({ userId, rol }) {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Cargar datos de rendimiento académico
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const datos = await cargarDatosRendimiento(userId, rol);
        setChartData(datos);
      } catch (error) {
        console.error("Error al cargar datos de rendimiento académico:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [userId, rol]);

  return (
    <Card className="col-span-full xl:col-span-2 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle>Rendimiento Académico</CardTitle>
        <CardDescription>Evolución de calificaciones por periodo</CardDescription>
      </CardHeader>
      <CardContent className="h-[280px] pt-0">
        {isLoading ? (
          <div className="flex flex-col gap-2 h-full justify-center items-center">
            <Skeleton className="h-[250px] w-full" />
            <div className="text-sm text-muted-foreground">Cargando datos de rendimiento académico...</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full justify-center items-center">
            <p className="text-muted-foreground">No hay datos de rendimiento académico disponibles</p>
          </div>
        ) : (
          <ChartContainer
            config={{
              matematicas: {
                label: "Matemáticas",
                theme: {
                  light: "#3b82f6",
                  dark: "#60a5fa",
                },
              },
              comunicacion: {
                label: "Comunicación",
                theme: {
                  light: "#10b981",
                  dark: "#34d399",
                },
              },
              ciencias: {
                label: "Ciencias",
                theme: {
                  light: "#f59e0b",
                  dark: "#fbbf24",
                },
              },
              historia: {
                label: "Historia",
                theme: {
                  light: "#8b5cf6",
                  dark: "#a78bfa",
                },
              },
              arte: {
                label: "Arte",
                theme: {
                  light: "#ec4899",
                  dark: "#f472b6",
                },
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 5,
                  left: -20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="periodo" />
                <YAxis domain={[0, 20]} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent 
                      formatter={(value) => [`${value}`, 'Calificación']}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="matematicas" stroke="var(--color-matematicas)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="comunicacion" stroke="var(--color-comunicacion)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="ciencias" stroke="var(--color-ciencias)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="historia" stroke="var(--color-historia)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="arte" stroke="var(--color-arte)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
