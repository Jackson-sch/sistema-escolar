import { useEffect, useState } from "react";
import { getStudents } from "@/action/estudiante/estudiante";

export function useEstudiante() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEstudiantes() {
      setLoading(true);
      setError(null);
      try {
        const data = await getStudents();
        setEstudiantes(data.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchEstudiantes();
  }, []);

  return { estudiantes, loading, error };
}
