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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Search,
  Calendar,
  User,
  BookOpen,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  FileSpreadsheet
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { obtenerAsistencias, obtenerEstadisticasAsistencias } from "@/action/asistencias/asistencia-actions";
import { getHijosDePadre } from "@/action/relacion-familiar/relacion-familiar";
import { exportData, prepareAsistenciasForExport } from "@/utils/exportData";

const ESTADOS_ASISTENCIA = [
  {
    value: "presente",
    label: "Presente",
    color: "bg-green-500",
    textColor: "text-green-700",
    icon: CheckCircle,
    bgLight: "bg-green-50 text-green-600"
  },
  {
    value: "ausente",
    label: "Ausente",
    color: "bg-red-500",
    textColor: "text-red-700",
    icon: XCircle,
    bgLight: "bg-red-50 text-red-600"
  },
  {
    value: "tardanza",
    label: "Tardanza",
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    icon: Clock,
    bgLight: "bg-yellow-50 text-yellow-600"
  },
  {
    value: "justificado",
    label: "Justificado",
    color: "bg-blue-500",
    textColor: "text-blue-700",
    icon: AlertCircle,
    bgLight: "bg-blue-50 text-blue-600"
  },
];

export default function AsistenciasHijos() {
  const { data: session } = useSession();
  const { institucion } = useInstitucionContext();

  const [asistencias, setAsistencias] = useState([]);
  const [hijos, setHijos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [estadisticas, setEstadisticas] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Filtros
  const [filtros, setFiltros] = useState({
    hijoId: "",
    estado: "",
    fechaInicio: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    fechaFin: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    periodo: "mes_actual",
  });

  // Cargar los hijos del padre desde la base de datos

  // Cargar hijos del padre
  useEffect(() => {
    const cargarHijos = async () => {
      if (!session?.user?.id || !institucion?.id) return;

      try {
        setLoading(true);
        // Obtener los hijos del padre desde la base de datos
        const resultado = await getHijosDePadre({
          padreId: session.user.id,
          institucionId: institucion.id
        });

        if (resultado.success && resultado.data.length > 0) {
          setHijos(resultado.data);

          // Si solo hay un hijo, seleccionarlo automáticamente
          if (resultado.data.length === 1) {
            setFiltros(prev => ({ ...prev, hijoId: resultado.data[0].id }));
          }
        } else if (resultado.success && resultado.data.length === 0) {
          toast.info("No se encontraron hijos registrados para este usuario");
        } else {
          toast.error(resultado.error || "Error al cargar los hijos");
        }
      } catch (error) {
        console.error("Error al cargar hijos:", error);
        toast.error("Error al cargar la información de los hijos");
      } finally {
        setLoading(false);
      }
    };

    cargarHijos();
  }, [session?.user?.id, institucion?.id]);

  // Cargar asistencias
  const cargarAsistencias = async (page = 1) => {
    if (!institucion?.id || !filtros.hijoId) return;

    setLoading(true);
    try {
      const filtrosLimpios = Object.fromEntries(
        Object.entries(filtros).filter(([key, value]) => value !== "" && key !== "periodo")
      );

      const resultado = await obtenerAsistencias({
        ...filtrosLimpios,
        estudianteId: filtros.hijoId,
        institucionId: institucion.id,
        page,
        limit: pagination.limit,
      });

      if (resultado.success) {
        setAsistencias(resultado.data.asistencias);
        setPagination(resultado.data.pagination);

        // Calcular estadísticas
        calcularEstadisticas(resultado.data.asistencias);
      } else {
        toast.error(resultado.error || "Error al cargar asistencias");
      }
    } catch (error) {
      console.error("Error al cargar asistencias:", error);
      toast.error("Error al cargar las asistencias");
    } finally {
      setLoading(false);
    }
  };

  const handleExportarDatos = (formato = 'csv') => {
    if (!asistencias || asistencias.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    try {
      const { data, headers } = prepareAsistenciasForExport(asistencias);

      const resultado = exportData(
        data,
        `asistencias-${hijoSeleccionado?.name || 'hijo'}-${format(new Date(), 'yyyy-MM-dd')}`,
        headers,
        formato
      );

      if (resultado) {
        toast.success(`Datos exportados correctamente en formato ${formato.toUpperCase()}`);
      } else {
        toast.error(`Error al exportar en formato ${formato.toUpperCase()}`);
      }
    } catch (error) {
      console.error("Error al exportar datos:", error);
      toast.error("Error al exportar los datos");
    }
  };

  // Calcular estadísticas
  const calcularEstadisticas = (asistenciasData) => {
    const stats = {
      total: asistenciasData.length,
      presente: 0,
      ausente: 0,
      tardanza: 0,
      justificado: 0,
    };

    asistenciasData.forEach(asistencia => {
      stats[asistencia.estado]++;
    });

    stats.porcentajeAsistencia = stats.total > 0
      ? Math.round(((stats.presente + stats.justificado) / stats.total) * 100)
      : 0;

    setEstadisticas(stats);
  };

  // Cargar asistencias cuando cambian los filtros
  useEffect(() => {
    if (filtros.hijoId) {
      cargarAsistencias();
    }
  }, [filtros.hijoId, filtros.fechaInicio, filtros.fechaFin, institucion?.id]);

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

  const aplicarFiltros = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    cargarAsistencias(1);
  };

  const cambiarPagina = (nuevaPagina) => {
    setPagination(prev => ({ ...prev, page: nuevaPagina }));
    cargarAsistencias(nuevaPagina);
  };

  const obtenerEstadoInfo = (estado) => {
    return ESTADOS_ASISTENCIA.find(e => e.value === estado) || ESTADOS_ASISTENCIA[0];
  };

  const calcularPorcentaje = (valor, total) => {
    return total > 0 ? Math.round((valor / total) * 100) : 0;
  };

  const hijoSeleccionado = hijos.find(hijo => hijo.id === filtros.hijoId);

  return (
    <div className="space-y-6">
      {/* Información del hijo seleccionado */}
      {hijoSeleccionado && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={hijoSeleccionado.image} />
                <AvatarFallback className="text-lg">
                  {hijoSeleccionado.name?.charAt(0) || hijoSeleccionado.apellidoPaterno?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{hijoSeleccionado.name}
                </h2>
                <p className="text-muted-foreground">
                  Código: {hijoSeleccionado.codigoEstudiante}
                </p>
                {hijoSeleccionado.nivelAcademico && (
                  <p className="text-sm text-muted-foreground">
                    {hijoSeleccionado.nivelAcademico.nivel?.nombre || 'Sin nivel'} - {hijoSeleccionado.nivelAcademico.grado?.nombre || 'Sin grado'} "{hijoSeleccionado.nivelAcademico.seccion || '-'}"
                  </p>
                )}
              </div>
              {estadisticas && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {estadisticas.porcentajeAsistencia}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Asistencia
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros de Consulta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {hijos.length > 1 && (
              <div className="space-y-2">
                <Label htmlFor="hijo">Hijo/a</Label>
                <Select value={filtros.hijoId} onValueChange={(value) => actualizarFiltro("hijoId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar hijo/a" />
                  </SelectTrigger>
                  <SelectContent>
                    {hijos.map((hijo) => (
                      <SelectItem key={hijo.id} value={hijo.id}>
                        {hijo.apellidoPaterno} {hijo.apellidoMaterno}, {hijo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={filtros.estado || "todos"} onValueChange={(value) => actualizarFiltro("estado", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  {ESTADOS_ASISTENCIA.map((estado) => (
                    <SelectItem key={estado.value} value={estado.value}>
                      {estado.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Button onClick={aplicarFiltros} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Consultar
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExportarDatos('csv')} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                CSV
              </Button>
              <Button variant="outline" onClick={() => handleExportarDatos('excel')} className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ESTADOS_ASISTENCIA.map((estado) => {
            const valor = estadisticas[estado.value] || 0;
            const porcentaje = calcularPorcentaje(valor, estadisticas.total);
            const IconComponent = estado.icon;

            return (
              <Card key={estado.value}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{estado.label}</p>
                      <p className="text-2xl font-bold">{valor}</p>
                      <p className="text-xs text-muted-foreground">{porcentaje}%</p>
                    </div>
                    <div className={`h-8 w-8 ${estado.color} rounded-full flex items-center justify-center`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Progreso de Asistencia */}
      {estadisticas && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progreso de Asistencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Asistencia Efectiva</span>
                <span className="font-bold text-lg">{estadisticas.porcentajeAsistencia}%</span>
              </div>
              <Progress value={estadisticas.porcentajeAsistencia} className="h-3" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Días asistidos: {estadisticas.presente + estadisticas.justificado}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Días perdidos: {estadisticas.ausente + estadisticas.tardanza}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Asistencias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Registro de Asistencias
            </div>
            <Badge variant="outline">
              {pagination.total} registros
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Cargando asistencias...</span>
            </div>
          ) : !filtros.hijoId ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Selecciona un hijo/a</h3>
              <p className="text-muted-foreground">
                Selecciona un hijo/a para ver su registro de asistencias
              </p>
            </div>
          ) : asistencias.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No hay registros</h3>
              <p className="text-muted-foreground">
                No se encontraron registros de asistencia para el período seleccionado
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {asistencias.map((asistencia) => {
                const estadoInfo = obtenerEstadoInfo(asistencia.estado);
                const IconComponent = estadoInfo.icon;

                return (
                  <div key={asistencia.id} className={`border rounded-lg p-4 ${estadoInfo.bgLight}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 ${estadoInfo.color} rounded-full flex items-center justify-center`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">{asistencia.curso.nombre}</div>
                          <div className="text-sm text-muted">
                            {format(new Date(asistencia.fecha), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}
                          </div>
                        </div>
                      </div>

                      <Badge className={`${estadoInfo.color} text-white`}>
                        {estadoInfo.label}
                      </Badge>
                    </div>

                    {/* Información adicional */}
                    {asistencia.estado === "tardanza" && asistencia.horaLlegada && (
                      <div className="mt-3 p-2 bg-yellow-100 rounded-md">
                        <div className="text-sm text-yellow-700">
                          <Clock className="h-4 w-4 inline mr-1" />
                          <span className="font-medium">Llegó a las:</span> {asistencia.horaLlegada}
                        </div>
                      </div>
                    )}

                    {asistencia.observaciones && (
                      <div className="mt-3 p-2 bg-gray-100 rounded-md">
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">Observaciones:</span> {asistencia.observaciones}
                        </div>
                      </div>
                    )}

                    {asistencia.justificacion && (
                      <div className="mt-3 p-2 bg-blue-100 rounded-md">
                        <div className="text-sm text-blue-700">
                          <span className="font-medium">Justificación:</span> {asistencia.justificacion}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Página {pagination.page} de {pagination.totalPages}
                ({pagination.total} registros total)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cambiarPagina(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Anterior
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cambiarPagina(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
