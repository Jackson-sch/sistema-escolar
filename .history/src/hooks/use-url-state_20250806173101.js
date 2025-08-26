import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * Hook personalizado para manejar estado en la URL
 * Permite sincronizar el estado del componente con los query parameters
 */
export function useUrlState(defaultValues = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Obtener el estado actual de la URL
  const urlState = useMemo(() => {
    const state = { ...defaultValues };

    // Leer todos los parámetros de la URL
    searchParams.forEach((value, key) => {
      // Intentar parsear valores JSON si es posible
      try {
        state[key] = JSON.parse(decodeURIComponent(value));
      } catch {
        // Si no es JSON válido, usar como string
        state[key] = decodeURIComponent(value);
      }
    });

    return state;
  }, [searchParams, defaultValues]);

  // Función para actualizar el estado en la URL
  const updateUrlState = useCallback(
    (updates, options = {}) => {
      const { replace = false, shallow = true } = options;

      // Crear nuevos parámetros combinando el estado actual con las actualizaciones
      const newParams = new URLSearchParams();

      // Mantener parámetros existentes
      searchParams.forEach((value, key) => {
        if (!(key in updates)) {
          newParams.set(key, value);
        }
      });

      // Agregar/actualizar nuevos parámetros
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          // Remover parámetro si el valor es null/undefined/empty
          newParams.delete(key);
        } else {
          // Codificar el valor (JSON si es objeto/array, string si es primitivo)
          const encodedValue =
            typeof value === "object"
              ? encodeURIComponent(JSON.stringify(value))
              : encodeURIComponent(String(value));
          newParams.set(key, encodedValue);
        }
      });

      // Construir la nueva URL
      const newUrl = `${window.location.pathname}${
        newParams.toString() ? `?${newParams.toString()}` : ""
      }`;

      // Navegar a la nueva URL
      if (replace) {
        router.replace(newUrl, { shallow });
      } else {
        router.push(newUrl, { shallow });
      }
    },
    [router, searchParams]
  );

  // Función para limpiar todos los parámetros
  const clearUrlState = useCallback(() => {
    router.replace(window.location.pathname, { shallow: true });
  }, [router]);

  // Función para obtener un valor específico
  const getUrlValue = useCallback(
    (key, defaultValue = null) => {
      return urlState[key] ?? defaultValue;
    },
    [urlState]
  );

  return {
    urlState,
    updateUrlState,
    clearUrlState,
    getUrlValue,
  };
}
