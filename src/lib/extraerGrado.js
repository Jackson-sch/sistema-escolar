export function extraerGrado(gradoCompleto) {
  if (!gradoCompleto) return "";
  const partes = gradoCompleto.split("_");
  return partes.length > 1 ? partes[1] : gradoCompleto;
}
