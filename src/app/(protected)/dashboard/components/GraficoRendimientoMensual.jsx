"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, BookOpen } from "lucide-react";

// Datos de ejemplo para rendimiento mensual
const datosEjemplo = [
  { mes: "Ene", promedio: 16.2, aprobados: 85, desaprobados: 15 },
  { mes: "Feb", promedio: 15.8, aprobados: 82, desaprobados: 18 },
  { mes: "Mar", promedio: 16.5, aprobados: 88, desaprobados: 12 },
  { mes: "Abr", promedio: 15.9, aprobados: 84, desaprobados: 16 },
  { mes: "May", promedio: 16.8, aprobados: 90, desaprobados: 10 },
  { mes: "Jun", promedio: 16.3, aprobados: 86, desaprobados: 14 },
];

const cargarDatosRendimiento = async (userId, rol) => {
  try {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (rol === "estudiante") {
          // Para estudiantes, mostrar datos personales
          resolve(
            datosEjemplo.map((item) => ({
              ...item,
              promedio: (Math.random() * 4 + 14).toFixed(1), // Notas entre 14-18
            }))
          );
        } else {
          resolve(datosEjemplo);
        }
      }, 800);
    });
  } catch (error) {
    console.error("Error al cargar datos de rendimiento:", error);
    return [];
  }
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-2">{label}</p>
        <p className="text-sm text-blue-600">Promedio: {data.promedio}</p>
        <p className="text-sm text-green-600">Aprobados: {data.aprobados}%</p>
        <p className="text-sm text-red-600">
          Desaprobados: {data.desaprobados}%
        </p>
      </div>
    );
  }
  return null;
};

export default function GraficoRendimientoMensual({ userId, rol }) {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const datos = await cargarDatosRendimiento(userId, rol);
        setChartData(datos);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, rol]);

  const promedioGeneral =
    chartData.length > 0
      ? (
          chartData.reduce((acc, item) => acc + parseFloat(item.promedio), 0) /
          chartData.length
        ).toFixed(1)
      : 0;

  const tendencia =
    chartData.length >= 2
      ? parseFloat(chartData[chartData.length - 1].promedio) -
        parseFloat(chartData[chartData.length - 2].promedio)
      : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-600" />
          Rendimiento Académico
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          <span>Evolución del promedio mensual</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              Promedio: {promedioGeneral}
            </span>
            {tendencia !== 0 && (
              <div
                className={`flex items-center gap-1 text-xs ${
                  tendencia > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                <TrendingUp
                  className={`h-3 w-3 ${tendencia < 0 ? "rotate-180" : ""}`}
                />
                {tendencia > 0 ? "+" : ""}
                {tendencia.toFixed(1)}
              </div>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        {isLoading ? (
          <div className="flex flex-col gap-2 h-full justify-center items-center">
            <Skeleton className="h-[250px] w-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full justify-center items-center">
            <p className="text-muted-foreground">
              No hay datos de rendimiento disponibles
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorPromedio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis domain={[10, 20]} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="promedio"
                stroke="#8b5cf6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorPromedio)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
