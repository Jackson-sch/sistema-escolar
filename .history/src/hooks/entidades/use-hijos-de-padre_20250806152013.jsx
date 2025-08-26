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
        console.log("useHijosDePadre: Received data:", data);

        // Manejar tanto el formato nuevo como el legacy
        let hijosArray = [];
        if (Array.isArray(data)) {
          hijosArray = data;
        } else if (data && data.success && Array.isArray(data.data)) {
          hijosArray = data.data;
        } else if (data && Array.isArray(data.hijos)) {
          hijosArray = data.hijos;
        }

        console.log("useHijosDePadre: Setting hijos:", hijosArray);
        setHijos(hijosArray);
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
