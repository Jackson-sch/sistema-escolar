"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

// Crear el contexto
const InstitucionContext = createContext();

// Hook personalizado para usar el contexto
export function useInstitucionContext() {
  const context = useContext(InstitucionContext);
  if (!context) {
    throw new Error("useInstitucionContext debe ser usado dentro de un InstitucionProvider");
  }
  return context;
}

// Proveedor del contexto
export function InstitucionProvider({ children }) {
  const { data: session } = useSession();
  const [institucion, setInstitucion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarInstitucion() {
      if (session?.user?.institucionId) {
        try {
          // Aquí se podría hacer una llamada a la API para obtener más detalles de la institución
          // Por ahora simplemente usamos el ID de la institución del usuario
          setInstitucion({
            id: session.user.institucionId,
            nombre: session.user.institucionNombre || "Institución Educativa"
          });
        } catch (error) {
          console.error("Error al cargar datos de la institución:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    if (session) {
      cargarInstitucion();
    } else {
      setLoading(false);
    }
  }, [session]);

  // Valor del contexto
  const value = {
    institucion,
    setInstitucion,
    loading
  };

  return (
    <InstitucionContext.Provider value={value}>
      {children}
    </InstitucionContext.Provider>
  );
}
