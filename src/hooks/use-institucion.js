"use client";

import { useState, useEffect, useCallback } from "react";
import { getInstituciones, getInstitucionById, updateInstitucion } from "@/action/config/institucion-action";

/**
 * Hook personalizado para obtener y gestionar los datos de la institución educativa
 * @param {string} id - ID opcional de la institución específica a obtener
 * @returns {Object} Datos y funciones relacionadas con la institución
 */
export function useInstitucion(id = null) {
  const [institucion, setInstitucion] = useState(null);
  const [instituciones, setInstituciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para formatear el nombre del director
  const formatDirectorName = useCallback((director) => {
    if (!director) return "No asignado";
    return `${director.name || ""} ${director.apellidoPaterno || ""} ${
      director.apellidoMaterno || ""
    }`.trim();
  }, []);

  // Función para obtener todas las instituciones
  const fetchInstituciones = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getInstituciones();
      if (response.success) {
        setInstituciones(response.data || []);
        
        // Si no se especificó un ID, usar la primera institución
        if (!id && response.data && response.data.length > 0) {
          setInstitucion(response.data[0]);
        }
        
        setError(null);
      } else {
        setError(response.error || "Error al obtener las instituciones");
      }
    } catch (err) {
      setError(err.message || "Error al obtener las instituciones");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Función para obtener una institución específica por ID
  const fetchInstitucionById = useCallback(async (institucionId) => {
    setLoading(true);
    try {
      const response = await getInstitucionById(institucionId);
      if (response.success) {
        setInstitucion(response.data);
        setError(null);
      } else {
        setError(response.error || "Error al obtener la institución");
      }
    } catch (err) {
      setError(err.message || "Error al obtener la institución");
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para actualizar datos de la institución
  const actualizarInstitucion = useCallback(async (institucionId, data) => {
    setLoading(true);
    try {
      const response = await updateInstitucion(institucionId, data);
      if (response.success) {
        setInstitucion(response.data);
        
        // Actualizar también en la lista de instituciones
        setInstituciones(prev => 
          prev.map(inst => inst.id === institucionId ? response.data : inst)
        );
        
        setError(null);
        return { success: true, data: response.data };
      } else {
        setError(response.error || "Error al actualizar la institución");
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMsg = err.message || "Error al actualizar la institución";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    if (id) {
      fetchInstitucionById(id);
    } else {
      fetchInstituciones();
    }
  }, [id, fetchInstitucionById, fetchInstituciones]);

  // Obtener información útil sobre la institución
  const info = {
    nombre: institucion?.nombreInstitucion || "",
    codigoModular: institucion?.codigoModular || "",
    director: institucion?.director || null,
    directorNombre: formatDirectorName(institucion?.director),
    tieneDirector: !!institucion?.director,
    cicloEscolar: institucion?.cicloEscolarActual || new Date().getFullYear(),
    niveles: institucion?.niveles || [],
    logo: institucion?.logo || null,
  };

  return {
    institucion,
    instituciones,
    loading,
    error,
    info,
    refetch: id ? () => fetchInstitucionById(id) : fetchInstituciones,
    actualizarInstitucion,
    formatDirectorName,
  };
}
