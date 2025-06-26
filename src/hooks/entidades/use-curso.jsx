import { useEffect, useState } from "react";
import { getCursos } from "@/action/cursos/curso";

export function useCurso() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCursos() {
      setLoading(true);
      setError(null);
      try {
        const data = await getCursos();
        setCursos(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCursos();
  }, []);

  return { cursos, loading, error };
}
