"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useInstitucion } from "@/hooks/use-institucion";
import { FileDown, Printer, BarChart } from "lucide-react";
import { toast } from "sonner";
import { getPeriodos } from "@/action/config/periodo-action";
import { getNiveles } from "@/action/config/niveles-grados-action";
import { getCursos } from "@/action/config/estructura-academica-action";
import { 
  getCalificacionesPorCurso, 
  getBoletasCalificaciones, 
  getPromediosPorCurso, 
  getRendimientoAcademico 
} from "@/action/reportes/reporte-academico-action";


export default function ReporteAcademico({ userId }) {
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    nivelAcademicoId: "",
    gradoId: "",
    cursoId: "",
    periodoId: "",
    fechaInicio: null,
    fechaFin: null,
    tipoReporte: "calificaciones"
  });
  
  const { institucion } = useInstitucion();
  const [niveles, setNiveles] = useState([]);
  const [grados, setGrados] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  
  // Estado para almacenar los datos del reporte generado
  const [reporteGenerado, setReporteGenerado] = useState(false);
  const [datosReporte, setDatosReporte] = useState(null);

  useEffect(() => {
    const fetchNiveles = async () => {
      if (!institucion || !institucion.id) {
        console.log("Institución no disponible aún");
        return;
      }
      
      try {
        const response = await getNiveles(institucion.id);
        console.log("response", response);
        
        if (response.success && response.data) {
          // Guardamos los niveles completos
          setNiveles(response.data);
          
          // Extraemos todos los grados de todos los niveles
          const todosLosGrados = [];
          response.data.forEach(nivel => {
            if (nivel.grados && Array.isArray(nivel.grados)) {
              nivel.grados.forEach(grado => {
                todosLosGrados.push({
                  ...grado,
                  nivelId: nivel.id, // Guardamos el nivelId para filtrar después
                  nivelNombre: nivel.nombre
                });
              });
            }
          });
          
          setGrados(todosLosGrados);
          console.log("Todos los grados:", todosLosGrados);
        }
      } catch (error) {
        console.error("Error al cargar niveles:", error);
        toast.error("No se pudieron cargar los niveles");
      }
    }
    fetchNiveles();
  }, [institucion]);
  
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
      
      console.log(`Cargando cursos para nivel=${nivelId} y grado=${gradoId}`);
      
      // Según el modelo de datos:
      // - nivelAcademicoId y gradoId son opcionales en el modelo Curso
      // - institucionId se relaciona a través del área curricular
      
      // Primera estrategia: Obtener todos los cursos de la institución
      // y luego filtrar manualmente por nivel y grado
      const response = await getCursos(institucion.id, {});
      
      if (response.success) {
        console.log(`Se obtuvieron ${response.data.length} cursos en total`);
        
        // Filtramos manualmente los cursos para encontrar aquellos que coincidan con el nivel y grado
        const cursosFiltrados = response.data.filter(curso => {
          console.log("Analizando curso:", curso.nombre, curso);
          
          // Extraemos la información de nivel y grado del curso
          // El nivel puede estar en diferentes lugares
          let cursoNivelId = null;
          if (curso.nivelId) {
            cursoNivelId = curso.nivelId;
          } else if (curso.nivelAcademico && curso.nivelAcademico.nivelId) {
            cursoNivelId = curso.nivelAcademico.nivelId;
          } else if (curso.nivel && curso.nivel.id) {
            cursoNivelId = curso.nivel.id;
          }
          
          // El grado puede estar en diferentes lugares
          let cursoGradoId = null;
          if (curso.gradoId) {
            cursoGradoId = curso.gradoId;
          } else if (curso.nivelAcademico && curso.nivelAcademico.gradoId) {
            cursoGradoId = curso.nivelAcademico.gradoId;
          } else if (curso.grado && curso.grado.id) {
            cursoGradoId = curso.grado.id;
          }
          
          // Verificamos si hay coincidencia con el nivel y grado seleccionados
          const matchNivel = cursoNivelId === nivelId;
          const matchGrado = cursoGradoId === gradoId;
          
          // Información de depuración detallada
          console.log(`Curso: ${curso.nombre}`);
          console.log(`- ID del curso: ${curso.id}`);
          console.log(`- nivelId directo: ${curso.nivelId}`);
          console.log(`- nivelAcademico.nivelId: ${curso.nivelAcademico?.nivelId}`);
          console.log(`- nivel.id: ${curso.nivel?.id}`);
          console.log(`- gradoId directo: ${curso.gradoId}`);
          console.log(`- nivelAcademico.gradoId: ${curso.nivelAcademico?.gradoId}`);
          console.log(`- grado.id: ${curso.grado?.id}`);
          console.log(`- Nivel seleccionado: ${nivelId}, Grado seleccionado: ${gradoId}`);
          console.log(`- Match nivel: ${matchNivel}, Match grado: ${matchGrado}`);
          
          // Un curso es relevante si coincide tanto con el nivel como con el grado
          return matchNivel && matchGrado;
        });
        
        console.log(`Se encontraron ${cursosFiltrados.length} cursos para nivel=${nivelId} y grado=${gradoId}`);
        
        // Si no encontramos cursos, intentamos una búsqueda más flexible
        if (cursosFiltrados.length === 0) {
          console.log("No se encontraron cursos con filtro estricto, intentando filtro flexible...");
          
          // Búsqueda más flexible: cursos que coincidan con nivel o grado
          const cursosPorNivelOGrado = response.data.filter(curso => {
            // Extraemos la información de nivel y grado del curso con la misma lógica
            let cursoNivelId = null;
            if (curso.nivelId) {
              cursoNivelId = curso.nivelId;
            } else if (curso.nivelAcademico && curso.nivelAcademico.nivelId) {
              cursoNivelId = curso.nivelAcademico.nivelId;
            } else if (curso.nivel && curso.nivel.id) {
              cursoNivelId = curso.nivel.id;
            }
            
            let cursoGradoId = null;
            if (curso.gradoId) {
              cursoGradoId = curso.gradoId;
            } else if (curso.nivelAcademico && curso.nivelAcademico.gradoId) {
              cursoGradoId = curso.nivelAcademico.gradoId;
            } else if (curso.grado && curso.grado.id) {
              cursoGradoId = curso.grado.id;
            }
            
            // En este caso, mostramos cursos que coincidan con nivel O grado
            const matchNivel = cursoNivelId === nivelId;
            const matchGrado = cursoGradoId === gradoId;
            
            console.log(`Filtro flexible - Curso: ${curso.nombre}, Match nivel: ${matchNivel}, Match grado: ${matchGrado}`);
            
            return matchNivel || matchGrado;
          });
          
          console.log(`Se encontraron ${cursosPorNivelOGrado.length} cursos con filtro flexible`);
          setCursos(cursosPorNivelOGrado);
        } else {
          setCursos(cursosFiltrados);
        }
      } else {
        toast.error(response.error || "Error al cargar los cursos");
        setCursos([]);
      }
    } catch (error) {
      console.error("Error al cargar cursos:", error);
      toast.error("No se pudieron cargar los cursos");
      setCursos([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar periodos académicos
  useEffect(() => {
    const fetchPeriodos = async () => {
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
    
    fetchPeriodos();
  }, [institucion?.id]);
  
  // Manejar cambio de filtros
  const handleFiltroChange = (key, value) => {
    setFiltros(prev => {
      let newFiltros = { ...prev, [key]: value };
      
      // Si cambia el nivel, resetear el grado seleccionado
      if (key === "nivelAcademicoId") {
        newFiltros = {
          ...newFiltros,
          gradoId: "" // Resetear el grado cuando cambia el nivel
        };
        console.log("Nivel cambiado, grados disponibles:", 
          grados.filter(grado => grado.nivelId === value));
      }
      
      // Si cambia el nivel o grado, cargar cursos correspondientes
      if ((key === "nivelAcademicoId" || key === "gradoId") && 
          newFiltros.nivelAcademicoId && newFiltros.gradoId) {
        cargarCursos(newFiltros.nivelAcademicoId, newFiltros.gradoId);
      }
      
      return newFiltros;
    });
  };
  
  // Generar reporte
  const handleGenerarReporte = async () => {
    setLoading(true);
    setReporteGenerado(false);
    setDatosReporte(null);
    
    try {
      // Validar que se hayan seleccionado los filtros necesarios
      if (!filtros.nivelAcademicoId || !filtros.gradoId || !filtros.cursoId) {
        toast.error("Debe seleccionar nivel, grado y curso para generar el reporte");
        return;
      }
      
      // Obtener datos reales según el tipo de reporte seleccionado
      let response;
      let datos = null;
      
      switch (filtros.tipoReporte) {
        case "calificaciones":
          console.log("Obteniendo calificaciones para el curso:", filtros.cursoId);
          response = await getCalificacionesPorCurso(filtros.cursoId, filtros.periodoId || undefined);
          
          if (response.error) {
            toast.error(response.error);
            return;
          }
          
          if (response.success && response.data) {
            datos = {
              tipo: "Calificaciones",
              nivel: response.data.nivel?.nombre || "",
              grado: response.data.grado?.nombre || "",
              curso: response.data.curso?.nombre || "",
              estudiantes: response.data.estudiantes || []
            };
          }
          break;
          
        case "boletas":
          console.log("Obteniendo boletas para el grado:", filtros.gradoId);
          response = await getBoletasCalificaciones(filtros.gradoId, null, filtros.periodoId || undefined);
          
          if (response.error) {
            toast.error(response.error);
            return;
          }
          
          if (response.success && response.data) {
            datos = {
              tipo: "Boletas de calificaciones",
              nivel: response.data.nivel?.nombre || "",
              grado: response.data.grado?.nombre || "",
              estudiantes: response.data.estudiantes || []
            };
          }
          break;
          
        case "promedios":
          console.log("Obteniendo promedios para el curso:", filtros.cursoId);
          response = await getPromediosPorCurso(filtros.cursoId, filtros.periodoId || undefined);
          
          if (response.error) {
            toast.error(response.error);
            return;
          }
          
          if (response.success && response.data) {
            datos = {
              tipo: "Promedios por curso",
              nivel: response.data.nivel?.nombre || "",
              grado: response.data.grado?.nombre || "",
              curso: response.data.curso?.nombre || "",
              promedios: response.data.promedios || {}
            };
          }
          break;
          
        case "rendimiento":
          console.log("Obteniendo rendimiento para el curso:", filtros.cursoId);
          response = await getRendimientoAcademico(filtros.cursoId, filtros.periodoId || undefined);
          
          if (response.error) {
            toast.error(response.error);
            return;
          }
          
          if (response.success && response.data) {
            datos = {
              tipo: "Rendimiento académico",
              nivel: response.data.nivel?.nombre || "",
              grado: response.data.grado?.nombre || "",
              curso: response.data.curso?.nombre || "",
              rendimiento: response.data.rendimiento || {}
            };
          }
          break;
          
        default:
          datos = { tipo: filtros.tipoReporte, mensaje: "Tipo de reporte no implementado" };
      }
      
      // Si no se obtuvieron datos, mostrar mensaje
      if (!datos) {
        toast.error("No se encontraron datos para generar el reporte");
        return;
      }
      
      // Guardar los datos generados
      setDatosReporte(datos);
      setReporteGenerado(true);
      
      toast.success("Reporte generado correctamente");
    } catch (error) {
      console.error("Error al generar reporte:", error);
      toast.error("Error al generar el reporte: " + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };
  
  // Funciones auxiliares para generar datos de ejemplo
  const generarEstudiantesConCalificaciones = (cantidad, incluirCursos = false) => {
    const estudiantes = [];
    const nombres = ["Ana", "Juan", "María", "Carlos", "Sofía", "Pedro", "Lucía", "Miguel", "Valentina", "Diego"];
    const apellidos = ["García", "López", "Martínez", "Rodríguez", "Hernández", "Gómez", "Pérez", "Sánchez", "Ramírez", "Torres"];
    
    for (let i = 0; i < cantidad; i++) {
      const estudiante = {
        id: `est-${i+1}`,
        nombre: `${nombres[Math.floor(Math.random() * nombres.length)]} ${apellidos[Math.floor(Math.random() * apellidos.length)]}`,
        codigo: `E${2000 + i}`,
      };
      
      if (incluirCursos) {
        estudiante.cursos = [
          { nombre: "Matemática", calificaciones: generarCalificacionesPorEvaluacion() },
          { nombre: "Comunicación", calificaciones: generarCalificacionesPorEvaluacion() },
          { nombre: "Ciencias", calificaciones: generarCalificacionesPorEvaluacion() }
        ];
      } else {
        estudiante.calificaciones = generarCalificacionesPorEvaluacion();
      }
      
      estudiantes.push(estudiante);
    }
    
    return estudiantes;
  };
  
  const generarCalificacionesPorEvaluacion = () => {
    return {
      parcial1: Math.floor(Math.random() * 11) + 10, // 10-20
      parcial2: Math.floor(Math.random() * 11) + 10,
      trabajos: Math.floor(Math.random() * 11) + 10,
      examenFinal: Math.floor(Math.random() * 11) + 10,
      promedio: (Math.floor(Math.random() * 11) + 10).toFixed(1)
    };
  };
  
  const generarPromediosPorEvaluacion = () => {
    return {
      parcial1: (Math.floor(Math.random() * 5) + 13).toFixed(1),
      parcial2: (Math.floor(Math.random() * 5) + 14).toFixed(1),
      trabajos: (Math.floor(Math.random() * 5) + 15).toFixed(1),
      examenFinal: (Math.floor(Math.random() * 5) + 12).toFixed(1),
      promedioGeneral: (Math.floor(Math.random() * 5) + 14).toFixed(1),
      aprobados: Math.floor(Math.random() * 10) + 15,
      desaprobados: Math.floor(Math.random() * 5)
    };
  };
  
  const generarDatosRendimiento = () => {
    return {
      excelente: Math.floor(Math.random() * 5) + 5,
      bueno: Math.floor(Math.random() * 8) + 10,
      regular: Math.floor(Math.random() * 5) + 3,
      deficiente: Math.floor(Math.random() * 3),
      promedioGeneral: (Math.floor(Math.random() * 5) + 14).toFixed(1)
    };
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
          <CardTitle>Reportes Académicos</CardTitle>
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
                  <SelectItem value="calificaciones">Calificaciones</SelectItem>
                  <SelectItem value="boletas">Boletas de calificaciones</SelectItem>
                  <SelectItem value="promedios">Promedios por curso</SelectItem>
                  <SelectItem value="rendimiento">Rendimiento académico</SelectItem>
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
                  {grados
                    ?.filter(grado => grado.nivelId === filtros.nivelAcademicoId)
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
              <label className="text-sm font-medium mb-1 block">Periodo Académico</label>
              <Select 
                value={filtros.periodoId} 
                onValueChange={(value) => handleFiltroChange("periodoId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar periodo" />
                </SelectTrigger>
                <SelectContent>
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
          </div>
          
          <div className="flex justify-between">
            <Button 
              onClick={handleGenerarReporte} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <BarChart className="h-4 w-4" />
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
          <CardTitle>Vista Previa del Reporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[400px] border rounded-md p-6 overflow-auto">
            {loading ? (
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-2">Generando reporte...</p>
              </div>
            ) : reporteGenerado && datosReporte ? (
              <div className="w-full">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold mb-2">Reporte de {datosReporte.tipo}</h2>
                  <div className="text-sm text-gray-600">
                    <p>Nivel: {datosReporte.nivel} | Grado: {datosReporte.grado}</p>
                    {datosReporte.curso && <p>Curso: {datosReporte.curso}</p>}
                    <p>Fecha: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                
                {/* Contenido del reporte según el tipo */}
                {datosReporte.tipo === "Calificaciones" && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-2 text-left">Código</th>
                          <th className="border p-2 text-left">Estudiante</th>
                          <th className="border p-2 text-center">I Unidad</th>
                          <th className="border p-2 text-center">II Unidad</th>
                          <th className="border p-2 text-center">III Unidad</th>
                          <th className="border p-2 text-center">IV Unidad</th>
                          <th className="border p-2 text-center">Trabajos</th>
                          <th className="border p-2 text-center">Examen Final</th>
                          <th className="border p-2 text-center">Promedio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {datosReporte.estudiantes.map(estudiante => (
                          <tr key={estudiante.id}>
                            <td className="border p-2">{estudiante.codigo}</td>
                            <td className="border p-2">{estudiante.nombre}</td>
                            <td className="border p-2 text-center">{estudiante.calificaciones.iUnidad}</td>
                            <td className="border p-2 text-center">{estudiante.calificaciones.iiUnidad}</td>
                            <td className="border p-2 text-center">{estudiante.calificaciones.iiiUnidad}</td>
                            <td className="border p-2 text-center">{estudiante.calificaciones.ivUnidad}</td>
                            <td className="border p-2 text-center">{estudiante.calificaciones.trabajos}</td>
                            <td className="border p-2 text-center">{estudiante.calificaciones.examenFinal}</td>
                            <td className="border p-2 text-center font-bold">{estudiante.calificaciones.promedio}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {datosReporte.tipo === "Boletas de calificaciones" && (
                  <div className="space-y-8">
                    {datosReporte.estudiantes.slice(0, 3).map(estudiante => (
                      <div key={estudiante.id} className="border rounded-md p-4">
                        <div className="mb-4">
                          <h3 className="text-lg font-bold">{estudiante.nombre}</h3>
                          <p className="text-sm text-gray-600">Código: {estudiante.codigo}</p>
                        </div>
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border p-2 text-left">Curso</th>
                              <th className="border p-2 text-center">Parcial 1</th>
                              <th className="border p-2 text-center">Parcial 2</th>
                              <th className="border p-2 text-center">Trabajos</th>
                              <th className="border p-2 text-center">Examen Final</th>
                              <th className="border p-2 text-center">Promedio</th>
                            </tr>
                          </thead>
                          <tbody>
                            {estudiante.cursos.map((curso, idx) => (
                              <tr key={idx}>
                                <td className="border p-2">{curso.nombre}</td>
                                <td className="border p-2 text-center">{curso.calificaciones.parcial1}</td>
                                <td className="border p-2 text-center">{curso.calificaciones.parcial2}</td>
                                <td className="border p-2 text-center">{curso.calificaciones.trabajos}</td>
                                <td className="border p-2 text-center">{curso.calificaciones.examenFinal}</td>
                                <td className="border p-2 text-center font-bold">{curso.calificaciones.promedio}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                    <p className="text-center text-sm text-gray-500">Mostrando 3 de {datosReporte.estudiantes.length} boletas</p>
                  </div>
                )}
                
                {datosReporte.tipo === "Promedios por curso" && (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="border rounded-md p-4">
                        <h3 className="text-lg font-bold mb-2">Resumen de Evaluaciones</h3>
                        <table className="w-full">
                          <tbody>
                            <tr>
                              <td className="py-1">Promedio Parcial 1:</td>
                              <td className="py-1 font-medium">{datosReporte.promedios.parcial1}</td>
                            </tr>
                            <tr>
                              <td className="py-1">Promedio Parcial 2:</td>
                              <td className="py-1 font-medium">{datosReporte.promedios.parcial2}</td>
                            </tr>
                            <tr>
                              <td className="py-1">Promedio Trabajos:</td>
                              <td className="py-1 font-medium">{datosReporte.promedios.trabajos}</td>
                            </tr>
                            <tr>
                              <td className="py-1">Promedio Examen Final:</td>
                              <td className="py-1 font-medium">{datosReporte.promedios.examenFinal}</td>
                            </tr>
                            <tr className="border-t">
                              <td className="py-1 font-bold">Promedio General:</td>
                              <td className="py-1 font-bold">{datosReporte.promedios.promedioGeneral}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="border rounded-md p-4">
                        <h3 className="text-lg font-bold mb-2">Estadísticas</h3>
                        <div className="flex items-center mb-2">
                          <div className="w-24">Aprobados:</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-4">
                            <div 
                              className="bg-green-500 h-4 rounded-full" 
                              style={{ width: `${(datosReporte.promedios.aprobados / (datosReporte.promedios.aprobados + datosReporte.promedios.desaprobados)) * 100}%` }}
                            ></div>
                          </div>
                          <div className="ml-2">{datosReporte.promedios.aprobados}</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-24">Desaprobados:</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-4">
                            <div 
                              className="bg-red-500 h-4 rounded-full" 
                              style={{ width: `${(datosReporte.promedios.desaprobados / (datosReporte.promedios.aprobados + datosReporte.promedios.desaprobados)) * 100}%` }}
                            ></div>
                          </div>
                          <div className="ml-2">{datosReporte.promedios.desaprobados}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {datosReporte.tipo === "Rendimiento académico" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-md p-4">
                      <h3 className="text-lg font-bold mb-4">Distribución de Rendimiento</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className="w-24">Excelente:</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-4">
                            <div 
                              className="bg-green-600 h-4 rounded-full" 
                              style={{ width: `${(datosReporte.rendimiento.excelente / (datosReporte.rendimiento.excelente + datosReporte.rendimiento.bueno + datosReporte.rendimiento.regular + datosReporte.rendimiento.deficiente)) * 100}%` }}
                            ></div>
                          </div>
                          <div className="ml-2">{datosReporte.rendimiento.excelente}</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-24">Bueno:</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-4">
                            <div 
                              className="bg-green-400 h-4 rounded-full" 
                              style={{ width: `${(datosReporte.rendimiento.bueno / (datosReporte.rendimiento.excelente + datosReporte.rendimiento.bueno + datosReporte.rendimiento.regular + datosReporte.rendimiento.deficiente)) * 100}%` }}
                            ></div>
                          </div>
                          <div className="ml-2">{datosReporte.rendimiento.bueno}</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-24">Regular:</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-4">
                            <div 
                              className="bg-yellow-400 h-4 rounded-full" 
                              style={{ width: `${(datosReporte.rendimiento.regular / (datosReporte.rendimiento.excelente + datosReporte.rendimiento.bueno + datosReporte.rendimiento.regular + datosReporte.rendimiento.deficiente)) * 100}%` }}
                            ></div>
                          </div>
                          <div className="ml-2">{datosReporte.rendimiento.regular}</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-24">Deficiente:</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-4">
                            <div 
                              className="bg-red-500 h-4 rounded-full" 
                              style={{ width: `${(datosReporte.rendimiento.deficiente / (datosReporte.rendimiento.excelente + datosReporte.rendimiento.bueno + datosReporte.rendimiento.regular + datosReporte.rendimiento.deficiente)) * 100}%` }}
                            ></div>
                          </div>
                          <div className="ml-2">{datosReporte.rendimiento.deficiente}</div>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t">
                        <p className="font-bold">Promedio general: {datosReporte.rendimiento.promedioGeneral}</p>
                      </div>
                    </div>
                    <div className="border rounded-md p-4">
                      <h3 className="text-lg font-bold mb-2">Resumen</h3>
                      <p className="mb-4">El rendimiento académico del curso muestra que la mayoría de los estudiantes tienen un desempeño entre bueno y excelente.</p>
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="font-medium">Recomendaciones:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                          <li>Reforzar el apoyo a los estudiantes con rendimiento deficiente</li>
                          <li>Mantener las estrategias de enseñanza que han funcionado bien</li>
                          <li>Considerar actividades de enriquecimiento para estudiantes destacados</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full">
                <p>Seleccione los filtros y haga clic en "Generar Reporte" para visualizar los datos</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
