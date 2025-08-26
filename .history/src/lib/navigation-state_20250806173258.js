/**
 * Utilidades para manejar estado de navegación
 * Permite preservar estado entre páginas y recargas
 */

// Clave para localStorage
const NAVIGATION_STATE_KEY = "navigation_state";

/**
 * Guarda el estado de navegación en localStorage
 */
export function saveNavigationState(route, state) {
  try {
    const existingState = getNavigationState();
    const newState = {
      ...existingState,
      [route]: {
        ...state,
        timestamp: Date.now(),
      },
    };

    localStorage.setItem(NAVIGATION_STATE_KEY, JSON.stringify(newState));
  } catch (error) {
    console.warn("Error saving navigation state:", error);
  }
}

/**
 * Obtiene el estado de navegación desde localStorage
 */
export function getNavigationState(route = null) {
  try {
    const state = localStorage.getItem(NAVIGATION_STATE_KEY);
    if (!state) return route ? {} : {};

    const parsedState = JSON.parse(state);

    // Limpiar estados antiguos (más de 24 horas)
    const now = Date.now();
    const cleanedState = Object.entries(parsedState).reduce(
      (acc, [key, value]) => {
        if (now - value.timestamp < 24 * 60 * 60 * 1000) {
          // 24 horas
          acc[key] = value;
        }
        return acc;
      },
      {}
    );

    // Guardar estado limpio
    if (Object.keys(cleanedState).length !== Object.keys(parsedState).length) {
      localStorage.setItem(NAVIGATION_STATE_KEY, JSON.stringify(cleanedState));
    }

    return route ? cleanedState[route] || {} : cleanedState;
  } catch (error) {
    console.warn("Error getting navigation state:", error);
    return route ? {} : {};
  }
}

/**
 * Limpia el estado de navegación
 */
export function clearNavigationState(route = null) {
  try {
    if (route) {
      const state = getNavigationState();
      delete state[route];
      localStorage.setItem(NAVIGATION_STATE_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(NAVIGATION_STATE_KEY);
    }
  } catch (error) {
    console.warn("Error clearing navigation state:", error);
  }
}

/**
 * Hook para usar con React
 */
export function useNavigationState(route) {
  const [state, setState] = useState(() => getNavigationState(route));

  const updateState = useCallback(
    (newState) => {
      setState(newState);
      saveNavigationState(route, newState);
    },
    [route]
  );

  const clearState = useCallback(() => {
    setState({});
    clearNavigationState(route);
  }, [route]);

  return [state, updateState, clearState];
}
