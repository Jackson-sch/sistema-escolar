import {
  GraduationCap,
  LifeBuoy,
  PieChart,
  Send,
  FileText,
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

  // Navegación principal simplificada con patrón lista + modal
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: TrendingUp,
      badge: "Principal"
    },

    // Gestión de Usuarios - Una sola ruta por tipo de usuario
    {
      title: "Gestión de Usuarios",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Administrativos",
          url: "/usuarios/administrativos",
          description: "Gestionar personal administrativo",
          role: "administrativo",
          actions: ["create", "edit", "view", "delete"]
        },
        {
          title: "Profesores",
          url: "/usuarios/profesores",
          description: "Gestionar docentes y tutores",
          role: "profesor",
          actions: ["create", "edit", "view", "delete"]
        },
        {
          title: "Estudiantes",
          url: "/usuarios/estudiantes",
          description: "Gestionar estudiantes matriculados",
          role: "estudiante",
          actions: ["create", "edit", "view", "delete"]
        },
        {
          title: "Padres/Tutores",
          url: "/usuarios/padres",
          description: "Gestionar representantes legales",
          role: "padre",
          actions: ["create", "edit", "view", "delete"]
        },
      ],
    },

    // Gestión Académica - Rutas simplificadas
    {
      title: "Gestión Académica",
      url: "#",
      icon: GraduationCap,
      items: [
        {
          title: "Niveles Académicos",
          url: "/academico/niveles",
          description: "Gestionar niveles: Inicial, Primaria, Secundaria",
          model: "NivelAcademico",
          actions: ["create", "edit", "view", "delete"]
        },
        {
          title: "Áreas Curriculares",
          url: "/academico/areas-curriculares",
          description: "Gestionar áreas: Matemática, Comunicación, etc.",
          model: "AreaCurricular",
          actions: ["create", "edit", "view", "delete"]
        },
        {
          title: "Cursos",
          url: "/academico/cursos",
          description: "Gestionar materias y asignaturas",
          model: "Curso",
          actions: ["create", "edit", "view", "delete", "assign"]
        },
        {
          title: "Horarios",
          url: "/academico/horarios",
          description: "Gestionar programación de clases",
          model: "Horario",
          actions: ["create", "edit", "view", "duplicate"]
        },
        {
          title: "Períodos Académicos",
          url: "/academico/periodos",
          description: "Gestionar bimestres y trimestres",
          model: "PeriodoAcademico",
          actions: ["create", "edit", "view", "activate"]
        },
      ],
    },

    // Gestión de Matrículas - Ruta única con modal
    {
      title: "Matrículas",
      url: "/matriculas",
      icon: ClipboardList,
      description: "Gestionar matrículas de estudiantes",
      actions: ["create", "edit", "view", "transfer", "withdraw"],
      filters: ["estado", "nivel", "grado", "año"]
    },

    // Sistema de Evaluaciones - Ruta única
    {
      title: "Evaluaciones",
      url: "/evaluaciones",
      icon: CheckSquare,
      description: "Gestionar evaluaciones académicas",
      actions: ["create", "edit", "view", "duplicate", "publish"],
      filters: ["tipo", "curso", "periodo", "estado"]
    },

    // Registro de Notas - Ruta única con diferentes vistas
    {
      title: "Registro de Notas",
      url: "/notas",
      icon: Award,
      model: "Nota",
      description: "Gestionar calificaciones y reportes",
      actions: ["create", "edit", "view", "import", "export"],
      views: ["ingresar", "consultar", "boletas", "actas"],
      filters: ["curso", "periodo", "estudiante", "evaluacion"]
    },

    // Control de Asistencias - Ruta única
    {
      title: "Asistencias",
      url: "/asistencias",
      icon: UserCheck,
      description: "Control de asistencia y tardanzas",
      actions: ["mark", "edit", "view", "justify", "report"],
      views: ["diaria", "historica", "tardanzas", "justificaciones"],
      filters: ["fecha", "curso", "estudiante", "estado"]
    },

    // Gestión Documental - Ruta única por tipo
    {
      title: "Documentos",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "Certificados",
          url: "/documentos/certificados",
          description: "Gestionar certificados de estudios",
          actions: ["generate", "view", "download", "verify"]
        },
        {
          title: "Constancias",
          url: "/documentos/constancias",
          description: "Gestionar constancias varias",
          actions: ["generate", "view", "download", "verify"]
        },
        {
          title: "Expedientes",
          url: "/documentos/expedientes",
          description: "Gestionar expedientes académicos",
          actions: ["create", "view", "update", "archive"]
        },
      ],
    },

    // Sistema de Pagos - Ruta única
    {
      title: "Gestión de Pagos",
      url: "/pagos",
      icon: CreditCard,
      description: "Gestionar pagos y comprobantes",
      actions: ["register", "edit", "view", "receipt", "remind"],
      views: ["todos", "pendientes", "vencidos", "pagados"],
      filters: ["estado", "concepto", "estudiante", "fecha"]
    },

    // Comunicaciones - Rutas por tipo
    {
      title: "Comunicaciones",
      url: "#",
      icon: Bell,
      items: [
        {
          title: "Anuncios",
          url: "/comunicaciones/anuncios",
          description: "Gestionar anuncios generales",
          model: "Anuncio",
          actions: ["create", "edit", "view", "publish", "archive"]
        },
        {
          title: "Eventos",
          url: "/comunicaciones/eventos",
          description: "Gestionar eventos académicos",
          model: "Evento",
          actions: ["create", "edit", "view", "publish", "cancel"]
        },
        {
          title: "Notificaciones",
          url: "/comunicaciones/notificaciones",
          description: "Gestionar notificaciones del sistema",
          actions: ["send", "view", "schedule", "template"]
        },
      ],
    },

    // Reportes - Vista única con filtros
    {
      title: "Reportes",
      url: "/reportes",
      icon: PieChart,
      description: "Reportes y estadísticas del sistema",
      categories: [
        {
          name: "Académicos",
          reports: ["rendimiento", "notas-periodo", "ranking-estudiantes"]
        },
        {
          name: "Asistencia",
          reports: ["asistencia-general", "tardanzas", "ausencias-justificadas"]
        },
        {
          name: "Financieros",
          reports: ["pagos-mes", "morosos", "ingresos-concepto"]
        },
        {
          name: "Matrícula",
          reports: ["matriculas-nivel", "traslados", "retiros"]
        }
      ],
      actions: ["generate", "export", "schedule", "share"]
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

  // Configuración administrativa simplificada
  adminConfig: [
    {
      name: "Institución Educativa",
      url: "/config/institucion",
      icon: Building,
      description: "Configurar datos de la institución",
      model: "InstitucionEducativa",
      actions: ["edit", "view"]
    },
    {
      name: "Estructura Académica",
      url: "/config/estructura-academica",
      icon: GraduationCap,
      description: "Configurar niveles, grados y áreas",
      actions: ["manage-levels", "manage-areas", "manage-grades"]
    },
    {
      name: "Períodos y Calendario",
      url: "/config/periodos-calendario",
      icon: Calendar,
      description: "Configurar períodos académicos y calendario escolar",
      actions: ["manage-periods", "manage-calendar"]
    },
    {
      name: "Usuarios y Permisos",
      url: "/config/usuarios-permisos",
      icon: Shield,
      description: "Gestionar roles y permisos del sistema",
      actions: ["manage-roles", "manage-permissions"]
    },
    {
      name: "Configuración General",
      url: "/config/general",
      icon: Settings,
      description: "Ajustes generales del sistema",
      actions: ["system-settings", "email-config", "backup-config"]
    },
  ],

  // Accesos rápidos optimizados según el rol
  quickAccess: {
    director: [
      { name: "Nueva Matrícula", url: "/matriculas?action=create", icon: ClipboardList },
      { name: "Reportes", url: "/reportes", icon: PieChart },
      { name: "Configuración", url: "/config/general", icon: Settings },
    ],
    administrativo: [
      { name: "Nueva Matrícula", url: "/matriculas?action=create", icon: ClipboardList },
      { name: "Generar Certificado", url: "/documentos/certificados?action=generate", icon: FileText },
      { name: "Registrar Pago", url: "/pagos?action=register", icon: CreditCard },
    ],
    profesor: [
      { name: "Mis Cursos", url: "/academico/cursos?filter=my-courses", icon: BookOpen },
      { name: "Tomar Asistencia", url: "/asistencias?action=mark", icon: UserCheck },
      { name: "Ingresar Notas", url: "/notas?view=ingresar", icon: Award },
    ],
    estudiante: [
      { name: "Mis Notas", url: "/notas?view=my-grades", icon: Award },
      { name: "Mi Horario", url: "/academico/horarios?view=my-schedule", icon: Clock },
      { name: "Anuncios", url: "/comunicaciones/anuncios", icon: Bell },
    ],
    padre: [
      { name: "Notas de Hijo", url: "/notas?view=child-grades", icon: Award },
      { name: "Asistencia", url: "/asistencias?view=child-attendance", icon: UserCheck },
      { name: "Pagos", url: "/pagos?view=child-payments", icon: CreditCard },
    ],
  },

  // Menús contextuales simplificados
  contextualMenus: {
    evaluacionesPendientes: [
      { name: "Evaluaciones por Calificar", url: "/evaluaciones?filter=pending", icon: CheckSquare, urgent: true },
    ],
    pagosVencidos: [
      { name: "Pagos Vencidos", url: "/pagos?filter=overdue", icon: CreditCard, urgent: true },
    ],
    periodoMatricula: [
      { name: "Matrículas del Día", url: "/matriculas?filter=today", icon: ClipboardList, highlight: true },
    ],
  },

  // Definición de acciones modales disponibles
  modalActions: {
    create: { title: "Crear", variant: "default" },
    edit: { title: "Editar", variant: "outline" },
    view: { title: "Ver Detalles", variant: "ghost" },
    delete: { title: "Eliminar", variant: "destructive" },
    duplicate: { title: "Duplicar", variant: "secondary" },
    assign: { title: "Asignar", variant: "default" },
    publish: { title: "Publicar", variant: "default" },
    archive: { title: "Archivar", variant: "secondary" },
    activate: { title: "Activar", variant: "default" },
    transfer: { title: "Trasladar", variant: "outline" },
    withdraw: { title: "Retirar", variant: "destructive" },
    justify: { title: "Justificar", variant: "outline" },
    mark: { title: "Marcar Asistencia", variant: "default" },
    register: { title: "Registrar", variant: "default" },
    generate: { title: "Generar", variant: "default" },
    download: { title: "Descargar", variant: "outline" },
    verify: { title: "Verificar", variant: "secondary" },
    send: { title: "Enviar", variant: "default" },
    schedule: { title: "Programar", variant: "outline" },
    export: { title: "Exportar", variant: "outline" },
    import: { title: "Importar", variant: "secondary" },
    receipt: { title: "Comprobante", variant: "outline" },
    remind: { title: "Recordar", variant: "secondary" }
  }
};

export default navigationData;