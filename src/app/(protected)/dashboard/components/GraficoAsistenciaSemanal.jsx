"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarCheck } from "lucide-react";

// Datos de ejemplo para asistencia semanal
const datosEjemplo = [
  { dia: "Lun", presente: 92, ausente: 8, tardanza: 3 },
  { dia: "Mar", presente: 88, ausente: 12, tardanza: 5 },
  { dia: "Mié", presente: 90, ausente: 10, tardanza: 4 },
  { dia: "Jue", presente: 85, ausente: 15, tardanza: 6 },
  { dia: "Vie", presente: 87, ausente: 13, tardanza: 4 },
];

const cargarDatosAsistenciaSemanal = async (userId, rol) => {
  try {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(datosEjemplo);
      }, 800);
    });
  } catch (error) {
    console.error("Error al cargar datos de asistencia semanal:", error);
    return [];
  }
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function GraficoAsistenciaSemanal({ userId, rol }) {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const datos = await cargarDatosAsistenciaSemanal(userId, rol);
        setChartData(datos);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, rol]);

  const promedioAsistencia =
    chartData.length > 0
      ? (
          chartData.reduce((acc, item) => acc + item.presente, 0) /
          chartData.length
        ).toFixed(1)
      : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-green-600" />
          Asistencia Semanal
        </CardTitle>
        <CardDescription>
          Tendencia de asistencia de la semana actual
          {promedioAsistencia > 0 && (
            <span className="ml-2 text-sm font-medium text-green-600">
              Promedio: {promedioAsistencia}%
            </span>
          )}
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
              No hay datos de asistencia disponibles
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="presente"
                stroke="#10b981"
                strokeWidth={3}
                name="Presente"
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="ausente"
                stroke="#ef4444"
                strokeWidth={2}
                name="Ausente"
                dot={{ fill: "#ef4444", strokeWidth: 2, r: 3 }}
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="tardanza"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Tardanza"
                dot={{ fill: "#f59e0b", strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
