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
  Users,
  School,
  BookOpen,
  ClipboardList,
  CreditCard,
  Bell,
  Settings,
  UserCheck,
  Building,
  Clock,
  Award,
  UserCog,
  FolderOpen,
  TrendingUp,
  Shield,
  Home,
  CheckSquare
} from "lucide-react";

const navigationData = {
  // Información de la institución/organización
  teams: [
    {
      name: "I.E. San Martín",
      logo: School,
      plan: "Sistema Integral",
    },
    {
      name: "I.E. María Auxiliadora",
      logo: GraduationCap,
      plan: "Gestión Completa",
    },
    {
      name: "C.E.P. Santa Rosa",
      logo: Building,
      plan: "Administración",
    },
  ],

  // Panel principal de navegación
  navPanel: [
    {
      title: "Dashboard Principal",
      url: "/dashboard",
      icon: Home,
      description: "Vista general del sistema"
    },
  ],

  // Navegación principal basada en el esquema Prisma
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: TrendingUp,
      badge: "Principal"
    },
    
    // Gestión de Usuarios (basado en model User con diferentes roles)
    {
      title: "Gestión de Usuarios",
      url: "#",
      icon: Users,
      items: [
        { 
          title: "Directivos", 
          url: "/usuarios/directivos", 
          description: "Directores y subdirectores",
          role: "director"
        },
        { 
          title: "Administrativos", 
          url: "/usuarios/administrativos", 
          description: "Personal administrativo",
          role: "administrativo"
        },
        { 
          title: "Profesores", 
          url: "/usuarios/profesores", 
          description: "Docentes y tutores",
          role: "profesor"
        },
        { 
          title: "Estudiantes", 
          url: "/usuarios/estudiantes", 
          description: "Estudiantes matriculados",
          role: "estudiante"
        },
        { 
          title: "Padres/Tutores", 
          url: "/usuarios/padres", 
          description: "Representantes legales",
          role: "padre"
        },
      ],
    },

    // Gestión Académica
    {
      title: "Gestión Académica",
      url: "#",
      icon: GraduationCap,
      items: [
        { 
          title: "Niveles Académicos", 
          url: "/academico/niveles", 
          description: "Inicial, Primaria, Secundaria",
          model: "NivelAcademico"
        },
        { 
          title: "Áreas Curriculares", 
          url: "/academico/areas-curriculares", 
          description: "Matemática, Comunicación, etc.",
          model: "AreaCurricular"
        },
        { 
          title: "Cursos", 
          url: "/academico/cursos", 
          description: "Gestión de materias",
          model: "Curso"
        },
        { 
          title: "Horarios", 
          url: "/academico/horarios", 
          description: "Programación de clases",
          model: "Horario"
        },
        { 
          title: "Períodos Académicos", 
          url: "/academico/periodos", 
          description: "Bimestres, trimestres",
          model: "PeriodoAcademico"
        },
      ],
    },

    // Gestión de Matrículas
    {
      title: "Matrículas",
      url: "/matriculas",
      icon: ClipboardList,
      items: [
        { 
          title: "Nueva Matrícula", 
          url: "/matriculas/nueva", 
          description: "Registrar estudiante"
        },
        { 
          title: "Gestionar Matrículas", 
          url: "/matriculas/gestionar", 
          description: "Administrar matrículas"
        },
        { 
          title: "Traslados", 
          url: "/matriculas/traslados", 
          description: "Gestión de traslados"
        },
        { 
          title: "Estados", 
          url: "/matriculas/estados", 
          description: "Activos, retirados, etc."
        },
      ],
    },

    // Sistema de Evaluaciones
    {
      title: "Evaluaciones",
      url: "/evaluaciones",
      icon: CheckSquare,
      items: [
        { 
          title: "Crear Evaluación", 
          url: "/evaluaciones/crear", 
          description: "Nueva evaluación"
        },
        { 
          title: "Gestionar Evaluaciones", 
          url: "/evaluaciones/gestionar", 
          description: "Administrar evaluaciones"
        },
        { 
          title: "Tipos de Evaluación", 
          url: "/evaluaciones/tipos", 
          description: "Diagnóstica, formativa, etc."
        },
      ],
    },

    // Registro de Notas
    {
      title: "Registro de Notas",
      url: "/notas",
      icon: Award,
      items: [
        { 
          title: "Ingresar Notas", 
          url: "/notas/ingresar", 
          description: "Registro de calificaciones"
        },
        { 
          title: "Consultar Notas", 
          url: "/notas/consultar", 
          description: "Ver calificaciones"
        },
        { 
          title: "Boletas", 
          url: "/notas/boletas", 
          description: "Generar reportes"
        },
        { 
          title: "Actas", 
          url: "/notas/actas", 
          description: "Actas de evaluación"
        },
      ],
    },

    // Control de Asistencias
    {
      title: "Asistencias",
      url: "/asistencias",
      icon: UserCheck,
      items: [
        { 
          title: "Tomar Asistencia", 
          url: "/asistencias/tomar", 
          description: "Registro diario"
        },
        { 
          title: "Consultar Asistencias", 
          url: "/asistencias/consultar", 
          description: "Historial de asistencia"
        },
        { 
          title: "Tardanzas", 
          url: "/asistencias/tardanzas", 
          description: "Control de tardanzas"
        },
        { 
          title: "Justificaciones", 
          url: "/asistencias/justificaciones", 
          description: "Gestionar ausencias"
        },
      ],
    },

    // Gestión Documental
    {
      title: "Documentos",
      url: "/documentos",
      icon: FileText,
      items: [
        { 
          title: "Certificados", 
          url: "/documentos/certificados", 
          description: "Certificados de estudios"
        },
        { 
          title: "Constancias", 
          url: "/documentos/constancias", 
          description: "Constancias varias"
        },
        { 
          title: "Traslados", 
          url: "/documentos/traslados", 
          description: "Documentos de traslado"
        },
        { 
          title: "Expedientes", 
          url: "/documentos/expedientes", 
          description: "Gestión de expedientes"
        },
      ],
    },

    // Sistema de Pagos
    {
      title: "Gestión de Pagos",
      url: "/pagos",
      icon: CreditCard,
      items: [
        { 
          title: "Registrar Pago", 
          url: "/pagos/registrar", 
          description: "Nuevo pago"
        },
        { 
          title: "Consultar Pagos", 
          url: "/pagos/consultar", 
          description: "Historial de pagos"
        },
        { 
          title: "Pendientes", 
          url: "/pagos/pendientes", 
          description: "Pagos por cobrar"
        },
        { 
          title: "Comprobantes", 
          url: "/pagos/comprobantes", 
          description: "Boletas y recibos"
        },
      ],
    },

    // Comunicaciones
    {
      title: "Comunicaciones",
      url: "#",
      icon: Bell,
      items: [
        { 
          title: "Anuncios", 
          url: "/comunicaciones/anuncios", 
          description: "Publicar anuncios",
          model: "Anuncio"
        },
        { 
          title: "Eventos", 
          url: "/comunicaciones/eventos", 
          description: "Gestionar eventos",
          model: "Evento"
        },
        { 
          title: "Notificaciones", 
          url: "/comunicaciones/notificaciones", 
          description: "Envío de notificaciones"
        },
      ],
    },

    // Reportes y Estadísticas
    {
      title: "Reportes",
      url: "#",
      icon: PieChart,
      items: [
        { 
          title: "Estadísticas Académicas", 
          url: "/reportes/academicas", 
          description: "Rendimiento académico"
        },
        { 
          title: "Asistencia General", 
          url: "/reportes/asistencia", 
          description: "Reportes de asistencia"
        },
        { 
          title: "Estado Financiero", 
          url: "/reportes/financiero", 
          description: "Reportes de pagos"
        },
        { 
          title: "Matrícula", 
          url: "/reportes/matricula", 
          description: "Estadísticas de matrícula"
        },
      ],
    },
  ],

  // Navegación secundaria
  navSecondary: [
    {
      title: "Soporte Técnico",
      url: "/soporte",
      icon: LifeBuoy,
    },
    {
      title: "Comentarios",
      url: "/feedback",
      icon: Send,
    },
    {
      title: "Ayuda",
      url: "/ayuda",
      icon: FileText,
    },
  ],

  // Configuración administrativa (solo para directores y administradores)
  adminConfig: [
    {
      name: "Institución Educativa",
      url: "/config/institucion",
      icon: Building,
      description: "Datos de la institución",
      model: "InstitucionEducativa"
    },
    {
      name: "Niveles Académicos",
      url: "/config/niveles-academicos",
      icon: GraduationCap,
      description: "Configurar niveles y grados",
      model: "NivelAcademico"
    },
    {
      name: "Áreas Curriculares",
      url: "/config/areas-curriculares",
      icon: BookOpen,
      description: "Gestionar áreas del currículo",
      model: "AreaCurricular"
    },
    {
      name: "Períodos Académicos",
      url: "/config/periodos",
      icon: Calendar,
      description: "Configurar bimestres/trimestres",
      model: "PeriodoAcademico"
    },
    {
      name: "Usuarios y Roles",
      url: "/config/usuarios-roles",
      icon: Shield,
      description: "Gestión de permisos"
    },
    {
      name: "Configuración General",
      url: "/config/general",
      icon: Settings,
      description: "Ajustes del sistema"
    },
  ],

  // Accesos rápidos según el rol del usuario
  quickAccess: {
    director: [
      { name: "Matrícula Nueva", url: "/matriculas/nueva", icon: ClipboardList },
      { name: "Reportes", url: "/reportes", icon: PieChart },
      { name: "Configuración", url: "/config", icon: Settings },
    ],
    administrativo: [
      { name: "Matrícula Nueva", url: "/matriculas/nueva", icon: ClipboardList },
      { name: "Documentos", url: "/documentos", icon: FileText },
      { name: "Pagos", url: "/pagos", icon: CreditCard },
    ],
    profesor: [
      { name: "Mis Cursos", url: "/cursos/mis-cursos", icon: BookOpen },
      { name: "Tomar Asistencia", url: "/asistencias/tomar", icon: UserCheck },
      { name: "Ingresar Notas", url: "/notas/ingresar", icon: Award },
    ],
    estudiante: [
      { name: "Mis Notas", url: "/notas/mis-notas", icon: Award },
      { name: "Horario", url: "/horario", icon: Clock },
      { name: "Anuncios", url: "/anuncios", icon: Bell },
    ],
    padre: [
      { name: "Notas de Hijo", url: "/notas/hijo", icon: Award },
      { name: "Asistencia", url: "/asistencias/hijo", icon: UserCheck },
      { name: "Pagos", url: "/pagos/hijo", icon: CreditCard },
    ],
  },

  // Menús contextuales según el estado del sistema
  contextualMenus: {
    // Cuando hay evaluaciones pendientes
    evaluacionesPendientes: [
      { name: "Evaluaciones por Calificar", url: "/evaluaciones/pendientes", icon: CheckSquare, urgent: true },
    ],
    // Cuando hay pagos vencidos
    pagosVencidos: [
      { name: "Pagos Vencidos", url: "/pagos/vencidos", icon: CreditCard, urgent: true },
    ],
    // Durante período de matrícula
    periodoMatricula: [
      { name: "Matrículas del Día", url: "/matriculas/hoy", icon: ClipboardList, highlight: true },
    ],
  }
};

export default navigationData;