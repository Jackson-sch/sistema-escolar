// Calcula los años de servicio a partir de una fecha de inicio
export function calculateYearsOfService(dateString) {
  const startDate = new Date(dateString);
  const today = new Date();
  const diffTime = Math.abs(today - startDate);
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  return diffYears < 1
    ? `${Math.round(diffYears * 12)} meses`
    : `${Math.floor(diffYears)} años${
        diffYears % 1 > 0.08
          ? ` y ${Math.round((diffYears % 1) * 12)} meses`
          : ""
      }`;
}
