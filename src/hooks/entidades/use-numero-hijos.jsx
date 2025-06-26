import { useEffect, useState } from "react";
import { getNumeroHijos } from "@/action/relacion-familiar/relacion-familiar";

export function useNumeroHijos(padreId) {
  const [numHijos, setNumHijos] = useState(0);
  useEffect(() => {
    if (!padreId) return;
    getNumeroHijos(padreId).then(setNumHijos);
  }, [padreId]);
  return numHijos;
}

// En la tabla de padres, usa el hook useNumeroHijos(padre.id) para mostrar el número de hijos/estudiantes.
// Ejemplo:
// <td>{useNumeroHijos(padre.id)}</td>
