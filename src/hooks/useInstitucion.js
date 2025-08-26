"use client";

import { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto para la institución
const InstitucionContext = createContext();

// Hook personalizado para obtener los datos de la institución
export function useInstitucion() {
  const [institucion, setInstitucion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener los datos de la institución
  const getInstitucion = async (id) => {
    try {
      setLoading(true);
      // Aquí se haría la llamada a la API para obtener los datos de la institución
      // Por ahora, usamos datos de ejemplo
      const data = id 
        ? await fetchInstitucionById(id) 
        : await fetchInstitucionActiva();
      
      setInstitucion(data);
      return data;
    } catch (err) {
      setError(err.message);
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar los datos de la institución
  const updateInstitucion = async (data) => {
    try {
      setLoading(true);
      // Aquí se haría la llamada a la API para actualizar los datos
      // Por ahora, simulamos una actualización exitosa
      const updatedData = await simulateUpdateInstitucion(data);
      setInstitucion(updatedData);
      return { success: true, data: updatedData };
    } catch (err) {
      setError(err.message);
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear el nombre del director
  const formatDirectorName = (director) => {
    if (!director) return "No asignado";
    return `${director.titulo || ""} ${director.nombre || ""}`.trim();
  };

  return {
    institucion,
    loading,
    error,
    getInstitucion,
    updateInstitucion,
    formatDirectorName
  };
}

// Proveedor de contexto para la institución
export function InstitucionProvider({ children }) {
  const institucionData = useInstitucion();
  
  useEffect(() => {
    // Cargar la institución activa al montar el componente
    institucionData.getInstitucion();
  }, []);

  return (
    <InstitucionContext.Provider value={institucionData}>
      {children}
    </InstitucionContext.Provider>
  );
}

// Hook para consumir el contexto de la institución
export function useInstitucionContext() {
  const context = useContext(InstitucionContext);
  if (!context) {
    throw new Error('useInstitucionContext debe ser usado dentro de un InstitucionProvider');
  }
  return context;
}
