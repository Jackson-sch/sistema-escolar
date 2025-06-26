"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { createInstitucion, updateInstitucion } from "@/action/config/institucion-action";
import { MultiSelect } from "@/components/ui/multi-select";

// Opciones para los campos de selección
const tiposGestion = [
  { value: "PUBLICA", label: "Pública" },
  { value: "PRIVADA", label: "Privada" },
  { value: "CONVENIO", label: "Convenio" },
];

const modalidades = [
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "SEMIPRESENCIAL", label: "Semipresencial" },
  { value: "DISTANCIA", label: "A distancia" },
];

const nivelesEducativos = [
  { value: "INICIAL", label: "Inicial" },
  { value: "PRIMARIA", label: "Primaria" },
  { value: "SECUNDARIA", label: "Secundaria" },
];

// Esquema de validación base
const baseSchema = {
  nombreInstitucion: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  nombreComercial: z.string().optional().nullable(),
  codigoModular: z.string().min(5, { message: "El código modular debe tener al menos 5 caracteres" }),
  tipoGestion: z.string({ required_error: "Seleccione el tipo de gestión" }),
  modalidad: z.string({ required_error: "Seleccione la modalidad" }),
  niveles: z.array(z.string()).min(1, { message: "Seleccione al menos un nivel educativo" }),
  ugel: z.string().min(1, { message: "Ingrese la UGEL" }),
  dre: z.string().min(1, { message: "Ingrese la DRE" }),
  ubigeo: z.string().min(6, { message: "El ubigeo debe tener 6 dígitos" }).max(6),
  direccion: z.string().min(5, { message: "Ingrese una dirección válida" }),
  distrito: z.string().min(2, { message: "Ingrese el distrito" }),
  provincia: z.string().min(2, { message: "Ingrese la provincia" }),
  departamento: z.string().min(2, { message: "Ingrese el departamento" }),
  telefono: z.string().optional().nullable().or(z.literal("")),
  email: z.string().email({ message: "Ingrese un email válido" }).optional().nullable().or(z.literal("")),
  sitioWeb: z.string().url({ message: "Ingrese una URL válida" }).optional().nullable().or(z.literal("")),
  resolucionCreacion: z.string().optional().nullable().or(z.literal("")),
  fechaCreacion: z.date().optional().nullable(),
  resolucionActual: z.string().optional().nullable().or(z.literal("")),
  logo: z.string().optional().nullable().or(z.literal("")),
  cicloEscolarActual: z.number().int().min(2020).max(2050),
  fechaInicioClases: z.date(),
  fechaFinClases: z.date(),
};

// Crear esquema completo
const formSchema = z.object(baseSchema);

// Esquemas por sección
const schemaSecciones = {
  general: z.object({
    nombreInstitucion: baseSchema.nombreInstitucion,
    nombreComercial: baseSchema.nombreComercial,
    codigoModular: baseSchema.codigoModular,
    tipoGestion: baseSchema.tipoGestion,
    modalidad: baseSchema.modalidad,
    niveles: baseSchema.niveles,
  }),
  contacto: z.object({
    direccion: baseSchema.direccion,
    distrito: baseSchema.distrito,
    provincia: baseSchema.provincia,
    departamento: baseSchema.departamento,
    ubigeo: baseSchema.ubigeo,
    ugel: baseSchema.ugel,
    dre: baseSchema.dre,
    telefono: baseSchema.telefono,
    email: baseSchema.email,
    sitioWeb: baseSchema.sitioWeb,
  }),
  academico: z.object({
    cicloEscolarActual: baseSchema.cicloEscolarActual,
    fechaInicioClases: baseSchema.fechaInicioClases,
    fechaFinClases: baseSchema.fechaFinClases,
  }),
  documentos: z.object({
    resolucionCreacion: baseSchema.resolucionCreacion,
    fechaCreacion: baseSchema.fechaCreacion,
    resolucionActual: baseSchema.resolucionActual,
    logo: baseSchema.logo,
  }),
};

export function InstitucionForm({ institucion, seccion }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Determinar el esquema de validación según la sección
  const schema = seccion ? schemaSecciones[seccion] : formSchema;
  
  // Valores por defecto para el formulario
  const defaultValues = institucion 
    ? {
        ...institucion,
        // Extraer solo los nombres de los niveles si existen
        niveles: institucion.niveles && Array.isArray(institucion.niveles) 
          ? institucion.niveles.map(nivel => nivel.nombre) 
          : [],
        // Asegurar que los campos de texto no sean null
        nombreComercial: institucion.nombreComercial || "",
        telefono: institucion.telefono || "",
        email: institucion.email || "",
        sitioWeb: institucion.sitioWeb || "",
        resolucionCreacion: institucion.resolucionCreacion || "",
        resolucionActual: institucion.resolucionActual || "",
        logo: institucion.logo || "",
        // Convertir fechas
        fechaCreacion: institucion.fechaCreacion ? new Date(institucion.fechaCreacion) : undefined,
        fechaInicioClases: institucion.fechaInicioClases ? new Date(institucion.fechaInicioClases) : undefined,
        fechaFinClases: institucion.fechaFinClases ? new Date(institucion.fechaFinClases) : undefined,
      }
    : {
        tipoGestion: "PUBLICA",
        modalidad: "PRESENCIAL",
        niveles: [],
        cicloEscolarActual: new Date().getFullYear(),
        fechaInicioClases: new Date(),
        fechaFinClases: new Date(),
        // Inicializar campos opcionales como cadenas vacías
        nombreComercial: "",
        telefono: "",
        email: "",
        sitioWeb: "",
        resolucionCreacion: "",
        resolucionActual: "",
        logo: ""
      };
  
  // Inicializar el formulario con el esquema y valores por defecto
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: seccion ? 
      Object.keys(schema.shape).reduce((obj, key) => {
        // Asegurar que los campos de texto no sean null
        if (defaultValues[key] === null && typeof defaultValues[key] !== 'object') {
          obj[key] = "";
        } else {
          obj[key] = defaultValues[key];
        }
        return obj;
      }, {}) : 
      defaultValues,
  });

  // Manejar envío del formulario
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Limpiar datos para manejar campos opcionales vacíos
      const datosLimpios = {};
      
      // Procesar cada campo para manejar correctamente los valores vacíos
      Object.keys(data).forEach(key => {
        // Convertir strings vacías a null para campos opcionales
        if (data[key] === "") {
          datosLimpios[key] = null;
        } else {
          datosLimpios[key] = data[key];
        }
      });
      
      let result;
      
      if (institucion) {
        // Actualizar institución existente
        result = await updateInstitucion(institucion.id, datosLimpios);
      } else {
        // Crear nueva institución
        result = await createInstitucion(datosLimpios);
      }
      
      if (result.success) {
        toast.success(institucion ? "Institución actualizada correctamente" : "Institución creada correctamente");
        router.refresh();
      } else {
        toast.error(result.error || "Error al guardar los datos");
      }
    } catch (error) {
      toast.error("Error al procesar la solicitud");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar campos según la sección
  const renderCamposGeneral = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="nombreInstitucion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Institución</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Colegio San Agustín" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="nombreComercial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Comercial (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Nombre comercial o abreviado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="codigoModular"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código Modular</FormLabel>
              <FormControl>
                <Input placeholder="Ej. 123456" {...field} />
              </FormControl>
              <FormDescription>
                Código único asignado por el Ministerio de Educación
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="tipoGestion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Gestión</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo de gestión" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tiposGestion.map((tipo) => (
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
          name="modalidad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modalidad</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
      </div>
      
      <FormField
        control={form.control}
        name="niveles"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Niveles Educativos</FormLabel>
            <FormControl>
              <MultiSelect
                options={nivelesEducativos}
                selected={field.value || []}
                onChange={field.onChange}
                placeholder="Seleccione los niveles"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderCamposContacto = () => (
    <>
      <FormField
        control={form.control}
        name="direccion"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dirección</FormLabel>
            <FormControl>
              <Input placeholder="Dirección completa" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          control={form.control}
          name="distrito"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Distrito</FormLabel>
              <FormControl>
                <Input placeholder="Distrito" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="provincia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provincia</FormLabel>
              <FormControl>
                <Input placeholder="Provincia" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="departamento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departamento</FormLabel>
              <FormControl>
                <Input placeholder="Departamento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          control={form.control}
          name="ubigeo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubigeo</FormLabel>
              <FormControl>
                <Input placeholder="Código de ubigeo (6 dígitos)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="ugel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>UGEL</FormLabel>
              <FormControl>
                <Input placeholder="Unidad de Gestión Educativa Local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="dre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>DRE</FormLabel>
              <FormControl>
                <Input placeholder="Dirección Regional de Educación" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          control={form.control}
          name="telefono"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Número de teléfono" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (opcional)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="correo@ejemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="sitioWeb"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sitio Web (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="https://www.ejemplo.edu.pe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );

  const renderCamposAcademico = () => (
    <>
      <FormField
        control={form.control}
        name="cicloEscolarActual"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Año Escolar Actual</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min={2020} 
                max={2050} 
                placeholder="Año actual" 
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="fechaInicioClases"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de Inicio de Clases</FormLabel>
              <DatePicker
                date={field.value}
                setDate={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="fechaFinClases"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de Fin de Clases</FormLabel>
              <DatePicker
                date={field.value}
                setDate={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );

  const renderCamposDocumentos = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="resolucionCreacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resolución de Creación</FormLabel>
              <FormControl>
                <Input placeholder="Número de resolución" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="fechaCreacion"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de Creación</FormLabel>
              <DatePicker
                date={field.value}
                setDate={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="resolucionActual"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Resolución Actual (opcional)</FormLabel>
            <FormControl>
              <Input placeholder="Número de resolución vigente" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="logo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL del Logo (opcional)</FormLabel>
            <FormControl>
              <Input placeholder="URL de la imagen del logo" {...field} />
            </FormControl>
            <FormDescription>
              Ingrese la URL completa de la imagen del logo institucional
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  // Renderizar campos según la sección
  const renderCamposPorSeccion = () => {
    switch (seccion) {
      case "general":
        return renderCamposGeneral();
      case "contacto":
        return renderCamposContacto();
      case "academico":
        return renderCamposAcademico();
      case "documentos":
        return renderCamposDocumentos();
      default:
        return (
          <>
            {renderCamposGeneral()}
            {renderCamposContacto()}
            {renderCamposAcademico()}
            {renderCamposDocumentos()}
          </>
        );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {renderCamposPorSeccion()}
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : institucion ? "Actualizar" : "Crear Institución"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
