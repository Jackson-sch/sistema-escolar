import { useEffect, useState } from "react";
import { getNivelAcademico } from "@/action/nivel-academico/nivel-academico";

export default function useNivelAcademico(nivelAcademicoId) {
  const [nivelAcademico, setNivelAcademico] = useState(null);

  useEffect(() => {
    if (!nivelAcademicoId) return;
    getNivelAcademico(nivelAcademicoId).then((nivelAcademico) =>
      setNivelAcademico(nivelAcademico)
    );
  }, [nivelAcademicoId]);
  return { nivelAcademico };
}
