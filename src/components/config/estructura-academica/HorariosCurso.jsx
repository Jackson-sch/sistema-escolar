"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Clock } from "lucide-react";
import { getHorariosCurso, createHorario, deleteHorario } from "@/action/config/estructura-academica-action";

// Esquema de validación
const horarioSchema = z.object({
  dia: z.enum(["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"], {
    required_error: "El día es requerido",
  }),
  horaInicio: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Formato de hora inválido (HH:MM)",
  }),
  horaFin: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Formato de hora inválido (HH:MM)",
  }),
  cursoId: z.string({
    required_error: "El curso es requerido",
  }),
});

export function HorariosCurso({ curso, onSuccess }) {
  const [horarios, setHorarios] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState(null);

  // Configurar el formulario
  const form = useForm({
    resolver: zodResolver(horarioSchema),
    defaultValues: {
      dia: "LUNES",
      horaInicio: "08:00",
      horaFin: "09:00",
      cursoId: curso?.id || "",
    },
  });

  // Cargar horarios
  const loadHorarios = async () => {
    if (!curso?.id) return;
    
    setIsLoading(true);
    try {
      const response = await getHorariosCurso(curso.id);
      if (response.success) {
        setHorarios(response.data);
      } else {
        toast.error(response.error || "Error al cargar los horarios");
      }
    } catch (error) {
      console.error("Error al cargar horarios:", error);
      toast.error("Error al cargar los horarios");
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadHorarios();
  }, [curso?.id]);

  // Enviar el formulario
  const onSubmit = async (data) => {
    if (!curso?.id) {
      toast.error("No se ha seleccionado un curso");
      return;
    }

    // Validar que hora fin sea mayor que hora inicio
    const horaInicio = data.horaInicio.split(':').map(Number);
    const horaFin = data.horaFin.split(':').map(Number);
    
    const inicioMinutos = horaInicio[0] * 60 + horaInicio[1];
    const finMinutos = horaFin[0] * 60 + horaFin[1];
    
    if (finMinutos <= inicioMinutos) {
      toast.error("La hora de fin debe ser posterior a la hora de inicio");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createHorario({
        ...data,
        cursoId: curso.id
      });

      if (response.success) {
        toast.success("Horario creado correctamente");
        loadHorarios();
        form.reset({
          dia: "LUNES",
          horaInicio: "08:00",
          horaFin: "09:00",
          cursoId: curso.id,
        });
        if (onSuccess) onSuccess(response.data);
      } else {
        toast.error(response.error || "Error al guardar el horario");
      }
    } catch (error) {
      console.error("Error al guardar horario:", error);
      toast.error("Error al guardar el horario");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar la eliminación de un horario
  const handleDelete = async () => {
    if (!selectedHorario) return;
    
    try {
      const response = await deleteHorario(selectedHorario.id);
      if (response.success) {
        toast.success("Horario eliminado correctamente");
        loadHorarios();
        if (onSuccess) onSuccess();
      } else {
        toast.error(response.error || "Error al eliminar el horario");
      }
    } catch (error) {
      console.error("Error al eliminar horario:", error);
      toast.error("Error al eliminar el horario");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedHorario(null);
    }
  };

  // Formatear día para mostrar
  const formatDia = (dia) => {
    const diaMap = {
      LUNES: "Lunes",
      MARTES: "Martes",
      MIERCOLES: "Miércoles",
      JUEVES: "Jueves",
      VIERNES: "Viernes",
      SABADO: "Sábado",
      DOMINGO: "Domingo"
    };
    
    return diaMap[dia] || dia;
  };

  // Generar opciones de horas
  const getHorasOptions = () => {
    const horas = [];
    for (let i = 7; i <= 22; i++) {
      for (let j = 0; j < 60; j += 15) {
        const hora = `${i.toString().padStart(2, '0')}:${j.toString().padStart(2, '0')}`;
        horas.push(hora);
      }
    }
    return horas;
  };

  // Obtener color según el día
  const getDiaColor = (dia) => {
    const colorMap = {
      LUNES: "bg-blue-500",
      MARTES: "bg-green-500",
      MIERCOLES: "bg-purple-500",
      JUEVES: "bg-orange-500",
      VIERNES: "bg-pink-500",
      SABADO: "bg-indigo-500",
      DOMINGO: "bg-red-500"
    };
    
    return colorMap[dia] || "bg-gray-500";
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Día</TableHead>
              <TableHead>Hora Inicio</TableHead>
              <TableHead>Hora Fin</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {horarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  {isLoading ? "Cargando horarios..." : "No hay horarios registrados"}
                </TableCell>
              </TableRow>
            ) : (
              horarios.map((horario) => {
                // Calcular duración en minutos
                const horaInicio = horario.horaInicio.split(':').map(Number);
                const horaFin = horario.horaFin.split(':').map(Number);
                
                const inicioMinutos = horaInicio[0] * 60 + horaInicio[1];
                const finMinutos = horaFin[0] * 60 + horaFin[1];
                
                const duracionMinutos = finMinutos - inicioMinutos;
                const horas = Math.floor(duracionMinutos / 60);
                const minutos = duracionMinutos % 60;
                
                const duracionTexto = `${horas > 0 ? `${horas}h ` : ''}${minutos > 0 ? `${minutos}min` : ''}`;
                
                return (
                  <TableRow key={horario.id}>
                    <TableCell>
                      <Badge 
                        className={getDiaColor(horario.dia)}
                        variant="secondary"
                      >
                        {formatDia(horario.dia)}
                      </Badge>
                    </TableCell>
                    <TableCell>{horario.horaInicio}</TableCell>
                    <TableCell>{horario.horaFin}</TableCell>
                    <TableCell>{duracionTexto}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedHorario(horario);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="border rounded-md p-4">
        <h3 className="text-lg font-medium mb-4">Agregar Horario</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="dia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Día</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un día" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LUNES">Lunes</SelectItem>
                        <SelectItem value="MARTES">Martes</SelectItem>
                        <SelectItem value="MIERCOLES">Miércoles</SelectItem>
                        <SelectItem value="JUEVES">Jueves</SelectItem>
                        <SelectItem value="VIERNES">Viernes</SelectItem>
                        <SelectItem value="SABADO">Sábado</SelectItem>
                        <SelectItem value="DOMINGO">Domingo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="horaInicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora Inicio</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione hora inicio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getHorasOptions().map(hora => (
                          <SelectItem key={`inicio-${hora}`} value={hora}>
                            {hora}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="horaFin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora Fin</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione hora fin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getHorasOptions().map(hora => (
                          <SelectItem key={`fin-${hora}`} value={hora}>
                            {hora}
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
              <Button type="submit" disabled={isSubmitting}>
                <Plus className="h-4 w-4 mr-1" />
                {isSubmitting ? "Agregando..." : "Agregar Horario"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el horario seleccionado. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
