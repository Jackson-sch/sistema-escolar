"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
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
    return new Promise(resolve => {
      setTimeout(() => {
        if (rol === "padre") {
          // Para padres, mostrar solo sus pagos
          resolve(datosEjemplo.map(item => ({
            ...item,
            pagados: Math.random() > 0.8 ? 0 : 100, // Algunos meses sin pagar
            pendientes: Math.random() > 0.8 ? 100 : 0,
            vencidos: 0,
            monto: 850 // Monto fijo para un estudiante
          })));
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
          <p className="text-sm text-green-600">
            Pagados: {data.pagados}%
          </p>
          <p className="text-sm text-yellow-600">
            Pendientes: {data.pendientes}%
          </p>
          <p className="text-sm text-red-600">
            Vencidos: {data.vencidos}%
          </p>
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
  const