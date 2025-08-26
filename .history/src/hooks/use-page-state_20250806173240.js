import { useUrlState } from "./use-url-state";
import { useCallback } from "react";

/**
 * Hook genérico para manejar estado de página con persistencia en URL
 * Útil para tabs, filtros, paginación, etc.
 */
export function usePageState(config = {}) {
  const {
    defaultTab = null,
    defaultFilters = {},
    defaultPagination = { page: 1, pageSize: 10 },
    defaultSorting = { sortBy: "id", sortOrder: "asc" },
  } = config;

  const defaultValues = {
    ...(defaultTab && { tab: defaultTab }),
    ...defaultFilters,
    ...defaultPagination,
    ...defaultSorting,
  };

  const { urlState, updateUrlState, clearUrlState, getUrlValue } =
    useUrlState(defaultValues);

  // Funciones para tabs
  const setActiveTab = useCallback(
    (tab) => {
      updateUrlState({ tab }, { replace: true });
    },
    [updateUrlState]
  );

  // Funciones para filtros
  const setFilter = useCallback(
    (key, value) => {
      updateUrlState({ [key]: value, page: 1 });
    },
    [updateUrlState]
  );

  const setFilters = useCallback(
    (filters) => {
      updateUrlState({ ...filters, page: 1 });
    },
    [updateUrlState]
  );

  const clearFilters = useCallback(() => {
    const filtersToRemove = Object.keys(defaultFilters).reduce((acc, key) => {
      acc[key] = "";
      return acc;
    }, {});
    updateUrlState({ ...filtersToRemove, page: 1 }, { replace: true });
  }, [updateUrlState, defaultFilters]);

  // Funciones para paginación
  const setPage = useCallback(
    (page) => {
      updateUrlState({ page });
    },
    [updateUrlState]
  );

  const setPageSize = useCallback(
    (pageSize) => {
      updateUrlState({ pageSize, page: 1 });
    },
    [updateUrlState]
  );

  // Funciones para ordenamiento
  const setSorting = useCallback(
    (sortBy, sortOrder = "asc") => {
      updateUrlState({ sortBy, sortOrder });
    },
    [updateUrlState]
  );

  // Función para resetear todo
  const resetPageState = useCallback(() => {
    clearUrlState();
  }, [clearUrlState]);

  // Getters con valores por defecto
  const getTab = useCallback(
    () => getUrlValue("tab", defaultTab),
    [getUrlValue, defaultTab]
  );
  const getPage = useCallback(
    () => getUrlValue("page", defaultPagination.page),
    [getUrlValue, defaultPagination.page]
  );
  const getPageSize = useCallback(
    () => getUrlValue("pageSize", defaultPagination.pageSize),
    [getUrlValue, defaultPagination.pageSize]
  );
  const getSortBy = useCallback(
    () => getUrlValue("sortBy", defaultSorting.sortBy),
    [getUrlValue, defaultSorting.sortBy]
  );
  const getSortOrder = useCallback(
    () => getUrlValue("sortOrder", defaultSorting.sortOrder),
    [getUrlValue, defaultSorting.sortOrder]
  );

  return {
    // Estado completo
    state: urlState,

    // Tabs
    activeTab: getTab(),
    setActiveTab,

    // Filtros
    filters: Object.keys(defaultFilters).reduce((acc, key) => {
      acc[key] = getUrlValue(key, defaultFilters[key]);
      return acc;
    }, {}),
    setFilter,
    setFilters,
    clearFilters,

    // Paginación
    pagination: {
      page: getPage(),
      pageSize: getPageSize(),
    },
    setPage,
    setPageSize,

    // Ordenamiento
    sorting: {
      sortBy: getSortBy(),
      sortOrder: getSortOrder(),
    },
    setSorting,

    // Utilidades
    resetPageState,
    updateState: updateUrlState,
    getValue: getUrlValue,
  };
}

/**
 * Ejemplo de uso:
 *
 * const pageState = usePageState({
 *   defaultTab: 'consultar',
 *   defaultFilters: {
 *     estudiante: '',
 *     curso: '',
 *     estado: ''
 *   },
 *   defaultPagination: { page: 1, pageSize: 20 },
 *   defaultSorting: { sortBy: 'fecha', sortOrder: 'desc' }
 * });
 *
 * // Usar en el componente:
 * <Tabs value={pageState.activeTab} onValueChange={pageState.setActiveTab}>
 *   ...
 * </Tabs>
 */
