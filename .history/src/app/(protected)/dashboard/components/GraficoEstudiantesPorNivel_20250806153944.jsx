"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap } from "lucide-react";

// Datos de ejemplo para estudiantes por nivel
const datosEjemplo = [
  { nivel: "Inicial", estudiantes: 85, color: "#8b5cf6" },
  { nivel: "Primaria", estudiantes: 180, color: "#06b6d4" },
  { nivel: "Secundaria", estudiantes: 145, color: "#10b981" },
];

const cargarDatosEstudiantesPorNivel = async (userId, rol) => {
  try {
    // Simulación de llamada a API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(datosEjemplo);
      }, 800);
    });
  } catch (error) {
    console.error("Error al cargar datos de estudiantes por nivel:", error);
    return [];
  }
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{data.payload.nivel}</p>
        <p className="text-sm text-muted-foreground">
          {data.value} estudiantes (
          {(
            (data.value /
              datosEjemplo.reduce((acc, item) => acc + item.estudiantes, 0)) *
            100
          ).toFixed(1)}
          %)
        </p>
      </div>
    );
  }
  return null;
};

export default function GraficoEstudiantesPorNivel({ userId, rol }) {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const datos = await cargarDatosEstudiantesPorNivel(userId, rol);
        setChartData(datos);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, rol]);

  const total = chartData.reduce((acc, item) => acc + item.estudiantes, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-blue-600" />
          Estudiantes por Nivel
        </CardTitle>
        <CardDescription>
          Distribución de estudiantes matriculados
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        {isLoading ? (
          <div className="flex flex-col gap-2 h-full justify-center items-center">
            <Skeleton className="h-[200px] w-[200px] rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full justify-center items-center">
            <p className="text-muted-foreground">No hay datos disponibles</p>
          </div>
        ) : (
          <div className="h-full">
            <ResponsiveContainer width="100%" height="70%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="estudiantes"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Leyenda personalizada */}
            <div className="flex justify-center gap-4 mt-4">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.nivel}</span>
                  <span className="text-xs text-muted-foreground">
                    ({item.estudiantes})
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="text-center mt-3 pt-3 border-t">
              <p className="text-sm text-muted-foreground">
                Total de estudiantes
              </p>
              <p className="text-2xl font-bold text-primary">{total}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
