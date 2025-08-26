"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  Star,
  Sun,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isWithinInterval,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  getTipoDia,
  getFeriadosPeru,
  esFeriado,
  esFinDeSemana,
} from "@/lib/feriados-peru";

export function CalendarioEscolar({ periodos = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Obtener el primer y último día del mes actual, incluyendo días de semanas anteriores/posteriores
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Domingo como primer día
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Obtener feriados del año actual
  const feriadosDelAño = useMemo(() => {
    return getFeriadosPeru(currentDate.getFullYear());
  }, [currentDate]);

  // Función para obtener el período activo en una fecha específica
  const getPeriodoEnFecha = (fecha) => {
    return periodos.find((periodo) =>
      isWithinInterval(fecha, {
        start: new Date(periodo.fechaInicio),
        end: new Date(periodo.fechaFin),
      })
    );
  };

  // Función para obtener el color del período según su tipo
  const getColorPeriodo = (tipo) => {
    const colores = {
      BIMESTRE: "bg-blue-100 text-blue-800 border-blue-200",
      TRIMESTRE: "bg-green-100 text-green-800 border-green-200",
      SEMESTRE: "bg-purple-100 text-purple-800 border-purple-200",
      ANUAL: "bg-orange-100 text-orange-800 border-orange-200",
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
    let diasFeriados = 0;
    let diasFinSemana = 0;
    let diasLaborables = 0;

    monthDays.forEach((dia) => {
      const periodo = getPeriodoEnFecha(dia);
      const tipoDia = getTipoDia(dia);

      if (periodo) {
        periodosEnMes.add(periodo.id);
        diasConPeriodo++;
      }

      if (tipoDia.tipo === "feriado") {
        diasFeriados++;
      } else if (tipoDia.tipo === "sabado" || tipoDia.tipo === "domingo") {
        diasFinSemana++;
      } else {
        diasLaborables++;
      }
    });

    return {
      periodosActivos: periodosEnMes.size,
      diasConPeriodo,
      totalDias: monthDays.length,
      diasFeriados,
      diasFinSemana,
      diasLaborables,
    };
  }, [monthDays, periodos]);

  return (
    <div className="space-y-6">
      {/* Header del calendario */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            {format(currentDate, "MMMM yyyy", { locale: es })}
          </h3>
          <p className="text-sm text-muted-foreground">
            {estadisticasMes.periodosActivos} período(es) activo(s) •{" "}
            {estadisticasMes.diasLaborables} días laborables •{" "}
            {estadisticasMes.diasFeriados} feriados •{" "}
            {estadisticasMes.diasFinSemana} fin de semana
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
            Hoy
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendario principal */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(
                  (dia) => (
                    <div
                      key={dia}
                      className="p-2 text-center text-sm font-medium text-muted-foreground"
                    >
                      {dia}
                    </div>
                  )
                )}
              </div>

              {/* Días del mes */}
              <div className="grid grid-cols-7 gap-1">
                <TooltipProvider>
                  {calendarDays.map((dia) => {
                    const periodo = getPeriodoEnFecha(dia);
                    const esHoy = isToday(dia);
                    const esMesActual = isSameMonth(dia, currentDate);
                    const tipoDia = getTipoDia(dia);
                    const esFeriadoHoy = tipoDia.tipo === "feriado";
                    const esDomingo = tipoDia.tipo === "domingo";
                    const esSabado = tipoDia.tipo === "sabado";

                    // Determinar el color de fondo según el tipo de día
                    let bgColor = esMesActual ? "bg-background" : "bg-muted/30";
                    if (esFeriadoHoy) {
                      bgColor = "bg-red-50 dark:bg-red-900/20";
                    } else if (esDomingo) {
                      bgColor = "bg-blue-50 dark:bg-blue-900/20";
                    } else if (esSabado) {
                      bgColor = "bg-indigo-50 dark:bg-indigo-900/20";
                    }

                    // Determinar el color del texto
                    let textColor = esMesActual
                      ? "text-foreground"
                      : "text-muted-foreground";
                    if (esFeriadoHoy) {
                      textColor =
                        "text-red-700 dark:text-red-300 font-semibold";
                    } else if (esDomingo) {
                      textColor =
                        "text-blue-700 dark:text-blue-300 font-medium";
                    } else if (esSabado) {
                      textColor =
                        "text-indigo-700 dark:text-indigo-300 font-medium";
                    }

                    return (
                      <Tooltip key={dia.toISOString()}>
                        <TooltipTrigger asChild>
                          <div
                            className={`
                              relative p-2 min-h-[60px] border rounded-lg transition-colors cursor-pointer
                              ${bgColor}
                              ${esHoy ? "ring-2 ring-primary" : ""}
                              ${periodo ? "border-l-4" : "border-l-0"}
                              ${
                                esFeriadoHoy
                                  ? "border-red-200"
                                  : esSabado
                                  ? "border-indigo-200"
                                  : esDomingo
                                  ? "border-blue-200"
                                  : ""
                              }
                              hover:bg-muted/50
                            `}
                            style={{
                              borderLeftColor: periodo
                                ? periodo.tipo === "BIMESTRE"
                                  ? "#3b82f6"
                                  : periodo.tipo === "TRIMESTRE"
                                  ? "#10b981"
                                  : periodo.tipo === "SEMESTRE"
                                  ? "#8b5cf6"
                                  : "#f59e0b"
                                : "transparent",
                            }}
                          >
                            {/* Número del día */}
                            <div
                              className={`text-sm font-medium ${textColor} flex items-center gap-1`}
                            >
                              {format(dia, "d")}
                              {esFeriadoHoy && (
                                <Star className="h-3 w-3 text-red-500" />
                              )}
                              {(esSabado || esDomingo) && (
                                <Sun className="h-3 w-3 text-amber-500" />
                              )}
                            </div>

                            {/* Indicador de período */}
                            {periodo && (
                              <div className="mt-1">
                                <div
                                  className={`text-xs px-1 py-0.5 rounded text-center ${getColorPeriodo(
                                    periodo.tipo
                                  )}`}
                                >
                                  {periodo.tipo.charAt(0)}
                                  {periodo.numero}
                                </div>
                              </div>
                            )}

                            {/* Indicador de día actual */}
                            {esHoy && (
                              <div className="absolute top-1 right-1">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                              </div>
                            )}

                            {/* Indicador de feriado */}
                            {esFeriadoHoy && (
                              <div className="absolute bottom-1 left-1">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-center">
                            <p className="font-medium">
                              {format(dia, "EEEE, d 'de' MMMM", { locale: es })}
                            </p>
                            {esFeriadoHoy && (
                              <p className="text-red-600 text-sm">
                                🎉 {tipoDia.nombre}
                              </p>
                            )}
                            {esSabado && (
                              <p className="text-indigo-600 text-sm">
                                📅 Sábado
                              </p>
                            )}
                            {esDomingo && (
                              <p className="text-blue-600 text-sm">
                                🏠 Domingo
                              </p>
                            )}
                            {periodo && (
                              <p className="text-sm mt-1">
                                📚 {periodo.nombre}
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral con información */}
        <div className="space-y-4">
          {/* Leyenda */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Leyenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Períodos académicos */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Períodos Académicos
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-xs">Bimestre</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-xs">Trimestre</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span className="text-xs">Semestre</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className="text-xs">Anual</span>
                </div>
              </div>

              {/* Días especiales */}
              <div className="space-y-2 pt-2 border-t">
                <p className="text-xs font-medium text-muted-foreground">
                  Días Especiales
                </p>
                <div className="flex items-center gap-2">
                  <Star className="h-3 w-3 text-red-500" />
                  <span className="text-xs">Feriados</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-3 w-3 text-blue-600" />
                  <span className="text-xs">Domingos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-3 w-3 text-indigo-600" />
                  <span className="text-xs">Sábados</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-xs">Día actual</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Períodos activos en el mes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                Períodos en {format(currentDate, "MMMM", { locale: es })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {estadisticasMes.periodosActivos === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No hay períodos activos este mes
                </p>
              ) : (
                <div className="space-y-3">
                  {Array.from(
                    new Set(
                      monthDays
                        .map((dia) => getPeriodoEnFecha(dia))
                        .filter(Boolean)
                        .map((p) => p.id)
                    )
                  ).map((periodoId) => {
                    const periodo = periodos.find((p) => p.id === periodoId);
                    if (!periodo) return null;

                    return (
                      <div key={periodo.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={getColorPeriodo(periodo.tipo)}
                          >
                            {periodo.tipo} {periodo.numero}
                          </Badge>
                        </div>
                        <p className="text-xs font-medium">{periodo.nombre}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(new Date(periodo.fechaInicio), "dd/MM", {
                              locale: es,
                            })}{" "}
                            -{" "}
                            {format(new Date(periodo.fechaFin), "dd/MM", {
                              locale: es,
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumen estadístico */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Total períodos:</span>
                <span className="font-medium">{periodos.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Períodos activos:</span>
                <span className="font-medium">
                  {periodos.filter((p) => p.activo).length}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Año escolar:</span>
                <span className="font-medium">{currentDate.getFullYear()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
