'use client';

import { useState, useEffect } from 'react';
import { get, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registrarCertificado, actualizarCertificado } from '@/action/documentos/certificadoActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { cn } from '@/utils/utils';
import { getStudents } from '@/action/estudiante/estudiante';

// Esquema de validación
const certificadoSchema = z.object({
  titulo: z.string().min(3, { message: 'El título debe tener al menos 3 caracteres' }),
  descripcion: z.string().optional(),
  contenido: z.string().min(10, { message: 'El contenido debe tener al menos 10 caracteres' }),
  formato: z.string().default('PDF'),
  plantilla: z.string().optional(),
  codigo: z.string().min(3, { message: 'El código debe tener al menos 3 caracteres' }),
  fechaExpiracion: z.date().optional(),
  estudianteId: z.string().optional(),
  estado: z.string().default('activo'),
  datosAdicionales: z.any().optional(),
});

export default function FormularioCertificado({ certificado, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [estudiantes, setEstudiantes] = useState([]);
  const isEditing = !!certificado;

  // Configurar formulario con valores predeterminados
  const form = useForm({
    resolver: zodResolver(certificadoSchema),
    defaultValues: {
      titulo: certificado?.titulo || '',
      descripcion: certificado?.descripcion || '',
      contenido: certificado?.contenido || '',
      formato: certificado?.formato || 'PDF',
      plantilla: certificado?.plantilla || '',
      codigo: certificado?.codigo || `CERT-${Date.now().toString().slice(-6)}`,
      fechaExpiracion: certificado?.fechaExpiracion ? new Date(certificado.fechaExpiracion) : undefined,
      estudianteId: certificado?.estudianteId || '',
      estado: certificado?.estado || 'activo',
      datosAdicionales: certificado?.datosAdicionales || {},
    },
  });

  // Cargar estudiantes para el selector
  useEffect(() => {
    const fetchEstudiantes = async () => {
      try {
        const estudiantesData = await getStudents();
        setEstudiantes(estudiantesData.data);
      } catch (error) {
        console.error('Error al cargar estudiantes:', error);
        toast.error('Error al cargar la lista de estudiantes');
      }
    };

    fetchEstudiantes();
  }, []);

  // Manejar envío del formulario
  const onSubmit = async (data) => {
    console.log(data);
    try {
      setLoading(true);

      const result = isEditing
        ? await actualizarCertificado(certificado.id, data)
        : await registrarCertificado(data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        isEditing
          ? 'Certificado actualizado correctamente'
          : 'Certificado registrado correctamente'
      );

      if (onSuccess) {
        onSuccess(result.certificado);
      }
    } catch (error) {
      console.error('Error al guardar certificado:', error);
      toast.error('Error al guardar el certificado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Código */}
          <FormField
            control={form.control}
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código del certificado*</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: CERT-123456"
                    {...field}
                    disabled={isEditing}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Título */}
          <FormField
            control={form.control}
            name="titulo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título*</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Certificado de Estudios"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Descripción */}
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input
                  placeholder="Breve descripción del certificado"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
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
              <FormLabel>Contenido*</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Contenido del certificado"
                  {...field}
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estudiante" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="placeholder">Sin estudiante asignado</SelectItem>
                    {estudiantes.map((estudiante) => (
                      <SelectItem key={estudiante.id} value={estudiante.id}>
                        {estudiante.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Formato */}
          <FormField
            control={form.control}
            name="formato"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Formato</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar formato" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="DOCX">DOCX</SelectItem>
                    <SelectItem value="HTML">HTML</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fecha de expiración */}
          <FormField
            control={form.control}
            name="fechaExpiracion"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de expiración</FormLabel>
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

          {/* Estado */}
          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                    <SelectItem value="borrador">Borrador</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Plantilla */}
        <FormField
          control={form.control}
          name="plantilla"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plantilla</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ruta a la plantilla (opcional)"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botones de acción */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Actualizar' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
