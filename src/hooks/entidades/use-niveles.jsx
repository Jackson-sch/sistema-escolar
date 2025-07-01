import { useEffect, useState } from "react";
import { getNiveles } from "@/action/config/niveles-grados-action";

export function useNiveles() {
  const [nivelesData, setNivelesData] = useState([]);
  const [loading2, setLoading2] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchNiveles() {
      setLoading2(true);
      setError(null);
      try {
        const data = await getNiveles();
        setNivelesData(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading2(false);
      }
    }
    fetchNiveles();
  }, []);

  return { nivelesData, loading2, error };
}
