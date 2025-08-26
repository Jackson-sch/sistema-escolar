"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, CalendarDays, Clock } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";

export function CalendarioEscolar({ periodos = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Obtener el primer y último día del mes actual
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Función para obtener el período activo en una fecha específica
  const getPeriodoEnFecha = (fecha) => {
    return periodos.find(periodo => 
      isWithinInterval(fecha, {
        start: new Date(periodo.fechaInicio),
        end: new Date(periodo.fechaFin)
      })
    );
  };

  // Función para obtener el color del período según su tipo
  const getColorPeriodo = (tipo) => {
    const colores = {
      BIMESTRE: "bg-blue-100 text-blue-800 border-blue-200",
      TRIMESTRE: "bg-green-100 text-green-800 border-green-200", 
      SEMESTRE: "bg-purple-100 text-purple-800 border-purple-200",
      ANUAL: "bg-orange-100 text-orange-800 border-orange-200"
    };
    return colores[tipo] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Navegar entre meses
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // Estadísticas del mes actual
  const estadisticasMes = useMemo(() => {
    const periodosEnMes = new Set();
    let diasConPeriodo = 0;
