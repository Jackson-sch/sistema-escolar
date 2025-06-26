import {
  AudioWaveform,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  GraduationCap,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  FileText,
  Hash,
  Calendar,
} from "lucide-react";

const data = {
  teams: [
    {
      name: "Webby Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Webby Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navPanel: [
    {
      title: "Dashboard",
      url: "/",
      icon: Frame,
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Frame,
    },
    {
      title: "Usuarios",
      url: "#",
      icon: Bot,
      items: [
        { title: "Administrativos", url: "/administrativo" },
        { title: "Profesores", url: "/profesor" },
        { title: "Estudiantes", url: "/estudiante" },
        { title: "Padres/Tutores", url: "/padre" },
      ],
    },
    {
      title: "Cursos",
      url: "/cursos",
      icon: GraduationCap,
    },
    {
      title: "Matrículas",
      url: "/matriculas",
      icon: Frame,
    },
    {
      title: "Evaluaciones",
      url: "/evaluaciones",
      icon: PieChart,
    },
    {
      title: "Notas",
      url: "/notas",
      icon: Command,
    },
    {
      title: "Asistencias",
      url: "/asistencias",
      icon: Map,
    },
    {
      title: "Documentos",
      url: "/documentos",
      icon: FileText,
    },
    {
      title: "Pagos",
      url: "/pagos",
      icon: Hash,
    },
    {
      title: "Anuncios",
      url: "/anuncios",
      icon: Send,
    },
    {
      title: "Eventos",
      url: "/eventos",
      icon: Calendar,
    },
    {
      title: "Configuración Escolar",
      url: "/configuracion-escolar",
      icon: Bot,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  admin: [
    {
      name: "Nivel Académico",
      url: "/nivel-academico",
      icon: GraduationCap,
    },
    {
      name: "Asignaturas",
      url: "/asignatura",
      icon: FileText,
    },
    {
      name: "Configuración Escolar",
      url: "/configuracion-escolar",
      icon: Bot,
    },
  ],
};

export default data;
