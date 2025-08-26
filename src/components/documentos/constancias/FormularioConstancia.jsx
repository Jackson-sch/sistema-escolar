'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Loader2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/utils/utils';
import { 
  registrarConstancia, 
  actualizarConstancia 
} from '@/action/documentos/constanciaActions';
import { useUser } from '@/context/UserContext';
import { getStudents } from '@/action/estudiante/estudiante';
import { useInstitucion } from '@/hooks/useInstitucion';

// Esquema de validación
const constanciaSchema = z.object({
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  contenido: z.string().min(10, 'El contenido debe tener al menos 10 caracteres'),
  estudianteId: z.string().min(1, 'Debe seleccionar un estudiante'),
  tipo: z.string().min(1, 'Debe seleccionar un tipo de constancia'),
  fechaEmision: z.date({
    required_error: 'La fecha de emisión es requerida',
  }),
  fechaExpiracion: z.date().optional(),
  observaciones: z.string().optional(),
});

// Tipos de constancias disponibles
const tiposConstancia = [
  { id: 'CONSTANCIA_MATRICULA', nombre: 'Constancia de Matrícula' },
  { id: 'CONSTANCIA_VACANTE', nombre: 'Constancia de Vacante' },
  { id: 'CONSTANCIA_EGRESADO', nombre: 'Constancia de Egresado' },
];

export default function FormularioConstancia({ constancia, onSuccess, onCancel }) {
  const session = useUser();
  const { institucion } = useInstitucion();
  const [estudiantes, setEstudiantes] = useState([]);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(true);
  const [enviando, setEnviando] = useState(false);
  
  // Cargar estudiantes
  useEffect(() => {
    async function cargarEstudiantes() {
      try {
        const response = await getStudents();
        if (response.success) {
          setEstudiantes(response.data);
        } else {
          toast.error('Error al cargar estudiantes');
        }
      } catch (error) {
        console.error('Error al cargar estudiantes:', error);
        toast.error('Error al cargar estudiantes');
      } finally {
        setLoadingEstudiantes(false);
      }
    }
    
    cargarEstudiantes();
  }, []);

  // Configurar el formulario
  const form = useForm({
    resolver: zodResolver(constanciaSchema),
    defaultValues: {
      titulo: '',
      contenido: '',
      estudianteId: '',
      tipo: 'CONSTANCIA_MATRICULA',
      fechaEmision: new Date(),
      fechaExpiracion: undefined,
      observaciones: '',
    },
  });

  // Cargar datos de la constancia si está en modo edición
  useEffect(() => {
    if (constancia) {
      form.reset({
        titulo: constancia.titulo || '',
        contenido: constancia.contenido || '',
        estudianteId: constancia.estudianteId || '',
        tipo: constancia.tipo || 'CONSTANCIA_MATRICULA',
        fechaEmision: constancia.fechaEmision ? new Date(constancia.fechaEmision) : new Date(),
        fechaExpiracion: constancia.fechaExpiracion ? new Date(constancia.fechaExpiracion) : undefined,
        observaciones: constancia.observaciones || '',
      });
    } else {
      form.reset({
        titulo: '',
        contenido: '',
        estudianteId: '',
        tipo: 'CONSTANCIA_MATRICULA',
        fechaEmision: new Date(),
        fechaExpiracion: undefined,
        observaciones: '',
      });
    }
  }, [constancia, form]);

  // Manejar envío del formulario
  const onSubmit = async (data) => {
    setEnviando(true);
    try {
      let resultado;
      
      if (constancia) {
        // Actualizar constancia existente
        resultado = await actualizarConstancia(constancia.id, {
          ...data,
          emisorId: session?.user?.id,
        });
      } else {
        // Registrar nueva constancia
        resultado = await registrarConstancia({
          ...data,
          emisorId: session?.user?.id,
          institucionId: institucion?.id,
        });
      }

      if (resultado.error) {
        toast.error(resultado.error);
      } else {
        toast.success(constancia ? 'Constancia actualizada correctamente' : 'Constancia registrada correctamente');
        if (onSuccess) onSuccess(resultado.constancia);
      }
    } catch (error) {
      console.error('Error al procesar constancia:', error);
      toast.error('Error al procesar la constancia');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Título */}
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título de la Constancia</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Constancia de Estudios" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tipo de Constancia */}
        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Constancia</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tiposConstancia.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Estudiante */}
        <FormField
          control={form.control}
          name="estudianteId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estudiante</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estudiante" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loadingEstudiantes ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Cargando estudiantes...</span>
                    </div>
                  ) : (
                    estudiantes.map((estudiante) => (
                      <SelectItem key={estudiante.id} value={estudiante.id}>
                        {estudiante.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Contenido */}
        <FormField
          control={form.control}
          name="contenido"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenido</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Contenido de la constancia..." 
                  className="min-h-[150px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fecha de Emisión */}
        <FormField
          control={form.control}
          name="fechaEmision"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de Emisión</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
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
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fecha de Expiración (opcional) */}
        <FormField
          control={form.control}
          name="fechaExpiracion"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de Expiración (opcional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: es })
                      ) : (
                        <span>Sin fecha de expiración</span>
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
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Observaciones */}
        <FormField
          control={form.control}
          name="observaciones"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones (opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Observaciones adicionales..." 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botones */}
        <div className="flex justify-end gap-2">
          {constancia && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={enviando}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={enviando}>
            {enviando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {constancia ? 'Actualizando...' : 'Registrando...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {constancia ? 'Actualizar Constancia' : 'Registrar Constancia'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
