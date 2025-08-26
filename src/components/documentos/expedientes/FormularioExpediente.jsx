'use client';

import { useState, useEffect } from 'react';
import { get, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Save, X } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUser } from '@/context/UserContext';
import { format } from 'date-fns';
import { registrarExpediente, actualizarExpediente } from '@/action/documento/documentoActions';
import { getStudents } from '@/action/estudiante/estudiante';

// Esquema de validación para el formulario
const expedienteSchema = z.object({
  titulo: z.string().min(3, {
    message: 'El título debe tener al menos 3 caracteres',
  }),
  descripcion: z.string().optional().nullable(),
  estudianteId: z.string({
    required_error: 'Debes seleccionar un estudiante',
  }),
  estado: z.string().default('activo'),
  contenido: z.string().min(1, {
    message: 'El contenido del expediente es obligatorio',
  }),
  archivoUrl: z.string().optional().nullable(),
});



export default function FormularioExpediente({ expediente, onSuccess, onCancel }) {
  const session = useUser();
  console.log(session.id);
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargandoEstudiantes, setCargandoEstudiantes] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [cargandoArchivo, setCargandoArchivo] = useState(false);
  const [progresoSubida, setProgresoSubida] = useState(0);

  // Configurar el formulario con valores por defecto
  const form = useForm({
    resolver: zodResolver(expedienteSchema),
    defaultValues: {
      titulo: expediente?.titulo || '',
      descripcion: expediente?.descripcion || '',
      estudianteId: expediente?.estudianteId || '',
      estado: expediente?.estado || 'activo',
      contenido: expediente?.contenido || '',
      archivoUrl: expediente?.archivoUrl || '',
    },
  });

  // Cargar estudiantes
  useEffect(() => {
    const cargarEstudiantes = async () => {
      try {
        const data = await getStudents();
        if (data && data.data && Array.isArray(data.data)) {
          setEstudiantes(data.data);
          console.log('Estudiantes cargados:', data.data.length);
        } else {
          console.error('Formato de datos de estudiantes incorrecto:', data);
          setEstudiantes([]);
        }
      } catch (error) {
        console.error('Error al cargar estudiantes:', error);
        toast('Error', {
          variant: 'destructive',
          description: 'No se pudieron cargar los estudiantes. Intente nuevamente.',
        });
        setEstudiantes([]);
      } finally {
        setCargandoEstudiantes(false);
      }
    };
    
    cargarEstudiantes();
  }, []);

  // Manejar cambio de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoSeleccionado(file);
      setNombreArchivo(file.name);
    }
  };

  // Función para subir archivo
  const subirArchivo = async (file) => {
    if (!file) return null;

    setCargandoArchivo(true);
    setProgresoSubida(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tipo', 'expediente');

      const response = await fetch('/api/documentos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir el archivo');
      }

      const data = await response.json();
      setProgresoSubida(100);
      return data.fileUrl;
    } catch (error) {
      console.error('Error al subir archivo:', error);
      toast('Error al subir archivo', {
        variant: 'destructive',
        description: 'No se pudo subir el archivo. Intente nuevamente.',
      });
      return null;
    } finally {
      setCargandoArchivo(false);
    }
  };

  // Enviar formulario
  const onSubmit = async (data) => {
    console.log('Datos del formulario:', data);
    setEnviando(true);
    try {
      // Validar campos obligatorios
      if (!data.estudianteId) {
        throw new Error('Debe seleccionar un estudiante');
      }

      // Validar que el usuario actual esté autenticado
      if (!session?.id) {
        throw new Error('No se pudo identificar al usuario actual');
      }

      // Generar código único para el expediente si es nuevo
      if (!expediente) {
        const fechaActual = format(new Date(), 'yyyyMMdd');
        const codigoAleatorio = Math.floor(1000 + Math.random() * 9000);
        data.codigo = `EXP-${fechaActual}-${codigoAleatorio}`;
      }

      // Preparar datos para enviar
      const expedienteData = {
        ...data,
        tipo: 'EXPEDIENTE',
        emisorId: session.id,
        // Asegurarse de que los campos opcionales sean null si están vacíos
        descripcion: data.descripcion || null,
        archivoUrl: data.archivoUrl || null
      };

      console.log('Datos a enviar:', expedienteData);

      // Subir archivo si se ha seleccionado uno
      if (archivoSeleccionado) {
        const fileUrl = await subirArchivo(archivoSeleccionado);
        if (fileUrl) {
          expedienteData.archivoUrl = fileUrl;
        } else {
          throw new Error('No se pudo subir el archivo');
        }
      }

      let resultado;
      if (expediente) {
        resultado = await actualizarExpediente(expediente.id, expedienteData);
      } else {
        resultado = await registrarExpediente(expedienteData);
      }

      if (resultado.success) {
        toast(expediente ? 'Expediente actualizado' : 'Expediente registrado', {
          description: expediente
            ? 'El expediente ha sido actualizado correctamente.'
            : 'El expediente ha sido registrado correctamente.',
        });

        if (onSuccess) {
          onSuccess();
        }
      } else {
        console.error('Error en la respuesta del servidor:', resultado);
        toast('Error', {
          variant: 'destructive',
          description: resultado.error || 'No se pudo procesar el expediente',
        });
      }
    } catch (error) {
      console.error('Error al procesar el expediente:', error);
      toast('Error', {
        variant: 'destructive',
        description: error.message || 'No se pudo procesar el expediente. Intente nuevamente.',
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="titulo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título del expediente*</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Expediente académico completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estudianteId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estudiante*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={cargandoEstudiantes}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estudiante" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cargandoEstudiantes ? (
                      <SelectItem value="cargando" disabled>
                        Cargando estudiantes...
                      </SelectItem>
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
        </div>

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe el propósito y contenido del expediente"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contenido"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenido del expediente*</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalla el contenido del expediente"
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Incluye información detallada sobre los documentos que componen este expediente.
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
              <FormLabel>Estado</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
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

        <div className="space-y-2">
          <FormLabel>Archivo del expediente</FormLabel>
          <div className="flex items-center gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('archivo').click()}
              className="w-full"
              disabled={cargandoArchivo}
            >
              {cargandoArchivo ? 'Subiendo...' : 'Seleccionar archivo'}
            </Button>
            <Input
              id="archivo"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              disabled={cargandoArchivo}
            />
          </div>
          {nombreArchivo && (
            <div className="text-sm text-muted-foreground mt-1">
              Archivo seleccionado: {nombreArchivo}
              {cargandoArchivo && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{ width: `${progresoSubida}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}
          {expediente?.archivoUrl && !archivoSeleccionado && (
            <div className="flex items-center gap-2 mt-2">
              <div className="text-sm text-muted-foreground">
                Archivo actual:{' '}
                <a
                  href={expediente.archivoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-1"
                >
                  Ver archivo
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={enviando}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit" disabled={enviando}>
            {enviando ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {expediente ? 'Actualizando...' : 'Registrando...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {expediente ? 'Actualizar expediente' : 'Registrar expediente'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
