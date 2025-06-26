"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Schema de validación con Zod
const formSchema = z.object({
  // Información personal básica
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellidoPaterno: z.string().min(2, "El apellido paterno es requerido"),
  apellidoMaterno: z.string().min(2, "El apellido materno es requerido"),
  dni: z.string().regex(/^\d{8}$/, "El DNI debe tener 8 dígitos"),
  fechaNacimiento: z.date({
    required_error: "La fecha de nacimiento es requerida",
  }),
  sexo: z.enum(["M", "F"], {
    required_error: "Seleccione el sexo",
  }),
  nacionalidad: z.string().default("PERUANA"),
  
  // Códigos de estudiante
  codigoEstudiante: z.string().optional(),
  codigoSiagie: z.string().optional(),
  
  // Información de contacto
  direccion: z.string().min(5, "La dirección es requerida"),
  departamento: z.string().min(1, "Seleccione el departamento"),
  provincia: z.string().min(1, "Seleccione la provincia"),
  distrito: z.string().min(1, "Seleccione el distrito"),
  ubigeo: z.string().optional(),
  telefono: z.string().regex(/^\d{9}$/, "El teléfono debe tener 9 dígitos").optional(),
  email: z.string().email("Email inválido").optional(),
  
  // Información académica
  nivel: z.enum(["INICIAL", "PRIMARIA", "SECUNDARIA"], {
    required_error: "Seleccione el nivel académico",
  }),
  grado: z.string().min(1, "Seleccione el grado"),
  turno: z.enum(["MANANA", "TARDE", "NOCHE"], {
    required_error: "Seleccione el turno",
  }),
  
  // Información de matrícula
  esPrimeraVez: z.boolean().default(false),
  esRepitente: z.boolean().default(false),
  procedencia: z.string().optional(),
  
  // Información médica
  tipoSangre: z.string().optional(),
  alergias: z.string().optional(),
  condicionesMedicas: z.string().optional(),
  
  // Contacto de emergencia
  contactoEmergencia: z.string().min(5, "El contacto de emergencia es requerido"),
  telefonoEmergencia: z.string().regex(/^\d{9}$/, "El teléfono debe tener 9 dígitos"),
  
  // Información socioeconómica
  viveConPadres: z.boolean().optional(),
  tipoVivienda: z.enum(["PROPIA", "ALQUILADA", "FAMILIAR", "OTRO"]).optional(),
  transporteEscolar: z.boolean().default(false),
  becario: z.boolean().default(false),
  tipoBeca: z.string().optional(),
  programaSocial: z.string().optional(),
  
  // Información de los padres/tutores
  nombrePadre: z.string().min(2, "El nombre del padre es requerido"),
  dniPadre: z.string().regex(/^\d{8}$/, "El DNI debe tener 8 dígitos"),
  ocupacionPadre: z.string().optional(),
  telefonoPadre: z.string().regex(/^\d{9}$/, "El teléfono debe tener 9 dígitos"),
  
  nombreMadre: z.string().min(2, "El nombre de la madre es requerido"),
  dniMadre: z.string().regex(/^\d{8}$/, "El DNI debe tener 8 dígitos"),
  ocupacionMadre: z.string().optional(),
  telefonoMadre: z.string().regex(/^\d{9}$/, "El teléfono debe tener 9 dígitos"),
  
  // Información adicional
  observaciones: z.string().optional(),
})


const GRADOS_POR_NIVEL = {
  INICIAL: [
    { value: "CUNA_0_2", label: "Cuna (0-2 años)" },
    { value: "JARDIN_3", label: "Jardín 3 años" },
    { value: "JARDIN_4", label: "Jardín 4 años" },
    { value: "JARDIN_5", label: "Jardín 5 años" },
  ],
  PRIMARIA: [
    { value: "PRIMERO_PRIMARIA", label: "1° Primaria" },
    { value: "SEGUNDO_PRIMARIA", label: "2° Primaria" },
    { value: "TERCERO_PRIMARIA", label: "3° Primaria" },
    { value: "CUARTO_PRIMARIA", label: "4° Primaria" },
    { value: "QUINTO_PRIMARIA", label: "5° Primaria" },
    { value: "SEXTO_PRIMARIA", label: "6° Primaria" },
  ],
  SECUNDARIA: [
    { value: "PRIMERO_SECUNDARIA", label: "1° Secundaria" },
    { value: "SEGUNDO_SECUNDARIA", label: "2° Secundaria" },
    { value: "TERCERO_SECUNDARIA", label: "3° Secundaria" },
    { value: "CUARTO_SECUNDARIA", label: "4° Secundaria" },
    { value: "QUINTO_SECUNDARIA", label: "5° Secundaria" },
  ],
}

const DEPARTAMENTOS_PERU = [
  "AMAZONAS", "ÁNCASH", "APURÍMAC", "AREQUIPA", "AYACUCHO", "CAJAMARCA",
  "CALLAO", "CUSCO", "HUANCAVELICA", "HUÁNUCO", "ICA", "JUNÍN", "LA LIBERTAD",
  "LAMBAYEQUE", "LIMA", "LORETO", "MADRE DE DIOS", "MOQUEGUA", "PASCO",
  "PIURA", "PUNO", "SAN MARTÍN", "TACNA", "TUMBES", "UCAYALI"
]

export default function StudentRegistrationForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nacionalidad: "PERUANA",
      esPrimeraVez: false,
      esRepitente: false,
      transporteEscolar: false,
      becario: false,
    },
  })

  const selectedNivel = form.watch("nivel")
  const isBecario = form.watch("becario")

  function onSubmit(values) {
    console.log(values)
    // Aquí iría la lógica para enviar los datos al servidor
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Registro de Estudiante</h1>
        <p className="text-gray-600 mt-2">Complete todos los campos requeridos para registrar al nuevo estudiante</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Información Personal */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Información Personal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombres *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombres del estudiante" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apellidoPaterno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido Paterno *</FormLabel>
                    <FormControl>
                      <Input placeholder="Apellido paterno" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apellidoMaterno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido Materno *</FormLabel>
                    <FormControl>
                      <Input placeholder="Apellido materno" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dni"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DNI *</FormLabel>
                    <FormControl>
                      <Input placeholder="12345678" maxLength={8} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fechaNacimiento"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Nacimiento *</FormLabel>
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
                              format(field.value, "dd/MM/yyyy", { locale: es })
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
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
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
                name="sexo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexo *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Femenino</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>
          </div>

          {/* Información de Domicilio */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Información de Domicilio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <FormField
                control={form.control}
                name="direccion"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Dirección *</FormLabel>
                    <FormControl>
                      <Input placeholder="Av. Los Olivos 123, Urb. San Carlos" {...field} />
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
                    <FormLabel>Departamento *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEPARTAMENTOS_PERU.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="provincia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provincia *</FormLabel>
                    <FormControl>
                      <Input placeholder="Provincia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="distrito"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distrito *</FormLabel>
                    <FormControl>
                      <Input placeholder="Distrito" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="987654321" maxLength={9} {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="estudiante@email.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>
          </div>

          {/* Información Académica */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Información Académica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <FormField
                control={form.control}
                name="nivel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar nivel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INICIAL">Inicial</SelectItem>
                        <SelectItem value="PRIMARIA">Primaria</SelectItem>
                        <SelectItem value="SECUNDARIA">Secundaria</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grado *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedNivel}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar grado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedNivel && GRADOS_POR_NIVEL[selectedNivel]?.map((grado) => (
                          <SelectItem key={grado.value} value={grado.value}>
                            {grado.label}
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
                name="turno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Turno *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar turno" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MANANA">Mañana</SelectItem>
                        <SelectItem value="TARDE">Tarde</SelectItem>
                        <SelectItem value="NOCHE">Noche</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="procedencia"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Institución de Procedencia</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de la institución anterior" {...field} />
                    </FormControl>
                    <FormDescription>
                      Ingrese el nombre de la institución educativa de donde proviene el estudiante
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="col-span-full flex gap-6">
                <FormField
                  control={form.control}
                  name="esPrimeraVez"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Primera vez en el sistema educativo</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="esRepitente"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Repitente</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

            </div>
          </div>

          {/* Información Médica */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Información Médica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <FormField
                control={form.control}
                name="tipoSangre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Sangre</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="alergias"
                render={({ field }) => (
                  <FormItem className="col-span-full md:col-span-2">
                    <FormLabel>Alergias</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describir alergias conocidas (medicamentos, alimentos, etc.)" 
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condicionesMedicas"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Condiciones Médicas</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describir condiciones médicas relevantes (asma, diabetes, etc.)" 
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>
          </div>

          {/* Contacto de Emergencia */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Contacto de Emergencia</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <FormField
                control={form.control}
                name="contactoEmergencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Contacto *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefonoEmergencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono de Emergencia *</FormLabel>
                    <FormControl>
                      <Input placeholder="987654321" maxLength={9} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>
          </div>

          {/* Información de los Padres */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Información de los Padres/Tutores</h2>
            
            {/* Información del Padre */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-gray-700">Padre</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <FormField
                  control={form.control}
                  name="nombrePadre"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Nombres y Apellidos *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre completo del padre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dniPadre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DNI *</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678" maxLength={8} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefonoPadre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono *</FormLabel>
                      <FormControl>
                        <Input placeholder="987654321" maxLength={9} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ocupacionPadre"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Ocupación</FormLabel>
                      <FormControl>
                        <Input placeholder="Ocupación del padre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>
            </div>

            {/* Información de la Madre */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-700">Madre</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <FormField
                  control={form.control}
                  name="nombreMadre"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Nombres y Apellidos *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre completo de la madre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dniMadre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DNI *</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678" maxLength={8} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefonoMadre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono *</FormLabel>
                      <FormControl>
                        <Input placeholder="987654321" maxLength={9} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ocupacionMadre"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Ocupación</FormLabel>
                      <FormControl>
                        <Input placeholder="Ocupación de la madre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>
            </div>
          </div>

          {/* Información Socioeconómica */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Información Socioeconómica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <FormField
                control={form.control}
                name="tipoVivienda"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Vivienda</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PROPIA">Propia</SelectItem>
                        <SelectItem value="ALQUILADA">Alquilada</SelectItem>
                        <SelectItem value="FAMILIAR">Familiar</SelectItem>
                        <SelectItem value="OTRO">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="programaSocial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Programa Social</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="QALI_WARMA">Qali Warma</SelectItem>
                        <SelectItem value="JUNTOS">Juntos</SelectItem>
                        <SelectItem value="PENSION_65">Pensión 65</SelectItem>
                        <SelectItem value="CONTIGO">Contigo</SelectItem>
                        <SelectItem value="NINGUNO">Ninguno</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="col-span-full flex flex-wrap gap-6">
                <FormField
                  control={form.control}
                  name="viveConPadres"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Vive con ambos padres</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transporteEscolar"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Utiliza transporte escolar</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="becario"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Becario</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {isBecario && (
                <FormField
                  control={form.control}
                  name="tipoBeca"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel>Tipo de Beca</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo de beca" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EXCELENCIA_ACADEMICA">Excelencia Académica</SelectItem>
                          <SelectItem value="DEPORTIVA">Deportiva</SelectItem>
                          <SelectItem value="ARTISTICA">Artística</SelectItem>
                          <SelectItem value="SOCIOECONOMICA">Socioeconómica</SelectItem>
                          <SelectItem value="HERMANOS">Descuento por Hermanos</SelectItem>
                          <SelectItem value="HIJO_TRABAJADOR">Hijo de Trabajador</SelectItem>
                          <SelectItem value="OTRA">Otra</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

            </div>
          </div>

          {/* Códigos Oficiales */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Códigos Oficiales (Opcional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <FormField
                control={form.control}
                name="codigoEstudiante"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de Estudiante</FormLabel>
                    <FormControl>
                      <Input placeholder="Código interno de la institución" {...field} />
                    </FormControl>
                    <FormDescription>
                      Código único asignado por la institución
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="codigoSiagie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código SIAGIE</FormLabel>
                    <FormControl>
                      <Input placeholder="Código del sistema SIAGIE" {...field} />
                    </FormControl>
                    <FormDescription>
                      Código oficial del MINEDU
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>
          </div>

          {/* Observaciones */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Observaciones Adicionales</h2>
            
            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Información adicional relevante sobre el estudiante (situación familiar especial, necesidades específicas, etc.)" 
                      className="resize-none h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Incluya cualquier información adicional que considere importante para el seguimiento del estudiante
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline" className="px-8">
              Cancelar
            </Button>
            <Button type="button" variant="secondary" className="px-8">
              Guardar Borrador
            </Button>
            <Button type="submit" className="px-8 bg-blue-600 hover:bg-blue-700">
              Registrar Estudiante
            </Button>
          </div>

        </form>
      </Form>
    </div>
  )
}