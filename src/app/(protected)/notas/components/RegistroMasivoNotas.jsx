"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  getCursosProfesor, 
  getEvaluacionesPorCurso, 
  getEstudiantesPorCurso,
  registrarNotasMasivas 
} from "@/action/notas/nota";
import { getPeriodosActivos } from "@/action/notas/nota";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Esquema de validación para el formulario de selección
const seleccionSchema = z.object({
  cursoId: z.string().min(1, "Seleccione un curso"),
  evaluacionId: z.string().min(1, "Seleccione una evaluación"),
  periodoId: z.string().min(1, "Seleccione un período académico"),
});

// Esquema de validación para las notas
const notasMasivasSchema = z.object({
  notas: z.array(
    z.object({
      estudianteId: z.string(),
      valor: z.string().refine(
        (val) => {
          const num = parseFloat(val);
          return !isNaN(num) && num >= 0 && num <= 20;
        },
        { message: "La nota debe ser un número entre 0 y 20" }
      ),
      comentario: z.string().optional(),
    })
  ),
  cursoId: z.string(),
  evaluacionId: z.string(),
  periodoId: z.string(),
});

export default function RegistroMasivoNotas({ onSuccess }) {
  const [cursos, setCursos] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
  const [notasModificadas, setNotasModificadas] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState(null);
  
  // Formulario para selección de curso y evaluación
  const seleccionForm = useForm({
    resolver: zodResolver(seleccionSchema),
    defaultValues: {
      cursoId: "",
      evaluacionId: "",
      periodoId: "",
    },
  });

  // Cargar cursos del profesor al iniciar
  useEffect(() => {
    const loadCursos = async () => {
      setLoading(true);
      try {
        const cursosData = await getCursosProfesor();
        setCursos(cursosData);
        
        const periodosData = await getPeriodosActivos();
        setPeriodos(periodosData);
      } catch (error) {
        console.error("Error al cargar cursos:", error);
        toast("Error",{
          variant: "destructive",
          description: "No se pudieron cargar los cursos. Intente nuevamente.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadCursos();
  }, [toast]);

  // Cargar evaluaciones cuando se selecciona un curso
  const handleCursoChange = async (cursoId) => {
    if (!cursoId) return;
    
    try {
      setLoading(true);
      const evaluacionesData = await getEvaluacionesPorCurso(cursoId);
      setEvaluaciones(evaluacionesData);
      seleccionForm.setValue("evaluacionId", "");
      setEstudiantes([]);
    } catch (error) {
      console.error("Error al cargar evaluaciones:", error);
      toast("Error",{
        variant: "destructive",
        description: "No se pudieron cargar las evaluaciones para este curso.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar estudiantes cuando se selecciona una evaluación
  const handleSeleccionSubmit = async (data) => {
    try {
      setLoadingEstudiantes(true);
      const estudiantesData = await getEstudiantesPorCurso(data.cursoId);
      
      // Obtener detalles de la evaluación seleccionada
      const evalSeleccionada = evaluaciones.find(e => e.id === data.evaluacionId);
      setEvaluacionSeleccionada(evalSeleccionada);
      
      // Inicializar estudiantes con notas vacías
      setEstudiantes(estudiantesData);
      
      // Inicializar el estado de notas modificadas
      const notasIniciales = {};
      estudiantesData.forEach(est => {
        notasIniciales[est.id] = { valor: "", comentario: "" };
      });
      setNotasModificadas(notasIniciales);
      
    } catch (error) {
      console.error("Error al cargar estudiantes:", error);
      toast("Error",{
        variant: "destructive",
        description: "No se pudieron cargar los estudiantes para este curso.",
      });
    } finally {
      setLoadingEstudiantes(false);
    }
  };

  // Manejar cambios en las notas
  const handleNotaChange = (estudianteId, field, value) => {
    setNotasModificadas(prev => ({
      ...prev,
      [estudianteId]: {
        ...prev[estudianteId],
        [field]: value
      }
    }));
  };

// Guardar notas masivas
const handleGuardarNotas = async () => {
  try {
    setGuardando(true);
    
    // Preparar datos para enviar
    const formData = seleccionForm.getValues();
    
    // Convertir notasModificadas a un array en el formato esperado
    const notasArray = Object.entries(notasModificadas).map(([estudianteId, datos]) => ({
      estudianteId,
      valor: datos.valor,
      comentario: datos.comentario || "",
    })).filter(nota => nota.valor.trim() !== "" || nota.valor === "0");
    
    // Validar datos antes de enviar
    const datosCompletos = {
      notas: notasArray,
      cursoId: formData.cursoId,
      evaluacionId: formData.evaluacionId,
      periodoId: formData.periodoId,
    };
    
    // Validar con Zod
    const validacion = notasMasivasSchema.safeParse(datosCompletos);
    
    if (!validacion.success) {
      console.error("Error de validación:", validacion.error);
      toast("Error de validación", {
        variant: "destructive",
        description: "Verifique que todas las notas sean valores numéricos entre 0 y 20.",
      });
      return;
    }
    
    // Si no hay notas para guardar
    if (notasArray.length === 0) {
      toast("Sin datos", {
        variant: "destructive",
        description: "No hay notas para guardar. Ingrese al menos una calificación.",
      });
      return;
    }
    
    // Enviar datos al servidor
    const resultado = await registrarNotasMasivas(datosCompletos);
    
    console.log("Resultado del servidor:", resultado); // Para debug
    
    // Verificar si hubo un error completo en la respuesta del servidor
    if (resultado.error) {
      toast("Error", {
        variant: "destructive",
        description: resultado.error,
      });
      return;
    }
    
    // Verificar si hay resultados (notas procesadas exitosamente)
    const notasExitosas = resultado.resultados ? resultado.resultados.length : 0;
    const notasConError = resultado.errores ? resultado.errores.length : 0;
    
    // Si hay notas exitosas, mostrar mensaje de éxito
    if (notasExitosas > 0) {
      toast("Éxito", {
        description: `Se han registrado ${notasExitosas} notas correctamente.`,
      });
      
      // Reiniciar formulario solo si hubo al menos una nota exitosa
      setEstudiantes([]);
      setNotasModificadas({});
      
      // Llamar a la función de éxito si existe
      if (onSuccess) onSuccess();
    }
    
    // Si hay errores en notas específicas, mostrar advertencia
    if (notasConError > 0) {
      toast("Advertencia", {
        variant: "destructive",
        description: `${notasConError} notas no pudieron ser procesadas. Revise los datos e intente nuevamente.`,
      });
    }
    
    // Si no hubo notas exitosas ni errores específicos, algo salió mal
    if (notasExitosas === 0 && notasConError === 0) {
      toast("Error", {
        variant: "destructive",
        description: "No se pudieron procesar las notas. Intente nuevamente.",
      });
    }
    
  } catch (error) {
    console.error("Error al guardar notas:", error);
    toast("Error", {
      variant: "destructive",
      description: error.message || "Error inesperado al guardar las notas.",
    });
  } finally {
    setGuardando(false);
  }
};

  // Función para validar si una nota es válida
  const esNotaValida = (valor) => {
    if (!valor) return true; // Vacío es válido (no se enviará)
    const num = parseFloat(valor);
    return !isNaN(num) && num >= 0 && num <= 20;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Registro Masivo de Notas</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selección de Curso y Evaluación</CardTitle>
          <CardDescription>
            Seleccione el curso, la evaluación y el período académico para registrar notas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...seleccionForm}>
            <form onSubmit={seleccionForm.handleSubmit(handleSeleccionSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        defaultValue={field.value}
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
                  name="evaluacionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evaluación</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={loading || !seleccionForm.getValues().cursoId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una evaluación" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {evaluaciones.map((evaluacion) => (
                            <SelectItem key={evaluacion.id} value={evaluacion.id}>
                              {evaluacion.nombre} ({evaluacion.peso}%)
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
                        defaultValue={field.value}
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
                  disabled={loading || loadingEstudiantes}
                >
                  {loadingEstudiantes ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    "Cargar Estudiantes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {estudiantes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Registro de Notas</CardTitle>
            <CardDescription>
              {evaluacionSeleccionada && (
                <div className="flex flex-col gap-1">
                  <p>Evaluación: <Badge variant="outline">{evaluacionSeleccionada.nombre}</Badge></p>
                  <p>Peso: <Badge>{evaluacionSeleccionada.peso}%</Badge></p>
                  <p>Fecha: <Badge variant="outline">{new Date(evaluacionSeleccionada.fecha).toLocaleDateString()}</Badge></p>
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">N°</TableHead>
                    <TableHead className="w-[300px]">Estudiante</TableHead>
                    <TableHead className="w-[100px]">Nota (0-20)</TableHead>
                    <TableHead>Comentario (Opcional)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estudiantes.map((estudiante, index) => (
                    <TableRow key={estudiante.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="capitalize font-medium">{estudiante.name}</TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={notasModificadas[estudiante.id]?.valor || ""}
                          onChange={(e) => handleNotaChange(estudiante.id, "valor", e.target.value)}
                          className={
                            notasModificadas[estudiante.id]?.valor && 
                            !esNotaValida(notasModificadas[estudiante.id]?.valor) 
                              ? "border-red-500" 
                              : ""
                          }
                          placeholder="0-20"
                        />
                        {notasModificadas[estudiante.id]?.valor && 
                         !esNotaValida(notasModificadas[estudiante.id]?.valor) && (
                          <p className="text-xs text-red-500 mt-1">
                            Nota inválida
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={notasModificadas[estudiante.id]?.comentario || ""}
                          onChange={(e) => handleNotaChange(estudiante.id, "comentario", e.target.value)}
                          placeholder="Comentario opcional"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleGuardarNotas}
              disabled={guardando}
            >
              {guardando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Notas
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
