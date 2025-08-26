"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

import ReportesFinancieros from "@/components/pagos/ReportesFinancieros"
import { getStudents } from "@/action/estudiante/estudiante"

export default function ReportesFinancierosClient() {
  const [estudiantes, setEstudiantes] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEstudiantes = async () => {
      try {
        const data = await getStudents()
        console.log("Datos recibidos de getStudents:", data)
        
        // Asegurarse de que estudiantes sea siempre un array
        if (Array.isArray(data)) {
          setEstudiantes(data)
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

  return <ReportesFinancieros estudiantes={estudiantes} />
}
