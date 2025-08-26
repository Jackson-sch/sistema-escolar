"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
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
    return new Promise(resolve => {
      setTimeout(() => {
        if (rol === "estudiante") {
          // Para estudiantes, mostrar datos personales
          resolve(datosEjemplo.map(item => ({
            ...item,
            promedio: (Math.random() * 4 + 14).toFixed(1), // Notas entre 14-18
          })));
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
        <p className="text-sm text-blue-600">
          Promedio: {data.promedio}
        </p>
        <p className="text-sm text-green-600">
          Aprobados: {data.aprobados}%
        </p>
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

  const promedioGeneral = chartData.length > 0 
    ? (chartData.reduce((acc, item) => acc + parseFloat(item.promedio), 0) / chartData.length).toFixed(1)
    : 0;

  const tendencia = chartData.length >= 2 
    ? parseFloat(chartData[chartData.length - 1].promedio) - parseFloat(chartData[chartData.length - 2].promedio)
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
              <div className={`flex items-center gap-1 text-xs ${tendencia > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`h-3 w-3 ${tendencia < 0 ? 'rotate-180' : ''}`} />
                {tendencia > 0 ? '+' : ''}{tendencia.toFixed(1)}
              </div>
  