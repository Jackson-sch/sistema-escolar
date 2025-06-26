import { useEffect, useState } from "react";
import { getPadres } from "@/action/padre/padre";

export function usePadre() {
  const [padres, setPadres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPadres() {
      setLoading(true);
      setError(null);
      try {
        const data = await getPadres();
        setPadres(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPadres();
  }, []);

  return { padres, loading, error };
}
