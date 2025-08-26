"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Search,
  Filter,
  X,
  Download,
  RefreshCw,
  Users,
  BookOpen,
  Calendar as CalendarDays,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/utils/utils";
import { useAsistenciaFilters } from "@/hooks/use-asistencia-filters";

export default function AsistenciasClient() {
  const {
    // Estado actual
    filters,
    currentTab,
    currentEstudiante,
    currentCurso,
    currentEstado,
    currentFechaInicio,
    currentFechaFin,
    currentPage,
    currentPageSize,

    // Setters
    setTab,
    setEstudiante,
    setCurso,
    setEstado,
    setFechaInicio,
    setFechaFin,
    setPage,

    // Utilidades
    resetFilters,
    hasActiveFilters,
    activeFiltersCount,
  } = useAsistenciaFilters();

  // Estados locales para datos
  const [estudiantes, setEstudiantes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(false);

  // Simular carga de datos basada en filtros
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Simular llamada a API con los filtros actuales
      console.log("Cargando datos con filtros:", filters);

      // Aquí harías la llamada real a tu API
      // const response = await fetch(`/api/asistencias?${new URLSearchParams(filters)}`);
      // const data = await response.json();

      // Simulación
      setTimeout(() => {
        setAsistencias([
          {
            id: 1,
            estudiante: "Liam Gael Sebastian Espinola",
            curso: "Matemática",
            fecha: "2025-01-08",
            estado: "presente",
          },
          // ... más datos
        ]);
        setLoading(false);
      }, 1000);
    };

    loadData();
  }, [filters]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Asistencias</h1>
          <p className="text-muted-foreground">
            Sistema integral para el registro y seguimiento de asistencias
            estudiantiles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs principales con estado persistente */}
      <Tabs value={currentTab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tomar" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Tomar Asistencia
          </TabsTrigger>
          <TabsTrigger value="consultar" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Consultar
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reportes" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Reportes
          </TabsTrigger>
        </TabsList>

        {/* Tab: Tomar Asistencia */}
        <TabsContent value="tomar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tomar Asistencia</CardTitle>
              <CardDescription>
                Registra la asistencia de los estudiantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Contenido para tomar asistencia...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Consultar Asistencias */}
        <TabsContent value="consultar" className="space-y-6">
          {/* Filtros de búsqueda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros de Búsqueda
                {hasActiveFilters && (
                  <Badge variant="secondary">
                    {activeFiltersCount} filtro(s) activo(s)
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Busca y filtra registros de asistencia por diferentes criterios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filtro por estudiante */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estudiante</label>
                  <Select
                    value={currentEstudiante}
                    onValueChange={setEstudiante}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estudiantes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estudiantes</SelectItem>
                      <SelectItem value="estudiante1">
                        Liam Gael Sebastian Espinola
                      </SelectItem>
                      <SelectItem value="estudiante2">
                        Andrea Vargas Casanova
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por curso */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Curso</label>
                  <Select value={currentCurso} onValueChange={setCurso}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los cursos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los cursos</SelectItem>
                      <SelectItem value="matematica">Matemática</SelectItem>
                      <SelectItem value="comunicacion">Comunicación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por estado */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado</label>
                  <Select value={currentEstado} onValueChange={setEstado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los estados</SelectItem>
                      <SelectItem value="presente">Presente</SelectItem>
                      <SelectItem value="ausente">Ausente</SelectItem>
                      <SelectItem value="tardanza">Tardanza</SelectItem>
                      <SelectItem value="justificada">Justificada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fecha inicio */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha Inicio</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !currentFechaInicio && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {currentFechaInicio ? (
                          format(new Date(currentFechaInicio), "PPP", {
                            locale: es,
                          })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          currentFechaInicio
                            ? new Date(currentFechaInicio)
                            : undefined
                        }
                        onSelect={(date) =>
                          setFechaInicio(date ? format(date, "yyyy-MM-dd") : "")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar Filtros
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resultados */}
          <Card>
            <CardHeader>
              <CardTitle>Registros de Asistencia</CardTitle>
              <CardDescription>
                {loading
                  ? "Cargando..."
                  : `${asistencias.length} registros encontrados`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  Cargando registros...
                </div>
              ) : (
                <div className="space-y-4">
                  {asistencias.map((asistencia) => (
                    <div
                      key={asistencia.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{asistencia.estudiante}</p>
                        <p className="text-sm text-muted-foreground">
                          {asistencia.curso} •{" "}
                          {format(new Date(asistencia.fecha), "PPP", {
                            locale: es,
                          })}
                        </p>
                      </div>
                      <Badge
                        variant={
                          asistencia.estado === "presente"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {asistencia.estado}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Reportes */}
        <TabsContent value="reportes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reportes</CardTitle>
              <CardDescription>Genera reportes de asistencia</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Contenido para reportes...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
