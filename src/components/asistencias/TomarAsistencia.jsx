"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useInstitucionContext } from "@/providers/institucion-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CalendarIcon, Clock, Users, Save, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { obtenerEstudiantesCurso, registrarAsistenciasMasivas } from "@/action/asistencias/asistencia-actions";
import { getCursos } from "@/action/cursos/curso";
import { useUser } from "@/context/UserContext";

const ESTADOS_ASISTENCIA = [
  { value: "presente", label: "Presente", color: "bg-green-500" },
  { value: "ausente", label: "Ausente", color: "bg-red-500" },
  { value: "tardanza", label: "Tardanza", color: "bg-yellow-500" },
  { value: "justificado", label: "Justificado", color: "bg-blue-500" },
];

export default function TomarAsistencia() {
  const session = useUser();
  console.log("Session:", session);
  const { institucion } = useInstitucionContext();

  const [cursos, setCursos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [asistencias, setAsistencias] = useState({});
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [fecha, setFecha] = useState(format(new Date(), "yyyy-MM-dd"));
  const [horaActual, setHoraActual] = useState("");
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  console.log("Cursos", cursos)

  // Actualizar hora cada minuto
  useEffect(() => {
    const actualizarHora = () => {
      setHoraActual(format(new Date(), "HH:mm"));
    };

    actualizarHora();
    const interval = setInterval(actualizarHora, 60000);

    return () => clearInterval(interval);
  }, []);

  // Cargar cursos del profesor
  useEffect(() => {
    const cargarCursos = async () => {
      console.log("Session:", session);
      console.log("Institución:", institucion);

      if (!session?.user?.id || !institucion?.id) {
        console.log("Falta session.user.id o institucion.id");
        return;
      }

      try {
        console.log("Llamando a getCursos con:", {
          profesorId: session.id,
          institucionId: institucion.id,
        });

        const resultado = await getCursos({
          profesorId: session.id,
          institucionId: institucion.id,
        });

        console.log("Respuesta de getCursos:", resultado);

        if (resultado.success) {
          console.log("Cursos obtenidos:", resultado.data);
          setCursos(resultado.data);
        } else {
          console.log("Error en getCursos:", resultado.error);
        }
      } catch (error) {
        console.error("Error al cargar cursos:", error);
        toast.error("Error al cargar los cursos");
      }
    };

    cargarCursos();
  }, [session?.id, institucion?.id]);

  // Cargar estudiantes del curso seleccionado
  useEffect(() => {
    const cargarEstudiantes = async () => {
      if (!cursoSeleccionado) {
        setEstudiantes([]);
        setAsistencias({});
        return;
      }

      setLoading(true);
      try {
        const resultado = await obtenerEstudiantesCurso(cursoSeleccionado);

        if (resultado.success) {
          setEstudiantes(resultado.data);

          // Inicializar asistencias con estado "presente" por defecto
          const asistenciasIniciales = {};
          resultado.data.forEach(estudiante => {
            asistenciasIniciales[estudiante.id] = {
              estado: "presente",
              horaLlegada: "",
              observaciones: "",
            };
          });
          setAsistencias(asistenciasIniciales);
        } else {
          toast.error(resultado.error || "Error al cargar estudiantes");
        }
      } catch (error) {
        console.error("Error al cargar estudiantes:", error);
        toast.error("Error al cargar los estudiantes");
      } finally {
        setLoading(false);
      }
    };

    cargarEstudiantes();
  }, [cursoSeleccionado]);

  const actualizarAsistencia = (estudianteId, campo, valor) => {
    setAsistencias(prev => ({
      ...prev,
      [estudianteId]: {
        ...prev[estudianteId],
        [campo]: valor,
      },
    }));
  };

  const marcarTodos = (estado) => {
    const nuevasAsistencias = { ...asistencias };
    estudiantes.forEach(estudiante => {
      nuevasAsistencias[estudiante.id] = {
        ...nuevasAsistencias[estudiante.id],
        estado,
      };
    });
    setAsistencias(nuevasAsistencias);
    toast.success(`Todos los estudiantes marcados como ${estado}`);
  };

  const guardarAsistencias = async () => {
    if (!cursoSeleccionado) {
      toast.error("Selecciona un curso");
      return;
    }

    if (estudiantes.length === 0) {
      toast.error("No hay estudiantes en este curso");
      return;
    }

    setGuardando(true);
    try {
      // Asegurarse de que los valores nulos se conviertan a strings vacíos para cumplir con el esquema
      const asistenciasArray = estudiantes.map(estudiante => ({
        estudianteId: estudiante.id,
        estado: asistencias[estudiante.id]?.estado || "presente",
        horaLlegada: asistencias[estudiante.id]?.horaLlegada || "",
        observaciones: asistencias[estudiante.id]?.observaciones || "",
      }));

      console.log("Enviando datos de asistencia:", {
        cursoId: cursoSeleccionado,
        fecha: fecha,
        asistencias: asistenciasArray
      });

      const resultado = await registrarAsistenciasMasivas(
        {
          cursoId: cursoSeleccionado,
          fecha: fecha,
          asistencias: asistenciasArray,
        },
        session.user.id
      );

      if (resultado.success) {
        toast.success("Asistencias guardadas correctamente");
      } else {
        console.error("Error al guardar asistencias:", resultado.details || resultado.error);
        toast.error(resultado.error || "Error al guardar asistencias");
      }
    } catch (error) {
      console.error("Error al guardar asistencias:", error);
      toast.error("Error al guardar las asistencias");
    } finally {
      setGuardando(false);
    }
  };

  const obtenerEstadoColor = (estado) => {
    return ESTADOS_ASISTENCIA.find(e => e.value === estado)?.color || "bg-gray-500";
  };

  const contarPorEstado = (estado) => {
    return Object.values(asistencias).filter(a => a.estado === estado).length;
  };

  return (
    <div className="space-y-6">
      {/* Controles superiores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="curso">Curso</Label>
          <Select value={cursoSeleccionado} onValueChange={setCursoSeleccionado}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un curso" />
            </SelectTrigger>
            <SelectContent>
              {cursos.map((curso) => (
                <SelectItem key={curso.id} value={curso.id}>
                  {curso.nombre} - {curso.codigo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fecha">Fecha</Label>
          <Input
            id="fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Hora Actual</Label>
          <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
            <Clock className="h-4 w-4" />
            <span className="font-mono">{horaActual}</span>
          </div>
        </div>
      </div>

      {/* Información del curso y estadísticas */}
      {cursoSeleccionado && estudiantes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Lista de Asistencia
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {estudiantes.length} estudiantes
                </Badge>
                <Badge variant="outline">
                  {format(new Date(fecha), "dd 'de' MMMM, yyyy", { locale: es })}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Botones de acción rápida */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => marcarTodos("presente")}
                className="text-green-600 hover:text-green-700"
              >
                Marcar Todos Presentes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => marcarTodos("ausente")}
                className="text-red-600 hover:text-red-700"
              >
                Marcar Todos Ausentes
              </Button>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {ESTADOS_ASISTENCIA.map((estado) => (
                <div key={estado.value} className="text-center">
                  <div className={`w-8 h-8 rounded-full ${estado.color} mx-auto mb-1`} />
                  <div className="text-sm font-medium">{estado.label}</div>
                  <div className="text-lg font-bold">{contarPorEstado(estado.value)}</div>
                </div>
              ))}
            </div>

            <Separator className="mb-6" />

            {/* Lista de estudiantes */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Cargando estudiantes...</span>
                </div>
              ) : (
                estudiantes.map((estudiante) => (
                  <div key={estudiante.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={estudiante.image} />
                          <AvatarFallback>
                            {estudiante.name?.charAt(0) || estudiante.apellidoPaterno?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {estudiante.apellidoPaterno} {estudiante.apellidoMaterno} {estudiante.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Código: {estudiante.codigoEstudiante}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {ESTADOS_ASISTENCIA.map((estado) => (
                          <Button
                            key={estado.value}
                            variant={asistencias[estudiante.id]?.estado === estado.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => actualizarAsistencia(estudiante.id, "estado", estado.value)}
                            className={asistencias[estudiante.id]?.estado === estado.value ?
                              `${estado.color} text-white hover:opacity-80` : ""
                            }
                          >
                            {estado.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Campos adicionales para tardanza */}
                    {asistencias[estudiante.id]?.estado === "tardanza" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        <div>
                          <Label htmlFor={`hora-${estudiante.id}`}>Hora de llegada</Label>
                          <Input
                            id={`hora-${estudiante.id}`}
                            type="time"
                            value={asistencias[estudiante.id]?.horaLlegada || ""}
                            onChange={(e) => actualizarAsistencia(estudiante.id, "horaLlegada", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`obs-${estudiante.id}`}>Observaciones</Label>
                          <Input
                            id={`obs-${estudiante.id}`}
                            placeholder="Motivo de la tardanza..."
                            value={asistencias[estudiante.id]?.observaciones || ""}
                            onChange={(e) => actualizarAsistencia(estudiante.id, "observaciones", e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Campo de observaciones para ausentes */}
                    {asistencias[estudiante.id]?.estado === "ausente" && (
                      <div className="mt-3">
                        <Label htmlFor={`obs-${estudiante.id}`}>Observaciones</Label>
                        <Input
                          id={`obs-${estudiante.id}`}
                          placeholder="Motivo de la ausencia (opcional)..."
                          value={asistencias[estudiante.id]?.observaciones || ""}
                          onChange={(e) => actualizarAsistencia(estudiante.id, "observaciones", e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Botón de guardar */}
            {estudiantes.length > 0 && (
              <div className="flex justify-end mt-6">
                <Button
                  onClick={guardarAsistencias}
                  disabled={guardando}
                  size="lg"
                  className="min-w-[150px]"
                >
                  {guardando ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Asistencias
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mensaje cuando no hay curso seleccionado */}
      {!cursoSeleccionado && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Selecciona un curso</h3>
            <p className="text-muted-foreground">
              Elige un curso de la lista para comenzar a tomar asistencia
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
