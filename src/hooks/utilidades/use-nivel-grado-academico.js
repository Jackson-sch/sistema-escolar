import { formatearGrado, formatearNivel } from "@/components/formatearGrados";

export function useNivelGradoAcademico(nivelAcademico) {
  if (!nivelAcademico) {
    return { nivel: "-", grado: "-" };
  }
  return {
    nivel: formatearNivel(nivelAcademico.nivel),
    grado: formatearGrado(nivelAcademico.grado),
  };
}
