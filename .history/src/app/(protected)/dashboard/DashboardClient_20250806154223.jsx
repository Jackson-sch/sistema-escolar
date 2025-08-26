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
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
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
          {/* Tarjetas de estadísticas */}
          <TarjetasEstadisticas userId={userId} rol={rol} />
          
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
          {/* Gráfico de rendimiento académico */}
          <GraficoRendimientoAcademico userId={userId} rol={rol} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cursos Activos</CardTitle>
                <CardDescription>Cursos del periodo actual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <p className="font-medium">Matemáticas</p>
                    <p className="text-sm text-gray-500">Prof. Juan Pérez</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="font-medium">Comunicación</p>
                    <p className="text-sm text-gray-500">Prof. María López</p>
                  </div>
                  <div>
                    <p className="font-medium">Ciencias Sociales</p>
                    <p className="text-sm text-gray-500">Prof. Carlos Rodríguez</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Próximas Evaluaciones</CardTitle>
                <CardDescription>Calendario de exámenes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <p className="font-medium">Examen Parcial - Matemáticas</p>
                    <p className="text-sm text-gray-500">15 de Julio, 2025</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="font-medium">Trabajo Grupal - Comunicación</p>
                    <p className="text-sm text-gray-500">18 de Julio, 2025</p>
                  </div>
                  <div>
                    <p className="font-medium">Exposición - Ciencias Sociales</p>
                    <p className="text-sm text-gray-500">22 de Julio, 2025</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña Usuarios (solo para admin) */}
        <TabsContent value="usuarios" className="space-y-6">
          <GraficoUsuarios userId={userId} rol={rol} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usuarios Recientes</CardTitle>
                <CardDescription>Últimos registros</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <p className="font-medium">Ana García</p>
                    <p className="text-sm text-gray-500">Estudiante - 3ro Secundaria</p>
                    <p className="text-xs text-gray-400">Registrado: 05/07/2025</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="font-medium">Roberto Mendoza</p>
                    <p className="text-sm text-gray-500">Profesor - Matemáticas</p>
                    <p className="text-xs text-gray-400">Registrado: 03/07/2025</p>
                  </div>
                  <div>
                    <p className="font-medium">Carmen Velásquez</p>
                    <p className="text-sm text-gray-500">Padre/Madre</p>
                    <p className="text-xs text-gray-400">Registrado: 01/07/2025</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Accesos al Sistema</CardTitle>
                <CardDescription>Últimos 7 días</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Estudiantes</span>
                    <span className="font-medium">452</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Profesores</span>
                    <span className="font-medium">35</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Padres</span>
                    <span className="font-medium">218</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Administrativos</span>
                    <span className="font-medium">18</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Pestaña Finanzas (solo para admin) */}
        <TabsContent value="finanzas" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GraficoFinanzas userId={userId} rol={rol} />
            
            <Card>
              <CardHeader>
                <CardTitle>Resumen Financiero</CardTitle>
                <CardDescription>Periodo actual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span>Ingresos totales</span>
                    <span className="font-medium">S/. 125,450.00</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span>Pagos pendientes</span>
                    <span className="font-medium">S/. 45,320.00</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span>Pagos vencidos</span>
                    <span className="font-medium text-red-500">S/. 12,850.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tasa de morosidad</span>
                    <span className="font-medium">10.2%</span>
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
          <GraficoAsistencias userId={userId} rol={rol} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Asistencias</CardTitle>
                <CardDescription>Mes actual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      Presentes
                    </span>
                    <span className="font-medium">91%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      Tardanzas
                    </span>
                    <span className="font-medium">5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      Ausencias
                    </span>
                    <span className="font-medium">4%</span>
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
