import { useEffect, useState } from "react";
import { getRelacionFamiliar } from "@/action/relacion-familiar/relacion-familiar";

export function usePadreDeEstudiante(estudianteId) {
  const [padre, setPadre] = useState(null);

  useEffect(() => {
    if (!estudianteId) return;
    getRelacionFamiliar(estudianteId).then((padre) => setPadre(padre));
  }, [estudianteId]);

  return { padre };
}
