import { useEffect, useState } from "react";
import { getHijosDePadre } from "@/action/relacion-familiar/relacion-familiar";

export function useHijosDePadre(padreId) {
  const [hijos, setHijos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!padreId) {
      setHijos([]);
      return;
    }

    setLoading(true);
    setError(null);

    getHijosDePadre({ padreId, formatoLegacy: true })
      .then((data) => {
        // Asegurar que siempre sea un array
        setHijos(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error fetching hijos:", err);
        setError(err);
        setHijos([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [padreId]);

  return { hijos, loading, error };
}
