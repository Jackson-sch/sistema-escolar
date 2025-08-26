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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Search, Filter, Download, RefreshCw, Calendar, User, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { obtenerAsistencias } from "@/action/asistencias/asistencia-actions";
import { getCursos } from "@/action/cursos/curso";
import { getStudents as getEstudiantes } from "@/action/estudiante/estudiante";
import { exportData, prepareAsistenciasForExport } from "@/utils/exportData";

const ESTADOS_ASISTENCIA = [
  { value: "presente", label: "Presente", color: "bg-green-500", textColor: "text-green-700" },
  { value: "ausente", label: "Ausente", color: "bg-red-500", textColor: "text-red-700" },
  { value: "tardanza", label: "Tardanza", color: "bg-yellow-500", textColor: "text-yellow-700" },
  { value: "justificado", label: "Justificado", color: "bg-blue-500", textColor: "text-blue-700" },
];

export default function ConsultarAsistencias() {
  const { data: session } = useSession();
  const { institucion } = useInstitucionContext();

  const [asistencias, setAsistencias] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  console.log("Consultar Asistencias", asistencias)

  // Filtros
  const [filtros, setFiltros] = useState({
    estudianteId: "",
    cursoId: "",
    estado: "",
    fechaInicio: "",
    fechaFin: "",
  });

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      if (!institucion?.id) return;

      try {
        const [cursosResult, estudiantesResult] = await Promise.all([
          getCursos({ institucionId: institucion.id }),
          getEstudiantes({ institucionId: institucion.id }),
        ]);

        if (cursosResult.success) {
          setCursos(cursosResult.data);
        }

        if (estudiantesResult.success) {
          setEstudiantes(estudiantesResult.data);
        }
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        toast.error("Error al cargar los datos");
      }
    };

    cargarDatosIniciales();
  }, [institucion?.id]);

  // Cargar asistencias
  const cargarAsistencias = async (page = 1) => {
    if (!institucion?.id) return;

    setLoading(true);
    try {
      const filtrosLimpios = Object.fromEntries(
        Object.entries(filtros).filter(([_, value]) => value !== "")
      );

      const resultado = await obtenerAsistencias({
        ...filtrosLimpios,
        institucionId: institucion.id,
        page,
        limit: pagination.limit,
      });

      if (resultado.success) {
        setAsistencias(resultado.data.asistencias);
        setPagination(resultado.data.pagination);
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

  // Cargar asistencias al montar el componente
  useEffect(() => {
    cargarAsistencias();
  }, [institucion?.id]);

  const actualizarFiltro = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const aplicarFiltros = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    cargarAsistencias(1);
  };

  const limpiarFiltros = () => {
    setFiltros({
      estudianteId: "",
      cursoId: "",
      estado: "",
      fechaInicio: "",
      fechaFin: "",
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    setTimeout(() => cargarAsistencias(1), 100);
  };

  const cambiarPagina = (nuevaPagina) => {
    setPagination(prev => ({ ...prev, page: nuevaPagina }));
    cargarAsistencias(nuevaPagina);
  };

  const obtenerEstadoBadge = (estado) => {
    const estadoInfo = ESTADOS_ASISTENCIA.find(e => e.value === estado);
    return estadoInfo || { label: estado, color: "bg-gray-500", textColor: "text-gray-700" };
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
        `asistencias-${format(new Date(), 'yyyy-MM-dd')}`,
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

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estudiante">Estudiante</Label>
              <Select value={filtros.estudianteId || "todos"} onValueChange={(value) => actualizarFiltro("estudianteId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estudiantes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estudiantes</SelectItem>
                  {estudiantes.map((estudiante) => (
                    <SelectItem key={estudiante.id} value={estudiante.id}>
                      {estudiante.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="curso">Curso</Label>
              <Select value={filtros.cursoId || "todos"} onValueChange={(value) => actualizarFiltro("cursoId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los cursos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los cursos</SelectItem>
                  {cursos.map((curso) => (
                    <SelectItem key={curso.id} value={curso.id}>
                      {curso.nombre} - {curso.codigo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Button onClick={aplicarFiltros} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buscar
            </Button>
            <Button variant="outline" onClick={limpiarFiltros}>
              Limpiar Filtros
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExportarDatos('csv')} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                CSV
              </Button>
              <Button variant="outline" onClick={() => handleExportarDatos('excel')} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Registros de Asistencia
            </div>
            <Badge variant="outline">
              {pagination.total} registros encontrados
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Cargando asistencias...</span>
            </div>
          ) : asistencias.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No se encontraron registros</h3>
              <p className="text-muted-foreground">
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {asistencias.map((asistencia) => {
                const estadoInfo = obtenerEstadoBadge(asistencia.estado);
                return (
                  <div key={asistencia.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={asistencia.estudiante.image} />
                          <AvatarFallback>
                            {asistencia.estudiante?.name?.charAt(0) || asistencia.estudiante?.apellidoPaterno?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {asistencia.estudiante?.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Código: {asistencia.estudiante.codigoEstudiante}
                          </div>
                          {asistencia.estudiante.nivelAcademico && (
                            <div className="text-sm text-muted-foreground">
                              {asistencia.estudiante.nivelAcademico.nivel?.nombre || 'Sin nivel'} - {asistencia.estudiante.nivelAcademico.grado?.nombre || 'Sin grado'} "{asistencia.estudiante.nivelAcademico.seccion || '-'}"
                            </div>
                          )}
                        </div>
                      </div>

                      <Badge className={`${estadoInfo.color} text-white`}>
                        {estadoInfo.label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Curso:</span>
                        <span>{asistencia.curso?.nombre}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Fecha:</span>
                        <span>{format(new Date(asistencia.fecha), "dd/MM/yyyy", { locale: es })}</span>
                      </div>

                      {asistencia.registradoPor && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Registrado por:</span>
                          <span>
                            {(() => {
                              // Verificar si registradoPor existe
                              if (!asistencia.registradoPor) return 'No registrado';
                              
                              // Si es un string, mostrarlo directamente
                              if (typeof asistencia.registradoPor === 'string') return asistencia.registradoPor;
                              
                              // Si es un objeto, mostrar el nombre completo formateado
                              if (typeof asistencia.registradoPor === 'object') {
                                const { apellidoPaterno, apellidoMaterno, name } = asistencia.registradoPor;
                                
                                // Construir nombre completo
                                let nombreCompleto = '';
                                
                                // Agregar apellidos si existen
                                if (apellidoPaterno || apellidoMaterno) {
                                  nombreCompleto = `${apellidoPaterno || ''} ${apellidoMaterno || ''}`.trim();
                                  // Agregar coma si hay nombre
                                  if (name) nombreCompleto += ', ';
                                }
                                
                                // Agregar nombre o texto por defecto
                                nombreCompleto += name || 'Usuario';
                                
                                return nombreCompleto;
                              }
                              
                              // Si llegamos aquí, es un tipo de dato inesperado
                              return 'Usuario';
                            })()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Información adicional para tardanzas */}
                    {asistencia.estado === "tardanza" && asistencia.horaLlegada && (
                      <div className="mt-3 p-2 bg-yellow-50 rounded-md">
                        <div className="text-sm text-yellow-700">
                          <span className="font-medium">Hora de llegada:</span> {asistencia.horaLlegada}
                        </div>
                      </div>
                    )}

                    {/* Observaciones */}
                    {asistencia.observaciones && (
                      <div className="mt-3 p-2 bg-gray-50 rounded-md">
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">Observaciones:</span> {asistencia.observaciones}
                        </div>
                      </div>
                    )}

                    {/* Justificación */}
                    {asistencia.justificacion && (
                      <div className="mt-3 p-2 bg-blue-50 rounded-md">
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

                {/* Números de página */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, pagination.page - 2) + i;
                  if (pageNum > pagination.totalPages) return null;

                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.page ? "default" : "outline"}
                      size="sm"
                      onClick={() => cambiarPagina(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

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
