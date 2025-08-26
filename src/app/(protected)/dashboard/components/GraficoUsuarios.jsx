"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Datos de ejemplo basados en el modelo real de usuarios
const datosEjemplo = [
  { categoria: "Estudiantes", cantidad: 450, color: "#3b82f6" },
  { categoria: "Profesores", cantidad: 35, color: "#10b981" },
  { categoria: "Padres", cantidad: 380, color: "#f59e0b" },
  { categoria: "Administrativos", cantidad: 20, color: "#8b5cf6" },
  { categoria: "Directivos", cantidad: 5, color: "#ec4899" },
];

// Función para cargar datos reales de usuarios (para implementar con API)
const cargarDatosUsuarios = async () => {
  try {
    // En una implementación real, esta función haría una llamada a la API
    // Ejemplo: const response = await fetch('/api/usuarios/estadisticas');
    // return await response.json();
    
    // Por ahora devolvemos datos simulados
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(datosEjemplo);
      }, 800);
    });
  } catch (error) {
    console.error("Error al cargar datos de usuarios:", error);
    return [];
  }
};

export default function GraficoUsuarios({ userId, rol }) {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Cargar datos de usuarios
  useEffect(() => {
    // Solo los administradores pueden ver esta información
    if (rol !== "admin") {
      setIsLoading(false);
      return;
    }
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const datos = await cargarDatosUsuarios();
        setChartData(datos);
      } catch (error) {
        console.error("Error al cargar datos de usuarios:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [rol]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle>Distribución de Usuarios</CardTitle>
        <CardDescription>Cantidad de usuarios por tipo</CardDescription>
      </CardHeader>
      <CardContent className="h-[280px] pt-0">
        {isLoading ? (
          <div className="flex flex-col gap-2 h-full justify-center items-center">
            <Skeleton className="h-[250px] w-full" />
            <div className="text-sm text-muted-foreground">Cargando datos de usuarios...</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full justify-center items-center">
            {rol === "admin" ? (
              <p className="text-muted-foreground">No hay datos de usuarios disponibles</p>
            ) : (
              <p className="text-muted-foreground">No tienes permisos para ver esta información</p>
            )}
          </div>
        ) : (
          <ChartContainer
            config={{
              cantidad: {
                label: "Cantidad",
                theme: {
                  light: "#8b5cf6",
                  dark: "#a78bfa",
                },
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{
                  top: 5,
                  right: 20,
                  left: 50,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="categoria" type="category" />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, props) => {
                        const item = chartData.find(d => d.cantidad === value);
                        return [`${value} usuarios`, item?.categoria || ""];
                      }}
                    />
                  }
                />
                <Bar 
                  dataKey="cantidad" 
                  radius={[0, 4, 4, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
