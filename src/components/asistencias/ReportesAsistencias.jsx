"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useInstitucionContext } from "@/providers/institucion-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Calendar,
  Users,
  BookOpen,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileSpreadsheet
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { obtenerEstadisticasAsistencia } from "@/action/asistencias/asistencia-actions";
import { getCursos } from "@/action/cursos/curso";
import { exportData, prepareEstadisticasForExport } from "@/utils/exportData";

const ESTADOS_ASISTENCIA = [
  { value: "presente", label: "Presente", color: "bg-green-500", textColor: "text-green-700" },
  { value: "ausente", label: "Ausente", color: "bg-red-500", textColor: "text-red-700" },
  { value: "tardanza", label: "Tardanza", color: "bg-yellow-500", textColor: "text-yellow-700" },
  { value: "justificado", label: "Justificado", color: "bg-blue-500", textColor: "text-blue-700" }
];

export default function ReportesAsistencias() {
  const { data: session } = useSession();
  const { institucion } = useInstitucionContext();

  const [estadisticas, setEstadisticas] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tipoReporte, setTipoReporte] = useState("general");

  // Filtros para reportes
  const [filtros, setFiltros] = useState({
    cursoId: "",
    fechaInicio: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    fechaFin: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    periodo: "mes_actual",
  });

  // Cargar cursos
  useEffect(() => {
    const cargarCursos = async () => {
      if (!institucion?.id) return;

      try {
        const resultado = await getCursos({ institucionId: institucion.id });
        if (resultado.success) {
          setCursos(resultado.data);
        }
      } catch (error) {
        console.error("Error al cargar cursos:", error);
        toast.error("Error al cargar los cursos");
      }
    };

    cargarCursos();
  }, [institucion?.id]);

  // Cargar estadísticas
  const cargarEstadisticas = async () => {
    if (!institucion?.id) return;

    setLoading(true);
    try {
      const filtrosLimpios = Object.fromEntries(
        Object.entries(filtros).filter(([_, value]) => value !== "")
      );

      const resultado = await obtenerEstadisticasAsistencia({
        ...filtrosLimpios,
        institucionId: institucion.id,
      });

      if (resultado.success) {
        setEstadisticas(resultado.data);
      } else {
        toast.error(resultado.error || "Error al cargar estadísticas");
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      toast.error("Error al cargar las estadísticas");
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    cargarEstadisticas();
  }, [institucion?.id]);

  const actualizarFiltro = (campo, valor) => {
    setFiltros(prev => {
      const nuevos = { ...prev, [campo]: valor };

      // Actualizar fechas según el período seleccionado
      if (campo === "periodo") {
        const hoy = new Date();
        switch (valor) {
          case "mes_actual":
            nuevos.fechaInicio = format(startOfMonth(hoy), "yyyy-MM-dd");
            nuevos.fechaFin = format(endOfMonth(hoy), "yyyy-MM-dd");
            break;
          case "mes_anterior":
            const mesAnterior = subMonths(hoy, 1);
            nuevos.fechaInicio = format(startOfMonth(mesAnterior), "yyyy-MM-dd");
            nuevos.fechaFin = format(endOfMonth(mesAnterior), "yyyy-MM-dd");
            break;
          case "personalizado":
            // Mantener las fechas actuales
            break;
        }
      }

      return nuevos;
    });
  };

  const generarReporte = () => {
    cargarEstadisticas();
  };

  const handleExportarReporte = (formato = 'csv') => {
    if (!estadisticas) {
      toast.error("No hay datos para exportar");
      return;
    }

    try {
      // Exportar estadísticas generales
      const { dataGenerales, headersGenerales } = prepareEstadisticasForExport(estadisticas);
      const resultadoGenerales = exportData(
        dataGenerales,
        `estadisticas-generales-${format(new Date(), 'yyyy-MM-dd')}`,
        headersGenerales,
        formato
      );

      // Pequeño retraso para evitar conflictos en la descarga
      setTimeout(() => {
        // Exportar estadísticas por curso
        const { dataCursos, headersCursos } = prepareEstadisticasForExport(estadisticas);
        const resultadoCursos = exportData(
          dataCursos,
          `estadisticas-por-curso-${format(new Date(), 'yyyy-MM-dd')}`,
          headersCursos,
          formato
        );

        if (resultadoGenerales && resultadoCursos) {
          toast.success(`Reportes exportados correctamente en formato ${formato.toUpperCase()}`);
        } else {
          toast.error(`Error al exportar algunos reportes en formato ${formato.toUpperCase()}`);
        }
      }, 1000);
    } catch (error) {
      console.error("Error al exportar reportes:", error);
      toast.error("Error al exportar los reportes");
    }
  };

  const calcularPorcentaje = (valor, total) => {
    return total > 0 ? Math.round((valor / total) * 100) : 0;
  };

  const obtenerTendencia = (actual, anterior) => {
    if (!anterior || anterior === 0) return null;
    const cambio = ((actual - anterior) / anterior) * 100;
    return {
      valor: Math.abs(cambio).toFixed(1),
      tipo: cambio > 0 ? "aumento" : "disminucion",
      icono: cambio > 0 ? TrendingUp : TrendingDown,
      color: cambio > 0 ? "text-green-600" : "text-red-600",
    };
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Configuración de Reportes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipoReporte">Tipo de Reporte</Label>
              <Select value={tipoReporte} onValueChange={setTipoReporte}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Reporte General</SelectItem>
                  <SelectItem value="por_curso">Por Curso</SelectItem>
                  <SelectItem value="comparativo">Comparativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodo">Período</Label>
              <Select value={filtros.periodo} onValueChange={(value) => actualizarFiltro("periodo", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mes_actual">Mes Actual</SelectItem>
                  <SelectItem value="mes_anterior">Mes Anterior</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filtros.periodo === "personalizado" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={filtros.fechaInicio}
                    onChange={(e) => actualizarFiltro("fechaInicio", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaFin">Fecha Fin</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={filtros.fechaFin}
                    onChange={(e) => actualizarFiltro("fechaFin", e.target.value)}
                  />
                </div>
              </>
            )}

            {tipoReporte === "por_curso" && (
              <div className="space-y-2">
                <Label htmlFor="curso">Curso</Label>
                <Select value={filtros.cursoId} onValueChange={(value) => actualizarFiltro("cursoId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar curso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sn">Todos los cursos</SelectItem>
                    {cursos.map((curso) => (
                      <SelectItem key={curso.id} value={curso.id}>
                        {curso.nombre} - {curso.codigo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Button onClick={generarReporte} className="flex items-center gap-2" disabled={loading}>
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="h-4 w-4" />
              )}
              Generar Reporte
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleExportarReporte('csv')}
                disabled={!estadisticas}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExportarReporte('excel')}
                disabled={!estadisticas}
                className="flex items-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Generales */}
      {estadisticas && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Registros</p>
                    <p className="text-2xl font-bold">{estadisticas.totalRegistros}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Presentes</p>
                    <p className="text-2xl font-bold text-green-600">{estadisticas.presentes}</p>
                    <p className="text-xs text-muted-foreground">
                      {calcularPorcentaje(estadisticas.presentes, estadisticas.totalRegistros)}%
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">P</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ausentes</p>
                    <p className="text-2xl font-bold text-red-600">{estadisticas.ausentes}</p>
                    <p className="text-xs text-muted-foreground">
                      {calcularPorcentaje(estadisticas.ausentes, estadisticas.totalRegistros)}%
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">A</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tardanzas</p>
                    <p className="text-2xl font-bold text-yellow-600">{estadisticas.tardanzas}</p>
                    <p className="text-xs text-muted-foreground">
                      {calcularPorcentaje(estadisticas.tardanzas, estadisticas.totalRegistros)}%
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">T</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Asistencia por Estado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Distribución de Asistencias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ESTADOS_ASISTENCIA.map((estado) => {
                  const valor = estadisticas[estado.value] || 0;
                  const porcentaje = calcularPorcentaje(valor, estadisticas.totalRegistros);

                  return (
                    <div key={estado.value} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${estado.color}`}></div>
                          <span className="font-medium">{estado.label}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{valor}</span>
                          <span className="text-sm text-muted-foreground ml-2">({porcentaje}%)</span>
                        </div>
                      </div>
                      <Progress value={porcentaje} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas por Curso */}
          {estadisticas.porCurso && estadisticas.porCurso.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Asistencias por Curso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {estadisticas.porCurso.map((curso) => {
                    const totalCurso = curso.presente + curso.ausente + curso.tardanza + curso.justificado;
                    const porcentajeAsistencia = calcularPorcentaje(curso.presente + curso.justificado, totalCurso);

                    return (
                      <div key={curso.cursoId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{curso.curso.nombre}</h4>
                            <p className="text-sm text-muted-foreground">
                              Código: {curso.curso.codigo}
                            </p>
                          </div>
                          <Badge variant={porcentajeAsistencia >= 90 ? "default" : porcentajeAsistencia >= 75 ? "secondary" : "destructive"}>
                            {porcentajeAsistencia}% Asistencia
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{curso.presente}</div>
                            <div className="text-muted-foreground">Presentes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-red-600">{curso.ausente}</div>
                            <div className="text-muted-foreground">Ausentes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-yellow-600">{curso.tardanza}</div>
                            <div className="text-muted-foreground">Tardanzas</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{curso.justificado}</div>
                            <div className="text-muted-foreground">Justificados</div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <Progress value={porcentajeAsistencia} className="h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alertas y Recomendaciones */}
          {estadisticas.totalRegistros > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alertas y Recomendaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {calcularPorcentaje(estadisticas.ausentes, estadisticas.totalRegistros) > 20 && (
                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">Alto índice de ausencias</p>
                        <p className="text-sm text-red-700">
                          El {calcularPorcentaje(estadisticas.ausentes, estadisticas.totalRegistros)}% de ausencias supera el límite recomendado del 20%.
                        </p>
                      </div>
                    </div>
                  )}

                  {calcularPorcentaje(estadisticas.tardanzas, estadisticas.totalRegistros) > 15 && (
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800">Muchas tardanzas</p>
                        <p className="text-sm text-yellow-700">
                          El {calcularPorcentaje(estadisticas.tardanzas, estadisticas.totalRegistros)}% de tardanzas indica problemas de puntualidad.
                        </p>
                      </div>
                    </div>
                  )}

                  {calcularPorcentaje(estadisticas.presentes + estadisticas.justificado, estadisticas.totalRegistros) >= 95 && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-800">Excelente asistencia</p>
                        <p className="text-sm text-green-700">
                          El {calcularPorcentaje(estadisticas.presentes + estadisticas.justificado, estadisticas.totalRegistros)}% de asistencia efectiva es excelente.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Generando reporte...</span>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
