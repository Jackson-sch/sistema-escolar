"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { useInstitucion } from "@/hooks/useInstitucion";
import { registrarEvento, actualizarEvento } from "@/action/eventos/eventoActions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon, Clock, MapPin, Users, School, Tag } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";

// Esquema de validación
const eventoSchema = z.object({
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  descripcion: z.string().optional().nullable(),
  imagen: z.string().optional().nullable(),
  fechaInicio: z.date({
    required_error: "La fecha de inicio es requerida",
  }),
  fechaFin: z.date({
    required_error: "La fecha de fin es requerida",
  }),
  horaInicio: z.string().optional().nullable(),
  horaFin: z.string().optional().nullable(),
  fechaLimiteInscripcion: z.date().optional().nullable(),
  ubicacion: z.string().optional().nullable(),
  aula: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  modalidad: z.string().optional().nullable(),
  enlaceVirtual: z.string().optional().nullable(),
  tipo: z.string({
    required_error: "El tipo de evento es requerido",
  }),
  categoria: z.string().optional().nullable(),
  publico: z.boolean().default(true),
  dirigidoA: z.string().optional().nullable(),
  niveles: z.array(z.string()).optional(),
  grados: z.array(z.string()).optional(),
  capacidadMaxima: z.number().optional().nullable(),
  requiereInscripcion: z.boolean().default(false),
  estado: z.string().default("programado"),
}).refine(data => {
  // Validar que la fecha de fin sea posterior a la fecha de inicio
  return data.fechaFin >= data.fechaInicio;
}, {
  message: "La fecha de fin debe ser posterior o igual a la fecha de inicio",
  path: ["fechaFin"],
});

export default function FormularioEvento({ evento, userId, onSuccess }) {
  const { institucion, niveles, grados } = useInstitucion();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  
  // Opciones para selects
  const tiposEvento = [
    { value: "academico", label: "Académico" },
    { value: "deportivo", label: "Deportivo" },
    { value: "cultural", label: "Cultural" },
    { value: "administrativo", label: "Administrativo" },
    { value: "social", label: "Social" },
  ];
  
  const modalidades = [
    { value: "presencial", label: "Presencial" },
    { value: "virtual", label: "Virtual" },
    { value: "hibrido", label: "Híbrido" },
  ];
  
  // Configurar formulario
  const form = useForm({
    resolver: zodResolver(eventoSchema),
    defaultValues: {
      titulo: evento?.titulo || "",
      descripcion: evento?.descripcion || "",
      imagen: evento?.imagen || "",
      fechaInicio: evento?.fechaInicio ? new Date(evento.fechaInicio) : new Date(),
      fechaFin: evento?.fechaFin ? new Date(evento.fechaFin) : new Date(),
      horaInicio: evento?.horaInicio || "",
      horaFin: evento?.horaFin || "",
      fechaLimiteInscripcion: evento?.fechaLimiteInscripcion ? new Date(evento.fechaLimiteInscripcion) : null,
      ubicacion: evento?.ubicacion || "",
      aula: evento?.aula || "",
      direccion: evento?.direccion || "",
      modalidad: evento?.modalidad || "presencial",
      enlaceVirtual: evento?.enlaceVirtual || "",
      tipo: evento?.tipo || "academico",
      categoria: evento?.categoria || "",
      publico: evento?.publico !== undefined ? evento.publico : true,
      dirigidoA: evento?.dirigidoA || "",
      niveles: evento?.niveles?.map(nivel => nivel.id) || [],
      grados: evento?.grados?.map(grado => grado.id) || [],
      capacidadMaxima: evento?.capacidadMaxima || null,
      requiereInscripcion: evento?.requiereInscripcion !== undefined ? evento.requiereInscripcion : false,
      estado: evento?.estado || "programado",
    },
  });
  
  // Manejar envío del formulario
  const onSubmit = async (data) => {
    if (!userId) {
      toast.error("No se pudo identificar al usuario");
      return;
    }
    
    setLoading(true);
    
    try {
      // Asegurar que los booleanos sean booleanos
      const formData = {
        ...data,
        publico: Boolean(data.publico),
        requiereInscripcion: Boolean(data.requiereInscripcion),
        organizadorId: userId
      };
      
      let resultado;
      
      if (evento) {
        // Actualizar evento existente
        resultado = await actualizarEvento(evento.id, formData);
      } else {
        // Crear nuevo evento
        resultado = await registrarEvento(formData);
      }
      
      if (resultado.success) {
        toast.success(evento ? "Evento actualizado correctamente" : "Evento creado correctamente");
        if (onSuccess) onSuccess(resultado.evento);
        if (!evento) form.reset(); // Limpiar formulario solo si es creación
      } else {
        toast.error(resultado.error || "Error al procesar el evento");
      }
    } catch (error) {
      console.error("Error al procesar evento:", error);
      toast.error("Error al procesar el evento");
    } finally {
      setLoading(false);
    }
  };
  
  // Opciones para niveles y grados
  const nivelesOptions = niveles?.map(nivel => ({
    value: nivel.id,
    label: nivel.nombre
  })) || [];
  
  const gradosOptions = grados?.map(grado => ({
    value: grado.id,
    label: grado.nombre
  })) || [];
  
  // Efecto para actualizar campos dependientes
  useEffect(() => {
    const modalidad = form.watch("modalidad");
    const requiereInscripcion = form.watch("requiereInscripcion");
    
    // Si la modalidad es virtual, limpiar campos de ubicación física
    if (modalidad === "virtual") {
      form.setValue("ubicacion", "");
      form.setValue("aula", "");
      form.setValue("direccion", "");
    }
    
    // Si la modalidad es presencial, limpiar enlace virtual
    if (modalidad === "presencial") {
      form.setValue("enlaceVirtual", "");
    }
    
    // Si no requiere inscripción, limpiar campos relacionados
    if (!requiereInscripcion) {
      form.setValue("fechaLimiteInscripcion", null);
      form.setValue("capacidadMaxima", null);
    }
  }, [form.watch("modalidad"), form.watch("requiereInscripcion")]);
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        {evento ? "Editar evento" : "Crear nuevo evento"}
      </h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="general">Información General</TabsTrigger>
              <TabsTrigger value="ubicacion">Ubicación y Horario</TabsTrigger>
              <TabsTrigger value="audiencia">Audiencia y Configuración</TabsTrigger>
            </TabsList>
            
            {/* Pestaña de información general */}
            <TabsContent value="general">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="titulo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título del evento *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ingrese el título del evento" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="descripcion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describa el evento" 
                              className="min-h-[120px]" 
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="tipo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de evento *</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione el tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {tiposEvento.map((tipo) => (
                                  <SelectItem key={tipo.value} value={tipo.value}>
                                    {tipo.label}
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
                        name="categoria"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoría</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ej: Taller, Conferencia, Reunión" 
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="imagen"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL de imagen</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="URL de la imagen del evento" 
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Ingrese la URL de una imagen para el evento
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado del evento</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione el estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="programado">Programado</SelectItem>
                              <SelectItem value="en_curso">En curso</SelectItem>
                              <SelectItem value="finalizado">Finalizado</SelectItem>
                              <SelectItem value="cancelado">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Pestaña de ubicación y horario */}
            <TabsContent value="ubicacion">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fechaInicio"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Fecha de inicio *</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className="w-full pl-3 text-left font-normal"
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP", { locale: es })
                                    ) : (
                                      <span>Seleccionar fecha</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="fechaFin"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Fecha de fin *</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className="w-full pl-3 text-left font-normal"
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP", { locale: es })
                                    ) : (
                                      <span>Seleccionar fecha</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < form.getValues("fechaInicio")}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="horaInicio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hora de inicio</FormLabel>
                            <FormControl>
                              <Input 
                                type="time" 
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="horaFin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hora de fin</FormLabel>
                            <FormControl>
                              <Input 
                                type="time" 
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="modalidad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modalidad</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value || "presencial"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione la modalidad" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {modalidades.map((modalidad) => (
                                <SelectItem key={modalidad.value} value={modalidad.value}>
                                  {modalidad.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {(form.watch("modalidad") === "presencial" || form.watch("modalidad") === "hibrido") && (
                      <>
                        <FormField
                          control={form.control}
                          name="ubicacion"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ubicación</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ej: Auditorio principal" 
                                  {...field} 
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="aula"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Aula/Salón</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Ej: A-101" 
                                    {...field} 
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="direccion"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Dirección</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Dirección completa" 
                                    {...field} 
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </>
                    )}
                    
                    {(form.watch("modalidad") === "virtual" || form.watch("modalidad") === "hibrido") && (
                      <FormField
                        control={form.control}
                        name="enlaceVirtual"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enlace virtual</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="URL de la reunión virtual" 
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Pestaña de audiencia y configuración */}
            <TabsContent value="audiencia">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="publico"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Evento público</FormLabel>
                            <FormDescription>
                              Si está marcado, el evento será visible para todos los usuarios
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dirigidoA"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dirigido a</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: Estudiantes, Padres, Profesores" 
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Especifique a qué público está dirigido el evento
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="niveles"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Niveles académicos</FormLabel>
                            <FormControl>
                              <MultiSelect
                                options={nivelesOptions}
                                selected={field.value || []}
                                onChange={field.onChange}
                                placeholder="Seleccione niveles"
                              />
                            </FormControl>
                            <FormDescription>
                              Seleccione los niveles académicos a los que está dirigido
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="grados"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grados</FormLabel>
                            <FormControl>
                              <MultiSelect
                                options={gradosOptions}
                                selected={field.value || []}
                                onChange={field.onChange}
                                placeholder="Seleccione grados"
                              />
                            </FormControl>
                            <FormDescription>
                              Seleccione los grados a los que está dirigido
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="requiereInscripcion"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Requiere inscripción</FormLabel>
                            <FormDescription>
                              Si está marcado, los participantes deberán inscribirse para asistir
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {form.watch("requiereInscripcion") && (
                      <>
                        <FormField
                          control={form.control}
                          name="fechaLimiteInscripcion"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Fecha límite de inscripción</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className="w-full pl-3 text-left font-normal"
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP", { locale: es })
                                      ) : (
                                        <span>Seleccionar fecha</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date > form.getValues("fechaInicio")}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="capacidadMaxima"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Capacidad máxima</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Número máximo de participantes" 
                                  {...field} 
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                />
                              </FormControl>
                              <FormDescription>
                                Deje en blanco si no hay límite de participantes
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onSuccess()}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? "Guardando..." : evento ? "Actualizar evento" : "Crear evento"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
