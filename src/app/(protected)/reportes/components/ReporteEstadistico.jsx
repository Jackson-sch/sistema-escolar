"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { FileDown, Printer, BarChart2, PieChart } from "lucide-react";
import { toast } from "sonner";
import { useInstitucion } from "@/hooks/use-institucion";
import { getNiveles } from "@/action/config/niveles-grados-action";
import { getPeriodos } from "@/action/config/periodo-action";

export default function ReporteEstadistico({ userId }) {
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    tipoReporte: "rendimiento",
    nivelAcademicoId: "",
    gradoId: "",
    periodoId: "",
    fechaInicio: null,
    fechaFin: null,
    tipoGrafico: "barras"
  });
  
  const { institucion } = useInstitucion();
  const [niveles, setNiveles] = useState([]);
  const [grados, setGrados] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  
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
    cargarPeriodos();
  }, [institucion?.id]);
  
  // Cargar periodos académicos
  const cargarPeriodos = async () => {
    try {
      if (institucion?.id) {
        setLoading(true);
        const response = await getPeriodos(institucion.id);
        setPeriodos(response.data || []);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error al cargar periodos:", error);
      toast.error("No se pudieron cargar los periodos académicos");
      setLoading(false);
    }
  };
  
  // Manejar cambio de filtros
  const handleFiltroChange = (key, value) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Generar reporte
  const handleGenerarReporte = async () => {
    setLoading(true);
    try {
      // Aquí se implementaría la lógica para generar el reporte
      // según los filtros seleccionados
      
      // Simulamos una carga
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Reporte estadístico generado correctamente");
    } catch (error) {
      console.error("Error al generar reporte:", error);
      toast.error("Error al generar el reporte estadístico");
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
          <CardTitle>Reportes Estadísticos</CardTitle>
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
                  <SelectItem value="rendimiento">Rendimiento académico</SelectItem>
                  <SelectItem value="asistencia">Estadísticas de asistencia</SelectItem>
                  <SelectItem value="demografico">Datos demográficos</SelectItem>
                  <SelectItem value="comparativo">Análisis comparativo</SelectItem>
                  <SelectItem value="tendencias">Tendencias académicas</SelectItem>
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
                  <SelectItem value="todos">Todos los niveles</SelectItem>
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
                disabled={!filtros.nivelAcademicoId || filtros.nivelAcademicoId === "todos"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar grado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los grados</SelectItem>
                  {grados?.filter(g => filtros.nivelAcademicoId === "todos" || g.nivelAcademicoId === filtros.nivelAcademicoId)
                    .map(grado => (
                      <SelectItem key={grado.id} value={grado.id}>
                        {grado.nombre}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Periodo Académico</label>
              <Select 
                value={filtros.periodoId} 
                onValueChange={(value) => handleFiltroChange("periodoId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar periodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los periodos</SelectItem>
                  {periodos.map(periodo => (
                    <SelectItem key={periodo.id} value={periodo.id}>
                      {periodo.nombre}
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
            
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo de Gráfico</label>
              <Select 
                value={filtros.tipoGrafico} 
                onValueChange={(value) => handleFiltroChange("tipoGrafico", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo de gráfico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="barras">Gráfico de barras</SelectItem>
                  <SelectItem value="lineas">Gráfico de líneas</SelectItem>
                  <SelectItem value="pastel">Gráfico circular</SelectItem>
                  <SelectItem value="tabla">Tabla de datos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button 
              onClick={handleGenerarReporte} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {filtros.tipoGrafico === "pastel" ? (
                <PieChart className="h-4 w-4" />
              ) : (
                <BarChart2 className="h-4 w-4" />
              )}
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
          <CardTitle>Vista Previa del Reporte Estadístico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[400px] flex items-center justify-center border rounded-md p-6">
            {loading ? (
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-2">Generando reporte estadístico...</p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p>Seleccione los filtros y haga clic en "Generar Reporte" para visualizar los datos estadísticos</p>
                {filtros.tipoGrafico !== "tabla" && (
                  <div className="mt-4">
                    <p className="text-sm">Se mostrará un gráfico de tipo: {filtros.tipoGrafico}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
