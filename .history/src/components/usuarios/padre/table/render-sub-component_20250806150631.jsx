"use client";

import { Button } from "@/components/ui/button";
import { handlePrint, handleExportPDF } from "@/lib/printUtils";
import { formatDate } from "@/lib/formatDate";
import {
  Calendar,
  Mail,
  User,
  MapPin,
  Phone,
  PrinterIcon,
  FileIcon,
  Download,
  Users,
  Briefcase,
  Building,
  UserCheck,
} from "lucide-react";
import { useHijosDePadre } from "@/hooks/entidades";
import { formatPhone } from "@/lib/formatPhone";

const getStateClass = (estado) => {
  const estados = {
    ACTIVO: "bg-green-100 text-green-800 border-green-200",
    INACTIVO: "bg-red-100 text-red-800 border-red-200",
    PENDIENTE: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };
  return estados[estado] || "bg-gray-100 text-gray-800 border-gray-200";
};

// Función para formatear el nivel académico
const formatNivelAcademico = (nivelAcademico) => {
  if (!nivelAcademico) return "-";

  // Si es un array, tomar el primer elemento
  const nivel = Array.isArray(nivelAcademico)
    ? nivelAcademico[0]
    : nivelAcademico;

  if (!nivel) return "-";

  const nivelTexto = nivel.nivel || "";
  const grado = nivel.grado || "";

  // Si hay tanto nivel como grado, mostrar ambos
  if (nivelTexto && grado) {
    return `${nivelTexto} - ${grado}°`;
  }

  // Si solo hay nivel
  if (nivelTexto) {
    return nivelTexto;
  }

  // Si solo hay grado
  if (grado) {
    return `${grado}°`;
  }

  return "-";
};

// Función para obtener la sección del nivel académico
const getSeccionFromNivel = (nivelAcademico) => {
  if (!nivelAcademico) return null;

  // Si es un array, tomar el primer elemento
  const nivel = Array.isArray(nivelAcademico)
    ? nivelAcademico[0]
    : nivelAcademico;

  return nivel?.seccion || null;
};

export default function RenderSubComponent({ row }) {
  const padre = row.original;
  const { hijos, loading, error } = useHijosDePadre(padre.id);
  const estadoClass = getStateClass(padre.estado);

  return (
    <div className="p-4 bg-background rounded-lg" id="print-container">
      {/* Encabezado con acciones */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-full">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold capitalize">{padre.name}</h2>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoClass}`}
              >
                {padre.estado || "Sin estado"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              DNI: {padre.dni || "Sin DNI"}
            </span>
          </div>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-12 gap-3">
        {/* Tarjetas de información */}
        <div className="col-span-12 md:col-span-8 grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Información personal */}
          <div className="bg-card rounded-lg border border-border p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium">Información Personal</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                <UserCheck className="h-3 w-3 text-muted-foreground" />
                <div>
                  <span className="text-xs text-muted-foreground">DNI</span>
                  <div className="text-xs font-medium">{padre.dni || "-"}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <div>
                  <span className="text-xs text-muted-foreground">Email</span>
                  <div className="text-xs font-medium">
                    {padre.email || "-"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <div>
                  <span className="text-xs text-muted-foreground">
                    Teléfono
                  </span>
                  <div className="text-xs font-medium">
                    {formatPhone(padre.telefono)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <div>
                  <span className="text-xs text-muted-foreground">
                    Dirección
                  </span>
                  <div className="text-xs font-medium">
                    {padre.direccion || "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información laboral */}
          <div className="bg-card rounded-lg border border-border p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium">Información Laboral</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                <Briefcase className="h-3 w-3 text-muted-foreground" />
                <div>
                  <span className="text-xs text-muted-foreground">
                    Ocupación
                  </span>
                  <div className="text-xs font-medium">
                    {padre.ocupacion || "-"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                <Building className="h-3 w-3 text-muted-foreground" />
                <div>
                  <span className="text-xs text-muted-foreground">
                    Lugar de Trabajo
                  </span>
                  <div className="text-xs font-medium">
                    {padre.lugarTrabajo || "-"}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                <span className="text-xs text-muted-foreground">Estado</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${estadoClass}`}
                >
                  {padre.estado || "Sin estado"}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <div>
                  <span className="text-xs text-muted-foreground">
                    Fecha de Registro
                  </span>
                  <div className="text-xs font-medium">
                    {formatDate(padre.createdAt) || "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de estadísticas - Lado derecho */}
        <div className="col-span-12 md:col-span-4 grid grid-cols-1 gap-3">
          <div className="bg-card rounded-lg border border-border p-3 shadow-sm flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="text-xl font-bold">
                {loading ? "..." : hijos.length || 0}
              </span>
              <div className="text-xs text-muted-foreground">
                Estudiantes asignados
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-3 shadow-sm flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="text-xl font-bold">
                {padre.ocupacion ? "Sí" : "No"}
              </span>
              <div className="text-xs text-muted-foreground">
                Ocupación registrada
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-3 shadow-sm flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="text-xl font-bold">
                {formatDate(padre.createdAt, "MM/YY") || "-"}
              </span>
              <div className="text-xs text-muted-foreground">Registro</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de estudiantes */}
      <div className="mt-3 bg-card rounded-lg border border-border p-3 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium">Estudiantes Asignados</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-4 bg-muted/50 rounded-md text-center">
            <span className="text-xs text-muted-foreground">
              Cargando estudiantes...
            </span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-4 bg-red-50 rounded-md text-center">
            <span className="text-xs text-red-600">
              Error al cargar estudiantes
            </span>
          </div>
        ) : hijos.length === 0 ? (
          <div className="flex items-center justify-center p-4 bg-muted/50 rounded-md text-center">
            <span className="text-xs text-muted-foreground">
              No hay estudiantes asignados
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {hijos.map((hijo) => (
              <div
                key={hijo.id}
                className="flex items-center gap-2 bg-muted/50 p-2 rounded-md"
              >
                <div className="bg-primary/10 p-1 rounded-full">
                  <User className="h-3 w-3 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-medium truncate">
                      {hijo.name}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      {formatNivelAcademico(hijo.nivelAcademico)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground truncate">
                      DNI: {hijo.dni || "-"}
                    </span>
                    {getSeccionFromNivel(hijo.nivelAcademico) && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-1 py-0.5 rounded">
                        Sec: {getSeccionFromNivel(hijo.nivelAcademico)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones inferiores */}
      <div className="flex justify-end gap-2 mt-3">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs rounded-full"
          onClick={() => handlePrint("print-container")}
        >
          <PrinterIcon className="h-3 w-3 mr-1" />
          Imprimir
        </Button>
        <Button
          variant="default"
          size="sm"
          className="h-8 text-xs rounded-full"
          onClick={handleExportPDF}
        >
          <FileIcon className="h-3 w-3 mr-1" />
          PDF
        </Button>
        <Button
          variant="default"
          size="sm"
          className="h-8 text-xs rounded-full"
        >
          <Download className="h-3 w-3 mr-1" />
          Exportar
        </Button>
      </div>
    </div>
  );
}
