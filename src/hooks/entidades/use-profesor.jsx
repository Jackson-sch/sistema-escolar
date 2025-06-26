import { useEffect, useState } from "react";
import { getProfesores, getProfesoresActivos } from "@/action/profesor/profesor";

export function useProfesores() {
  const [profesores, setProfesores] = useState([]);

  useEffect(() => {
    getProfesores().then((profesores) => setProfesores(profesores));
  }, []);

  return { profesores, setProfesores };
}

export function useProfesoresActivos() {
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfesores = async () => {
      try {
        setLoading(true);
        const data = await getProfesoresActivos();
        setProfesores(data || []);
        setError(null);
      } catch (err) {
        console.error('Error al cargar profesores:', err);
        setProfesores([]);
        setError(err.message || 'Error al obtener profesores');
      } finally {
        setLoading(false);
      }
    };

    loadProfesores();
  }, []);

  return { profesores, setProfesores, loading, error };
}
