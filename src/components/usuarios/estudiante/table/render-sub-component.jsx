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
  Heart,
  Shield,
  Star,
  Award,
  Home,
  Bus,
  UserCheck,
  CreditCard,
  Activity,
  Globe,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { colorClassesEstudiante } from "@/lib/estadoColorClasses";
import { usePadreDeEstudiante } from "../get-relacion-familiar";
import { formatPhone } from "@/lib/formatPhone";

// Componente para títulos de sección con íconos mejorado
const SectionTitle = ({ icon: Icon, title, gradient = "from-blue-500 to-purple-500" }) => (
  <div className="flex items-center mb-6">
    <div className={`bg-gradient-to-r ${gradient} p-2 rounded-xl mr-3 shadow-lg`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">{title}</h4>
  </div>
);

// Componente para cards de información con animaciones
const InfoCard = ({ icon: Icon, label, value, gradient = "from-blue-500 to-blue-600", delay = 0 }) => (
  <div 
    className="group bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 hover:scale-105"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`bg-gradient-to-r ${gradient} p-3 rounded-xl text-white shadow-md mb-3 group-hover:scale-110 transition-transform duration-300`}>
      <div className="flex justify-center">
        <Icon className="h-6 w-6" />
      </div>
    </div>
    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 text-center font-medium">{label}</p>
    <p className="font-bold text-sm text-center text-slate-800 dark:text-slate-200">{value || "-"}</p>
  </div>
);

// Componente para elementos de información básica mejorado
const InfoItem = ({ label, value, icon: Icon }) => (
  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 group">
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="bg-white dark:bg-slate-600 p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-200">
          <Icon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </div>
      )}
      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{label}</p>
    </div>
    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{value || "-"}</p>
  </div>
);

// Componente para información de contacto mejorado
const ContactInfoItem = ({ icon: Icon, label, value, gradient = "from-blue-500 to-purple-500" }) => (
  <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-700 group">
    <div className={`bg-gradient-to-r ${gradient} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div className="flex-1">
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{value || "-"}</p>
    </div>
  </div>
);

// Componente para status badges mejorado
const StatusBadge = ({ status, type = "status" }) => {
  const getStatusConfig = () => {
    if (type === "boolean") {
      return status ? {
        bg: "bg-emerald-500",
        text: "text-white",
        icon: CheckCircle,
        label: "Sí"
      } : {
        bg: "bg-slate-400",
        text: "text-white", 
        icon: XCircle,
        label: "No"
      };
    }
    
    // Para otros tipos de status
    const configs = {
      ACTIVO: { bg: "bg-emerald-500", text: "text-white", icon: CheckCircle },
      INACTIVO: { bg: "bg-slate-400", text: "text-white", icon: XCircle },
      INICIAL: { bg: "bg-blue-500", text: "text-white", icon: Star },
      PRIMARIA: { bg: "bg-green-500", text: "text-white", icon: BookOpen },
      SECUNDARIA: { bg: "bg-purple-500", text: "text-white", icon: GraduationCap },
    };
    
    return configs[status] || { bg: "bg-slate-400", text: "text-white", icon: AlertCircle };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${config.bg} ${config.text} shadow-lg`}>
      <Icon className="h-4 w-4" />
      {config.label || status}
    </span>
  );
};

// Componente para alertas médicas
const MedicalAlert = ({ condition }) => (
  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl border-l-4 border-amber-400 shadow-md">
    <div className="flex items-center gap-3 mb-2">
      <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      </div>
      <p className="text-sm font-bold text-amber-800 dark:text-amber-300">⚠️ Condición Médica Importante</p>
    </div>
    <p className="text-sm text-amber-700 dark:text-amber-200 pl-11">{condition}</p>
  </div>
);

export default function RenderSubComponent({ row }) {
  const student = row.original;
  const estudianteId = student.id;
  const { padre } = usePadreDeEstudiante(estudianteId);

  // Botones de acción mejorados
  const ActionButtons = () => (
    <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 dark:border-slate-700 mt-8 pt-6 no-print">
      <Button
        variant="outline"
        size="sm"
        className="h-10 px-6 text-sm font-medium rounded-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
        onClick={() => handlePrint("print-container")}
      >
        <PrinterIcon className="h-4 w-4 mr-2" />
        Imprimir
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-10 px-6 text-sm font-medium rounded-full hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
        onClick={handleExportPDF}
      >
        <FileIcon className="h-4 w-4 mr-2" />
        Exportar PDF
      </Button>
      <Button
        variant="default"
        size="sm"
        className="h-10 px-6 text-sm font-medium rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
      >
        <Download className="h-4 w-4 mr-2" />
        Descargar Todo
      </Button>
    </div>
  );

  return (
    <div
      id="print-container"
      className="p-6 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-xl min-h-screen"
    >
      {/* Header Hero Card - Mejorado */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 rounded-3xl mb-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-3xl mr-6 shadow-xl">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold capitalize mb-2">{student.name}</h3>
              <p className="text-blue-100 font-mono text-sm bg-white/10 px-3 py-1 rounded-full inline-block">
                📋 {student.codigoSiagie || "Sin código SIAGIE"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={student.nivelAcademico?.nivel?.nombre || "Sin nivel"} />
            <StatusBadge status={student.estado || "Sin estado"} />
          </div>
        </div>
      </div>

      {/* Bento Grid Layout Mejorado */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Academic Info - Tarjeta Principal */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300">
          <SectionTitle icon={GraduationCap} title="Información Académica" gradient="from-blue-500 to-purple-500" />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <InfoCard 
              icon={School} 
              label="Nivel Educativo" 
              value={student.nivelAcademico?.nivel?.nombre} 
              gradient="from-blue-500 to-blue-600"
              delay={0}
            />
            <InfoCard 
              icon={BookOpen} 
              label="Grado Académico" 
              value={student.nivelAcademico?.grado?.nombre} 
              gradient="from-purple-500 to-purple-600"
              delay={100}
            />
            <InfoCard 
              icon={Users} 
              label="Sección Asignada" 
              value={student.nivelAcademico?.seccion} 
              gradient="from-indigo-500 to-indigo-600"
              delay={200}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem icon={Clock} label="Turno" value={student.turno} />
            <InfoItem icon={CreditCard} label="Código Estudiante" value={student.codigoEstudiante} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 rounded-3xl border border-emerald-200 dark:border-emerald-700 shadow-xl">
          <SectionTitle icon={Activity} title="Datos Clave" gradient="from-emerald-500 to-teal-500" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Edad</span>
              </div>
              <span className="font-bold text-xl text-emerald-600 dark:text-emerald-400">
                {calculateAge(student.fechaNacimiento)} años
              </span>
            </div>
            
            <InfoItem icon={CreditCard} label="DNI" value={student.dni} />
            <InfoItem icon={User} label="Sexo" value={student.sexo} />
            <InfoItem icon={Globe} label="Nacionalidad" value={student.nacionalidad} />
          </div>
        </div>

        {/* Personal Info */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl">
          <SectionTitle icon={User} title="Información Personal" gradient="from-orange-500 to-red-500" />
          
          <div className="space-y-4">
            <InfoItem icon={Calendar} label="Fecha de Nacimiento" value={formatDate(student.fechaNacimiento)} />
            <InfoItem icon={Heart} label="Tipo de Sangre" value={student.tipoSangre} />
            <InfoItem icon={Home} label="Vive con Padres" value={student.viveConPadres === true ? "Sí" : "No"} />
            <InfoItem icon={Bus} label="Transporte Escolar" value={student.transporteEscolar === true ? "Sí" : "No"} />
          </div>

          {/* Alerta médica mejorada */}
          {student.condicionesMedicas && (
            <div className="mt-6">
              <MedicalAlert condition={student.condicionesMedicas} />
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl">
          <SectionTitle icon={Mail} title="Información de Contacto" gradient="from-cyan-500 to-blue-500" />
          
          <div className="space-y-4">
            <ContactInfoItem icon={Mail} label="Correo Electrónico" value={student.email} gradient="from-blue-500 to-cyan-500" />
            <ContactInfoItem icon={Phone} label="Teléfono" value={formatPhone(student.telefono)} gradient="from-green-500 to-emerald-500" />
            <ContactInfoItem icon={MapPin} label="Dirección" value={student.direccion} gradient="from-purple-500 to-pink-500" />
          </div>
        </div>

        {/* Parent Info */}
        <div className="lg:col-span-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 p-6 rounded-3xl border border-violet-200 dark:border-violet-700 shadow-xl">
          <SectionTitle icon={Users} title="Información del Tutor" gradient="from-violet-500 to-purple-500" />
          
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border border-violet-100 dark:border-violet-800">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-3 rounded-xl">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Padre/Tutor</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-200 capitalize">
                  {padre ? padre.name || "No registrado" : "No registrado"}
                </p>
              </div>
            </div>
            <InfoItem icon={CreditCard} label="DNI del Tutor" value={padre ? padre.dni : "No registrado"} />
          </div>
        </div>

        {/* Emergency Contact */}
        {student.contactoEmergencia && (
          <div className="lg:col-span-6 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-6 rounded-3xl border border-red-200 dark:border-red-700 shadow-xl">
            <SectionTitle icon={Shield} title="Contacto de Emergencia" gradient="from-red-500 to-pink-500" />
            
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border border-red-100 dark:border-red-800">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-xl">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Contacto de Emergencia</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    {student.contactoEmergencia}
                  </p>
                </div>
              </div>
              <InfoItem icon={Phone} label="Teléfono de Emergencia" value={student.telefonoEmergencia} />
            </div>
          </div>
        )}

        {/* Scholarships & Programs */}
        <div className="lg:col-span-12 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 p-6 rounded-3xl border border-green-200 dark:border-green-700 shadow-xl">
          <SectionTitle icon={Award} title="Becas y Programas Sociales" gradient="from-green-500 to-emerald-500" />
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100 dark:border-green-800">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Award className="h-7 w-7 text-white" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Estado de Beca</p>
              <StatusBadge status={student.becario} type="boolean" />
            </div>
            
            <div className="text-center p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 dark:border-blue-800">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Tipo de Beca</p>
              <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{student.tipoBeca || "No aplica"}</p>
            </div>
            
            <div className="text-center p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100 dark:border-purple-800">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Programa Social</p>
              <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{student.programaSocial || "No participa"}</p>
            </div>
            
            <div className="text-center p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100 dark:border-orange-800">
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Bus className="h-7 w-7 text-white" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Transporte</p>
              <StatusBadge status={student.transporteEscolar} type="boolean" />
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="lg:col-span-12 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl">
          <SectionTitle icon={Clock} title="Información del Sistema" gradient="from-slate-500 to-gray-500" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem icon={Calendar} label="Fecha de Registro" value={formatDate(student.createdAt)} />
            <InfoItem icon={Clock} label="Última Actualización" value={formatDate(student.updatedAt)} />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <ActionButtons />
    </div>
  );
}