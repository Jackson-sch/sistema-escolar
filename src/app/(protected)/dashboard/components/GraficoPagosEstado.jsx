"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Datos de ejemplo para estado de pagos
const datosEjemplo = [
  { mes: "Ene", pagados: 85, pendientes: 12, vencidos: 3, monto: 125400 },
  { mes: "Feb", pagados: 88, pendientes: 10, vencidos: 2, monto: 132800 },
  { mes: "Mar", pagados: 82, pendientes: 15, vencidos: 3, monto: 118600 },
  { mes: "Abr", pagados: 90, pendientes: 8, vencidos: 2, monto: 145200 },
  { mes: "May", pagados: 87, pendientes: 11, vencidos: 2, monto: 138900 },
  { mes: "Jun", pagados: 89, pendientes: 9, vencidos: 2, monto: 142300 },
];

const cargarDatosPagos = async (userId, rol) => {
  try {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (rol === "padre") {
          // Para padres, mostrar solo sus pagos
          resolve(
            datosEjemplo.map((item) => ({
              ...item,
              pagados: Math.random() > 0.8 ? 0 : 100, // Algunos meses sin pagar
              pendientes: Math.random() > 0.8 ? 100 : 0,
              vencidos: 0,
              monto: 850, // Monto fijo para un estudiante
            }))
          );
        } else {
          resolve(datosEjemplo);
        }
      }, 800);
    });
  } catch (error) {
    console.error("Error al cargar datos de pagos:", error);
    return [];
  }
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-sm text-green-600">Pagados: {data.pagados}%</p>
          <p className="text-sm text-yellow-600">
            Pendientes: {data.pendientes}%
          </p>
          <p className="text-sm text-red-600">Vencidos: {data.vencidos}%</p>
          <p className="text-sm text-blue-600 font-medium">
            Monto: S/. {data.monto.toLocaleString()}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function GraficoPagosEstado({ userId, rol }) {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const datos = await cargarDatosPagos(userId, rol);
        setChartData(datos);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, rol]);

  // Calcular estadísticas
  const estadisticas =
    chartData.length > 0
      ? {
          promedioPagados: (
            chartData.reduce((acc, item) => acc + item.pagados, 0) /
            chartData.length
          ).toFixed(1),
          totalMonto: chartData.reduce((acc, item) => acc + item.monto, 0),
          tendencia:
            chartData.length >= 2
              ? chartData[chartData.length - 1].pagados -
                chartData[chartData.length - 2].pagados
              : 0,
        }
      : { promedioPagados: 0, totalMonto: 0, tendencia: 0 };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-emerald-600" />
          Estado de Pagos
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          <span>Distribución mensual de pagos</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {estadisticas.promedioPagados}% promedio
            </Badge>
            {estadisticas.tendencia !== 0 && (
              <div
                className={`flex items-center gap-1 text-xs ${
                  estadisticas.tendencia > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                <TrendingUp
                  className={`h-3 w-3 ${
                    estadisticas.tendencia < 0 ? "rotate-180" : ""
                  }`}
                />
                {estadisticas.tendencia > 0 ? "+" : ""}
                {estadisticas.tendencia.toFixed(1)}%
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
              No hay datos de pagos disponibles
            </p>
          </div>
        ) : (
          <div className="h-full">
            <ResponsiveContainer width="100%" height="85%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="pagados"
                  stackId="a"
                  fill="#10b981"
                  name="Pagados"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="pendientes"
                  stackId="a"
                  fill="#f59e0b"
                  name="Pendientes"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="vencidos"
                  stackId="a"
                  fill="#ef4444"
                  name="Vencidos"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

            {/* Resumen financiero */}
            <div className="flex justify-between items-center mt-2 pt-2 border-t text-sm">
              <span className="text-muted-foreground">Total recaudado:</span>
              <span className="font-bold text-emerald-600">
                S/. {estadisticas.totalMonto.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
