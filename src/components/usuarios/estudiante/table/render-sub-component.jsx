"use client";
import { Button } from "@/components/ui/button";
import { handlePrint, handleExportPDF } from "@/lib/printUtils";
import { calculateAge } from "@/lib/calculateAge";
import { formatDate } from "@/lib/dateUtils";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Mail,
  User,
  MapPin,
  Phone,
  PrinterIcon,
  FileIcon,
  Download,
  Users,
  Clock,
  School,
  Check,
  AlertCircle,
} from "lucide-react";
import { colorClassesEstudiante } from "@/lib/estadoColorClasses";
import { usePadreDeEstudiante } from "../get-relacion-familiar";
import { extraerGrado } from "@/lib/extraerGrado";
import { formatPhone } from "@/lib/formatPhone";

// Componente para títulos de sección con íconos
const SectionTitle = ({ icon: Icon, title }) => (
  <h4 className="text-sm font-semibold flex items-center mb-4">
    <div className="bg-primary/10 p-1.5 rounded-md mr-2">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    {title}
  </h4>
);

// Componente para cuadrados de información en la sección académica
const InfoSquare = ({ icon: Icon, label, value }) => (
  <div className="bg-muted p-3 rounded-md shadow-sm text-center">
    <div className="flex justify-center mb-1">
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className="font-semibold text-sm">{value || "-"}</p>
  </div>
);

// Componente para elementos de información básica
const InfoItem = ({ label, value }) => (
  <div className="flex justify-between items-center bg-muted p-3 rounded-lg">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-medium">{value || "-"}</p>
  </div>
);

// Componente para los elementos de información de contacto con íconos
const ContactInfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 bg-muted p-3 rounded-lg">
    <div className="bg-primary/5 p-2 rounded-full">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div className="flex-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "-"}</p>
    </div>
  </div>
);

// Componente para elementos de información del sistema
const SystemInfoItem = ({ icon: Icon, label, value }) => (
  <div className="bg-muted p-3 rounded-lg">
    <div className="flex items-center gap-2 mb-1">
      <Icon className="h-3 w-3 text-muted-foreground" />
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
    <p className="text-sm font-medium">{value}</p>
  </div>
);

// Ayudantes
const getStatusBadge = (nivel) => {
  const niveles = {
    INICIAL: "bg-blue-100 text-blue-800 border border-blue-200",
    PRIMARIA: "bg-green-100 text-green-800 border border-green-200",
    SECUNDARIA: "bg-purple-100 text-purple-800 border border-purple-200",
  };
  return niveles[nivel] || "bg-gray-100 text-gray-800 border border-gray-200";
};

export default function RenderSubComponent({ row }) {
  const student = row.original;
  const estudianteId = student.id;
  const { padre } = usePadreDeEstudiante(estudianteId);

  // Botones de acción
  const ActionButtons = () => (
    <div className="flex justify-end gap-3 border-t border-border mt-6 pt-4 no-print">
      <Button
        variant="outline"
        size="sm"
        className="h-9 px-4 text-xs font-medium rounded-full"
        onClick={() => handlePrint("print-container")}
      >
        <PrinterIcon className="h-4 w-4 mr-2" />
        Imprimir
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-9 px-4 text-xs font-medium rounded-full"
        onClick={handleExportPDF}
      >
        <FileIcon className="h-4 w-4 mr-2" />
        PDF
      </Button>
      <Button
        variant="default"
        size="sm"
        className="h-9 px-4 text-xs font-medium rounded-full"
      >
        <Download className="h-4 w-4 mr-2" />
        Exportar
      </Button>
    </div>
  );

  return (
    <div
      id="print-container"
      className="p-5 bg-gradient-to-br from-white to-neutral-50 dark:from-background dark:to-foreground/5 rounded-xl shadow-md border border-gray-100 dark:border-gray-800"
    >
      {/* Encabezado con información de estudiante e insignias de estado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div className="flex items-center">
          <div className="bg-primary/10 p-2 rounded-full mr-3">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold capitalize">{student.name}</h3>
            <p className="text-sm font-mono text-muted-foreground">
              Código Modular: {student.codigoModular || "Sin código modular"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-4 py-1.5 rounded-full text-xs font-medium ${getStatusBadge(
              student.nivelAcademico?.nivel
            )}`}
          >
            {student.nivelAcademico?.nivel}
          </span>
          <span
            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize ${
              colorClassesEstudiante[student.estado] ||
              "bg-gray-100 text-gray-800"
            }`}
          >
            {student.estado || "Sin estado"}
          </span>
          <div className="hidden sm:flex">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
            >
              <AlertCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna izquierda */}
        <div className="space-y-6">
          {/* Información académica */}
          <div className="bg-card p-4 rounded-lg border border-border">
            <SectionTitle icon={GraduationCap} title="Información Académica" />
            <div className="grid grid-cols-3 gap-3">
              <InfoSquare
                icon={School}
                label="Nivel"
                value={student.nivelAcademico?.nivel?.toLowerCase() || "-"}
              />
              <InfoSquare
                icon={BookOpen}
                label="Grado"
                value={extraerGrado(student.nivelAcademico?.grado)}
              />
              <InfoSquare
                icon={Users}
                label="Sección"
                value={student.nivelAcademico?.seccion}
              />
            </div>
          </div>

          {/* Información personal */}
          <div className="bg-card p-4 rounded-lg border border-border">
            <SectionTitle icon={User} title="Información Personal" />
            <div className="space-y-3">
              <InfoItem label="DNI" value={student.dni} />
              <InfoItem label="Código Modular" value={student.codigoModular} />

              {/* Información de los padres/tutores */}
              <div className="flex justify-between items-center bg-muted p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">Padre/Tutor</p>
                  <p className="text-sm font-medium capitalize">
                    {padre ? padre.name || "-" : "-"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">DNI</p>
                  <p className="text-sm font-medium font-mono">
                    {padre ? padre.dni || "-" : "-"}
                  </p>
                </div>
              </div>

              {/* Cumpleaños y edad */}
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex justify-between mb-2">
                  <p className="text-xs text-muted-foreground">
                    Fecha de Nacimiento
                  </p>
                  <p className="text-xs text-muted-foreground">Edad</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm font-medium">
                    {formatDate(student.fechaNacimiento)}
                  </p>
                  <p className="text-sm font-medium">
                    {calculateAge(student.fechaNacimiento)} años
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="space-y-6">
          {/* Información del contacto */}
          <div className="bg-card p-4 rounded-lg border border-border">
            <SectionTitle icon={Mail} title="Información de Contacto" />
            <div className="space-y-3">
              <ContactInfoItem
                icon={Mail}
                label="Correo Electrónico"
                value={student.email}
              />
              <ContactInfoItem
                icon={Phone}
                label="Teléfono"
                value={formatPhone(student.telefono)}
              />
              <ContactInfoItem
                icon={MapPin}
                label="Dirección"
                value={student.direccion}
              />
            </div>
          </div>

          {/* Información del sistema */}
          <div className="bg-card p-4 rounded-lg border border-border">
            <SectionTitle icon={Clock} title="Información del Sistema" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SystemInfoItem
                icon={Calendar}
                label="Fecha de Registro"
                value={formatDate(student.createdAt)}
              />
              <SystemInfoItem
                icon={Clock}
                label="Última actualización"
                value={formatDate(student.updatedAt)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <ActionButtons />
    </div>
  );
}
