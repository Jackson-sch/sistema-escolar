"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

import ExportarDatos from "@/components/pagos/ExportarDatos"
import { getStudents } from "@/action/estudiante/estudiante"

export default function ExportarDatosClient() {
  const [estudiantes, setEstudiantes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  console.log("estudiantes exportar", estudiantes)

  useEffect(() => {
    const fetchEstudiantes = async () => {
      try {
        // Obtener estudiantes del servidor
        const data = await getStudents()
        const estudiantesData = data.data
        // Asegurarse de que estudiantes sea siempre un array y tenga la estructura correcta
        if (Array.isArray(estudiantesData)) {
          // Transformar los datos para asegurar que tengan la estructura esperada
          const estudiantesFormateados = estudiantesData.map(estudiante => ({
            id: estudiante.id,
            name: estudiante.name,
            dni: estudiante.dni,
            // Otros campos que puedan ser útiles
            apellidoPaterno: estudiante.apellidoPaterno,
            apellidoMaterno: estudiante.apellidoMaterno
          }))
          
          console.log("Estudiantes formateados:", estudiantesFormateados)
          setEstudiantes(estudiantesFormateados)
        } else {
          console.warn("getStudents no devolvió un array:", data)
          setEstudiantes([])
        }
      } catch (error) {
        console.error("Error al cargar estudiantes:", error)
        setEstudiantes([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchEstudiantes()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return <ExportarDatos estudiantes={estudiantes} />
}
