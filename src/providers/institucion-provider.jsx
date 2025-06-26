"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useInstitucion } from "@/hooks/use-institucion";

// Crear el contexto
const InstitucionContext = createContext(null);

/**
 * Proveedor de contexto para los datos de la institución
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 * @param {string} props.institucionId - ID opcional de la institución específica
 */
export function InstitucionProvider({ children, institucionId = null }) {
  const institucionData = useInstitucion(institucionId);
  
  return (
    <InstitucionContext.Provider value={institucionData}>
      {children}
    </InstitucionContext.Provider>
  );
}

/**
 * Hook para consumir el contexto de la institución
 * @returns {Object} Datos y funciones relacionadas con la institución
 */
export function useInstitucionContext() {
  const context = useContext(InstitucionContext);
  
  if (!context) {
    throw new Error("useInstitucionContext debe ser usado dentro de un InstitucionProvider");
  }
  
  return context;
}
