export async function getAsignaturas() {
  const response = await fetch("/api/asignatura");
  const asignaturas = await response.json();
  return asignaturas;
}
