// Funciones de utilidad para formatear los datos
const formatearNivel = (nivel) => {
  const niveles = {
    INICIAL: "Inicial",
    PRIMARIA: "Primaria",
    SECUNDARIA: "Secundaria",
  };
  return niveles[nivel] || nivel;
};

const formatearGrado = (grado) => {
  if (!grado) return "";
  const partes = grado.split("_");
  if (partes[0] === "INICIAL") {
    return `${partes[1]} años`;
  }
  const grados = {
    PRIMERO: "1° Grado",
    SEGUNDO: "2° Grado",
    TERCERO: "3° Grado",
    CUARTO: "4° Grado",
    QUINTO: "5° Grado", 
    SEXTO: "6° Grado",
  };
  return grados[partes[1]] || partes[1];
};

// Función para convertir grados a números
const gradoToNumber = (grado) => {
  const grados = {
    PRIMERO: 1,
    SEGUNDO: 2,
    TERCERO: 3,
    CUARTO: 4,
    QUINTO: 5,
    SEXTO: 6,
  };
  return grados[grado] || 0; // Devuelve 0 si el grado no está definido
};

// Exportar funciones de utilidad
export { formatearNivel, formatearGrado, gradoToNumber };
