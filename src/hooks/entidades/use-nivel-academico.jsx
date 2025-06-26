import { useEffect, useState } from "react";
import { getNivelesAcademicos } from "@/action/niveles/nivelAcademico";

export function useNivelAcademico() {
  const [nivelesAcademicos, setNivelesAcademicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchNiveles() {
      setLoading(true);
      setError(null);
      try {
        const data = await getNivelesAcademicos();
        setNivelesAcademicos(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchNiveles();
  }, []);

  return { nivelesAcademicos, loading, error };
}
