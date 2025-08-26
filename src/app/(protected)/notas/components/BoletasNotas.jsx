"use client";

import { useState, useEffect, useRef } from "react";
import "./BoletasNotas.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, FileText, Printer, FileDown } from "lucide-react";
import { toast } from "sonner";
import { Margin, Resolution, usePDF } from "react-to-pdf";
import { useInstitucionContext } from "@/providers/institucion-provider";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Importar acciones del servidor
import {
  getCursosProfesor,
  getEstudiantesPorCurso,
  getPeriodosActivos,
  getNotasPorEstudiante,
  getResumenNotasPorCurso
} from "@/action/notas/nota";

// Esquema de validación para el formulario de selección
const seleccionSchema = z.object({
  tipo: z.enum(["boleta", "acta"]),
  cursoId: z.string().min(1, { message: "Debe seleccionar un curso" }),
  estudianteId: z.string().optional(),
  periodoId: z.string().min(1, { message: "Debe seleccionar un período académico" }),
});

/**
 * Componente para generar boletas de notas y actas de evaluación
 */
export default function BoletasNotas() {
  // Referencias para exportación a PDF
  const boletaRef = useRef(null);
  const actaRef = useRef(null);

  // Hook para generar PDF
  const { toPDF, targetRef: pdfRef } = usePDF({
    filename: 'documento-notas.pdf',
    resolution: Resolution.NORMAL,
    page: {
      margin: Margin.MEDIUM,
      format: 'letter',
      orientation: 'portrait'
    }
  });

  // Contexto de la institución
  const { institucion } = useInstitucionContext();

  // Estados para manejar la carga de datos
  const [loading, setLoading] = useState(false);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [exportandoPDF, setExportandoPDF] = useState(false);
  const [cursos, setCursos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [tipoDocumento, setTipoDocumento] = useState("boleta");
  const [datosGenerados, setDatosGenerados] = useState(null);
  console.log("datosGenerados", datosGenerados);

  // Formulario para la selección de datos
  const seleccionForm = useForm({
    resolver: zodResolver(seleccionSchema),
    defaultValues: {
      tipo: "boleta",
      cursoId: "",
      estudianteId: "",
      periodoId: "",
    },
  });

  // Cargar cursos y períodos al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        // Cargar cursos del profesor actual
        const cursosResponse = await getCursosProfesor();
        if (!cursosResponse || cursosResponse.error) {
          throw new Error(cursosResponse?.error || "Error al cargar los cursos");
        }
        setCursos(cursosResponse || []);

        // Cargar períodos académicos activos
        const periodosResponse = await getPeriodosActivos();
        if (!periodosResponse || periodosResponse.error) {
          throw new Error(periodosResponse?.error || "Error al cargar los períodos académicos");
        }
        setPeriodos(periodosResponse || []);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Error al cargar los datos necesarios: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Manejar cambio de tipo de documento
  const handleTipoChange = (value) => {
    setTipoDocumento(value);
    seleccionForm.setValue("tipo", value);

    // Resetear estudiante si cambia a acta
    if (value === "acta") {
      seleccionForm.setValue("estudianteId", "");
    }
  };

  // Cargar estudiantes cuando se selecciona un curso
  const handleCursoChange = async (cursoId) => {
    if (!cursoId) return;

    setLoadingEstudiantes(true);
    seleccionForm.setValue("estudianteId", ""); // Resetear selección de estudiante

    try {
      // Cargar estudiantes matriculados en el curso
      const response = await getEstudiantesPorCurso(cursoId);
      if (!response || response.error) {
        throw new Error(response?.error || "Error al cargar los estudiantes");
      }

      // Formatear los nombres de los estudiantes para mostrarlos
      const estudiantesFormateados = response.map(est => ({
        id: est.id,
        nombre: `${est.name} ${est.apellidoPaterno || ''} ${est.apellidoMaterno || ''}`.trim(),
        grado: est.nivelAcademico?.grado?.nombre || '',
        seccion: est.nivelAcademico?.seccion || '',
        codigoSiagie: est.codigoSiagie || ''
      }));

      setEstudiantes(estudiantesFormateados);
    } catch (error) {
      console.error("Error al cargar estudiantes:", error);
      toast.error("Error al cargar los estudiantes del curso: " + error.message);
      setEstudiantes([]);
    } finally {
      setLoadingEstudiantes(false);
    }
  };

  // Generar boleta o acta según la selección
  const handleGenerar = async (data) => {
    // Validar que si es boleta, se haya seleccionado un estudiante
    if (data.tipo === "boleta" && !data.estudianteId) {
      toast.error("Debe seleccionar un estudiante para generar la boleta");
      return;
    }

    setGenerando(true);
    try {
      const curso = cursos.find(c => c.id === data.cursoId);
      const periodo = periodos.find(p => p.id === data.periodoId);

      let documentoGenerado = {
        tipo: data.tipo,
        curso,
        periodo,
        fechaGeneracion: format(new Date(), "PPP", { locale: es }),
      };

      if (data.tipo === "boleta") {
        // Generar boleta individual
        const estudiante = estudiantes.find(e => e.id === data.estudianteId);
        documentoGenerado.estudiante = estudiante;

        // Obtener notas del estudiante en el período seleccionado
        const notasResponse = await getNotasPorEstudiante(data.estudianteId);

        if (!notasResponse) {
          throw new Error("No se pudieron obtener las notas del estudiante");
        }

        // Filtrar las notas por el período seleccionado
        const notasDelPeriodo = notasResponse.filter(nota =>
          nota.evaluacion?.periodo?.id === data.periodoId
        );

        // Calcular promedio de las notas
        let promedio = 0;
        if (notasDelPeriodo.length > 0) {
          const suma = notasDelPeriodo.reduce((acc, nota) => acc + nota.valor, 0);
          promedio = (suma / notasDelPeriodo.length).toFixed(1);
        }

        // Generar observaciones según el promedio
        let observaciones = "";
        if (promedio >= 18) {
          observaciones = "Excelente desempeño académico. Felicitaciones.";
        } else if (promedio >= 14) {
          observaciones = "Muy buen desempeño académico. Sigue así.";
        } else if (promedio >= 11) {
          observaciones = "Desempeño académico satisfactorio. Puede mejorar.";
        } else {
          observaciones = "Necesita mejorar su desempeño académico. Requiere apoyo adicional.";
        }

        // Formatear las notas para mostrarlas en la boleta
        const notasFormateadas = notasDelPeriodo.map(nota => ({
          curso: nota.curso?.nombre || "Sin nombre",
          valor: nota.valor,
          comentario: nota.comentario,
          estado: nota.valor >= 18 ? "Excelente" :
            nota.valor >= 14 ? "Muy Bueno" :
              nota.valor >= 11 ? "Aprobado" : "Desaprobado"
        }));

        documentoGenerado.notas = notasFormateadas;
        documentoGenerado.promedio = promedio;
        documentoGenerado.observaciones = observaciones;

        // Generar nombre del archivo PDF
        documentoGenerado.nombreArchivo = `boleta_${estudiante?.id}_${periodo?.nombre?.replace(/\s+/g, '_')}.pdf`;
      } else {
        // Generar acta de evaluación
        const resumenResponse = await getResumenNotasPorCurso(data.cursoId, data.periodoId);

        if (!resumenResponse) {
          throw new Error("No se pudo obtener el resumen de notas del curso");
        }
        
        // Extraer estudiantes del objeto de respuesta
        const estudiantesArray = Object.values(resumenResponse.estudiantes || {});
        
        // Calcular estadísticas del curso
        const totalEstudiantes = estudiantesArray.length;
        const aprobados = estudiantesArray.filter(est => est.promedioPonderado >= 11).length;
        const desaprobados = totalEstudiantes - aprobados;
        
        // Usar el promedio general que ya viene calculado
        const promedioGeneral = resumenResponse.promedioGeneral || "0.0";

        // Formatear los datos para el acta
        const estudiantesFormateados = estudiantesArray.map(est => ({
          nombre: est.nombre,
          promedio: est.promedioPonderado || est.promedio,
          estado: est.promedioPonderado >= 18 ? "Excelente" :
            est.promedioPonderado >= 14 ? "Muy Bueno" :
              est.promedioPonderado >= 11 ? "Aprobado" : "Desaprobado"
        }));

        // Generar observaciones según el promedio general
        let observaciones = "";
        if (promedioGeneral >= 16) {
          observaciones = "Excelente rendimiento general del curso. Felicitaciones.";
        } else if (promedioGeneral >= 13) {
          observaciones = "Buen rendimiento general del curso.";
        } else if (promedioGeneral >= 11) {
          observaciones = "Rendimiento satisfactorio del curso. Se recomienda reforzar algunos temas.";
        } else {
          observaciones = "Rendimiento por debajo de lo esperado. Se requiere implementar estrategias de mejora.";
        }

        documentoGenerado.resumen = {
          promedioGeneral,
          totalEstudiantes,
          aprobados,
          desaprobados,
          estudiantes: estudiantesFormateados,
          observaciones
        };

        // Generar nombre del archivo PDF
        documentoGenerado.nombreArchivo = `acta_${curso?.id}_${periodo?.nombre?.replace(/\s+/g, '_')}.pdf`;
      }

      setDatosGenerados(documentoGenerado);
      toast.success(`${data.tipo === "boleta" ? "Boleta" : "Acta"} generada correctamente`);
    } catch (error) {
      console.error("Error al generar documento:", error);
      toast.error(`Error al generar ${data.tipo === "boleta" ? "la boleta" : "el acta"}: ${error.message}`);
    } finally {
      setGenerando(false);
    }
  };

  // Exportar documento a PDF
  const handleExportarPDF = async () => {
    if (!datosGenerados) return;

    setExportandoPDF(true);
    try {
      // Actualizar el nombre del archivo antes de generar el PDF
      const options = {
        filename: datosGenerados.nombreArchivo || 'documento-notas.pdf'
      };

      // Generar el PDF
      await toPDF(options);
      toast.success(`${datosGenerados.tipo === "boleta" ? "Boleta" : "Acta"} descargada correctamente`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.error('Error al generar el documento PDF');
    } finally {
      setExportandoPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Boletas y Actas de Evaluación</h2>
      </div>

      <Tabs defaultValue="boleta" onValueChange={handleTipoChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="boleta">Boleta de Notas</TabsTrigger>
          <TabsTrigger value="acta">Acta de Evaluación</TabsTrigger>
        </TabsList>

        <TabsContent value="boleta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generar Boleta de Notas</CardTitle>
              <CardDescription>
                Seleccione el estudiante y período académico para generar la boleta de notas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...seleccionForm}>
                <form onSubmit={seleccionForm.handleSubmit(handleGenerar)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={seleccionForm.control}
                      name="cursoId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Curso</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleCursoChange(value);
                            }}
                            value={field.value}
                            disabled={loading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un curso" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cursos.map((curso) => (
                                <SelectItem key={curso.id} value={curso.id}>
                                  {curso.nombre} - {curso.nivelAcademico?.nivel?.nombre} {curso.nivelAcademico?.grado?.nombre} {curso.nivelAcademico?.seccion}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={seleccionForm.control}
                      name="estudianteId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estudiante</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={loading || estudiantes.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un estudiante" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {estudiantes.map((estudiante) => (
                                <SelectItem key={estudiante.id} value={estudiante.id}>
                                  {estudiante.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={seleccionForm.control}
                      name="periodoId"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Período Académico</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={loading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un período" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {periodos.map((periodo) => (
                                <SelectItem key={periodo.id} value={periodo.id}>
                                  {periodo.nombre} {periodo.anioEscolar}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={loading || loadingEstudiantes || generando}
                    >
                      {generando ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Generar Boleta
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="acta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generar Acta de Evaluación</CardTitle>
              <CardDescription>
                Seleccione el curso y período académico para generar el acta de evaluación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...seleccionForm}>
                <form onSubmit={seleccionForm.handleSubmit(handleGenerar)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={seleccionForm.control}
                      name="cursoId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Curso</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={loading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un curso" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cursos.map((curso) => (
                                <SelectItem key={curso.id} value={curso.id}>
                                  {curso.nombre} - {curso.nivelAcademico?.nivel?.nombre} {curso.nivelAcademico?.grado?.nombre} {curso.nivelAcademico?.seccion}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={seleccionForm.control}
                      name="periodoId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Período Académico</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={loading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un período" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {periodos.map((periodo) => (
                                <SelectItem key={periodo.id} value={periodo.id}>
                                  {periodo.nombre} {periodo.anioEscolar}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={loading || generando}
                    >
                      {generando ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Generar Acta
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {datosGenerados && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                {datosGenerados.tipo === "boleta" ? "Boleta de Notas" : "Acta de Evaluación"}
              </CardTitle>
              <CardDescription>
                {datosGenerados.tipo === "boleta"
                  ? `Estudiante: ${datosGenerados.estudiante?.nombre}`
                  : `Curso: ${datosGenerados.curso?.nombre}`
                }
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                disabled={exportandoPDF}
              >
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportarPDF}
                disabled={exportandoPDF}
              >
                {exportandoPDF ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando PDF...
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4" />
                    Descargar PDF
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div id="pdfContent" className="pdf-container" ref={pdfRef}>
              {datosGenerados.tipo === "boleta" ? (
                <VistaBoletaNotas
                  datos={{
                    ...datosGenerados,
                    institucion: institucion
                  }}
                />
              ) : (
                <VistaActaEvaluacion
                  datos={{
                    ...datosGenerados,
                    institucion: institucion
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Componente para visualizar la boleta de notas
function VistaBoletaNotas({ datos }) {
  console.log("datos", datos);
  // Obtener la fecha actual formateada
  const fechaActual = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  // Función para determinar el estado según la nota
  const getEstadoNota = (nota) => {
    const notaNum = parseFloat(nota);
    if (notaNum >= 18) return { texto: "Excelente", clase: "bg-green-500" };
    if (notaNum >= 14) return { texto: "Muy Bueno", clase: "bg-green-400" };
    if (notaNum >= 11) return { texto: "Aprobado", clase: "bg-green-300" };
    return { texto: "Desaprobado", clase: "bg-red-300" };
  };

  // Calcular promedio si no viene en los datos
  const calcularPromedio = () => {
    if (datos.promedio) return datos.promedio;
    if (!datos.notas || datos.notas.length === 0) return "0.0";

    const suma = datos.notas.reduce((acc, nota) => acc + parseFloat(nota.valor || 0), 0);
    return (suma / datos.notas.length).toFixed(1);
  };

  const promedio = calcularPromedio();
  const estadoPromedio = getEstadoNota(promedio);

  return (
    <div className="space-y-6 p-4 border rounded-md bg-white">
      {/* Encabezado de la boleta */}
      <div className="text-center space-y-2 border-b pb-4 pdf-header">
        {datos.institucion && (
          <div className="mb-3">
            <h3 className="font-bold">{datos.institucion.nombre}</h3>
            <p className="text-sm text-muted-foreground">{datos.institucion.codigoModular || ""}</p>
          </div>
        )}
        <h2 className="text-xl font-bold">BOLETA DE CALIFICACIONES</h2>
        <p className="text-sm text-muted-foreground">Período: {datos.periodo?.nombre} {datos.periodo?.anioEscolar}</p>
        <p className="text-sm text-muted-foreground">Fecha de emisión: {datos.fechaGeneracion || fechaActual}</p>
      </div>

      {/* Datos del estudiante */}
      <div className="space-y-2">
        <h3 className="font-semibold">DATOS DEL ESTUDIANTE</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm font-medium">Nombre completo:</p>
            <p className="text-sm">{datos.estudiante?.nombre}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Código SIAGIE:</p>
            <p className="text-sm font-mono">{datos.estudiante?.codigoSiagie || "N/A"}</p>
          </div>
          {datos.curso && (
            <div>
              <p className="text-sm font-medium">Grado y sección:</p>
              <p className="text-sm">
                {datos.curso.nivelAcademico?.nivel?.nombre} {datos.curso.nivelAcademico?.grado?.nombre} {datos.curso.nivelAcademico?.seccion}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de calificaciones */}
      <div className="space-y-2 no-break-inside">
        <h3 className="font-semibold">CALIFICACIONES</h3>
        <div className="rounded-md border">
          <Table className="pdf-table">
            <TableHeader>
              <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead>Evaluación</TableHead>
                <TableHead className="text-center">Nota</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead>Observaciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datos.notas && datos.notas.length > 0 ? (
                datos.notas.map((nota, index) => {
                  // Usar el estado que ya viene en los datos formateados o calcularlo
                  const estado = nota.estado ?
                    { texto: nota.estado, clase: `bg-${nota.estado === "Desaprobado" ? "red" : "green"}-300` } :
                    getEstadoNota(nota.valor);

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{nota.curso}</TableCell>
                      <TableCell>{nota.evaluacion || "Evaluación General"}</TableCell>
                      <TableCell className="text-center">{parseFloat(nota.valor).toFixed(1)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={estado.clase}>
                          {estado.texto}
                        </Badge>
                      </TableCell>
                      <TableCell>{nota.comentario || "-"}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No hay calificaciones registradas para este período
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Promedio general */}
      <div className="flex justify-between items-center p-4 border rounded-md bg-slate-50">
        <h3 className="font-semibold">PROMEDIO GENERAL:</h3>
        <Badge className={`text-lg px-4 py-1 ${estadoPromedio.clase}`}>
          {promedio}
        </Badge>
      </div>

      {/* Observaciones generales */}
      <div className="space-y-2">
        <h3 className="font-semibold">OBSERVACIONES GENERALES</h3>
        <p className="text-sm p-3 border rounded-md">
          {datos.observaciones ||
            (parseFloat(promedio) >= 11
              ? `El estudiante muestra un desempeño ${estadoPromedio.texto.toLowerCase()} en este período académico.`
              : "El estudiante necesita reforzamiento académico para mejorar su rendimiento.")}
        </p>
      </div>

      {/* Firmas */}
      <div className="grid grid-cols-2 gap-8 pt-10 mt-10 pdf-signatures no-break-inside">
        <div className="text-center">
          <div className="border-t pt-2 signature-line">
            <p className="font-medium">Director(a)</p>
            {datos.institucion?.director && (
              <p className="text-sm text-muted-foreground">{datos.institucion.director}</p>
            )}
          </div>
        </div>
        <div className="text-center">
          <div className="border-t pt-2 signature-line">
            <p className="font-medium">Tutor(a)</p>
            {datos.curso?.profesor?.nombre && (
              <p className="text-sm text-muted-foreground">{datos.curso.profesor.nombre}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para visualizar el acta de evaluación
function VistaActaEvaluacion({ datos }) {
  // Obtener la fecha actual formateada
  const fechaActual = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  // Función para determinar el estado según la nota
  const getEstadoNota = (nota) => {
    const notaNum = parseFloat(nota);
    if (notaNum >= 18) return { texto: "Excelente", clase: "bg-green-500" };
    if (notaNum >= 14) return { texto: "Bueno", clase: "bg-green-300" };
    if (notaNum >= 11) return { texto: "Aprobado", clase: "bg-green-300" };
    return { texto: "Desaprobado", clase: "bg-red-300" };
  };

  // Usar las estadísticas que ya vienen en los datos formateados
  const estadisticas = {
    total: datos.resumen?.totalEstudiantes || 0,
    aprobados: datos.resumen?.aprobados || 0,
    desaprobados: datos.resumen?.desaprobados || 0
  };

  const promedioGeneral = datos.resumen?.promedioGeneral || "0.0";
  const estadoPromedio = getEstadoNota(promedioGeneral);

  return (
    <div className="space-y-6 p-4 border rounded-md bg-white">
      {/* Encabezado del acta con datos de la institución */}
      <div className="text-center space-y-2 border-b pb-4 pdf-header">
        {datos.institucion && (
          <div className="mb-3">
            <h3 className="font-bold">{datos.institucion.nombre}</h3>
            <p className="text-sm text-muted-foreground">{datos.institucion.codigoModular || ""}</p>
          </div>
        )}
        <h2 className="text-xl font-bold">ACTA DE EVALUACIÓN</h2>
        <p className="text-sm text-muted-foreground">Período: {datos.periodo?.nombre} {datos.periodo?.anioEscolar}</p>
        <p className="text-sm text-muted-foreground">Fecha de emisión: {datos.fechaGeneracion || new Date().toLocaleDateString('es-ES')}</p>
      </div>

      {/* Datos del curso */}
      <div className="space-y-2">
        <h3 className="font-semibold">DATOS DEL CURSO</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm font-medium">Curso:</p>
            <p>{datos.curso?.nombre}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Código:</p>
            <p>{datos.curso?.codigo || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Grado y sección:</p>
            <p>
              {datos.curso?.nivelAcademico?.nivel?.nombre} {datos.curso?.nivelAcademico?.grado?.nombre} {datos.curso?.nivelAcademico?.seccion}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Docente:</p>
            <p>{datos.curso?.profesor?.nombre || "No asignado"}</p>
          </div>
        </div>
      </div>

      {/* Resumen estadístico */}
      <div className="space-y-2">
        <h3 className="font-semibold">RESUMEN ESTADÍSTICO</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 border rounded-md bg-slate-50 text-center">
            <p className="text-sm font-medium">Total estudiantes</p>
            <p className="text-2xl font-bold">{estadisticas.total}</p>
          </div>
          <div className="p-4 border rounded-md bg-green-50 text-center">
            <p className="text-sm font-medium">Aprobados</p>
            <p className="text-2xl font-bold text-green-600">{estadisticas.aprobados}</p>
          </div>
          <div className="p-4 border rounded-md bg-red-50 text-center">
            <p className="text-sm font-medium">Desaprobados</p>
            <p className="text-2xl font-bold text-red-600">{estadisticas.desaprobados}</p>
          </div>
        </div>
      </div>

      {/* Tabla de calificaciones */}
      <div className="space-y-2 no-break-inside">
        <h3 className="font-semibold">CALIFICACIONES POR ESTUDIANTE</h3>
        <div className="rounded-md border">
          <Table className="pdf-table">
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead className="text-center">Promedio</TableHead>
                <TableHead className="text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datos.resumen && datos.resumen.estudiantes && datos.resumen.estudiantes.length > 0 ? (
                datos.resumen.estudiantes.map((estudiante, index) => {
                  // Usar el estado que ya viene en los datos formateados o calcularlo
                  const estado = estudiante.estado ?
                    { texto: estudiante.estado, clase: `bg-${estudiante.estado === "Desaprobado" ? "red" : "green"}-300` } :
                    getEstadoNota(estudiante.promedio);

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{estudiante.nombre}</TableCell>
                      <TableCell className="text-center">{parseFloat(estudiante.promedio).toFixed(1)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={estado.clase}>
                          {estado.texto}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                    No hay estudiantes registrados para este curso en el período seleccionado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Promedio general */}
      <div className="flex justify-between items-center p-4 border rounded-md bg-slate-50">
        <h3 className="font-semibold">PROMEDIO GENERAL DEL CURSO:</h3>
        <Badge className={`text-lg px-4 py-1 ${estadoPromedio.clase}`}>
          {parseFloat(promedioGeneral).toFixed(1)}
        </Badge>
      </div>

      {/* Observaciones generales */}
      <div className="space-y-2">
        <h3 className="font-semibold">OBSERVACIONES GENERALES</h3>
        <p className="text-sm p-3 border rounded-md">
          {datos.resumen?.observaciones ||
            (parseFloat(promedioGeneral) >= 11
              ? `El curso muestra un rendimiento ${estadoPromedio.texto.toLowerCase()} en este período académico.`
              : "El curso requiere atención especial para mejorar el rendimiento general.")}
        </p>
      </div>

      {/* Firmas */}
      <div className="grid grid-cols-2 gap-8 pt-10 mt-10 pdf-signatures no-break-inside">
        <div className="text-center">
          <div className="border-t pt-2 signature-line">
            <p className="font-medium">Director(a)</p>
            {datos.institucion?.director && (
              <p className="text-sm text-muted-foreground">{datos.institucion.director}</p>
            )}
          </div>
        </div>
        <div className="text-center">
          <div className="border-t pt-2 signature-line">
            <p className="font-medium">Docente</p>
            {datos.curso?.profesor?.nombre && (
              <p className="text-sm text-muted-foreground">{datos.curso.profesor.nombre}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
