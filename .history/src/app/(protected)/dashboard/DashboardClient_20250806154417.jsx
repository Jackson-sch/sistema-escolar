"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, GraduationCap, Users, BookOpen, Bell, FileText, CreditCard, BarChart3, PieChart, TrendingUp } from "lucide-react";
import AnunciosRecientes from "./components/AnunciosRecientes";
import { useEffect, useState } from "react";
import MetricasRapidas from "./components/MetricasRapidas";
import GraficoEstudiantesPorNivel from "./components/GraficoEstudiantesPorNivel";
import GraficoAsistenciaSemanal from "./components/GraficoAsistenciaSemanal";
import GraficoRendimientoMensual from "./components/GraficoRendimientoMensual";
import GraficoPagosEstado from "./components/GraficoPagosEstado";
import ActividadReciente from "./components/ActividadReciente";

export default function DashboardClient({ userInfo }) {
  // Mantener useSession como fallback en caso de que userInfo no esté disponible
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("general");
  
  // Usar userInfo (props) con fallback a session
  const user = userInfo || session?.user;
  const rol = user?.rol || "estudiante";
  const userId = user?.id;

  // Determinar qué pestañas mostrar según el rol
  const getTabs = () => {
    switch (rol) {
      case "administrativo":
        return ["general", "academico", "usuarios", "finanzas"];
      case "profesor":
        return ["general", "academico", "asistencias"];
      case "estudiante":
        return ["general", "academico", "asistencias"];
      case "padre":
        return ["general", "academico", "asistencias", "pagos"];
      default:
        return ["general"];
    }
  };

  const tabs = getTabs();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido, {user?.name || "Usuario"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Métricas rápidas */}
      <MetricasRapidas userId={userId} rol={rol} />
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          {tabs.includes("general") && <TabsTrigger value="general">General</TabsTrigger>}
          {tabs.includes("academico") && <TabsTrigger value="academico">Académico</TabsTrigger>}
          {tabs.includes("usuarios") && <TabsTrigger value="usuarios">Usuarios</TabsTrigger>}
          {tabs.includes("finanzas") && <TabsTrigger value="finanzas">Finanzas</TabsTrigger>}
          {tabs.includes("asistencias") && <TabsTrigger value="asistencias">Asistencias</TabsTrigger>}
          {tabs.includes("pagos") && <TabsTrigger value="pagos">Pagos</TabsTrigger>}
        </TabsList>

        {/* Pestaña General */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GraficoEstudiantesPorNivel userId={userId} rol={rol} />
            <GraficoAsistenciaSemanal userId={userId} rol={rol} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <ActividadReciente userId={userId} rol={rol} limite={5} />
            </div>
            
            <div>
              <AnunciosRecientes userId={userId} rol={rol} />
            </div>
          </div>
        </TabsContent>

        {/* Pestaña Académico */}
        <TabsContent value="academico" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GraficoRendimientoMensual userId={userId} rol={rol} />
            <GraficoAsistenciaSemanal userId={userId} rol={rol} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Cursos Activos
                </CardTitle>
                <CardDescription>Cursos del periodo actual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Matemáticas</p>
                      <p className="text-sm text-muted-foreground">Prof. Juan Pérez</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">92%</p>
                      <p className="text-xs text-muted-foreground">Asistencia</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Comunicación</p>
                      <p className="text-sm text-muted-foreground">Prof. María López</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">88%</p>
                      <p className="text-xs text-muted-foreground">Asistencia</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Ciencias Sociales</p>
                      <p className="text-sm text-muted-foreground">Prof. Carlos Rodríguez</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">90%</p>
                      <p className="text-xs text-muted-foreground">Asistencia</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-orange-600" />
                  Próximas Evaluaciones
                </CardTitle>
                <CardDescription>Calendario de exámenes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200">
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
                      <FileText className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Examen Parcial - Matemáticas</p>
                      <p className="text-sm text-muted-foreground">15 de Julio, 2025</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Trabajo Grupal - Comunicación</p>
                      <p className="text-sm text-muted-foreground">18 de Julio, 2025</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Exposición - Ciencias Sociales</p>
                      <p className="text-sm text-muted-foreground">22 de Julio, 2025</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña Usuarios (solo para admin) */}
        <TabsContent value="usuarios" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GraficoEstudiantesPorNivel userId={userId} rol={rol} />
            <GraficoAsistenciaSemanal userId={userId} rol={rol} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Usuarios Recientes
                </CardTitle>
                <CardDescription>Últimos registros en el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                      <GraduationCap className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Ana García</p>
                      <p className="text-sm text-muted-foreground">Estudiante - 3ro Secundaria</p>
                      <p className="text-xs text-muted-foreground">Registrado: 05/07/2025</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Roberto Mendoza</p>
                      <p className="text-sm text-muted-foreground">Profesor - Matemáticas</p>
                      <p className="text-xs text-muted-foreground">Registrado: 03/07/2025</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Carmen Velásquez</p>
                      <p className="text-sm text-muted-foreground">Padre/Madre</p>
                      <p className="text-xs text-muted-foreground">Registrado: 01/07/2025</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                  Accesos al Sistema
                </CardTitle>
                <CardDescription>Actividad de los últimos 7 días</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-blue-600" />
                      <span>Estudiantes</span>
                    </div>
                    <span className="font-bold text-blue-600">452</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span>Profesores</span>
                    </div>
                    <span className="font-bold text-green-600">35</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span>Padres</span>
                    </div>
                    <span className="font-bold text-purple-600">218</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-orange-600" />
                      <span>Administrativos</span>
                    </div>
                    <span className="font-bold text-orange-600">18</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Pestaña Finanzas (solo para admin) */}
        <TabsContent value="finanzas" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GraficoPagosEstado userId={userId} rol={rol} />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  Resumen Financiero
                </CardTitle>
                <CardDescription>Estado financiero del periodo actual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <span>Ingresos totales</span>
                    </div>
                    <span className="font-bold text-emerald-600">S/. 125,450.00</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-yellow-600" />
                      <span>Pagos pendientes</span>
                    </div>
                    <span className="font-bold text-yellow-600">S/. 45,320.00</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-red-600" />
                      <span>Pagos vencidos</span>
                    </div>
                    <span className="font-bold text-red-600">S/. 12,850.00</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <PieChart className="h-4 w-4 text-muted-foreground" />
                      <span>Tasa de morosidad</span>
                    </div>
                    <span className="font-bold">10.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Últimas Transacciones</CardTitle>
              <CardDescription>Pagos recientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 font-medium text-sm pb-2">
                  <div>Estudiante</div>
                  <div>Concepto</div>
                  <div className="text-right">Monto</div>
                </div>
                <div className="grid grid-cols-3 border-b pb-2">
                  <div>
                    <p className="font-medium">Luis Gómez</p>
                    <p className="text-xs text-gray-400">06/07/2025</p>
                  </div>
                  <div>Pensión Julio</div>
                  <div className="text-right">S/. 850.00</div>
                </div>
                <div className="grid grid-cols-3 border-b pb-2">
                  <div>
                    <p className="font-medium">María Sánchez</p>
                    <p className="text-xs text-gray-400">05/07/2025</p>
                  </div>
                  <div>Matrícula</div>
                  <div className="text-right">S/. 1,200.00</div>
                </div>
                <div className="grid grid-cols-3 border-b pb-2">
                  <div>
                    <p className="font-medium">Pedro Díaz</p>
                    <p className="text-xs text-gray-400">05/07/2025</p>
                  </div>
                  <div>Pensión Julio</div>
                  <div className="text-right">S/. 850.00</div>
                </div>
                <div className="grid grid-cols-3">
                  <div>
                    <p className="font-medium">Ana Torres</p>
                    <p className="text-xs text-gray-400">04/07/2025</p>
                  </div>
                  <div>Pensión Julio</div>
                  <div className="text-right">S/. 850.00</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Pestaña Asistencias */}
        <TabsContent value="asistencias" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GraficoAsistenciaSemanal userId={userId} rol={rol} />
            <GraficoRendimientoMensual userId={userId} rol={rol} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-green-600" />
                  Resumen de Asistencias
                </CardTitle>
                <CardDescription>Estadísticas del mes actual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Presentes</span>
                    </span>
                    <span className="font-bold text-green-600">91%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>Tardanzas</span>
                    </span>
                    <span className="font-bold text-yellow-600">5%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Ausencias</span>
                    </span>
                    <span className="font-bold text-red-600">4%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Alertas de Asistencia</CardTitle>
                <CardDescription>Estudiantes con baja asistencia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <p className="font-medium">Carlos Martínez</p>
                    <p className="text-sm text-gray-500">3ro Secundaria - 75% asistencia</p>
                    <p className="text-xs text-red-500">3 ausencias consecutivas</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="font-medium">Laura Jiménez</p>
                    <p className="text-sm text-gray-500">2do Primaria - 80% asistencia</p>
                    <p className="text-xs text-yellow-500">5 tardanzas este mes</p>
                  </div>
                  <div>
                    <p className="font-medium">Daniel Flores</p>
                    <p className="text-sm text-gray-500">5to Secundaria - 78% asistencia</p>
                    <p className="text-xs text-red-500">Ausente 2 veces esta semana</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Pestaña Pagos (para padres) */}
        <TabsContent value="pagos" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Pagos</CardTitle>
                <CardDescription>Año académico 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <div className="flex justify-between">
                      <p className="font-medium">Matrícula 2025</p>
                      <p className="text-sm text-green-500 font-medium">Pagado</p>
                    </div>
                    <p className="text-sm text-gray-500">Fecha: 15/02/2025</p>
                    <p className="text-xs text-gray-400">Comprobante: #MAT-2025-0123</p>
                  </div>
                  <div className="border-b pb-2">
                    <div className="flex justify-between">
                      <p className="font-medium">Pensión Marzo</p>
                      <p className="text-sm text-green-500 font-medium">Pagado</p>
                    </div>
                    <p className="text-sm text-gray-500">Fecha: 05/03/2025</p>
                    <p className="text-xs text-gray-400">Comprobante: #PEN-2025-0345</p>
                  </div>
                  <div className="border-b pb-2">
                    <div className="flex justify-between">
                      <p className="font-medium">Pensión Abril</p>
                      <p className="text-sm text-green-500 font-medium">Pagado</p>
                    </div>
                    <p className="text-sm text-gray-500">Fecha: 04/04/2025</p>
                    <p className="text-xs text-gray-400">Comprobante: #PEN-2025-0567</p>
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <p className="font-medium">Pensión Mayo</p>
                      <p className="text-sm text-green-500 font-medium">Pagado</p>
                    </div>
                    <p className="text-sm text-gray-500">Fecha: 06/05/2025</p>
                    <p className="text-xs text-gray-400">Comprobante: #PEN-2025-0789</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Próximos Pagos</CardTitle>
                <CardDescription>Pagos pendientes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <div className="flex justify-between">
                      <p className="font-medium">Pensión Junio</p>
                      <p className="text-sm text-yellow-500 font-medium">Pendiente</p>
                    </div>
                    <p className="text-sm text-gray-500">Vencimiento: 10/06/2025</p>
                    <p className="text-xs text-gray-400">Monto: S/. 850.00</p>
                  </div>
                  <div className="border-b pb-2">
                    <div className="flex justify-between">
                      <p className="font-medium">Pensión Julio</p>
                      <p className="text-sm text-gray-500 font-medium">Próximo</p>
                    </div>
                    <p className="text-sm text-gray-500">Vencimiento: 10/07/2025</p>
                    <p className="text-xs text-gray-400">Monto: S/. 850.00</p>
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <p className="font-medium">Pensión Agosto</p>
                      <p className="text-sm text-gray-500 font-medium">Próximo</p>
                    </div>
                    <p className="text-sm text-gray-500">Vencimiento: 10/08/2025</p>
                    <p className="text-xs text-gray-400">Monto: S/. 850.00</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <GraficoFinanzas userId={userId} rol={rol} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
