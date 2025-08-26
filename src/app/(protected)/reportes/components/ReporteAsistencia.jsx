"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useInstitucion } from "@/hooks/use-institucion";
import { FileDown, Printer, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { getNiveles } from "@/action/config/niveles-grados-action";
import { getCursos } from "@/action/config/estructura-academica-action";
import { getEstudiantesPorCurso } from "@/action/notas/nota";

export default function ReporteAsistencia({ userId }) {
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    nivelAcademicoId: "",
    gradoId: "",
    cursoId: "",
    estudianteId: "",
    fechaInicio: null,
    fechaFin: null,
    tipoReporte: "diario"
  });
  
  const { institucion } = useInstitucion();
  const [niveles, setNiveles] = useState([]);
  const [grados, setGrados] = useState([]);
  
  // Cargar niveles y grados al iniciar
  useEffect(() => {
    const fetchNiveles = async () => {
      try {
        if (institucion?.id) {
          const response = await getNiveles(institucion.id);
          setNiveles(response.data || []);
          setGrados(response.data || []);
        }
      } catch (error) {
        console.error("Error al cargar niveles:", error);
        toast.error("No se pudieron cargar los niveles académicos");
      }
    };
    
    fetchNiveles();
  }, [institucion?.id]);
  const [cursos, setCursos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  
  // Cargar cursos cuando cambia el nivel y grado
  const cargarCursos = async (nivelId, gradoId) => {
    if (!nivelId || !gradoId) return;
    
    try {
      setLoading(true);
      
      // Verificamos que institucion exista antes de acceder a su id
      if (!institucion || !institucion.id) {
        toast.error("Información de institución no disponible");
        return;
      }
      
      // Usamos la función getCursos para obtener los cursos filtrados por nivel y grado
      const filters = {};
      
      // Si el nivelId es para un nivel específico, lo agregamos al filtro
      if (nivelId !== "todos") {
        filters.nivelAcademicoId = nivelId;
      }
      
      // Si el gradoId es para un grado específico, lo agregamos al filtro
      if (gradoId !== "todos") {
        filters.gradoId = gradoId;
      }
      
      // Llamamos a la función getCursos con los filtros
      const response = await getCursos(institucion.id, filters);
      
      if (response.success) {
        setCursos(response.data || []);
      } else {
        toast.error(response.error || "Error al cargar los cursos");
      }
    } catch (error) {
      console.error("Error al cargar cursos:", error);
      toast.error("No se pudieron cargar los cursos");
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar estudiantes cuando cambia el curso
  const cargarEstudiantes = async (cursoId) => {
    if (!cursoId) return;
    
    try {
      setLoading(true);
      
      // Usamos la función getEstudiantesPorCurso para obtener los estudiantes del curso seleccionado
      const estudiantes = await getEstudiantesPorCurso(cursoId);
      
      if (estudiantes && Array.isArray(estudiantes)) {
        setEstudiantes(estudiantes);
      } else {
        setEstudiantes([]);
        toast.error("No se encontraron estudiantes para este curso");
      }
    } catch (error) {
      console.error("Error al cargar estudiantes:", error);
      toast.error("No se pudieron cargar los estudiantes");
      setEstudiantes([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar cambio de filtros
  const handleFiltroChange = (key, value) => {
    setFiltros(prev => {
      const newFiltros = { ...prev, [key]: value };
      
      // Si cambia el nivel o grado, cargar cursos correspondientes
      if ((key === "nivelAcademicoId" || key === "gradoId") && 
          newFiltros.nivelAcademicoId && newFiltros.gradoId) {
        cargarCursos(newFiltros.nivelAcademicoId, newFiltros.gradoId);
      }
      
      // Si cambia el curso, cargar estudiantes correspondientes
      if (key === "cursoId" && newFiltros.cursoId) {
        cargarEstudiantes(newFiltros.cursoId);
      }
      
      return newFiltros;
    });
  };
  
  // Generar reporte
  const handleGenerarReporte = async () => {
    setLoading(true);
    try {
      // Aquí se implementaría la lógica para generar el reporte
      // según los filtros seleccionados
      
      // Simulamos una carga
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Reporte de asistencia generado correctamente");
    } catch (error) {
      console.error("Error al generar reporte:", error);
      toast.error("Error al generar el reporte de asistencia");
    } finally {
      setLoading(false);
    }
  };
  
  // Exportar reporte
  const handleExportarReporte = (formato) => {
    toast.success(`Exportando reporte en formato ${formato.toUpperCase()}`);
    // Aquí se implementaría la lógica para exportar el reporte
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reportes de Asistencia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo de Reporte</label>
              <Select 
                value={filtros.tipoReporte} 
                onValueChange={(value) => handleFiltroChange("tipoReporte", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diario">Asistencia diaria</SelectItem>
                  <SelectItem value="semanal">Asistencia semanal</SelectItem>
                  <SelectItem value="mensual">Asistencia mensual</SelectItem>
                  <SelectItem value="porEstudiante">Por estudiante</SelectItem>
                  <SelectItem value="porCurso">Por curso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Nivel Académico</label>
              <Select 
                value={filtros.nivelAcademicoId} 
                onValueChange={(value) => handleFiltroChange("nivelAcademicoId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar nivel" />
                </SelectTrigger>
                <SelectContent>
                  {niveles?.map(nivel => (
                    <SelectItem key={nivel.id} value={nivel.id}>
                      {nivel.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Grado</label>
              <Select 
                value={filtros.gradoId} 
                onValueChange={(value) => handleFiltroChange("gradoId", value)}
                disabled={!filtros.nivelAcademicoId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar grado" />
                </SelectTrigger>
                <SelectContent>
                  {grados?.filter(g => g.nivelAcademicoId === filtros.nivelAcademicoId)
                    .map(grado => (
                      <SelectItem key={grado.id} value={grado.id}>
                        {grado.nombre}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Curso</label>
              <Select 
                value={filtros.cursoId} 
                onValueChange={(value) => handleFiltroChange("cursoId", value)}
                disabled={!filtros.gradoId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar curso" />
                </SelectTrigger>
                <SelectContent>
                  {cursos.map(curso => (
                    <SelectItem key={curso.id} value={curso.id}>
                      {curso.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Estudiante</label>
              <Select 
                value={filtros.estudianteId} 
                onValueChange={(value) => handleFiltroChange("estudianteId", value)}
                disabled={!filtros.cursoId || filtros.tipoReporte !== "porEstudiante"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estudiante" />
                </SelectTrigger>
                <SelectContent>
                  {estudiantes.map(estudiante => (
                    <SelectItem key={estudiante.id} value={estudiante.id}>
                      {estudiante.nombre} {estudiante.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Fecha Inicio</label>
              <DatePicker
                date={filtros.fechaInicio}
                setDate={(date) => handleFiltroChange("fechaInicio", date)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Fecha Fin</label>
              <DatePicker
                date={filtros.fechaFin}
                setDate={(date) => handleFiltroChange("fechaFin", date)}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button 
              onClick={handleGenerarReporte} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <ClipboardList className="h-4 w-4" />
              {loading ? "Generando..." : "Generar Reporte"}
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleExportarReporte("pdf")}
                className="flex items-center gap-2"
              >
                <FileDown className="h-4 w-4" />
                Exportar PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExportarReporte("excel")}
                className="flex items-center gap-2"
              >
                <FileDown className="h-4 w-4" />
                Exportar Excel
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExportarReporte("print")}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Vista Previa del Reporte de Asistencia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[400px] flex items-center justify-center border rounded-md p-6">
            {loading ? (
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-2">Generando reporte de asistencia...</p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p>Seleccione los filtros y haga clic en "Generar Reporte" para visualizar los datos de asistencia</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
