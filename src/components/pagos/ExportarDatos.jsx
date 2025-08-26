"use client"

import { useState } from "react"
import { jsPDF } from "jspdf"
import { obtenerPagos } from "@/action/pagos/pagoActions"
import * as XLSX from "xlsx"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  FileSpreadsheet,
  File, // Reemplazado FilePdf por File que sí existe en lucide-react
  FileJson,
  FileText,
  CalendarIcon,
  Loader2,
} from "lucide-react"
import { formatDate } from "@/lib/formatDate"
import { formatCurrency } from "@/utils/formatCurrency"

// Esquema de validación para el formulario de exportación
const exportarSchema = z.object({
  formato: z.string().min(1, { message: "Selecciona un formato de exportación" }),
  tipoContenido: z.string().min(1, { message: "Selecciona un tipo de contenido" }),
  fechaInicio: z.date().optional(),
  fechaFin: z.date().optional(),
  incluirCampos: z.array(z.string()).optional(),
  estudianteId: z.string().optional(),
})

const camposDisponibles = [
  { id: "numeroBoleta", label: "Número de Boleta" },
  { id: "concepto", label: "Concepto" },
  { id: "descripcion", label: "Descripción" },
  { id: "monto", label: "Monto" },
  { id: "descuento", label: "Descuento" },
  { id: "mora", label: "Mora" },
  { id: "montoTotal", label: "Monto Total" },
  { id: "fechaEmision", label: "Fecha de Emisión" },
  { id: "fechaVencimiento", label: "Fecha de Vencimiento" },
  { id: "estado", label: "Estado" },
  { id: "estudiante", label: "Estudiante" },
  { id: "metodoPago", label: "Método de Pago" },
  { id: "fechaPago", label: "Fecha de Pago" },
  { id: "referenciaPago", label: "Referencia de Pago" },
  { id: "observaciones", label: "Observaciones" },
]

export default function ExportarDatos({ estudiantes = [] }) {
  const [isLoading, setIsLoading] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [isExporting, setIsExporting] = useState(false)

  // Configurar el formulario
  const form = useForm({
    resolver: zodResolver(exportarSchema),
    defaultValues: {
      formato: "pdf",
      tipoContenido: "pagos",
      fechaInicio: new Date(new Date().getFullYear(), 0, 1), // 1 de enero del año actual
      fechaFin: new Date(),
      incluirCampos: ["numeroBoleta", "concepto", "monto", "estado", "estudiante", "fechaVencimiento"],
      estudianteId: "",
    },
  })

  // Observar el tipo de contenido
  const tipoContenido = form.watch("tipoContenido")
  const formatoSeleccionado = form.watch("formato")

  // Obtener datos reales para la exportación
  const generarDatosPagos = async (tipoContenido, estudianteId, campos, fechaInicio, fechaFin) => {
    try {
      // Preparar filtros para la consulta
      const filtros = {};

      // Filtrar por estado según el tipo de contenido
      if (tipoContenido === "pagos_pendientes") {
        filtros.estado = "pendiente";
      } else if (tipoContenido === "pagos_realizados") {
        filtros.estado = "pagado";
      } else if (tipoContenido === "pagos_vencidos") {
        filtros.estado = "vencido";
      }

      // Filtrar por estudiante
      if (estudianteId && estudianteId !== "placeholder") {
        filtros.estudianteId = estudianteId;
      }

      // Filtrar por fechas
      if (fechaInicio) {
        filtros.fechaDesde = fechaInicio;
      }

      if (fechaFin) {
        filtros.fechaHasta = fechaFin;
      }

      // Obtener todos los pagos (sin paginación)
      const resultado = await obtenerPagos({
        ...filtros,
        pageSize: 1000 // Un número grande para obtener todos los registros
      });

      // Verificar si hay datos
      if (!resultado || !resultado.pagos || !Array.isArray(resultado.pagos)) {
        console.warn("No se encontraron datos de pagos o el formato es incorrecto", resultado);
        return [];
      }

      // Procesar los datos para incluir el nombre del estudiante
      const pagosConEstudiante = resultado.pagos.map(pago => {
        // Buscar el estudiante correspondiente
        // Los datos muestran que el estudiante ya viene en el objeto pago
        // pero necesitamos extraer correctamente el nombre
        let nombreEstudiante = "Desconocido";

        // Verificar si el estudiante ya viene como objeto en el pago
        if (pago.estudiante && typeof pago.estudiante === 'object') {
          if (pago.estudiante.name) {
            // Si tiene propiedad name directamente
            nombreEstudiante = pago.estudiante.name;
          } else if (pago.estudiante.id) {
            // Si solo tiene ID, buscar en el array de estudiantes
            const estudianteEncontrado = estudiantes.find(e => e.id === pago.estudiante.id);
            if (estudianteEncontrado && estudianteEncontrado.name) {
              nombreEstudiante = estudianteEncontrado.name;
            }
          }
        } else if (pago.estudianteId) {
          // Si solo tenemos el ID del estudiante, buscar en el array de estudiantes
          const estudianteEncontrado = estudiantes.find(e => e.id === pago.estudianteId);
          if (estudianteEncontrado && estudianteEncontrado.name) {
            nombreEstudiante = estudianteEncontrado.name;
          }
        }

        // Crear un objeto con todos los campos necesarios
        return {
          ...pago,
          estudiante: nombreEstudiante,
          // Asegurar que todos los campos existan
          numeroBoleta: pago.numeroBoleta || "",
          concepto: pago.concepto || "",
          descripcion: pago.descripcion || "",
          monto: pago.monto || 0,
          descuento: pago.descuento || 0,
          mora: pago.mora || 0,
          montoTotal: (pago.monto || 0) - (pago.descuento || 0) + (pago.mora || 0),
          fechaEmision: pago.createdAt ? new Date(pago.createdAt).toLocaleDateString() : "",
          fechaVencimiento: pago.fechaVencimiento ? new Date(pago.fechaVencimiento).toLocaleDateString() : "",
          estado: pago.estado || "",
          metodoPago: pago.metodoPago || "",
          fechaPago: pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString() : "",
          referenciaPago: pago.referenciaPago || "",
          observaciones: pago.observaciones || ""
        };
      });

      // Filtrar campos según selección
      return pagosConEstudiante.map(pago => {
        const pagoFiltrado = {};
        campos.forEach(campo => {
          if (pago[campo] !== undefined) {
            pagoFiltrado[campo] = pago[campo];
          }
        });
        return pagoFiltrado;
      });
    } catch (error) {
      console.error("Error al obtener datos de pagos:", error);
      return [];
    }
  };

  // Exportar datos
  const handleExport = async (data) => {
    setIsLoading(true)
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Iniciar progreso
      setExportProgress(10);

      // Obtener los datos reales a exportar
      const datosFiltrados = await generarDatosPagos(
        data.tipoContenido,
        data.estudianteId,
        data.incluirCampos,
        data.fechaInicio,
        data.fechaFin
      );

      // Actualizar progreso después de obtener datos
      setExportProgress(40);

      // Simular progreso
      const interval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval)
            return prev
          }
          return prev + 10
        })
      }, 300)

      // Generar el nombre del archivo
      const tipoContenidoTexto = {
        pagos: "Todos los Pagos",
        pagos_pendientes: "Pagos Pendientes",
        pagos_realizados: "Pagos Realizados",
        pagos_vencidos: "Pagos Vencidos"
      }[data.tipoContenido] || "Pagos";

      const fechaActual = new Date();
      const nombreArchivo = `${tipoContenidoTexto}_${formatDate(fechaActual, "dd-MM-yyyy")}`;

      // Exportar según el formato seleccionado
      if (data.formato === "excel") {
        // Exportar a Excel
        await exportarExcel(datosFiltrados, nombreArchivo, tipoContenidoTexto, data);
      } else if (data.formato === "pdf") {
        // Exportar a PDF
        await exportarPDF(datosFiltrados, nombreArchivo, tipoContenidoTexto, data);
      } else {
        // Formato no soportado
        throw new Error(`Formato de exportación '${data.formato}' no soportado`);
      }

      // Finalizar progreso
      clearInterval(interval);
      setExportProgress(100);

      // Mostrar notificación de éxito
      toast.success(
        <div className="flex flex-col gap-1">
          <div className="font-medium">Exportación completada</div>
          <div className="text-sm text-muted-foreground">
            Los datos de {data.tipoContenido.replace("_", " ")} han sido exportados en formato {data.formato.toUpperCase()}
          </div>
        </div>
      )

      // Reiniciar progreso
      setTimeout(() => {
        setIsExporting(false)
        setExportProgress(0)
      }, 1000)
    } catch (error) {
      console.error("Error al exportar datos:", error)
      toast.error("Error al exportar los datos")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para exportar a Excel
  const exportarExcel = (datos, nombreArchivo, tipoContenido, formData) => {
    // Crear una nueva hoja de cálculo
    const wb = XLSX.utils.book_new();

    // Preparar los datos para Excel
    const datosFormateados = datos.map(item => {
      const newItem = {};

      // Formatear cada campo para Excel
      Object.entries(item).forEach(([key, value]) => {
        // Buscar la etiqueta para la clave
        const campo = camposDisponibles.find(c => c.id === key);
        const label = campo ? campo.label : key;

        // Formatear valores monetarios
        if (key.includes('monto') && !isNaN(value)) {
          newItem[label] = Number(value);
        } else if (key.includes('fecha') && value) {
          newItem[label] = value;
        } else {
          newItem[label] = value || "";
        }
      });

      return newItem;
    });

    // Crear la hoja de cálculo
    const ws = XLSX.utils.json_to_sheet(datosFormateados);

    // Aplicar estilos (ancho de columnas)
    const wscols = Object.keys(datosFormateados[0] || {}).map(() => ({ wch: 20 }));
    ws['!cols'] = wscols;

    // Añadir la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, tipoContenido);

    // Generar el archivo y descargarlo
    XLSX.writeFile(wb, `${nombreArchivo}.xlsx`);
  };

  // Función para exportar a PDF
  const exportarPDF = (datosFiltrados, nombreArchivo, tipoContenidoTexto, data) => {
    // Generar PDF
    const doc = new jsPDF();

    // Configurar fuentes
    doc.setFont("helvetica");

    // Encabezado con color institucional
    doc.setFillColor(41, 98, 255); // Azul institucional
    doc.rect(0, 0, 210, 20, "F");

    // Título del reporte
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("Sistema Escolar - Reporte de Pagos", 105, 12, { align: "center" });

    // Restaurar color de texto
    doc.setTextColor(0, 0, 0);

    // Información del reporte
    doc.setFontSize(12);
    doc.text("Información del Reporte", 20, 30);

    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 32, 190, 32);

    // Detalles del reporte
    doc.setFontSize(10);
    doc.text(`Tipo de Contenido: ${tipoContenidoTexto}`, 20, 40);

    // Filtros aplicados
    let yPos = 45;

    // Filtro de estudiante
    if (data.estudianteId && data.estudianteId !== "placeholder") {
      const estudiante = estudiantes.find(e => e.id === data.estudianteId);
      if (estudiante) {
        doc.text(`Estudiante: ${estudiante.name}`, 20, yPos);
        yPos += 5;
      }
    }

    // Filtro de fechas
    if (data.fechaInicio) {
      doc.text(`Desde: ${formatDate(data.fechaInicio, "dd/MM/yyyy")}`, 20, yPos);
      yPos += 5;
    }

    if (data.fechaFin) {
      doc.text(`Hasta: ${formatDate(data.fechaFin, "dd/MM/yyyy")}`, 20, yPos);
      yPos += 5;
    }

    // Fecha de generación
    doc.text(`Fecha de Generación: ${formatDate(new Date(), "dd/MM/yyyy HH:mm")}`, 20, yPos);
    yPos += 5;

    // Cantidad de registros
    doc.text(`Cantidad de Registros: ${datosFiltrados.length}`, 20, yPos);
    yPos += 10;

    // Título de la sección de datos
    doc.setFontSize(12);
    doc.text("Registros Exportados", 20, yPos);
    yPos += 2;

    // Línea separadora
    doc.line(20, yPos, 190, yPos);
    yPos += 8;

    // Estilo para encabezados de registros
    const estiloEncabezadoRegistro = () => {
      doc.setFont("helvetica", "bold");
      doc.setFillColor(240, 240, 240);
      doc.setDrawColor(200, 200, 200);
      doc.setFontSize(10);
    };

    // Estilo para propiedades
    const estiloPropiedades = () => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
    };

    // Función para formatear valores
    const formatearValor = (key, value) => {
      if (key.includes('fecha') && value) {
        return value; // Ya está en formato string
      }
      if (key.includes('monto') && !isNaN(value)) {
        return `${formatCurrency(value)}`;
      }
      return value || "-";
    };

    // Dibujar cada registro
    datosFiltrados.forEach((item, index) => {
      // Verificar si necesitamos una nueva página
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      // Encabezado del registro
      estiloEncabezadoRegistro();
      doc.rect(20, yPos - 5, 170, 8, 'FD');
      doc.text(`Registro #${index + 1}`, 25, yPos);
      yPos += 8;

      // Propiedades del registro en dos columnas
      estiloPropiedades();
      let col1 = 25;
      let col2 = 110;
      let currentCol = col1;
      let startY = yPos;
      let count = 0;

      // Iterar sobre las propiedades
      Object.entries(item).forEach(([key, value]) => {
        // Buscar la etiqueta para la clave
        const campo = camposDisponibles.find(c => c.id === key);
        const label = campo ? campo.label : key;

        // Formatear el valor
        const formattedValue = formatearValor(key, value);

        // Dibujar la propiedad
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, currentCol, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(`${formattedValue}`, currentCol + 35, yPos);

        // Incrementar posición Y o cambiar a la siguiente columna
        count++;
        if (count % 2 === 0) {
          yPos += 5;
          currentCol = col1;
        } else {
          currentCol = col2;
        }
      });

      // Asegurar que terminamos en la columna izquierda
      if (currentCol === col2) {
        yPos += 5;
      }

      // Espacio entre registros
      yPos += 5;
    });

    // Pie de página
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${totalPages} | Sistema Escolar © ${new Date().getFullYear()}`, 105, 290, { align: "center" });
    }

    // Guardar el PDF
    doc.save(`${nombreArchivo}.pdf`);
  };

  // Obtener icono según formato
  const getFormatIcon = (formato) => {
    switch (formato) {
      case "excel":
        return <FileSpreadsheet className="h-4 w-4" />
      case "pdf":
        return <File className="h-4 w-4" />
      case "csv":
        return <FileText className="h-4 w-4" />
      case "json":
        return <FileJson className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Exportar Datos</h2>
          <p className="text-muted-foreground">Exporta información de pagos en diferentes formatos.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleExport)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Exportación</CardTitle>
              <CardDescription>
                Selecciona el formato y los datos que deseas exportar del sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Formato de exportación */}
                <FormField
                  control={form.control}
                  name="formato"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formato</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar formato" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pdf">
                            <div className="flex items-center gap-2">
                              <File className="h-4 w-4" />
                              <span>PDF (.pdf)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="excel">
                            <div className="flex items-center gap-2">
                              <FileSpreadsheet className="h-4 w-4" />
                              <span>Excel (.xlsx)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="csv">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>CSV (.csv)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="json">
                            <div className="flex items-center gap-2">
                              <FileJson className="h-4 w-4" />
                              <span>JSON (.json)</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tipo de contenido */}
                <FormField
                  control={form.control}
                  name="tipoContenido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenido</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar contenido" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pagos">Todos los pagos</SelectItem>
                          <SelectItem value="pagos_pendientes">Pagos pendientes</SelectItem>
                          <SelectItem value="pagos_realizados">Pagos realizados</SelectItem>
                          <SelectItem value="pagos_vencidos">Pagos vencidos</SelectItem>
                          <SelectItem value="estadisticas">Estadísticas de pagos</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Estudiante específico */}
                <FormField
                  control={form.control}
                  name="estudianteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estudiante</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Todos los estudiantes" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="placeholder">Todos los estudiantes</SelectItem>
                          {estudiantes.map((estudiante) => (
                            <SelectItem key={estudiante.id} value={estudiante.id}>
                              <span className="capitalize">{estudiante.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fecha inicio */}
                <FormField
                  control={form.control}
                  name="fechaInicio"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Desde</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={"w-full pl-3 text-left font-normal"}
                            >
                              {field.value ? (
                                formatDate(field.value)
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
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fecha fin */}
                <FormField
                  control={form.control}
                  name="fechaFin"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Hasta</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={"w-full pl-3 text-left font-normal"}
                            >
                              {field.value ? (
                                formatDate(field.value)
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
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Campos a incluir */}
              <div>
                <FormField
                  control={form.control}
                  name="incluirCampos"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Campos a incluir</FormLabel>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {camposDisponibles.map((campo) => (
                          <FormField
                            key={campo.id}
                            control={form.control}
                            name="incluirCampos"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={campo.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(campo.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, campo.id])
                                          : field.onChange(
                                            field.value?.filter((value) => value !== campo.id)
                                          )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">{campo.label}</FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isExporting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso de exportación</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} className="h-2" />
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="min-w-[160px]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exportando...
                    </>
                  ) : (
                    <>
                      {getFormatIcon(formatoSeleccionado)}
                      <span className="ml-2">Exportar a {formatoSeleccionado.toUpperCase()}</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>

      {/* Información sobre formatos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Formatos de Exportación Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-md">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Excel (.xlsx)</h4>
                <p className="text-sm text-muted-foreground">
                  Ideal para análisis de datos. Permite filtrar, ordenar y aplicar fórmulas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-50 rounded-md">
                <File className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium mb-1">PDF (.pdf)</h4>
                <p className="text-sm text-muted-foreground">
                  Perfecto para imprimir o compartir informes formales con formato fijo.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-md">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium mb-1">CSV (.csv)</h4>
                <p className="text-sm text-muted-foreground">
                  Compatible con la mayoría de sistemas y fácil de importar en otras aplicaciones.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-50 rounded-md">
                <FileJson className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-medium mb-1">JSON (.json)</h4>
                <p className="text-sm text-muted-foreground">
                  Formato estructurado ideal para integración con APIs y sistemas web.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
