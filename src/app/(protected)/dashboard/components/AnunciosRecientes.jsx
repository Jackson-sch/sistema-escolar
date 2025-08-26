"use client";

import { useState, useEffect } from "react";
import { obtenerAnunciosDashboard } from "@/action/anuncios/anuncioActions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, Calendar, ChevronRight, Pin, Star, User } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function AnunciosRecientes({ userId, rol = "todos" }) {
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  
  // Usar props con fallback a session
  const userRol = rol || session?.user?.rol || "todos";
  const userIdToUse = userId || session?.user?.id;

  // Cargar anuncios
  useEffect(() => {
    const cargarAnuncios = async () => {
      setLoading(true);
      try {
        const resultado = await obtenerAnunciosDashboard({
          rol: userRol,
          userId: userIdToUse,
          limit: 3
        });
        
        if (resultado.success) {
          setAnuncios(resultado.anuncios);
        }
      } catch (error) {
        console.error("Error al cargar anuncios:", error);
      } finally {
        setLoading(false);
      }
    };
    
    cargarAnuncios();
  }, [userRol, userIdToUse]);

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return format(new Date(fecha), "dd MMM, yyyy", { locale: es });
  };

  // Obtener color de badge según dirigidoA
  const getColorBadge = (dirigidoA) => {
    switch (dirigidoA) {
      case "todos": return "bg-blue-500";
      case "profesores": return "bg-green-500";
      case "estudiantes": return "bg-purple-500";
      case "padres": return "bg-orange-500";
      case "administrativos": return "bg-gray-500";
      default: return "bg-blue-500";
    }
  };

  // Renderizar skeleton durante la carga
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Anuncios Recientes</CardTitle>
          <CardDescription>Información importante de la institución</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-b pb-3 last:border-0">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Skeleton className="h-9 w-full" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          Anuncios Recientes
          {anuncios.some(a => a.urgente) && (
            <Badge variant="destructive" className="ml-2">
              <AlertCircle className="mr-1 h-3 w-3" />
              Urgente
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Información importante de la institución</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {anuncios.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No hay anuncios recientes
          </div>
        ) : (
          anuncios.map((anuncio) => (
            <div key={anuncio.id} className={`border-b pb-3 last:border-0 ${anuncio.urgente ? 'bg-red-50 -mx-6 px-6' : ''}`}>
              <div className="flex items-start justify-between">
                <h3 className="font-medium line-clamp-1 flex items-center">
                  {anuncio.fijado && <Pin className="h-3 w-3 text-blue-500 mr-1" />}
                  {anuncio.importante && <Star className="h-3 w-3 text-amber-500 mr-1" />}
                  {anuncio.titulo}
                </h3>
                <Badge className={`${getColorBadge(anuncio.dirigidoA)} text-xs`}>
                  {anuncio.dirigidoA === "todos" ? "General" : 
                   anuncio.dirigidoA === "profesores" ? "Profesores" :
                   anuncio.dirigidoA === "estudiantes" ? "Estudiantes" :
                   anuncio.dirigidoA === "padres" ? "Padres" : "Admin"}
                </Badge>
              </div>
              <div className="text-xs text-gray-500 flex items-center mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                {formatearFecha(anuncio.fechaPublicacion)}
                <span className="mx-1">•</span>
                <User className="h-3 w-3 mr-1" />
                {anuncio.autor?.name || "Usuario"}
              </div>
              <p className="text-sm mt-1 line-clamp-2">
                {anuncio.resumen || anuncio.contenido}
              </p>
              <Link href={`/comunicaciones/anuncios?id=${anuncio.id}`} className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                Leer más
              </Link>
            </div>
          ))
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant="outline">
          <Link href="/comunicaciones/anuncios">
            Ver todos los anuncios
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
