"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { BookOpen, UserCheck, FileText, Bell, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const actividadesEjemplo = [
  {
    id: 1,
    tipo: "calificacion",
    titulo: "Calificación registrada",
    descripcion: "Matemáticas - 3ro Secundaria",
    tiempo: "Hace 2 horas",
    icono: FileText
  },
  {
    id: 2,
    tipo: "asistencia",
    titulo: "Asistencia registrada",
    descripcion: "Ciencias - 2do Primaria",
    tiempo: "Hace 3 horas",
    icono: UserCheck
  },
  {
    id: 3,
    tipo: "material",
    titulo: "Nuevo material subido",
    descripcion: "Historia - 5to Secundaria",
    tiempo: "Hace 5 horas",
    icono: BookOpen
  },
  {
    id: 4,
    tipo: "notificacion",
    titulo: "Reunión de padres",
    descripcion: "Recordatorio para todos los grados",
    tiempo: "Hace 6 horas",
    icono: Bell
  },
  {
    id: 5,
    tipo: "pago",
    titulo: "Pago registrado",
    descripcion: "Pensión de Julio - María Rodríguez",
    tiempo: "Hace 8 horas",
    icono: CreditCard
  }
];

// Función para cargar datos de actividades recientes (simulación de API)
const cargarActividadesRecientes = async (userId, rol, limite) => {
  try {
    // En una implementación real, esta función haría una llamada a la API
    // Ejemplo: const response = await fetch(`/api/actividades/recientes?userId=${userId}&rol=${rol}&limite=${limite}`);
    // return await response.json();
    
    // Por ahora devolvemos datos simulados
    return new Promise(resolve => {
      setTimeout(() => {
        // Filtrar actividades según el rol
        let actividadesFiltradas = [...actividadesEjemplo];
        
        if (rol === "estudiante") {
          actividadesFiltradas = actividadesEjemplo.filter(
            act => act.tipo === "calificacion" || act.tipo === "material" || act.tipo === "notificacion"
          );
        } else if (rol === "padre") {
          actividadesFiltradas = actividadesEjemplo.filter(
            act => act.tipo === "calificacion" || act.tipo === "asistencia" || 
                  act.tipo === "notificacion" || act.tipo === "pago"
          );
        } else if (rol === "profesor") {
          actividadesFiltradas = actividadesEjemplo.filter(
            act => act.tipo !== "pago"
          );
        }
        
        resolve(actividadesFiltradas.slice(0, limite));
      }, 800);
    });
  } catch (error) {
    console.error("Error al cargar actividades recientes:", error);
    return [];
  }
};

export default function ActividadReciente({ userId, rol = "admin", limite = 5 }) {
  const [actividades, setActividades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const datos = await cargarActividadesRecientes(userId, rol, limite);
        setActividades(datos);
      } catch (error) {
        console.error("Error al cargar actividades recientes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [userId, rol, limite]);

  const getIconColor = (tipo) => {
    switch (tipo) {
      case "calificacion": return "text-blue-500";
      case "asistencia": return "text-green-500";
      case "material": return "text-amber-500";
      case "notificacion": return "text-purple-500";
      case "pago": return "text-cyan-500";
      default: return "text-gray-500";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>Últimas acciones en el sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            // Estado de carga con Skeleton
            [...Array(limite)].map((_, index) => (
              <div key={index} className={`${index < limite - 1 ? "border-b pb-2" : ""}`}>
                <div className="flex items-start gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="w-full">
                    <Skeleton className="h-4 w-3/4 mb-1" />
                    <Skeleton className="h-3 w-1/2 mb-1" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              </div>
            ))
          ) : actividades.length > 0 ? (
            actividades.map((actividad, index) => {
              const IconComponent = actividad.icono;
              const isLast = index === actividades.length - 1;
              
              return (
                <div key={actividad.id} className={`${!isLast ? "border-b pb-2" : ""}`}>
                  <div className="flex items-start gap-2">
                    <div className={`mt-0.5 p-1 rounded-full ${getIconColor(actividad.tipo)} bg-opacity-10`}>
                      <IconComponent className={`h-4 w-4 ${getIconColor(actividad.tipo)}`} />
                    </div>
                    <div>
                      <p className="font-medium">{actividad.titulo}</p>
                      <p className="text-sm text-gray-500">{actividad.descripcion}</p>
                      <p className="text-xs text-gray-400">{actividad.tiempo}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500">No hay actividades recientes</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
