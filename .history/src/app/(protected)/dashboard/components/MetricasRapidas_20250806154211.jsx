"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  CalendarCheck, 
  AlertTriangle, 
  CreditCard,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Función para cargar métricas según el rol
const cargarMetricas = async (userId, rol) => {
  try {
    return new Promise(resolve => {
      setTimeout(() => {
        const metricas = {
          admin: {
            estudiantes: { total: 450, nuevos: 12, tendencia: 2.5 },
            profesores: { total: 35, activos: 33, tendencia: 0 },
            asistencia: { promedio: 92, meta: 95, tendencia: 1.2 },
            pagos: { completados: 87, pendientes: 13, tendencia: -2.1 },
            alertas: { total: 8, criticas: 3 },
            rendimiento: { promedio: 16.2, meta: 16.5, tendencia: 0.3 }
          },
          profesor: {
            estudiantes: { total: 120, activos: 118, tendencia: 0 },
            clases: { total: 24, completadas: 18, tendencia: 0 },
            asistencia: { promedio: 89, meta: 90, tendencia: -0.5 },
            tareas: { entregadas: 78, pendientes: 22, tendencia: 3.2 },
            alertas: { total: 4, criticas: 1 },
            rendimiento: { promedio: 15.8, meta: 16.0, tendencia: 0.2 }
          },
          estudiante: {
            asistencia: { promedio: 88, meta: 90, tendencia: -1.0 },
            notas: { promedio: 16.5, meta: 17.0, tendencia: 0.5 },
            tareas: { entregadas: 85, pendientes: 15, tendencia: 2.0 },
            examenes: { proximos: 3, completados: 12 },
            alertas: { total: 2, criticas: 0 }
          },
          padre: {
            asistencia: { promedio: 88, meta: 90, tendencia: -1.0 },
            notas: { promedio: 16.5, meta: 17.0, tendencia: 0.5 },
            pagos: { completados: 70, pendientes: 30, tendencia: 0 },
            reuniones: { proximas: 1, completadas: 4 },
            alertas: { total: 2, criticas: 1 }
          }
        };
        
        resolve(metricas[rol] || metricas.admin);
      }, 800);
    });
  } catch (error) {
    console.error("Error al cargar métricas:", error);
    return {};
  }
};

const MetricCard = ({ icon: Icon, title, value, subtitle, progress, badge, trend, color = "blue" }) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    green: "text-green-600 bg-green-100 dark:bg-green-900/30",
    purple: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
    orange: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
    red: "text-red-600 bg-red-100 dark:bg-red-900/30",
    emerald: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30"
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
              <Icon className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          {badge && (
            <Badge variant={badge.variant || "secondary"} className="text-xs">
              {badge.text}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
              {trend > 0 ? <TrendingUp className="h-3 w-3" /> : trend < 0 ? <TrendingDown className="h-3 w-3" /> : null}
              {trend !== 0 && `${trend > 0 ? '+' : ''}${trend}%`}
            </div>
          )}
        </div>
        
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        
        {progress && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Progreso</span>
              <span>{progress.value}%</span>
            </div>
            <Progress value={progress.value} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function MetricasRapidas({ userId, rol }) {
  const [metricas, setMetricas] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const datos = await cargarMetricas(userId, rol);
        setMetricas(datos);
      } catch (error) {
        console.error("Error al cargar métricas:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [userId, rol]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array(6).fill(0).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getMetricasParaRol = () => {
    switch (rol) {
      case "admin":
        return [
          {
            icon: GraduationCap,
            title: "Estudiantes",
            value: metricas.estudiantes?.total || 0,
            subtitle: `${metricas.estudiantes?.nuevos || 0} nuevos este mes`,
            trend: metricas.estudiantes?.tendencia,
            color: "blue"
          },
          {
            icon: Users,
            title: "Profesores",
            value: metricas.profesores?.total || 0,
            subtitle: `${metricas.profesores?.activos || 0} activos`,
            trend: metricas.profesores?.tendencia,
            color: "green"
          },
          {
            icon: CalendarCheck,
            title: "Asistencia",
            value: `${metricas.asistencia?.promedio || 0}%`,
            progress: {
              value: (metricas.asistencia?.promedio / metricas.asistencia?.meta * 100) || 0
            },
            trend: metricas.asistencia?.tendencia,
            color: "orange"
          },
          {
            icon: CreditCard,
            title: "Pagos",
            value: `${metricas.pagos?.completados || 0}%`,
            subtitle: `${metricas.pagos?.pendientes || 0}% pendientes`,
            trend: metricas.pagos?.tendencia,
            color: "emerald"
          },
          {
            icon: AlertTriangle,
            title: "Alertas",
            value: metricas.alertas?.total || 0,
            badge: metricas.alertas?.criticas > 0 ? {
              text: `${metricas.alertas.criticas} críticas`,
              variant: "destructive"
            } : null,
            color: "red"
          },
          {
            icon: BookOpen,
            title: "Rendimiento",
            value: metricas.rendimiento?.promedio || 0,
            progress: {
              value: (metricas.rendimiento?.promedio / 20 * 100) || 0
            },
            trend: metricas.rendimiento?.tendencia,
            color: "purple"
          }
        ];

      case "profesor":
        return [
          {
            icon: GraduationCap,
            title: "Mis Estudiantes",
            value: metricas.estudiantes?.total || 0,
            subtitle: `${metricas.estudiantes?.activos || 0} activos`,
            color: "blue"
          },
          {
            icon: BookOpen,
            title: "Clases",
            value: metricas.clases?.total || 0,
            subtitle: `${metricas.clases?.completadas || 0} completadas`,
            progress: {
              value: (metricas.clases?.completadas / metricas.clases?.total * 100) || 0
            },
            color: "purple"
          },
          {
            icon: CalendarCheck,
            title: "Asistencia",
            value: `${metricas.asistencia?.promedio || 0}%`,
            progress: {
              value: (metricas.asistencia?.promedio / metricas.asistencia?.meta * 100) || 0
            },
            trend: metricas.asistencia?.tendencia,
            color: "orange"
          },
          {
            icon: CheckCircle,
            title: "Tareas",
            value: `${metricas.tareas?.entregadas || 0}%`,
            subtitle: `${metricas.tareas?.pendientes || 0}% pendientes`,
            trend: metricas.tareas?.tendencia,
            color: "green"
          }
        ];

      case "estudiante":
        return [
          {
            icon: CalendarCheck,
            title: "Mi Asistencia",
            value: `${metricas.asistencia?.promedio || 0}%`,
            progress: {
              value: (metricas.asistencia?.promedio / metricas.asistencia?.meta * 100) || 0
            },
            trend: metricas.asistencia?.tendencia,
            color: "orange"
          },
          {
            icon: BookOpen,
            title: "Promedio",
            value: metricas.notas?.promedio || 0,
            progress: {
              value: (metricas.notas?.promedio / 20 * 100) || 0
            },
            trend: metricas.notas?.tendencia,
            color: "purple"
          },
          {
            icon: CheckCircle,
            title: "Tareas",
            value: `${metricas.tareas?.entregadas || 0}%`,
            subtitle: `${metricas.tareas?.pendientes || 0}% pendientes`,
            trend: metricas.tareas?.tendencia,
            color: "green"
          },
          {
            icon: Clock,
            title: "Exámenes",
            value: metricas.examenes?.proximos || 0,
            subtitle: `${metricas.examenes?.completados || 0} completados`,
            badge: metricas.examenes?.proximos > 0 ? {
              text: "Próximos",
              variant: "secondary"
            } : null,
            color: "blue"
          }
        ];

      case "padre":
        return [
          {
            icon: CalendarCheck,
            title: "Asistencia",
            value: `${metricas.asistencia?.promedio || 0}%`,
            progress: {
              value: (metricas.asistencia?.promedio / metricas.asistencia?.meta * 100) || 0
            },
            trend: metricas.asistencia?.tendencia,
            color: "orange"
          },
          {
            icon: BookOpen,
            title: "Promedio",
            value: metricas.notas?.promedio || 0,
            progress: {
              value: (metricas.notas?.promedio / 20 * 100) || 0
            },
            trend: metricas.notas?.tendencia,
            color: "purple"
          },
          {
            icon: CreditCard,
            title: "Pagos",
            value: `${metricas.pagos?.completados || 0}%`,
            subtitle: `${metricas.pagos?.pendientes || 0}% pendientes`,
            color: "emerald"
          },
          {
            icon: Users,
            title: "Reuniones",
            value: metricas.reuniones?.proximas || 0,
            subtitle: `${metricas.reuniones?.completadas || 0} completadas`,
            badge: metricas.reuniones?.proximas > 0 ? {
              text: "Programadas",
              variant: "secondary"
            } : null,
            color: "blue"
          }
        ];

      default:
        return [];
    }
  };

  const metricasParaMostrar = getMetricasParaRol();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {metricasParaMostrar.map((metrica, index) => (
        <MetricCard key={index} {...metrica} />
      ))}
    </div>
  );
}