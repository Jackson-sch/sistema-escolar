import { useEffect, useState } from "react";
import { getHijosDePadre } from "@/action/relacion-familiar/relacion-familiar";

export function useHijosDePadre(padreId) {
  const [hijos, setHijos] = useState([]);
  useEffect(() => {
    if (!padreId) return;
    getHijosDePadre(padreId).then(setHijos);
  }, [padreId]);
  return hijos;
}
