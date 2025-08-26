"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, CalendarCheck, BadgeAlert, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Función para cargar datos estadísticos (para implementar con API)
const cargarEstadisticas = async (userId, rol) => {
  try {
    // En una implementación real, esta función haría una llamada a la API
    // Ejemplo: const response = await fetch(`/api/estadisticas/dashboard?userId=${userId}&rol=${rol}`);
    // return await response.json();
    
    // Por ahora devolvemos datos simulados según el rol
    return new Promise(resolve => {
      setTimeout(() => {
        // Datos base para todos los roles
        const datosBase = {
          estudiantes: { total: 450, nuevos: 12 },
          profesores: { total: 35, nuevos: 2 },
          cursos: { total: 42, activos: 38 },
          asistencia: { porcentaje: 92, tendencia: 2 },
          alertas: { total: 8, urgentes: 3 },
          pagos: { completados: 65, pendientes: 35 }
        };
        
        // Personalizar datos según el rol
        if (rol === "estudiante") {
          // Para estudiantes, mostrar datos personalizados
          resolve({
            ...datosBase,
            asistencia: { porcentaje: 88, tendencia: -1 }, // Asistencia personal
            alertas: { total: 2, urgentes: 1 } // Alertas personales
          });
        } else if (rol === "padre") {
          // Para padres, mostrar datos de sus hijos
          resolve({
            ...datosBase,
            asistencia: { porcentaje: 88, tendencia: -1 },
            alertas: { total: 2, urgentes: 1 },
            pagos: { completados: 70, pendientes: 30 } // Pagos personales
          });
        } else if (rol === "profesor") {
          // Para profesores, mostrar datos de sus clases
          resolve({
            ...datosBase,
            estudiantes: { total: 120, nuevos: 5 }, // Estudiantes en sus clases
            asistencia: { porcentaje: 90, tendencia: 1 }, // Asistencia de sus clases
            alertas: { total: 4, urgentes: 2 } // Alertas de sus clases
          });
        } else {
          // Para administradores, mostrar todos los datos
          resolve(datosBase);
        }
      }, 800);
    });
  } catch (error) {
    console.error("Error al cargar estadísticas:", error);
    return {
      estudiantes: { total: 0, nuevos: 0 },
      profesores: { total: 0, nuevos: 0 },
      cursos: { total: 0, activos: 0 },
      asistencia: { porcentaje: 0, tendencia: 0 },
      alertas: { total: 0, urgentes: 0 },
      pagos: { completados: 0, pendientes: 0 }
    };
  }
};

export default function TarjetasEstadisticas({ userId, rol = "admin" }) {
  const [estadisticas, setEstadisticas] = useState({
    estudiantes: { total: 0, nuevos: 0 },
    profesores: { total: 0, nuevos: 0 },
    cursos: { total: 0, activos: 0 },
    asistencia: { porcentaje: 0, tendencia: 0 },
    alertas: { total: 0, urgentes: 0 },
    pagos: { completados: 0, pendientes: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const datos = await cargarEstadisticas(userId, rol);
        setEstadisticas(datos);
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [userId, rol]);

  // Tarjeta de carga para mostrar mientras se cargan los datos
  const TarjetaCarga = () => (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24 mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-4 w-24" />
      </CardContent>
    </Card>
  );

  // Determinar qué tarjetas mostrar según el rol
  const getTarjetas = () => {
    // Si está cargando, mostrar tarjetas de carga
    if (isLoading) {
      return Array(4).fill(0).map((_, index) => <TarjetaCarga key={`skeleton-${index}`} />);
    }

    const tarjetas = {
      estudiantes: (
        <Card key="estudiantes">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <GraduationCap className="h-4 w-4 mr-2 text-blue-500" />
              Estudiantes
            </CardTitle>
            <CardDescription>Total matriculados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.estudiantes.total}</div>
            <p className="text-xs text-muted-foreground">
              {estadisticas.estudiantes.nuevos} nuevos este mes
            </p>
          </CardContent>
        </Card>
      ),
      profesores: (
        <Card key="profesores">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-green-500" />
              Profesores
            </CardTitle>
            <CardDescription>Personal docente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.profesores.total}</div>
            <p className="text-xs text-muted-foreground">
              {estadisticas.profesores.nuevos} incorporaciones recientes
            </p>
          </CardContent>
        </Card>
      ),
      cursos: (
        <Card key="cursos">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-purple-500" />
              Cursos
            </CardTitle>
            <CardDescription>Total de cursos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.cursos.total}</div>
            <p className="text-xs text-muted-foreground">
              {estadisticas.cursos.activos} cursos activos
            </p>
          </CardContent>
        </Card>
      ),
      asistencia: (
        <Card key="asistencia">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CalendarCheck className="h-4 w-4 mr-2 text-amber-500" />
              Asistencia
            </CardTitle>
            <CardDescription>
              {rol === "estudiante" || rol === "padre" ? "Tu asistencia" : "Promedio general"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.asistencia.porcentaje}%</div>
            <p className={`text-xs ${estadisticas.asistencia.tendencia >= 0 ? "text-green-500" : "text-red-500"}`}>
              {estadisticas.asistencia.tendencia > 0 ? "+" : ""}{estadisticas.asistencia.tendencia}% vs mes anterior
            </p>
          </CardContent>
        </Card>
      ),
      alertas: (
        <Card key="alertas">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BadgeAlert className="h-4 w-4 mr-2 text-red-500" />
              Alertas
            </CardTitle>
            <CardDescription>Requieren atención</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.alertas.total}</div>
            <p className="text-xs text-red-500">
              {estadisticas.alertas.urgentes} urgentes
            </p>
          </CardContent>
        </Card>
      ),
      pagos: (
        <Card key="pagos">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-cyan-500" />
              Pagos
            </CardTitle>
            <CardDescription>Estado actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.pagos.completados}%</div>
            <p className={`text-xs ${estadisticas.pagos.pendientes > 20 ? "text-amber-500" : "text-muted-foreground"}`}>
              {estadisticas.pagos.pendientes}% pendientes
            </p>
          </CardContent>
        </Card>
      ),
    };

    // Seleccionar tarjetas según el rol
    switch (rol) {
      case "admin":
        return [tarjetas.estudiantes, tarjetas.profesores, tarjetas.cursos, tarjetas.alertas];
      case "profesor":
        return [tarjetas.cursos, tarjetas.asistencia, tarjetas.estudiantes, tarjetas.alertas];
      case "estudiante":
        return [tarjetas.cursos, tarjetas.asistencia, tarjetas.alertas];
      case "padre":
        return [tarjetas.asistencia, tarjetas.pagos, tarjetas.alertas];
      default:
        return [tarjetas.estudiantes, tarjetas.profesores, tarjetas.cursos, tarjetas.asistencia];
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {getTarjetas()}
    </div>
  );
}
