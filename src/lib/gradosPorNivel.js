// /lib/constantes/nivelesAcademicos.js

export const niveles = ["INICIAL", "PRIMARIA", "SECUNDARIA"];

export const gradosPorNivel = {
  INICIAL: [
    { label: "3 años", value: "INICIAL_3_ANIOS" },
    { label: "4 años", value: "INICIAL_4_ANIOS" },
    { label: "5 años", value: "INICIAL_5_ANIOS" },
  ],
  PRIMARIA: [
    { label: "Primero", value: "PRIMARIA_PRIMERO" },
    { label: "Segundo", value: "PRIMARIA_SEGUNDO" },
    { label: "Tercero", value: "PRIMARIA_TERCERO" },
    { label: "Cuarto", value: "PRIMARIA_CUARTO" },
    { label: "Quinto", value: "PRIMARIA_QUINTO" },
    { label: "Sexto", value: "PRIMARIA_SEXTO" },
  ],
  SECUNDARIA: [
    { label: "Primero", value: "SECUNDARIA_PRIMERO" },
    { label: "Segundo", value: "SECUNDARIA_SEGUNDO" },
    { label: "Tercero", value: "SECUNDARIA_TERCERO" },
    { label: "Cuarto", value: "SECUNDARIA_CUARTO" },
    { label: "Quinto", value: "SECUNDARIA_QUINTO" },
  ],
};

// Versión simplificada (solo valores) para la validación
export const gradosValoresPorNivel = {
  INICIAL: gradosPorNivel.INICIAL.map(item => item.value),
  PRIMARIA: gradosPorNivel.PRIMARIA.map(item => item.value),
  SECUNDARIA: gradosPorNivel.SECUNDARIA.map(item => item.value),
};