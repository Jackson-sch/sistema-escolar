"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Datos de ejemplo basados en el modelo real de pagos
const datosEjemplo = [
  { name: "Pagados", value: 65, color: "#4ade80" },
  { name: "Pendientes", value: 25, color: "#facc15" },
  { name: "Vencidos", value: 10, color: "#f87171" },
];

// Datos específicos para padres
const datosPadre = [
  { name: "Pagados", value: 70, color: "#4ade80" },
  { name: "Pendientes", value: 20, color: "#facc15" },
  { name: "Vencidos", value: 10, color: "#f87171" },
];

// Función para cargar datos reales de finanzas (para implementar con API)
const cargarDatosFinanzas = async (userId, rol) => {
  try {
    // En una implementación real, esta función haría una llamada a la API
    // Ejemplo: const response = await fetch(`/api/pagos/estadisticas?userId=${userId}&rol=${rol}`);
    // return await response.json();
    
    // Por ahora devolvemos datos simulados
    return new Promise(resolve => {
      setTimeout(() => {
        // Simulamos diferentes datos según el rol
        if (rol === "admin") {
          resolve(datosEjemplo);
        } else if (rol === "padre") {
          // Para padres, mostramos datos de sus pagos (simulado)
          resolve(datosPadre);
        } else {
          resolve([]);
        }
      }, 800);
    });
  } catch (error) {
    console.error("Error al cargar datos de finanzas:", error);
    return [];
  }
};

export default function GraficoFinanzas({ userId, rol }) {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Cargar datos de finanzas
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const datos = await cargarDatosFinanzas(userId, rol);
        setChartData(datos);
      } catch (error) {
        console.error("Error al cargar datos de finanzas:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [userId, rol]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle>Estado de Pagos</CardTitle>
        <CardDescription>Distribución de pagos del periodo actual</CardDescription>
      </CardHeader>
      <CardContent className="h-[280px] pt-0">
        {isLoading ? (
          <div className="flex flex-col gap-2 h-full justify-center items-center">
            <Skeleton className="h-[250px] w-full" />
            <div className="text-sm text-muted-foreground">Cargando datos de pagos...</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full justify-center items-center">
            <p className="text-muted-foreground">No hay datos de pagos disponibles</p>
          </div>
        ) : (
          <ChartContainer
            config={{
              Pagados: {
                label: "Pagados",
                theme: {
                  light: "#4ade80",
                  dark: "#4ade80",
                },
              },
              Pendientes: {
                label: "Pendientes",
                theme: {
                  light: "#facc15",
                  dark: "#facc15",
                },
              },
              Vencidos: {
                label: "Vencidos",
                theme: {
                  light: "#f87171",
                  dark: "#f87171",
                },
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`${value} (${((value / total) * 100).toFixed(1)}%)`]}
                    />
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
