import { useUrlState } from "./use-url-state";
import { useMemo } from "react";

/**
 * Hook específico para manejar filtros de asistencia con persistencia en URL
 */
export function useAsistenciaFilters() {
  const defaultFilters = {
    tab: "tomar", // 'tomar', 'consultar', 'reportes'
    estudiante: "",
    curso: "",
    estado: "",
    fechaInicio: "",
    fechaFin: "",
    page: 1,
    pageSize: 10,
    sortBy: "fecha",
    sortOrder: "desc",
  };

  const { urlState, updateUrlState, clearUrlState, getUrlValue } =
    useUrlState(defaultFilters);

  // Funciones específicas para cada filtro
  const setTab = (tab) => {
    updateUrlState({ tab, page: 1 }, { replace: true });
  };

  const setEstudiante = (estudiante) => {
    updateUrlState({ estudiante, page: 1 });
  };

  const setCurso = (curso) => {
    updateUrlState({ curso, page: 1 });
  };

  const setEstado = (estado) => {
    updateUrlState({ estado, page: 1 });
  };

  const setFechaInicio = (fechaInicio) => {
    updateUrlState({ fechaInicio, page: 1 });
  };

  const setFechaFin = (fechaFin) => {
    updateUrlState({ fechaFin, page: 1 });
  };

  const setPage = (page) => {
    updateUrlState({ page });
  };

  const setPageSize = (pageSize) => {
    updateUrlState({ pageSize, page: 1 });
  };

  const setSorting = (sortBy, sortOrder) => {
    updateUrlState({ sortBy, sortOrder, page: 1 });
  };

  const resetFilters = () => {
    updateUrlState(
      {
        estudiante: "",
        curso: "",
        estado: "",
        fechaInicio: "",
        fechaFin: "",
        page: 1,
      },
      { replace: true }
    );
  };

  const clearAllFilters = () => {
    clearUrlState();
  };

  // Valores computados
  const hasActiveFilters = useMemo(() => {
    return (
      urlState.estudiante ||
      urlState.curso ||
      urlState.estado ||
      urlState.fechaInicio ||
      urlState.fechaFin
    );
  }, [urlState]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (urlState.estudiante) count++;
    if (urlState.curso) count++;
    if (urlState.estado) count++;
    if (urlState.fechaInicio) count++;
    if (urlState.fechaFin) count++;
    return count;
  }, [urlState]);

  return {
    // Estado actual
    filters: urlState,

    // Getters específicos
    currentTab: getUrlValue("tab", "tomar"),
    currentEstudiante: getUrlValue("estudiante", ""),
    currentCurso: getUrlValue("curso", ""),
    currentEstado: getUrlValue("estado", ""),
    currentFechaInicio: getUrlValue("fechaInicio", ""),
    currentFechaFin: getUrlValue("fechaFin", ""),
    currentPage: getUrlValue("page", 1),
    currentPageSize: getUrlValue("pageSize", 10),
    currentSortBy: getUrlValue("sortBy", "fecha"),
    currentSortOrder: getUrlValue("sortOrder", "desc"),

    // Setters específicos
    setTab,
    setEstudiante,
    setCurso,
    setEstado,
    setFechaInicio,
    setFechaFin,
    setPage,
    setPageSize,
    setSorting,

    // Utilidades
    resetFilters,
    clearAllFilters,
    hasActiveFilters,
    activeFiltersCount,
  };
}
