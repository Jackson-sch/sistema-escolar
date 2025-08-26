import * as z from "zod";

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

export default formSchema;
export { schemaSecciones };
